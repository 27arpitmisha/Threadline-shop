import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { api } from "../lib/api";
import { productCover, productImageList } from "../lib/productImages";
import { useAuth } from "./AuthContext";

const CartContext = createContext(null);
const GUEST_KEY = "threadline_guest_cart";

function readGuest() {
  try {
    const raw = localStorage.getItem(GUEST_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeGuest(items) {
  localStorage.setItem(GUEST_KEY, JSON.stringify(items));
}

export function CartProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const [serverCart, setServerCart] = useState(null);
  const [guestItems, setGuestItems] = useState(readGuest);
  const [loading, setLoading] = useState(false);

  const refreshServerCart = useCallback(async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    try {
      const { data } = await api.get("/cart");
      setServerCart(data);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      refreshServerCart();
    } else {
      setServerCart(null);
    }
  }, [isAuthenticated, refreshServerCart]);

  useEffect(() => {
    if (!isAuthenticated) return;
    const guest = readGuest();
    if (!guest.length) return;
    const snapshot = guest.map((x) => ({ ...x }));
    localStorage.removeItem(GUEST_KEY);
    setGuestItems([]);
    (async () => {
      for (const line of snapshot) {
        try {
          await api.post("/cart/items", {
            productId: line.productId,
            quantity: line.quantity,
            size: line.size,
            color: line.color || "",
          });
        } catch {
          /* skip failed lines */
        }
      }
      try {
        const { data } = await api.get("/cart");
        setServerCart(data);
      } catch {
        /* */
      }
    })();
  }, [isAuthenticated]);

  const addItem = useCallback(
    async (product, quantity, size, color) => {
      const colorVal = color || "";
      if (isAuthenticated) {
        await api.post("/cart/items", {
          productId: product._id,
          quantity,
          size,
          color: colorVal,
        });
        await refreshServerCart();
        return;
      }
      const items = readGuest();
      const idx = items.findIndex(
        (i) =>
          i.productId === product._id && i.size === size && (i.color || "") === colorVal
      );
      if (idx >= 0) items[idx].quantity += quantity;
      else {
        items.push({
          productId: product._id,
          quantity,
          size,
          color: colorVal,
          snapshot: {
            name: product.name,
            price: product.price,
            image: productCover(product),
            images: productImageList(product),
            slug: product.slug,
          },
        });
      }
      writeGuest(items);
      setGuestItems([...items]);
    },
    [isAuthenticated, refreshServerCart]
  );

  const updateQuantity = useCallback(
    async (lineId, quantity) => {
      if (isAuthenticated) {
        await api.patch(`/cart/items/${lineId}`, { quantity });
        await refreshServerCart();
        return;
      }
      const items = readGuest();
      const idx = Number(String(lineId).replace("guest-", ""));
      if (!Number.isNaN(idx) && items[idx]) {
        items[idx].quantity = quantity;
        writeGuest(items);
        setGuestItems([...items]);
      }
    },
    [isAuthenticated, refreshServerCart]
  );

  const removeItem = useCallback(
    async (lineId) => {
      if (isAuthenticated) {
        await api.delete(`/cart/items/${lineId}`);
        await refreshServerCart();
        return;
      }
      const idx = Number(String(lineId).replace("guest-", ""));
      if (!Number.isNaN(idx)) {
        const items = readGuest();
        items.splice(idx, 1);
        writeGuest(items);
        setGuestItems([...items]);
      }
    },
    [isAuthenticated, refreshServerCart]
  );

  const lines = useMemo(() => {
    if (isAuthenticated && serverCart?.items) {
      return serverCart.items.map((item) => ({
        id: item._id,
        product: item.product,
        quantity: item.quantity,
        size: item.size,
        color: item.color,
      }));
    }
    return guestItems.map((item, idx) => ({
      id: `guest-${idx}`,
      product: {
        _id: item.productId,
        name: item.snapshot?.name,
        price: item.snapshot?.price,
        image: item.snapshot?.image,
        images: item.snapshot?.images,
        slug: item.snapshot?.slug,
      },
      quantity: item.quantity,
      size: item.size,
      color: item.color,
    }));
  }, [isAuthenticated, serverCart, guestItems]);

  const subtotal = useMemo(() => {
    return lines.reduce((sum, line) => {
      const price = line.product?.price ?? 0;
      return sum + price * line.quantity;
    }, 0);
  }, [lines]);

  const count = useMemo(() => lines.reduce((n, line) => n + line.quantity, 0), [lines]);

  const value = useMemo(
    () => ({
      lines,
      subtotal,
      count,
      loading,
      addItem,
      updateQuantity,
      removeItem,
      refreshCart: refreshServerCart,
    }),
    [lines, subtotal, count, loading, addItem, updateQuantity, removeItem, refreshServerCart]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}

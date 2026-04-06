import { Router } from "express";
import mongoose from "mongoose";
import { Cart } from "../models/Cart.js";
import { Product } from "../models/Product.js";
import { authRequired } from "../middleware/auth.js";

const router = Router();

router.use(authRequired);

async function getOrCreateCart(userId) {
  let cart = await Cart.findOne({ user: userId }).populate("items.product");
  if (!cart) {
    cart = await Cart.create({ user: userId, items: [] });
    cart = await Cart.findById(cart._id).populate("items.product");
  }
  return cart;
}

router.get("/", async (req, res) => {
  try {
    const cart = await getOrCreateCart(req.userId);
    res.json(cart);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

router.post("/items", async (req, res) => {
  try {
    const { productId, quantity = 1, size = "M", color = "" } = req.body;
    if (!productId || !mongoose.isValidObjectId(productId)) {
      return res.status(400).json({ message: "Valid productId required" });
    }
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: "Product not found" });
    const cart = await getOrCreateCart(req.userId);
    const q = Math.max(1, Number(quantity) || 1);
    const pid = String(productId);
    const idx = cart.items.findIndex((i) => {
      const id = i.product?._id ? String(i.product._id) : String(i.product);
      return id === pid && i.size === size && (i.color || "") === (color || "");
    });
    if (idx >= 0) cart.items[idx].quantity += q;
    else cart.items.push({ product: productId, quantity: q, size, color });
    await cart.save();
    const populated = await Cart.findById(cart._id).populate("items.product");
    res.json(populated);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

router.patch("/items/:itemId", async (req, res) => {
  try {
    const { quantity } = req.body;
    const cart = await getOrCreateCart(req.userId);
    const item = cart.items.id(req.params.itemId);
    if (!item) return res.status(404).json({ message: "Cart item not found" });
    const q = Number(quantity);
    if (Number.isNaN(q) || q < 1) {
      return res.status(400).json({ message: "Quantity must be at least 1" });
    }
    item.quantity = q;
    await cart.save();
    const populated = await Cart.findById(cart._id).populate("items.product");
    res.json(populated);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

router.delete("/items/:itemId", async (req, res) => {
  try {
    const cart = await getOrCreateCart(req.userId);
    const item = cart.items.id(req.params.itemId);
    if (!item) return res.status(404).json({ message: "Cart item not found" });
    item.deleteOne();
    await cart.save();
    const populated = await Cart.findById(cart._id).populate("items.product");
    res.json(populated);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

router.delete("/", async (req, res) => {
  try {
    await Cart.findOneAndUpdate({ user: req.userId }, { items: [] });
    const cart = await getOrCreateCart(req.userId);
    res.json(cart);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

export default router;

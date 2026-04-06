import { Router } from "express";
import { Order } from "../models/Order.js";
import { Cart } from "../models/Cart.js";
import { Product } from "../models/Product.js";
import { authRequired } from "../middleware/auth.js";
import { FREE_SHIPPING_MIN_INR, SHIPPING_FLAT_INR } from "../config/money.js";

const router = Router();

router.use(authRequired);

router.post("/checkout", async (req, res) => {
  try {
    const { shippingAddress } = req.body;
    if (!shippingAddress?.fullName || !shippingAddress?.line1 || !shippingAddress?.city) {
      return res.status(400).json({ message: "Shipping address (name, line1, city) required" });
    }
    const cart = await Cart.findOne({ user: req.userId }).populate("items.product");
    if (!cart?.items?.length) {
      return res.status(400).json({ message: "Cart is empty" });
    }
    let subtotal = 0;
    const orderItems = [];
    for (const line of cart.items) {
      const p = line.product;
      if (!p) continue;
      const lineTotal = p.price * line.quantity;
      subtotal += lineTotal;
      orderItems.push({
        product: p._id,
        name: p.name,
        price: p.price,
        quantity: line.quantity,
        size: line.size,
        color: line.color,
        image:
          Array.isArray(p.images) && p.images.length
            ? p.images[0]
            : p.image || "",
      });
    }
    if (!orderItems.length) {
      return res.status(400).json({ message: "No valid items in cart" });
    }
    const shipping = subtotal >= FREE_SHIPPING_MIN_INR ? 0 : SHIPPING_FLAT_INR;
    const total = Math.round((subtotal + shipping) * 100) / 100;
    const order = await Order.create({
      user: req.userId,
      items: orderItems,
      subtotal: Math.round(subtotal * 100) / 100,
      shipping,
      total,
      shippingAddress,
      status: "paid",
    });
    cart.items = [];
    await cart.save();
    for (const line of orderItems) {
      await Product.updateOne({ _id: line.product }, { $inc: { stock: -line.quantity } });
    }
    res.status(201).json(order);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

router.get("/mine", async (req, res) => {
  try {
    const orders = await Order.find({ user: req.userId })
      .sort({ createdAt: -1 })
      .populate("items.product");
    res.json(orders);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

export default router;

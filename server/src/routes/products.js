import { Router } from "express";
import { Product } from "../models/Product.js";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const { category, search, featured } = req.query;
    const filter = {};
    if (category) filter.category = category;
    if (featured === "true") filter.featured = true;
    if (search) {
      filter.$or = [
        { name: new RegExp(search, "i") },
        { description: new RegExp(search, "i") },
      ];
    }
    const products = await Product.find(filter).sort({ createdAt: -1 });
    res.json(products);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

router.get("/:slug", async (req, res) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug });
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

export default router;

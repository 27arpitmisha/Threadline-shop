import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    description: { type: String, default: "" },
    price: { type: Number, required: true, min: 0 },
    image: { type: String, default: "" },
    images: { type: [String], default: [] },
    category: { type: String, default: "tees" },
    sizes: [{ type: String }],
    colors: [{ type: String }],
    featured: { type: Boolean, default: false },
    stock: { type: Number, default: 100 },
  },
  { timestamps: true }
);

export const Product = mongoose.model("Product", productSchema);

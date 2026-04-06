import "dotenv/config.js";
import mongoose from "mongoose";
import { connectDB } from "./config/db.js";
import { Product } from "./models/Product.js";

const samples = [
  {
    name: "Midnight Ink Tee",
    slug: "midnight-ink-tee",
    description: "Ultra-soft organic cotton. Deep black with a subtle tonal logo.",
    price: 2799,
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&q=80",
    images: [
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&q=80",
      "https://images.unsplash.com/photo-1562157873-818bc0726f68?w=600&q=80",
    ],
    category: "graphic",
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    colors: ["Black", "Charcoal"],
    featured: true,
  },
  {
    name: "Sunset Gradient",
    slug: "sunset-gradient",
    description: "Limited drop. Warm gradient print on premium heavyweight tee.",
    price: 3299,
    image: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=600&q=80",
    images: [
      "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=600&q=80",
      "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=600&q=80",
    ],
    category: "graphic",
    sizes: ["S", "M", "L", "XL"],
    colors: ["Cream", "Sand"],
    featured: true,
  },
  {
    name: "Studio Blank — White",
    slug: "studio-blank-white",
    description: "The perfect base layer. 220gsm, reinforced collar.",
    price: 1999,
    image: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=600&q=80",
    category: "basics",
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    colors: ["White", "Off-white"],
    featured: false,
  },
  {
    name: "Coastal Stripe",
    slug: "coastal-stripe",
    description: "Breathable jersey stripe. Relaxed fit, weekend ready.",
    price: 3199,
    image: "https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=600&q=80",
    category: "stripes",
    sizes: ["S", "M", "L", "XL"],
    colors: ["Navy / White", "Sage / Cream"],
    featured: true,
  },
  {
    name: "Monolith Logo",
    slug: "monolith-logo",
    description: "Minimal chest hit. Puff print on garment-dyed cotton.",
    price: 2999,
    image: "https://images.unsplash.com/photo-1618354691373-d851c35c28a6?w=600&q=80",
    category: "graphic",
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: ["Forest", "Black", "Stone"],
    featured: false,
  },
  {
    name: "Essential Pocket Tee",
    slug: "essential-pocket-tee",
    description: "Daily driver with a clean pocket detail. Pre-shrunk.",
    price: 2499,
    image: "https://images.unsplash.com/photo-1622445275576-7212afc75dcd?w=600&q=80",
    category: "basics",
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: ["Heather Grey", "Black", "Olive"],
    featured: false,
  },
];

async function seed() {
  await connectDB();
  await Product.deleteMany({});
  await Product.insertMany(samples);
  console.log(`Seeded ${samples.length} products`);
  await mongoose.disconnect();
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});

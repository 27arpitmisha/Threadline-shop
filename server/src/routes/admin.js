import { Router } from "express";
import fs from "fs/promises";
import path from "path";
import multer from "multer";
import { Product } from "../models/Product.js";
import { adminRequired } from "../middleware/auth.js";
import {
  cloudinaryConfigured,
  destroyImageByUrl,
  uploadImageBuffer,
  isCloudinaryUrl,
} from "../lib/cloudinaryMedia.js";

const useCloudinary = cloudinaryConfigured();

const uploadDir = path.join(process.cwd(), "uploads", "products");
if (!useCloudinary) {
  await fs.mkdir(uploadDir, { recursive: true });
}

const diskStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname) || ".jpg";
    cb(null, `${Date.now()}-${Math.random().toString(36).slice(2, 10)}${ext}`);
  },
});

const fileFilter = (_req, file, cb) => {
  if (/^image\/(jpeg|png|webp|gif)$/i.test(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only JPEG, PNG, WebP, or GIF images are allowed"));
  }
};

const upload = multer({
  storage: useCloudinary ? multer.memoryStorage() : diskStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter,
});

const router = Router();
router.use(adminRequired);

function slugify(name) {
  const s = String(name || "")
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return s || "product";
}

async function uniqueSlug(base) {
  let slug = base;
  let n = 0;
  while (await Product.exists({ slug })) {
    n += 1;
    slug = `${base}-${n}`;
  }
  return slug;
}

function parseList(val) {
  if (val == null || val === "") return [];
  if (Array.isArray(val)) return val.map(String).map((s) => s.trim()).filter(Boolean);
  return String(val)
    .split(/[,|]/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function localImagePath(imageUrl) {
  if (!imageUrl || !imageUrl.startsWith("/uploads/products/")) return null;
  const rel = imageUrl.replace(/^\/uploads\//, "");
  return path.join(process.cwd(), "uploads", rel);
}

async function removeLocalImage(imageUrl) {
  const fp = localImagePath(imageUrl);
  if (!fp) return;
  try {
    await fs.unlink(fp);
  } catch {
    /* ignore */
  }
}

async function removeStoredImage(url) {
  if (isCloudinaryUrl(url)) {
    await destroyImageByUrl(url);
    return;
  }
  await removeLocalImage(url);
}

function pathsFromDiskFiles(files) {
  if (!files?.length) return [];
  return files.map((f) => `/uploads/products/${f.filename}`);
}

async function urlsFromUploadedFiles(files) {
  if (!files?.length) return [];
  if (useCloudinary) {
    const out = [];
    for (const f of files) {
      if (!f.buffer?.length) continue;
      const url = await uploadImageBuffer(f.buffer, f.originalname);
      out.push(url);
    }
    return out;
  }
  return pathsFromDiskFiles(files);
}

/** External URLs from imageUrls (JSON array or newline/comma list) and legacy imageUrl. */
function parseExternalImageUrls(body) {
  const out = [];
  const raw = body.imageUrls;
  if (raw != null && String(raw).trim()) {
    const s = String(raw).trim();
    try {
      const j = JSON.parse(s);
      if (Array.isArray(j)) {
        out.push(...j.map(String).map((x) => x.trim()).filter(Boolean));
      } else {
        s.split(/[\n,]+/)
          .map((x) => x.trim())
          .filter(Boolean)
          .forEach((u) => out.push(u));
      }
    } catch {
      s.split(/[\n,]+/)
        .map((x) => x.trim())
        .filter(Boolean)
        .forEach((u) => out.push(u));
    }
  }
  if (body.imageUrl?.trim()) {
    out.push(body.imageUrl.trim());
  }
  return [...new Set(out)];
}

function dedupeImages(urls) {
  const seen = new Set();
  const out = [];
  for (const u of urls) {
    if (!u || seen.has(u)) continue;
    seen.add(u);
    out.push(u);
  }
  return out;
}

function existingGallery(product) {
  const imgs = Array.isArray(product.images) ? product.images.filter(Boolean) : [];
  if (imgs.length) return imgs;
  if (product.image) return [product.image];
  return [];
}

function runUploadArray(req, res, next) {
  upload.array("images", 15)(req, res, (err) => {
    if (err) {
      return res.status(400).json({ message: err.message || "Upload failed" });
    }
    next();
  });
}

router.get("/products", async (_req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

router.post("/products", runUploadArray, async (req, res) => {
  try {
    const { name, description, price, category, featured, stock, slug: slugInput } = req.body;
    if (!name?.trim()) {
      return res.status(400).json({ message: "Name is required" });
    }
    const priceNum = Number(price);
    if (Number.isNaN(priceNum) || priceNum < 0) {
      return res.status(400).json({ message: "Valid price is required" });
    }
    let uploads;
    try {
      uploads = await urlsFromUploadedFiles(req.files);
    } catch (upErr) {
      return res.status(502).json({
        message: upErr.message || "Image upload to storage failed. Check Cloudinary configuration.",
      });
    }
    const external = parseExternalImageUrls(req.body);
    const images = dedupeImages([...uploads, ...external]);
    if (!images.length) {
      return res.status(400).json({ message: "Add at least one image (upload files and/or image URLs)" });
    }
    const base = slugify(slugInput || name);
    const slug = await uniqueSlug(base);
    const product = await Product.create({
      name: name.trim(),
      slug,
      description: String(description || "").trim(),
      price: priceNum,
      image: images[0],
      images,
      category: String(category || "tees").trim() || "tees",
      sizes: parseList(req.body.sizes),
      colors: parseList(req.body.colors),
      featured: featured === "true" || featured === true,
      stock: Math.max(0, Number(stock) || 0),
    });
    res.status(201).json(product);
  } catch (e) {
    res.status(500).json({ message: e.message || "Could not create product" });
  }
});

router.patch("/products/:id", runUploadArray, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    const { name, description, price, category, featured, stock, slug: slugInput } = req.body;
    if (name != null) product.name = String(name).trim();
    if (description != null) product.description = String(description).trim();
    if (price != null) {
      const priceNum = Number(price);
      if (Number.isNaN(priceNum) || priceNum < 0) {
        return res.status(400).json({ message: "Invalid price" });
      }
      product.price = priceNum;
    }
    if (category != null) product.category = String(category).trim() || "tees";
    if (req.body.sizes != null) product.sizes = parseList(req.body.sizes);
    if (req.body.colors != null) product.colors = parseList(req.body.colors);
    if (featured != null) product.featured = featured === "true" || featured === true;
    if (stock != null) product.stock = Math.max(0, Number(stock) || 0);

    if (slugInput != null && String(slugInput).trim()) {
      const base = slugify(slugInput);
      if (base !== product.slug) {
        product.slug = await uniqueSlug(base);
      }
    } else if (name != null) {
      const base = slugify(product.name);
      const existing = await Product.findOne({ slug: base, _id: { $ne: product._id } });
      if (existing) {
        product.slug = await uniqueSlug(base);
      } else {
        product.slug = base;
      }
    }

    const prev = existingGallery(product);
    let keep = prev;
    if (req.body.keepImages != null && String(req.body.keepImages).trim() !== "") {
      try {
        const parsed = JSON.parse(req.body.keepImages);
        if (Array.isArray(parsed)) {
          keep = parsed.map(String).filter(Boolean);
        }
      } catch {
        /* use prev */
      }
    }

    for (const url of prev) {
      if (!keep.includes(url)) {
        await removeStoredImage(url);
      }
    }

    let newUploads;
    try {
      newUploads = await urlsFromUploadedFiles(req.files);
    } catch (upErr) {
      return res.status(502).json({
        message: upErr.message || "Image upload to storage failed. Check Cloudinary configuration.",
      });
    }
    const extraExternal = parseExternalImageUrls(req.body);
    const images = dedupeImages([...keep, ...newUploads, ...extraExternal]);

    if (!images.length) {
      return res.status(400).json({ message: "Product must keep at least one image" });
    }
    product.images = images;
    product.image = images[0];

    await product.save();
    res.json(product);
  } catch (e) {
    res.status(500).json({ message: e.message || "Could not update product" });
  }
});

router.delete("/products/:id", async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    const all = dedupeImages([
      ...(Array.isArray(product.images) ? product.images : []),
      product.image || "",
    ]);
    for (const u of all) {
      await removeStoredImage(u);
    }
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

export default router;

import "dotenv/config.js";
import fs from "fs";
import path from "path";
import express from "express";
import cors from "cors";
import { connectDB } from "./config/db.js";
import authRoutes from "./routes/auth.js";
import productRoutes from "./routes/products.js";
import cartRoutes from "./routes/cart.js";
import orderRoutes from "./routes/orders.js";
import adminRoutes from "./routes/admin.js";

const app = express();
const PORT = process.env.PORT || 5001;

const corsOrigins = (process.env.CLIENT_ORIGIN || "http://localhost:5173")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);
const allowedOrigins = corsOrigins.length ? corsOrigins : ["http://localhost:5173"];

app.use(
  cors({
    origin: allowedOrigins.length === 1 ? allowedOrigins[0] : allowedOrigins,
    credentials: true,
  })
);
app.use(express.json());
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);

function resolveClientDist() {
  if (process.env.CLIENT_DIST_PATH) {
    return path.resolve(process.env.CLIENT_DIST_PATH);
  }
  const candidates = [
    path.join(process.cwd(), "client", "dist"),
    path.join(process.cwd(), "..", "client", "dist"),
  ];
  for (const p of candidates) {
    const abs = path.resolve(p);
    if (fs.existsSync(path.join(abs, "index.html"))) return abs;
  }
  return null;
}

const clientDist = resolveClientDist();
if (process.env.NODE_ENV === "production" && clientDist) {
  app.use(express.static(clientDist, { index: false }));
  app.get("*", (req, res, next) => {
    if (req.method !== "GET") return next();
    if (req.path.startsWith("/api") || req.path.startsWith("/uploads")) return next();
    res.sendFile(path.join(clientDist, "index.html"), (err) => next(err));
  });
} else if (process.env.NODE_ENV === "production") {
  console.warn("Production mode: client dist not found (build client to client/dist).");
}

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ message: "Something went wrong" });
});

connectDB()
  .then(() => {
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server http://0.0.0.0:${PORT}`);
    });
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });

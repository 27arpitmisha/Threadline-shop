import "dotenv/config.js";
import { v2 as cloudinary } from "cloudinary";

function cloudName() {
  return process.env.CLOUDINARY_CLOUD_NAME;
}

function apiKey() {
  return process.env.CLOUDINARY_API_KEY || process.env.API_KEY;
}

function apiSecret() {
  return process.env.CLOUDINARY_API_SECRET || process.env.API_SECRET_KEY;
}

export function cloudinaryConfigured() {
  return Boolean(cloudName() && apiKey() && apiSecret());
}

if (cloudinaryConfigured()) {
  cloudinary.config({
    cloud_name: cloudName(),
    api_key: apiKey(),
    api_secret: apiSecret(),
    secure: true,
  });
}

/**
 * @param {Buffer} buffer
 * @param {string} [_originalname]
 */
export function uploadImageBuffer(buffer, _originalname) {
  return new Promise((resolve, reject) => {
    const folder = process.env.CLOUDINARY_FOLDER || "threadline/products";
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "image",
        unique_filename: true,
        overwrite: false,
      },
      (err, result) => {
        if (err) return reject(err);
        resolve(result.secure_url);
      }
    );
    stream.end(buffer);
  });
}

export function isCloudinaryUrl(url) {
  return typeof url === "string" && url.includes("res.cloudinary.com");
}

/**
 * Derive public_id from a Cloudinary delivery URL (handles optional transformation segments).
 */
export function publicIdFromDeliveryUrl(url) {
  try {
    const { pathname } = new URL(url);
    if (!pathname.includes("/upload/")) return null;
    const rest = pathname.split("/upload/")[1];
    if (!rest) return null;
    const segments = rest.split("/");
    let i = 0;
    while (i < segments.length && !/^v\d+$/i.test(segments[i])) {
      i += 1;
    }
    if (i < segments.length) i += 1;
    const pathFromId = segments.slice(i).join("/");
    if (!pathFromId) return null;
    return decodeURIComponent(pathFromId.replace(/\.[^/.]+$/, ""));
  } catch {
    return null;
  }
}

export async function destroyImageByUrl(url) {
  if (!cloudinaryConfigured() || !isCloudinaryUrl(url)) return;
  const publicId = publicIdFromDeliveryUrl(url);
  if (!publicId) return;
  try {
    await cloudinary.uploader.destroy(publicId, { resource_type: "image" });
  } catch {
    /* ignore */
  }
}

/** Console hint on startup — no secrets logged. */
export function logAdminImageStorageMode() {
  const c = cloudName();
  const k = apiKey();
  const s = apiSecret();
  if (c && k && s) {
    console.log(`Admin image uploads: Cloudinary (cloud_name=${c})`);
    return;
  }
  const missing = [];
  if (!c) missing.push("CLOUDINARY_CLOUD_NAME");
  if (!k) missing.push("CLOUDINARY_API_KEY or API_KEY");
  if (!s) missing.push("CLOUDINARY_API_SECRET or API_SECRET_KEY");
  console.log(
    `Admin image uploads: local disk only — ${missing.join(", ")} missing (set in server/.env and restart)`
  );
}

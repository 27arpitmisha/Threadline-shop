/** Resolve product image URLs for dev (relative /uploads) vs production (VITE_API_URL). */
export function assetUrl(path) {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;
  const apiEnv = import.meta.env.VITE_API_URL;
  if (apiEnv) {
    const origin = apiEnv.replace(/\/api\/?$/, "");
    const p = path.startsWith("/") ? path : `/${path}`;
    return `${origin}${p}`;
  }
  return path;
}

import { useCallback, useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { api, patchForm, postForm } from "../lib/api";
import { assetUrl } from "../lib/assetUrl";
import { formatInr } from "../lib/money";
import { productCover, productImageList } from "../lib/productImages";

const admField =
  "mt-1.5 w-full rounded-xl border border-white/10 bg-zinc-900/70 px-4 py-3 text-sm text-ink outline-none focus:border-accent/40 focus:ring-2 focus:ring-accent/25";

const emptyForm = {
  name: "",
  slug: "",
  description: "",
  price: "",
  category: "tees",
  sizes: "S, M, L, XL",
  colors: "Black, White",
  stock: "100",
  featured: false,
  extraImageUrls: "",
};

export function AdminProducts() {
  const location = useLocation();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [galleryKeep, setGalleryKeep] = useState([]);
  const [newFiles, setNewFiles] = useState([]);

  const load = useCallback(() => {
    setLoading(true);
    api
      .get("/admin/products")
      .then((res) => setProducts(res.data))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
      if (location.pathname === "/admin/upload") {
      const t = window.setTimeout(() => {
        document.getElementById("admin-upload-form")?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
      return () => window.clearTimeout(t);
    }
  }, [location.pathname]);

  function resetForm() {
    setEditingId(null);
    setForm(emptyForm);
    setGalleryKeep([]);
    setNewFiles([]);
    setError("");
  }

  function startEdit(p) {
    setEditingId(p._id);
    setForm({
      name: p.name,
      slug: p.slug,
      description: p.description || "",
      price: String(p.price),
      category: p.category || "tees",
      sizes: (p.sizes || []).join(", "),
      colors: (p.colors || []).join(", "),
      stock: String(p.stock ?? 0),
      featured: Boolean(p.featured),
      extraImageUrls: "",
    });
    setGalleryKeep(productImageList(p));
    setNewFiles([]);
    setError("");
  }

  function removeKeptUrl(url) {
    setGalleryKeep((g) => g.filter((u) => u !== url));
  }

  function onPickFiles(e) {
    const list = e.target.files;
    if (!list?.length) return;
    setNewFiles((prev) => [...prev, ...Array.from(list)]);
    e.target.value = "";
  }

  function removeNewFileAt(index) {
    setNewFiles((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    const hasNewFiles = newFiles.length > 0;
    const hasExtraUrls = form.extraImageUrls.trim().length > 0;
    if (!editingId) {
      if (!hasNewFiles && !hasExtraUrls) {
        setError("Add at least one image (upload files and/or paste image URLs).");
        return;
      }
    } else if (galleryKeep.length === 0 && !hasNewFiles && !hasExtraUrls) {
      setError("Keep at least one image, add new files, or paste image URLs.");
      return;
    }

    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("name", form.name.trim());
      if (form.slug.trim()) fd.append("slug", form.slug.trim());
      fd.append("description", form.description);
      fd.append("price", form.price);
      fd.append("category", form.category.trim() || "tees");
      fd.append("sizes", form.sizes);
      fd.append("colors", form.colors);
      fd.append("stock", form.stock);
      fd.append("featured", form.featured ? "true" : "false");
      if (form.extraImageUrls.trim()) {
        fd.append("imageUrls", form.extraImageUrls.trim());
      }
      newFiles.forEach((file) => {
        fd.append("images", file);
      });

      if (editingId) {
        fd.append("keepImages", JSON.stringify(galleryKeep));
        await patchForm(`/admin/products/${editingId}`, fd);
      } else {
        await postForm("/admin/products", fd);
      }
      resetForm();
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Could not save product.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Delete this product? This cannot be undone.")) return;
    try {
      await api.delete(`/admin/products/${id}`);
      load();
      if (editingId === id) resetForm();
    } catch (err) {
      setError(err.response?.data?.message || "Could not delete.");
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent">Admin</p>
          <h1 className="font-display text-3xl font-extrabold tracking-tight text-white">Products</h1>
          <p className="mt-2 text-sm text-zinc-500">
            Upload multiple photos per product. First image is the cover.
          </p>
        </div>
        <Link
          to="/shop"
          className="text-sm font-bold text-accent underline-offset-4 hover:underline"
        >
          View storefront →
        </Link>
      </div>

      <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        <section id="admin-upload-form" className="glass-panel scroll-mt-24 p-6 sm:p-8">
          <h2 className="font-display text-lg font-bold text-white">
            {editingId ? "Edit product" : "Add product"}
          </h2>
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {error && (
              <div
                className="rounded-xl border border-red-500/30 bg-red-950/40 px-4 py-3 text-sm text-red-200"
                role="alert"
              >
                {error}
              </div>
            )}

            {editingId && galleryKeep.length > 0 && (
              <div>
                <p className="mb-2 text-xs font-bold uppercase tracking-wider text-zinc-500">
                  Current gallery (remove to drop)
                </p>
                <ul className="flex flex-wrap gap-2">
                  {galleryKeep.map((url) => (
                    <li
                      key={url}
                      className="relative h-20 w-16 overflow-hidden rounded-lg border border-white/10"
                    >
                      <img src={assetUrl(url)} alt="" className="h-full w-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeKeptUrl(url)}
                        className="absolute right-0.5 top-0.5 flex h-5 w-5 items-center justify-center rounded bg-red-600 text-[10px] font-bold text-white hover:bg-red-500"
                        aria-label="Remove image"
                      >
                        ×
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {newFiles.length > 0 && (
              <div>
                <p className="mb-2 text-xs font-bold uppercase tracking-wider text-zinc-500">
                  New uploads (saved on submit)
                </p>
                <ul className="flex flex-wrap gap-2">
                  {newFiles.map((file, idx) => (
                    <li
                      key={`${file.name}-${idx}`}
                      className="relative h-20 w-16 overflow-hidden rounded-lg border border-accent/40"
                    >
                      <img
                        src={URL.createObjectURL(file)}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeNewFileAt(idx)}
                        className="absolute right-0.5 top-0.5 flex h-5 w-5 items-center justify-center rounded bg-red-600 text-[10px] font-bold text-white hover:bg-red-500"
                        aria-label="Remove new file"
                      >
                        ×
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500" htmlFor="adm-name">
                Name
              </label>
              <input
                id="adm-name"
                required
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                className={admField}
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500" htmlFor="adm-slug">
                Slug (optional)
              </label>
              <input
                id="adm-slug"
                value={form.slug}
                onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
                placeholder="auto from name"
                className={admField}
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500" htmlFor="adm-desc">
                Description
              </label>
              <textarea
                id="adm-desc"
                rows={3}
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                className={admField}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500" htmlFor="adm-price">
                  Price (INR)
                </label>
                <input
                  id="adm-price"
                  type="number"
                  min={0}
                  step="0.01"
                  required
                  value={form.price}
                  onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                  className={admField}
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500" htmlFor="adm-stock">
                  Stock
                </label>
                <input
                  id="adm-stock"
                  type="number"
                  min={0}
                  required
                  value={form.stock}
                  onChange={(e) => setForm((f) => ({ ...f, stock: e.target.value }))}
                  className={admField}
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500" htmlFor="adm-cat">
                Category
              </label>
              <input
                id="adm-cat"
                value={form.category}
                onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                className={admField}
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500" htmlFor="adm-sizes">
                Sizes (comma-separated)
              </label>
              <input
                id="adm-sizes"
                value={form.sizes}
                onChange={(e) => setForm((f) => ({ ...f, sizes: e.target.value }))}
                className={admField}
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500" htmlFor="adm-colors">
                Colors (comma-separated)
              </label>
              <input
                id="adm-colors"
                value={form.colors}
                onChange={(e) => setForm((f) => ({ ...f, colors: e.target.value }))}
                className={admField}
              />
            </div>
            <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-zinc-300">
              <input
                type="checkbox"
                checked={form.featured}
                onChange={(e) => setForm((f) => ({ ...f, featured: e.target.checked }))}
                className="h-4 w-4 rounded border-white/20 bg-zinc-900 accent-accent"
              />
              Featured on home
            </label>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500" htmlFor="adm-file">
                Image files {editingId ? "(add more)" : ""}
              </label>
              <input
                id="adm-file"
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                multiple
                onChange={onPickFiles}
                className="mt-1.5 block w-full text-sm text-zinc-500 file:mr-4 file:rounded-xl file:border-0 file:bg-gradient-to-b file:from-[#eeff66] file:to-[#b8e600] file:px-4 file:py-2 file:text-sm file:font-bold file:text-zinc-950"
              />
              <p className="mt-1 text-xs text-zinc-600">Select multiple files (max 15 per save). First in gallery is the cover.</p>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500" htmlFor="adm-urls">
                Image URLs (optional)
              </label>
              <textarea
                id="adm-urls"
                rows={3}
                value={form.extraImageUrls}
                onChange={(e) => setForm((f) => ({ ...f, extraImageUrls: e.target.value }))}
                placeholder={"One URL per line\nhttps://…"}
                className={admField}
              />
              <p className="mt-1 text-xs text-zinc-600">
                Appended after uploads. On edit, added to the kept gallery.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 pt-2">
              <button
                type="submit"
                disabled={saving}
                className="rounded-2xl bg-gradient-to-b from-[#eeff66] to-[#b8e600] px-6 py-3 text-sm font-bold text-zinc-950 shadow-[0_0_28px_-8px_rgba(212,255,0,0.45)] transition hover:brightness-105 disabled:opacity-60"
              >
                {saving ? "Saving…" : editingId ? "Update product" : "Create product"}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-2xl border border-white/15 px-6 py-3 text-sm font-bold text-zinc-300 transition hover:border-white/25 hover:bg-white/5"
                >
                  Cancel edit
                </button>
              )}
            </div>
          </form>
        </section>

        <section className="glass-panel p-6 sm:p-8">
          <h2 className="font-display text-lg font-bold text-white">Catalog</h2>
          {loading ? (
            <p className="mt-6 text-sm text-zinc-500">Loading products…</p>
          ) : products.length === 0 ? (
            <p className="mt-6 text-sm text-zinc-500">No products yet. Add one on the left.</p>
          ) : (
            <ul className="mt-6 divide-y divide-white/10">
              {products.map((p) => (
                <li key={p._id} className="flex gap-4 py-4 first:pt-0">
                  <div className="relative h-20 w-16 shrink-0 overflow-hidden rounded-xl border border-white/10 bg-zinc-900">
                    {productCover(p) ? (
                      <img
                        src={assetUrl(productCover(p))}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    ) : null}
                    {productImageList(p).length > 1 && (
                      <span className="absolute bottom-0.5 right-0.5 rounded bg-black/70 px-1 text-[9px] font-bold text-white">
                        {productImageList(p).length}
                      </span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-white">{p.name}</p>
                    <p className="text-sm text-zinc-500">
                      {formatInr(p.price)} · {p.stock} in stock · /shop/{p.slug}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => startEdit(p)}
                        className="text-sm font-bold text-accent hover:underline"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(p._id)}
                        className="text-sm font-bold text-red-400 hover:underline"
                      >
                        Delete
                      </button>
                      <Link
                        to={`/shop/${p.slug}`}
                        className="text-sm font-bold text-zinc-400 underline-offset-2 hover:text-accent hover:underline"
                      >
                        View
                      </Link>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}

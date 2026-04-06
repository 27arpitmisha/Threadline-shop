/** All image URLs for a product (new `images[]` or legacy `image`). */
export function productImageList(product) {
  if (!product) return [];
  const arr = Array.isArray(product.images) ? product.images.filter(Boolean) : [];
  if (arr.length) return arr;
  if (product.image) return [product.image];
  return [];
}

export function productCover(product) {
  const list = productImageList(product);
  return list[0] || "";
}

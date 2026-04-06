/**
 * Keep FREE_SHIPPING_MIN_INR and SHIPPING_FLAT_INR in sync with
 * server/src/config/money.js
 */
export const FREE_SHIPPING_MIN_INR = 5999;
export const SHIPPING_FLAT_INR = 99;

export function formatInr(value) {
  const n = Number(value);
  if (Number.isNaN(n)) {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(0);
  }
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(n);
}

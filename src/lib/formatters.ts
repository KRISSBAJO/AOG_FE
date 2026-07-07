export type MoneyValue =
  | string
  | number
  | null
  | undefined
  | { toString?: () => string };

export function toNumber(value: MoneyValue) {
  if (value === null || value === undefined || value === "") return 0;
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  if (typeof value === "string") return Number(value) || 0;

  const printable = value.toString?.();
  if (!printable || printable === "[object Object]") return 0;
  return Number(printable) || 0;
}

export function formatMoney(value: MoneyValue, currency = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(toNumber(value));
}

export function formatDate(value?: string | null) {
  if (!value) return "Not set";
  return new Date(value).toLocaleDateString();
}

export function formatDateTime(value?: string | null) {
  if (!value) return "Not set";
  return new Date(value).toLocaleString();
}

export function formatEnum(value?: string | null) {
  if (!value) return "Not set";
  return value.replaceAll("_", " ").toLowerCase();
}

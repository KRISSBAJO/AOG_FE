export type MoneyValue =
  | string
  | number
  | null
  | undefined
  | { toString?: () => string; s?: number; e?: number; d?: number[] };

export function toNumber(value: MoneyValue) {
  if (value === null || value === undefined || value === "") return 0;
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  if (typeof value === "string") return Number(value) || 0;

  const printable = value.toString?.();
  if (printable && printable !== "[object Object]") return Number(printable) || 0;

  const decimal = decimalObjectToString(value);
  return decimal ? Number(decimal) || 0 : 0;
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

function decimalObjectToString(value: { s?: number; e?: number; d?: number[] }) {
  if (
    typeof value.s !== "number" ||
    typeof value.e !== "number" ||
    !Array.isArray(value.d) ||
    !value.d.length
  ) {
    return null;
  }

  const digits =
    [String(value.d[0]), ...value.d.slice(1).map((part) => String(part).padStart(7, "0"))]
      .join("")
      .replace(/0+$/, "") || "0";
  const decimalAt = value.e + 1;
  let normalized: string;

  if (decimalAt <= 0) {
    normalized = `0.${"0".repeat(Math.abs(decimalAt))}${digits}`;
  } else if (decimalAt >= digits.length) {
    normalized = `${digits}${"0".repeat(decimalAt - digits.length)}`;
  } else {
    normalized = `${digits.slice(0, decimalAt)}.${digits.slice(decimalAt)}`;
  }

  return `${value.s < 0 ? "-" : ""}${normalized}`;
}

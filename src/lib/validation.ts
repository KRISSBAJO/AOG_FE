/** Lightweight, dependency-free validators for the auth forms. */

export function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export function required(value: string) {
  return value.trim().length > 0;
}

export type PasswordStrength = {
  score: 0 | 1 | 2 | 3 | 4;
  label: "Too weak" | "Weak" | "Fair" | "Good" | "Strong";
};

const labels: PasswordStrength["label"][] = [
  "Too weak",
  "Weak",
  "Fair",
  "Good",
  "Strong",
];

/** Rough 0–4 password strength estimate for the meter UI. */
export function passwordStrength(value: string): PasswordStrength {
  let score = 0;
  if (value.length >= 8) score++;
  if (/[A-Z]/.test(value) && /[a-z]/.test(value)) score++;
  if (/\d/.test(value)) score++;
  if (/[^A-Za-z0-9]/.test(value)) score++;
  const clamped = Math.min(score, 4) as PasswordStrength["score"];
  return { score: clamped, label: labels[clamped] };
}

/** Simulates an async auth request so the UI can show loading/success. */
export function mockRequest(ms = 1200) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

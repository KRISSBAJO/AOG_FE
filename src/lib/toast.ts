export type ToastTone = "success" | "error" | "info";

export type ToastInput = {
  tone?: ToastTone;
  title?: string;
  message: string;
  durationMs?: number;
};

export const TOAST_EVENT = "aog:toast";

export function showToast(input: ToastInput) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent<ToastInput>(TOAST_EVENT, { detail: input }),
  );
}

export const toast = {
  success(message: string, title = "Saved") {
    showToast({ tone: "success", title, message });
  },
  error(message: string, title = "Something went wrong") {
    showToast({ tone: "error", title, message, durationMs: 7000 });
  },
  info(message: string, title = "Notice") {
    showToast({ tone: "info", title, message });
  },
};

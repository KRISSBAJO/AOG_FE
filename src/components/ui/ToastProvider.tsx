"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, CheckCircle2, Info, X } from "lucide-react";

import { TOAST_EVENT, type ToastInput, type ToastTone } from "@/lib/toast";
import { cn } from "@/lib/utils";

type ToastState = Required<
  Pick<ToastInput, "tone" | "message" | "durationMs">
> & {
  id: string;
  title?: string;
};

const toneStyles: Record<ToastTone, string> = {
  success: "border-emerald-200 bg-white text-slate-900 shadow-emerald-950/10",
  error: "border-red-200 bg-white text-slate-900 shadow-red-950/10",
  info: "border-sky-200 bg-white text-slate-900 shadow-sky-950/10",
};

const iconStyles: Record<ToastTone, string> = {
  success: "bg-emerald-50 text-emerald-600",
  error: "bg-red-50 text-red-600",
  info: "bg-sky-50 text-sky-600",
};

function ToastIcon({ tone }: { tone: ToastTone }) {
  const className = "h-4 w-4";
  if (tone === "success") return <CheckCircle2 className={className} />;
  if (tone === "error") return <AlertTriangle className={className} />;
  return <Info className={className} />;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastState[]>([]);

  useEffect(() => {
    function onToast(event: Event) {
      const detail = (event as CustomEvent<ToastInput>).detail;
      const id = crypto.randomUUID();
      const toast: ToastState = {
        id,
        tone: detail.tone ?? "info",
        title: detail.title,
        message: detail.message,
        durationMs: detail.durationMs ?? 4500,
      };

      setToasts((current) => [toast, ...current].slice(0, 4));
      window.setTimeout(() => {
        setToasts((current) => current.filter((item) => item.id !== id));
      }, toast.durationMs);
    }

    window.addEventListener(TOAST_EVENT, onToast);
    return () => window.removeEventListener(TOAST_EVENT, onToast);
  }, []);

  return (
    <>
      {children}
      <div className="pointer-events-none fixed right-4 top-4 z-[100] flex w-[min(420px,calc(100vw-2rem))] flex-col gap-3">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            role="status"
            className={cn(
              "pointer-events-auto flex items-start gap-3 rounded-xl border p-4 shadow-xl",
              toneStyles[toast.tone],
            )}
          >
            <span
              className={cn(
                "mt-0.5 flex h-8 w-8 flex-none items-center justify-center rounded-lg",
                iconStyles[toast.tone],
              )}
            >
              <ToastIcon tone={toast.tone} />
            </span>
            <div className="min-w-0 flex-1">
              {toast.title && (
                <p className="text-sm font-semibold text-slate-900">
                  {toast.title}
                </p>
              )}
              <p className="mt-1 text-sm leading-5 text-slate-600">
                {toast.message}
              </p>
            </div>
            <button
              type="button"
              className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              aria-label="Dismiss notification"
              onClick={() =>
                setToasts((current) =>
                  current.filter((item) => item.id !== toast.id),
                )
              }
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </>
  );
}

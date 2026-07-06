"use client";

import { forwardRef, useId, useState, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
  hint?: string;
  /** Optional leading icon node. */
  icon?: React.ReactNode;
};

const fieldBase =
  "w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 transition-colors focus:outline-none focus:ring-2 focus:ring-amber-400/50 disabled:cursor-not-allowed disabled:bg-slate-50";

/** Text input with label, hint, error and optional leading icon. */
export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, icon, className, id, ...props }, ref) => {
    const generatedId = useId();
    const inputId = id ?? generatedId;
    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="mb-1.5 block text-sm font-medium text-slate-700"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
              {icon}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            aria-invalid={!!error}
            className={cn(
              fieldBase,
              icon && "pl-10",
              error
                ? "border-red-400 focus:ring-red-400/40"
                : "border-slate-300 hover:border-slate-400",
              className
            )}
            {...props}
          />
        </div>
        {error ? (
          <p className="mt-1.5 text-xs text-red-500">{error}</p>
        ) : hint ? (
          <p className="mt-1.5 text-xs text-slate-400">{hint}</p>
        ) : null}
      </div>
    );
  }
);
Input.displayName = "Input";

/** Password input with a show/hide toggle, built on <Input>. */
export const PasswordInput = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, className, id, ...props }, ref) => {
    const [visible, setVisible] = useState(false);
    const generatedId = useId();
    const inputId = id ?? generatedId;
    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="mb-1.5 block text-sm font-medium text-slate-700"
          >
            {label}
          </label>
        )}
        <div className="relative">
          <input
            ref={ref}
            id={inputId}
            type={visible ? "text" : "password"}
            aria-invalid={!!error}
            className={cn(
              fieldBase,
              "pr-11",
              error
                ? "border-red-400 focus:ring-red-400/40"
                : "border-slate-300 hover:border-slate-400",
              className
            )}
            {...props}
          />
          <button
            type="button"
            onClick={() => setVisible((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-400 hover:text-slate-700"
            aria-label={visible ? "Hide password" : "Show password"}
          >
            {visible ? "Hide" : "Show"}
          </button>
        </div>
        {error ? (
          <p className="mt-1.5 text-xs text-red-500">{error}</p>
        ) : hint ? (
          <p className="mt-1.5 text-xs text-slate-400">{hint}</p>
        ) : null}
      </div>
    );
  }
);
PasswordInput.displayName = "PasswordInput";

"use client";

import { useRef, type ClipboardEvent, type KeyboardEvent } from "react";
import { cn } from "@/lib/utils";

/** Segmented verification-code input (default 6 digits). */
export function CodeInput({
  length = 6,
  value,
  onChange,
}: {
  length?: number;
  value: string;
  onChange: (value: string) => void;
}) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  function setChar(index: number, char: string) {
    const chars = value.split("");
    chars[index] = char;
    onChange(chars.join("").slice(0, length));
  }

  function handleChange(index: number, raw: string) {
    const digit = raw.replace(/\D/g, "").slice(-1);
    if (!digit) return;
    setChar(index, digit);
    if (index < length - 1) refs.current[index + 1]?.focus();
  }

  function handleKeyDown(index: number, e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !value[index] && index > 0) {
      refs.current[index - 1]?.focus();
    }
  }

  function handlePaste(e: ClipboardEvent<HTMLInputElement>) {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "");
    if (pasted) onChange(pasted.slice(0, length));
  }

  return (
    <div className="flex justify-between gap-2">
      {Array.from({ length }).map((_, i) => (
        <input
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          inputMode="numeric"
          maxLength={1}
          value={value[i] ?? ""}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={handlePaste}
          className={cn(
            "h-14 w-full rounded-lg border text-center text-xl font-semibold text-slate-900 transition-colors focus:outline-none focus:ring-2 focus:ring-amber-400/50",
            value[i] ? "border-amber-400" : "border-slate-300"
          )}
        />
      ))}
    </div>
  );
}

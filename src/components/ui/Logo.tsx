import Link from "next/link";
import { cn } from "@/lib/utils";

/** AOG wordmark. `variant` controls contrast treatment for light/dark backgrounds. */
export function Logo({
  variant = "dark",
  href = "/",
  size = "md",
  className,
}: {
  variant?: "dark" | "light";
  href?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "group inline-flex shrink-0 items-center justify-center overflow-hidden rounded-xl border bg-white transition duration-200",
        variant === "light"
          ? "border-white/25 shadow-lg shadow-black/25 hover:shadow-amber-400/20"
          : "border-slate-200 shadow-sm hover:border-amber-300 hover:shadow-md",
        size === "sm" && "h-8 w-24 rounded-lg",
        size === "md" && "h-10 w-28 rounded-lg",
        size === "lg" && "h-12 w-36",
        className,
      )}
      aria-label="AOG Services"
    >
      <span className="flex h-full w-full flex-col items-center justify-center px-2 py-1">
        <img
          src="/AOG-mark.png"
          alt=""
          className={cn(
            "w-auto object-contain",
            size === "sm" && "h-5",
            size === "md" && "h-6",
            size === "lg" && "h-8",
          )}
        />
        <span
          className={cn(
            "font-black leading-none text-amber-500",
            size === "sm" && "mt-0.5 text-[5px] tracking-[0.3em]",
            size === "md" && "mt-0.5 text-[6px] tracking-[0.36em]",
            size === "lg" && "mt-0.5 text-[7px] tracking-[0.42em]",
          )}
        >
          SERVICES
        </span>
      </span>
    </Link>
  );
}

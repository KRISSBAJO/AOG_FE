import Link from "next/link";
import { cn } from "@/lib/utils";

/** AOG wordmark. `variant` controls text color for light/dark backgrounds. */
export function Logo({
  variant = "dark",
  href = "/",
  className,
}: {
  variant?: "dark" | "light";
  href?: string;
  className?: string;
}) {
  return (
    <Link href={href} className={cn("flex items-center gap-2", className)}>
      <span className="flex h-8 w-8 items-center justify-center rounded bg-amber-400 text-sm font-bold text-[#0B1120]">
        AO
      </span>
      <span
        className={cn(
          "text-lg font-semibold tracking-tight",
          variant === "dark" ? "text-slate-900" : "text-white"
        )}
      >
        AOG Services
      </span>
    </Link>
  );
}

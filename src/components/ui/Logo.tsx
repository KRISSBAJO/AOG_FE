import Link from "next/link";
import { cn } from "@/lib/utils";

/** AOG wordmark. `variant` controls contrast treatment for light/dark backgrounds. */
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
    <Link
      href={href}
      className={cn(
        "inline-flex items-center",
        variant === "light" && "rounded-md bg-white px-2 py-1 shadow-sm",
        className,
      )}
      aria-label="AOG Services"
    >
      <img
        src="/AOG_logo.svg"
        alt="AOG Services"
        className="h-9 w-auto object-contain"
      />
    </Link>
  );
}

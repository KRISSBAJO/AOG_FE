import { cn } from "@/lib/utils";

type Tone = "success" | "error" | "info";

const tones: Record<Tone, string> = {
  success: "border-emerald-200 bg-emerald-50 text-emerald-700",
  error: "border-red-200 bg-red-50 text-red-700",
  info: "border-sky-200 bg-sky-50 text-sky-700",
};

/** Inline feedback banner for form results. */
export function Alert({
  tone = "info",
  children,
  className,
}: {
  tone?: Tone;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      role="status"
      className={cn(
        "flex items-start gap-2 rounded-lg border px-3.5 py-3 text-sm",
        tones[tone],
        className
      )}
    >
      {children}
    </div>
  );
}

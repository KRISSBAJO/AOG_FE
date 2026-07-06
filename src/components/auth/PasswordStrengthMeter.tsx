import { passwordStrength } from "@/lib/validation";
import { cn } from "@/lib/utils";

const barColors = [
  "bg-red-400",
  "bg-red-400",
  "bg-amber-400",
  "bg-lime-500",
  "bg-emerald-500",
];

/** Four-segment strength bar + label that reacts to the password value. */
export function PasswordStrengthMeter({ value }: { value: string }) {
  if (!value) return null;
  const { score, label } = passwordStrength(value);
  return (
    <div className="mt-2">
      <div className="flex gap-1.5">
        {[0, 1, 2, 3].map((i) => (
          <span
            key={i}
            className={cn(
              "h-1 flex-1 rounded-full transition-colors",
              i < score ? barColors[score] : "bg-slate-200"
            )}
          />
        ))}
      </div>
      <p className="mt-1 text-xs text-slate-400">
        Password strength: <span className="font-medium">{label}</span>
      </p>
    </div>
  );
}

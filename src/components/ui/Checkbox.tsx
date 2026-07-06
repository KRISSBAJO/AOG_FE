import { forwardRef, useId, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export type CheckboxProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: React.ReactNode;
};

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, className, id, ...props }, ref) => {
    const generatedId = useId();
    const inputId = id ?? generatedId;
    return (
      <label
        htmlFor={inputId}
        className="flex cursor-pointer select-none items-center gap-2 text-sm text-slate-600"
      >
        <input
          ref={ref}
          id={inputId}
          type="checkbox"
          className={cn(
            "h-4 w-4 rounded border-slate-300 text-amber-500 accent-amber-400 focus:ring-amber-400",
            className
          )}
          {...props}
        />
        {label}
      </label>
    );
  }
);
Checkbox.displayName = "Checkbox";

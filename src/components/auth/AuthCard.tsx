import { Logo } from "@/components/ui";

/** Header + body wrapper for the form side of an auth page. */
export function AuthCard({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <div className="w-full max-w-md">
      {/* logo shows on mobile where the brand panel is hidden */}
      <div className="mb-8 lg:hidden">
        <Logo />
      </div>

      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-2 text-sm text-slate-500">{subtitle}</p>
        )}
      </div>

      {children}

      {footer && (
        <p className="mt-8 text-center text-sm text-slate-500">{footer}</p>
      )}
    </div>
  );
}

import type { ReactNode } from "react";
import { Link } from "react-router-dom";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  /** Trail shown above the title, e.g. Dashboard / Payments. */
  breadcrumbs?: BreadcrumbItem[];
  /** Right-aligned actions (buttons etc.). */
  actions?: ReactNode;
}

/**
 * Standard page heading used across the hospital redesign: small breadcrumb
 * trail, large title, optional subtitle, and a right-hand actions slot.
 */
export function PageHeader({
  title,
  subtitle,
  breadcrumbs,
  actions,
}: PageHeaderProps) {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
      <div className="min-w-0">
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav className="mb-1 flex items-center gap-1.5 text-sm text-neutral-400">
            {breadcrumbs.map((crumb, index) => (
              <span key={index} className="flex items-center gap-1.5">
                {index > 0 && <span>/</span>}
                {crumb.href ? (
                  <Link
                    to={crumb.href}
                    className="transition-colors hover:text-neutral-600"
                  >
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="text-neutral-500">{crumb.label}</span>
                )}
              </span>
            ))}
          </nav>
        )}
        <h1 className="truncate text-2xl font-bold text-neutral-900 lg:text-3xl">
          {title}
        </h1>
        {subtitle && <p className="mt-1 text-sm text-neutral-500">{subtitle}</p>}
      </div>
      {actions && (
        <div className="flex flex-shrink-0 items-center gap-3">{actions}</div>
      )}
    </div>
  );
}

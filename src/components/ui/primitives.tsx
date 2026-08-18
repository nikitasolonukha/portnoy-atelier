import Link from "next/link";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, PropsWithChildren } from "react";
import { cn } from "@/lib/utils";

export function Button({ className, variant = "primary", ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" | "quiet" | "danger" }) {
  return <button className={cn("button", `button-${variant}`, className)} {...props} />;
}

export function ButtonLink({ className, variant = "primary", ...props }: AnchorHTMLAttributes<HTMLAnchorElement> & { href: string; variant?: "primary" | "secondary" | "quiet" }) {
  return <Link className={cn("button", `button-${variant}`, className)} {...props} />;
}

export function Field({ label, id, required, error, hint, children }: PropsWithChildren<{ label: string; id: string; required?: boolean; error?: string; hint?: string }>) {
  return <div>
    <label className="label" htmlFor={id}>{label}{required && <span aria-hidden="true"> *</span>}</label>
    {children}
    {hint && !error && <p className="field-hint">{hint}</p>}
    {error && <p id={`${id}-error`} className="field-error" role="alert">{error}</p>}
  </div>;
}

export function PageHeading({ eyebrow, title, description, actions }: { eyebrow: string; title: string; description?: string; actions?: React.ReactNode }) {
  return <div className="flex flex-wrap items-end justify-between gap-5">
    <div><p className="eyebrow">{eyebrow}</p><h1 className="page-title">{title}</h1>{description && <p className="muted mt-3 max-w-2xl text-sm leading-6">{description}</p>}</div>
    {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
  </div>;
}

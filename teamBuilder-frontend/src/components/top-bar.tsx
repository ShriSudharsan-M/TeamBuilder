import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

interface Props {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
}

export function TopBar({ eyebrow, title, description, actions }: Props) {
  return (
    <div className="flex flex-col gap-4 border-b border-outline-variant pb-6 lg:flex-row lg:items-end lg:justify-between">
      <div>
        {eyebrow && <div className="text-label-sm text-magenta">{eyebrow}</div>}
        <h1 className="mt-2 text-headline-lg text-on-surface">{title}</h1>
        {description && (
          <p className="mt-2 max-w-2xl text-sm text-on-surface-variant">{description}</p>
        )}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
      <MobileNav />
    </div>
  );
}

function MobileNav() {
  return (
    <nav className="-mx-1 flex flex-wrap gap-1 overflow-x-auto pb-1 lg:hidden">
      {[
        { to: "/dashboard", label: "Dashboard" },
        { to: "/teams", label: "Browse" },
        { to: "/teams/matched", label: "Matched" },
        { to: "/skills", label: "Skills" },
        { to: "/teams/create", label: "Create" },
        { to: "/profile", label: "Profile" },
      ].map((i) => (
        <Link
          key={i.to}
          to={i.to}
          activeProps={{
            className:
              "rounded-md bg-[oklch(0.68_0.32_328/0.12)] px-3 py-1.5 text-xs font-medium text-on-surface",
          }}
          inactiveProps={{
            className:
              "rounded-md border border-outline-variant px-3 py-1.5 text-xs font-medium text-on-surface-variant",
          }}
        >
          {i.label}
        </Link>
      ))}
    </nav>
  );
}

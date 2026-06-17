import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Users,
  Sparkles,
  Compass,
  Plus,
  User,
  LogOut,
  Hexagon,
} from "lucide-react";
import { useAuthStore } from "@/lib/auth-store";
import { cn } from "@/lib/utils";

const items = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/teams", label: "Browse Teams", icon: Compass },
  { to: "/teams/matched", label: "Matched", icon: Sparkles },
  { to: "/skills", label: "My Skills", icon: Hexagon },
  { to: "/teams/create", label: "Create Team", icon: Plus },
  { to: "/profile", label: "Profile", icon: User },
] as const;

export function AppSidebar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate({ to: "/auth/login" });
  };

  return (
    <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-outline-variant bg-[oklch(0.15_0_0)] lg:flex">
      <div className="flex items-center gap-2 px-6 py-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-gradient-to-br from-[oklch(0.68_0.32_328)] to-[oklch(0.55_0.3_300)]">
          <Hexagon className="h-4 w-4 text-black" strokeWidth={2.5} />
        </div>
        <div>
          <div className="text-label-sm text-on-surface">Team</div>
          <div className="-mt-0.5 text-label-sm text-magenta">Builder</div>
        </div>
      </div>

      <nav className="flex-1 px-3">
        <div className="px-3 pb-2 text-label-sm text-on-surface-variant/70">Navigate</div>
        <ul className="space-y-1">
          {items.map((item) => {
            const active =
              item.to === "/teams"
                ? pathname === "/teams"
                : pathname === item.to ||
                  (item.to !== "/dashboard" && pathname.startsWith(item.to + "/"));
            return (
              <li key={item.to}>
                <Link
                  to={item.to}
                  className={cn(
                    "group flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition",
                    active
                      ? "bg-[oklch(0.68_0.32_328/0.12)] text-on-surface"
                      : "text-on-surface-variant hover:bg-surface-container hover:text-on-surface",
                  )}
                >
                  <item.icon
                    className={cn(
                      "h-4 w-4",
                      active ? "text-magenta" : "text-on-surface-variant",
                    )}
                  />
                  {item.label}
                  {active && (
                    <span className="ml-auto h-1.5 w-1.5 rounded-full bg-magenta shadow-[0_0_8px_var(--magenta)]" />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="border-t border-outline-variant p-3">
        <div className="flex items-center gap-3 rounded-md bg-surface-container/60 px-3 py-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[oklch(0.81_0.13_200)] to-[oklch(0.55_0.3_300)] text-xs font-bold text-black">
            {(user?.name ?? user?.email ?? "U").slice(0, 1).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-medium text-on-surface">
              {user?.name ?? "Operator"}
            </div>
            <div className="truncate text-xs text-on-surface-variant">{user?.email}</div>
          </div>
          <button
            onClick={handleLogout}
            className="rounded p-1.5 text-on-surface-variant transition hover:bg-surface-container-high hover:text-magenta"
            aria-label="Log out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}

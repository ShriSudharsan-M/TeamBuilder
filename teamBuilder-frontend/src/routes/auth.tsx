import { Outlet, createFileRoute, Link } from "@tanstack/react-router";
import { Hexagon } from "lucide-react";
import { LuminousArcs } from "@/components/luminous-arcs";

export const Route = createFileRoute("/auth")({
  component: AuthLayout,
});

function AuthLayout() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <LuminousArcs variant="ambient" />
      <div className="relative z-10 mx-auto flex min-h-screen max-w-md flex-col px-6 py-10">
        <Link to="/" className="mb-12 inline-flex items-center gap-2 self-start">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-gradient-to-br from-[oklch(0.68_0.32_328)] to-[oklch(0.55_0.3_300)]">
            <Hexagon className="h-4 w-4 text-black" strokeWidth={2.5} />
          </div>
          <span className="text-label-sm text-on-surface">
            Team <span className="text-magenta">Builder</span>
          </span>
        </Link>
        <Outlet />
      </div>
    </div>
  );
}

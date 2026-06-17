import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { ArrowRight, Hexagon, Sparkles, Users, Zap } from "lucide-react";
import { LuminousArcs } from "@/components/luminous-arcs";
import { useAuthStore } from "@/lib/auth-store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Team Builder — Assemble Your Squad" },
      {
        name: "description",
        content:
          "Form high-performance teams by matching skills to missions. Built for elite collaborators.",
      },
    ],
  }),
  component: Landing,
});

function Landing() {
  const token = useAuthStore((s) => s.token);
  const navigate = useNavigate();
  useEffect(() => {
    if (token) navigate({ to: "/dashboard", replace: true });
  }, [token, navigate]);

  return (
    <main className="relative min-h-screen overflow-hidden bg-background">
      <LuminousArcs variant="hero" />

      <header className="relative z-10 mx-auto flex max-w-[1440px] items-center justify-between px-6 py-6 lg:px-16">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-gradient-to-br from-[oklch(0.68_0.32_328)] to-[oklch(0.55_0.3_300)]">
            <Hexagon className="h-4 w-4 text-black" strokeWidth={2.5} />
          </div>
          <span className="text-label-sm">
            <span className="text-on-surface">Team </span>
            <span className="text-magenta">Builder</span>
          </span>
        </div>
        <nav className="flex items-center gap-2">
          <Link
            to="/auth/login"
            className="rounded-md px-4 py-2 text-sm font-medium text-on-surface-variant transition hover:text-on-surface"
          >
            Sign in
          </Link>
          <Link
            to="/auth/register"
            className="rounded-md bg-magenta px-4 py-2 text-sm font-semibold text-black transition hover:brightness-110"
          >
            Get started
          </Link>
        </nav>
      </header>

      <section className="relative z-10 mx-auto max-w-[1440px] px-6 pt-20 pb-32 lg:px-16">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-outline-variant bg-surface-container/60 px-4 py-1.5 backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full bg-magenta shadow-[0_0_8px_var(--magenta)]" />
            <span className="text-label-sm text-on-surface-variant">Now matching v1.0</span>
          </div>
          <h1 className="mt-8 text-display-lg text-on-surface">
            Assemble a squad
            <br />
            <span className="bg-gradient-to-r from-[oklch(0.68_0.32_328)] via-[oklch(0.7_0.28_310)] to-[oklch(0.81_0.13_200)] bg-clip-text text-transparent">
              engineered to ship.
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-base text-on-surface-variant md:text-lg">
            Map skills, declare missions, match instantly. Team Builder is the formation
            console for elite collaborators.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/auth/register"
              className="inline-flex items-center gap-2 rounded-md bg-magenta px-6 py-3 text-sm font-semibold text-black transition hover:brightness-110"
              style={{
                boxShadow:
                  "0 0 0 1px oklch(0.68 0.32 328 / 0.5), 0 0 32px -4px oklch(0.68 0.32 328 / 0.6)",
              }}
            >
              Create account
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/auth/login"
              className="rounded-md border border-[oklch(0.81_0.13_200/0.6)] px-6 py-3 text-sm font-semibold text-[oklch(0.85_0.12_200)] transition hover:bg-[oklch(0.81_0.13_200/0.08)]"
            >
              Sign in
            </Link>
          </div>
        </div>

        <div className="mx-auto mt-24 grid max-w-5xl grid-cols-1 gap-4 md:grid-cols-3">
          {[
            {
              icon: Hexagon,
              title: "Map your skills",
              body: "Build a living skill graph. Each skill is a signal in the matcher.",
              accent: "cyan",
            },
            {
              icon: Sparkles,
              title: "Match in real time",
              body: "We surface squads whose missions intersect with your capabilities.",
              accent: "magenta",
            },
            {
              icon: Users,
              title: "Lead a formation",
              body: "Spin up a team, declare required skills, approve incoming operators.",
              accent: "violet",
            },
          ].map(({ icon: Icon, title, body, accent }) => (
            <div
              key={title}
              className="relative rounded-lg border border-outline-variant bg-surface-container/50 p-6 backdrop-blur"
            >
              <div
                className={`mb-4 flex h-10 w-10 items-center justify-center rounded-md ${
                  accent === "cyan"
                    ? "bg-[oklch(0.81_0.13_200/0.15)] text-[oklch(0.85_0.12_200)]"
                    : accent === "magenta"
                      ? "bg-[oklch(0.68_0.32_328/0.15)] text-[oklch(0.83_0.13_335)]"
                      : "bg-[oklch(0.55_0.3_300/0.18)] text-[oklch(0.81_0.12_300)]"
                }`}
              >
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="text-headline-md text-on-surface">{title}</h3>
              <p className="mt-2 text-sm text-on-surface-variant">{body}</p>
            </div>
          ))}
        </div>

        <div className="mx-auto mt-16 flex max-w-3xl items-center justify-center gap-2 text-xs text-on-surface-variant">
          <Zap className="h-3.5 w-3.5 text-magenta" />
          Built for builders. Powered by skill matching.
        </div>
      </section>
    </main>
  );
}

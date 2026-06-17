import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Hexagon, Sparkles, Users, Plus, ArrowRight, Compass } from "lucide-react";
import { TopBar } from "@/components/top-bar";
import { StatCard } from "@/components/stat-card";
import { TeamCard } from "@/components/team-card";
import { api } from "@/lib/api";
import { useAuthStore } from "@/lib/auth-store";

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: Dashboard,
});

function Dashboard() {
  const user = useAuthStore((s) => s.user);

  const skillsQ = useQuery({ queryKey: ["skills"], queryFn: api.skills.list });
  const matchedQ = useQuery({ queryKey: ["teams", "matched"], queryFn: api.teams.matched });
  const teamsQ = useQuery({ queryKey: ["teams"], queryFn: api.teams.list });

  const recommended = (matchedQ.data ?? teamsQ.data ?? []).slice(0, 3);

  return (
    <div className="space-y-10">
      <TopBar
        eyebrow={`Welcome, ${user?.name ?? "operator"}`}
        title="Mission Control"
        description="Your skill graph, active matches, and the squads forming around you."
      />

      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <StatCard
          label="Skills mapped"
          value={skillsQ.data?.length ?? "—"}
          icon={Hexagon}
          accent="cyan"
        />
        <StatCard
          label="Matched squads"
          value={matchedQ.data?.length ?? "—"}
          icon={Sparkles}
          accent="magenta"
        />
        <StatCard
          label="Available teams"
          value={teamsQ.data?.length ?? "—"}
          icon={Users}
          accent="violet"
        />
      </section>

      <section>
        <div className="mb-4 text-section-header text-on-surface-variant">Quick actions</div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <QuickAction to="/skills" label="Manage skills" icon={Hexagon} />
          <QuickAction to="/teams" label="Browse teams" icon={Compass} />
          <QuickAction to="/teams/matched" label="View matches" icon={Sparkles} />
          <QuickAction to="/teams/create" label="Create team" icon={Plus} />
        </div>
      </section>

      <section>
        <div className="mb-4 flex items-end justify-between">
          <div>
            <div className="text-section-header text-on-surface-variant">Recommended</div>
            <h2 className="mt-1 text-headline-md text-on-surface">Squads matched to you</h2>
          </div>
          <Link
            to="/teams/matched"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-magenta hover:underline"
          >
            See all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        {matchedQ.isLoading || teamsQ.isLoading ? (
          <SkeletonGrid />
        ) : recommended.length === 0 ? (
          <EmptyHint />
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {recommended.map((t) => (
              <TeamCard key={String(t.id)} team={t} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function QuickAction({
  to,
  label,
  icon: Icon,
}: {
  to: string;
  label: string;
  icon: typeof Hexagon;
}) {
  return (
    <Link
      to={to}
      className="group flex items-center gap-3 rounded-lg border border-outline-variant bg-surface-container/60 p-4 transition hover:border-magenta hover:bg-surface-container"
    >
      <div className="flex h-9 w-9 items-center justify-center rounded-md bg-[oklch(0.68_0.32_328/0.12)] text-magenta">
        <Icon className="h-4 w-4" />
      </div>
      <span className="text-sm font-medium text-on-surface">{label}</span>
      <ArrowRight className="ml-auto h-4 w-4 text-on-surface-variant transition group-hover:text-magenta" />
    </Link>
  );
}

function SkeletonGrid() {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="h-48 animate-pulse rounded-lg border border-outline-variant bg-surface-container/40"
        />
      ))}
    </div>
  );
}

function EmptyHint() {
  return (
    <div className="rounded-lg border border-dashed border-outline-variant bg-surface-container/30 p-10 text-center">
      <p className="text-sm text-on-surface-variant">
        No matches yet. Map more skills or browse the open squads.
      </p>
      <Link
        to="/skills"
        className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-magenta hover:underline"
      >
        Add skills <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}

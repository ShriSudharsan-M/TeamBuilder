import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Search, Plus } from "lucide-react";
import { TopBar } from "@/components/top-bar";
import { TeamCard } from "@/components/team-card";
import { api } from "@/lib/api";

export const Route = createFileRoute("/_authenticated/teams/")({
  component: BrowseTeams,
});

function BrowseTeams() {
  const [q, setQ] = useState("");
  const teamsQ = useQuery({ queryKey: ["teams"], queryFn: api.teams.list });

  const filtered = useMemo(() => {
    const list = teamsQ.data ?? [];
    if (!q.trim()) return list;
    const needle = q.toLowerCase();
    return list.filter(
      (t) =>
        t.name.toLowerCase().includes(needle) ||
        t.mission?.toLowerCase().includes(needle) ||
        t.requiredSkills?.some((s) => s.name.toLowerCase().includes(needle)),
    );
  }, [teamsQ.data, q]);

  return (
    <div className="space-y-8">
      <TopBar
        eyebrow="Open squads"
        title="Browse Teams"
        description="All active formations seeking operators."
        actions={
          <Link
            to="/teams/create"
            className="inline-flex items-center gap-2 rounded-md bg-magenta px-4 py-2 text-sm font-semibold text-black transition hover:brightness-110"
          >
            <Plus className="h-4 w-4" />
            Create team
          </Link>
        }
      />

      <div className="relative">
        <Search className="absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-on-surface-variant" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search teams, missions, skills…"
          className="w-full rounded-lg border border-outline-variant bg-surface-container/60 py-3 pr-4 pl-11 text-sm text-on-surface outline-none transition focus:border-magenta"
        />
      </div>

      {teamsQ.isLoading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="h-48 animate-pulse rounded-lg border border-outline-variant bg-surface-container/40"
            />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-lg border border-dashed border-outline-variant bg-surface-container/30 p-12 text-center text-sm text-on-surface-variant">
          {q ? "No squads match that search." : "No teams available right now."}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((t) => (
            <TeamCard key={String(t.id)} team={t} />
          ))}
        </div>
      )}
    </div>
  );
}

import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Sparkles } from "lucide-react";
import { TopBar } from "@/components/top-bar";
import { TeamCard } from "@/components/team-card";
import { api } from "@/lib/api";

export const Route = createFileRoute("/_authenticated/teams/matched")({
  component: MatchedTeams,
});

function MatchedTeams() {
  const matchedQ = useQuery({ queryKey: ["teams", "matched"], queryFn: api.teams.matched });

  return (
    <div className="space-y-8">
      <TopBar
        eyebrow="Skill intersection"
        title="Matched Teams"
        description="Squads whose required skills overlap with your skill graph."
      />

      {matchedQ.isLoading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-48 animate-pulse rounded-lg border border-outline-variant bg-surface-container/40"
            />
          ))}
        </div>
      ) : !matchedQ.data || matchedQ.data.length === 0 ? (
        <div className="rounded-lg border border-dashed border-outline-variant bg-surface-container/30 p-12 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[oklch(0.68_0.32_328/0.12)] text-magenta">
            <Sparkles className="h-5 w-5" />
          </div>
          <p className="mt-4 text-sm text-on-surface-variant">
            No matches yet. Add more skills to widen your matcher.
          </p>
          <Link
            to="/skills"
            className="mt-4 inline-block text-sm font-medium text-magenta hover:underline"
          >
            Add skills
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {matchedQ.data.map((t) => (
            <TeamCard key={String(t.id)} team={t} />
          ))}
        </div>
      )}
    </div>
  );
}

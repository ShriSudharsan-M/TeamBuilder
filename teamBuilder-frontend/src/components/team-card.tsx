import { Link } from "@tanstack/react-router";
import { ArrowUpRight, Users, Crown } from "lucide-react";
import type { Team } from "@/lib/api";
import { SkillChip } from "./skill-chip";

export function TeamCard({ team }: { team: Team }) {
  const skills = team.requiredSkills ?? [];
  return (
    <Link
      to="/teams/$teamId"
      params={{ teamId: String(team.id) }}
      className="group relative flex flex-col gap-4 rounded-lg border border-outline-variant bg-surface-container/60 p-6 transition hover:border-[oklch(0.68_0.32_328/0.6)] hover:bg-surface-container"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-label-sm text-on-surface-variant">Squad</div>
          <h3 className="mt-1 truncate text-headline-md text-on-surface">{team.name}</h3>
        </div>
        <ArrowUpRight className="h-5 w-5 shrink-0 text-on-surface-variant transition group-hover:text-magenta" />
      </div>

      {team.mission && (
        <p className="line-clamp-2 text-sm text-on-surface-variant/80">{team.mission}</p>
      )}

      {skills.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {skills.slice(0, 4).map((s) => (
            <SkillChip key={String(s.id)} label={s.name} variant="required" />
          ))}
          {skills.length > 4 && (
            <span className="text-xs text-on-surface-variant">+{skills.length - 4}</span>
          )}
        </div>
      )}

      <div className="mt-auto flex items-center justify-between border-t border-outline-variant/60 pt-4 text-xs text-on-surface-variant">
        <span className="inline-flex items-center gap-1.5">
          <Crown className="h-3.5 w-3.5 text-[oklch(0.81_0.13_200)]" />
          {team.leaderName ?? `Leader #${team.leaderId}`}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Users className="h-3.5 w-3.5" />
          {team.vacancies ?? 0} open
        </span>
      </div>
    </Link>
  );
}

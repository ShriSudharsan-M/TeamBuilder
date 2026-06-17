import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Ban,
  Check,
  Crown,
  LogOut,
  Plus,
  Save,
  Trash2,
  Users,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { SkillChip } from "@/components/skill-chip";
import { api, ApiError, type Team } from "@/lib/api";
import { useAuthStore } from "@/lib/auth-store";

export const Route = createFileRoute("/_authenticated/teams/$teamId")({
  component: TeamDetail,
});

type LocalStatus = "pending" | "accepted" | "rejected" | undefined;

const statusKey = (teamId: string | number, userId?: string | number) =>
  userId ? `team-builder-member-status:${teamId}:${userId}` : "";

function TeamDetail() {
  const { teamId } = Route.useParams();
  const user = useAuthStore((s) => s.user);
  const qc = useQueryClient();
  const [localStatus, setLocalStatus] = useState<LocalStatus>();

  const teamQ = useQuery({
    queryKey: ["teams", teamId],
    queryFn: () => api.teams.get(teamId),
  });

  useEffect(() => {
    const key = statusKey(teamId, user?.id);
    if (!key || typeof window === "undefined") return;
    const stored = window.localStorage.getItem(key) as LocalStatus | null;
    setLocalStatus(stored ?? undefined);
  }, [teamId, user?.id]);

  const rememberStatus = (status: LocalStatus) => {
    const key = statusKey(teamId, user?.id);
    if (!key || typeof window === "undefined") return;
    if (status) window.localStorage.setItem(key, status);
    else window.localStorage.removeItem(key);
    setLocalStatus(status);
  };

  const team = teamQ.data;
  const isLeader = !!user && !!team && String(user.id) === String(team.leaderId);

  const requestM = useMutation({
    mutationFn: () => api.members.request(teamId),
    onSuccess: (message) => {
      toast.success(message || "Join request sent.");
      rememberStatus("pending");
      qc.invalidateQueries({ queryKey: ["teams", teamId] });
      qc.invalidateQueries({ queryKey: ["teams"] });
    },
    onError: (e) =>
      toast.error(e instanceof ApiError ? e.message : "Request failed"),
  });

  const cancelM = useMutation({
    mutationFn: () => api.members.cancel(teamId),
    onSuccess: (message) => {
      toast.success(message || "Request cancelled.");
      rememberStatus(undefined);
      qc.invalidateQueries({ queryKey: ["teams", teamId] });
      qc.invalidateQueries({ queryKey: ["teams"] });
    },
    onError: (e) =>
      toast.error(e instanceof ApiError ? e.message : "Cancel failed"),
  });

  const leaveM = useMutation({
    mutationFn: () => api.members.leave(teamId),
    onSuccess: (message) => {
      toast.success(message || "Left team.");
      rememberStatus(undefined);
      qc.invalidateQueries({ queryKey: ["teams", teamId] });
      qc.invalidateQueries({ queryKey: ["teams"] });
    },
    onError: (e) =>
      toast.error(e instanceof ApiError ? e.message : "Leave failed"),
  });

  if (teamQ.isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-32 animate-pulse rounded bg-surface-container" />
        <div className="h-64 animate-pulse rounded-lg bg-surface-container/40" />
      </div>
    );
  }

  if (teamQ.isError || !team) {
    return (
      <div className="rounded-lg border border-outline-variant bg-surface-container/40 p-8 text-center">
        <p className="text-sm text-on-surface-variant">Team not found.</p>
        <Link to="/teams" className="mt-4 inline-block text-sm text-magenta hover:underline">
          Back to browse
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <Link
        to="/teams"
        className="inline-flex items-center gap-1.5 text-sm text-on-surface-variant hover:text-on-surface"
      >
        <ArrowLeft className="h-4 w-4" /> All teams
      </Link>

      <header className="rounded-lg border border-outline-variant bg-surface-container/60 p-8 backdrop-blur">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="text-label-sm text-magenta">Squad</div>
            <h1 className="mt-2 text-headline-lg text-on-surface">{team.name}</h1>
            <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-on-surface-variant">
              <span className="inline-flex items-center gap-1.5">
                <Crown className="h-4 w-4 text-[oklch(0.81_0.13_200)]" />
                {team.leaderName ?? `Leader #${team.leaderId}`}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Users className="h-4 w-4" />
                {team.vacancies ?? 0} open seats
              </span>
            </div>
          </div>

          {!isLeader && (
            <JoinActions
              status={localStatus}
              onJoin={() => requestM.mutate()}
              onCancel={() => cancelM.mutate()}
              onLeave={() => leaveM.mutate()}
              loading={requestM.isPending || cancelM.isPending || leaveM.isPending}
            />
          )}
        </div>

        {team.mission && (
          <p className="mt-6 max-w-3xl text-base leading-relaxed text-on-surface/90">
            {team.mission}
          </p>
        )}
      </header>

      <section className="rounded-lg border border-outline-variant bg-surface-container/40 p-6">
        <div className="mb-3 text-section-header text-on-surface-variant">Required skills</div>
        {team.requiredSkills && team.requiredSkills.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {team.requiredSkills.map((s) => (
              <SkillChip key={String(s.id)} label={s.name} variant="required" />
            ))}
          </div>
        ) : (
          <p className="text-sm text-on-surface-variant">No skills declared.</p>
        )}
      </section>

      {isLeader && <LeaderConsole team={team} />}
    </div>
  );
}

function JoinActions({
  status,
  onJoin,
  onCancel,
  onLeave,
  loading,
}: {
  status: LocalStatus;
  onJoin: () => void;
  onCancel: () => void;
  onLeave: () => void;
  loading: boolean;
}) {
  if (status === "accepted") {
    return (
      <button
        onClick={onLeave}
        disabled={loading}
        className="inline-flex items-center gap-2 rounded-md border border-[oklch(0.81_0.13_200/0.6)] bg-[oklch(0.81_0.13_200/0.1)] px-4 py-2 text-sm font-medium text-[oklch(0.85_0.12_200)] disabled:opacity-60"
      >
        <LogOut className="h-4 w-4" />
        {loading ? "Leaving..." : "Leave team"}
      </button>
    );
  }
  if (status === "pending") {
    return (
      <button
        onClick={onCancel}
        disabled={loading}
        className="inline-flex items-center gap-2 rounded-md border border-outline-variant bg-surface-container-high px-4 py-2 text-sm font-medium text-on-surface-variant disabled:opacity-60"
      >
        <X className="h-4 w-4" />
        {loading ? "Cancelling..." : "Cancel request"}
      </button>
    );
  }
  if (status === "rejected") {
    return (
      <span className="rounded-md border border-[oklch(0.7_0.2_25/0.6)] bg-[oklch(0.7_0.2_25/0.1)] px-4 py-2 text-sm font-medium text-[oklch(0.85_0.15_25)]">
        Request rejected
      </span>
    );
  }
  return (
    <button
      onClick={onJoin}
      disabled={loading}
      className="rounded-md bg-magenta px-5 py-2 text-sm font-semibold text-black transition hover:brightness-110 disabled:opacity-60"
      style={{ boxShadow: "0 0 20px -4px oklch(0.68 0.32 328 / 0.5)" }}
    >
      {loading ? "Sending..." : "Request to join"}
    </button>
  );
}

function LeaderConsole({ team }: { team: Team }) {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [userIdInput, setUserIdInput] = useState("");
  const [name, setName] = useState(team.name);
  const [mission, setMission] = useState(team.mission ?? team.description ?? "");
  const [maxMembers, setMaxMembers] = useState(team.maxMembers ?? team.vacancies ?? 1);
  const [skillName, setSkillName] = useState("");
  const [requiredCount, setRequiredCount] = useState(1);

  const invalidateTeam = () => {
    qc.invalidateQueries({ queryKey: ["teams", String(team.id)] });
    qc.invalidateQueries({ queryKey: ["teams"] });
    qc.invalidateQueries({ queryKey: ["teams", "matched"] });
  };

  const updateTeam = useMutation({
    mutationFn: () =>
      api.teams.update(team.id, {
        name,
        mission,
        description: mission,
        maxMembers,
      }),
    onSuccess: () => {
      toast.success("Team updated.");
      invalidateTeam();
    },
    onError: (e) =>
      toast.error(e instanceof ApiError ? e.message : "Failed to update team"),
  });

  const deleteTeam = useMutation({
    mutationFn: () => api.teams.remove(team.id),
    onSuccess: (message) => {
      toast.success(message || "Team deleted.");
      qc.invalidateQueries({ queryKey: ["teams"] });
      qc.invalidateQueries({ queryKey: ["teams", "matched"] });
      navigate({ to: "/teams" });
    },
    onError: (e) =>
      toast.error(e instanceof ApiError ? e.message : "Failed to delete team"),
  });

  const addSkill = useMutation({
    mutationFn: () => api.teams.addSkill(team.id, skillName.trim(), requiredCount),
    onSuccess: (message) => {
      toast.success(message || "Skill added.");
      setSkillName("");
      setRequiredCount(1);
      invalidateTeam();
    },
    onError: (e) =>
      toast.error(e instanceof ApiError ? e.message : "Failed to add team skill"),
  });

  const accept = useMutation({
    mutationFn: (uid: string) => api.members.accept(team.id, uid),
    onSuccess: (message) => {
      toast.success(message || "Operator accepted.");
      invalidateTeam();
      setUserIdInput("");
    },
    onError: (e) =>
      toast.error(e instanceof ApiError ? e.message : "Failed to accept"),
  });

  const reject = useMutation({
    mutationFn: (uid: string) => api.members.reject(team.id, uid),
    onSuccess: (message) => {
      toast.success(message || "Request rejected.");
      invalidateTeam();
      setUserIdInput("");
    },
    onError: (e) =>
      toast.error(e instanceof ApiError ? e.message : "Failed to reject"),
  });

  return (
    <section className="rounded-lg border border-[oklch(0.68_0.32_328/0.4)] bg-surface-container/60 p-6 backdrop-blur">
      <div className="flex items-center gap-2 text-section-header text-magenta">
        <Crown className="h-3.5 w-3.5" /> Leader console
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          updateTeam.mutate();
        }}
        className="mt-6 grid gap-4 border-b border-outline-variant pb-6 md:grid-cols-[1fr_1fr_160px_auto]"
      >
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="rounded-md border border-outline-variant bg-surface-container-low px-4 py-2 text-sm text-on-surface outline-none focus:border-magenta"
          placeholder="Team name"
          required
        />
        <input
          value={mission}
          onChange={(e) => setMission(e.target.value)}
          className="rounded-md border border-outline-variant bg-surface-container-low px-4 py-2 text-sm text-on-surface outline-none focus:border-magenta"
          placeholder="Description"
          required
        />
        <input
          type="number"
          min={1}
          value={maxMembers}
          onChange={(e) => setMaxMembers(Number(e.target.value))}
          className="rounded-md border border-outline-variant bg-surface-container-low px-4 py-2 text-sm text-on-surface outline-none focus:border-magenta"
        />
        <button
          type="submit"
          disabled={updateTeam.isPending}
          className="inline-flex items-center justify-center gap-1.5 rounded-md bg-magenta px-4 py-2 text-sm font-semibold text-black transition hover:brightness-110 disabled:opacity-50"
        >
          <Save className="h-4 w-4" /> Save
        </button>
      </form>

      <div className="mt-6 space-y-3 border-b border-outline-variant pb-6">
        <div className="text-label-sm text-on-surface-variant">Add required skill</div>
        <div className="flex flex-wrap gap-2">
          <input
            value={skillName}
            onChange={(e) => setSkillName(e.target.value)}
            placeholder="Skill name"
            className="min-w-56 flex-1 rounded-md border border-outline-variant bg-surface-container-low px-4 py-2 text-sm text-on-surface outline-none focus:border-magenta"
          />
          <input
            type="number"
            min={1}
            value={requiredCount}
            onChange={(e) => setRequiredCount(Number(e.target.value))}
            className="w-28 rounded-md border border-outline-variant bg-surface-container-low px-4 py-2 text-sm text-on-surface outline-none focus:border-magenta"
            aria-label="Required count"
          />
          <button
            disabled={!skillName.trim() || addSkill.isPending}
            onClick={() => addSkill.mutate()}
            className="inline-flex items-center gap-1.5 rounded-md border border-[oklch(0.81_0.13_200/0.55)] px-4 py-2 text-sm font-medium text-[oklch(0.85_0.12_200)] transition hover:bg-[oklch(0.81_0.13_200/0.08)] disabled:opacity-50"
          >
            <Plus className="h-4 w-4" /> Add
          </button>
        </div>
        <p className="text-xs text-on-surface-variant/70">
          The backend returns team skills as names only, so removal is hidden until skill IDs are available.
        </p>
      </div>

      <div className="mt-6 space-y-3 border-b border-outline-variant pb-6">
        <div className="text-label-sm text-on-surface-variant">Handle join request</div>
        <div className="flex flex-wrap gap-2">
          <input
            value={userIdInput}
            onChange={(e) => setUserIdInput(e.target.value)}
            placeholder="Enter user ID"
            className="flex-1 rounded-md border border-outline-variant bg-surface-container-low px-4 py-2 text-sm text-on-surface outline-none focus:border-magenta"
          />
          <button
            disabled={!userIdInput || accept.isPending}
            onClick={() => accept.mutate(userIdInput)}
            className="inline-flex items-center gap-1.5 rounded-md bg-magenta px-4 py-2 text-sm font-semibold text-black transition hover:brightness-110 disabled:opacity-50"
          >
            <Check className="h-4 w-4" /> Accept
          </button>
          <button
            disabled={!userIdInput || reject.isPending}
            onClick={() => reject.mutate(userIdInput)}
            className="inline-flex items-center gap-1.5 rounded-md border border-outline-variant px-4 py-2 text-sm font-medium text-on-surface-variant transition hover:bg-surface-container-high disabled:opacity-50"
          >
            <Ban className="h-4 w-4" /> Reject
          </button>
        </div>
        <p className="text-xs text-on-surface-variant/70">
          The API exposes accept/reject per user ID, but does not expose a pending-request list.
        </p>
      </div>

      <div className="mt-6 flex justify-end">
        <button
          onClick={() => {
            if (window.confirm("Delete this team?")) deleteTeam.mutate();
          }}
          disabled={deleteTeam.isPending}
          className="inline-flex items-center gap-2 rounded-md border border-[oklch(0.7_0.2_25/0.5)] px-4 py-2 text-sm font-medium text-[oklch(0.85_0.15_25)] transition hover:bg-[oklch(0.7_0.2_25/0.1)] disabled:opacity-50"
        >
          <Trash2 className="h-4 w-4" />
          {deleteTeam.isPending ? "Deleting..." : "Delete team"}
        </button>
      </div>
    </section>
  );
}

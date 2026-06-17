import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { Plus, X } from "lucide-react";
import { toast } from "sonner";
import { TopBar } from "@/components/top-bar";
import { SkillChip } from "@/components/skill-chip";
import { api, ApiError } from "@/lib/api";

export const Route = createFileRoute("/_authenticated/teams/create")({
  component: CreateTeam,
});

function CreateTeam() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [mission, setMission] = useState("");
  const [vacancies, setVacancies] = useState(3);
  const [skillInput, setSkillInput] = useState("");
  const [skills, setSkills] = useState<string[]>([]);

  const createM = useMutation({
    mutationFn: api.teams.create,
    onSuccess: (team) => {
      toast.success("Squad initialized.");
      navigate({ to: "/teams/$teamId", params: { teamId: String(team.id) } });
    },
    onError: (e) =>
      toast.error(e instanceof ApiError ? e.message : "Failed to create team"),
  });

  const addSkill = () => {
    const v = skillInput.trim();
    if (!v) return;
    if (skills.includes(v)) {
      setSkillInput("");
      return;
    }
    setSkills([...skills, v]);
    setSkillInput("");
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createM.mutate({ name, mission, vacancies, requiredSkills: skills });
  };

  return (
    <div className="space-y-8">
      <TopBar
        eyebrow="New formation"
        title="Create Team"
        description="Declare your mission, the required skills, and the open seats."
      />

      <form
        onSubmit={onSubmit}
        className="space-y-6 rounded-lg border border-outline-variant bg-surface-container/60 p-6 backdrop-blur"
      >
        <Field label="Team name">
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="input"
            placeholder="e.g. Project Aurora"
          />
        </Field>
        <Field label="Mission">
          <textarea
            value={mission}
            onChange={(e) => setMission(e.target.value)}
            rows={4}
            className="input resize-y"
            placeholder="What is this squad shipping?"
          />
        </Field>
        <Field label="Open seats">
          <input
            type="number"
            min={1}
            max={50}
            value={vacancies}
            onChange={(e) => setVacancies(Number(e.target.value))}
            className="input max-w-[160px]"
          />
        </Field>

        <Field label="Required skills">
          <div className="flex gap-2">
            <input
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addSkill();
                }
              }}
              className="input"
              placeholder="Add a skill and press Enter"
            />
            <button
              type="button"
              onClick={addSkill}
              className="rounded-md border border-[oklch(0.81_0.13_200/0.55)] px-4 text-sm font-medium text-[oklch(0.85_0.12_200)] transition hover:bg-[oklch(0.81_0.13_200/0.08)]"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
          {skills.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {skills.map((s) => (
                <SkillChip
                  key={s}
                  label={s}
                  variant="required"
                  onRemove={() => setSkills(skills.filter((x) => x !== s))}
                />
              ))}
            </div>
          )}
        </Field>

        <div className="flex justify-end gap-2 border-t border-outline-variant pt-6">
          <button
            type="button"
            onClick={() => navigate({ to: "/teams" })}
            className="rounded-md border border-outline-variant px-4 py-2 text-sm font-medium text-on-surface-variant hover:bg-surface-container-high"
          >
            <X className="-ml-1 mr-1 inline h-4 w-4" />
            Cancel
          </button>
          <button
            type="submit"
            disabled={createM.isPending}
            className="rounded-md bg-magenta px-5 py-2 text-sm font-semibold text-black transition hover:brightness-110 disabled:opacity-60"
            style={{ boxShadow: "0 0 20px -4px oklch(0.68 0.32 328 / 0.5)" }}
          >
            {createM.isPending ? "Initializing…" : "Create team"}
          </button>
        </div>
      </form>

      <style>{`
        .input {
          width: 100%;
          background: var(--surface-container-low);
          border: 1px solid var(--outline-variant);
          border-radius: 0.5rem;
          padding: 0.625rem 0.875rem;
          color: var(--on-surface);
          font-size: 0.875rem;
          outline: none;
          transition: border-color .15s, box-shadow .15s;
        }
        .input:focus {
          border-color: var(--magenta);
          box-shadow: 0 0 0 3px oklch(0.68 0.32 328 / 0.15);
        }
      `}</style>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-label-sm text-on-surface-variant">{label}</span>
      <div className="mt-2">{children}</div>
    </label>
  );
}

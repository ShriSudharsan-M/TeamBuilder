import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Hexagon, Pencil, Plus, X } from "lucide-react";
import { toast } from "sonner";
import { TopBar } from "@/components/top-bar";
import { SkillChip } from "@/components/skill-chip";
import { api, ApiError } from "@/lib/api";

export const Route = createFileRoute("/_authenticated/skills")({
  component: SkillsPage,
});

function SkillsPage() {
  const qc = useQueryClient();
  const [value, setValue] = useState("");
  const [editing, setEditing] = useState<{ id: string | number; name: string } | null>(null);

  const skillsQ = useQuery({ queryKey: ["skills"], queryFn: api.skills.list });

  const addM = useMutation({
    mutationFn: (name: string) => api.skills.add(name),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["skills"] });
      qc.invalidateQueries({ queryKey: ["teams", "matched"] });
      toast.success("Skill added.");
      setValue("");
    },
    onError: (e) =>
      toast.error(e instanceof ApiError ? e.message : "Failed to add skill"),
  });

  const updateM = useMutation({
    mutationFn: ({ id, name }: { id: string | number; name: string }) =>
      api.skills.update(id, name),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["skills"] });
      qc.invalidateQueries({ queryKey: ["teams", "matched"] });
      toast.success("Skill updated.");
      setEditing(null);
      setValue("");
    },
    onError: (e) =>
      toast.error(e instanceof ApiError ? e.message : "Failed to update skill"),
  });

  const removeM = useMutation({
    mutationFn: (id: string | number) => api.skills.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["skills"] });
      qc.invalidateQueries({ queryKey: ["teams", "matched"] });
      toast.success("Skill removed.");
    },
    onError: (e) =>
      toast.error(e instanceof ApiError ? e.message : "Failed to remove"),
  });

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const name = value.trim();
    if (!name) return;
    if (editing) {
      updateM.mutate({ id: editing.id, name });
      return;
    }
    addM.mutate(name);
  };

  return (
    <div className="space-y-8">
      <TopBar
        eyebrow="Skill graph"
        title="My Skills"
        description="Add the capabilities you bring. Matching is exact, so name skills precisely."
      />

      <form
        onSubmit={onSubmit}
        className="flex flex-col gap-3 rounded-lg border border-outline-variant bg-surface-container/60 p-4 backdrop-blur sm:flex-row"
      >
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="e.g. TypeScript, Rust, Product Design"
          className="flex-1 rounded-md border border-outline-variant bg-surface-container-low px-4 py-2.5 text-sm text-on-surface outline-none transition focus:border-magenta"
        />
        {editing && (
          <button
            type="button"
            onClick={() => {
              setEditing(null);
              setValue("");
            }}
            className="inline-flex items-center justify-center gap-2 rounded-md border border-outline-variant px-4 py-2.5 text-sm font-medium text-on-surface-variant transition hover:bg-surface-container-high"
          >
            <X className="h-4 w-4" />
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={addM.isPending || updateM.isPending}
          className="inline-flex items-center justify-center gap-2 rounded-md bg-magenta px-5 py-2.5 text-sm font-semibold text-black transition hover:brightness-110 disabled:opacity-60"
        >
          <Plus className="h-4 w-4" />
          {editing
            ? updateM.isPending
              ? "Saving..."
              : "Update skill"
            : addM.isPending
              ? "Adding..."
              : "Add skill"}
        </button>
      </form>

      <section className="rounded-lg border border-outline-variant bg-surface-container/40 p-6">
        <div className="mb-4 text-section-header text-on-surface-variant">
          Mapped skills ({skillsQ.data?.length ?? 0})
        </div>

        {skillsQ.isLoading ? (
          <div className="flex flex-wrap gap-2">
            {[0, 1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-7 w-24 animate-pulse rounded-full bg-surface-container-high"
              />
            ))}
          </div>
        ) : !skillsQ.data || skillsQ.data.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-10 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[oklch(0.81_0.13_200/0.12)] text-[oklch(0.85_0.12_200)]">
              <Hexagon className="h-5 w-5" />
            </div>
            <p className="text-sm text-on-surface-variant">
              No skills yet. Add one above to start matching.
            </p>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {skillsQ.data.map((s) => (
              <span key={String(s.id)} className="inline-flex items-center gap-1">
                <SkillChip
                  label={s.name}
                  variant="personal"
                  onRemove={() => removeM.mutate(s.id)}
                />
                <button
                  type="button"
                  onClick={() => {
                    setEditing({ id: s.id, name: s.name });
                    setValue(s.name);
                  }}
                  className="rounded-full border border-outline-variant p-1.5 text-on-surface-variant transition hover:border-magenta hover:text-magenta"
                  aria-label={`Edit ${s.name}`}
                >
                  <Pencil className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

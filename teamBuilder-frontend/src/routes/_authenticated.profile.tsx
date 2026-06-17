import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { LogOut, Save } from "lucide-react";
import { toast } from "sonner";
import { TopBar } from "@/components/top-bar";
import { api, ApiError } from "@/lib/api";
import { useAuthStore } from "@/lib/auth-store";

export const Route = createFileRoute("/_authenticated/profile")({
  component: ProfilePage,
});

function ProfilePage() {
  const navigate = useNavigate();
  const { user, setUser, logout } = useAuthStore();
  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");

  const updateM = useMutation({
    mutationFn: () => {
      if (!user) throw new Error("Not authenticated");
      return api.users.update(user.id, { name, email });
    },
    onSuccess: (u) => {
      setUser({ id: u.id, name: u.name, email: u.email });
      toast.success("Profile updated.");
    },
    onError: (e) =>
      toast.error(e instanceof ApiError ? e.message : "Update failed"),
  });

  const handleLogout = () => {
    logout();
    navigate({ to: "/auth/login" });
  };

  return (
    <div className="space-y-8">
      <TopBar
        eyebrow="Operator profile"
        title="Your identity"
        description="Update your handle and contact channel."
      />

      <form
        onSubmit={(e) => {
          e.preventDefault();
          updateM.mutate();
        }}
        className="space-y-5 rounded-lg border border-outline-variant bg-surface-container/60 p-6 backdrop-blur"
      >
        <Field label="Name">
          <input value={name} onChange={(e) => setName(e.target.value)} className="input" />
        </Field>
        <Field label="Email">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input"
          />
        </Field>
        <Field label="User ID">
          <input
            value={String(user?.id ?? "")}
            readOnly
            className="input opacity-60"
          />
        </Field>

        <div className="flex justify-end border-t border-outline-variant pt-6">
          <button
            type="submit"
            disabled={updateM.isPending}
            className="inline-flex items-center gap-2 rounded-md bg-magenta px-5 py-2 text-sm font-semibold text-black transition hover:brightness-110 disabled:opacity-60"
          >
            <Save className="h-4 w-4" />
            {updateM.isPending ? "Saving…" : "Save changes"}
          </button>
        </div>
      </form>

      <div className="flex justify-end">
        <button
          onClick={handleLogout}
          className="inline-flex items-center gap-2 rounded-md border border-outline-variant px-4 py-2 text-sm text-on-surface-variant transition hover:bg-surface-container-high hover:text-magenta"
        >
          <LogOut className="h-4 w-4" /> Log out
        </button>
      </div>

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

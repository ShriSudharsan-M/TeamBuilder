import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { api, ApiError } from "@/lib/api";
import { useAuthStore } from "@/lib/auth-store";

export const Route = createFileRoute("/auth/login")({
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { token, user } = await api.auth.login({ email, password });
      setAuth(token, user);
      toast.success("Welcome back.");
      navigate({ to: "/dashboard" });
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : "Login failed";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-1 flex-col justify-center">
      <div className="text-label-sm text-magenta">Sign in</div>
      <h1 className="mt-3 text-headline-lg text-on-surface">Re-enter the console.</h1>
      <p className="mt-2 text-sm text-on-surface-variant">
        Resume your formations and pending matches.
      </p>

      <form onSubmit={onSubmit} className="mt-10 space-y-5">
        <Field label="Email">
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input-base"
          />
        </Field>
        <Field label="Password">
          <input
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input-base"
          />
        </Field>
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-magenta py-3 text-sm font-semibold text-black transition hover:brightness-110 disabled:opacity-60"
          style={{ boxShadow: "0 0 24px -4px oklch(0.68 0.32 328 / 0.5)" }}
        >
          {loading ? "Authenticating…" : "Sign in"}
        </button>
      </form>

      <p className="mt-8 text-sm text-on-surface-variant">
        New operator?{" "}
        <Link to="/auth/register" className="font-medium text-magenta hover:underline">
          Create an account
        </Link>
      </p>

      <style>{`
        .input-base {
          width: 100%;
          background: var(--surface-container-low);
          border: 1px solid var(--outline-variant);
          border-radius: 0.5rem;
          padding: 0.75rem 1rem;
          color: var(--on-surface);
          font-size: 0.875rem;
          outline: none;
          transition: border-color 0.15s, box-shadow 0.15s;
        }
        .input-base:focus {
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

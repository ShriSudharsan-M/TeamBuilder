import type { LucideIcon } from "lucide-react";

interface Props {
  label: string;
  value: number | string;
  icon: LucideIcon;
  accent?: "magenta" | "violet" | "cyan";
}

export function StatCard({ label, value, icon: Icon, accent = "magenta" }: Props) {
  const tint = {
    magenta: "bg-[oklch(0.68_0.32_328/0.12)] text-[oklch(0.83_0.13_335)]",
    violet: "bg-[oklch(0.55_0.3_300/0.15)] text-[oklch(0.81_0.12_300)]",
    cyan: "bg-[oklch(0.81_0.13_200/0.12)] text-[oklch(0.85_0.12_200)]",
  }[accent];

  return (
    <div className="relative overflow-hidden rounded-lg border border-outline-variant bg-surface-container/70 p-6 backdrop-blur">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-label-sm text-on-surface-variant">{label}</div>
          <div className="mt-3 text-4xl font-bold tracking-tight text-on-surface">{value}</div>
        </div>
        <div className={`flex h-10 w-10 items-center justify-center rounded-md ${tint}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

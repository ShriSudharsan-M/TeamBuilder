import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  label: string;
  variant?: "personal" | "required" | "neutral";
  onRemove?: () => void;
  className?: string;
}

export function SkillChip({ label, variant = "neutral", onRemove, className }: Props) {
  const styles = {
    personal:
      "border-[oklch(0.81_0.13_200/0.6)] bg-[oklch(0.81_0.13_200/0.1)] text-[oklch(0.88_0.1_200)]",
    required:
      "border-[oklch(0.68_0.32_328/0.55)] bg-[oklch(0.68_0.32_328/0.1)] text-[oklch(0.88_0.18_335)]",
    neutral: "border-outline-variant bg-surface-container-low text-on-surface-variant",
  }[variant];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium tracking-wide",
        styles,
        className,
      )}
    >
      {label}
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="-mr-1 rounded-full p-0.5 transition hover:bg-white/10"
          aria-label={`Remove ${label}`}
        >
          <X className="h-3 w-3" />
        </button>
      )}
    </span>
  );
}

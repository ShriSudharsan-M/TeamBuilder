interface Props {
  className?: string;
  variant?: "hero" | "ambient";
}

export function LuminousArcs({ className = "", variant = "hero" }: Props) {
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
    >
      {variant === "hero" ? (
        <>
          <div className="absolute -top-40 -left-40 h-[480px] w-[480px] rounded-full bg-[oklch(0.55_0.3_300/0.45)] blur-[120px]" />
          <div className="absolute -top-20 right-[-10%] h-[520px] w-[520px] rounded-full bg-[oklch(0.68_0.32_328/0.4)] blur-[140px]" />
          <div className="absolute bottom-[-20%] left-1/3 h-[420px] w-[420px] rounded-full bg-[oklch(0.81_0.13_200/0.18)] blur-[120px]" />
        </>
      ) : (
        <>
          <div className="absolute -top-60 right-[-20%] h-[600px] w-[600px] rounded-full bg-[oklch(0.55_0.3_300/0.18)] blur-[160px]" />
          <div className="absolute bottom-[-30%] left-[-10%] h-[520px] w-[520px] rounded-full bg-[oklch(0.68_0.32_328/0.14)] blur-[160px]" />
        </>
      )}
    </div>
  );
}

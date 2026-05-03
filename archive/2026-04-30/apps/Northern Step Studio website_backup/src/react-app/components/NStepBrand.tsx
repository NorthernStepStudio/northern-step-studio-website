import { BRAND_ASSETS } from "@/react-app/lib/site";

type NStepBrandProps = {
  className?: string;
  markClassName?: string;
  wordmarkClassName?: string;
  subtitle?: string;
  subtitleClassName?: string;
  showWordmark?: boolean;
  wordmark?: string;
};

export default function NStepBrand({
  className = "",
  markClassName = "",
  wordmarkClassName = "",
  subtitle,
  subtitleClassName = "",
  showWordmark = true,
  wordmark = "NStep",
}: NStepBrandProps) {
  const accessibleLabel = subtitle ? `${wordmark} ${subtitle}` : wordmark;

  return (
    <span
      className={`inline-flex min-w-0 items-center gap-3 ${className}`.trim()}
      role={showWordmark ? undefined : "img"}
      aria-label={showWordmark ? undefined : accessibleLabel}
    >
      <span
        className={`flex shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border bg-background/80 shadow-[0_8px_24px_rgba(15,23,42,0.08)] ${markClassName}`.trim()}
      >
        <img src={BRAND_ASSETS.studioMark} alt="" className="h-full w-full object-contain" />
      </span>
      {showWordmark && (
        <span className="min-w-0 leading-tight">
          {subtitle && (
            <span
              className={`block text-[10px] font-black uppercase tracking-[0.24em] text-muted-foreground ${subtitleClassName}`.trim()}
            >
              {subtitle}
            </span>
          )}
          <span
            className={`block truncate font-black uppercase tracking-[0.24em] text-foreground ${wordmarkClassName}`.trim()}
          >
            {wordmark}
          </span>
        </span>
      )}
    </span>
  );
}

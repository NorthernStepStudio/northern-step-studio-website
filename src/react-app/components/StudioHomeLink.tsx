import { Link } from "react-router";
import { BRAND_ASSETS } from "@/react-app/lib/site";

type StudioHomeLinkProps = {
  className?: string;
};

export default function StudioHomeLink({ className = "" }: StudioHomeLinkProps) {
  return (
    <Link
      to="/"
      className={`inline-flex items-center gap-3 rounded-full border border-border bg-background/70 px-3 py-2 backdrop-blur-sm transition-colors hover:border-accent/40 hover:bg-accent/5 ${className}`.trim()}
      aria-label="Go to Northern Step Studio home"
    >
      <img src={BRAND_ASSETS.studioMark} alt="Northern Step Studio" className="h-9 w-9 rounded-xl" />
      <span className="text-left leading-tight">
        <span className="block text-[10px] font-black uppercase tracking-[0.24em] text-accent">Home</span>
        <span className="block text-sm font-black uppercase tracking-wider text-foreground">
          Northern Step Studio
        </span>
      </span>
    </Link>
  );
}

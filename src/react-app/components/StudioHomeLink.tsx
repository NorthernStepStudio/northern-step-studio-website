import { Link } from "react-router";
import NStepBrand from "./NStepBrand";

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
      <NStepBrand subtitle="Home" markClassName="h-9 w-9" wordmarkClassName="text-sm" />
    </Link>
  );
}

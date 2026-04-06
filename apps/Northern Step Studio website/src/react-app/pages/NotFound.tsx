import { Link } from "react-router";
import { ArrowLeft, Compass } from "lucide-react";
import SEO from "@/react-app/components/SEO";

export default function NotFound() {
  return (
    <div className="min-h-screen pt-24 px-4 sm:px-6 pb-16">
      <SEO title="Page Not Found" description="The page you tried to open does not exist on Northern Step Studio." noindex />

      <div className="container mx-auto max-w-3xl">
        <div className="card-dark-wise text-center py-16">
          <div className="w-16 h-16 rounded-3xl bg-accent/10 flex items-center justify-center mx-auto mb-6">
            <Compass className="w-8 h-8 text-accent" />
          </div>
          <p className="text-xs font-black uppercase tracking-wider text-accent mb-3">404</p>
          <h1 className="text-3xl font-black uppercase tracking-tight mb-4">Page Not Found</h1>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto">
            This route is not published or was replaced with a newer page.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link to="/" className="btn-pill-primary inline-flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back Home
            </Link>
            <Link to="/docs" className="btn-pill-ghost">
              Browse Docs
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

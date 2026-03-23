import { Suspense, lazy } from "react";
import SEO from "@/react-app/components/SEO";

// Lazy load the NexusBuild app to keep the main bundle light
// @ts-ignore - JSX import from external directory
const NexusBuildApp = lazy(() => import("@nexusbuild/NexusBuildApp"));

export default function NexusBuildPage() {

  return (
    <div className="nexusbuild-integration-wrapper min-h-screen pt-20">
      <SEO
        title="NexusBuild | Performance PC Builder"
        description="Build your dream PC with real-time pricing and compatibility checks."
        canonicalUrl="/apps/nexusbuild/app"
      />
      
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
        </div>
      }>
        <NexusBuildApp />
      </Suspense>
    </div>
  );
}


import SEO from "@/react-app/components/SEO";

// Use iframe for the deployed NexusBuild app since the codebase is now in a separate Vercel project
const NEXUSBUILD_URL = import.meta.env.VITE_NEXUSBUILD_URL || "https://nexusbuild-web.vercel.app";

export default function NexusBuildPage() {

  return (
    <div className="nexusbuild-integration-wrapper min-h-screen pt-20 flex flex-col">
      <SEO
        title="NexusBuild | Performance PC Builder"
        description="Build your dream PC with real-time pricing and compatibility checks."
        canonicalUrl="/apps/nexusbuild/app"
      />
      
      <div className="flex-1 w-full bg-nexus-base h-[calc(100vh-80px)]">
        <iframe 
          src={NEXUSBUILD_URL}
          className="w-full h-full border-0"
          title="NexusBuild Application"
          allow="clipboard-write; camera; microphone"
        />
      </div>

    </div>
  );
}

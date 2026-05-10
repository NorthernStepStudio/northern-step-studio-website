export type AppType = "web" | "mobile" | "service" | "game" | "tool";
export type DeploymentTarget = "cloudflare-workers" | "vercel" | "expo-eas" | "local-only" | "manual";

export interface StudioApp {
  id: string;
  displayName: string;
  type: AppType;
  repoPath: string;
  localUrl?: string;
  productionUrl?: string;
  buildCommand?: string;
  deployTarget: DeploymentTarget;
  healthCheckUrl?: string;
  statusSource: "http" | "bridge" | "file" | "manual";
  tags: string[];
  priority: number;
}

export const APP_REGISTRY: Record<string, StudioApp> = {
  neurormoves: {
    id: "neurormoves",
    displayName: "NeuroMoves",
    type: "mobile",
    repoPath: "apps/neurormoves",
    localUrl: "http://localhost:8081",
    deployTarget: "expo-eas",
    statusSource: "manual",
    tags: ["health", "rehab", "mobile"],
    priority: 1,
  },
  nexusbuild: {
    id: "nexusbuild",
    displayName: "NexusBuild",
    type: "web",
    repoPath: "apps/nexusbuild",
    localUrl: "http://localhost:3000",
    productionUrl: "https://nexusbuild.ai",
    buildCommand: "npm run build",
    deployTarget: "vercel",
    statusSource: "http",
    tags: ["construction", "platform"],
    priority: 1,
  },
  provly: {
    id: "provly",
    displayName: "ProvLy",
    type: "web",
    repoPath: "apps/provly",
    localUrl: "http://localhost:3001",
    productionUrl: "https://provly.com",
    deployTarget: "cloudflare-workers",
    statusSource: "http",
    tags: ["insurance", "inventory"],
    priority: 2,
  },
  synox: {
    id: "synox",
    displayName: "Synox Engine",
    type: "service",
    repoPath: "apps/NStep Synox",
    localUrl: "http://localhost:4000",
    deployTarget: "local-only",
    statusSource: "bridge",
    tags: ["ai", "engine", "backend"],
    priority: 1,
  },
  matterhorn: {
    id: "matterhorn",
    displayName: "Matterhorn Assistant",
    type: "service",
    repoPath: "apps/nstep-assistant-local-bridge",
    localUrl: "http://localhost:4001",
    deployTarget: "local-only",
    statusSource: "bridge",
    tags: ["ai", "assistant", "matterhorn"],
    priority: 1,
  },
  website: {
    id: "website",
    displayName: "Studio Website",
    type: "web",
    repoPath: "apps/Northern Step Studio website",
    productionUrl: "https://northernstep.studio",
    deployTarget: "cloudflare-workers",
    statusSource: "http",
    tags: ["corporate", "marketing"],
    priority: 3,
  },
  buildcenter: {
    id: "buildcenter",
    displayName: "Build Center",
    type: "tool",
    repoPath: "tools/android-build-center-ui",
    localUrl: "http://localhost:4112",
    deployTarget: "local-only",
    statusSource: "manual",
    tags: ["dev-ops", "build", "android"],
    priority: 2,
  },
  roguelike: {
    id: "roguelike",
    displayName: "Roguelike / Doomed",
    type: "game",
    repoPath: "apps/roguelike game",
    localUrl: "http://localhost:3002",
    deployTarget: "manual",
    statusSource: "manual",
    tags: ["gaming", "phaser", "roguelike"],
    priority: 4,
  },
};

export const ALL_APPS = Object.values(APP_REGISTRY).sort((a, b) => a.priority - b.priority);

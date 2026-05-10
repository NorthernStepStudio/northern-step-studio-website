import { APP_REGISTRY } from "./app-registry";

export interface DependencyNode {
  id: string;
  displayName: string;
  type: string;
  dependencies: string[];
  dependents: string[];
  riskLevel: "low" | "medium" | "high";
}

export interface DependencyTreeNode {
  id: string;
  displayName?: string;
  dependencies?: DependencyTreeNode[];
  circular?: boolean;
}

class ArchitectureMapService {
  private dependencyCache: Map<string, string[]> = new Map();

  constructor() {
    this.initializeDependencies();
  }

  private initializeDependencies() {
    // Hardcoded initial dependency map based on NStep architecture
    this.dependencyCache.set("neurormoves", ["synox"]);
    this.dependencyCache.set("nexusbuild", ["synox", "provly"]);
    this.dependencyCache.set("provly", ["synox"]);
    this.dependencyCache.set("synox", []);
    this.dependencyCache.set("matterhorn", ["synox"]);
    this.dependencyCache.set("website", []);
    this.dependencyCache.set("buildcenter", ["synox", "neurormoves"]);
    this.dependencyCache.set("roguelike", ["synox"]);
  }

  public getAppDependencies(appId: string): string[] {
    return this.dependencyCache.get(appId) || [];
  }

  public getAppDependents(appId: string): string[] {
    const dependents: string[] = [];
    this.dependencyCache.forEach((deps, id) => {
      if (deps.includes(appId)) {
        dependents.push(id);
      }
    });
    return dependents;
  }

  public getDependencyTree(appId: string, depth = 0, visited = new Set<string>()): DependencyTreeNode {
    if (visited.has(appId) || depth > 5) {
      return { id: appId, circular: true };
    }
    visited.add(appId);

    const app = APP_REGISTRY[appId as keyof typeof APP_REGISTRY];
    const deps = this.getAppDependencies(appId);

    return {
      id: appId,
      displayName: app?.displayName || appId,
      dependencies: deps.map((dependencyId) => this.getDependencyTree(dependencyId, depth + 1, new Set(visited))),
    };
  }

  public getCriticalImpactChain(appId: string): string[] {
    // Returns list of apps that would be affected if this app goes down
    const visited = new Set<string>();
    const stack = [appId];
    const impact: string[] = [];

    while (stack.length > 0) {
      const current = stack.pop()!;
      if (visited.has(current)) continue;
      visited.add(current);
      
      if (current !== appId) impact.push(current);
      
      const dependents = this.getAppDependents(current);
      stack.push(...dependents);
    }

    return impact;
  }

  public getSharedRiskIndicators(): { appId: string; risk: string }[] {
    const risks: { appId: string; risk: string }[] = [];
    
    // Logic to detect shared risks (e.g., too many apps depending on one service)
    const criticalNodes = ["synox"];
    criticalNodes.forEach(node => {
      const dependents = this.getAppDependents(node);
      if (dependents.length > 5) {
        risks.push({ appId: node, risk: "High Dependency Pressure" });
      }
    });

    return risks;
  }
}

export const architectureMapService = new ArchitectureMapService();

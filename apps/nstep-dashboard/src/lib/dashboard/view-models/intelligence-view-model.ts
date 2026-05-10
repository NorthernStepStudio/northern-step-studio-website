import { OperationalPattern, patternAnalysisService } from "@/lib/studioos/pattern-analysis-service";
import { GraphNode, GraphEdge, knowledgeGraphService } from "@/lib/studioos/knowledge-graph-service";
import { APP_REGISTRY } from "@/lib/studioos/app-registry";
import { architectureMapService } from "@/lib/studioos/architecture-map-service";

type SharedRiskIndicator = {
  appId: string;
  risk: string;
};

type StabilityForecast = {
  appId: string;
  score: number;
  trend: "up" | "down" | "stable";
};

export interface IntelligenceViewModel {
  graph: {
    nodeCount: number;
    edgeCount: number;
    nodes: Array<{ id: string; label: string; type: string }>;
    criticalEdges: Array<{ id: string; sourceLabel: string; targetLabel: string }>;
  };
  patterns: Array<{
    id: string;
    title: string;
    description: string;
    type: string;
    confidenceLabel: string;
    severityTone: "danger" | "warning";
    occurrenceCount: number;
    lastDetected: string;
  }>;
  risks: Array<{
    appLabel: string;
    riskMessage: string;
  }>;
  forecasts: Array<{
    appId: string;
    appLabel: string;
    score: number;
    trend: "up" | "down" | "stable";
  }>;
  efficiency: {
    recoveryRate: string;
    avgWorkflowTime: string;
    topPerformer: string;
  };
}

export function buildIntelligenceViewModel(
  nodes: GraphNode[],
  edges: GraphEdge[],
  patterns: OperationalPattern[],
  sharedRisks: SharedRiskIndicator[],
  forecasts: StabilityForecast[]
): IntelligenceViewModel {
  return {
    graph: {
      nodeCount: nodes.length,
      edgeCount: edges.length,
      nodes: nodes.map(n => ({ id: n.id, label: n.label, type: n.type })),
      criticalEdges: edges
        .filter(e => e.type === 'DEPENDS_ON' && e.metadata?.critical)
        .map(e => ({
          id: e.id,
          sourceLabel: APP_REGISTRY[e.source as keyof typeof APP_REGISTRY]?.displayName || e.source,
          targetLabel: APP_REGISTRY[e.target as keyof typeof APP_REGISTRY]?.displayName || e.target
        }))
    },
    patterns: patterns.map(p => ({
      id: p.id,
      title: p.title,
      description: p.description,
      type: p.type.replace('_', ' ').toUpperCase(),
      confidenceLabel: `${Math.round(p.confidence * 100)}% Confidence`,
      severityTone: p.severity === 'high' ? 'danger' : 'warning',
      occurrenceCount: p.historicalCount,
      lastDetected: new Date(p.lastDetected).toLocaleDateString()
    })),
    risks: sharedRisks.map(r => ({
      appLabel: APP_REGISTRY[r.appId as keyof typeof APP_REGISTRY]?.displayName || r.appId.toUpperCase(),
      riskMessage: r.risk
    })),
    forecasts: forecasts.map(f => ({
      appId: f.appId,
      appLabel: APP_REGISTRY[f.appId as keyof typeof APP_REGISTRY]?.displayName || f.appId,
      score: f.score,
      trend: f.trend
    })),
    efficiency: {
      recoveryRate: "Pending verification",
      avgWorkflowTime: "Not yet connected",
      topPerformer: "Unknown"
    }
  };
}

export async function loadIntelligenceViewModel(): Promise<IntelligenceViewModel> {
  const [nodes, edges, patterns, sharedRisks, forecasts] = await Promise.all([
    Promise.resolve(knowledgeGraphService.getNodes()),
    Promise.resolve(knowledgeGraphService.getEdges()),
    Promise.resolve(patternAnalysisService.getActivePatterns()),
    Promise.resolve(architectureMapService.getSharedRiskIndicators()),
    Promise.resolve(patternAnalysisService.getStabilityForecast())
  ]);

  return buildIntelligenceViewModel(nodes, edges, patterns, sharedRisks, forecasts);
}

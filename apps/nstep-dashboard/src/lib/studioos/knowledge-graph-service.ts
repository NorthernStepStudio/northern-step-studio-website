import { telemetryService } from "./telemetry-service";

export type NodeType = 
  | "app" 
  | "repo" 
  | "deployment" 
  | "incident" 
  | "risk" 
  | "workflow" 
  | "snapshot" 
  | "protected_file"
  | "bridge";

export type EdgeType = 
  | "DEPENDS_ON" 
  | "MANAGES" 
  | "AFFECTS" 
  | "TRIGGERED_BY" 
  | "RESOLVED_BY" 
  | "CONTAINS" 
  | "DRIFTED_FROM"
  | "DEPLOYED_TO";

export interface GraphNode {
  id: string;
  type: NodeType;
  label: string;
  metadata?: Record<string, unknown>;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  type: EdgeType;
  metadata?: Record<string, unknown>;
}

class KnowledgeGraphService {
  private nodes: Map<string, GraphNode> = new Map();
  private edges: GraphEdge[] = [];

  constructor() {
    this.initializeBaseGraph();
  }

  private initializeBaseGraph() {
    // Basic structural relationships
    this.addNode({ id: "synox", type: "bridge", label: "Synox Bridge" });
    this.addNode({ id: "matterhorn", type: "app", label: "Matterhorn Assistant" });
    
    this.addEdge({
      id: "matterhorn-synox",
      source: "matterhorn",
      target: "synox",
      type: "DEPENDS_ON",
      metadata: { critical: true }
    });

    // App to Repo mappings (from registry)
    // In a real system, this would be populated dynamically
  }

  public addNode(node: GraphNode) {
    this.nodes.set(node.id, node);
  }

  public addEdge(edge: GraphEdge) {
    this.edges.push(edge);
  }

  public getNodes() {
    return Array.from(this.nodes.values());
  }

  public getEdges() {
    return this.edges;
  }

  public getOutgoingEdges(nodeId: string) {
    return this.edges.filter(e => e.source === nodeId);
  }

  public getIncomingEdges(nodeId: string) {
    return this.edges.filter(e => e.target === nodeId);
  }

  public getRelatedNodes(nodeId: string) {
    const outgoing = this.getOutgoingEdges(nodeId).map(e => ({ node: this.nodes.get(e.target), edge: e }));
    const incoming = this.getIncomingEdges(nodeId).map(e => ({ node: this.nodes.get(e.source), edge: e }));
    return [...outgoing, ...incoming];
  }

  public async findPath(startNodeId: string, endNodeId: string, maxDepth = 3): Promise<GraphEdge[][]> {
    return telemetryService.trace("graph.findPath", () => {
      // Simple path finding logic for small graph
      const paths: GraphEdge[][] = [];
      const traverse = (current: string, currentPath: GraphEdge[], depth: number) => {
        if (depth > maxDepth) return;
        if (current === endNodeId && currentPath.length > 0) {
          paths.push([...currentPath]);
          return;
        }
        
        const outgoing = this.getOutgoingEdges(current);
        for (const edge of outgoing) {
          if (!currentPath.find(e => e.id === edge.id)) {
            traverse(edge.target, [...currentPath, edge], depth + 1);
          }
        }
      };

      traverse(startNodeId, [], 0);
      return paths;
    });
  }
}

export const knowledgeGraphService = new KnowledgeGraphService();

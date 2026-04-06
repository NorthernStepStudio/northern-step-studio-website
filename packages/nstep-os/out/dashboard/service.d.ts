import type { RuntimeConfig, ProductKey, RuntimeStores } from "../core/types.js";
import type { Stage2RuntimeOrchestrator } from "../core/stage2-orchestrator.js";
import type { DashboardApprovalQueueResponse, DashboardJobDetailResponse, DashboardJobListResponse, DashboardLogFeedResponse, DashboardMemoryViewResponse, DashboardOverviewResponse, DashboardProductPanelResponse, DashboardQuery, DashboardWorkflowActivityResponse, DashboardSettingsResponse } from "./contracts.js";
export interface DashboardService {
    overview(query?: DashboardQuery): Promise<DashboardOverviewResponse>;
    jobs(query?: DashboardQuery): Promise<DashboardJobListResponse>;
    job(jobId: string, query?: DashboardQuery): Promise<DashboardJobDetailResponse | undefined>;
    approvals(query?: DashboardQuery): Promise<DashboardApprovalQueueResponse>;
    logs(query?: DashboardQuery): Promise<DashboardLogFeedResponse>;
    activity(query?: DashboardQuery): Promise<DashboardWorkflowActivityResponse>;
    memory(query?: DashboardQuery): Promise<DashboardMemoryViewResponse>;
    settings(query?: DashboardQuery): Promise<DashboardSettingsResponse>;
    panel(product: ProductKey, query?: DashboardQuery): Promise<DashboardProductPanelResponse>;
}
export declare function createDashboardService(stores: RuntimeStores, config: RuntimeConfig, orchestrator?: Stage2RuntimeOrchestrator): DashboardService;

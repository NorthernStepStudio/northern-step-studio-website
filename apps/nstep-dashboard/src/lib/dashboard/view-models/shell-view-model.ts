import { appHealthService } from "@/lib/studioos/app-health-service";
import { isLocalDevMode, getDashboardAuthModeLabel } from "@/lib/auth";

export interface ShellViewModel {
  localDevMode: boolean;
  backendConnected: boolean;
  authMode: "Local Dev" | "Production";
  synoxConnected: boolean;
  matterhornStatus: { online: boolean; provider: string; model: string };
  environment: string;
}

export async function loadShellViewModel(backendConnected: boolean): Promise<ShellViewModel> {
  try {
    const systemHealth = await appHealthService.getSystemHealth();
  
    return {
      localDevMode: isLocalDevMode(),
      backendConnected,
      authMode: getDashboardAuthModeLabel(),
      synoxConnected: systemHealth.synoxBridge.connected,
      matterhornStatus: systemHealth.matterhorn,
      environment: systemHealth.environment,
    };
  } catch {
    return {
      localDevMode: isLocalDevMode(),
      backendConnected,
      authMode: getDashboardAuthModeLabel(),
      synoxConnected: false,
      matterhornStatus: {
        online: false,
        provider: "Offline",
        model: "Not yet connected",
      },
      environment: process.env.NODE_ENV || "development",
    };
  }
}

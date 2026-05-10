import { PLATFORM_BUDGET } from "./platform-contracts";

export interface ServiceMetric {
  serviceName: string;
  latencyMs: number;
  memoryUsageMb?: number;
  timestamp: string;
}

class TelemetryService {
  private metrics: ServiceMetric[] = [];
  private thresholds = PLATFORM_BUDGET;

  track(metric: Omit<ServiceMetric, "timestamp">) {
    const entry = { ...metric, timestamp: new Date().toISOString() };
    this.metrics.push(entry);
    
    // Auto-pruning
    if (this.metrics.length > 1000) {
      this.metrics.shift();
    }

    // Check budget violations
    if (metric.latencyMs > 5000) {
      console.warn(`⚠️ [Telemetry] Performance Budget Violated: ${metric.serviceName} took ${metric.latencyMs}ms`);
    }
  }

  async trace<T>(name: string, fn: () => Promise<T> | T): Promise<T> {
    const start = Date.now();
    try {
      const result = await Promise.resolve(fn());
      const duration = Date.now() - start;
      console.debug(`⚡ [Telemetry] trace ${name} completed in ${duration}ms`);
      return result;
    } catch (err) {
      const duration = Date.now() - start;
      console.error(`⚡ [Telemetry] trace ${name} failed after ${duration}ms`, err);
      throw err;
    }
  }

  getMetrics(serviceName?: string): ServiceMetric[] {
    return serviceName 
      ? this.metrics.filter(m => m.serviceName === serviceName)
      : this.metrics;
  }

  getHealthSummary() {
    const services = Array.from(new Set(this.metrics.map(m => m.serviceName)));
    return services.map(name => {
      const serviceMetrics = this.metrics.filter(m => m.serviceName === name);
      const avgLatency = serviceMetrics.reduce((sum, m) => sum + m.latencyMs, 0) / serviceMetrics.length;
      return {
        name,
        avgLatency: avgLatency.toFixed(2),
        status: avgLatency > 2000 ? "degraded" : "healthy",
        lastCheck: serviceMetrics[serviceMetrics.length - 1]?.timestamp
      };
    });
  }
}

export const telemetryService = new TelemetryService();

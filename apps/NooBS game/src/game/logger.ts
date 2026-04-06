
export type LogLevel = "INFO" | "WARN" | "ERROR" | "SUCCESS";

export interface LogEntry {
    timestamp: number;
    level: LogLevel;
    message: string;
    context?: any;
}

class Logger {
    private logs: LogEntry[] = [];
    private maxLogs: number = 100;

    log(message: string, level: LogLevel = "INFO", context?: any) {
        const entry: LogEntry = {
            timestamp: Date.now(),
            level,
            message,
            context
        };

        this.logs.push(entry);
        if (this.logs.length > this.maxLogs) {
            this.logs.shift();
        }

        // Also output to console for the diagnostics terminal
        const prefix = `[${level}] ${new Date(entry.timestamp).toLocaleTimeString()}:`;
        switch (level) {
            case "ERROR":
                console.error(prefix, message, context || "");
                break;
            case "WARN":
                console.warn(prefix, message, context || "");
                break;
            case "SUCCESS":
                console.log(`%c${prefix} ${message}`, "color: #4ade80", context || "");
                break;
            default:
                console.log(prefix, message, context || "");
        }
    }

    info(message: string, context?: any) {
        this.log(message, "INFO", context);
    }

    warn(message: string, context?: any) {
        this.log(message, "WARN", context);
    }

    error(message: string, context?: any) {
        this.log(message, "ERROR", context);
    }

    success(message: string, context?: any) {
        this.log(message, "SUCCESS", context);
    }

    getLogs() {
        return [...this.logs];
    }
}

export const logger = new Logger();

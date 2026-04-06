import { createExecutionService } from "../executor/index.js";
import { createVerificationService } from "../verifier/index.js";
import { createMemoryService } from "../memory/index.js";
import { createReportingService } from "../reporting/index.js";
export function createRuntimeServices(input) {
    return {
        execution: createExecutionService({ logger: input.logger }),
        verification: createVerificationService({ logger: input.logger }),
        memory: createMemoryService(input.stores.memory, input.logger),
        reporting: createReportingService({ logger: input.logger }),
    };
}
//# sourceMappingURL=runtime-services.js.map
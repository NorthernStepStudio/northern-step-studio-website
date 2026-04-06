import type { DomainStore, LeadRecord } from "../../core/types.js";
export interface JsonDomainStoreOptions {
    readonly dataDir: string;
    readonly fileName?: string;
}
export declare function createJsonDomainStore(options: JsonDomainStoreOptions): Promise<DomainStore>;
export declare function seedLeadRecord(tenantId: string, phone: string, overrides?: Partial<LeadRecord>): LeadRecord;

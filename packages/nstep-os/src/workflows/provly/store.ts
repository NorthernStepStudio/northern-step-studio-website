import { randomUUID } from "node:crypto";
import path from "node:path";
import type { Pool } from "pg";
import type {
  ProvLyAnalysisReport,
  ProvLyAttachment,
  ProvLyClaimExport,
  ProvLyCompletenessSummary,
  ProvLyInventoryCategory,
  ProvLyInventoryItem,
  ProvLyReceipt,
  ProvLyRoom,
  ProvLyStore,
  ProvLyUserPreference,
} from "../../core/types.js";
import { ensureDirectory, readJsonFile, writeJsonFile } from "../../core/persistence.js";

interface ProvLyState {
  inventoryItems: ProvLyInventoryItem[];
  inventoryCategories: ProvLyInventoryCategory[];
  rooms: ProvLyRoom[];
  attachments: ProvLyAttachment[];
  receipts: ProvLyReceipt[];
  completenessChecks: ProvLyCompletenessSummary[];
  claimExports: ProvLyClaimExport[];
  analysisReports: ProvLyAnalysisReport[];
  userPreferences: ProvLyUserPreference[];
}

export interface JsonProvLyStoreOptions {
  readonly dataDir: string;
  readonly fileName?: string;
}

const TABLES = {
  inventoryItems: "nstep_provly_inventory_items",
  inventoryCategories: "nstep_provly_inventory_categories",
  rooms: "nstep_provly_rooms",
  attachments: "nstep_provly_attachments",
  receipts: "nstep_provly_receipts",
  completenessChecks: "nstep_provly_completeness_checks",
  claimExports: "nstep_provly_claim_exports",
  analysisReports: "nstep_provly_analysis_reports",
  userPreferences: "nstep_provly_user_preferences",
} as const;

export function createProvLyCaseId(): string {
  return `case_${randomUUID().slice(0, 8)}`;
}

function createEmptyState(): ProvLyState {
  return {
    inventoryItems: [],
    inventoryCategories: [],
    rooms: [],
    attachments: [],
    receipts: [],
    completenessChecks: [],
    claimExports: [],
    analysisReports: [],
    userPreferences: [],
  };
}

function upsertById<T>(items: readonly T[], next: T, getId: (item: T) => string): T[] {
  const index = items.findIndex((item) => getId(item) === getId(next));
  return index >= 0 ? [...items.slice(0, index), next, ...items.slice(index + 1)] : [...items, next];
}

function sortByTimestampDesc<T>(items: readonly T[], getTimestamp: (item: T) => string): T[] {
  return [...items].sort((left, right) => Date.parse(getTimestamp(right)) - Date.parse(getTimestamp(left)));
}

function loadState(filePath: string): Promise<ProvLyState> {
  return readJsonFile<ProvLyState>(filePath, createEmptyState());
}

function saveState(filePath: string, state: ProvLyState): Promise<void> {
  return writeJsonFile(filePath, state);
}

function filterByTenantAndCase<T extends { readonly tenantId: string; readonly caseId?: string }>(
  items: readonly T[],
  tenantId?: string,
  caseId?: string,
): T[] {
  return items.filter((item) => {
    if (tenantId && item.tenantId !== tenantId) {
      return false;
    }
    if (caseId && item.caseId !== caseId) {
      return false;
    }
    return true;
  });
}

function filterByTenant<T extends { readonly tenantId: string }>(items: readonly T[], tenantId?: string): T[] {
  if (!tenantId) {
    return [...items];
  }
  return items.filter((item) => item.tenantId === tenantId);
}

export async function createJsonProvLyStore(options: JsonProvLyStoreOptions): Promise<ProvLyStore> {
  const filePath = path.join(options.dataDir, options.fileName ?? "provly.json");
  await ensureDirectory(options.dataDir);

  return {
    async getInventoryItem(itemId) {
      const state = await loadState(filePath);
      return state.inventoryItems.find((item) => item.itemId === itemId);
    },
    async listInventoryItems(tenantId, caseId) {
      const state = await loadState(filePath);
      return sortByTimestampDesc(filterByTenantAndCase(state.inventoryItems, tenantId, caseId), (item) => item.updatedAt);
    },
    async upsertInventoryItem(item) {
      const state = await loadState(filePath);
      state.inventoryItems = upsertById(state.inventoryItems, item, (entry) => entry.itemId);
      await saveState(filePath, state);
      return item;
    },
    async listInventoryCategories(tenantId, caseId) {
      const state = await loadState(filePath);
      return sortByTimestampDesc(filterByTenantAndCase(state.inventoryCategories, tenantId, caseId), (item) => item.updatedAt);
    },
    async upsertInventoryCategory(category) {
      const state = await loadState(filePath);
      state.inventoryCategories = upsertById(state.inventoryCategories, category, (entry) => entry.categoryId);
      await saveState(filePath, state);
      return category;
    },
    async listRooms(tenantId, caseId) {
      const state = await loadState(filePath);
      return sortByTimestampDesc(filterByTenantAndCase(state.rooms, tenantId, caseId), (item) => item.updatedAt);
    },
    async upsertRoom(room) {
      const state = await loadState(filePath);
      state.rooms = upsertById(state.rooms, room, (entry) => entry.roomId);
      await saveState(filePath, state);
      return room;
    },
    async listAttachments(tenantId, caseId) {
      const state = await loadState(filePath);
      return sortByTimestampDesc(filterByTenantAndCase(state.attachments, tenantId, caseId), (item) => item.capturedAt);
    },
    async upsertAttachment(attachment) {
      const state = await loadState(filePath);
      state.attachments = upsertById(state.attachments, attachment, (entry) => entry.attachmentId);
      await saveState(filePath, state);
      return attachment;
    },
    async listReceipts(tenantId, caseId) {
      const state = await loadState(filePath);
      return sortByTimestampDesc(filterByTenantAndCase(state.receipts, tenantId, caseId), (item) => item.updatedAt);
    },
    async upsertReceipt(receipt) {
      const state = await loadState(filePath);
      state.receipts = upsertById(state.receipts, receipt, (entry) => entry.receiptId);
      await saveState(filePath, state);
      return receipt;
    },
    async listCompletenessChecks(tenantId, caseId) {
      const state = await loadState(filePath);
      return sortByTimestampDesc(filterByTenantAndCase(state.completenessChecks, tenantId, caseId), (item) => item.updatedAt);
    },
    async upsertCompletenessCheck(check) {
      const state = await loadState(filePath);
      state.completenessChecks = upsertById(state.completenessChecks, check, (entry) => entry.checkId);
      await saveState(filePath, state);
      return check;
    },
    async listClaimExports(tenantId, caseId) {
      const state = await loadState(filePath);
      return sortByTimestampDesc(filterByTenantAndCase(state.claimExports, tenantId, caseId), (item) => item.updatedAt);
    },
    async upsertClaimExport(exportRecord) {
      const state = await loadState(filePath);
      state.claimExports = upsertById(state.claimExports, exportRecord, (entry) => entry.exportId);
      await saveState(filePath, state);
      return exportRecord;
    },
    async listAnalysisReports(tenantId, caseId) {
      const state = await loadState(filePath);
      return sortByTimestampDesc(filterByTenantAndCase(state.analysisReports, tenantId, caseId), (item) => item.updatedAt);
    },
    async upsertAnalysisReport(report) {
      const state = await loadState(filePath);
      state.analysisReports = upsertById(state.analysisReports, report, (entry) => entry.reportId);
      await saveState(filePath, state);
      return report;
    },
    async listUserPreferences(tenantId) {
      const state = await loadState(filePath);
      return sortByTimestampDesc(filterByTenant(state.userPreferences, tenantId), (item) => item.updatedAt);
    },
    async upsertUserPreference(preference) {
      const state = await loadState(filePath);
      state.userPreferences = upsertById(state.userPreferences, preference, (entry) => entry.preferenceId);
      await saveState(filePath, state);
      return preference;
    },
  };
}

function tableFor<T extends { readonly tenantId: string; readonly caseId?: string }>(tableName: string, timestampColumn: string, hasCaseId = true) {
  return {
    async ensure(pool: Pool): Promise<void> {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS ${tableName} (
          id text PRIMARY KEY,
          tenant_id text NOT NULL,
          ${hasCaseId ? "case_id text," : ""}
          ${timestampColumn} timestamptz NOT NULL,
          data jsonb NOT NULL
        );
      `);
      await pool.query(`CREATE INDEX IF NOT EXISTS ${tableName}_tenant_${timestampColumn}_idx ON ${tableName} (tenant_id, ${timestampColumn} DESC);`);
      if (hasCaseId) {
        await pool.query(`CREATE INDEX IF NOT EXISTS ${tableName}_tenant_case_${timestampColumn}_idx ON ${tableName} (tenant_id, case_id, ${timestampColumn} DESC);`);
      }
    },
    async list(pool: Pool, tenantId?: string, caseId?: string): Promise<readonly T[]> {
      const conditions: string[] = [];
      const values: unknown[] = [];
      if (tenantId) {
        conditions.push(`tenant_id = $${values.length + 1}`);
        values.push(tenantId);
      }
      if (hasCaseId && caseId) {
        conditions.push(`case_id = $${values.length + 1}`);
        values.push(caseId);
      }
      const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
      const result = await pool.query(`SELECT data FROM ${tableName} ${where} ORDER BY ${timestampColumn} DESC`, values);
      return result.rows.map((row) => row.data as T);
    },
    async get(pool: Pool, id: string): Promise<T | undefined> {
      const result = await pool.query(`SELECT data FROM ${tableName} WHERE id = $1 LIMIT 1`, [id]);
      const row = result.rows[0] as { readonly data?: T } | undefined;
      return row?.data;
    },
    async upsert(pool: Pool, id: string, tenantId: string, timestamp: string, data: T, caseId?: string): Promise<T> {
      if (hasCaseId) {
        await pool.query(
          `
            INSERT INTO ${tableName} (id, tenant_id, case_id, ${timestampColumn}, data)
            VALUES ($1, $2, $3, $4, $5::jsonb)
            ON CONFLICT (id) DO UPDATE
            SET tenant_id = EXCLUDED.tenant_id,
                case_id = EXCLUDED.case_id,
                ${timestampColumn} = EXCLUDED.${timestampColumn},
                data = EXCLUDED.data
          `,
          [id, tenantId, caseId || null, timestamp, JSON.stringify(data)],
        );
      } else {
        await pool.query(
          `
            INSERT INTO ${tableName} (id, tenant_id, ${timestampColumn}, data)
            VALUES ($1, $2, $3, $4::jsonb)
            ON CONFLICT (id) DO UPDATE
            SET tenant_id = EXCLUDED.tenant_id,
                ${timestampColumn} = EXCLUDED.${timestampColumn},
                data = EXCLUDED.data
          `,
          [id, tenantId, timestamp, JSON.stringify(data)],
        );
      }
      return data;
    },
  };
}

const inventoryItemTable = tableFor<ProvLyInventoryItem>(TABLES.inventoryItems, "updated_at");
const categoryTable = tableFor<ProvLyInventoryCategory>(TABLES.inventoryCategories, "updated_at");
const roomTable = tableFor<ProvLyRoom>(TABLES.rooms, "updated_at");
const attachmentTable = tableFor<ProvLyAttachment>(TABLES.attachments, "captured_at");
const receiptTable = tableFor<ProvLyReceipt>(TABLES.receipts, "updated_at");
const completenessTable = tableFor<ProvLyCompletenessSummary>(TABLES.completenessChecks, "updated_at");
const exportTable = tableFor<ProvLyClaimExport>(TABLES.claimExports, "updated_at");
const reportTable = tableFor<ProvLyAnalysisReport>(TABLES.analysisReports, "updated_at");
const preferenceTable = tableFor<ProvLyUserPreference>(TABLES.userPreferences, "updated_at", false);

let schemaPromise: Promise<void> | null = null;

async function ensureSchema(pool: Pool): Promise<void> {
  if (!schemaPromise) {
    schemaPromise = (async () => {
      await inventoryItemTable.ensure(pool);
      await categoryTable.ensure(pool);
      await roomTable.ensure(pool);
      await attachmentTable.ensure(pool);
      await receiptTable.ensure(pool);
      await completenessTable.ensure(pool);
      await exportTable.ensure(pool);
      await reportTable.ensure(pool);
      await preferenceTable.ensure(pool);
    })();
  }

  await schemaPromise;
}

export async function createPostgresProvLyStore(pool: Pool): Promise<ProvLyStore> {
  await ensureSchema(pool);

  return {
    async getInventoryItem(itemId) {
      return inventoryItemTable.get(pool, itemId);
    },
    async listInventoryItems(tenantId, caseId) {
      return inventoryItemTable.list(pool, tenantId, caseId);
    },
    async upsertInventoryItem(item) {
      return inventoryItemTable.upsert(pool, item.itemId, item.tenantId, item.updatedAt, item, item.caseId);
    },
    async listInventoryCategories(tenantId, caseId) {
      return categoryTable.list(pool, tenantId, caseId);
    },
    async upsertInventoryCategory(category) {
      return categoryTable.upsert(pool, category.categoryId, category.tenantId, category.updatedAt, category, category.caseId);
    },
    async listRooms(tenantId, caseId) {
      return roomTable.list(pool, tenantId, caseId);
    },
    async upsertRoom(room) {
      return roomTable.upsert(pool, room.roomId, room.tenantId, room.updatedAt, room, room.caseId);
    },
    async listAttachments(tenantId, caseId) {
      return attachmentTable.list(pool, tenantId, caseId);
    },
    async upsertAttachment(attachment) {
      return attachmentTable.upsert(pool, attachment.attachmentId, attachment.tenantId, attachment.capturedAt, attachment, attachment.caseId);
    },
    async listReceipts(tenantId, caseId) {
      return receiptTable.list(pool, tenantId, caseId);
    },
    async upsertReceipt(receipt) {
      return receiptTable.upsert(pool, receipt.receiptId, receipt.tenantId, receipt.updatedAt, receipt, receipt.caseId);
    },
    async listCompletenessChecks(tenantId, caseId) {
      return completenessTable.list(pool, tenantId, caseId);
    },
    async upsertCompletenessCheck(check) {
      return completenessTable.upsert(pool, check.checkId, check.tenantId, check.updatedAt, check, check.caseId);
    },
    async listClaimExports(tenantId, caseId) {
      return exportTable.list(pool, tenantId, caseId);
    },
    async upsertClaimExport(exportRecord) {
      return exportTable.upsert(pool, exportRecord.exportId, exportRecord.tenantId, exportRecord.updatedAt, exportRecord, exportRecord.caseId);
    },
    async listAnalysisReports(tenantId, caseId) {
      return reportTable.list(pool, tenantId, caseId);
    },
    async upsertAnalysisReport(report) {
      return reportTable.upsert(pool, report.reportId, report.tenantId, report.updatedAt, report, report.caseId);
    },
    async listUserPreferences(tenantId) {
      return preferenceTable.list(pool, tenantId);
    },
    async upsertUserPreference(preference) {
      return preferenceTable.upsert(pool, preference.preferenceId, preference.tenantId, preference.updatedAt, preference);
    },
  };
}

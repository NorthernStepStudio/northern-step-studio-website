import { randomUUID } from "node:crypto";
import path from "node:path";
import { ensureDirectory, readJsonFile, writeJsonFile } from "../../core/persistence.js";
const TABLES = {
    savedBuilds: "nstep_nexusbuild_saved_builds",
    compatibilityChecks: "nstep_nexusbuild_compatibility_checks",
    pricingSnapshots: "nstep_nexusbuild_pricing_snapshots",
    analysisReports: "nstep_nexusbuild_analysis_reports",
    recommendationRuns: "nstep_nexusbuild_recommendation_runs",
    userPreferences: "nstep_nexusbuild_user_preferences",
};
function createEmptyState() {
    return {
        savedBuilds: [],
        compatibilityChecks: [],
        pricingSnapshots: [],
        analysisReports: [],
        recommendationRuns: [],
        userPreferences: [],
    };
}
function upsertById(items, next, getId) {
    const index = items.findIndex((item) => getId(item) === getId(next));
    return index >= 0 ? [...items.slice(0, index), next, ...items.slice(index + 1)] : [...items, next];
}
function sortByTimestampDesc(items, getTimestamp) {
    return [...items].sort((left, right) => Date.parse(getTimestamp(right)) - Date.parse(getTimestamp(left)));
}
function loadState(filePath) {
    return readJsonFile(filePath, createEmptyState());
}
function saveState(filePath, state) {
    return writeJsonFile(filePath, state);
}
function filterByTenant(items, tenantId) {
    if (!tenantId) {
        return [...items];
    }
    return items.filter((item) => item.tenantId === tenantId);
}
export async function createJsonNexusBuildStore(options) {
    const filePath = path.join(options.dataDir, options.fileName ?? "nexusbuild.json");
    await ensureDirectory(options.dataDir);
    return {
        async getSavedBuild(buildId) {
            const state = await loadState(filePath);
            return state.savedBuilds.find((item) => item.buildId === buildId);
        },
        async listSavedBuilds(tenantId) {
            const state = await loadState(filePath);
            return sortByTimestampDesc(filterByTenant(state.savedBuilds, tenantId), (item) => item.updatedAt || item.createdAt);
        },
        async upsertSavedBuild(build) {
            const state = await loadState(filePath);
            state.savedBuilds = upsertById(state.savedBuilds, build, (item) => item.buildId);
            await saveState(filePath, state);
            return build;
        },
        async listCompatibilityChecks(tenantId) {
            const state = await loadState(filePath);
            return sortByTimestampDesc(filterByTenant(state.compatibilityChecks, tenantId), (item) => item.updatedAt);
        },
        async upsertCompatibilityCheck(check) {
            const state = await loadState(filePath);
            state.compatibilityChecks = upsertById(state.compatibilityChecks, check, (item) => item.checkId);
            await saveState(filePath, state);
            return check;
        },
        async listPricingSnapshots(tenantId) {
            const state = await loadState(filePath);
            return sortByTimestampDesc(filterByTenant(state.pricingSnapshots, tenantId), (item) => item.capturedAt);
        },
        async upsertPricingSnapshot(snapshot) {
            const state = await loadState(filePath);
            state.pricingSnapshots = upsertById(state.pricingSnapshots, snapshot, (item) => item.snapshotId);
            await saveState(filePath, state);
            return snapshot;
        },
        async listAnalysisReports(tenantId) {
            const state = await loadState(filePath);
            return sortByTimestampDesc(filterByTenant(state.analysisReports, tenantId), (item) => item.updatedAt);
        },
        async upsertAnalysisReport(report) {
            const state = await loadState(filePath);
            state.analysisReports = upsertById(state.analysisReports, report, (item) => item.reportId);
            await saveState(filePath, state);
            return report;
        },
        async listRecommendationRuns(tenantId) {
            const state = await loadState(filePath);
            return sortByTimestampDesc(filterByTenant(state.recommendationRuns, tenantId), (item) => item.updatedAt);
        },
        async upsertRecommendationRun(run) {
            const state = await loadState(filePath);
            state.recommendationRuns = upsertById(state.recommendationRuns, run, (item) => item.runId);
            await saveState(filePath, state);
            return run;
        },
        async listUserPreferences(tenantId) {
            const state = await loadState(filePath);
            return sortByTimestampDesc(filterByTenant(state.userPreferences, tenantId), (item) => item.updatedAt);
        },
        async upsertUserPreference(preference) {
            const state = await loadState(filePath);
            state.userPreferences = upsertById(state.userPreferences, preference, (item) => item.preferenceId);
            await saveState(filePath, state);
            return preference;
        },
    };
}
function tableFor(tableName, timestampColumn) {
    return {
        async ensure(pool) {
            await pool.query(`
        CREATE TABLE IF NOT EXISTS ${tableName} (
          id text PRIMARY KEY,
          tenant_id text NOT NULL,
          ${timestampColumn} timestamptz NOT NULL,
          data jsonb NOT NULL
        );
      `);
            await pool.query(`CREATE INDEX IF NOT EXISTS ${tableName}_tenant_${timestampColumn}_idx ON ${tableName} (tenant_id, ${timestampColumn} DESC);`);
        },
        async list(pool, tenantId) {
            const query = tenantId
                ? `SELECT data FROM ${tableName} WHERE tenant_id = $1 ORDER BY ${timestampColumn} DESC`
                : `SELECT data FROM ${tableName} ORDER BY ${timestampColumn} DESC`;
            const result = tenantId ? await pool.query(query, [tenantId]) : await pool.query(query);
            return result.rows.map((row) => row.data);
        },
        async get(pool, id) {
            const result = await pool.query(`SELECT data FROM ${tableName} WHERE id = $1 LIMIT 1`, [id]);
            const row = result.rows[0];
            return row?.data;
        },
        async upsert(pool, id, tenantId, timestamp, data) {
            await pool.query(`
          INSERT INTO ${tableName} (id, tenant_id, ${timestampColumn}, data)
          VALUES ($1, $2, $3, $4::jsonb)
          ON CONFLICT (id) DO UPDATE
          SET tenant_id = EXCLUDED.tenant_id,
              ${timestampColumn} = EXCLUDED.${timestampColumn},
              data = EXCLUDED.data
        `, [id, tenantId, timestamp, JSON.stringify(data)]);
            return data;
        },
    };
}
const savedBuildTable = tableFor(TABLES.savedBuilds, "updated_at");
const compatibilityTable = tableFor(TABLES.compatibilityChecks, "updated_at");
const pricingTable = tableFor(TABLES.pricingSnapshots, "captured_at");
const reportTable = tableFor(TABLES.analysisReports, "updated_at");
const recommendationTable = tableFor(TABLES.recommendationRuns, "updated_at");
const preferenceTable = tableFor(TABLES.userPreferences, "updated_at");
let schemaPromise = null;
async function ensureSchema(pool) {
    if (!schemaPromise) {
        schemaPromise = (async () => {
            await savedBuildTable.ensure(pool);
            await compatibilityTable.ensure(pool);
            await pricingTable.ensure(pool);
            await reportTable.ensure(pool);
            await recommendationTable.ensure(pool);
            await preferenceTable.ensure(pool);
        })();
    }
    await schemaPromise;
}
export async function createPostgresNexusBuildStore(pool) {
    await ensureSchema(pool);
    return {
        async getSavedBuild(buildId) {
            return savedBuildTable.get(pool, buildId);
        },
        async listSavedBuilds(tenantId) {
            return savedBuildTable.list(pool, tenantId);
        },
        async upsertSavedBuild(build) {
            return savedBuildTable.upsert(pool, build.buildId, build.tenantId, build.updatedAt, build);
        },
        async listCompatibilityChecks(tenantId) {
            return compatibilityTable.list(pool, tenantId);
        },
        async upsertCompatibilityCheck(check) {
            return compatibilityTable.upsert(pool, check.checkId, check.tenantId, check.updatedAt, check);
        },
        async listPricingSnapshots(tenantId) {
            return pricingTable.list(pool, tenantId);
        },
        async upsertPricingSnapshot(snapshot) {
            return pricingTable.upsert(pool, snapshot.snapshotId, snapshot.tenantId, snapshot.capturedAt, snapshot);
        },
        async listAnalysisReports(tenantId) {
            return reportTable.list(pool, tenantId);
        },
        async upsertAnalysisReport(report) {
            return reportTable.upsert(pool, report.reportId, report.tenantId, report.updatedAt, report);
        },
        async listRecommendationRuns(tenantId) {
            return recommendationTable.list(pool, tenantId);
        },
        async upsertRecommendationRun(run) {
            return recommendationTable.upsert(pool, run.runId, run.tenantId, run.updatedAt, run);
        },
        async listUserPreferences(tenantId) {
            return preferenceTable.list(pool, tenantId);
        },
        async upsertUserPreference(preference) {
            return preferenceTable.upsert(pool, preference.preferenceId, preference.tenantId, preference.updatedAt, preference);
        },
    };
}
export function createNexusBuildBuildId() {
    return `nexusbuild_${randomUUID()}`;
}
//# sourceMappingURL=store.js.map
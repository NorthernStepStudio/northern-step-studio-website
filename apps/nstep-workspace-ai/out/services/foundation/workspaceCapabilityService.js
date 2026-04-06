"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.inferWorkspaceCapabilityProfile = inferWorkspaceCapabilityProfile;
const WORKSPACE_SEARCH_EXCLUDE_GLOB = "**/{node_modules,dist,out,build,.git,.next,coverage,venv,.venv,__pycache__,.turbo}/**";
function inferWorkspaceCapabilityProfile(input) {
    const packageCapabilities = input.packageSnapshots.map(analyzePackageSnapshot);
    const detectedKinds = [...new Set(packageCapabilities.map((item) => item.kind))];
    const frameworks = uniqueValues(packageCapabilities.flatMap((item) => item.frameworks));
    const runtimes = uniqueValues(packageCapabilities.flatMap((item) => item.runtimes));
    const databases = uniqueValues(packageCapabilities.flatMap((item) => item.databases));
    const testTools = uniqueValues(packageCapabilities.flatMap((item) => item.testTools));
    const primaryKind = pickPrimaryKind(detectedKinds, packageCapabilities);
    return {
        workspaceName: input.workspaceName,
        workspacePath: input.workspacePath,
        packageCount: packageCapabilities.length,
        primaryKind,
        detectedKinds,
        frameworks,
        runtimes,
        databases,
        testTools,
        packageCapabilities,
        dependencyGraph: input.dependencyGraph,
        summary: buildCapabilitySummary({
            workspaceName: input.workspaceName,
            packageCount: packageCapabilities.length,
            primaryKind,
            frameworks,
            runtimes,
            databases,
            testTools,
        }),
    };
}
function analyzePackageSnapshot(snapshot) {
    const frameworks = uniqueValues(["react", "react-dom", "next", "vite", "hono", "supabase", "solid-js", "svelte", "vue"].filter((name) => includesDependency(snapshot.dependencies, name)));
    const runtimes = uniqueValues(["node", "bun", "deno", "cloudflare", "wrangler"].filter((name) => includesToken(snapshot.dependencies, snapshot.scripts, name)));
    const testTools = uniqueValues(["vitest", "jest", "playwright", "cypress", "node:test"].filter((name) => includesToken(snapshot.dependencies, snapshot.scripts, name)));
    const databases = uniqueValues(["supabase", "prisma", "drizzle", "kysely", "sqlite", "postgres"].filter((name) => includesDependency(snapshot.dependencies, name)));
    return {
        path: snapshot.path,
        name: snapshot.name,
        kind: inferPackageKind(snapshot.dependencies, snapshot.scripts, snapshot.path),
        frameworks,
        runtimes,
        testTools,
        databases,
        buildScripts: [...snapshot.scripts],
    };
}
function inferPackageKind(dependencies, scripts, path) {
    const hasReact = includesDependency(dependencies, "react") || includesDependency(dependencies, "react-dom");
    const hasApi = includesDependency(dependencies, "hono") || includesDependency(dependencies, "express");
    const hasWorker = scripts.some((script) => /wrangler|cloudflare/i.test(script)) || includesDependency(dependencies, "wrangler");
    const hasPackageSignal = /packages\//i.test(path) || dependencies.length === 0;
    if (hasReact && hasApi) {
        return "fullstack";
    }
    if (hasApi) {
        return "api";
    }
    if (hasReact) {
        return "web";
    }
    if (hasWorker) {
        return "worker";
    }
    if (hasPackageSignal) {
        return "package";
    }
    return "unknown";
}
function pickPrimaryKind(kinds, packageCapabilities) {
    const order = ["fullstack", "api", "web", "worker", "package", "unknown"];
    for (const kind of order) {
        if (kinds.includes(kind)) {
            return kind;
        }
    }
    return packageCapabilities.length > 0 ? packageCapabilities[0].kind : "unknown";
}
function buildCapabilitySummary(input) {
    const frameworkText = input.frameworks.length > 0 ? input.frameworks.join(", ") : "none detected";
    const runtimeText = input.runtimes.length > 0 ? input.runtimes.join(", ") : "none detected";
    const databaseText = input.databases.length > 0 ? input.databases.join(", ") : "none detected";
    const testText = input.testTools.length > 0 ? input.testTools.join(", ") : "none detected";
    return [
        `${input.workspaceName}: ${input.packageCount} package(s) detected.`,
        `Primary capability: ${input.primaryKind}.`,
        `Frameworks: ${frameworkText}.`,
        `Runtimes: ${runtimeText}.`,
        `Databases: ${databaseText}.`,
        `Test tools: ${testText}.`,
    ].join(" ");
}
function includesDependency(dependencies, needle) {
    const normalized = needle.toLowerCase();
    return dependencies.some((dependency) => dependency.toLowerCase() === normalized || dependency.toLowerCase().includes(normalized));
}
function includesToken(values, scripts, needle) {
    const normalized = needle.toLowerCase();
    return values.some((value) => value.toLowerCase().includes(normalized)) || scripts.some((script) => script.toLowerCase().includes(normalized));
}
function uniqueValues(values) {
    return [...new Set(values)].filter((value) => value.trim().length > 0);
}
//# sourceMappingURL=workspaceCapabilityService.js.map
const { getDefaultConfig } = require('expo/metro-config');
const fs = require('fs');
const path = require('path');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../..');
const projectNodeModules = path.resolve(projectRoot, 'node_modules');
const workspaceNodeModules = path.resolve(workspaceRoot, 'node_modules');
const expoLinkingShim = path.resolve(projectRoot, 'src/shims/expo-linking.ts');

const config = getDefaultConfig(projectRoot);

// 1. Keep Expo defaults and append workspace root for monorepo resolution.
const defaultWatchFolders = Array.isArray(config.watchFolders) ? config.watchFolders : [];
const candidateWatchFolders = [workspaceRoot, workspaceNodeModules];
config.watchFolders = Array.from(
    new Set([
        ...defaultWatchFolders,
        ...candidateWatchFolders.filter((folder) => fs.existsSync(folder)),
    ])
);

// 2. Let Metro know where to resolve packages (local first, then workspace)
config.resolver.nodeModulesPaths = [projectNodeModules, workspaceNodeModules].filter((folder) =>
    fs.existsSync(folder)
);

// 2.1. Force Metro to use the CommonJS middleware entry for Zustand so we don't bundle the ESM file that still has import.meta.
config.resolver.extraNodeModules = {
    ...(config.resolver.extraNodeModules || {}),
    'zustand/middleware': path.resolve(projectNodeModules, 'zustand/middleware.js'),
};

const defaultResolveRequest = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
    if (moduleName === 'expo-linking' && fs.existsSync(expoLinkingShim)) {
        return {
            filePath: expoLinkingShim,
            type: 'sourceFile',
        };
    }

    if (typeof defaultResolveRequest === 'function') {
        return defaultResolveRequest(context, moduleName, platform);
    }

    return context.resolveRequest(context, moduleName, platform);
};

// 3. Force resolving of these extensions to handle mjs/cjs packages correctly
config.resolver.sourceExts = [...config.resolver.sourceExts, 'mjs', 'cjs'];

// 3.1. Ensure wasm files are treated as assets so wasm modules resolve correctly (required by expo-sqlite)
config.resolver.assetExts = [
    ...(config.resolver.assetExts || []),
    'wasm',
];

// 3. Ensure we don't assume flat structure if not forced, but typically disableHierarchicalLookup=true helps
// config.resolver.disableHierarchicalLookup = true;

module.exports = config;

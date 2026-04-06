import type { RuntimeConfig, RuntimeStores } from "./types.js";
export interface RuntimeStoreDependencies {
    readonly jobs?: RuntimeStores["jobs"];
    readonly queue?: RuntimeStores["queue"];
    readonly memory?: RuntimeStores["memory"];
    readonly knowledge?: RuntimeStores["knowledge"];
    readonly domain?: RuntimeStores["domain"];
    readonly nexusbuild?: RuntimeStores["nexusbuild"];
    readonly provly?: RuntimeStores["provly"];
}
export declare function createRuntimeStores(config: RuntimeConfig, dependencies?: RuntimeStoreDependencies): Promise<RuntimeStores>;

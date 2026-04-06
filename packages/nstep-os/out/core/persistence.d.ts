export declare function ensureDirectory(dirPath: string): Promise<void>;
export declare function readJsonFile<T>(filePath: string, fallback: T): Promise<T>;
export declare function writeJsonFile(filePath: string, value: unknown): Promise<void>;
export declare function isFileNotFound(error: unknown): boolean;

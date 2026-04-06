import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadRuntimeConfig } from "../core/config.js";
import { createRuntimeStores } from "../core/storage.js";
import { chunkKnowledgeCorpus, summarizeKnowledgeCoverage, type KnowledgeDocumentSource } from "../knowledge/index.js";

async function main(): Promise<void> {
  const config = loadRuntimeConfig();
  const stores = await createRuntimeStores(config);
  const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
  const workspaceRoot = path.resolve(packageRoot, "..", "..");
  const docsRoot = path.join(workspaceRoot, "docs");

  const sourceFiles = await collectMarkdownFiles(docsRoot);
  if (sourceFiles.length === 0) {
    throw new Error(`No markdown files were found in ${docsRoot}.`);
  }

  const sources = await Promise.all(
    sourceFiles.map(async (sourcePath) => ({
      sourcePath: toPosixPath(path.relative(workspaceRoot, sourcePath)),
      markdown: await readFile(sourcePath, "utf8"),
    })),
  );
  const chunks = chunkKnowledgeCorpus(sources satisfies readonly KnowledgeDocumentSource[]);
  const coverage = summarizeKnowledgeCoverage(chunks);

  await stores.knowledge.save(chunks);

  console.log(`Ingested ${sources.length} document(s) into ${chunks.length} knowledge chunk(s).`);
  console.log(
    `Lane coverage: ${coverage.presentLaneDocuments}/${coverage.expectedLaneDocuments} lane docs present (${coverage.coveragePercent}%), missing ${coverage.missingLaneDocuments}.`,
  );
  console.log(`Docs root: ${docsRoot}`);
  console.log(`Knowledge store: ${config.database?.provider || "file"}`);
}

async function collectMarkdownFiles(rootDir: string): Promise<string[]> {
  const entries = await readdir(rootDir, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries.sort((left, right) => left.name.localeCompare(right.name))) {
    const entryPath = path.join(rootDir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await collectMarkdownFiles(entryPath)));
      continue;
    }

    if (entry.isFile() && path.extname(entry.name).toLowerCase() === ".md") {
      files.push(entryPath);
    }
  }

  return files.sort((left, right) => left.localeCompare(right));
}

function toPosixPath(value: string): string {
  return value.split(path.sep).join("/");
}

const isDirectRun = (() => {
  try {
    return process.argv[1] ? fileURLToPath(import.meta.url) === process.argv[1] : false;
  } catch {
    return false;
  }
})();

if (isDirectRun) {
  void main().catch((error) => {
    console.error(error instanceof Error ? error.stack || error.message : String(error));
    process.exitCode = 1;
  });
}

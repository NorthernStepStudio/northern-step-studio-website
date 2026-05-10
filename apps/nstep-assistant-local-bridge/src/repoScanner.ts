import fs from "fs";
import path from "path";

export function scanRepoContext(): string[] {
  const contextFiles = [
    "docs/company-context/brand.md",
    "docs/company-context/apps.md",
    "docs/company-context/repo-map.md",
    "docs/company-context/tech-stack.md",
    "docs/company-context/deployment-rules.md",
    "docs/company-context/security-rules.md",
    "docs/company-context/assistant-behavior.md",
  ];
  
  return contextFiles;
}

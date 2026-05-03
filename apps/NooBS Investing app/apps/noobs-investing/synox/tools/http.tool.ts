import { createHttpFetchTool, type ToolContract } from '@nss/response-os';

export function createNoobsHttpTools(): ToolContract[] {
  return [createHttpFetchTool()];
}

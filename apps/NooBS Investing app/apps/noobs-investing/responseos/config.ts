import { createDefaultAppConfig, type AppConfig } from '@nss/response-os';

export function createNoobsResponseOsConfig(): AppConfig {
  const config = createDefaultAppConfig('noobs-investing-mobile');
  config.policyProfile = 'finance-safe';
  config.defaultProvider = 'off';
  config.enabledTools = ['storage.get', 'storage.set', 'http.fetch', 'file.export_csv', 'file.export_pdf'];
  config.allowedOutputFormats = ['text', 'json', 'markdown'];
  config.budgetDefaults = {
    maxSteps: 8,
    maxLlmCalls: 1,
    maxTokensIn: 2500,
    maxTokensOut: 1400,
    maxToolCalls: 6,
    maxMs: 9000,
  };
  return config;
}

const configuredPublicBaseUrl = (process.env.RESPONSEOS_PUBLIC_BASE_URL || process.argv[2] || '').trim();

if (!configuredPublicBaseUrl) {
  throw new Error(
    'Set RESPONSEOS_PUBLIC_BASE_URL or pass the public base URL as the first argument before starting the public gateway.'
  );
}

process.env.RESPONSEOS_PUBLIC_BASE_URL = configuredPublicBaseUrl;

await import('./index.mjs');

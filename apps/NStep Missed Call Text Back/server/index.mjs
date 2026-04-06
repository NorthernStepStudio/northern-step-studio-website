import { createServer } from 'node:http';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { createCipheriv, createDecipheriv, createHash, randomBytes, randomUUID } from 'node:crypto';
import { createMCoreRuntime } from '../../../packages/m-core/out/index.js';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = (SUPABASE_URL && SUPABASE_KEY) ? createClient(SUPABASE_URL, SUPABASE_KEY) : null;

const HOST = process.env.RESPONSEOS_GATEWAY_HOST || '127.0.0.1';
const PORT = Number(process.env.RESPONSEOS_GATEWAY_PORT || 8787);
const PUBLIC_BASE_URL = (process.env.RESPONSEOS_PUBLIC_BASE_URL || '').trim();
const DEFAULT_APP_ID = 'responseos-app';
const DEFAULT_API_KEY = process.env.RESPONSEOS_GATEWAY_API_KEY || 'preview-key';
const DATA_DIR = path.resolve(process.env.RESPONSEOS_GATEWAY_DATA_DIR || path.join(process.cwd(), 'server-data'));
const STORE_PATH = path.join(DATA_DIR, 'responseos-store.json');
const DEPLOYMENT_MODE = stringOrDefault(process.env.RESPONSEOS_GATEWAY_DEPLOYMENT_MODE, '')
  .trim()
  .toLowerCase();
const CREDENTIAL_KEY_SOURCE = (process.env.RESPONSEOS_CREDENTIAL_KEY || '').trim();
const CREDENTIAL_ENCRYPTION_ENABLED = Boolean(CREDENTIAL_KEY_SOURCE);
const CREDENTIAL_KEY = CREDENTIAL_ENCRYPTION_ENABLED
  ? createHash('sha256').update(CREDENTIAL_KEY_SOURCE).digest()
  : null;
const FOLLOWUP_RUNNER_ENABLED = parseBooleanEnv(
  process.env.RESPONSEOS_FOLLOWUP_RUNNER_ENABLED,
  true
);
const FOLLOWUP_RUNNER_INTERVAL_MS = parseIntegerEnv(
  process.env.RESPONSEOS_FOLLOWUP_RUNNER_INTERVAL_MS,
  60000
);
const FOLLOWUP_RUNNER_LIMIT_PER_TENANT = parseIntegerEnv(
  process.env.RESPONSEOS_FOLLOWUP_RUNNER_LIMIT_PER_TENANT,
  25
);
const M_CORE_SELECTED_PROVIDER = resolveMCoreSelectedProvider();
const M_CORE_EFFECTIVE_PROVIDER = resolveMCoreEffectiveProvider(
  M_CORE_SELECTED_PROVIDER,
  process.env.M_CORE_GEMINI_API_KEY || process.env.RESPONSE_OS_GEMINI_API_KEY || process.env.GEMINI_API_KEY
);
const OLLAMA_BASE_URL = (
  process.env.RESPONSEOS_OLLAMA_BASE_URL ||
  process.env.OLLAMA_BASE_URL ||
  'http://127.0.0.1:11434'
).trim();
const M_CORE_RUNTIME = createMCoreRuntime({
  providerMode: M_CORE_EFFECTIVE_PROVIDER,
  geminiApiKey:
    (process.env.M_CORE_GEMINI_API_KEY ||
      process.env.RESPONSE_OS_GEMINI_API_KEY ||
      process.env.GEMINI_API_KEY ||
      '').trim() || undefined,
  geminiModel:
    (process.env.M_CORE_GEMINI_MODEL ||
      process.env.RESPONSE_OS_GEMINI_MODEL ||
      process.env.GEMINI_MODEL ||
      'gemini-2.5-flash').trim(),
  geminiBaseUrl:
    (process.env.M_CORE_GEMINI_BASE_URL ||
      process.env.RESPONSE_OS_GEMINI_BASE_URL ||
      'https://generativelanguage.googleapis.com/v1beta').trim(),
  requestTimeoutMs: Number(
    process.env.M_CORE_REQUEST_TIMEOUT_MS ||
      process.env.RESPONSE_OS_REQUEST_TIMEOUT_MS ||
      process.env.NSS_WORKSPACE_AI_REQUEST_TIMEOUT_MS ||
      30000
  ),
});

const AUTOMATION_TIER_DEFAULTS = {
  starter: {
    maxRequestsPerDay: 75,
    localModel: (process.env.RESPONSEOS_AUTOMATION_STARTER_LOCAL_MODEL || 'qwen:8b').trim(),
    cloudLabel: 'starter-cloud',
  },
  pro: {
    maxRequestsPerDay: 150,
    localModel: (process.env.RESPONSEOS_AUTOMATION_PRO_LOCAL_MODEL || 'qwen:14b').trim(),
    cloudLabel: 'pro-cloud',
  },
  elite: {
    maxRequestsPerDay: 300,
    localModel: (process.env.RESPONSEOS_AUTOMATION_ELITE_LOCAL_MODEL || 'qwen:14b').trim(),
    cloudLabel: 'elite-cloud',
  },
};

const STARTER_PLUMBING_PLAYBOOK = 'starter_plumbing';
const STARTER_PLUMBING_QUESTION_ORDER = [
  'issue_type',
  'other_detail',
  'severity_detail',
  'urgency',
  'location',
  'customer_name',
];
const DEMO_LEAD_SESSIONS = new Map();
const DIRECT_DEMO_CALL_SIDS = new Set();
const RECENT_MISSED_CALL_EVENTS = new Map();

const defaultHeaders = {
  'access-control-allow-origin': '*',
  'access-control-allow-headers': 'content-type, x-api-key',
  'access-control-allow-methods': 'GET, POST, PUT, OPTIONS',
  'cache-control': 'no-store',
};

const DEFAULT_REPLY_OPTIONS = {
  '1': {
    title: 'Leak',
    reply: 'Tell us your name so we can route the plumbing issue correctly.',
  },
  '2': {
    title: 'Clog',
    reply: 'Tell us your name so we can route the plumbing issue correctly.',
  },
  '3': {
    title: 'Other',
    reply: 'Tell us your name and a short note about the plumbing issue.',
  },
  '4': {
    title: 'Urgent',
    reply: 'Tell us the address and whether water is actively leaking or backing up right now.',
  },
};

const SMS_REPLY_WORKFLOW = {
  '1': {
    stage: 'qualified',
    urgencyScore: 55,
  },
  '2': {
    stage: 'qualified',
    urgencyScore: 50,
  },
  '3': {
    stage: 'qualified',
    urgencyScore: 40,
  },
  '4': {
    stage: 'urgent',
    urgencyScore: 100,
  },
};

const MISSED_CALL_REPLY = buildDefaultMissedCallReply('', DEFAULT_REPLY_OPTIONS);
let followupRunnerBusy = false;
let followupRunnerRunning = false;
let followupRunnerTimer = null;

await mkdir(DATA_DIR, { recursive: true });

export const handleRequest = async (req, res) => {
  try {
    if ((req.method || 'GET') === 'OPTIONS') {
      send(res, 204, '', 'text/plain; charset=utf-8');
      return;
    }

    const method = req.method || 'GET';
    const url = new URL(req.url || '/', `http://${req.headers.host || `${HOST}:${PORT}`}`);

    if (method === 'GET' && url.pathname === '/health') {
      sendJson(res, 200, {
        ok: true,
        service: 'responseos-gateway',
        publicBaseUrl: PUBLIC_BASE_URL || null,
        now: new Date().toISOString(),
      });
      return;
    }

    if (method === 'POST' && url.pathname === '/lead') {
      const body = parseBody(req, await readBody(req));
      const result = handleDemoLeadEndpoint(body);
      sendJson(res, 200, result);
      return;
    }

    if (method === 'POST' && url.pathname === '/v1/revenue/webhooks/twilio') {
      const store = await loadStore();
      const queryApiKey = url.searchParams.get('api_key') || '';
      const appId = url.searchParams.get('app_id') || DEFAULT_APP_ID;
      const expectedApiKey = getExpectedApiKey(store, appId);
      if (!queryApiKey || queryApiKey !== expectedApiKey) {
        if (req.headers['content-type']?.includes('application/x-www-form-urlencoded')) {
          sendXml(res, 401, '<Response><Reject reason="unauthorized"/></Response>');
        } else {
          sendError(res, 401, 'Twilio webhook API key is invalid.');
        }
        return;
      }
      const body = await readBody(req);
      const payload = parseBody(req, body);
      const isVoice = Boolean(payload.CallSid);
      const tenantId =
        resolveTenantIdForTwilioWebhook(store, appId, payload) ||
        url.searchParams.get('tenant_id') ||
        '';
      if (!tenantId) {
        if (isVoice) {
          sendXml(res, 404, '<Response><Reject reason="busy"/></Response>');
        } else {
          sendError(res, 404, 'Could not resolve a client workspace from the Twilio number.');
        }
        return;
      }
      const tenant = ensureTenant(store, appId, tenantId);

      if (payload.CallSid && payload.CallStatus) {
        const status = String(payload.CallStatus).trim().toLowerCase();

        if (isForwardedMissedCallWebhook(payload, tenant)) {
          sendXml(res, 200, '<Response><Hangup/></Response>');
          queueTwilioVoiceMissedCallProcessing({ store, appId, tenantId, event: {
            type: 'call.missed',
            fromNumber: payload.From || '',
            toNumber: tenant.profile.callbackNumber || payload.To || '',
            forwardedFrom: payload.ForwardedFrom || tenant.profile.mainBusinessNumber || '',
            callSid: payload.CallSid || `CA_${Date.now()}`,
            source: 'twilio-forwarded-call',
          }});
          return;
        }

        if (isDirectDemoMissedCallWebhook(payload, tenant)) {
          const callSid = payload.CallSid || `CA_${Date.now()}`;
          sendXml(res, 200, '<Response><Hangup/></Response>');
          if (markDirectDemoCallSid(callSid)) {
            queueTwilioVoiceMissedCallProcessing({ store, appId, tenantId, event: {
              type: 'call.missed',
              fromNumber: payload.From || '',
              toNumber: payload.To || tenant.profile.callbackNumber || '',
              callSid,
              source: 'twilio-direct-demo',
            }});
          }
          return;
        }

        if (['busy', 'failed', 'no-answer', 'canceled'].includes(status)) {
          sendXml(res, 200, '<Response><Hangup/></Response>');
          queueTwilioVoiceMissedCallProcessing({ store, appId, tenantId, event: {
            type: 'call.missed',
            fromNumber: payload.From || '',
            toNumber: payload.To || tenant.profile.callbackNumber || '',
            callSid: payload.CallSid || `CA_${Date.now()}`,
            source: 'twilio-webhook',
          }});
          return;
        }

        addActivity(tenant, {
          kind: 'webhook.received',
          status: 'ignored',
          title: 'Twilio voice callback ignored',
          summary: `Call status ${status} does not represent a missed call.`,
        });
        await saveStore(store);
        sendXml(res, 200, '<Response></Response>');
        return;
      }

      if (payload.MessageSid || payload.SmsSid || payload.Body) {
        const messageStatus = stringOrDefault(payload.MessageStatus || payload.SmsStatus, '').toLowerCase();
        if (messageStatus && messageStatus !== 'received' && !payload.Body) {
          await processEvent(store, appId, tenantId, {
            type: 'sms.status',
            fromNumber: payload.From || '',
            toNumber: payload.To || '',
            messageSid: payload.MessageSid || payload.SmsSid || `SM_${Date.now()}`,
            messageStatus,
            errorCode: payload.ErrorCode || '',
            errorMessage: payload.ErrorMessage || '',
            source: 'twilio-status-callback',
          });
          await saveStore(store);
          sendXml(res, 200, '<Response></Response>');
          return;
        }

        await processEvent(store, appId, tenantId, {
          type: 'sms.received',
          fromNumber: payload.From || '',
          toNumber: payload.To || tenant.profile.callbackNumber || '',
          body: payload.Body || '',
          messageSid: payload.MessageSid || payload.SmsSid || `SM_${Date.now()}`,
          source: 'twilio-webhook',
        });
        await saveStore(store);
        sendXml(res, 200, '<Response></Response>');
        return;
      }

      addActivity(tenant, {
        kind: 'webhook.received',
        status: 'ignored',
        title: 'Twilio webhook ignored',
        summary: 'Webhook payload did not match a supported SMS or voice callback shape.',
      });
      await saveStore(store);
      sendXml(res, 200, '<Response></Response>');
      return;
    }

    const store = await loadStore();
    const bodyText = ['POST', 'PUT', 'PATCH'].includes(method) ? await readBody(req) : '';
    const body = bodyText ? parseBody(req, bodyText) : {};
    const appId =
      url.searchParams.get('app_id') ||
      stringOrDefault(body.app_id, DEFAULT_APP_ID) ||
      DEFAULT_APP_ID;

    if (url.pathname.startsWith('/v1/')) {
      const providedApiKey = String(req.headers['x-api-key'] || '');
      const expectedApiKey = getExpectedApiKey(store, appId);
      if (!providedApiKey || providedApiKey !== expectedApiKey) {
        sendError(res, 401, 'Access key is invalid.');
        return;
      }
    }

    if (method === 'GET' && url.pathname === '/v1/config/provider') {
      ensureApp(store, appId);
      sendJson(res, 200, {
        app_id: appId,
        provider: buildMCoreProviderStatus(),
      });
      return;
    }

    if (method === 'GET' && url.pathname === '/v1/runtime/status') {
      ensureApp(store, appId);
      sendJson(res, 200, {
        runtime: buildRuntimeStatus(store, appId),
      });
      return;
    }

    if (method === 'POST' && url.pathname === '/v1/runtime/followups/run') {
      const tenantId = stringOrDefault(body.tenant_id, '');
      const result = await runFollowupSweep(store, {
        appId,
        tenantId: tenantId || undefined,
        reason: 'manual-run',
      });
      if (result.changed) {
        await saveStore(store);
      }
      sendJson(res, 200, {
        result,
      });
      return;
    }

    if (method === 'POST' && url.pathname === '/v1/revenue/tasks/complete') {
      const tenantId = stringOrDefault(body.tenant_id, 'default');
      const taskId = stringOrDefault(body.task_id, '');
      const result = completeTask(store, appId, tenantId, taskId);
      await saveStore(store);
      sendJson(res, 200, {
        result,
      });
      return;
    }

    if (method === 'POST' && url.pathname === '/v1/revenue/followups/complete') {
      const tenantId = stringOrDefault(body.tenant_id, 'default');
      const followupId = stringOrDefault(body.followup_id, '');
      const result = completeFollowup(store, appId, tenantId, followupId);
      await saveStore(store);
      sendJson(res, 200, {
        result,
      });
      return;
    }

    if (method === 'GET' && url.pathname === '/v1/revenue/workspace') {
      const tenantId = url.searchParams.get('tenant_id') || 'default';
      ensureTenant(store, appId, tenantId);
      await saveStore(store);
      sendJson(res, 200, {
        workspace: buildWorkspace(store, appId, tenantId),
      });
      return;
    }

    if (method === 'GET' && url.pathname === '/v1/revenue/tenants') {
      ensureApp(store, appId);
      sendJson(res, 200, {
        tenants: buildTenantSummaries(store, appId),
      });
      return;
    }

    if (method === 'POST' && url.pathname === '/v1/revenue/tenants/duplicate') {
      const result = duplicateTenant(body, store, appId);
      await saveStore(store);
      sendJson(res, 200, { result });
      return;
    }

    if (method === 'POST' && url.pathname === '/v1/revenue/discovery/website') {
      const result = await discoverWebsite(body);
      sendJson(res, 200, { result });
      return;
    }

    if (method === 'POST' && url.pathname === '/v1/revenue/ai/setup-assist') {
      const tenantId = stringOrDefault(body.tenant_id, 'default');
      const tenant = ensureTenant(store, appId, tenantId);
      const result = await generateSetupAssist(body, tenantId, tenant);
      await saveStore(store);
      sendJson(res, 200, { result });
      return;
    }

    if (method === 'PUT' && url.pathname === '/v1/revenue/profile') {
      const tenantId = stringOrDefault(body.tenant_id, 'default');
      const tenant = ensureTenant(store, appId, tenantId);
      tenant.profile = normalizeProfile({
        ...tenant.profile,
        ...(body.profile || {}),
        businessId: tenantId,
      });
      assertUniqueCallbackNumber(store, appId, tenantId, tenant.profile.callbackNumber);
      tenant.settings = normalizeSettings({
        ...tenant.settings,
        ...(body.settings || {}),
      });
      tenant.updatedAt = new Date().toISOString();
      await saveStore(store);
      sendJson(res, 200, {
        ok: true,
        workspace: buildWorkspace(store, appId, tenantId),
      });
      return;
    }

    if (method === 'POST' && url.pathname === '/v1/revenue/connectors/validate') {
      const validation = await validateConnector(body, store, appId);
      sendJson(res, 200, {
        result: validation,
      });
      return;
    }

    if (method === 'POST' && url.pathname === '/v1/revenue/connectors/bootstrap') {
      const tenantId = stringOrDefault(body.tenant_id, 'default');
      const tenant = ensureTenant(store, appId, tenantId);
      const bootstrapResult = await bootstrapConnector(body, store, appId, tenant);
      tenant.updatedAt = new Date().toISOString();
      await saveStore(store);
      sendJson(res, 200, {
        result: bootstrapResult,
      });
      return;
    }

    if (method === 'POST' && url.pathname === '/v1/revenue/events') {
      const tenantId = stringOrDefault(body.tenant_id, 'default');
      const result = await processEvent(store, appId, tenantId, body.event || {});
      await saveStore(store);
      sendJson(res, 200, {
        result: {
          patch: {
            summary: result.summary,
          },
        },
      });
      return;
    }

    if (method === 'GET' && url.pathname === '/v1/revenue/onboarding-packet') {
      const tenantId = url.searchParams.get('tenant_id') || 'default';
      const workspace = buildWorkspace(store, appId, tenantId);
      sendJson(res, 200, {
        packet: {
          packetVersion: 1,
          generatedAt: new Date().toISOString(),
          tenantId,
          mode: workspace.summary.mode,
          profile: workspace.profile,
          settings: workspace.settings,
          onboarding: workspace.onboarding,
          tasks: workspace.tasks,
        },
      });
      return;
    }

    if (method === 'POST' && url.pathname === '/v1/revenue/onboarding-packet/import') {
      const tenantId = stringOrDefault(body.tenant_id, 'default');
      const packet = body.packet || {};
      const tenant = ensureTenant(store, appId, tenantId);
      tenant.profile = normalizeProfile({
        ...tenant.profile,
        ...(packet.profile || {}),
        businessId: tenantId,
      });
      assertUniqueCallbackNumber(store, appId, tenantId, tenant.profile.callbackNumber);
      tenant.settings = normalizeSettings({
        ...tenant.settings,
        ...(packet.settings || {}),
      });
      tenant.tasks = Array.isArray(packet.tasks) ? packet.tasks : tenant.tasks;
      tenant.updatedAt = new Date().toISOString();
      await saveStore(store);
      sendJson(res, 200, {
        ok: true,
        workspace: buildWorkspace(store, appId, tenantId),
      });
      return;
    }

    sendError(res, 404, 'Route not found.');
  } catch (error) {
    const contentType = String(req.headers['content-type'] || '').toLowerCase();
    const requestUrl = new URL(req.url || '/', `http://${req.headers.host || `${HOST}:${PORT}`}`);
    if (
      !res.headersSent &&
      (req.method || 'GET') === 'POST' &&
      requestUrl.pathname === '/v1/revenue/webhooks/twilio' &&
      contentType.includes('application/x-www-form-urlencoded')
    ) {
      sendXml(res, 200, '<Response><Hangup/></Response>');
      return;
    }
    sendError(res, 500, error instanceof Error ? error.message : String(error));
  }
};

if (process.env.VERCEL !== '1') {
  const server = createServer(handleRequest);
  server.listen(PORT, HOST, () => {
    console.log(`[responseos-gateway] http://${HOST}:${PORT}`);
    if (FOLLOWUP_RUNNER_ENABLED) {
      startFollowupRunner();
    }
  });
}

async function loadStore() {
  if (supabase) {
    const { data } = await supabase.from('responseos_state').select('data').eq('id', 'default').single();
    const parsed = data?.data || {};
    const normalized = normalizeStore(parsed);
    if (CREDENTIAL_ENCRYPTION_ENABLED && hasPlaintextSecretsOnDisk(parsed)) {
      await saveStore(normalized);
    }
    return normalized;
  }

  let raw = '';
  try {
    raw = await readFile(STORE_PATH, 'utf8');
  } catch (error) {
    if (error && typeof error === 'object' && error.code === 'ENOENT') {
      return normalizeStore({});
    }
    throw error;
  }
  const parsed = raw.trim() ? JSON.parse(raw) : {};
  const normalized = normalizeStore(parsed);
  if (CREDENTIAL_ENCRYPTION_ENABLED && hasPlaintextSecretsOnDisk(parsed)) {
    await saveStore(normalized);
  }
  return normalized;
}

async function saveStore(store) {
  const payload = serializeStoreForDisk(store);
  if (supabase) {
    await supabase.from('responseos_state').upsert({ id: 'default', data: payload }, { onConflict: 'id' });
  } else {
    await writeFile(STORE_PATH, JSON.stringify(payload, null, 2), 'utf8');
  }
}

function serializeStoreForDisk(store) {
  const serialized = {
    version: 1,
    config: {
      apiKeys: {
        ...(store?.config?.apiKeys || {}),
      },
    },
    apps: {},
  };

  for (const [appId, appState] of Object.entries(store?.apps || {})) {
    serialized.apps[appId] = {
      provider: stringOrDefault(appState?.provider, 'off'),
      tenants: {},
    };

    for (const [tenantId, tenantState] of Object.entries(appState?.tenants || {})) {
      serialized.apps[appId].tenants[tenantId] = serializeTenantForDisk(tenantState);
    }
  }

  return serialized;
}

function serializeTenantForDisk(tenantState) {
  return {
    profile: tenantState?.profile || {},
    settings: tenantState?.settings || {},
    connectors: {
      sms: serializeSmsConnectorForDisk(tenantState?.connectors?.sms || null),
    },
    metrics: tenantState?.metrics || {},
    leads: Array.isArray(tenantState?.leads) ? tenantState.leads : [],
    followups: normalizeFollowups(tenantState?.followups || []),
    activity: Array.isArray(tenantState?.activity) ? tenantState.activity : [],
    tasks: Array.isArray(tenantState?.tasks) ? tenantState.tasks : [],
    createdAt: tenantState?.createdAt || new Date().toISOString(),
    updatedAt: tenantState?.updatedAt || new Date().toISOString(),
  };
}

function serializeSmsConnectorForDisk(connector) {
  if (!connector || typeof connector !== 'object') {
    return null;
  }

  return {
    ...connector,
    authToken: serializeSecretForDisk(connector.authToken || ''),
  };
}

function serializeSecretForDisk(secretValue) {
  const normalizedSecret = stringOrDefault(secretValue, '');
  if (!normalizedSecret) {
    return '';
  }
  if (!CREDENTIAL_ENCRYPTION_ENABLED) {
    return normalizedSecret;
  }

  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', CREDENTIAL_KEY, iv);
  const encrypted = Buffer.concat([cipher.update(normalizedSecret, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return {
    encrypted: true,
    version: 1,
    algorithm: 'aes-256-gcm',
    iv: iv.toString('base64'),
    tag: tag.toString('base64'),
    value: encrypted.toString('base64'),
  };
}

function decryptSecretFromDisk(secretValue, label) {
  if (typeof secretValue === 'string') {
    return secretValue.trim();
  }
  if (!secretValue || typeof secretValue !== 'object' || !secretValue.encrypted) {
    return '';
  }
  if (!CREDENTIAL_ENCRYPTION_ENABLED || !CREDENTIAL_KEY) {
    throw new Error(`${label} is encrypted on disk, but RESPONSEOS_CREDENTIAL_KEY is not configured.`);
  }

  const iv = Buffer.from(stringOrDefault(secretValue.iv, ''), 'base64');
  const tag = Buffer.from(stringOrDefault(secretValue.tag, ''), 'base64');
  const value = Buffer.from(stringOrDefault(secretValue.value, ''), 'base64');
  const decipher = createDecipheriv('aes-256-gcm', CREDENTIAL_KEY, iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(value), decipher.final()]).toString('utf8').trim();
}

function hasPlaintextSecretsOnDisk(store) {
  return Object.values(store?.apps || {}).some((appState) =>
    Object.values(appState?.tenants || {}).some((tenantState) => {
      const authToken = tenantState?.connectors?.sms?.authToken;
      return typeof authToken === 'string' && authToken.trim().length > 0;
    })
  );
}

function normalizeSmsConnector(connector) {
  if (!connector || typeof connector !== 'object') {
    return null;
  }

  return {
    provider: stringOrDefault(connector.provider, 'twilio'),
    connectorId: stringOrDefault(connector.connectorId, ''),
    accountSid: stringOrDefault(connector.accountSid, ''),
    authToken: decryptSecretFromDisk(connector.authToken, 'Twilio Auth Token'),
    baseUrl: stringOrDefault(connector.baseUrl, ''),
    fromNumber: stringOrDefault(connector.fromNumber, ''),
    live: Boolean(connector.live),
    summary: stringOrDefault(connector.summary, ''),
  };
}

function normalizeStore(store) {
  const normalized = {
    version: 1,
    config: {
      apiKeys: {
        [DEFAULT_APP_ID]: DEFAULT_API_KEY,
        ...(store?.config?.apiKeys || {}),
      },
    },
    apps: {},
  };

  for (const [appId, appState] of Object.entries(store?.apps || {})) {
    normalized.apps[appId] = normalizeApp(appState);
  }

  ensureApp(normalized, DEFAULT_APP_ID);
  return normalized;
}

function normalizeApp(appState) {
  const app = {
    provider: 'off',
    tenants: {},
  };
  if (appState && typeof appState === 'object') {
    app.provider = appState.provider || 'off';
    for (const [tenantId, tenantState] of Object.entries(appState.tenants || {})) {
      app.tenants[tenantId] = normalizeTenant(tenantState, tenantId);
    }
  }
  return app;
}

function ensureApp(store, appId) {
  if (!store.apps[appId]) {
    store.apps[appId] = normalizeApp({});
  }
  if (!store.config.apiKeys[appId]) {
    store.config.apiKeys[appId] = DEFAULT_API_KEY;
  }
  return store.apps[appId];
}

function ensureTenant(store, appId, tenantId) {
  const app = ensureApp(store, appId);
  if (!app.tenants[tenantId]) {
    app.tenants[tenantId] = normalizeTenant({}, tenantId);
  }
  return app.tenants[tenantId];
}

function normalizeTenant(tenantState, tenantId) {
  const now = new Date().toISOString();
  return {
    profile: normalizeProfile({
      businessId: tenantId,
      ...(tenantState?.profile || {}),
    }),
    settings: normalizeSettings(tenantState?.settings || {}),
    connectors: {
      sms: normalizeSmsConnector(tenantState?.connectors?.sms || null),
    },
    metrics: normalizeMetrics(tenantState?.metrics || {}),
    leads: normalizeLeads(tenantState?.leads || []),
    followups: normalizeFollowups(tenantState?.followups || []),
    activity: Array.isArray(tenantState?.activity) ? tenantState.activity : [],
    tasks: Array.isArray(tenantState?.tasks) ? tenantState.tasks : [],
    createdAt: tenantState?.createdAt || now,
    updatedAt: tenantState?.updatedAt || now,
  };
}

function normalizeReplyOptions(replyOptions) {
  return {
    '1': {
      title: stringOrDefault(replyOptions?.['1']?.title, DEFAULT_REPLY_OPTIONS['1'].title),
      reply: stringOrDefault(replyOptions?.['1']?.reply, DEFAULT_REPLY_OPTIONS['1'].reply),
    },
    '2': {
      title: stringOrDefault(replyOptions?.['2']?.title, DEFAULT_REPLY_OPTIONS['2'].title),
      reply: stringOrDefault(replyOptions?.['2']?.reply, DEFAULT_REPLY_OPTIONS['2'].reply),
    },
    '3': {
      title: stringOrDefault(replyOptions?.['3']?.title, DEFAULT_REPLY_OPTIONS['3'].title),
      reply: stringOrDefault(replyOptions?.['3']?.reply, DEFAULT_REPLY_OPTIONS['3'].reply),
    },
    '4': {
      title: stringOrDefault(replyOptions?.['4']?.title, DEFAULT_REPLY_OPTIONS['4'].title),
      reply: stringOrDefault(replyOptions?.['4']?.reply, DEFAULT_REPLY_OPTIONS['4'].reply),
    },
  };
}

function buildDefaultMissedCallReply(businessName, replyOptions = DEFAULT_REPLY_OPTIONS) {
  return buildStarterPlumbingOpening(businessName);
}

function normalizeTemplates(templates, businessName) {
  const replyOptions = normalizeReplyOptions(templates?.replyOptions);
  return {
    missedCallReply: stringOrDefault(
      templates?.missedCallReply,
      buildDefaultMissedCallReply(businessName, replyOptions)
    ),
    replyOptions,
  };
}

function normalizeProfile(profile) {
  const businessName = stringOrDefault(profile.businessName, '');
  const mainBusinessNumbers = normalizePhoneList(
    profile.mainBusinessNumbers,
    stringOrDefault(profile.mainBusinessNumber, '')
  );
  const primaryMainBusinessNumber =
    stringOrDefault(profile.mainBusinessNumber, '') || mainBusinessNumbers[0] || '';
  return {
    businessId: stringOrDefault(profile.businessId, 'default'),
    businessName,
    mainBusinessNumber: primaryMainBusinessNumber,
    mainBusinessNumbers,
    timezone: stringOrDefault(profile.timezone, 'America/New_York'),
    services: Array.isArray(profile.services)
      ? profile.services.filter(Boolean)
      : ['service', 'estimate', 'appointment'],
    serviceArea: stringOrDefault(profile.serviceArea, ''),
    callbackNumber: stringOrDefault(profile.callbackNumber, ''),
    hours: profile.hours || undefined,
    emergencyPolicy: profile.emergencyPolicy || {
      enabled: false,
      emergencyKeywords: ['urgent', 'emergency', 'asap'],
      emergencyRoute: '',
    },
    templates: normalizeTemplates(profile.templates, businessName),
  };
}

function normalizeSettings(settings) {
  return {
    websiteUrl: stringOrDefault(settings.websiteUrl, ''),
    bookingLink: stringOrDefault(settings.bookingLink, ''),
    reviewUrl: stringOrDefault(settings.reviewUrl, ''),
    ownerAlertDestination: stringOrDefault(settings.ownerAlertDestination, ''),
    contactEmail: stringOrDefault(settings.contactEmail, ''),
    automation: normalizeAutomationSettings(settings.automation || {}),
    sms: {
      provider: settings?.sms?.provider || 'simulated',
      connectorId: stringOrDefault(settings?.sms?.connectorId, ''),
      path: stringOrDefault(settings?.sms?.path, 'Messages.json'),
    },
    email: {
      provider: settings?.email?.provider || 'simulated',
      connectorId: stringOrDefault(settings?.email?.connectorId, ''),
      path: stringOrDefault(settings?.email?.path, '/emails'),
      fromEmail: stringOrDefault(settings?.email?.fromEmail, ''),
      fromName: stringOrDefault(settings?.email?.fromName, ''),
    },
    calendar: {
      provider: settings?.calendar?.provider || 'simulated',
      connectorId: stringOrDefault(settings?.calendar?.connectorId, ''),
      path: stringOrDefault(settings?.calendar?.path, '/events'),
      calendarId: stringOrDefault(settings?.calendar?.calendarId, 'primary'),
    },
  };
}

function normalizeAutomationSettings(automation) {
  const tier = ['starter', 'pro', 'elite'].includes(stringOrDefault(automation?.tier, '').toLowerCase())
    ? stringOrDefault(automation?.tier, '').toLowerCase()
    : 'starter';
  const defaults = AUTOMATION_TIER_DEFAULTS[tier] || AUTOMATION_TIER_DEFAULTS.starter;
  const mode = ['local', 'cloud', 'hybrid'].includes(stringOrDefault(automation?.mode, '').toLowerCase())
    ? stringOrDefault(automation?.mode, '').toLowerCase()
    : 'hybrid';
  const requestsUsedToday = Number(automation?.requestsUsedToday || 0);
  return {
    tier,
    mode,
    vertical: 'plumbing',
    maxRequestsPerDay:
      Number.isFinite(Number(automation?.maxRequestsPerDay)) && Number(automation?.maxRequestsPerDay) > 0
        ? Number(automation.maxRequestsPerDay)
        : defaults.maxRequestsPerDay,
    requestsUsedToday: Number.isFinite(requestsUsedToday) && requestsUsedToday > 0 ? requestsUsedToday : 0,
    requestsUsedOn: stringOrDefault(automation?.requestsUsedOn, ''),
    fallbackOnFailure: parseBooleanLoose(automation?.fallbackOnFailure, true),
    implementationStatus: tier === 'starter' ? 'starter_ready' : 'upgrade_path',
  };
}

function normalizeLeads(leads) {
  if (!Array.isArray(leads)) {
    return [];
  }

  return leads.map((lead) => normalizeLead(lead));
}

function normalizeLead(lead) {
  const now = new Date().toISOString();
  return {
    leadId: stringOrDefault(lead?.leadId, `lead_${randomUUID()}`),
    phone: normalizeUsPhone(stringOrDefault(lead?.phone, '')),
    name: stringOrDefault(lead?.name, ''),
    email: stringOrDefault(lead?.email, ''),
    serviceCategory: stringOrDefault(lead?.serviceCategory, ''),
    stage: stringOrDefault(lead?.stage, 'new'),
    urgencyScore: Number(lead?.urgencyScore || 0),
    urgencyLabel: ['normal', 'priority', 'emergency'].includes(stringOrDefault(lead?.urgencyLabel, ''))
      ? stringOrDefault(lead?.urgencyLabel, '')
      : undefined,
    address: stringOrDefault(lead?.address, ''),
    notes: stringOrDefault(lead?.notes, ''),
    lastInboundMessage: stringOrDefault(lead?.lastInboundMessage, ''),
    messaging: normalizeLeadMessaging(lead?.messaging),
    intake: normalizeLeadIntake(lead?.intake),
    updatedAt: stringOrDefault(lead?.updatedAt, now),
    createdAt: stringOrDefault(lead?.createdAt, now),
  };
}

function normalizeLeadMessaging(messaging) {
  const consentStatus = stringOrDefault(messaging?.consentStatus, '').toLowerCase();
  return {
    consentStatus: ['unknown', 'active', 'opted_out'].includes(consentStatus) ? consentStatus : 'unknown',
    consentSource: stringOrDefault(messaging?.consentSource, ''),
    consentUpdatedAt: stringOrDefault(messaging?.consentUpdatedAt, ''),
    optedOutAt: stringOrDefault(messaging?.optedOutAt, ''),
    lastHelpSentAt: stringOrDefault(messaging?.lastHelpSentAt, ''),
    lastKeyword: stringOrDefault(messaging?.lastKeyword, ''),
    lastOutboundStatus: stringOrDefault(messaging?.lastOutboundStatus, ''),
    lastOutboundStatusAt: stringOrDefault(messaging?.lastOutboundStatusAt, ''),
    lastOutboundMessageSid: stringOrDefault(messaging?.lastOutboundMessageSid, ''),
    lastOutboundError: stringOrDefault(messaging?.lastOutboundError, ''),
  };
}

function normalizeLeadIntake(intake) {
  if (!intake || typeof intake !== 'object') {
    return undefined;
  }

  const currentQuestionKey = stringOrDefault(intake.currentQuestionKey, '');
  return {
    status: ['idle', 'in_progress', 'completed'].includes(stringOrDefault(intake.status, ''))
      ? stringOrDefault(intake.status, '')
      : 'idle',
    playbook: STARTER_PLUMBING_PLAYBOOK,
    currentQuestionKey: STARTER_PLUMBING_QUESTION_ORDER.includes(currentQuestionKey)
      ? currentQuestionKey
      : undefined,
    answers: {
      issueType: stringOrDefault(intake.answers?.issueType, ''),
      issueDescription: stringOrDefault(intake.answers?.issueDescription, ''),
      otherDetail: stringOrDefault(intake.answers?.otherDetail, ''),
      severityDetail: stringOrDefault(intake.answers?.severityDetail, ''),
      urgentDamage: stringOrDefault(intake.answers?.urgentDamage, ''),
      location: stringOrDefault(intake.answers?.location, ''),
      customerName: stringOrDefault(intake.answers?.customerName, ''),
    },
    startedAt: stringOrDefault(intake.startedAt, ''),
    completedAt: stringOrDefault(intake.completedAt, ''),
    ownerSummarySentAt: stringOrDefault(intake.ownerSummarySentAt, ''),
  };
}

function normalizeMetrics(metrics) {
  return {
    missedCallsRecovered: Number(metrics.missedCallsRecovered || 0),
    inboundAutoReplies: Number(metrics.inboundAutoReplies || 0),
    leadIntakes: Number(metrics.leadIntakes || 0),
    actionSuccess: Number(metrics.actionSuccess || 0),
    actionFailures: Number(metrics.actionFailures || 0),
    lastUpdatedAt: metrics.lastUpdatedAt || undefined,
  };
}

function normalizeFollowups(followups) {
  if (!Array.isArray(followups)) {
    return [];
  }

  return followups.map((followup) => normalizeFollowup(followup));
}

function normalizeFollowup(followup) {
  const now = new Date().toISOString();
  const leadPhone = normalizeUsPhone(stringOrDefault(followup?.leadPhone, ''));
  const followupType = stringOrDefault(followup?.followupType, 'manual_followup');
  const status = stringOrDefault(followup?.status, 'pending').toLowerCase();
  return {
    followupId: stringOrDefault(followup?.followupId, `follow_${randomUUID()}`),
    followupType,
    taskType: stringOrDefault(followup?.taskType, buildFollowupTaskType(followupType, leadPhone)),
    title: stringOrDefault(followup?.title, 'Customer follow-up'),
    detail: stringOrDefault(followup?.detail, ''),
    leadPhone,
    severity: stringOrDefault(followup?.severity, 'medium'),
    status: status === 'due' || status === 'done' ? status : 'pending',
    scheduledFor: stringOrDefault(followup?.scheduledFor, now),
    ownerAlertSentAt: stringOrDefault(followup?.ownerAlertSentAt, ''),
    createdAt: stringOrDefault(followup?.createdAt, now),
    updatedAt: stringOrDefault(followup?.updatedAt, now),
  };
}

function buildWorkspace(store, appId, tenantId) {
  const tenant = ensureTenant(store, appId, tenantId);
  const smsConnector = tenant.connectors.sms;
  const smsLive = Boolean(smsConnector?.live);
  const deployment = buildDeploymentStatus();
  const ownerAlertPhoneReady = isSmsAlertDestination(tenant.settings.ownerAlertDestination);
  const ownerEmailReady = Boolean(resolveNotificationEndpoint(tenant.settings.email));
  const calendarReady = Boolean(resolveNotificationEndpoint(tenant.settings.calendar));
  const mainBusinessNumbers = getConfiguredBusinessNumbers(tenant.profile);
  const effectiveSmsSettings = smsLive
    ? {
      ...tenant.settings.sms,
      provider: smsConnector.provider || tenant.settings.sms.provider,
      connectorId: smsConnector.connectorId || tenant.settings.sms.connectorId,
    }
    : tenant.settings.sms;
  const checklist = [
    buildChecklistItem(
      'business_name',
      'Business name',
      Boolean(tenant.profile.businessName),
      'required',
      'Used in customer-facing messages and handoff notes.'
    ),
    buildChecklistItem(
      'callback_number',
      'Twilio relay number',
      Boolean(tenant.profile.callbackNumber),
      'required',
      'This is the Twilio number that receives forwarded missed calls and sends the text-back.'
    ),
    buildChecklistItem(
      'main_business_number',
      mainBusinessNumbers.length > 1 ? 'Client main phone numbers' : 'Client main phone number',
      Boolean(mainBusinessNumbers.length),
      'recommended',
      mainBusinessNumbers.length > 1
        ? 'These are the real business numbers customers dial before missed calls forward to the Twilio relay line.'
        : 'This is the real business number customers dial before missed calls forward to the Twilio relay line.'
    ),
    buildChecklistItem(
      'owner_alert_destination',
      'Owner alert contact',
      ownerAlertPhoneReady || ownerEmailReady,
      'required',
      ownerAlertPhoneReady || ownerEmailReady
        ? ownerAlertPhoneReady && ownerEmailReady
          ? 'Urgent alerts can be sent by SMS and email.'
          : ownerAlertPhoneReady
            ? 'Urgent alerts can be sent to this owner phone number.'
            : 'Urgent alerts can be sent to the configured owner email endpoint.'
        : 'Add an owner phone number or email webhook so urgent alerts can reach a human.'
    ),
    buildChecklistItem(
      'response_channel',
      'Twilio SMS channel',
      smsLive,
      'required',
      smsLive
        ? 'Twilio SMS is connected and ready for missed-call recovery.'
        : 'Connect Twilio so missed calls can trigger an immediate text-back.'
    ),
    buildChecklistItem(
      'public_webhook',
      'Public webhook URL',
      deployment.twilioReady,
      'required',
      deployment.twilioReady
        ? 'Twilio can reach the webhook URL from outside the local machine.'
        : deployment.detail
    ),
    buildChecklistItem(
      'website_url',
      'Website',
      Boolean(tenant.settings.websiteUrl),
      'recommended',
      'Used for business discovery and handoff context.'
    ),
    buildChecklistItem(
      'review_url',
      'Review link',
      Boolean(tenant.settings.reviewUrl || calendarReady),
      'recommended',
      calendarReady
        ? 'Calendar sync is ready for completed-job follow-up events.'
        : 'Needed later for completed-job review follow-up.'
    ),
  ];

  const requiredItems = checklist.filter((item) => item.severity === 'required');
  const requiredComplete = requiredItems.filter((item) => item.status === 'complete').length;
  const mode = requiredComplete === requiredItems.length ? 'live' : 'protected';

  return {
    tenantId,
    profile: tenant.profile,
    settings: {
      ...tenant.settings,
      sms: effectiveSmsSettings,
    },
    metrics: {
      ...tenant.metrics,
      lastUpdatedAt: tenant.updatedAt,
    },
    leads: tenant.leads,
    followups: [...tenant.followups].sort((a, b) => Date.parse(a.scheduledFor) - Date.parse(b.scheduledFor)),
    activity: [...tenant.activity].sort((a, b) => Date.parse(b.timestamp) - Date.parse(a.timestamp)),
    tasks: [...tenant.tasks].sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt)),
    onboarding: {
      mode,
      checklist,
      channels: {
        sms: {
          status: smsLive ? 'live' : smsConnector ? 'configured' : 'missing',
          provider: effectiveSmsSettings.provider,
          connectorId: effectiveSmsSettings.connectorId || undefined,
          live: smsLive,
          detail: smsLive
            ? deployment.twilioReady
              ? smsConnector.summary || 'Twilio SMS is connected.'
              : 'Twilio is connected, but the public webhook URL is still missing.'
            : 'Twilio is not connected yet.',
        },
        email: {
          status: resolveNotificationEndpoint(tenant.settings.email) ? 'live' : tenant.settings.email.provider !== 'simulated' ? 'configured' : 'missing',
          provider: tenant.settings.email.provider,
          connectorId: tenant.settings.email.connectorId || undefined,
          live: Boolean(resolveNotificationEndpoint(tenant.settings.email)),
          detail: resolveNotificationEndpoint(tenant.settings.email)
            ? 'Email alerts are connected through the configured webhook endpoint.'
            : 'Email is not connected in this local gateway.',
        },
        calendar: {
          status: resolveNotificationEndpoint(tenant.settings.calendar) ? 'live' : tenant.settings.calendar.provider !== 'simulated' ? 'configured' : 'missing',
          provider: tenant.settings.calendar.provider,
          connectorId: tenant.settings.calendar.connectorId || undefined,
          live: Boolean(resolveNotificationEndpoint(tenant.settings.calendar)),
          detail: resolveNotificationEndpoint(tenant.settings.calendar)
            ? 'Calendar sync is connected through the configured webhook endpoint.'
            : 'Calendar is not connected in this local gateway.',
        },
      },
      summary: {
        requiredComplete,
        requiredTotal: requiredItems.length,
        blockerCount: requiredItems.length - requiredComplete,
        missingCount: checklist.filter((item) => item.status !== 'complete').length,
      },
    },
    summary: {
      leadCount: tenant.leads.length,
      pendingFollowups: tenant.followups.filter((item) => item.status !== 'done').length,
      dueFollowups: tenant.followups.filter((item) => item.status === 'due').length,
      lastActivityAt: tenant.activity[0]?.timestamp,
      openTaskCount: tenant.tasks.filter((item) => item.status !== 'done').length,
      mode,
    },
  };
}

function buildTenantSummaries(store, appId) {
  const app = ensureApp(store, appId);
  return Object.entries(app.tenants)
    .filter(([, tenant]) => {
      return Boolean(
        tenant.profile.businessName ||
        tenant.profile.callbackNumber ||
        tenant.activity.length ||
        tenant.tasks.length ||
        tenant.leads.length ||
        tenant.connectors.sms?.live
      );
    })
    .map(([tenantId, tenant]) => {
      const workspace = buildWorkspace(store, appId, tenantId);
      return {
        tenantId,
        businessName: tenant.profile.businessName || tenantId,
        callbackNumber: tenant.profile.callbackNumber || '',
        mainBusinessNumbers: getConfiguredBusinessNumbers(tenant.profile),
        updatedAt: tenant.updatedAt,
        lastActivityAt: workspace.summary.lastActivityAt,
        mode: workspace.summary.mode,
        smsLive: workspace.onboarding.channels.sms.live,
        recoveredCalls: workspace.metrics.missedCallsRecovered,
        openTaskCount: workspace.summary.openTaskCount,
        leadCount: workspace.summary.leadCount,
      };
    })
    .sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt));
}

function duplicateTenant(body, store, appId) {
  const sourceTenantId = stringOrDefault(body.source_tenant_id, '');
  const targetTenantId = stringOrDefault(body.target_tenant_id, '');
  const businessName = stringOrDefault(body.business_name, '');
  const primaryNumber = stringOrDefault(body.main_business_number, '');
  const mainBusinessNumbers = normalizePhoneList(body.main_business_numbers, primaryNumber);

  if (!sourceTenantId) {
    throw new Error('Source business ID is required to duplicate a client.');
  }
  if (!targetTenantId) {
    throw new Error('New business ID is required to duplicate a client.');
  }
  if (sourceTenantId === targetTenantId) {
    throw new Error('The new business ID must be different from the source business ID.');
  }
  if (!businessName) {
    throw new Error('New business name is required to duplicate a client.');
  }

  const app = ensureApp(store, appId);
  const sourceTenant = app.tenants[sourceTenantId];
  if (!sourceTenant) {
    throw new Error(`Source business ${sourceTenantId} was not found.`);
  }
  if (app.tenants[targetTenantId]) {
    throw new Error(`Business ID ${targetTenantId} already exists.`);
  }

  const defaults = normalizeSettings({});
  app.tenants[targetTenantId] = normalizeTenant({
    profile: {
      ...sourceTenant.profile,
      businessId: targetTenantId,
      businessName,
      mainBusinessNumber: primaryNumber,
      mainBusinessNumbers,
      callbackNumber: '',
    },
    settings: {
      ...sourceTenant.settings,
      websiteUrl: '',
      bookingLink: '',
      reviewUrl: '',
      ownerAlertDestination: '',
      contactEmail: '',
      sms: defaults.sms,
      email: defaults.email,
      calendar: defaults.calendar,
    },
    connectors: {
      sms: null,
    },
    metrics: {
      missedCallsRecovered: 0,
      inboundAutoReplies: 0,
      leadIntakes: 0,
      actionSuccess: 0,
      actionFailures: 0,
    },
    leads: [],
    followups: [],
    activity: [],
    tasks: [],
  });

  addActivity(app.tenants[targetTenantId], {
    kind: 'tenant.duplicated',
    status: 'success',
    title: 'Client duplicated from template',
    summary: `Copied setup patterns from ${sourceTenant.profile.businessName || sourceTenantId}. Twilio wiring was intentionally cleared.`,
  });

  return {
    sourceTenantId,
    tenantId: targetTenantId,
    workspace: buildWorkspace(store, appId, targetTenantId),
  };
}

function buildChecklistItem(itemId, title, complete, severity, detail) {
  return {
    itemId,
    title,
    status: complete ? 'complete' : 'missing',
    severity,
    detail,
  };
}

function buildRuntimeStatus(store, appId) {
  const appCount = Object.keys(store.apps).length;
  const configuredClients = Object.values(store.apps).reduce(
    (total, appState) => total + Object.keys(appState?.tenants || {}).length,
    0
  );
  return {
    service: 'responseos-gateway',
    bind: {
      host: HOST,
      port: PORT,
    },
    publicBaseUrl: PUBLIC_BASE_URL || null,
    deployment: buildDeploymentStatus(),
    storage: {
      provider: 'json',
      dataDir: DATA_DIR,
    },
    security: {
      credentialsAtRest: CREDENTIAL_ENCRYPTION_ENABLED ? 'encrypted' : 'plaintext',
      credentialKeyConfigured: CREDENTIAL_ENCRYPTION_ENABLED,
      detail: CREDENTIAL_ENCRYPTION_ENABLED
        ? 'Twilio auth tokens are encrypted at rest with RESPONSEOS_CREDENTIAL_KEY.'
        : 'Twilio auth tokens are still stored in plaintext until RESPONSEOS_CREDENTIAL_KEY is configured.',
    },
    automation: {
      followupRunnerEnabled: FOLLOWUP_RUNNER_ENABLED,
      followupRunnerRunning: FOLLOWUP_RUNNER_ENABLED && followupRunnerRunning,
      followupRunnerBusy,
      followupRunnerIntervalMs: FOLLOWUP_RUNNER_INTERVAL_MS,
      followupRunnerLimitPerTenant: FOLLOWUP_RUNNER_LIMIT_PER_TENANT,
    },
    identity: {
      clientId: 'local-dev',
      appId,
      policyProfile: 'local-dev',
      configuredClients,
      configuredApps: appCount,
      defaultProvider: M_CORE_EFFECTIVE_PROVIDER,
    },
  };
}

function buildDeploymentStatus() {
  if (DEPLOYMENT_MODE === 'hosted') {
    return {
      mode: 'hosted',
      label: 'Hosted server',
      detail: PUBLIC_BASE_URL
        ? 'Twilio can reach this hosted gateway directly. Uptime no longer depends on one studio workstation staying on.'
        : 'This gateway is marked as hosted, but RESPONSEOS_PUBLIC_BASE_URL is still missing.',
      requiresMachineToStayOn: false,
      twilioReady: Boolean(PUBLIC_BASE_URL),
    };
  }

  if (DEPLOYMENT_MODE === 'network_private') {
    return {
      mode: 'network_private',
      label: 'Private network host',
      detail:
        'This gateway is running on a private host. Twilio still needs a public reverse proxy or tunnel to reach it.',
      requiresMachineToStayOn: false,
      twilioReady: false,
    };
  }

  if (PUBLIC_BASE_URL) {
    return {
      mode: 'public_to_local',
      label: 'Public URL to this machine',
      detail:
        'Twilio can reach the configured public URL, but uptime still depends on this machine staying on.',
      requiresMachineToStayOn: true,
      twilioReady: true,
    };
  }

  return {
    mode: 'local_only',
    label: 'Local machine only',
    detail:
      'This gateway is only reachable on the local network right now. Twilio still needs a public hostname or tunnel.',
    requiresMachineToStayOn: true,
    twilioReady: false,
  };
}

function isSmsAlertDestination(value) {
  return normalizeUsPhone(stringOrDefault(value, '')).startsWith('+');
}

function resolveNotificationEndpoint(channel) {
  const provider = stringOrDefault(channel?.provider, '').toLowerCase();
  if (provider === 'simulated') {
    return '';
  }

  const endpoint = stringOrDefault(channel?.path, '');
  if (!endpoint) {
    return '';
  }

  if (/^https?:\/\//i.test(endpoint)) {
    return endpoint;
  }

  if (PUBLIC_BASE_URL) {
    try {
      return new URL(endpoint.startsWith('/') ? endpoint : `/${endpoint}`, ensureTrailingSlash(PUBLIC_BASE_URL)).toString();
    } catch {
      return '';
    }
  }

  return '';
}

async function sendWebhookJson(endpoint, payload) {
  if (!endpoint) {
    return false;
  }

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Webhook request failed with status ${response.status}.`);
  }

  return true;
}

async function generateSetupAssist(body, tenantId, tenant) {
  const profile = normalizeProfile({
    ...tenant.profile,
    ...(body.profile || {}),
    businessId: tenantId,
  });
  const settings = normalizeSettings({
    ...tenant.settings,
    ...(body.settings || {}),
  });
  tenant.settings = settings;
  const fallback = buildFallbackSetupAssist(profile, settings);

  let assistantResponse = fallback.assistantResponse;

  try {
    assistantResponse = await runSetupAssistThroughAutomation({
      tenant,
      tenantId,
      profile,
      settings,
      fallback,
    });
    const parsed = parseSetupAssistPayload(assistantResponse);
    if (!parsed) {
      return {
        ...fallback,
        assistantResponse,
      };
    }

    return {
      provider: buildMCoreProviderStatus(),
      summary: stringOrDefault(parsed.summary, fallback.summary),
      assistantResponse,
      missedCallReply: stringOrDefault(parsed.missedCallReply, fallback.missedCallReply),
      replyOptions: sanitizeReplyOptions(parsed.replyOptions, fallback.replyOptions),
      implementationNotes: sanitizeImplementationNotes(parsed.implementationNotes, fallback.implementationNotes),
    };
  } catch (error) {
    assistantResponse = error instanceof Error ? error.message : 'M-CORE setup assist failed.';
  }

  return {
    ...fallback,
    assistantResponse,
  };
}

async function discoverWebsite(body) {
  const websiteUrl = stringOrDefault(body.website_url, '');
  if (!websiteUrl) {
    throw new Error('Website URL is required.');
  }

  const response = await fetch(websiteUrl, {
    headers: {
      'user-agent': 'ResponseOS Local Gateway',
    },
  });
  if (!response.ok) {
    throw new Error(`Website scan failed with status ${response.status}.`);
  }
  const html = await response.text();
  const title = firstMatch(html, /<title[^>]*>(.*?)<\/title>/is);
  const bodyText = stripHtml(html);
  const emails = uniqueMatches(html, /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi).slice(0, 3);
  const phones = uniqueMatches(
    bodyText,
    /(?:\+?1[\s.-]?)?(?:\(\d{3}\)|\d{3})[\s.-]?\d{3}[\s.-]?\d{4}/g
  ).map(normalizeUsPhone);
  const headings = uniqueMatches(html, /<(?:h1|h2)[^>]*>(.*?)<\/(?:h1|h2)>/gis)
    .map((value) => stripHtml(value))
    .filter((value) => value.length >= 3 && value.length <= 60)
    .slice(0, 6);

  const servicesFound = headings.filter((item) => !/contact|about|home|reviews?/i.test(item)).slice(0, 4);
  const notes = [];
  if (title) notes.push(`Found page title: ${title}.`);
  if (emails[0]) notes.push(`Found email: ${emails[0]}.`);
  if (phones[0]) notes.push(`Found phone: ${phones[0]}.`);

  const foundCount = [title, emails[0], phones[0], ...servicesFound].filter(Boolean).length;

  return {
    websiteUrl,
    scannedPages: [
      {
        url: websiteUrl,
        title: title || undefined,
        kind: 'homepage',
      },
    ],
    profile: {
      businessName: stringOrDefault(body.business_name, title || ''),
      mainBusinessNumber: stringOrDefault(body.main_business_number, phones[0] || ''),
      mainBusinessNumbers: phones.length ? [phones[0]] : [],
      services: servicesFound,
    },
    settings: {
      websiteUrl,
      contactEmail: emails[0] || '',
      bookingLink: '',
      reviewUrl: '',
    },
    summary: {
      foundCount,
      scannedCount: 1,
      servicesFound,
      hoursSummary: undefined,
      notes,
    },
  };
}

async function runSetupAssistThroughAutomation({ tenant, tenantId, profile, settings, fallback }) {
  const automation = normalizeAutomationSettings(settings.automation || tenant.settings.automation || {});
  const plan = buildAutomationPlan(automation);
  const budget = consumeAutomationRequestBudget(tenant);
  const prompt = buildSetupAssistPrompt(profile, settings);
  const cloudRunner = async () => {
    const result = await M_CORE_RUNTIME.run({
      prompt,
      intent: 'workspace-briefing',
      workspace: {
        name: profile.businessName || tenantId,
        rootPath: process.cwd(),
      },
      mode: 'product',
      presetId: 'general-nss-studio',
      studioProjectId: 'general-nss-studio',
      knowledge: [
        {
          title: 'ResponseOS plumbing starter requirements',
          path: 'server/index.mjs',
          excerpt:
            'Keep the missed-call SMS concise, do not mention AI or model names, sell Starter Pro Elite as automation power, and keep the plumbing starter intake grounded and reviewable.',
        },
      ],
      task: {
        commandLine: 'responseos.plumbing-starter.setup-assist',
        exitCode: 0,
        stderr: '',
        summary: `Generate better Starter plumbing setup copy for ${profile.businessName || tenantId}.`,
      },
    });
    return result.response;
  };

  if (!budget.allowed) {
    if (automation.fallbackOnFailure) {
      return fallback.assistantResponse;
    }
    throw new Error(
      `Daily automation request cap reached for ${plan.tierLabel}. Increase maxRequestsPerDay or use fallback mode.`
    );
  }

  if (automation.mode === 'local') {
    try {
      return await runOllamaSetupAssist(prompt, plan);
    } catch (error) {
      if (!automation.fallbackOnFailure) {
        throw error;
      }
      return fallback.assistantResponse;
    }
  }

  if (automation.mode === 'cloud') {
    try {
      return await cloudRunner();
    } catch (error) {
      if (!automation.fallbackOnFailure) {
        throw error;
      }
      return fallback.assistantResponse;
    }
  }

  try {
    return await runOllamaSetupAssist(prompt, plan);
  } catch (localError) {
    try {
      return await cloudRunner();
    } catch (cloudError) {
      if (!automation.fallbackOnFailure) {
        throw new Error(
          `Hybrid automation failed. Local: ${errorMessage(localError)} Cloud: ${errorMessage(cloudError)}`
        );
      }
      return fallback.assistantResponse;
    }
  }
}

async function runOllamaSetupAssist(prompt, plan) {
  const response = await fetch(new URL('/api/generate', ensureTrailingSlash(OLLAMA_BASE_URL)), {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: plan.localModel,
      prompt,
      stream: false,
      system:
        'You are the internal ResponseOS automation writer. Return strict JSON only with the required keys and never mention model names or AI vendors.',
      options: {
        temperature: 0.2,
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`Ollama request failed with status ${response.status}.`);
  }

  const payload = await response.json();
  const text = stringOrDefault(payload?.response, '');
  if (!text) {
    throw new Error('Ollama returned an empty setup-assist response.');
  }
  return text;
}

function buildAutomationPlan(automation) {
  const defaults = AUTOMATION_TIER_DEFAULTS[automation.tier] || AUTOMATION_TIER_DEFAULTS.starter;
  return {
    tier: automation.tier,
    tierLabel: capitalizeWord(automation.tier),
    mode: automation.mode,
    localModel: defaults.localModel,
    cloudLabel: defaults.cloudLabel,
  };
}

function consumeAutomationRequestBudget(tenant) {
  const automation = normalizeAutomationSettings(tenant.settings.automation || {});
  const dayKey = buildAutomationDayKey(tenant.profile.timezone || 'America/New_York');

  if (automation.requestsUsedOn !== dayKey) {
    automation.requestsUsedOn = dayKey;
    automation.requestsUsedToday = 0;
  }

  if (automation.requestsUsedToday >= automation.maxRequestsPerDay) {
    tenant.settings.automation = automation;
    return {
      allowed: false,
      automation,
    };
  }

  automation.requestsUsedToday += 1;
  tenant.settings.automation = automation;
  return {
    allowed: true,
    automation,
  };
}

function buildAutomationDayKey(timezone) {
  try {
    return new Intl.DateTimeFormat('en-CA', {
      timeZone: timezone || 'America/New_York',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(new Date());
  } catch {
    return new Date().toISOString().slice(0, 10);
  }
}

function buildFallbackSetupAssist(profile, settings) {
  const automation = normalizeAutomationSettings(settings.automation || {});
  const plan = buildAutomationPlan(automation);
  const businessName = stringOrDefault(profile.businessName, '').trim();
  const serviceArea = stringOrDefault(profile.serviceArea, '').trim();
  const replyOptions = {
    '1': {
      key: '1',
      title: 'Leak',
      reply: 'Tell us your name so we can route the plumbing issue correctly.',
    },
    '2': {
      key: '2',
      title: 'Clog',
      reply: 'Tell us your name so we can route the plumbing issue correctly.',
    },
    '3': {
      key: '3',
      title: 'Other',
      reply: 'Tell us your name and a short note about the plumbing issue.',
    },
    '4': {
      key: '4',
      title: 'Urgent',
      reply: 'Tell us the address and whether water is actively leaking or backing up right now.',
    },
  };

  const missedCallReply = buildStarterPlumbingOpening(businessName);

  const implementationNotes = [
    `${plan.tierLabel} tier is set to ${automation.mode} mode with a daily cap of ${automation.maxRequestsPerDay} automation request(s).`,
    'Starter plumbing flow asks the issue type, the leak or clog severity branch when needed, urgent damage, the location, and the customer name.',
    settings.websiteUrl ? `Website detected: ${settings.websiteUrl}.` : 'Add the client website before launch for cleaner handoff notes.',
    profile.callbackNumber
      ? `Twilio relay number is set to ${profile.callbackNumber}.`
      : 'Add the Twilio relay number before connecting the live webhook.',
    settings.ownerAlertDestination
      ? 'Owner alert destination is configured.'
      : 'Set the owner alert destination so urgent missed calls can escalate to a human.',
  ];

  return {
    provider: buildMCoreProviderStatus(),
    summary: `Prepared ${plan.tierLabel} plumbing automation for ${businessName || tenantIdLabel(profile.businessId)}.`,
    assistantResponse: `${plan.tierLabel} plumbing fallback automation is ready.`,
    missedCallReply,
    replyOptions,
    implementationNotes,
  };
}

function buildSetupAssistPrompt(profile, settings) {
  const automation = normalizeAutomationSettings(settings.automation || {});
  const plan = buildAutomationPlan(automation);
  const businessNumbers = getConfiguredBusinessNumbers(profile);
  return [
    'Generate better missed-call text-back setup suggestions for this business.',
    'Return only strict JSON in the response string.',
    'Required keys: summary, missedCallReply, replyOptions, implementationNotes.',
    'replyOptions must be an object with keys 1, 2, 3, 4 and each value must contain title and reply.',
    'Do not invent phone numbers, email addresses, or owner contacts.',
    'Do not mention AI, model names, providers, M-CORE, or internal systems in the customer-facing copy.',
    'The offer is sold as Starter, Pro, and Elite levels of automation power.',
    'This implementation currently ships the Starter plumbing playbook first.',
    'Keep the missedCallReply concise and clear.',
    `Tier: ${plan.tierLabel}.`,
    `Runtime mode: ${automation.mode}.`,
    `Internal local route: ${plan.localModel}.`,
    `Internal cloud route: ${plan.cloudLabel}.`,
    `Business name: ${profile.businessName || 'Unknown business'}.`,
    `Client-facing business numbers: ${businessNumbers.length ? businessNumbers.join(', ') : 'not provided'}.`,
    `Services: ${(profile.services || []).join(', ') || 'service'}.`,
    `Service area: ${profile.serviceArea || 'not provided'}.`,
    `Website: ${settings.websiteUrl || 'not provided'}.`,
    `Current missed-call reply: ${profile.templates?.missedCallReply || buildStarterPlumbingOpening(profile.businessName || '')}.`,
    `Current reply options: ${JSON.stringify(normalizeReplyOptions(profile.templates?.replyOptions))}.`,
    'Starter plumbing flow should open with leak, clog, water heater, or something else and then collect the severity branch, urgent damage, location, and customer name.',
  ].join(' ');
}

function buildStarterPlumbingOpening(businessName) {
  const name = stringOrDefault(businessName, '').trim();
  if (!name) {
    return "Hey, sorry we missed your call. What's going on - leak, clog, water heater, or something else?";
  }
  return `Hey, this is ${name}. Sorry we missed your call. What's going on - leak, clog, water heater, or something else?`;
}

function capitalizeWord(value) {
  const normalized = stringOrDefault(value, '').trim();
  if (!normalized) {
    return 'Starter';
  }
  return `${normalized.charAt(0).toUpperCase()}${normalized.slice(1)}`;
}

function errorMessage(error) {
  return error instanceof Error ? error.message : String(error);
}

function parseSetupAssistPayload(responseText) {
  const trimmed = String(responseText || '').trim();
  if (!trimmed) {
    return null;
  }

  const fenceMatch = trimmed.match(/```json\s*([\s\S]*?)```/i);
  const candidate = fenceMatch ? fenceMatch[1].trim() : trimmed;
  const jsonCandidate =
    candidate.startsWith('{') && candidate.endsWith('}')
      ? candidate
      : candidate.slice(candidate.indexOf('{'), candidate.lastIndexOf('}') + 1);

  if (!jsonCandidate || !jsonCandidate.startsWith('{')) {
    return null;
  }

  try {
    return JSON.parse(jsonCandidate);
  } catch {
    return null;
  }
}

function sanitizeReplyOptions(replyOptions, fallbackOptions) {
  const merged = normalizeReplyOptions(replyOptions || fallbackOptions);
  return {
    '1': sanitizeReplyOption('1', merged['1'], fallbackOptions['1']),
    '2': sanitizeReplyOption('2', merged['2'], fallbackOptions['2']),
    '3': sanitizeReplyOption('3', merged['3'], fallbackOptions['3']),
    '4': sanitizeReplyOption('4', merged['4'], fallbackOptions['4']),
  };
}

function sanitizeReplyOption(key, option, fallback) {
  return {
    key,
    title: stringOrDefault(option?.title, fallback.title).slice(0, 40).trim(),
    reply: stringOrDefault(option?.reply, fallback.reply).slice(0, 280).trim(),
  };
}

function sanitizeImplementationNotes(notes, fallbackNotes) {
  if (!Array.isArray(notes) || notes.length === 0) {
    return fallbackNotes;
  }

  return notes
    .map((item) => stringOrDefault(item, '').trim())
    .filter(Boolean)
    .slice(0, 5);
}

function buildMCoreProviderStatus() {
  return {
    selected: M_CORE_SELECTED_PROVIDER,
    effective: M_CORE_EFFECTIVE_PROVIDER,
    label:
      M_CORE_EFFECTIVE_PROVIDER === 'gemini'
        ? 'Cloud automation ready'
        : M_CORE_EFFECTIVE_PROVIDER === 'mock'
          ? 'Template fallback ready'
          : 'Automation disabled',
    detail:
      M_CORE_EFFECTIVE_PROVIDER === 'gemini'
        ? 'Cloud automation can be used when the tenant runtime is set to cloud or hybrid mode.'
        : M_CORE_EFFECTIVE_PROVIDER === 'mock'
          ? 'Cloud generation is unavailable, so ResponseOS will use safe fallback templates.'
          : 'No automation provider is enabled right now.',
  };
}

function resolveMCoreSelectedProvider() {
  const requested = stringOrDefault(
    process.env.M_CORE_PROVIDER_MODE || process.env.RESPONSE_OS_PROVIDER_MODE || process.env.NSS_WORKSPACE_AI_PROVIDER_MODE,
    ''
  )
    .trim()
    .toLowerCase();

  if (requested === 'off' || requested === 'mock' || requested === 'gemini') {
    return requested;
  }

  return process.env.M_CORE_GEMINI_API_KEY || process.env.RESPONSE_OS_GEMINI_API_KEY || process.env.GEMINI_API_KEY
    ? 'gemini'
    : 'mock';
}

function resolveMCoreEffectiveProvider(selectedProvider, geminiApiKey) {
  if (selectedProvider === 'off' || selectedProvider === 'mock') {
    return selectedProvider;
  }

  return String(geminiApiKey || '').trim() ? 'gemini' : 'mock';
}

function tenantIdLabel(value) {
  return stringOrDefault(value, 'this business');
}

async function validateConnector(body, store, appId) {
  const provider = stringOrDefault(body.provider, '');
  if (provider !== 'twilio') {
    throw new Error('Only Twilio validation is implemented in this local gateway.');
  }

  const config = body.config || {};
  const accountSid = stringOrDefault(config.account_sid, '');
  const authToken = stringOrDefault(config.auth_token, '');
  if (!accountSid || !authToken) {
    throw new Error('Twilio Account SID and Auth Token are required.');
  }

  const account = await fetchTwilioAccount(config);
  ensureApp(store, appId);
  return {
    valid: true,
    message: `Twilio credentials verified for ${account.friendly_name || maskValue(accountSid)}.`,
  };
}

async function bootstrapConnector(body, store, appId, tenant) {
  const provider = stringOrDefault(body.provider, '');
  if (provider !== 'twilio') {
    throw new Error('Only Twilio bootstrap is implemented in this local gateway.');
  }

  const config = body.config || {};
  const accountSid = stringOrDefault(config.account_sid, '');
  const authToken = stringOrDefault(config.auth_token, '');
  const connectorId = stringOrDefault(config.connector_id, 'twilio-sms');
  const baseUrl = stringOrDefault(config.base_url, '');

  if (!tenant.profile.callbackNumber) {
    throw new Error('Save the callback number before bootstrapping Twilio.');
  }
  assertUniqueCallbackNumber(store, appId, tenant.profile.businessId, tenant.profile.callbackNumber);

  await fetchTwilioAccount(config);
  const numberInfo = await fetchIncomingPhoneNumber({
    accountSid,
    authToken,
    baseUrl,
    phoneNumber: tenant.profile.callbackNumber,
  });

  if (!numberInfo) {
    throw new Error(
      `The callback number ${tenant.profile.callbackNumber} was not found in this Twilio account.`
    );
  }

  const smsCapable = Boolean(numberInfo.capabilities?.sms);
  const voiceCapable = Boolean(numberInfo.capabilities?.voice);
  if (!smsCapable || !voiceCapable) {
    throw new Error(
      `The callback number ${tenant.profile.callbackNumber} must support both SMS and Voice.`
    );
  }

  tenant.connectors.sms = {
    provider: 'twilio',
    connectorId,
    accountSid,
    authToken,
    baseUrl,
    fromNumber: tenant.profile.callbackNumber,
    live: true,
    summary: `Twilio relay connected on ${tenant.profile.callbackNumber}.`,
  };
  tenant.settings.sms = {
    provider: 'twilio',
    connectorId,
    path: `/2010-04-01/Accounts/${accountSid}/Messages.json`,
  };

  const webhookUrl = buildTwilioWebhookUrl(store, appId);
  if (webhookUrl && numberInfo.sid) {
    await updateIncomingPhoneNumberWebhooks({
      accountSid,
      authToken,
      baseUrl,
      incomingPhoneNumberSid: numberInfo.sid,
      webhookUrl,
    });
  }

  addActivity(tenant, {
    kind: 'connector.bootstrap',
    status: 'success',
    title: 'Twilio connected',
    summary: webhookUrl
      ? `Twilio relay and webhooks were connected for ${tenant.profile.callbackNumber}.`
      : `Twilio relay was connected for ${tenant.profile.callbackNumber}. Add a public webhook URL to finish wiring Twilio.`,
  });

  return {
    summary: webhookUrl
      ? `Twilio relay connected and webhook wiring updated for ${tenant.profile.callbackNumber}.`
      : `Twilio relay connected for ${tenant.profile.callbackNumber}. Add a public webhook URL to finish Twilio setup.`,
  };
}

async function processEvent(store, appId, tenantId, event) {
  const tenant = ensureTenant(store, appId, tenantId);
  const type = stringOrDefault(event.type, '');
  if (!type) {
    throw new Error('Event type is required.');
  }

  if (type === 'call.missed') {
    const fromNumber = stringOrDefault(event.fromNumber, '');
    const toNumber = stringOrDefault(event.toNumber, tenant.profile.callbackNumber || '');
    const forwardedFrom = stringOrDefault(event.forwardedFrom, '');
    if (isDuplicateMissedCallEvent({ fromNumber, toNumber, forwardedFrom })) {
      addActivity(tenant, {
        kind: 'event.processed',
        status: 'ignored',
        title: 'Duplicate missed call ignored',
        summary: `Ignored a duplicate missed-call callback for ${fromNumber || 'unknown caller'}.`,
      });
      tenant.updatedAt = new Date().toISOString();
      tenant.metrics.lastUpdatedAt = tenant.updatedAt;
      return {
        summary: 'Duplicate missed-call callback ignored.',
        replyBody: '',
      };
    }
    const replyOptions = normalizeReplyOptions(tenant.profile.templates?.replyOptions);
    const useStarterPlumbingFlow = shouldUseStarterPlumbingFlow(tenant);
    const lead = upsertLead(tenant, fromNumber, {
      stage: 'new',
      urgencyScore: 30,
      urgencyLabel: 'normal',
      serviceCategory: useStarterPlumbingFlow ? 'plumbing' : '',
    });
    if (useStarterPlumbingFlow) {
      initializeStarterPlumbingIntake(lead, { reset: true });
    }
    tenant.metrics.missedCallsRecovered += 1;

    let summary = `Missed call captured from ${fromNumber || 'unknown caller'}${forwardedFrom ? ` via ${forwardedFrom}` : ''
      }.`;
    const replyBody =
      useStarterPlumbingFlow
        ? buildStarterPlumbingOpening(tenant.profile.businessName)
        : stringOrDefault(tenant.profile.templates?.missedCallReply, '') ||
          buildDefaultMissedCallReply(tenant.profile.businessName, replyOptions);

    if (isLeadSmsOptedOut(lead)) {
      summary = `Missed call captured, but the text-back was suppressed because ${fromNumber || 'the caller'} opted out of SMS.`;
      upsertTask(tenant, {
        taskType: `manual_callback_opted_out:${normalizeUsPhone(fromNumber) || 'unknown'}`,
        title: 'Missed call needs manual callback',
        detail: `${fromNumber || 'This caller'} previously opted out of SMS. Do not send automated texts until they reply START.`,
        severity: 'medium',
      });
      addActivity(tenant, {
        kind: 'sms.delivery.suppressed',
        status: 'warning',
        title: 'Missed-call SMS suppressed',
        summary,
      });
    } else if (tenant.connectors.sms?.live && fromNumber && toNumber) {
      try {
        await sendTwilioSms(tenant.connectors.sms, {
          to: fromNumber,
          from: toNumber,
          body: replyBody,
          statusCallbackUrl: buildTwilioWebhookUrl(store, appId),
        });
        activateLeadSmsConsent(lead, { source: 'missed_call' });
        tenant.metrics.inboundAutoReplies += 1;
        tenant.metrics.actionSuccess += 1;
        summary = useStarterPlumbingFlow
          ? `Missed call captured and Starter plumbing intake sent to ${fromNumber}.`
          : `Missed call captured and text-back sent to ${fromNumber}.`;
      } catch (error) {
        tenant.metrics.actionFailures += 1;
        summary = `Missed call captured, but the text-back failed for ${fromNumber}.`;
        upsertTask(tenant, {
          taskType: 'sms_delivery_failed',
          title: 'Missed-call text-back failed',
          detail: error instanceof Error ? error.message : 'Twilio send failed.',
          severity: 'high',
        });
      }
    } else {
      upsertTask(tenant, {
        taskType: 'manual_callback',
        title: 'Follow up missed call manually',
        detail: `A missed call came from ${fromNumber || 'unknown caller'} and SMS is not live yet.`,
        severity: 'medium',
      });
    }

    addActivity(tenant, {
      kind: 'event.processed',
      status: 'success',
      title: 'call.missed processed',
      summary,
    });
    if (tenant.connectors.sms?.live && fromNumber && !isLeadSmsOptedOut(lead)) {
      scheduleFollowup(tenant, {
        followupType: useStarterPlumbingFlow ? 'starter_plumbing_checkin' : 'missed_call_checkin',
        title: useStarterPlumbingFlow ? 'Starter plumbing intake check-in' : 'Missed-call check-in',
        detail: useStarterPlumbingFlow
          ? `Follow up with ${fromNumber} if they do not finish the plumbing intake after the missed-call text-back.`
          : `Follow up with ${fromNumber} if they do not reply after the missed-call text-back.`,
        leadPhone: fromNumber,
        severity: 'medium',
        scheduledFor: scheduleMinutesFromNow(useStarterPlumbingFlow ? 45 : 90),
      });
    }
    tenant.metrics.lastUpdatedAt = new Date().toISOString();
    tenant.updatedAt = new Date().toISOString();

    return {
      summary,
      replyBody,
    };
  }

  if (type === 'sms.received') {
    const fromNumber = stringOrDefault(event.fromNumber, '');
    const bodyText = stringOrDefault(event.body, '').trim();
    const trimmedKey = bodyText.replace(/\s+/g, '');
    const smsCommand = parseSmsCommand(bodyText);
    const replyOptions = normalizeReplyOptions(tenant.profile.templates?.replyOptions);
    const lead = upsertLead(tenant, fromNumber, {
      stage: 'contacted',
      urgencyScore: 40,
      lastInboundMessage: bodyText,
    });
    tenant.metrics.leadIntakes += 1;

    let summary = `Inbound SMS received from ${fromNumber || 'unknown sender'}.`;
    let replyBody = 'Thanks. We received your message and will follow up soon.';
    const useStarterPlumbingFlow = shouldUseStarterPlumbingFlow(tenant);

    if (smsCommand === 'stop') {
      optOutLeadSms(lead, { keyword: bodyText.toUpperCase() || 'STOP' });
      upsertTask(tenant, {
        taskType: `lead_sms_opt_out:${normalizeUsPhone(fromNumber) || 'unknown'}`,
        title: 'Customer opted out of SMS',
        detail: `${fromNumber || 'This lead'} sent STOP. Do not send automated texts until they reply START.`,
        severity: 'medium',
      });
      replyBody = buildSmsStopConfirmation(tenant);
      summary = `${fromNumber || 'A lead'} opted out of SMS.`;
      addActivity(tenant, {
        kind: 'sms.command.stop',
        status: 'warning',
        title: 'STOP received',
        summary,
      });
    } else if (smsCommand === 'help') {
      noteLeadHelpResponse(lead, { keyword: bodyText.toUpperCase() || 'HELP' });
      replyBody = buildSmsHelpReply(tenant);
      summary = `Sent HELP details to ${fromNumber || 'a lead'}.`;
      addActivity(tenant, {
        kind: 'sms.command.help',
        status: 'success',
        title: 'HELP received',
        summary,
      });
    } else if (smsCommand === 'start') {
      activateLeadSmsConsent(lead, { source: 'keyword:start', keyword: bodyText.toUpperCase() || 'START' });
      completeOpenTaskByType(tenant, `lead_sms_opt_out:${normalizeUsPhone(fromNumber) || 'unknown'}`);
      replyBody = buildSmsRestartReply(tenant, lead);
      summary = `${fromNumber || 'A lead'} opted back into SMS.`;
      addActivity(tenant, {
        kind: 'sms.command.start',
        status: 'success',
        title: 'START received',
        summary,
      });
    } else if (isLeadSmsOptedOut(lead)) {
      replyBody = buildSmsOptOutReminder(tenant);
      summary = `Ignored inbound SMS from ${fromNumber || 'a lead'} because the lead is opted out.`;
      addActivity(tenant, {
        kind: 'sms.delivery.suppressed',
        status: 'warning',
        title: 'Inbound SMS held after opt-out',
        summary,
      });
    } else if (useStarterPlumbingFlow) {
      activateLeadSmsConsent(lead, { source: 'inbound_sms' });
      const starterResult = await handleStarterPlumbingInboundSms(store, appId, tenant, lead, bodyText);
      summary = starterResult.summary;
      replyBody = starterResult.replyBody;
    } else if (replyOptions[trimmedKey]) {
      activateLeadSmsConsent(lead, { source: 'inbound_sms' });
      const mapped = replyOptions[trimmedKey];
      const workflow = SMS_REPLY_WORKFLOW[trimmedKey];
      lead.stage = workflow.stage;
      lead.urgencyScore = workflow.urgencyScore || lead.urgencyScore;
      replyBody = mapped.reply;
      summary = `Inbound SMS option ${trimmedKey} (${mapped.title}) received from ${fromNumber}.`;
      scheduleFollowup(tenant, buildReplyFollowup(trimmedKey, fromNumber, mapped));
    } else {
      activateLeadSmsConsent(lead, { source: 'inbound_sms' });
    }

    if (tenant.connectors.sms?.live && fromNumber && tenant.profile.callbackNumber) {
      try {
        await sendTwilioSms(tenant.connectors.sms, {
          to: fromNumber,
          from: tenant.profile.callbackNumber,
          body: replyBody,
          statusCallbackUrl: buildTwilioWebhookUrl(store, appId),
        });
        tenant.metrics.inboundAutoReplies += 1;
        tenant.metrics.actionSuccess += 1;
      } catch (error) {
        tenant.metrics.actionFailures += 1;
        upsertTask(tenant, {
          taskType: 'sms_delivery_failed',
          title: 'Inbound SMS reply failed',
          detail: error instanceof Error ? error.message : 'Twilio send failed.',
          severity: 'medium',
        });
      }
    }

    addActivity(tenant, {
      kind: 'event.processed',
      status: 'success',
      title: 'sms.received processed',
      summary,
    });
    await processDueFollowupsForTenant(store, appId, tenant, {
      limit: FOLLOWUP_RUNNER_LIMIT_PER_TENANT,
      sendOwnerAlerts: false,
      reason: 'event',
    });
    tenant.metrics.lastUpdatedAt = new Date().toISOString();
    tenant.updatedAt = new Date().toISOString();
    lead.updatedAt = tenant.updatedAt;

    return {
      summary,
      replyBody,
    };
  }

  if (type === 'sms.status') {
    const messageStatus = stringOrDefault(event.messageStatus, '').toLowerCase();
    const messageSid = stringOrDefault(event.messageSid, '');
    const leadPhone = normalizeUsPhone(stringOrDefault(event.toNumber, ''));
    const errorCode = stringOrDefault(event.errorCode, '');
    const errorMessage = stringOrDefault(event.errorMessage, '');
    const lead = leadPhone ? upsertLead(tenant, leadPhone, {}) : null;
    if (lead) {
      noteLeadSmsDeliveryStatus(lead, {
        status: messageStatus,
        messageSid,
        errorCode,
        errorMessage,
      });
    }

    let summary = `Twilio reported SMS status ${messageStatus || 'unknown'}${leadPhone ? ` for ${leadPhone}` : ''}.`;
    let status = 'neutral';
    if (['delivered', 'sent', 'queued', 'accepted', 'scheduled'].includes(messageStatus)) {
      status = 'success';
    } else if (['undelivered', 'failed', 'canceled'].includes(messageStatus)) {
      status = 'warning';
    }

    if (['undelivered', 'failed', 'canceled'].includes(messageStatus)) {
      tenant.metrics.actionFailures += 1;
      upsertTask(tenant, {
        taskType: `sms_status_issue:${messageSid || leadPhone || 'unknown'}`,
        title: 'Review failed SMS delivery',
        detail: `${summary}${errorCode || errorMessage ? ` Error: ${[errorCode, errorMessage].filter(Boolean).join(': ')}` : ''}`,
        severity: 'high',
      });
    }

    addActivity(tenant, {
      kind: 'sms.status',
      status,
      title: `SMS ${messageStatus || 'status update'}`,
      summary,
    });
    tenant.metrics.lastUpdatedAt = new Date().toISOString();
    tenant.updatedAt = tenant.metrics.lastUpdatedAt;
    if (lead) {
      lead.updatedAt = tenant.updatedAt;
    }

    return {
      summary,
      replyBody: '',
    };
  }

  throw new Error(`Unsupported event type "${type}".`);
}

function shouldUseStarterPlumbingFlow(tenant) {
  const automation = normalizeAutomationSettings(tenant.settings.automation || {});
  return automation.vertical === 'plumbing' && automation.tier === 'starter';
}

function initializeStarterPlumbingIntake(lead, { reset = false } = {}) {
  const now = new Date().toISOString();
  if (!reset && lead.intake?.playbook === STARTER_PLUMBING_PLAYBOOK && lead.intake.status === 'in_progress') {
    return lead.intake;
  }

  const previousAnswers = lead.intake?.answers || {};
  lead.intake = {
    status: 'in_progress',
    playbook: STARTER_PLUMBING_PLAYBOOK,
    currentQuestionKey: 'issue_type',
    answers: {
      issueType: reset ? '' : stringOrDefault(previousAnswers.issueType, ''),
      issueDescription: reset ? '' : stringOrDefault(previousAnswers.issueDescription, ''),
      otherDetail: reset ? '' : stringOrDefault(previousAnswers.otherDetail, ''),
      severityDetail: reset ? '' : stringOrDefault(previousAnswers.severityDetail, ''),
      urgentDamage: reset ? '' : stringOrDefault(previousAnswers.urgentDamage, ''),
      location: reset ? '' : stringOrDefault(previousAnswers.location, lead.address || ''),
      customerName: reset ? '' : stringOrDefault(previousAnswers.customerName, lead.name || ''),
    },
    startedAt: reset ? now : stringOrDefault(lead.intake?.startedAt, now),
    completedAt: '',
    ownerSummarySentAt: '',
  };
  return lead.intake;
}

async function handleStarterPlumbingInboundSms(store, appId, tenant, lead, bodyText) {
  const trimmed = stringOrDefault(bodyText, '').trim();
  if (!trimmed) {
    return {
      summary: `Empty plumbing intake message received from ${lead.phone || 'unknown sender'}.`,
      replyBody: buildStarterPlumbingQuestion('issue_type', lead),
    };
  }

  if (lead.intake?.playbook === STARTER_PLUMBING_PLAYBOOK && lead.intake.status === 'completed') {
    lead.notes = mergeLeadNotes(lead.notes, trimmed);
    upsertTask(tenant, {
      taskType: `starter_plumbing_update:${normalizeUsPhone(lead.phone) || 'unknown'}`,
      title: 'Review updated plumbing lead note',
      detail: `Customer update from ${lead.name || lead.phone || 'unknown lead'}: ${truncateMessage(trimmed, 220)}`,
      severity: lead.urgencyLabel === 'emergency' ? 'high' : 'medium',
    });
    return {
      summary: `Additional plumbing update received from ${lead.phone || 'unknown sender'}.`,
      replyBody: 'Thanks. We added that update to your plumbing request.',
    };
  }

  const intake = initializeStarterPlumbingIntake(lead);
  const currentQuestionKey = intake.currentQuestionKey || 'issue_type';
  const parsed = parseStarterPlumbingAnswer(currentQuestionKey, trimmed, lead);

  if (!parsed.valid) {
    return {
      summary: `Starter plumbing intake still needs ${currentQuestionKey} from ${lead.phone || 'unknown sender'}.`,
      replyBody: parsed.retryMessage || buildStarterPlumbingQuestion(currentQuestionKey, lead),
    };
  }

  applyStarterPlumbingAnswer(lead, currentQuestionKey, parsed.value);
  const nextQuestionKey = nextStarterPlumbingQuestionKey(lead, currentQuestionKey);
  if (nextQuestionKey) {
    lead.intake.currentQuestionKey = nextQuestionKey;
    lead.intake.status = 'in_progress';
    return {
      summary: `Captured ${currentQuestionKey} for ${lead.phone || 'unknown sender'} in the Starter plumbing intake.`,
      replyBody: buildStarterPlumbingQuestion(nextQuestionKey, lead),
    };
  }

  return finalizeStarterPlumbingIntake(store, appId, tenant, lead);
}

function parseStarterPlumbingAnswer(questionKey, bodyText, lead) {
  const trimmed = stringOrDefault(bodyText, '').trim();
  if (!trimmed) {
    return {
      valid: false,
      retryMessage: buildStarterPlumbingQuestion(questionKey),
    };
  }

  if (questionKey === 'issue_type') {
    const issueType = parseStarterIssueType(trimmed);
    if (!issueType) {
      return {
        valid: false,
        retryMessage: 'Reply with leak, clog, water heater, or other so we can route the plumbing request.',
      };
    }
    return {
      valid: true,
      value: {
        issueType,
        issueDescription: formatIssueDescription(trimmed, issueType),
      },
    };
  }

  if (questionKey === 'severity_detail') {
    const issueType = stringOrDefault(lead?.intake?.answers?.issueType, '').toLowerCase();
    const severityDetail = parseStarterSeverityDetail(issueType, trimmed);
    if (!severityDetail) {
      return {
        valid: false,
        retryMessage:
          issueType === 'leak'
            ? 'Reply with constant or only when you use the sink.'
            : 'Reply with fully blocked or draining slowly.',
      };
    }
    return {
      valid: true,
      value: severityDetail,
    };
  }

  if (questionKey === 'other_detail') {
    const otherDetail = parseStarterOtherDetail(trimmed);
    if (!otherDetail) {
      return {
        valid: false,
        retryMessage:
          'Reply with toilet, fixture, disposal, sewer, water pressure, or a short description.',
      };
    }
    return {
      valid: true,
      value: otherDetail,
    };
  }

  if (questionKey === 'urgency') {
    const yesNo = parseYesNo(trimmed);
    if (!yesNo) {
      return {
        valid: false,
        retryMessage: 'Reply yes or no. Is this causing flooding or urgent damage right now?',
      };
    }
    return {
      valid: true,
      value: yesNo,
    };
  }

  if ((questionKey === 'location' || questionKey === 'customer_name') && trimmed.length < 2) {
    return {
      valid: false,
      retryMessage:
        questionKey === 'customer_name'
          ? 'Tell us your name so we can route the plumbing request.'
          : 'Tell us where the issue is located, like kitchen, bathroom, or basement.',
    };
  }

  return {
    valid: true,
    value: trimmed,
  };
}

function parseStarterIssueType(value) {
  const normalized = stringOrDefault(value, '').trim().toLowerCase();
  if (!normalized) {
    return '';
  }

  if (normalized === '1' || /\bleak\b|\bleaking\b|\bdrip\b|\bdripping\b|\bburst\b|\bpipe\b/.test(normalized)) {
    return 'leak';
  }

  if (
    normalized === '2' ||
    /\bclog\b|\bclogged\b|\bdrain\b|\btoilet\b|\bsewer\b|\bbackup\b|\bbacked up\b|\bbacking up\b/.test(
      normalized
    )
  ) {
    return 'clog';
  }

  if (
    normalized === '3' ||
    /\bwater heater\b|\bhot water\b|\bheater\b|\btank\b/.test(normalized)
  ) {
    return 'water heater';
  }

  if (normalized === '4' || /\bother\b|\bquestion\b|\bissue\b|\bproblem\b|\bsomething else\b/.test(normalized)) {
    return 'other';
  }

  return '';
}

function parseStarterSeverityDetail(issueType, value) {
  const normalized = stringOrDefault(value, '').trim().toLowerCase();
  if (!normalized) {
    return '';
  }

  if (issueType === 'leak') {
    if (/\bconstant\b|\ball the time\b|\balways\b|\bkeeps\b/.test(normalized)) {
      return 'constant';
    }
    if (/\bonly when\b|\buse the sink\b|\bsink\b|\bfaucet\b|\btap\b/.test(normalized)) {
      return 'only when the sink is used';
    }
    return '';
  }

  if (issueType === 'clog') {
    if (/\bfully\b|\bblocked\b|\bwon't drain\b|\bnot draining\b|\bstopped up\b/.test(normalized)) {
      return 'fully blocked';
    }
    if (/\bslow\b|\bslowly\b|\bdraining slowly\b/.test(normalized)) {
      return 'draining slowly';
    }
    return '';
  }

  return normalized;
}

function parseStarterOtherDetail(value) {
  const trimmed = stringOrDefault(value, '').trim();
  const normalized = trimmed.toLowerCase();
  if (!normalized) {
    return null;
  }

  if (/\btoilet\b|\bcommode\b/.test(normalized)) {
    return {
      otherDetail: 'toilet',
      issueDescription: 'Toilet issue',
    };
  }

  if (/\bfixture\b|\bfaucet\b|\bshower\b|\btub\b|\bsink\b/.test(normalized)) {
    return {
      otherDetail: 'fixture',
      issueDescription: 'Fixture issue',
    };
  }

  if (/\bgarbage disposal\b|\bdisposal\b/.test(normalized)) {
    return {
      otherDetail: 'garbage disposal',
      issueDescription: 'Garbage disposal issue',
    };
  }

  if (/\bsewer\b|\bmain line\b|\bseptic\b/.test(normalized)) {
    return {
      otherDetail: 'sewer',
      issueDescription: 'Sewer line issue',
    };
  }

  if (/\bpressure\b|\blow pressure\b|\bno pressure\b/.test(normalized)) {
    return {
      otherDetail: 'water pressure',
      issueDescription: 'Water pressure issue',
    };
  }

  if (normalized === 'other' || /\bsomething else\b/.test(normalized)) {
    return {
      otherDetail: 'other',
      issueDescription: 'Other plumbing issue',
    };
  }

  if (trimmed.length >= 3) {
    return {
      otherDetail: 'custom',
      issueDescription: formatIssueDescription(trimmed, 'plumbing issue'),
    };
  }

  return null;
}

function parseYesNo(value) {
  const normalized = stringOrDefault(value, '').trim().toLowerCase();
  if (!normalized) {
    return '';
  }
  if (['y', 'yes', 'yeah', 'yep', 'active', 'running', 'backing up', 'overflowing', 'flooding'].includes(normalized)) {
    return 'yes';
  }
  if (['n', 'no', 'nope', 'not now', 'stopped'].includes(normalized)) {
    return 'no';
  }
  if (/\byes\b|\bactive\b|\brunning\b|\bbacking up\b|\boverflow\b|\bflood/.test(normalized)) {
    return 'yes';
  }
  if (/\bno\b|\bstopped\b|\bnot now\b/.test(normalized)) {
    return 'no';
  }
  return '';
}

function applyStarterPlumbingAnswer(lead, questionKey, value) {
  const intake = initializeStarterPlumbingIntake(lead);
  if (questionKey === 'issue_type') {
    intake.answers.issueType = value.issueType;
    intake.answers.issueDescription = value.issueDescription;
    lead.serviceCategory = value.issueType;
    return;
  }
  if (questionKey === 'severity_detail') {
    intake.answers.severityDetail = value;
    return;
  }
  if (questionKey === 'other_detail') {
    intake.answers.otherDetail = value.otherDetail;
    intake.answers.issueDescription = value.issueDescription;
    return;
  }
  if (questionKey === 'urgency') {
    intake.answers.urgentDamage = value;
    return;
  }
  if (questionKey === 'location') {
    intake.answers.location = value;
    lead.address = value;
    return;
  }
  if (questionKey === 'customer_name') {
    intake.answers.customerName = value;
    lead.name = value;
  }
}

function nextStarterPlumbingQuestionKey(lead, currentQuestionKey) {
  if (currentQuestionKey === 'issue_type') {
    const issueType = stringOrDefault(lead?.intake?.answers?.issueType, '').toLowerCase();
    if (issueType === 'other') {
      return 'other_detail';
    }
    return requiresStarterSeverityQuestion(issueType) ? 'severity_detail' : 'urgency';
  }

  if (currentQuestionKey === 'other_detail') {
    return 'urgency';
  }

  if (currentQuestionKey === 'severity_detail') {
    return 'urgency';
  }

  if (currentQuestionKey === 'urgency') {
    return 'location';
  }

  if (currentQuestionKey === 'location') {
    return 'customer_name';
  }

  return undefined;
}

function buildStarterPlumbingQuestion(questionKey, lead) {
  if (questionKey === 'other_detail') {
    return 'Got it. Is this a toilet issue, fixture issue, disposal issue, sewer issue, water pressure issue, or something else?';
  }
  if (questionKey === 'severity_detail') {
    const issueType = stringOrDefault(lead?.intake?.answers?.issueType, '').toLowerCase();
    if (issueType === 'leak') {
      return 'Got it. Is the leak constant or only when you use the sink?';
    }
    return 'Got it. Is it fully blocked or draining slowly?';
  }
  if (questionKey === 'urgency') {
    return 'Is this causing flooding or urgent damage right now? Reply yes or no.';
  }
  if (questionKey === 'location') {
    return 'Where is the issue located? Kitchen, bathroom, basement, or somewhere else?';
  }
  if (questionKey === 'customer_name') {
    return 'Can I get your name so the technician can reach you?';
  }
  return "What's going on - leak, clog, water heater, or something else?";
}

async function finalizeStarterPlumbingIntake(store, appId, tenant, lead) {
  const intake = initializeStarterPlumbingIntake(lead);
  const classification = classifyStarterPlumbingLead(lead);
  const now = new Date().toISOString();

  lead.stage = classification.stage;
  lead.urgencyScore = classification.score;
  lead.urgencyLabel = classification.label;
  lead.serviceCategory = stringOrDefault(intake.answers.issueType, lead.serviceCategory || 'plumbing');
  lead.name = stringOrDefault(intake.answers.customerName, lead.name || '');
  lead.address = stringOrDefault(intake.answers.location, lead.address || '');
  lead.notes = buildStarterPlumbingNotes(lead);
  intake.status = 'completed';
  intake.currentQuestionKey = undefined;
  intake.completedAt = now;

  completeLeadFollowups(tenant, ['missed_call_checkin', 'starter_plumbing_checkin'], lead.phone, now);

  const summary = buildStarterPlumbingSummary(lead, classification);
  const ownerSummary = buildStarterPlumbingOwnerSummary(tenant, summary);
  const ownerSummarySent = await sendStarterPlumbingOwnerSummary(store, appId, tenant, lead, ownerSummary, classification);
  if (ownerSummarySent.sentAt) {
    intake.ownerSummarySentAt = ownerSummarySent.sentAt;
  }
  const calendarSync = await syncCalendarLeadEvent(store, appId, tenant, lead, summary, classification);
  if (calendarSync.sentAt) {
    lead.notes = mergeLeadNotes(lead.notes, `Calendar event synced at ${calendarSync.sentAt}.`);
  }

  const taskTitle = summary.recommended_action === 'Call immediately' ? 'Call emergency plumbing lead' : 'Call new plumbing lead';

  upsertTask(tenant, {
    taskType: `starter_plumbing_lead:${normalizeUsPhone(lead.phone) || 'unknown'}`,
    title: taskTitle,
    detail: ownerSummary,
    severity: classification.severity,
  });

  scheduleFollowup(tenant, {
    followupType:
      classification.label === 'emergency' ? 'starter_plumbing_emergency' : 'starter_plumbing_callback',
    title: taskTitle,
    detail: ownerSummary,
    leadPhone: lead.phone,
    severity: classification.severity,
    scheduledFor: scheduleMinutesFromNow(classification.label === 'emergency' ? 0 : 20),
  });

  addActivity(tenant, {
    kind: 'lead.qualified',
    status: classification.label === 'emergency' ? 'warning' : 'success',
    title: 'Starter plumbing intake completed',
    summary: ownerSummary,
  });

  return {
    summary: `Starter plumbing intake completed for ${lead.phone || 'unknown lead'}. Priority: ${classification.label}.`,
    replyBody: buildStarterPlumbingCustomerConfirmation(lead),
  };
}

async function syncCalendarLeadEvent(store, appId, tenant, lead, summary, classification) {
  const calendarEndpoint = resolveNotificationEndpoint(tenant.settings.calendar);
  if (!calendarEndpoint) {
    return { sent: false, sentAt: '' };
  }

  const sentAt = new Date().toISOString();
  try {
    await sendWebhookJson(calendarEndpoint, {
      calendarId: stringOrDefault(tenant.settings.calendar.calendarId, 'primary'),
      event: {
        title: `${summary.name} - ${summary.issue}`,
        description: summary.notes,
        start: sentAt,
        end: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
        status: classification.label === 'emergency' ? 'busy' : 'confirmed',
        location: summary.location,
        attendees: [stringOrDefault(tenant.settings.contactEmail, '')].filter(Boolean),
      },
      lead: {
        phone: lead.phone,
        name: summary.name,
        severity: summary.severity,
        urgency: summary.urgency,
      },
    });
    addActivity(tenant, {
      kind: 'calendar.sync',
      status: 'success',
      title: 'Calendar event synced',
      summary: `Created a follow-up calendar event for ${summary.name || lead.phone || 'the lead'}.`,
    });
    tenant.metrics.actionSuccess += 1;
    return { sent: true, sentAt };
  } catch (error) {
    tenant.metrics.actionFailures += 1;
    upsertTask(tenant, {
      taskType: `calendar_sync_failed:${normalizeUsPhone(lead.phone) || 'unknown'}`,
      title: 'Calendar sync failed',
      detail: error instanceof Error ? error.message : 'ResponseOS could not sync the calendar event.',
      severity: 'medium',
    });
    return { sent: false, sentAt: '' };
  }
}

function classifyStarterPlumbingLead(lead) {
  const answers = lead.intake?.answers || {};
  const issueType = stringOrDefault(answers.issueType, lead.serviceCategory || 'other').toLowerCase();
  const severityDetail = stringOrDefault(answers.severityDetail, '').toLowerCase();
  const urgentDamage = stringOrDefault(answers.urgentDamage, '').toLowerCase();

  let severity = 'Medium';
  if (urgentDamage === 'yes' || (issueType === 'leak' && severityDetail === 'constant')) {
    severity = 'High';
  } else if (issueType === 'clog' && severityDetail === 'draining slowly') {
    severity = 'Low';
  }

  return {
    label: severity === 'High' ? 'emergency' : severity === 'Medium' ? 'priority' : 'normal',
    score: severity === 'High' ? 95 : severity === 'Medium' ? 65 : 35,
    stage: severity === 'High' ? 'urgent' : 'qualified',
    severity: severity.toLowerCase(),
  };
}

function buildStarterPlumbingSummary(lead, classification) {
  const answers = lead.intake?.answers || {};
  const severityLabel = classification.severity === 'high' ? 'High' : classification.severity === 'low' ? 'Low' : 'Medium';
  const urgency = severityLabel === 'High' ? 'Same-day recommended' : 'Normal scheduling';
  const recommendedAction =
    severityLabel === 'High' ? 'Call immediately' : severityLabel === 'Medium' ? 'Call soon' : 'Standard callback';
  return {
    type: 'lead_summary',
    name: stringOrDefault(answers.customerName, lead.name || 'Unknown'),
    issue: stringOrDefault(answers.issueDescription, titleCase(stringOrDefault(answers.issueType, 'Plumbing issue'))),
    severity: severityLabel,
    urgency,
    location: stringOrDefault(answers.location, lead.address || 'Unknown'),
    notes: buildStarterPlumbingNotes(lead),
    recommended_action: recommendedAction,
  };
}

function buildStarterPlumbingOwnerSummary(tenant, summary) {
  return truncateMessage(
    [
      `NEW LEAD - PLUMBING for ${tenant.profile.businessName || tenant.profile.businessId}.`,
      `Name: ${summary.name}.`,
      `Issue: ${summary.issue}.`,
      `Severity: ${summary.severity}.`,
      `Urgency: ${summary.urgency}.`,
      `Location: ${summary.location}.`,
      `Notes: ${summary.notes}.`,
      `Suggested Action: ${summary.recommended_action}.`,
    ].join(' '),
    320
  );
}

function buildStarterPlumbingCustomerConfirmation(lead) {
  const firstName = stringOrDefault(lead.name, '').split(/\s+/)[0];
  return `Thanks${firstName ? `, ${firstName}` : ''}. We've got your request.\n\nA technician will reach out shortly to schedule.`;
}

function buildStarterPlumbingNotes(lead) {
  const answers = lead.intake?.answers || {};
  const notes = [];
  const issueType = stringOrDefault(answers.issueType, '').toLowerCase();
  const severityDetail = stringOrDefault(answers.severityDetail, '');
  const urgentDamage = stringOrDefault(answers.urgentDamage, '');

  if (severityDetail) {
    if (issueType === 'leak' && severityDetail === 'constant') {
      notes.push('Constant leak');
    } else if (issueType === 'leak' && severityDetail === 'only when the sink is used') {
      notes.push('Leak only when the sink is used');
    } else if (issueType === 'clog' && severityDetail === 'fully blocked') {
      notes.push('Clog is fully blocked');
    } else if (issueType === 'clog' && severityDetail === 'draining slowly') {
      notes.push('Clog is draining slowly');
    } else {
      notes.push(severityDetail);
    }
  }
  if (urgentDamage === 'yes') {
    notes.push('Flooding or urgent damage reported');
  }

  return notes.length > 0 ? notes.join(', ') : 'General plumbing issue';
}

function requiresStarterSeverityQuestion(issueType) {
  return ['leak', 'clog'].includes(stringOrDefault(issueType, '').toLowerCase());
}

function formatIssueDescription(rawValue, issueType) {
  const trimmed = stringOrDefault(rawValue, '').trim();
  if (!trimmed) {
    return titleCase(issueType || 'plumbing issue');
  }
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
}

function titleCase(value) {
  return stringOrDefault(value, '')
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join(' ');
}

function handleDemoLeadEndpoint(body) {
  const sessionId = stringOrDefault(body.session_id, '') || `demo_${randomUUID()}`;
  const session = ensureDemoLeadSession(sessionId, body);
  const message = stringOrDefault(body.message, '').trim();

  if (session.done && session.summary) {
    return {
      session_id: sessionId,
      reply: buildStarterPlumbingCustomerConfirmation({ name: session.answers.customerName || '' }),
      done: true,
      question_key: 'done',
      summary: session.summary,
    };
  }

  if (!message) {
    return {
      session_id: sessionId,
      reply:
        session.currentQuestionKey === 'issue_type'
          ? buildDemoLeadOpening(session)
          : buildStarterPlumbingQuestion(session.currentQuestionKey, {
              intake: { answers: session.answers },
            }),
      done: false,
      question_key: session.currentQuestionKey,
    };
  }

  const leadLike = buildDemoLeadFromSession(session);
  const parsed = parseStarterPlumbingAnswer(session.currentQuestionKey, message, leadLike);
  if (!parsed.valid) {
    return {
      session_id: sessionId,
      reply:
        parsed.retryMessage ||
        (session.currentQuestionKey === 'issue_type'
          ? buildDemoLeadOpening(session)
          : buildStarterPlumbingQuestion(session.currentQuestionKey, leadLike)),
      done: false,
      question_key: session.currentQuestionKey,
    };
  }

  applyDemoLeadAnswer(session, session.currentQuestionKey, parsed.value);
  const updatedLeadLike = buildDemoLeadFromSession(session);
  const nextQuestionKey = nextStarterPlumbingQuestionKey(updatedLeadLike, session.currentQuestionKey);

  if (nextQuestionKey) {
    session.currentQuestionKey = nextQuestionKey;
    return {
      session_id: sessionId,
      reply: buildStarterPlumbingQuestion(nextQuestionKey, updatedLeadLike),
      done: false,
      question_key: nextQuestionKey,
    };
  }

  const finalLead = buildDemoLeadFromSession(session);
  const classification = classifyStarterPlumbingLead(finalLead);
  const summary = buildStarterPlumbingSummary(finalLead, classification);
  session.done = true;
  session.summary = summary;
  session.currentQuestionKey = 'customer_name';

  return {
    session_id: sessionId,
    reply: buildStarterPlumbingCustomerConfirmation({ name: summary.name }),
    done: true,
    question_key: 'done',
    summary,
  };
}

function ensureDemoLeadSession(sessionId, body) {
  if (!DEMO_LEAD_SESSIONS.has(sessionId)) {
    DEMO_LEAD_SESSIONS.set(sessionId, {
      sessionId,
      businessName: stringOrDefault(body.business_name, 'ABC Plumbing'),
      agentName: stringOrDefault(body.agent_name, 'Mike'),
      currentQuestionKey: 'issue_type',
      done: false,
      answers: {
        issueType: '',
        issueDescription: '',
        otherDetail: '',
        severityDetail: '',
        urgentDamage: '',
        location: '',
        customerName: '',
      },
      summary: null,
    });
  }

  const session = DEMO_LEAD_SESSIONS.get(sessionId);
  if (stringOrDefault(body.business_name, '')) {
    session.businessName = stringOrDefault(body.business_name, session.businessName);
  }
  if (stringOrDefault(body.agent_name, '')) {
    session.agentName = stringOrDefault(body.agent_name, session.agentName);
  }
  return session;
}

function applyDemoLeadAnswer(session, questionKey, value) {
  if (questionKey === 'issue_type') {
    session.answers.issueType = value.issueType;
    session.answers.issueDescription = value.issueDescription;
    return;
  }
  if (questionKey === 'severity_detail') {
    session.answers.severityDetail = value;
    return;
  }
  if (questionKey === 'other_detail') {
    session.answers.otherDetail = value.otherDetail;
    session.answers.issueDescription = value.issueDescription;
    return;
  }
  if (questionKey === 'urgency') {
    session.answers.urgentDamage = value;
    return;
  }
  if (questionKey === 'location') {
    session.answers.location = value;
    return;
  }
  if (questionKey === 'customer_name') {
    session.answers.customerName = value;
  }
}

function buildDemoLeadFromSession(session) {
  return {
    serviceCategory: session.answers.issueType,
    name: session.answers.customerName,
    address: session.answers.location,
    notes: '',
    intake: {
      answers: {
        issueType: session.answers.issueType,
        issueDescription: session.answers.issueDescription,
        otherDetail: session.answers.otherDetail,
        severityDetail: session.answers.severityDetail,
        urgentDamage: session.answers.urgentDamage,
        location: session.answers.location,
        customerName: session.answers.customerName,
      },
    },
  };
}

function buildDemoLeadOpening(session) {
  return `Hey, this is ${session.agentName} from ${session.businessName}. Sorry we missed your call.\n\nWhat's going on - leak, clog, water heater, or something else?`;
}

async function sendStarterPlumbingOwnerSummary(store, appId, tenant, lead, summaryText, classification) {
  const ownerAlertNumber = normalizeUsPhone(tenant.settings.ownerAlertDestination || '');
  const fromNumber = tenant.profile.callbackNumber || tenant.connectors.sms?.fromNumber || '';
  const emailEndpoint = resolveNotificationEndpoint(tenant.settings.email);
  const ownerEmail = stringOrDefault(tenant.settings.contactEmail, '');

  if (!ownerAlertNumber.startsWith('+') && !emailEndpoint) {
    upsertTask(tenant, {
      taskType: `starter_plumbing_owner_summary:${normalizeUsPhone(lead.phone) || 'unknown'}`,
      title: 'Send plumbing lead summary to owner',
      detail: summaryText,
      severity: classification.severity,
    });
    return {
      sent: false,
      sentAt: '',
    };
  }

  try {
    if (ownerAlertNumber.startsWith('+') && tenant.connectors.sms?.live && fromNumber) {
      await sendTwilioSms(tenant.connectors.sms, {
        to: ownerAlertNumber,
        from: fromNumber,
        body: summaryText,
        statusCallbackUrl: buildTwilioWebhookUrl(store, appId),
      });
    }
    if (emailEndpoint) {
      await sendWebhookJson(emailEndpoint, {
        to: ownerEmail || ownerAlertNumber,
        subject: `New plumbing lead for ${tenant.profile.businessName || tenant.profile.businessId}`,
        text: summaryText,
        lead: {
          phone: lead.phone,
          name: summary.name,
          issue: summary.issue,
          severity: summary.severity,
          urgency: summary.urgency,
          location: summary.location,
          notes: summary.notes,
          recommendedAction: summary.recommended_action,
        },
      });
    }
    const sentAt = new Date().toISOString();
    addActivity(tenant, {
      kind: 'owner.summary.sent',
      status: 'success',
      title: 'Owner summary sent',
      summary: `Sent the Starter plumbing summary to ${ownerAlertNumber || ownerEmail}.`,
    });
    tenant.metrics.actionSuccess += 1;
    return {
      sent: true,
      sentAt,
    };
  } catch (error) {
    tenant.metrics.actionFailures += 1;
    upsertTask(tenant, {
      taskType: `starter_plumbing_owner_summary:${normalizeUsPhone(lead.phone) || 'unknown'}`,
      title: 'Send plumbing lead summary to owner',
      detail: `${summaryText} Delivery error: ${errorMessage(error)}`,
      severity: classification.severity,
    });
    return {
      sent: false,
      sentAt: '',
    };
  }
}

function completeLeadFollowups(tenant, followupTypes, leadPhone, completedAt) {
  const normalizedLeadPhone = normalizeUsPhone(leadPhone);
  for (const followup of tenant.followups) {
    if (!followupTypes.includes(followup.followupType)) {
      continue;
    }
    if (normalizeUsPhone(followup.leadPhone) !== normalizedLeadPhone || followup.status === 'done') {
      continue;
    }
    followup.status = 'done';
    followup.updatedAt = completedAt;
  }
}

function mergeLeadNotes(existing, incoming) {
  const current = stringOrDefault(existing, '').trim();
  const next = stringOrDefault(incoming, '').trim();
  if (!current) {
    return next;
  }
  if (!next || current.includes(next)) {
    return current;
  }
  return `${current} | Update: ${next}`.slice(0, 500);
}

function truncateMessage(value, maxLength) {
  const text = stringOrDefault(value, '').trim();
  if (text.length <= maxLength) {
    return text;
  }
  return `${text.slice(0, Math.max(0, maxLength - 3)).trimEnd()}...`;
}

function upsertLead(tenant, phone, patch) {
  const normalizedPhone = normalizeUsPhone(stringOrDefault(phone, ''));
  let lead = tenant.leads.find((item) => item.phone === normalizedPhone);
  const now = new Date().toISOString();
  if (!lead) {
    lead = {
      leadId: `lead_${randomUUID()}`,
      phone: normalizedPhone,
      name: '',
      email: '',
      serviceCategory: '',
      stage: 'new',
      urgencyScore: 0,
      urgencyLabel: undefined,
      address: '',
      notes: '',
      lastInboundMessage: '',
      messaging: normalizeLeadMessaging(),
      intake: undefined,
      updatedAt: now,
      createdAt: now,
    };
    tenant.leads.unshift(lead);
  }

  Object.assign(lead, patch, { updatedAt: now });
  return lead;
}

const SMS_STOP_KEYWORDS = new Set(['STOP', 'STOPALL', 'UNSUBSCRIBE', 'CANCEL', 'END', 'QUIT']);
const SMS_HELP_KEYWORDS = new Set(['HELP', 'INFO']);
const SMS_START_KEYWORDS = new Set(['START', 'UNSTOP']);

function ensureLeadMessaging(lead) {
  lead.messaging = normalizeLeadMessaging(lead.messaging);
  return lead.messaging;
}

function parseSmsCommand(bodyText) {
  const cleaned = stringOrDefault(bodyText, '')
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, ' ')
    .trim();
  if (!cleaned) {
    return null;
  }

  const [firstToken] = cleaned.split(/\s+/);
  if (!firstToken) {
    return null;
  }

  if (SMS_STOP_KEYWORDS.has(firstToken)) {
    return 'stop';
  }
  if (SMS_HELP_KEYWORDS.has(firstToken)) {
    return 'help';
  }
  if (SMS_START_KEYWORDS.has(firstToken)) {
    return 'start';
  }
  return null;
}

function isLeadSmsOptedOut(lead) {
  return ensureLeadMessaging(lead).consentStatus === 'opted_out';
}

function activateLeadSmsConsent(lead, { source = '', keyword = '' } = {}) {
  const messaging = ensureLeadMessaging(lead);
  const now = new Date().toISOString();
  messaging.consentStatus = 'active';
  messaging.consentSource = source;
  messaging.consentUpdatedAt = now;
  messaging.optedOutAt = '';
  if (keyword) {
    messaging.lastKeyword = keyword;
  }
  lead.updatedAt = now;
  return messaging;
}

function optOutLeadSms(lead, { keyword = 'STOP' } = {}) {
  const messaging = ensureLeadMessaging(lead);
  const now = new Date().toISOString();
  messaging.consentStatus = 'opted_out';
  messaging.consentSource = 'keyword:stop';
  messaging.consentUpdatedAt = now;
  messaging.optedOutAt = now;
  messaging.lastKeyword = keyword;
  lead.updatedAt = now;
  return messaging;
}

function noteLeadHelpResponse(lead, { keyword = 'HELP' } = {}) {
  const messaging = ensureLeadMessaging(lead);
  const now = new Date().toISOString();
  messaging.lastHelpSentAt = now;
  messaging.lastKeyword = keyword;
  if (messaging.consentStatus === 'unknown') {
    messaging.consentSource = 'keyword:help';
    messaging.consentUpdatedAt = now;
  }
  lead.updatedAt = now;
  return messaging;
}

function noteLeadSmsDeliveryStatus(
  lead,
  {
    status = '',
    messageSid = '',
    errorCode = '',
    errorMessage = '',
  } = {}
) {
  const messaging = ensureLeadMessaging(lead);
  const now = new Date().toISOString();
  messaging.lastOutboundStatus = stringOrDefault(status, '').toLowerCase();
  messaging.lastOutboundStatusAt = now;
  messaging.lastOutboundMessageSid = stringOrDefault(messageSid, '');
  messaging.lastOutboundError = [stringOrDefault(errorCode, ''), stringOrDefault(errorMessage, '')]
    .filter(Boolean)
    .join(': ');
  lead.updatedAt = now;
  return messaging;
}

function completeOpenTaskByType(tenant, taskType) {
  const task = tenant.tasks.find((item) => item.taskType === taskType && item.status !== 'done');
  if (!task) {
    return false;
  }
  const now = new Date().toISOString();
  task.status = 'done';
  task.updatedAt = now;
  tenant.updatedAt = now;
  tenant.metrics.lastUpdatedAt = now;
  return true;
}

function buildSmsContactFallback(tenant) {
  const phone = tenant.profile.mainBusinessNumber || tenant.profile.callbackNumber || '';
  const email = tenant.settings.contactEmail || '';
  if (phone && email) {
    return `Call ${phone} or email ${email}.`;
  }
  if (phone) {
    return `Call ${phone}.`;
  }
  if (email) {
    return `Email ${email}.`;
  }
  return 'Contact the business directly for help.';
}

function buildSmsStopConfirmation(tenant) {
  const businessName = tenant.profile.businessName || 'This business';
  return `${businessName}: You will no longer receive text messages from us. Reply START to opt back in. ${buildSmsContactFallback(
    tenant
  )}`.slice(0, 320);
}

function buildSmsHelpReply(tenant) {
  const businessName = tenant.profile.businessName || 'This business';
  return `${businessName}: Help for your request, setup review, or support conversation. Reply STOP to opt out. ${buildSmsContactFallback(
    tenant
  )}`.slice(0, 320);
}

function buildSmsOptOutReminder(tenant) {
  const businessName = tenant.profile.businessName || 'This business';
  return `${businessName}: You are currently opted out of text messages. Reply START to opt back in. ${buildSmsContactFallback(
    tenant
  )}`.slice(0, 320);
}

function buildSmsRestartReply(tenant, lead) {
  const businessName = tenant.profile.businessName || 'This business';
  if (shouldUseStarterPlumbingFlow(tenant)) {
    const nextQuestionKey =
      lead.intake?.playbook === STARTER_PLUMBING_PLAYBOOK && lead.intake?.status === 'in_progress'
        ? lead.intake.currentQuestionKey || 'issue_type'
        : 'issue_type';
    const restartQuestion =
      nextQuestionKey === 'issue_type'
        ? buildStarterPlumbingOpening(businessName)
        : buildStarterPlumbingQuestion(nextQuestionKey, lead);
    return `${businessName}: Texting is active again.\n\n${restartQuestion}`.slice(0, 320);
  }

  return `${businessName}: Texting is active again. Tell us what you need and we will follow up.`.slice(0, 320);
}

function upsertTask(tenant, task) {
  const now = new Date().toISOString();
  const existing = tenant.tasks.find(
    (item) => item.taskType === task.taskType && item.title === task.title && item.status !== 'done'
  );
  if (existing) {
    existing.detail = task.detail;
    existing.severity = task.severity;
    existing.updatedAt = now;
    return existing;
  }

  const created = {
    taskId: `task_${randomUUID()}`,
    taskType: task.taskType,
    title: task.title,
    detail: task.detail,
    status: 'open',
    severity: task.severity,
    createdAt: now,
    updatedAt: now,
  };
  tenant.tasks.unshift(created);
  return created;
}

function completeTask(store, appId, tenantId, taskId) {
  if (!taskId) {
    throw new Error('Task ID is required.');
  }

  const tenant = ensureTenant(store, appId, tenantId);
  const task = tenant.tasks.find((item) => item.taskId === taskId);
  if (!task) {
    throw new Error(`Task ${taskId} was not found.`);
  }

  if (task.status === 'done') {
    return {
      summary: `Task "${task.title}" was already complete.`,
      taskId,
    };
  }

  const now = new Date().toISOString();
  task.status = 'done';
  task.updatedAt = now;
  const completedFollowups = completeFollowupsByTaskType(tenant, task.taskType, now);
  tenant.metrics.lastUpdatedAt = now;
  tenant.updatedAt = now;
  addActivity(tenant, {
    kind: 'task.completed',
    status: 'success',
    title: 'Task completed',
    summary:
      completedFollowups > 0
        ? `Completed ${task.title} and cleared ${completedFollowups} related follow-up item${completedFollowups === 1 ? '' : 's'}.`
        : `Completed ${task.title}.`,
  });

  return {
    summary:
      completedFollowups > 0
        ? `Completed ${task.title} and cleared ${completedFollowups} related follow-up item${completedFollowups === 1 ? '' : 's'}.`
        : `Completed ${task.title}.`,
    taskId,
  };
}

function completeFollowup(store, appId, tenantId, followupId) {
  if (!followupId) {
    throw new Error('Follow-up ID is required.');
  }

  const tenant = ensureTenant(store, appId, tenantId);
  const followup = tenant.followups.find((item) => item.followupId === followupId);
  if (!followup) {
    throw new Error(`Follow-up ${followupId} was not found.`);
  }

  if (followup.status === 'done') {
    return {
      summary: `Follow-up "${followup.title}" was already complete.`,
      followupId,
    };
  }

  const now = new Date().toISOString();
  followup.status = 'done';
  followup.updatedAt = now;
  const completedTasks = completeTasksByTaskType(tenant, followup.taskType, now);
  tenant.metrics.lastUpdatedAt = now;
  tenant.updatedAt = now;
  addActivity(tenant, {
    kind: 'followup.completed',
    status: 'success',
    title: 'Follow-up completed',
    summary:
      completedTasks > 0
        ? `Completed ${followup.title} and closed ${completedTasks} related task${completedTasks === 1 ? '' : 's'}.`
        : `Completed ${followup.title}.`,
  });

  return {
    summary:
      completedTasks > 0
        ? `Completed ${followup.title} and closed ${completedTasks} related task${completedTasks === 1 ? '' : 's'}.`
        : `Completed ${followup.title}.`,
    followupId,
  };
}

function completeTasksByTaskType(tenant, taskType, completedAt) {
  if (!taskType) {
    return 0;
  }

  let completedCount = 0;
  for (const task of tenant.tasks) {
    if (task.taskType !== taskType || task.status === 'done') {
      continue;
    }
    task.status = 'done';
    task.updatedAt = completedAt;
    completedCount += 1;
  }
  return completedCount;
}

function completeFollowupsByTaskType(tenant, taskType, completedAt) {
  if (!taskType) {
    return 0;
  }

  let completedCount = 0;
  for (const followup of tenant.followups) {
    if (followup.taskType !== taskType || followup.status === 'done') {
      continue;
    }
    followup.status = 'done';
    followup.updatedAt = completedAt;
    completedCount += 1;
  }
  return completedCount;
}

function addActivity(tenant, activity) {
  tenant.activity.unshift({
    activityId: `act_${randomUUID()}`,
    kind: activity.kind,
    status: activity.status,
    title: activity.title,
    summary: activity.summary,
    timestamp: new Date().toISOString(),
  });
}

function scheduleFollowup(tenant, followup) {
  const leadPhone = normalizeUsPhone(stringOrDefault(followup.leadPhone, ''));
  const followupType = stringOrDefault(followup.followupType, 'manual_followup');
  const taskType = buildFollowupTaskType(followupType, leadPhone);
  const existing = tenant.followups.find(
    (item) =>
      item.followupType === followupType &&
      item.leadPhone === leadPhone &&
      item.status !== 'done'
  );
  const normalized = normalizeFollowup({
    ...followup,
    followupId: existing?.followupId,
    taskType,
    leadPhone,
    createdAt: existing?.createdAt,
  });

  if (existing) {
    Object.assign(existing, normalized, {
      updatedAt: new Date().toISOString(),
    });
    return existing;
  }

  tenant.followups.unshift(normalized);
  return normalized;
}

function buildReplyFollowup(optionKey, fromNumber, mapped) {
  const normalizedPhone = normalizeUsPhone(fromNumber);
  const defaults = {
    '1': {
      followupType: 'leak_followup',
      title: 'Leak plumbing follow-up',
      detail: `Call ${normalizedPhone || 'this lead'} about the reported leak.`,
      severity: 'medium',
      delayMinutes: 20,
    },
    '2': {
      followupType: 'clog_followup',
      title: 'Clog plumbing follow-up',
      detail: `Call ${normalizedPhone || 'this lead'} about the reported clog.`,
      severity: 'medium',
      delayMinutes: 20,
    },
    '3': {
      followupType: 'other_plumbing_followup',
      title: 'Plumbing follow-up',
      detail: `Review the plumbing issue details from ${normalizedPhone || 'this lead'}.`,
      severity: 'medium',
      delayMinutes: 30,
    },
    '4': {
      followupType: 'urgent_followup',
      title: 'Urgent plumbing follow-up',
      detail: `${normalizedPhone || 'This lead'} flagged the plumbing issue as urgent.`,
      severity: 'high',
      delayMinutes: 0,
    },
  };

  const config = defaults[optionKey] || {
    followupType: 'customer_followup',
    title: 'Customer follow-up',
    detail: `Follow up with ${normalizedPhone || 'this lead'}.`,
    severity: 'medium',
    delayMinutes: 180,
  };

  return {
    ...config,
    leadPhone: normalizedPhone,
    scheduledFor: scheduleMinutesFromNow(config.delayMinutes),
  };
}

async function processDueFollowupsForTenant(
  store,
  appId,
  tenant,
  {
    limit = FOLLOWUP_RUNNER_LIMIT_PER_TENANT,
    sendOwnerAlerts = false,
    reason = 'runner',
  } = {}
) {
  const nowMs = Date.now();
  const ready = tenant.followups
    .filter((followup) => isFollowupReady(followup, nowMs))
    .sort((a, b) => Date.parse(a.scheduledFor) - Date.parse(b.scheduledFor))
    .slice(0, limit);

  let dueMarked = 0;
  let tasksCreated = 0;
  let alertsSent = 0;

  for (const followup of ready) {
    const now = new Date().toISOString();
    if (followup.status !== 'due') {
      followup.status = 'due';
      followup.updatedAt = now;
      dueMarked += 1;
      addActivity(tenant, {
        kind: 'followup.due',
        status: 'warning',
        title: followup.title,
        summary: `${followup.detail} (${reason})`,
      });
    }

    const previousTaskCount = tenant.tasks.length;
    upsertTask(tenant, {
      taskType: followup.taskType,
      title: followup.title,
      detail: followup.detail,
      severity: followup.severity,
    });
    if (tenant.tasks.length > previousTaskCount) {
      tasksCreated += 1;
    }

    if (sendOwnerAlerts && !followup.ownerAlertSentAt) {
      const alertSent = await sendOwnerAlertForFollowup(store, appId, tenant, followup);
      if (alertSent) {
        const sentAt = new Date().toISOString();
        followup.ownerAlertSentAt = sentAt;
        followup.updatedAt = sentAt;
        alertsSent += 1;
      }
    }
  }

  const changed = dueMarked > 0 || tasksCreated > 0 || alertsSent > 0;
  if (changed) {
    const updatedAt = new Date().toISOString();
    tenant.metrics.lastUpdatedAt = updatedAt;
    tenant.updatedAt = updatedAt;
  }

  return {
    changed,
    readyCount: ready.length,
    dueMarked,
    tasksCreated,
    alertsSent,
  };
}

async function sendOwnerAlertForFollowup(store, appId, tenant, followup) {
  const ownerAlertNumber = normalizeUsPhone(tenant.settings.ownerAlertDestination || '');
  const emailEndpoint = resolveNotificationEndpoint(tenant.settings.email);
  if (!ownerAlertNumber.startsWith('+')) {
    if (!emailEndpoint) {
      return false;
    }
  }
  const fromNumber = tenant.profile.callbackNumber || tenant.connectors.sms.fromNumber || '';

  try {
    const body = `ResponseOS follow-up due for ${tenant.profile.businessName || tenant.profile.businessId}. ${followup.title}. ${followup.detail}`.slice(
      0,
      320
    );
    if (ownerAlertNumber.startsWith('+') && tenant.connectors.sms?.live && fromNumber) {
      await sendTwilioSms(tenant.connectors.sms, {
        to: ownerAlertNumber,
        from: fromNumber,
        body,
        statusCallbackUrl: buildTwilioWebhookUrl(store, appId),
      });
    }
    if (emailEndpoint) {
      await sendWebhookJson(emailEndpoint, {
        to: stringOrDefault(tenant.settings.contactEmail, '') || ownerAlertNumber,
        subject: `Follow-up due for ${tenant.profile.businessName || tenant.profile.businessId}`,
        text: body,
        followup: {
          title: followup.title,
          detail: followup.detail,
          leadPhone: followup.leadPhone,
          severity: followup.severity,
          scheduledFor: followup.scheduledFor,
        },
      });
    }
    addActivity(tenant, {
      kind: 'followup.alert',
      status: 'success',
      title: 'Owner alert sent',
      summary: `Sent a follow-up alert for ${followup.title} to ${ownerAlertNumber || tenant.settings.contactEmail || 'configured endpoint'}.`,
    });
    return true;
  } catch (error) {
    upsertTask(tenant, {
      taskType: `owner_alert_failed:${followup.followupId}`,
      title: 'Owner alert delivery failed',
      detail: error instanceof Error ? error.message : 'ResponseOS could not send the owner alert.',
      severity: 'medium',
    });
    return false;
  }
}

async function runFollowupSweep(store, { appId, tenantId, reason = 'runner' } = {}) {
  const appIds = appId ? [appId] : Object.keys(store.apps);
  const result = {
    changed: false,
    summary: 'No due follow-ups were ready.',
    tenantsScanned: 0,
    readyCount: 0,
    dueMarked: 0,
    tasksCreated: 0,
    alertsSent: 0,
  };

  for (const currentAppId of appIds) {
    const app = ensureApp(store, currentAppId);
    const tenantEntries = tenantId
      ? [[tenantId, ensureTenant(store, currentAppId, tenantId)]]
      : Object.entries(app.tenants);

    for (const [, tenant] of tenantEntries) {
      result.tenantsScanned += 1;
      const tenantResult = await processDueFollowupsForTenant(store, currentAppId, tenant, {
        limit: FOLLOWUP_RUNNER_LIMIT_PER_TENANT,
        sendOwnerAlerts: true,
        reason,
      });
      result.changed = result.changed || tenantResult.changed;
      result.readyCount += tenantResult.readyCount;
      result.dueMarked += tenantResult.dueMarked;
      result.tasksCreated += tenantResult.tasksCreated;
      result.alertsSent += tenantResult.alertsSent;
    }
  }

  result.summary =
    result.readyCount > 0
      ? `Processed ${result.readyCount} due follow-up${result.readyCount === 1 ? '' : 's'} across ${result.tenantsScanned} client workspace${result.tenantsScanned === 1 ? '' : 's'}.`
      : 'No due follow-ups were ready.';

  return result;
}

function startFollowupRunner() {
  if (followupRunnerRunning) {
    return;
  }

  const executeSweep = async () => {
    if (followupRunnerBusy) {
      return;
    }

    followupRunnerBusy = true;
    try {
      const store = await loadStore();
      const result = await runFollowupSweep(store, { reason: 'runner' });
      if (result.changed) {
        await saveStore(store);
      }
    } catch (error) {
      console.error(
        `[responseos-gateway] follow-up runner failed: ${error instanceof Error ? error.message : String(error)}`
      );
    } finally {
      followupRunnerBusy = false;
    }
  };

  followupRunnerRunning = true;
  void executeSweep();
  followupRunnerTimer = setInterval(() => {
    void executeSweep();
  }, FOLLOWUP_RUNNER_INTERVAL_MS);
  if (typeof followupRunnerTimer.unref === 'function') {
    followupRunnerTimer.unref();
  }
}

async function fetchTwilioAccount(config) {
  const accountSid = stringOrDefault(config.account_sid, '');
  const authToken = stringOrDefault(config.auth_token, '');
  const baseUrl = stringOrDefault(config.base_url, '') || 'https://api.twilio.com';
  const url = new URL(`/2010-04-01/Accounts/${accountSid}.json`, ensureTrailingSlash(baseUrl));
  const response = await fetch(url, {
    headers: {
      authorization: buildBasicAuth(accountSid, authToken),
    },
  });

  if (!response.ok) {
    throw new Error(await readTwilioError(response));
  }

  return response.json();
}

async function fetchIncomingPhoneNumber({ accountSid, authToken, baseUrl, phoneNumber }) {
  const rootUrl = stringOrDefault(baseUrl, '') || 'https://api.twilio.com';
  const url = new URL(
    `/2010-04-01/Accounts/${accountSid}/IncomingPhoneNumbers.json`,
    ensureTrailingSlash(rootUrl)
  );
  url.searchParams.set('PhoneNumber', phoneNumber);
  const response = await fetch(url, {
    headers: {
      authorization: buildBasicAuth(accountSid, authToken),
    },
  });
  if (!response.ok) {
    throw new Error(await readTwilioError(response));
  }

  const payload = await response.json();
  return Array.isArray(payload.incoming_phone_numbers) ? payload.incoming_phone_numbers[0] || null : null;
}

async function updateIncomingPhoneNumberWebhooks({
  accountSid,
  authToken,
  baseUrl,
  incomingPhoneNumberSid,
  webhookUrl,
}) {
  const rootUrl = stringOrDefault(baseUrl, '') || 'https://api.twilio.com';
  const url = new URL(
    `/2010-04-01/Accounts/${accountSid}/IncomingPhoneNumbers/${incomingPhoneNumberSid}.json`,
    ensureTrailingSlash(rootUrl)
  );
  const body = new URLSearchParams({
    SmsUrl: webhookUrl,
    SmsMethod: 'POST',
    VoiceUrl: webhookUrl,
    VoiceMethod: 'POST',
    StatusCallback: webhookUrl,
    StatusCallbackMethod: 'POST',
  });
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      authorization: buildBasicAuth(accountSid, authToken),
      'content-type': 'application/x-www-form-urlencoded',
    },
    body,
  });
  if (!response.ok) {
    throw new Error(await readTwilioError(response));
  }

  return response.json();
}

async function sendTwilioSms(connector, message) {
  const baseUrl = stringOrDefault(connector.baseUrl, '') || 'https://api.twilio.com';
  const url = new URL(
    `/2010-04-01/Accounts/${connector.accountSid}/Messages.json`,
    ensureTrailingSlash(baseUrl)
  );
  const body = new URLSearchParams({
    To: message.to,
    From: message.from,
    Body: message.body,
  });
  if (stringOrDefault(message.statusCallbackUrl, '')) {
    body.set('StatusCallback', stringOrDefault(message.statusCallbackUrl, ''));
    body.set('StatusCallbackMethod', 'POST');
  }
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      authorization: buildBasicAuth(connector.accountSid, connector.authToken),
      'content-type': 'application/x-www-form-urlencoded',
    },
    body,
  });
  if (!response.ok) {
    throw new Error(await readTwilioError(response));
  }

  return response.json();
}

async function readTwilioError(response) {
  try {
    const json = await response.json();
    return json.message || `Twilio request failed with status ${response.status}.`;
  } catch {
    return `Twilio request failed with status ${response.status}.`;
  }
}

function getExpectedApiKey(store, appId) {
  ensureApp(store, appId);
  return store.config.apiKeys[appId] || DEFAULT_API_KEY;
}

function resolveTenantIdForTwilioWebhook(store, appId, payload) {
  const candidateNumbers = [];
  const messageStatus = stringOrDefault(payload.MessageStatus || payload.SmsStatus, '').toLowerCase();

  if (messageStatus && messageStatus !== 'received' && !payload.Body) {
    candidateNumbers.push(payload.From || '');
  }
  candidateNumbers.push(payload.To || '', payload.Called || '', payload.From || '');

  for (const candidate of candidateNumbers) {
    const routedNumber = normalizeUsPhone(candidate);
    if (!routedNumber) {
      continue;
    }
    const tenantId = findTenantIdByCallbackNumber(store, appId, routedNumber);
    if (tenantId) {
      return tenantId;
    }
  }

  return '';
}

function findTenantIdByCallbackNumber(store, appId, callbackNumber) {
  const normalizedCallbackNumber = normalizeUsPhone(callbackNumber);
  if (!normalizedCallbackNumber) {
    return '';
  }

  const app = ensureApp(store, appId);
  const matches = Object.entries(app.tenants).filter(([, tenant]) => {
    return normalizeUsPhone(tenant.profile.callbackNumber || tenant.connectors.sms?.fromNumber || '') === normalizedCallbackNumber;
  });

  if (matches.length > 1) {
    throw new Error(`Twilio number ${normalizedCallbackNumber} is assigned to more than one client workspace.`);
  }

  return matches[0]?.[0] || '';
}

function assertUniqueCallbackNumber(store, appId, tenantId, callbackNumber) {
  const normalizedCallbackNumber = normalizeUsPhone(callbackNumber);
  if (!normalizedCallbackNumber) {
    return;
  }

  const app = ensureApp(store, appId);
  const conflict = Object.entries(app.tenants).find(([currentTenantId, tenant]) => {
    if (currentTenantId === tenantId) {
      return false;
    }

    return normalizeUsPhone(tenant.profile.callbackNumber || tenant.connectors.sms?.fromNumber || '') === normalizedCallbackNumber;
  });

  if (conflict) {
    throw new Error(`Twilio number ${normalizedCallbackNumber} is already assigned to ${conflict[0]}.`);
  }
}

function buildTwilioWebhookUrl(store, appId) {
  if (!PUBLIC_BASE_URL) {
    return '';
  }

  const url = new URL('/v1/revenue/webhooks/twilio', ensureTrailingSlash(PUBLIC_BASE_URL));
  url.searchParams.set('app_id', appId || DEFAULT_APP_ID);
  url.searchParams.set('api_key', getExpectedApiKey(store, appId || DEFAULT_APP_ID));
  return url.toString();
}

function isForwardedMissedCallWebhook(payload, tenant) {
  const direction = String(payload.Direction || '').trim().toLowerCase();
  const status = String(payload.CallStatus || '').trim().toLowerCase();
  const relayNumber = normalizeUsPhone(tenant.profile.callbackNumber || '');
  const businessNumbers = getConfiguredBusinessNumbers(tenant.profile).map((item) =>
    normalizeUsPhone(item)
  );
  const forwardedFrom = normalizeUsPhone(payload.ForwardedFrom || '');
  const targetNumber = normalizeUsPhone(payload.To || '');
  const relayDistinctBusinessNumbers = businessNumbers.filter((item) => item && item !== relayNumber);
  const forwardedFromMatches =
    !forwardedFrom || relayDistinctBusinessNumbers.includes(forwardedFrom);

  return Boolean(
    payload.CallSid &&
    direction === 'inbound' &&
    ['queued', 'ringing', 'in-progress'].includes(status) &&
    relayNumber &&
    targetNumber === relayNumber &&
    relayDistinctBusinessNumbers.length &&
    forwardedFromMatches
  );
}

function isDirectDemoMissedCallWebhook(payload, tenant) {
  const direction = String(payload.Direction || '').trim().toLowerCase();
  const status = String(payload.CallStatus || '').trim().toLowerCase();
  const relayNumber = normalizeUsPhone(tenant.profile.callbackNumber || '');
  const targetNumber = normalizeUsPhone(payload.To || '');
  const forwardedFrom = normalizeUsPhone(payload.ForwardedFrom || '');

  return Boolean(
    payload.CallSid &&
    direction === 'inbound' &&
    ['queued', 'ringing', 'in-progress'].includes(status) &&
    relayNumber &&
    targetNumber === relayNumber &&
    !forwardedFrom
  );
}

function markDirectDemoCallSid(callSid) {
  const normalized = stringOrDefault(callSid, '').trim();
  if (!normalized) {
    return false;
  }
  if (DIRECT_DEMO_CALL_SIDS.has(normalized)) {
    return false;
  }
  DIRECT_DEMO_CALL_SIDS.add(normalized);
  if (DIRECT_DEMO_CALL_SIDS.size > 500) {
    DIRECT_DEMO_CALL_SIDS.clear();
    DIRECT_DEMO_CALL_SIDS.add(normalized);
  }
  return true;
}

function isDuplicateMissedCallEvent({ fromNumber, toNumber, forwardedFrom }) {
  const normalizedFrom = normalizeUsPhone(fromNumber || '');
  const normalizedTo = normalizeUsPhone(toNumber || '');
  const normalizedForwardedFrom = normalizeUsPhone(forwardedFrom || '');
  const key = [normalizedFrom, normalizedTo, normalizedForwardedFrom].filter(Boolean).join('|');
  if (!key) {
    return false;
  }
  const now = Date.now();
  const previous = RECENT_MISSED_CALL_EVENTS.get(key);
  RECENT_MISSED_CALL_EVENTS.set(key, now);
  if (RECENT_MISSED_CALL_EVENTS.size > 500) {
    for (const [currentKey, timestamp] of RECENT_MISSED_CALL_EVENTS.entries()) {
      if (now - timestamp > 60_000) {
        RECENT_MISSED_CALL_EVENTS.delete(currentKey);
      }
    }
  }
  return typeof previous === 'number' && now - previous < 15_000;
}

function queueTwilioVoiceMissedCallProcessing({ store, appId, tenantId, event }) {
  setImmediate(async () => {
    const tenant = ensureTenant(store, appId, tenantId);
    try {
      await processEvent(store, appId, tenantId, event);
      await saveStore(store);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.warn(`[responseos-gateway] Twilio voice processing failed for ${tenantId}: ${message}`);
      addActivity(tenant, {
        kind: 'event.processed',
        status: 'error',
        title: 'Twilio voice processing failed',
        summary: message,
      });
      tenant.metrics.actionFailures += 1;
      tenant.metrics.lastUpdatedAt = new Date().toISOString();
      tenant.updatedAt = tenant.metrics.lastUpdatedAt;
      try {
        await saveStore(store);
      } catch (saveError) {
        console.warn(
          `[responseos-gateway] Could not save Twilio voice failure for ${tenantId}: ${
            saveError instanceof Error ? saveError.message : String(saveError)
          }`
        );
      }
    }
  });
}

function ensureTrailingSlash(value) {
  return value.replace(/\/+$/, '') + '/';
}

function buildBasicAuth(username, password) {
  return `Basic ${Buffer.from(`${username}:${password}`).toString('base64')}`;
}

async function readBody(req) {
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks).toString('utf8');
}

function parseBody(req, raw) {
  const contentType = String(req.headers['content-type'] || '').toLowerCase();
  if (contentType.includes('application/json')) {
    return raw.trim() ? JSON.parse(raw) : {};
  }
  if (contentType.includes('application/x-www-form-urlencoded')) {
    return Object.fromEntries(new URLSearchParams(raw));
  }
  return raw.trim() ? JSON.parse(raw) : {};
}

function send(res, status, body, contentType) {
  res.writeHead(status, {
    ...defaultHeaders,
    'content-type': contentType,
  });
  res.end(body);
}

function sendJson(res, status, payload) {
  send(res, status, JSON.stringify(payload, null, 2), 'application/json; charset=utf-8');
}

function sendXml(res, status, payload) {
  send(res, status, payload, 'text/xml; charset=utf-8');
}

function sendError(res, status, message) {
  sendJson(res, status, {
    error: {
      message,
    },
  });
}

function sendWebhookError(res, status, message) {
  console.warn(`[responseos-gateway] Webhook error (${status}): ${message}`);
  sendXml(res, status, `<?xml version="1.0" encoding="UTF-8"?><Response><!-- Error ${status}: ${message} --></Response>`);
}

function parseBooleanEnv(value, fallback) {
  const normalized = String(value || '').trim().toLowerCase();
  if (!normalized) {
    return fallback;
  }
  if (['1', 'true', 'yes', 'on'].includes(normalized)) {
    return true;
  }
  if (['0', 'false', 'no', 'off'].includes(normalized)) {
    return false;
  }
  return fallback;
}

function parseBooleanLoose(value, fallback) {
  if (typeof value === 'boolean') {
    return value;
  }
  return parseBooleanEnv(value, fallback);
}

function parseIntegerEnv(value, fallback) {
  const parsed = Number.parseInt(String(value || ''), 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function stringOrDefault(value, fallback) {
  return typeof value === 'string' && value.trim() ? value.trim() : fallback;
}

function firstMatch(value, pattern) {
  const match = value.match(pattern);
  return match ? stripHtml(match[1]).trim() : '';
}

function uniqueMatches(value, pattern) {
  const values = [];
  for (const match of value.matchAll(pattern)) {
    values.push(stripHtml(match[1] || match[0]).trim());
  }
  return [...new Set(values.filter(Boolean))];
}

function stripHtml(value) {
  return String(value || '')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function normalizeUsPhone(value) {
  const digits = String(value || '').replace(/\D+/g, '');
  if (digits.length === 11 && digits.startsWith('1')) {
    return `+${digits}`;
  }
  if (digits.length === 10) {
    return `+1${digits}`;
  }
  return String(value || '').trim();
}

function normalizePhoneList(value, fallbackPrimary = '') {
  const rawValues = Array.isArray(value)
    ? value
    : typeof value === 'string'
      ? value.split(/[\r\n,]+/)
      : [];
  const cleaned = [...new Set(rawValues.map((item) => String(item || '').trim()).filter(Boolean))];
  const primary = String(fallbackPrimary || '').trim();
  if (primary && !cleaned.includes(primary)) {
    cleaned.unshift(primary);
  }
  return cleaned;
}

function getConfiguredBusinessNumbers(profile) {
  return normalizePhoneList(profile?.mainBusinessNumbers, profile?.mainBusinessNumber || '');
}

function buildFollowupTaskType(followupType, leadPhone) {
  const normalizedLeadPhone = normalizeUsPhone(leadPhone || '').replace(/[^+\d]/g, '') || 'unknown';
  return `${stringOrDefault(followupType, 'followup')}:${normalizedLeadPhone}`;
}

function scheduleMinutesFromNow(minutes) {
  return new Date(Date.now() + Math.max(0, Number(minutes) || 0) * 60 * 1000).toISOString();
}

function isFollowupReady(followup, nowMs = Date.now()) {
  if (!followup || followup.status === 'done') {
    return false;
  }
  if (followup.status === 'due') {
    return true;
  }
  const scheduledAt = Date.parse(followup.scheduledFor || '');
  return Number.isFinite(scheduledAt) && scheduledAt <= nowMs;
}

function maskValue(value) {
  const stringValue = String(value || '');
  if (stringValue.length <= 6) return stringValue;
  return `${stringValue.slice(0, 4)}...${stringValue.slice(-2)}`;
}

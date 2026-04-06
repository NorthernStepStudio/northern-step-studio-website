import { spawn } from 'node:child_process';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import net from 'node:net';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const APP_ROOT = path.resolve(__dirname, '..');

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

async function findOpenPort() {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.on('error', reject);
    server.listen(0, '127.0.0.1', () => {
      const address = server.address();
      if (!address || typeof address === 'string') {
        server.close(() => reject(new Error('Could not reserve a test port.')));
        return;
      }

      const { port } = address;
      server.close((error) => {
        if (error) {
          reject(error);
          return;
        }
        resolve(port);
      });
    });
  });
}

async function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function requestJson(url, init = {}) {
  const response = await fetch(url, init);
  const text = await response.text();
  const payload = text ? JSON.parse(text) : {};

  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}: ${JSON.stringify(payload)}`);
  }

  return payload;
}

async function waitForHealth(baseUrl) {
  let lastError = null;

  for (let attempt = 0; attempt < 30; attempt += 1) {
    try {
      const health = await requestJson(`${baseUrl}/health`);
      if (health.ok) {
        return health;
      }
    } catch (error) {
      lastError = error;
    }

    await wait(300);
  }

  throw lastError || new Error('Gateway did not become healthy in time.');
}

async function main() {
  const port = await findOpenPort();
  const baseUrl = `http://127.0.0.1:${port}`;
  const tenantId = 'smoke-plumbing';
  const tempDataDir = await mkdtemp(path.join(os.tmpdir(), 'nss-missed-call-ai-smoke-'));
  const storePath = path.join(tempDataDir, 'responseos-store.json');
  const seededPlaintextToken = 'smoke-plaintext-auth-token';
  const headers = {
    'x-api-key': 'preview-key',
    'content-type': 'application/json',
  };

  await writeFile(
    storePath,
    JSON.stringify(
      {
        version: 1,
        config: {
          apiKeys: {
            'responseos-app': 'preview-key',
          },
        },
        apps: {
          'responseos-app': {
            provider: 'mock',
            tenants: {
              [tenantId]: {
                profile: {
                  businessId: tenantId,
                  businessName: 'Seeded Smoke Plumbing',
                  mainBusinessNumber: '+12025550100',
                  mainBusinessNumbers: ['+12025550100'],
                  callbackNumber: '+12025550199',
                },
                settings: {},
                connectors: {
                  sms: {
                    provider: 'twilio',
                    connectorId: 'twilio-sms',
                    accountSid: 'ACseededsmoketest',
                    authToken: seededPlaintextToken,
                    baseUrl: '',
                    fromNumber: '+12025550199',
                    live: true,
                    summary: 'Seeded smoke connector',
                  },
                },
                metrics: {},
                leads: [],
                followups: [],
                activity: [],
                tasks: [],
              },
            },
          },
        },
      },
      null,
      2
    ),
    'utf8'
  );

  const gateway = spawn(process.execPath, ['server/index.mjs'], {
    cwd: APP_ROOT,
    env: {
      ...process.env,
      RESPONSEOS_GATEWAY_PORT: String(port),
      RESPONSEOS_GATEWAY_DATA_DIR: tempDataDir,
      RESPONSEOS_CREDENTIAL_KEY: 'smoke-credential-key',
      RESPONSEOS_FOLLOWUP_RUNNER_ENABLED: 'false',
      M_CORE_PROVIDER_MODE: process.env.M_CORE_PROVIDER_MODE || 'mock',
    },
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  let stdout = '';
  let stderr = '';
  gateway.stdout.on('data', (chunk) => {
    stdout += chunk.toString();
  });
  gateway.stderr.on('data', (chunk) => {
    stderr += chunk.toString();
  });

  try {
    const health = await waitForHealth(baseUrl);
    assert(health.service === 'responseos-gateway', 'Unexpected gateway health payload.');

    const provider = await requestJson(
      `${baseUrl}/v1/config/provider?app_id=responseos-app`,
      { headers }
    );
    assert(provider.provider?.effective, 'Provider status did not include an effective provider.');

    const runtime = await requestJson(
      `${baseUrl}/v1/runtime/status?app_id=responseos-app`,
      { headers }
    );
    assert(runtime.runtime?.identity?.appId === 'responseos-app', 'Runtime status returned the wrong app id.');
    assert(
      runtime.runtime?.security?.credentialsAtRest === 'encrypted',
      'Runtime status did not report encrypted credential storage.'
    );

    const migratedStore = JSON.parse(await readFile(storePath, 'utf8'));
    const migratedToken = migratedStore?.apps?.['responseos-app']?.tenants?.[tenantId]?.connectors?.sms?.authToken;
    assert(
      migratedToken && typeof migratedToken === 'object' && migratedToken.encrypted === true,
      'Plaintext Twilio auth token was not migrated to encrypted storage.'
    );
    assert(
      !JSON.stringify(migratedStore).includes(seededPlaintextToken),
      'Plaintext Twilio auth token was still present on disk after migration.'
    );

    await requestJson(`${baseUrl}/v1/revenue/profile`, {
      method: 'PUT',
      headers,
      body: JSON.stringify({
        app_id: 'responseos-app',
        tenant_id: tenantId,
        profile: {
          businessName: 'Northern Step Plumbing',
          mainBusinessNumber: '+12025550100',
          mainBusinessNumbers: ['+12025550100', '+12025550101'],
          callbackNumber: '+12025550199',
          timezone: 'America/New_York',
          services: ['Leak repair', 'Drain clearing', 'Clog removal'],
          serviceArea: 'Queens',
          templates: {
            missedCallReply:
              "Hey, this is Northern Step Plumbing. Sorry we missed your call. What's going on - leak, clog, water heater, or something else?",
            replyOptions: {
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
            },
          },
        },
        settings: {
          websiteUrl: 'https://example.com',
          ownerAlertDestination: '+12025550122',
          contactEmail: 'office@example.com',
          bookingLink: '',
          reviewUrl: '',
          automation: {
            tier: 'starter',
            mode: 'hybrid',
            vertical: 'plumbing',
            maxRequestsPerDay: 25,
            fallbackOnFailure: true,
          },
          sms: {
            provider: 'simulated',
            connectorId: '',
            path: 'Messages.json',
          },
          email: {
            provider: 'simulated',
            connectorId: '',
            path: '/emails',
            fromEmail: '',
            fromName: '',
          },
          calendar: {
            provider: 'simulated',
            connectorId: '',
            path: '/events',
            calendarId: 'primary',
          },
        },
      }),
    });

    const workspace = await requestJson(
      `${baseUrl}/v1/revenue/workspace?app_id=responseos-app&tenant_id=${encodeURIComponent(tenantId)}`,
      { headers }
    );
    assert(
      workspace.workspace?.profile?.businessName === 'Northern Step Plumbing',
      'Workspace profile did not save correctly.'
    );

    const duplicate = await requestJson(`${baseUrl}/v1/revenue/tenants/duplicate`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        app_id: 'responseos-app',
        source_tenant_id: tenantId,
        target_tenant_id: 'smoke-plumbing-copy',
        business_name: 'Northern Step Plumbing Copy',
        main_business_number: '+12025550102',
        main_business_numbers: ['+12025550102'],
      }),
    });
    assert(
      duplicate.result?.workspace?.profile?.businessName === 'Northern Step Plumbing Copy',
      'Duplicate tenant did not return the copied workspace.'
    );
    assert(
      duplicate.result?.workspace?.profile?.callbackNumber === '',
      'Duplicate tenant should clear the Twilio relay number.'
    );
    assert(
      duplicate.result?.workspace?.onboarding?.channels?.sms?.live === false,
      'Duplicate tenant should not carry over live Twilio wiring.'
    );

    const assist = await requestJson(`${baseUrl}/v1/revenue/ai/setup-assist`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        app_id: 'responseos-app',
        tenant_id: tenantId,
        profile: workspace.workspace.profile,
        settings: workspace.workspace.settings,
      }),
    });
    assert(assist.result?.summary, 'Setup assist did not return a summary.');
    assert(assist.result?.replyOptions?.['1']?.title, 'Setup assist did not return reply option 1.');

    const demoOpening = await requestJson(`${baseUrl}/lead`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        session_id: 'smoke-demo',
        business_name: 'Northern Step Plumbing',
        agent_name: 'Mike',
      }),
    });
    assert(
      demoOpening.reply.includes("What's going on - leak, clog, water heater, or something else?"),
      'Demo endpoint did not return the Starter plumbing opening.'
    );

    const demoMessages = [
      'Leak under the sink',
      'Constant',
      'Yes, a little',
      'Kitchen',
      'Jordan',
    ];
    let demoResult = demoOpening;
    for (const customerReply of demoMessages) {
      demoResult = await requestJson(`${baseUrl}/lead`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          session_id: 'smoke-demo',
          message: customerReply,
          business_name: 'Northern Step Plumbing',
          agent_name: 'Mike',
        }),
      });
    }
    assert(demoResult.done === true, 'Demo endpoint did not finish the sample intake.');
    assert(demoResult.summary?.severity === 'High', 'Demo endpoint did not classify severity correctly.');
    assert(
      demoResult.summary?.recommended_action === 'Call immediately',
      'Demo endpoint did not return the expected recommended action.'
    );

    const webhookResponse = await fetch(
      `${baseUrl}/v1/revenue/webhooks/twilio?app_id=responseos-app&api_key=preview-key`,
      {
        method: 'POST',
        headers: {
          'content-type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          CallSid: `CA_${Date.now()}`,
          CallStatus: 'ringing',
          Direction: 'inbound',
          To: '+12025550199',
          ForwardedFrom: '+12025550101',
          From: '+12025550111',
        }),
      }
    );
    assert(webhookResponse.ok, 'Twilio webhook simulation failed.');

    const unauthorizedWebhookResponse = await fetch(
      `${baseUrl}/v1/revenue/webhooks/twilio?app_id=responseos-app&api_key=wrong-key`,
      {
        method: 'POST',
        headers: {
          'content-type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          CallSid: `CA_${Date.now()}`,
        }),
      }
    );
    assert(unauthorizedWebhookResponse.status === 401, 'Unauthorized webhook should return 401.');
    const unauthorizedBody = await unauthorizedWebhookResponse.text();
    assert(unauthorizedBody.includes('<Response>'), 'Unauthorized Twilio voice webhook should return TwiML.');

    await requestJson(`${baseUrl}/v1/revenue/events`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        app_id: 'responseos-app',
        tenant_id: tenantId,
        event: {
          type: 'call.missed',
          fromNumber: '+12025550111',
          toNumber: '+12025550199',
          forwardedFrom: '+12025550100',
          source: 'smoke-test',
        },
      }),
    });

    await requestJson(`${baseUrl}/v1/revenue/events`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        app_id: 'responseos-app',
        tenant_id: tenantId,
        event: {
          type: 'sms.received',
          fromNumber: '+12025550111',
          toNumber: '+12025550199',
          body: 'Leak under the sink',
          source: 'smoke-test',
        },
      }),
    });

    await requestJson(`${baseUrl}/v1/revenue/events`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        app_id: 'responseos-app',
        tenant_id: tenantId,
        event: {
          type: 'sms.received',
          fromNumber: '+12025550111',
          toNumber: '+12025550199',
          body: 'Constant',
          source: 'smoke-test',
        },
      }),
    });

    await requestJson(`${baseUrl}/v1/revenue/events`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        app_id: 'responseos-app',
        tenant_id: tenantId,
        event: {
          type: 'sms.received',
          fromNumber: '+12025550111',
          toNumber: '+12025550199',
          body: 'Yes, a little',
          source: 'smoke-test',
        },
      }),
    });

    await requestJson(`${baseUrl}/v1/revenue/events`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        app_id: 'responseos-app',
        tenant_id: tenantId,
        event: {
          type: 'sms.received',
          fromNumber: '+12025550111',
          toNumber: '+12025550199',
          body: 'Kitchen',
          source: 'smoke-test',
        },
      }),
    });

    await requestJson(`${baseUrl}/v1/revenue/events`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        app_id: 'responseos-app',
        tenant_id: tenantId,
        event: {
          type: 'sms.received',
          fromNumber: '+12025550111',
          toNumber: '+12025550199',
          body: 'Jordan',
          source: 'smoke-test',
        },
      }),
    });

    await wait(50);

    const followupSweep = await requestJson(`${baseUrl}/v1/runtime/followups/run`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        app_id: 'responseos-app',
        tenant_id: tenantId,
      }),
    });
    assert(
      Number(followupSweep.result?.readyCount || 0) >= 1,
      'Manual follow-up run did not process any due follow-ups.'
    );

    const updatedWorkspace = await requestJson(
      `${baseUrl}/v1/revenue/workspace?app_id=responseos-app&tenant_id=${encodeURIComponent(tenantId)}`,
      { headers }
    );
    assert(
      Number(updatedWorkspace.workspace?.metrics?.missedCallsRecovered || 0) >= 1,
      'Missed-call event did not increment recovered calls.'
    );
    assert(
      Array.isArray(updatedWorkspace.workspace?.activity) &&
        updatedWorkspace.workspace.activity.length > 0,
      'Missed-call event did not create activity.'
    );
    assert(
      updatedWorkspace.workspace?.leads?.[0]?.serviceCategory === 'leak',
      'Starter plumbing intake did not classify the leak correctly.'
    );
    assert(
      updatedWorkspace.workspace?.leads?.[0]?.urgencyLabel === 'emergency',
      'Starter plumbing intake did not classify urgency correctly.'
    );
    assert(
      Array.isArray(updatedWorkspace.workspace?.profile?.mainBusinessNumbers) &&
        updatedWorkspace.workspace.profile.mainBusinessNumbers.length === 2,
      'Workspace did not retain multiple client-facing business numbers.'
    );
    assert(
      Array.isArray(updatedWorkspace.workspace?.followups) &&
        updatedWorkspace.workspace.followups.length >= 2,
      'Follow-up scheduling did not create the expected queue.'
    );
    assert(
      Number(updatedWorkspace.workspace?.summary?.dueFollowups || 0) >= 1,
      'Due follow-up count did not update after the manual run.'
    );
    assert(
      Number(updatedWorkspace.workspace?.summary?.openTaskCount || 0) >= 1,
      'Due follow-up processing did not create a human task.'
    );

    await requestJson(`${baseUrl}/v1/revenue/events`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        app_id: 'responseos-app',
        tenant_id: tenantId,
        event: {
          type: 'sms.received',
          fromNumber: '+12025550111',
          toNumber: '+12025550199',
          body: 'HELP',
          source: 'smoke-test',
        },
      }),
    });

    await requestJson(`${baseUrl}/v1/revenue/events`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        app_id: 'responseos-app',
        tenant_id: tenantId,
        event: {
          type: 'sms.received',
          fromNumber: '+12025550111',
          toNumber: '+12025550199',
          body: 'STOP',
          source: 'smoke-test',
        },
      }),
    });

    const optedOutWorkspace = await requestJson(
      `${baseUrl}/v1/revenue/workspace?app_id=responseos-app&tenant_id=${encodeURIComponent(tenantId)}`,
      { headers }
    );
    const optedOutLead = (optedOutWorkspace.workspace?.leads || []).find(
      (lead) => lead.phone === '+12025550111'
    );
    assert(
      optedOutLead?.messaging?.consentStatus === 'opted_out',
      'STOP did not mark the lead as opted out.'
    );

    await requestJson(`${baseUrl}/v1/revenue/events`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        app_id: 'responseos-app',
        tenant_id: tenantId,
        event: {
          type: 'call.missed',
          fromNumber: '+12025550111',
          toNumber: '+12025550199',
          source: 'smoke-test',
        },
      }),
    });

    await requestJson(`${baseUrl}/v1/revenue/events`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        app_id: 'responseos-app',
        tenant_id: tenantId,
        event: {
          type: 'sms.received',
          fromNumber: '+12025550111',
          toNumber: '+12025550199',
          body: 'START',
          source: 'smoke-test',
        },
      }),
    });

    const smsStatusCallback = await fetch(
      `${baseUrl}/v1/revenue/webhooks/twilio?app_id=responseos-app&api_key=preview-key`,
      {
        method: 'POST',
        headers: {
          'content-type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          MessageSid: `SM_${Date.now()}`,
          MessageStatus: 'failed',
          From: '+12025550199',
          To: '+12025550111',
          ErrorCode: '30007',
        }),
      }
    );
    assert(smsStatusCallback.ok, 'Twilio SMS status callback simulation failed.');

    const resumedWorkspace = await requestJson(
      `${baseUrl}/v1/revenue/workspace?app_id=responseos-app&tenant_id=${encodeURIComponent(tenantId)}`,
      { headers }
    );
    const resumedLead = (resumedWorkspace.workspace?.leads || []).find(
      (lead) => lead.phone === '+12025550111'
    );
    assert(
      resumedLead?.messaging?.consentStatus === 'active',
      'START did not restore SMS consent.'
    );
    assert(
      resumedLead?.messaging?.lastOutboundStatus === 'failed',
      'Twilio status callback did not update the lead delivery status.'
    );
    assert(
      (resumedWorkspace.workspace?.activity || []).some((item) => item.title === 'HELP received'),
      'HELP command activity was not recorded.'
    );
    assert(
      (resumedWorkspace.workspace?.activity || []).some((item) => item.title === 'STOP received'),
      'STOP command activity was not recorded.'
    );
    assert(
      (resumedWorkspace.workspace?.activity || []).some((item) => item.title === 'Missed-call SMS suppressed'),
      'Opt-out suppression activity was not recorded.'
    );
    assert(
      (resumedWorkspace.workspace?.activity || []).some((item) => item.title === 'START received'),
      'START command activity was not recorded.'
    );
    assert(
      (resumedWorkspace.workspace?.activity || []).some((item) => item.title === 'SMS failed'),
      'SMS status callback activity was not recorded.'
    );

    const packet = await requestJson(
      `${baseUrl}/v1/revenue/onboarding-packet?app_id=responseos-app&tenant_id=${encodeURIComponent(tenantId)}`,
      { headers }
    );
    assert(packet.packet?.tenantId === tenantId, 'Onboarding packet used the wrong tenant id.');

    console.log(
      JSON.stringify(
        {
          ok: true,
          provider: provider.provider.effective,
          assistSummary: assist.result.summary,
          recoveredCalls: updatedWorkspace.workspace.metrics.missedCallsRecovered,
        },
        null,
        2
      )
    );
  } finally {
    gateway.kill('SIGTERM');
    await wait(300);
    if (!gateway.killed) {
      gateway.kill('SIGKILL');
    }

    if (gateway.exitCode && gateway.exitCode !== 0) {
      throw new Error(`Gateway exited with code ${gateway.exitCode}.\n${stdout}\n${stderr}`.trim());
    }

    await rm(tempDataDir, { recursive: true, force: true });
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});

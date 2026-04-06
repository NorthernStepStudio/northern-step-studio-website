import type {
  ConnectionState,
  GatewayRuntimeStatus,
  MissedCallReplyOptionMap,
  ProfileDraft,
  RevenueProfileTemplates,
  RevenueWorkspace,
  StatusTone,
  WebsiteDiscoveryResult,
} from './types';
import { DEFAULT_MISSED_CALL_REPLY_OPTIONS, DEFAULT_PROFILE_DRAFT } from './types';

export function splitCsv(value: string) {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

export function splitPhoneList(value: string) {
  return value
    .split(/[\r\n,]+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export function buildBusinessPhoneNumbers(primaryNumber: string, additionalNumbersText = '') {
  return [...new Set([primaryNumber.trim(), ...splitPhoneList(additionalNumbersText)].filter(Boolean))];
}

export function buildAdditionalBusinessNumbersText(
  numbers: string[] | undefined,
  primaryNumber = ''
) {
  return (numbers || [])
    .filter((item) => item.trim() && item.trim() !== primaryNumber.trim())
    .join('\n');
}

export function formatDate(value?: string) {
  if (!value) return 'No timestamp';
  const parsed = Date.parse(value);
  if (!Number.isFinite(parsed)) return value;
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(parsed));
}

export function baseUrl(value: string) {
  return value.trim().replace(/\/+$/, '');
}

function isPrivateOrLocalHost(host: string) {
  return (
    host === 'localhost' ||
    host === '127.0.0.1' ||
    host === '::1' ||
    /^10\./.test(host) ||
    /^192\.168\./.test(host) ||
    /^172\.(1[6-9]|2\d|3[0-1])\./.test(host)
  );
}

function resolveWebhookBaseUrl(connection: ConnectionState, publicBaseUrl?: string) {
  const preferred = publicBaseUrl?.trim() ? publicBaseUrl : connection.gatewayUrl;
  return baseUrl(preferred || '');
}

export function slugFromBusinessName(value: string) {
  return String(value ?? '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function profileDraftFromWorkspace(workspace: RevenueWorkspace): ProfileDraft {
  const replyOptions = resolveMissedCallReplyOptions(workspace.profile.templates?.replyOptions);
  return {
    businessName: workspace.profile.businessName || '',
    mainBusinessNumber: workspace.profile.mainBusinessNumber || '',
    additionalBusinessNumbers: buildAdditionalBusinessNumbersText(
      workspace.profile.mainBusinessNumbers,
      workspace.profile.mainBusinessNumber || ''
    ),
    callbackNumber: workspace.profile.callbackNumber || '',
    timezone: workspace.profile.timezone || 'America/New_York',
    services: workspace.profile.services.join(', '),
    serviceArea: workspace.profile.serviceArea || '',
    websiteUrl: workspace.settings.websiteUrl || '',
    ownerAlertDestination: workspace.settings.ownerAlertDestination || '',
    contactEmail: workspace.settings.contactEmail || '',
    bookingLink: workspace.settings.bookingLink || '',
    reviewUrl: workspace.settings.reviewUrl || '',
    missedCallReply:
      workspace.profile.templates?.missedCallReply ||
      buildDefaultMissedCallReply(workspace.profile.businessName || '', replyOptions),
    replyOptions,
    automationTier: workspace.settings.automation.tier,
    automationMode: workspace.settings.automation.mode,
    automationVertical: workspace.settings.automation.vertical,
    maxRequestsPerDay: workspace.settings.automation.maxRequestsPerDay,
    fallbackOnFailure: workspace.settings.automation.fallbackOnFailure,
  };
}

function cloneReplyOption(option: MissedCallReplyOptionMap[keyof MissedCallReplyOptionMap]) {
  return {
    ...option,
  };
}

export function resolveMissedCallReplyOptions(
  replyOptions?: RevenueProfileTemplates['replyOptions']
): MissedCallReplyOptionMap {
  return {
    '1': {
      ...cloneReplyOption(DEFAULT_MISSED_CALL_REPLY_OPTIONS['1']),
      title: replyOptions?.['1']?.title?.trim() || DEFAULT_MISSED_CALL_REPLY_OPTIONS['1'].title,
      reply: replyOptions?.['1']?.reply?.trim() || DEFAULT_MISSED_CALL_REPLY_OPTIONS['1'].reply,
    },
    '2': {
      ...cloneReplyOption(DEFAULT_MISSED_CALL_REPLY_OPTIONS['2']),
      title: replyOptions?.['2']?.title?.trim() || DEFAULT_MISSED_CALL_REPLY_OPTIONS['2'].title,
      reply: replyOptions?.['2']?.reply?.trim() || DEFAULT_MISSED_CALL_REPLY_OPTIONS['2'].reply,
    },
    '3': {
      ...cloneReplyOption(DEFAULT_MISSED_CALL_REPLY_OPTIONS['3']),
      title: replyOptions?.['3']?.title?.trim() || DEFAULT_MISSED_CALL_REPLY_OPTIONS['3'].title,
      reply: replyOptions?.['3']?.reply?.trim() || DEFAULT_MISSED_CALL_REPLY_OPTIONS['3'].reply,
    },
    '4': {
      ...cloneReplyOption(DEFAULT_MISSED_CALL_REPLY_OPTIONS['4']),
      title: replyOptions?.['4']?.title?.trim() || DEFAULT_MISSED_CALL_REPLY_OPTIONS['4'].title,
      reply: replyOptions?.['4']?.reply?.trim() || DEFAULT_MISSED_CALL_REPLY_OPTIONS['4'].reply,
    },
  };
}

export function buildDefaultMissedCallReply(
  businessName: string,
  replyOptions: MissedCallReplyOptionMap = DEFAULT_MISSED_CALL_REPLY_OPTIONS
) {
  const name = businessName.trim();
  if (!name) {
    return "Hey, sorry we missed your call. What's going on - leak, clog, water heater, or something else?";
  }
  return `Hey, this is ${name}. Sorry we missed your call. What's going on - leak, clog, water heater, or something else?`;
}

export function buildTwilioWebhookUrl(connection: ConnectionState, publicBaseUrl?: string) {
  if (!connection.gatewayUrl.trim() || !connection.appId.trim() || !connection.apiKey.trim()) {
    return '';
  }

  try {
    const url = new URL('/v1/revenue/webhooks/twilio', `${resolveWebhookBaseUrl(connection, publicBaseUrl)}/`);
    url.searchParams.set('app_id', connection.appId.trim());
    url.searchParams.set('api_key', connection.apiKey.trim());
    return url.toString();
  } catch {
    return '';
  }
}

export function describeGatewayExposure(gatewayUrl: string, publicBaseUrl?: string): {
  tone: StatusTone;
  label: string;
  detail: string;
} {
  try {
    const usingConfiguredPublicBase = Boolean(publicBaseUrl?.trim());
    const url = new URL(resolveWebhookBaseUrl({ gatewayUrl, apiKey: '', appId: '', tenantId: '' }, publicBaseUrl));
    const host = url.hostname.toLowerCase();
    const isLocal = isPrivateOrLocalHost(host);

    if (isLocal) {
      return {
        tone: 'warning',
        label: usingConfiguredPublicBase ? 'Configured base is still local' : 'Local only',
        detail: usingConfiguredPublicBase
          ? 'The configured public base URL is still local/private. Set service.public_base_url to the real public hostname before wiring Twilio.'
          : 'Twilio will still need a public hostname, tunnel, or reverse proxy before live callbacks can reach this add-on.',
      };
    }

    return {
      tone: 'success',
      label: usingConfiguredPublicBase ? 'Using public base URL' : 'Public-looking',
      detail: usingConfiguredPublicBase
        ? `Twilio webhooks will use ${baseUrl(publicBaseUrl || '')}.`
        : 'This looks externally reachable enough to wire into Twilio.',
    };
  } catch {
    return {
      tone: 'error',
      label: 'Invalid URL',
      detail: 'Enter a valid gateway URL before generating the live webhook endpoint.',
    };
  }
}

function toneFromRuntimeMode(mode?: GatewayRuntimeStatus['deployment']['mode']): StatusTone {
  switch (mode) {
    case 'hosted':
      return 'success';
    case 'public_to_local':
      return 'neutral';
    case 'local_only':
    case 'network_private':
      return 'warning';
    default:
      return 'neutral';
  }
}

export function describeGatewayRuntime(
  connection: ConnectionState,
  publicBaseUrl?: string,
  runtimeStatus?: GatewayRuntimeStatus
): {
  tone: StatusTone;
  label: string;
  detail: string;
} {
  if (runtimeStatus) {
    return {
      tone: toneFromRuntimeMode(runtimeStatus.deployment.mode),
      label: runtimeStatus.deployment.label,
      detail: runtimeStatus.deployment.detail,
    };
  }

  try {
    const gatewayHost = new URL(`${baseUrl(connection.gatewayUrl)}/`).hostname.toLowerCase();
    const publicHost = publicBaseUrl?.trim()
      ? new URL(`${baseUrl(publicBaseUrl)}/`).hostname.toLowerCase()
      : '';
    const localGateway = isPrivateOrLocalHost(gatewayHost);
    const localPublicHost = publicHost ? isPrivateOrLocalHost(publicHost) : false;

    if (localGateway && !publicBaseUrl?.trim()) {
      return {
        tone: 'warning',
        label: 'Local machine only',
        detail:
          'If this PC is off, the gateway is off. Missed-call text-back and live Twilio callbacks stop until the machine is running again.',
      };
    }

    if (localGateway && publicBaseUrl?.trim()) {
      return {
        tone: localPublicHost ? 'warning' : 'neutral',
        label: 'Public URL to this machine',
        detail:
          'Twilio can use the public URL, but uptime still depends on this machine or tunnel staying on. Turning the PC off still stops the automation.',
      };
    }

    return {
      tone: 'success',
      label: 'Looks hosted',
      detail:
        'This gateway does not look local. The automation should keep running as long as that server or always-on office machine stays online.',
    };
  } catch {
    return {
      tone: 'neutral',
      label: 'Runtime unknown',
      detail: 'Open the business with a valid gateway URL to confirm whether this is only a local install or an always-on runtime.',
    };
  }
}

export function buildGatewayCandidates(currentValue: string) {
  const candidates = [
    currentValue,
    'http://127.0.0.1:8787',
    'http://localhost:8787',
    'http://127.0.0.1:8788',
    'http://localhost:8788',
  ];

  try {
    const currentUrl = new URL(window.location.href);
    const currentPort = Number(currentUrl.port);
    if (Number.isFinite(currentPort) && currentPort > 0) {
      for (const port of [currentPort - 2, currentPort - 1, currentPort, currentPort + 1]) {
        if (port > 0) {
          candidates.push(`${currentUrl.protocol}//${currentUrl.hostname}:${port}`);
        }
      }
    }
  } catch {
    // ignore browser url parsing failures
  }

  return [...new Set(candidates.map((item) => baseUrl(item || '')).filter(Boolean))];
}

export async function detectGatewayCandidate(currentValue: string) {
  const candidates = buildGatewayCandidates(currentValue);
  for (const candidate of candidates) {
    try {
      const healthResponse = await fetch(`${candidate}/health`);
      if (!healthResponse.ok) continue;
      const healthJson = (await healthResponse.json()) as { ok?: boolean; service?: string };
      if (!healthJson.ok) continue;
      return {
        candidate,
        service: healthJson.service || 'responseos-gateway',
      };
    } catch {
      // try next candidate
    }
  }
  return null;
}

export function isStarterConnection(connection: ConnectionState) {
  return (
    !connection.gatewayUrl.trim() ||
    !connection.apiKey.trim() ||
    !connection.appId.trim() ||
    !connection.tenantId.trim()
  );
}

export function mergeDiscoveryIntoProfile(
  current: ProfileDraft,
  result: WebsiteDiscoveryResult
): ProfileDraft {
  const servicesFound = Array.isArray(result.profile.services) ? result.profile.services : [];
  const shouldReplaceServices =
    splitCsv(current.services).length === 0 ||
    splitCsv(current.services).join(', ') === splitCsv(DEFAULT_PROFILE_DRAFT.services).join(', ');

  return {
    ...current,
    businessName: current.businessName.trim() || result.profile.businessName || '',
    mainBusinessNumber: current.mainBusinessNumber.trim() || result.profile.mainBusinessNumber || '',
    additionalBusinessNumbers: current.additionalBusinessNumbers,
    callbackNumber: current.callbackNumber,
    services: shouldReplaceServices && servicesFound.length > 0 ? servicesFound.join(', ') : current.services,
    serviceArea: current.serviceArea.trim() || result.profile.serviceArea || '',
    websiteUrl: result.settings.websiteUrl || result.websiteUrl || current.websiteUrl,
    ownerAlertDestination: current.ownerAlertDestination,
    contactEmail: current.contactEmail.trim() || result.settings.contactEmail || '',
    bookingLink: current.bookingLink.trim() || result.settings.bookingLink || '',
    reviewUrl: current.reviewUrl.trim() || result.settings.reviewUrl || '',
    missedCallReply: current.missedCallReply,
    replyOptions: current.replyOptions,
  };
}

export function buildDiscoveryMessage(result: WebsiteDiscoveryResult) {
  return `Found ${result.summary.foundCount} public setup detail${
    result.summary.foundCount === 1 ? '' : 's'
  } from the website.`;
}

export type StatusTone = 'neutral' | 'success' | 'warning' | 'error';

export type ConnectionState = {
  gatewayUrl: string;
  apiKey: string;
  appId: string;
  tenantId: string;
};

export type AiProviderMode = 'off' | 'mock' | 'gemini';

export type AutomationTier = 'starter' | 'pro' | 'elite';

export type AutomationMode = 'local' | 'cloud' | 'hybrid';

export type AutomationVertical = 'plumbing';

export type AutomationSettings = {
  tier: AutomationTier;
  mode: AutomationMode;
  vertical: AutomationVertical;
  maxRequestsPerDay: number;
  requestsUsedToday: number;
  requestsUsedOn?: string;
  fallbackOnFailure: boolean;
  implementationStatus: 'starter_ready' | 'upgrade_path';
};

export type AiProviderStatus = {
  selected: AiProviderMode;
  effective: AiProviderMode;
  label: string;
  detail: string;
};

export type GatewayRuntimeStatus = {
  service: string;
  bind: {
    host: string;
    port: number;
  };
  publicBaseUrl?: string | null;
  deployment: {
    mode: 'local_only' | 'public_to_local' | 'hosted' | 'network_private';
    label: string;
    detail: string;
    requiresMachineToStayOn: boolean;
    twilioReady: boolean;
  };
  storage: {
    provider: string;
    dataDir: string;
  };
  security: {
    credentialsAtRest: 'encrypted' | 'plaintext';
    credentialKeyConfigured: boolean;
    detail: string;
  };
  automation: {
    followupRunnerEnabled: boolean;
    followupRunnerRunning: boolean;
    followupRunnerBusy: boolean;
    followupRunnerIntervalMs: number;
    followupRunnerLimitPerTenant: number;
  };
  identity: {
    clientId: string;
    appId: string;
    policyProfile: string;
    defaultProvider: string;
    configuredClients: number;
    configuredApps: number;
  };
};

export type ConnectionCheck = {
  status: 'idle' | 'connected' | 'error';
  message: string;
  checkedAt?: string;
  publicBaseUrl?: string;
  runtime?: GatewayRuntimeStatus;
};

export type RequestState = {
  busy: boolean;
  message: string;
  tone: StatusTone;
};

export type BusinessHoursSlot = {
  open: string;
  close: string;
};

export type BusinessHoursSchedule = Partial<
  Record<
    'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday',
    BusinessHoursSlot | null
  >
>;

export type EmergencyPolicy = {
  enabled: boolean;
  emergencyKeywords: string[];
  emergencyRoute?: string;
};

export type MissedCallOptionKey = '1' | '2' | '3' | '4';

export type MissedCallReplyOption = {
  key: MissedCallOptionKey;
  title: string;
  reply: string;
};

export type MissedCallReplyOptionMap = Record<MissedCallOptionKey, MissedCallReplyOption>;

export type AiSetupAssistResult = {
  provider: AiProviderStatus;
  summary: string;
  assistantResponse: string;
  missedCallReply: string;
  replyOptions: MissedCallReplyOptionMap;
  implementationNotes: string[];
};

export type RevenueProfileTemplates = {
  missedCallReply?: string;
  replyOptions?: Partial<
    Record<
      MissedCallOptionKey,
      {
        title?: string;
        reply?: string;
      }
    >
  >;
};

export type RevenueProfile = {
  businessId?: string;
  businessName: string;
  mainBusinessNumber?: string;
  mainBusinessNumbers?: string[];
  timezone: string;
  services: string[];
  serviceArea?: string;
  callbackNumber?: string;
  hours?: BusinessHoursSchedule;
  emergencyPolicy?: EmergencyPolicy;
  templates?: RevenueProfileTemplates;
};

export type RevenueSettings = {
  websiteUrl?: string;
  bookingLink?: string;
  reviewUrl?: string;
  ownerAlertDestination?: string;
  contactEmail?: string;
  automation: AutomationSettings;
  sms: {
    provider: string;
    connectorId?: string;
    path?: string;
  };
  email: {
    provider: string;
    connectorId?: string;
    path?: string;
    fromEmail?: string;
    fromName?: string;
  };
  calendar: {
    provider: string;
    connectorId?: string;
    path?: string;
    calendarId?: string;
  };
};

export type RevenueMetrics = {
  missedCallsRecovered: number;
  inboundAutoReplies: number;
  leadIntakes: number;
  actionSuccess: number;
  actionFailures: number;
  lastUpdatedAt?: string;
};

export type RevenueLead = {
  leadId: string;
  phone: string;
  name?: string;
  email?: string;
  serviceCategory?: string;
  stage: string;
  urgencyScore: number;
  urgencyLabel?: 'normal' | 'priority' | 'emergency';
  address?: string;
  notes?: string;
  lastInboundMessage?: string;
  messaging?: {
    consentStatus: 'unknown' | 'active' | 'opted_out';
    consentSource?: string;
    consentUpdatedAt?: string;
    optedOutAt?: string;
    lastHelpSentAt?: string;
    lastKeyword?: string;
    lastOutboundStatus?: string;
    lastOutboundStatusAt?: string;
    lastOutboundMessageSid?: string;
    lastOutboundError?: string;
  };
  intake?: {
    status: 'idle' | 'in_progress' | 'completed';
    playbook: 'starter_plumbing';
    currentQuestionKey?:
      | 'issue_type'
      | 'other_detail'
      | 'severity_detail'
      | 'urgency'
      | 'location'
      | 'customer_name';
    answers?: {
      issueType?: string;
      issueDescription?: string;
      otherDetail?: string;
      severityDetail?: string;
      urgentDamage?: string;
      location?: string;
      customerName?: string;
    };
    startedAt?: string;
    completedAt?: string;
    ownerSummarySentAt?: string;
  };
  updatedAt: string;
  createdAt: string;
};

export type RevenueTask = {
  taskId: string;
  taskType: string;
  title: string;
  detail: string;
  status: string;
  severity: string;
  createdAt: string;
  updatedAt: string;
};

export type RevenueActivity = {
  activityId: string;
  kind: string;
  status: string;
  title: string;
  summary: string;
  timestamp: string;
};

export type RevenueFollowup = {
  followupId: string;
  followupType: string;
  taskType: string;
  title: string;
  detail: string;
  leadPhone: string;
  severity: string;
  status: string;
  scheduledFor: string;
  ownerAlertSentAt?: string;
  createdAt: string;
  updatedAt: string;
};

export type RevenueChecklistItem = {
  itemId: string;
  title: string;
  status: string;
  severity: string;
  detail: string;
};

export type RevenueWorkspace = {
  tenantId: string;
  profile: RevenueProfile;
  settings: RevenueSettings;
  metrics: RevenueMetrics;
  leads: RevenueLead[];
  followups: RevenueFollowup[];
  activity: RevenueActivity[];
  tasks: RevenueTask[];
  onboarding: {
    mode: 'protected' | 'live';
    checklist: RevenueChecklistItem[];
    channels: {
      sms: {
        status: string;
        provider: string;
        connectorId?: string;
        live: boolean;
        detail: string;
      };
      email: {
        status: string;
        provider: string;
        connectorId?: string;
        live: boolean;
        detail: string;
      };
      calendar: {
        status: string;
        provider: string;
        connectorId?: string;
        live: boolean;
        detail: string;
      };
    };
    summary: {
      requiredComplete: number;
      requiredTotal: number;
      blockerCount: number;
      missingCount: number;
    };
  };
  summary: {
    leadCount: number;
    pendingFollowups: number;
    dueFollowups: number;
    lastActivityAt?: string;
    openTaskCount: number;
    mode: 'protected' | 'live';
  };
};

export type SavedBusinessSummary = {
  tenantId: string;
  businessName: string;
  callbackNumber?: string;
  mainBusinessNumbers: string[];
  updatedAt: string;
  lastActivityAt?: string;
  mode: 'protected' | 'live';
  smsLive: boolean;
  recoveredCalls: number;
  openTaskCount: number;
  leadCount: number;
};

export type OnboardingPacket = {
  packetVersion: number;
  generatedAt: string;
  tenantId: string;
  mode: 'protected' | 'live';
  profile: RevenueProfile;
  settings: RevenueSettings;
  onboarding: RevenueWorkspace['onboarding'];
  tasks: RevenueTask[];
};

export type ProfileDraft = {
  businessName: string;
  mainBusinessNumber: string;
  additionalBusinessNumbers: string;
  callbackNumber: string;
  timezone: string;
  services: string;
  serviceArea: string;
  websiteUrl: string;
  ownerAlertDestination: string;
  contactEmail: string;
  bookingLink: string;
  reviewUrl: string;
  missedCallReply: string;
  replyOptions: MissedCallReplyOptionMap;
  automationTier: AutomationTier;
  automationMode: AutomationMode;
  automationVertical: AutomationVertical;
  maxRequestsPerDay: number;
  fallbackOnFailure: boolean;
};

export type TwilioDraft = {
  connectorId: string;
  accountSid: string;
  authToken: string;
  baseUrl: string;
};

export type ClientLaunchDraft = {
  businessName: string;
  tenantId: string;
  primaryNumber: string;
  additionalNumbers: string;
  sourceTenantId: string;
};

export type ValidationState = {
  status: 'idle' | 'validating' | 'success' | 'error';
  message: string;
  checkedAt?: string;
};

export type WebsiteDiscoveryResult = {
  websiteUrl: string;
  scannedPages: Array<{
    url: string;
    title?: string;
    kind: string;
  }>;
  profile: Partial<RevenueProfile>;
  settings: Pick<RevenueSettings, 'websiteUrl' | 'contactEmail' | 'bookingLink' | 'reviewUrl'>;
  summary: {
    foundCount: number;
    scannedCount: number;
    servicesFound: string[];
    hoursSummary?: string;
    notes: string[];
  };
};

export type DemoLeadSummary = {
  type: 'lead_summary';
  name: string;
  issue: string;
  severity: 'High' | 'Medium' | 'Low';
  urgency: 'Same-day recommended' | 'Normal scheduling';
  location: string;
  notes: string;
  recommended_action: 'Call immediately' | 'Call soon' | 'Standard callback';
};

export type DemoLeadQuestionKey =
  | 'issue_type'
  | 'other_detail'
  | 'severity_detail'
  | 'urgency'
  | 'location'
  | 'customer_name'
  | 'done';

export type DemoLeadResponse = {
  session_id: string;
  reply: string;
  done: boolean;
  question_key?: DemoLeadQuestionKey;
  summary?: DemoLeadSummary;
};

export const CONNECTION_STORAGE_KEY = 'nss-missedcall-addon-connection';

export const DEFAULT_CONNECTION: ConnectionState = {
  gatewayUrl: 'http://127.0.0.1:8787',
  apiKey: 'preview-key',
  appId: 'responseos-app',
  tenantId: 'demo-plumbing-live-preview',
};

export const MISSED_CALL_OPTION_KEYS: MissedCallOptionKey[] = ['1', '2', '3', '4'];

export const DEFAULT_AUTOMATION_SETTINGS: AutomationSettings = {
  tier: 'starter',
  mode: 'hybrid',
  vertical: 'plumbing',
  maxRequestsPerDay: 75,
  requestsUsedToday: 0,
  requestsUsedOn: undefined,
  fallbackOnFailure: true,
  implementationStatus: 'starter_ready',
};

export const DEFAULT_MISSED_CALL_REPLY_OPTIONS: MissedCallReplyOptionMap = {
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

export const DEFAULT_PROFILE_DRAFT: ProfileDraft = {
  businessName: '',
  mainBusinessNumber: '',
  additionalBusinessNumbers: '',
  callbackNumber: '',
  timezone: 'America/New_York',
  services: 'Leak repair, drain clearing, clog removal, water heater help',
  serviceArea: '',
  websiteUrl: '',
  ownerAlertDestination: '',
  contactEmail: '',
  bookingLink: '',
  reviewUrl: '',
  missedCallReply:
    "Hey, sorry we missed your call. What's going on - leak, clog, water heater, or something else?",
  replyOptions: DEFAULT_MISSED_CALL_REPLY_OPTIONS,
  automationTier: DEFAULT_AUTOMATION_SETTINGS.tier,
  automationMode: DEFAULT_AUTOMATION_SETTINGS.mode,
  automationVertical: DEFAULT_AUTOMATION_SETTINGS.vertical,
  maxRequestsPerDay: DEFAULT_AUTOMATION_SETTINGS.maxRequestsPerDay,
  fallbackOnFailure: DEFAULT_AUTOMATION_SETTINGS.fallbackOnFailure,
};

export const DEFAULT_TWILIO_DRAFT: TwilioDraft = {
  connectorId: '',
  accountSid: '',
  authToken: '',
  baseUrl: '',
};

export const DEFAULT_CLIENT_LAUNCH_DRAFT: ClientLaunchDraft = {
  businessName: '',
  tenantId: '',
  primaryNumber: '',
  additionalNumbers: '',
  sourceTenantId: '',
};

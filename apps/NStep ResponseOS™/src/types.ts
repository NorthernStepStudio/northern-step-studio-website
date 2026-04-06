export type RevenueMetrics = {
  eventsProcessed: number;
  leadIntakes: number;
  missedCallsRecovered: number;
  inboundAutoReplies: number;
  appointmentsBooked: number;
  reviewsTriggered: number;
  hotLeads: number;
  spamCaptured: number;
  actionSuccess: number;
  actionFailures: number;
  lastUpdatedAt?: string;
};

export type RevenueLead = {
  leadId: string;
  tenantId?: string;
  phone: string;
  name?: string;
  email?: string;
  address?: string;
  serviceCategory?: string;
  urgencyScore: number;
  stage: string;
  tags: string[];
  updatedAt: string;
  createdAt: string;
};

export type RevenueFollowup = {
  followupId: string;
  tenantId: string;
  status: string;
  strategy: string;
  scheduledFor: string;
  to?: string;
  from?: string;
  body?: string;
  reason?: string;
  source: string;
};

export type RevenueActivity = {
  activityId: string;
  tenantId: string;
  kind: string;
  status: string;
  title: string;
  summary: string;
  detail?: unknown;
  timestamp: string;
};

export type RevenueDeliveryAttempt = {
  attempt: number;
  timestamp: string;
  status: string;
  statusCode?: number;
  retryable?: boolean;
  message: string;
};

export type RevenueDelivery = {
  deliveryId: string;
  tenantId: string;
  channel: string;
  provider: string;
  status: string;
  mode: string;
  source?: string;
  title: string;
  summary: string;
  destination?: string;
  connectorId?: string;
  externalId?: string;
  attemptCount: number;
  attempts: RevenueDeliveryAttempt[];
  request?: unknown;
  error?: {
    code?: string;
    message?: string;
    retryable?: boolean;
    statusCode?: number;
  };
  lastAttemptAt?: string;
  createdAt: string;
  updatedAt: string;
};

export type RevenueTask = {
  taskId: string;
  tenantId: string;
  taskType: string;
  status: string;
  severity: string;
  title: string;
  detail: string;
  source?: string;
  relatedLeadId?: string;
  relatedEventId?: string;
  note?: string;
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

export type BusinessHoursSlot = {
  open: string;
  close: string;
};

export type BusinessHoursSchedule = Partial<
  Record<
    'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday',
    BusinessHoursSlot
  >
>;

export type RevenueProfile = {
  businessId?: string;
  businessName: string;
  timezone: string;
  services: string[];
  serviceArea?: string;
  callbackNumber?: string;
  hours?: BusinessHoursSchedule;
};

export type RevenueSettings = {
  websiteUrl?: string;
  bookingLink?: string;
  reviewUrl?: string;
  ownerAlertDestination?: string;
  contactEmail?: string;
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

export type RevenueWorkspace = {
  tenantId: string;
  profile: RevenueProfile;
  settings: RevenueSettings;
  metrics: RevenueMetrics;
  leads: RevenueLead[];
  followups: RevenueFollowup[];
  activity: RevenueActivity[];
  deliveries: RevenueDelivery[];
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

export type ConnectionState = {
  gatewayUrl: string;
  apiKey: string;
  appId: string;
  tenantId: string;
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
  checkedAt?: string;
  gatewayMessage?: string;
  provider?: string;
  privacyMode?: boolean;
  allowExternalProviders?: boolean;
  followupRunnerEnabled?: boolean;
  followupRunnerIntervalMs?: number;
  followupRunnerLimitPerTenant?: number;
  publicBaseUrl?: string;
  runtime?: GatewayRuntimeStatus;
};

export type SavedClientProfile = {
  id: string;
  label: string;
  gatewayUrl: string;
  apiKey: string;
  appId: string;
  tenantId: string;
  lastUsedAt: string;
};

export type GatewayConnector = {
  connector_id: string;
  name?: string;
  base_url: string;
  auth: {
    type: string;
    token?: string;
    api_key?: string;
    header_name?: string;
    username?: string;
    password?: string;
  };
  default_headers: Record<string, string>;
  created_at?: string;
  updated_at?: string;
};

export type ProfileDraft = {
  businessName: string;
  callbackNumber: string;
  timezone: string;
  services: string;
  serviceArea: string;
  websiteUrl: string;
  bookingLink: string;
  reviewUrl: string;
  ownerAlertDestination: string;
  contactEmail: string;
  smsProvider: string;
  smsConnectorId: string;
  smsPath: string;
  emailProvider: string;
  emailConnectorId: string;
  emailPath: string;
  emailFromEmail: string;
  emailFromName: string;
  calendarProvider: string;
  calendarConnectorId: string;
  calendarPath: string;
  calendarId: string;
};

export type ConnectorBootstrapDraft = {
  twilioConnectorId: string;
  twilioAccountSid: string;
  twilioAuthToken: string;
  twilioBaseUrl: string;
  resendConnectorId: string;
  resendApiKey: string;
  resendBaseUrl: string;
  resendFromEmail: string;
  resendFromName: string;
  calendarConnectorId: string;
  calendarBaseUrl: string;
  calendarPath: string;
  calendarId: string;
  calendarAuthType: 'none' | 'bearer' | 'api_key' | 'basic';
  calendarBearerToken: string;
  calendarApiKeyHeader: string;
  calendarApiKeyValue: string;
  calendarBasicUsername: string;
  calendarBasicPassword: string;
};

export type LeadDraft = {
  name: string;
  phone: string;
  email: string;
  serviceRequested: string;
  location: string;
  source: string;
};

export type EventDraft = {
  type: 'call.missed' | 'sms.received' | 'job.completed';
  fromNumber: string;
  toNumber: string;
  callSid: string;
  body: string;
  leadId: string;
  leadPhone: string;
  leadStatus: string;
  reviewUrl: string;
};

export type RequestState = {
  busy: boolean;
  message: string;
  tone: 'neutral' | 'success' | 'error';
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

export const CONNECTION_STORAGE_KEY = 'nss-responseos-connection';
export const CONNECTION_PROFILES_STORAGE_KEY = 'nss-responseos-clients';

export const DEFAULT_CONNECTION: ConnectionState = {
  gatewayUrl: '',
  apiKey: '',
  appId: 'responseos-app',
  tenantId: 'default',
};

export const DEFAULT_PROFILE_DRAFT: ProfileDraft = {
  businessName: '',
  callbackNumber: '',
  timezone: 'America/New_York',
  services: 'hvac repair, plumbing, electrical',
  serviceArea: '',
  websiteUrl: '',
  bookingLink: '',
  reviewUrl: '',
  ownerAlertDestination: '',
  contactEmail: '',
  smsProvider: 'simulated',
  smsConnectorId: '',
  smsPath: 'Messages.json',
  emailProvider: 'simulated',
  emailConnectorId: '',
  emailPath: '/emails',
  emailFromEmail: '',
  emailFromName: '',
  calendarProvider: 'simulated',
  calendarConnectorId: '',
  calendarPath: '/events',
  calendarId: 'primary',
};

export const DEFAULT_CONNECTOR_BOOTSTRAP_DRAFT: ConnectorBootstrapDraft = {
  twilioConnectorId: '',
  twilioAccountSid: '',
  twilioAuthToken: '',
  twilioBaseUrl: '',
  resendConnectorId: '',
  resendApiKey: '',
  resendBaseUrl: '',
  resendFromEmail: '',
  resendFromName: '',
  calendarConnectorId: '',
  calendarBaseUrl: '',
  calendarPath: '/events',
  calendarId: 'primary',
  calendarAuthType: 'bearer',
  calendarBearerToken: '',
  calendarApiKeyHeader: 'x-api-key',
  calendarApiKeyValue: '',
  calendarBasicUsername: '',
  calendarBasicPassword: '',
};

export const DEFAULT_LEAD_DRAFT: LeadDraft = {
  name: '',
  phone: '',
  email: '',
  serviceRequested: '',
  location: '',
  source: 'website-form',
};

export const DEFAULT_EVENT_DRAFT: EventDraft = {
  type: 'call.missed',
  fromNumber: '',
  toNumber: '',
  callSid: '',
  body: '',
  leadId: '',
  leadPhone: '',
  leadStatus: 'won',
  reviewUrl: '',
};

export const LEAD_STAGES = ['new', 'contacted', 'scheduled', 'estimate_sent', 'won', 'lost'];
export const SMS_PROVIDER_OPTIONS = ['simulated', 'generic-json', 'twilio'];
export const EMAIL_PROVIDER_OPTIONS = ['simulated', 'generic-json', 'resend'];
export const CALENDAR_PROVIDER_OPTIONS = ['simulated', 'generic-json'];

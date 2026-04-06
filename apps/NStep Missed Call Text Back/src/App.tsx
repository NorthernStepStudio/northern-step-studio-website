import { useEffect, useState, type FormEvent } from 'react';
import {
  ConnectionPanel,
  ProfilePanel,
  TwilioSetupPanel,
  OperatingView,
  LayoutGuide,
  SystemStatus,
  ChecklistCard,
  MetricCard,
  StatusBadge,
  StatusRow,
  TaskCard,
  toneFromConnection,
  toneFromValidation,
} from './components';
import { Dashboard } from './components/Dashboard';
import { OnboardingWizard } from './components/OnboardingWizard';
import { SalesDemoView } from './components/SalesDemoView';
import {
  baseUrl,
  buildBusinessPhoneNumbers,
  buildDefaultMissedCallReply,
  buildDiscoveryMessage,
  buildTwilioWebhookUrl,
  describeGatewayExposure,
  describeGatewayRuntime,
  detectGatewayCandidate,
  formatDate,
  isStarterConnection,
  mergeDiscoveryIntoProfile,
  profileDraftFromWorkspace,
  resolveMissedCallReplyOptions,
  slugFromBusinessName,
  splitCsv,
  splitPhoneList,
} from './helpers';
import {
  type AiProviderStatus,
  type AiSetupAssistResult,
  type ClientLaunchDraft,
  CONNECTION_STORAGE_KEY,
  DEFAULT_CLIENT_LAUNCH_DRAFT,
  DEFAULT_CONNECTION,
  DEFAULT_PROFILE_DRAFT,
  DEFAULT_TWILIO_DRAFT,
  MISSED_CALL_OPTION_KEYS,
  type BusinessHoursSchedule,
  type ConnectionCheck,
  type ConnectionState,
  type GatewayRuntimeStatus,
  type MissedCallOptionKey,
  type MissedCallReplyOption,
  type OnboardingPacket,
  type ProfileDraft,
  type RequestState,
  type RevenueWorkspace,
  type SavedBusinessSummary,
  type StatusTone,
  type TwilioDraft,
  type ValidationState,
  type WebsiteDiscoveryResult,
} from './types';



const DEFAULT_VALIDATION: ValidationState = {
  status: 'idle',
  message: 'Not connected yet.',
};

export default function App() {
  const [connection, setConnection] = useState<ConnectionState>(DEFAULT_CONNECTION);
  const [connectionCheck, setConnectionCheck] = useState<ConnectionCheck>({
    status: 'idle',
    message: 'Enter the hosted gateway details or use the local install helper.',
  });
  const [workspace, setWorkspace] = useState<RevenueWorkspace | null>(null);
  const [savedBusinesses, setSavedBusinesses] = useState<SavedBusinessSummary[]>([]);
  const [profileDraft, setProfileDraft] = useState<ProfileDraft>(() => ({
    ...DEFAULT_PROFILE_DRAFT,
    replyOptions: resolveMissedCallReplyOptions(DEFAULT_PROFILE_DRAFT.replyOptions),
  }));
  const [profileHours, setProfileHours] = useState<BusinessHoursSchedule | undefined>(undefined);
  const [twilioDraft, setTwilioDraft] = useState<TwilioDraft>(DEFAULT_TWILIO_DRAFT);
  const [validation, setValidation] = useState<ValidationState>(DEFAULT_VALIDATION);
  const [discoveryResult, setDiscoveryResult] = useState<WebsiteDiscoveryResult | null>(null);
  const [providerStatus, setProviderStatus] = useState<AiProviderStatus | null>(null);
  const [aiSetupAssist, setAiSetupAssist] = useState<AiSetupAssistResult | null>(null);
  const [aiSetupAssistSourceKey, setAiSetupAssistSourceKey] = useState('');
  const [clientLaunchDraft, setClientLaunchDraft] = useState<ClientLaunchDraft>(
    DEFAULT_CLIENT_LAUNCH_DRAFT
  );
  const [packetText, setPacketText] = useState('');
  const [requestState, setRequestState] = useState<RequestState>({
    busy: false,
    message: 'Plumbing AI Starter is ready to connect to the automation runtime.',
    tone: 'neutral',
  });
  const [showSetupPanels, setShowSetupPanels] = useState(true);
  const [setupPanelPreferenceLocked, setSetupPanelPreferenceLocked] = useState(false);
  const [testCaller, setTestCaller] = useState('+12025550111');
  const [storedConnectionSeen, setStoredConnectionSeen] = useState(false);
  const [startupAttempted, setStartupAttempted] = useState(false);
  const [connectionEditingUnlocked, setConnectionEditingUnlocked] = useState(false);
  const [twilioMaintenanceUnlocked, setTwilioMaintenanceUnlocked] = useState(false);
  const [activeSetupTab, setActiveSetupTab] = useState<'profile' | 'twilio' | 'test' | 'advanced'>('profile');
  const [appMode, setAppMode] = useState<'dashboard' | 'setup' | 'operations' | 'demo'>('dashboard');

  useEffect(() => {
    const raw = window.localStorage.getItem(CONNECTION_STORAGE_KEY);
    if (!raw) {
      setStoredConnectionSeen(true);
      return;
    }
    try {
      const parsed = JSON.parse(raw) as Partial<ConnectionState>;
      setConnection((current) => ({
        ...current,
        ...parsed,
      }));
    } catch {
      window.localStorage.removeItem(CONNECTION_STORAGE_KEY);
    } finally {
      setStoredConnectionSeen(true);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(CONNECTION_STORAGE_KEY, JSON.stringify(connection));
  }, [connection]);

  useEffect(() => {
    if (!storedConnectionSeen) {
      return;
    }
    if (!connection.gatewayUrl.trim() || !connection.apiKey.trim() || !connection.appId.trim()) {
      setSavedBusinesses([]);
      return;
    }
    void loadSavedBusinesses(connection);
  }, [storedConnectionSeen, connection.gatewayUrl, connection.apiKey, connection.appId]);

  useEffect(() => {
    if (!savedBusinesses.length) {
      return;
    }
    if (clientLaunchDraft.sourceTenantId.trim()) {
      return;
    }

    const preferredSourceTenantId = savedBusinesses.some((item) => item.tenantId === connection.tenantId)
      ? connection.tenantId
      : savedBusinesses[0].tenantId;
    setClientLaunchDraft((current) => ({
      ...current,
      sourceTenantId: preferredSourceTenantId,
    }));
  }, [savedBusinesses, connection.tenantId, clientLaunchDraft.sourceTenantId]);

  useEffect(() => {
    if (!storedConnectionSeen || startupAttempted || workspace) {
      return;
    }
    setStartupAttempted(true);
    if (isStarterConnection(connection)) {
      setConnectionCheck({
        status: 'idle',
        message: 'Enter the hosted gateway details or use the local install helper.',
      });
      return;
    }
    if (!connection.gatewayUrl.trim() || !connection.apiKey.trim() || !connection.appId.trim()) {
      setConnectionCheck({
        status: 'idle',
        message: 'Finish the hosted gateway fields before opening the business.',
      });
      return;
    }
    void loadWorkspace(true, connection, false);
  }, [storedConnectionSeen, startupAttempted, workspace, connection]);

  useEffect(() => {
    if (!workspace) return;
    const id = window.setInterval(() => {
      void loadWorkspace(false, connection, false);
    }, 20000);
    return () => window.clearInterval(id);
  }, [workspace, connection]);

  useEffect(() => {
    if (
      !setupPanelPreferenceLocked &&
      workspace?.summary.mode === 'live' &&
      workspace.onboarding.channels.sms.live
    ) {
      setShowSetupPanels(false);
    }
  }, [workspace, setupPanelPreferenceLocked]);

  async function apiRequest<T>(
    pathname: string,
    init?: RequestInit,
    targetConnection: ConnectionState = connection
  ): Promise<T> {
    const response = await fetch(`${baseUrl(targetConnection.gatewayUrl)}${pathname}`, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': targetConnection.apiKey,
        ...(init?.headers ?? {}),
      },
    });
    const json = (await response.json()) as T & { error?: { message?: string } };
    if (!response.ok) {
      throw new Error(json.error?.message || `Request failed with status ${response.status}`);
    }
    return json;
  }

  async function verifyConnection(targetConnection: ConnectionState) {
    requireConnectionFields(targetConnection, false);

    const healthResponse = await fetch(`${baseUrl(targetConnection.gatewayUrl)}/health`);
    if (!healthResponse.ok) {
      throw new Error(`Gateway health check failed with status ${healthResponse.status}.`);
    }
    const healthJson = (await healthResponse.json()) as {
      ok?: boolean;
      service?: string;
      publicBaseUrl?: string | null;
    };
    if (!healthJson.ok) {
      throw new Error('Gateway health check did not return ok.');
    }

    const providerJson = await apiRequest<{
      provider: AiProviderStatus;
    }>(
      `/v1/config/provider?app_id=${encodeURIComponent(targetConnection.appId)}`,
      undefined,
      targetConnection
    );

    const runtimeJson = await apiRequest<{
      runtime: GatewayRuntimeStatus;
    }>(
      `/v1/runtime/status?app_id=${encodeURIComponent(targetConnection.appId)}`,
      undefined,
      targetConnection
    );

    return {
      health: healthJson,
      provider: providerJson.provider,
      runtime: runtimeJson.runtime,
    };
  }

  async function loadSavedBusinesses(targetConnection: ConnectionState = connection) {
    if (!targetConnection.gatewayUrl.trim() || !targetConnection.apiKey.trim() || !targetConnection.appId.trim()) {
      setSavedBusinesses([]);
      return;
    }

    try {
      const response = await apiRequest<{ tenants: SavedBusinessSummary[] }>(
        `/v1/revenue/tenants?app_id=${encodeURIComponent(targetConnection.appId)}`,
        undefined,
        targetConnection
      );
      setSavedBusinesses(response.tenants);
    } catch {
      setSavedBusinesses([]);
    }
  }

  async function handleTestConnection(targetConnection: ConnectionState = connection) {
    setRequestState({
      busy: true,
      message: 'Testing the hosted or local gateway connection...',
      tone: 'neutral',
    });
    try {
      const checked = await verifyConnection(targetConnection);
      await loadSavedBusinesses(targetConnection);
      setProviderStatus(checked.provider);
      setConnectionCheck({
        status: 'connected',
        message: `${checked.health.service || 'responseos-gateway'} is reachable.`,
        checkedAt: new Date().toISOString(),
        publicBaseUrl: checked.runtime.publicBaseUrl ?? checked.health.publicBaseUrl ?? undefined,
        runtime: checked.runtime,
      });
      setRequestState({
        busy: false,
        message: `Gateway reachable for ${targetConnection.appId}.`,
        tone: 'success',
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Connection test failed.';
      setProviderStatus(null);
      setConnectionCheck({
        status: 'error',
        message,
        checkedAt: new Date().toISOString(),
        publicBaseUrl: undefined,
        runtime: undefined,
      });
      setRequestState({
        busy: false,
        message,
        tone: 'error',
      });
    }
  }

  async function loadWorkspace(
    syncForms: boolean,
    targetConnection: ConnectionState = connection,
    announce = true
  ) {
    if (announce) {
      setRequestState({
        busy: true,
        message: 'Opening the plumbing automation workspace...',
        tone: 'neutral',
      });
    }

    try {
      requireConnectionFields(targetConnection, true);
      const checked = await verifyConnection(targetConnection);
      const workspaceResponse = await apiRequest<{ workspace: RevenueWorkspace }>(
        `/v1/revenue/workspace?app_id=${encodeURIComponent(
          targetConnection.appId
        )}&tenant_id=${encodeURIComponent(targetConnection.tenantId)}`,
        undefined,
        targetConnection
      );

      setConnection(targetConnection);
      setWorkspace(workspaceResponse.workspace);
      setConnectionEditingUnlocked(false);
      setTwilioMaintenanceUnlocked(false);
      await loadSavedBusinesses(targetConnection);
      setProviderStatus(checked.provider);
      setConnectionCheck({
        status: 'connected',
        message: `${checked.health.service || 'responseos-gateway'} is reachable.`,
        checkedAt: new Date().toISOString(),
        publicBaseUrl: checked.runtime.publicBaseUrl ?? checked.health.publicBaseUrl ?? undefined,
        runtime: checked.runtime,
      });

      if (syncForms) {
        setProfileDraft(profileDraftFromWorkspace(workspaceResponse.workspace));
        setProfileHours(workspaceResponse.workspace.profile.hours);
        setDiscoveryResult(null);
        setAiSetupAssist(null);
        setAiSetupAssistSourceKey('');
      }

      if (announce) {
        setRequestState({
          busy: false,
          message: `Loaded ${workspaceResponse.workspace.profile.businessName || targetConnection.tenantId}.`,
          tone: 'success',
        });
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Could not open the workspace.';
      setProviderStatus(null);
      setConnectionCheck({
        status: 'error',
        message,
        checkedAt: new Date().toISOString(),
        publicBaseUrl: undefined,
        runtime: undefined,
      });
      if (announce) {
        setRequestState({
          busy: false,
          message,
          tone: 'error',
        });
      }
    }
  }

  async function resolveLocalConnectionTarget(baseConnection: ConnectionState) {
    const detected = await detectGatewayCandidate(baseConnection.gatewayUrl);
    return {
      ...baseConnection,
      gatewayUrl: detected?.candidate || baseConnection.gatewayUrl,
    };
  }

  async function handleDetectGateway() {
    setRequestState({
      busy: true,
      message: 'Looking for a local ResponseOS gateway...',
      tone: 'neutral',
    });
    const detected = await detectGatewayCandidate(connection.gatewayUrl);
    if (!detected) {
      const message = 'No local gateway responded on the common ports.';
      setConnectionCheck({
        status: 'error',
        message,
        checkedAt: new Date().toISOString(),
      });
      setRequestState({
        busy: false,
        message,
        tone: 'error',
      });
      return;
    }

    setConnection((current) => ({
      ...current,
      gatewayUrl: detected.candidate,
    }));
    setConnectionCheck({
      status: 'connected',
      message: `Detected ${detected.service} at ${detected.candidate}.`,
      checkedAt: new Date().toISOString(),
      publicBaseUrl: undefined,
    });
    setRequestState({
      busy: false,
      message: `Detected gateway at ${detected.candidate}.`,
      tone: 'success',
    });
  }

  async function handleUseDemo() {
    setRequestState({
      busy: true,
      message: 'Preparing the plumbing sales demo workspace...',
      tone: 'neutral',
    });

    try {
      const targetConnection = await resolveLocalConnectionTarget({
        ...connection,
        apiKey: 'preview-key',
        appId: 'responseos-app',
        tenantId: 'demo-plumbing-live-preview',
      });

      const existingWorkspaceResponse = await apiRequest<{ workspace: RevenueWorkspace }>(
        `/v1/revenue/workspace?app_id=${encodeURIComponent(
          targetConnection.appId
        )}&tenant_id=${encodeURIComponent(targetConnection.tenantId)}`,
        undefined,
        targetConnection
      );
      const existingWorkspace = existingWorkspaceResponse.workspace;
      const existingPrimaryNumber = (existingWorkspace.profile.mainBusinessNumber || '').trim();
      const existingCallbackNumber = (existingWorkspace.profile.callbackNumber || '').trim();
      const existingAdditionalBusinessNumbers = (existingWorkspace.profile.mainBusinessNumbers || [])
        .filter((item) => item.trim() && item.trim() !== existingPrimaryNumber)
        .join('\n');
      const preserveConfiguredNumbers = Boolean(existingPrimaryNumber || existingCallbackNumber);

      const demoReplyOptions = resolveMissedCallReplyOptions(DEFAULT_PROFILE_DRAFT.replyOptions);
      const demoBusinessName = 'ABC Plumbing';
      const demoProfileDraft = {
        ...DEFAULT_PROFILE_DRAFT,
        businessName: demoBusinessName,
        mainBusinessNumber: preserveConfiguredNumbers
          ? existingPrimaryNumber || existingCallbackNumber
          : '+12025550100',
        additionalBusinessNumbers: preserveConfiguredNumbers ? existingAdditionalBusinessNumbers : '+12025550101',
        callbackNumber: preserveConfiguredNumbers
          ? existingCallbackNumber || existingPrimaryNumber
          : '+12025550199',
        services: 'Leak repair, drain clearing, clog removal, water heater help',
        serviceArea: 'Queens',
        websiteUrl: (existingWorkspace.settings.websiteUrl || '').trim() || 'https://example.com',
        ownerAlertDestination:
          (existingWorkspace.settings.ownerAlertDestination || '').trim() || '+12025550122',
        contactEmail: (existingWorkspace.settings.contactEmail || '').trim() || 'office@example.com',
        missedCallReply: buildDefaultMissedCallReply(demoBusinessName, demoReplyOptions),
        replyOptions: demoReplyOptions,
        automationTier: 'starter' as const,
        automationMode: 'hybrid' as const,
        automationVertical: 'plumbing' as const,
        maxRequestsPerDay: 75,
        fallbackOnFailure: true,
      };

      await apiRequest(
        '/v1/revenue/profile',
        {
          method: 'PUT',
          body: JSON.stringify({
            app_id: targetConnection.appId,
            tenant_id: targetConnection.tenantId,
            profile: {
              businessName: demoProfileDraft.businessName,
              mainBusinessNumber: demoProfileDraft.mainBusinessNumber,
              mainBusinessNumbers: buildBusinessPhoneNumbers(
                demoProfileDraft.mainBusinessNumber,
                demoProfileDraft.additionalBusinessNumbers
              ),
              callbackNumber: demoProfileDraft.callbackNumber,
              timezone: demoProfileDraft.timezone,
              services: splitCsv(demoProfileDraft.services),
              serviceArea: demoProfileDraft.serviceArea,
              templates: {
                missedCallReply: demoProfileDraft.missedCallReply,
                replyOptions: serializeReplyOptions(demoProfileDraft.replyOptions),
              },
            },
            settings: {
              websiteUrl: demoProfileDraft.websiteUrl,
              bookingLink: existingWorkspace.settings.bookingLink,
              reviewUrl: existingWorkspace.settings.reviewUrl,
              ownerAlertDestination: demoProfileDraft.ownerAlertDestination,
              contactEmail: demoProfileDraft.contactEmail,
              automation: {
                tier: demoProfileDraft.automationTier,
                mode: demoProfileDraft.automationMode,
                vertical: demoProfileDraft.automationVertical,
                maxRequestsPerDay: demoProfileDraft.maxRequestsPerDay,
                fallbackOnFailure: demoProfileDraft.fallbackOnFailure,
              },
              sms: existingWorkspace.onboarding.channels.sms.live
                ? existingWorkspace.settings.sms
                : {
                    provider: 'simulated',
                    connectorId: '',
                    path: 'Messages.json',
                  },
              email: existingWorkspace.settings.email,
              calendar: existingWorkspace.settings.calendar,
            },
          }),
        },
        targetConnection
      );

      await loadWorkspace(true, targetConnection, false);
      setAppMode('demo');
      setRequestState({
        busy: false,
        message: 'Demo workspace is ready. Open the live conversation and run the sample leak scenario.',
        tone: 'success',
      });
    } catch (error) {
      setRequestState({
        busy: false,
        message: error instanceof Error ? error.message : 'Could not prepare the demo workspace.',
        tone: 'error',
      });
    }
  }

  function stageClientWorkspace(
    targetConnection: ConnectionState,
    nextProfileDraft: ProfileDraft,
    message: string
  ) {
    setConnection(targetConnection);
    setWorkspace(null);
    setProfileDraft(nextProfileDraft);
    setProfileHours(undefined);
    setDiscoveryResult(null);
    setPacketText('');
    setValidation(DEFAULT_VALIDATION);
    setAiSetupAssist(null);
    setAiSetupAssistSourceKey('');
    setTwilioMaintenanceUnlocked(false);
    setShowSetupPanels(true);
    setSetupPanelPreferenceLocked(true);
    setRequestState({
      busy: false,
      message,
      tone: 'success',
    });
  }

  function buildPreparedProfileDraft(
    businessName: string,
    primaryNumber: string,
    additionalNumbers: string
  ): ProfileDraft {
    const replyOptions = resolveMissedCallReplyOptions(DEFAULT_PROFILE_DRAFT.replyOptions);
    return {
      ...DEFAULT_PROFILE_DRAFT,
      businessName,
      mainBusinessNumber: primaryNumber.trim(),
      additionalBusinessNumbers: additionalNumbers,
      missedCallReply: buildDefaultMissedCallReply(businessName, replyOptions),
      replyOptions,
    };
  }

  function resolveLaunchTenantId(businessName: string, requestedTenantId: string) {
    return requestedTenantId.trim() || slugFromBusinessName(businessName);
  }

  function resetClientLaunchDraft(sourceTenantId = '') {
    setClientLaunchDraft({
      ...DEFAULT_CLIENT_LAUNCH_DRAFT,
      sourceTenantId,
    });
  }

  function handleUseBusinessAsTemplate(sourceTenantId: string, businessName: string) {
    const copyName = `${businessName} Copy`.trim();
    setClientLaunchDraft((current) => ({
      ...current,
      businessName: current.businessName.trim() || copyName,
      tenantId: current.tenantId.trim() || slugFromBusinessName(copyName),
      sourceTenantId,
    }));
    setRequestState({
      busy: false,
      message: `${businessName} is selected as the setup template.`,
      tone: 'success',
    });
  }

  async function handlePrepareNewClient() {
    try {
      requireConnectionFields(connection, false);
      const businessName = clientLaunchDraft.businessName.trim();
      if (!businessName) {
        throw new Error('New client name is required.');
      }

      const targetTenantId = resolveLaunchTenantId(businessName, clientLaunchDraft.tenantId);
      if (!targetTenantId) {
        throw new Error('A valid business ID is required.');
      }
      if (savedBusinesses.some((item) => item.tenantId === targetTenantId)) {
        throw new Error(`Business ID ${targetTenantId} already exists.`);
      }

      const targetConnection: ConnectionState = {
        ...connection,
        tenantId: targetTenantId,
      };
      const nextProfileDraft = buildPreparedProfileDraft(
        businessName,
        clientLaunchDraft.primaryNumber,
        clientLaunchDraft.additionalNumbers
      );
      stageClientWorkspace(
        targetConnection,
        nextProfileDraft,
        `Prepared ${businessName}. Save Business to create the new client workspace.`
      );
      resetClientLaunchDraft(clientLaunchDraft.sourceTenantId);
    } catch (error) {
      setRequestState({
        busy: false,
        message: error instanceof Error ? error.message : 'Could not prepare the new client.',
        tone: 'error',
      });
    }
  }

  async function handleDuplicateClient() {
    setRequestState({
      busy: true,
      message: 'Duplicating the client setup template...',
      tone: 'neutral',
    });

    try {
      requireConnectionFields(connection, false);
      const sourceTenantId = clientLaunchDraft.sourceTenantId.trim();
      const businessName = clientLaunchDraft.businessName.trim();
      if (!sourceTenantId) {
        throw new Error('Choose a source client to duplicate.');
      }
      if (!businessName) {
        throw new Error('New client name is required.');
      }

      const targetTenantId = resolveLaunchTenantId(businessName, clientLaunchDraft.tenantId);
      if (!targetTenantId) {
        throw new Error('A valid business ID is required.');
      }
      if (savedBusinesses.some((item) => item.tenantId === targetTenantId)) {
        throw new Error(`Business ID ${targetTenantId} already exists.`);
      }

      const businessPhoneNumbers = buildBusinessPhoneNumbers(
        clientLaunchDraft.primaryNumber,
        clientLaunchDraft.additionalNumbers
      );
      const response = await apiRequest<{ result: { workspace: RevenueWorkspace } }>(
        '/v1/revenue/tenants/duplicate',
        {
          method: 'POST',
          body: JSON.stringify({
            app_id: connection.appId,
            source_tenant_id: sourceTenantId,
            target_tenant_id: targetTenantId,
            business_name: businessName,
            main_business_number: clientLaunchDraft.primaryNumber.trim(),
            main_business_numbers: businessPhoneNumbers,
          }),
        }
      );

      const targetConnection: ConnectionState = {
        ...connection,
        tenantId: targetTenantId,
      };
      setConnection(targetConnection);
      setWorkspace(response.result.workspace);
      setProfileDraft(profileDraftFromWorkspace(response.result.workspace));
      setProfileHours(response.result.workspace.profile.hours);
      setDiscoveryResult(null);
      setPacketText('');
      setValidation(DEFAULT_VALIDATION);
      setAiSetupAssist(null);
      setAiSetupAssistSourceKey('');
      setShowSetupPanels(true);
      setSetupPanelPreferenceLocked(true);
      await loadSavedBusinesses(targetConnection);
      resetClientLaunchDraft(sourceTenantId);
      setRequestState({
        busy: false,
        message: `Created ${businessName} from the ${sourceTenantId} template. Twilio wiring was intentionally cleared.`,
        tone: 'success',
      });
    } catch (error) {
      setRequestState({
        busy: false,
        message: error instanceof Error ? error.message : 'Could not duplicate the client setup.',
        tone: 'error',
      });
    }
  }

  async function handleGenerateAiSuggestions() {
    setRequestState({
      busy: true,
      message: 'Generating plumbing starter setup suggestions...',
      tone: 'neutral',
    });

    try {
      requireConnectionFields(connection, false);

      const effectiveTenantId =
        connection.tenantId.trim() && connection.tenantId.trim() !== 'default'
          ? connection.tenantId.trim()
          : slugFromBusinessName(profileDraft.businessName) || connection.tenantId.trim() || 'default';
      const existingSettings = workspace?.settings ?? defaultSettings();
      const businessPhoneNumbers = buildBusinessPhoneNumbers(
        profileDraft.mainBusinessNumber,
        profileDraft.additionalBusinessNumbers
      );
      const response = await apiRequest<{ result: AiSetupAssistResult }>('/v1/revenue/ai/setup-assist', {
        method: 'POST',
        body: JSON.stringify({
          app_id: connection.appId,
          tenant_id: effectiveTenantId,
          profile: {
            businessName: profileDraft.businessName,
            mainBusinessNumber: profileDraft.mainBusinessNumber,
            mainBusinessNumbers: businessPhoneNumbers,
            callbackNumber: profileDraft.callbackNumber,
            timezone: profileDraft.timezone,
            services:
              splitCsv(profileDraft.services).length > 0
                ? splitCsv(profileDraft.services)
                : ['service', 'estimate', 'appointment'],
            serviceArea: profileDraft.serviceArea,
            hours: profileHours ?? workspace?.profile.hours,
            emergencyPolicy: workspace?.profile.emergencyPolicy,
            templates: {
              ...(workspace?.profile.templates ?? {}),
              missedCallReply: configuredMissedCallReply,
              replyOptions: serializeReplyOptions(profileDraft.replyOptions),
            },
          },
          settings: {
            websiteUrl: profileDraft.websiteUrl,
            ownerAlertDestination: profileDraft.ownerAlertDestination,
            contactEmail: profileDraft.contactEmail,
            bookingLink: profileDraft.bookingLink || existingSettings.bookingLink,
            reviewUrl: profileDraft.reviewUrl || existingSettings.reviewUrl,
            automation: {
              ...existingSettings.automation,
              tier: profileDraft.automationTier,
              mode: profileDraft.automationMode,
              vertical: profileDraft.automationVertical,
              maxRequestsPerDay: profileDraft.maxRequestsPerDay,
              fallbackOnFailure: profileDraft.fallbackOnFailure,
            },
            sms: existingSettings.sms,
            email: existingSettings.email,
            calendar: existingSettings.calendar,
          },
        }),
      });

      setAiSetupAssist(response.result);
      setAiSetupAssistSourceKey(currentSetupAssistKey);
      setProviderStatus(response.result.provider);
      setRequestState({
        busy: false,
        message: response.result.summary,
        tone: 'success',
      });
    } catch (error) {
      setRequestState({
        busy: false,
        message: error instanceof Error ? error.message : 'Could not generate automation setup suggestions.',
        tone: 'error',
      });
    }
  }

  function handleApplyAiSuggestions() {
    if (!aiSetupAssist) {
      return;
    }

    setProfileDraft((current) => ({
      ...current,
      missedCallReply: aiSetupAssist.missedCallReply,
      replyOptions: resolveMissedCallReplyOptions(aiSetupAssist.replyOptions),
    }));
    setRequestState({
      busy: false,
      message: 'Applied the latest automation setup suggestions to the client reply fields.',
      tone: 'success',
    });
  }

  async function discoverWebsiteSetup(targetDraft: ProfileDraft) {
    requireConnectionFields(connection, false);
    if (!targetDraft.websiteUrl.trim()) {
      throw new Error('Add the business website URL first.');
    }
    const response = await apiRequest<{ result: WebsiteDiscoveryResult }>('/v1/revenue/discovery/website', {
      method: 'POST',
      body: JSON.stringify({
        app_id: connection.appId,
        website_url: targetDraft.websiteUrl.trim(),
        business_name: targetDraft.businessName.trim() || undefined,
        main_business_number: targetDraft.mainBusinessNumber.trim() || undefined,
      }),
    });
    return response.result;
  }

  async function handleAutoFillFromWebsite() {
    setRequestState({
      busy: true,
      message: 'Scanning the business website...',
      tone: 'neutral',
    });
    try {
      const result = await discoverWebsiteSetup(profileDraft);
      setProfileDraft((current) => mergeDiscoveryIntoProfile(current, result));
      setProfileHours((current) => current ?? result.profile.hours);
      setDiscoveryResult(result);
      setRequestState({
        busy: false,
        message: buildDiscoveryMessage(result),
        tone: 'success',
      });
    } catch (error) {
      setRequestState({
        busy: false,
        message: error instanceof Error ? error.message : 'Website scan failed.',
        tone: 'error',
      });
    }
  }

  async function handleSaveBusiness(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setRequestState({
      busy: true,
      message: 'Saving the plumbing starter business setup...',
      tone: 'neutral',
    });
    try {
      let resolvedDraft = profileDraft;
      let resolvedHours = profileHours;
      let discoveryNote = '';

      if (profileDraft.websiteUrl.trim()) {
        try {
          const discovery = await discoverWebsiteSetup(profileDraft);
          resolvedDraft = mergeDiscoveryIntoProfile(profileDraft, discovery);
          resolvedHours = resolvedHours ?? discovery.profile.hours;
          setProfileDraft(resolvedDraft);
          setProfileHours(resolvedHours);
          setDiscoveryResult(discovery);
          discoveryNote = ` ${buildDiscoveryMessage(discovery)}`;
        } catch (error) {
          discoveryNote = ` Saved without website auto-fill: ${
            error instanceof Error ? error.message : 'website scan failed.'
          }`;
        }
      }

      const resolvedTenantId =
        connection.tenantId.trim() && connection.tenantId.trim() !== 'default'
          ? connection.tenantId.trim()
          : slugFromBusinessName(resolvedDraft.businessName) || 'default';
      const targetConnection: ConnectionState = {
        ...connection,
        tenantId: resolvedTenantId,
      };
      setConnection(targetConnection);

      const existingSettings = workspace?.settings ?? defaultSettings();
      const existingProfile = workspace?.profile;
      const businessPhoneNumbers = buildBusinessPhoneNumbers(
        resolvedDraft.mainBusinessNumber,
        resolvedDraft.additionalBusinessNumbers
      );

      await apiRequest('/v1/revenue/profile', {
        method: 'PUT',
        body: JSON.stringify({
          app_id: targetConnection.appId,
          tenant_id: resolvedTenantId,
          profile: {
            businessName: resolvedDraft.businessName,
            mainBusinessNumber: resolvedDraft.mainBusinessNumber,
            mainBusinessNumbers: businessPhoneNumbers,
            callbackNumber: resolvedDraft.callbackNumber,
            timezone: resolvedDraft.timezone,
            services:
              splitCsv(resolvedDraft.services).length > 0
                ? splitCsv(resolvedDraft.services)
                : ['service', 'estimate', 'appointment'],
            serviceArea: resolvedDraft.serviceArea,
            hours: resolvedHours ?? existingProfile?.hours,
            emergencyPolicy: existingProfile?.emergencyPolicy,
            templates: {
              ...(existingProfile?.templates ?? {}),
              missedCallReply:
                resolvedDraft.missedCallReply.trim() ||
                buildDefaultMissedCallReply(resolvedDraft.businessName, resolvedDraft.replyOptions),
              replyOptions: serializeReplyOptions(resolvedDraft.replyOptions),
            },
          },
          settings: {
            websiteUrl: resolvedDraft.websiteUrl,
            ownerAlertDestination: resolvedDraft.ownerAlertDestination,
            contactEmail: resolvedDraft.contactEmail,
            bookingLink: resolvedDraft.bookingLink || existingSettings.bookingLink,
            reviewUrl: resolvedDraft.reviewUrl || existingSettings.reviewUrl,
            automation: {
              ...existingSettings.automation,
              tier: resolvedDraft.automationTier,
              mode: resolvedDraft.automationMode,
              vertical: resolvedDraft.automationVertical,
              maxRequestsPerDay: resolvedDraft.maxRequestsPerDay,
              fallbackOnFailure: resolvedDraft.fallbackOnFailure,
            },
            sms: existingSettings.sms,
            email: existingSettings.email,
            calendar: existingSettings.calendar,
          },
        }),
      });

      await loadWorkspace(true, targetConnection, false);
      setRequestState({
        busy: false,
        message: `Business setup saved.${discoveryNote}`,
        tone: 'success',
      });
    } catch (error) {
      setRequestState({
        busy: false,
        message: error instanceof Error ? error.message : 'Could not save the business setup.',
        tone: 'error',
      });
    }
  }

  async function handleValidateTwilio() {
    setValidation({
      status: 'validating',
      message: 'Checking Twilio credentials...',
    });
    setRequestState({
      busy: true,
      message: 'Checking Twilio credentials...',
      tone: 'neutral',
    });
    try {
      const response = await apiRequest<{ result: { valid: boolean; message: string } }>(
        '/v1/revenue/connectors/validate',
        {
          method: 'POST',
          body: JSON.stringify({
            app_id: connection.appId,
            tenant_id: connection.tenantId,
            channel: 'sms',
            provider: 'twilio',
            config: {
              connector_id: twilioDraft.connectorId,
              account_sid: twilioDraft.accountSid,
              auth_token: twilioDraft.authToken,
              base_url: twilioDraft.baseUrl,
            },
          }),
        }
      );
      setValidation({
        status: response.result.valid ? 'success' : 'error',
        message: response.result.message,
        checkedAt: new Date().toISOString(),
      });
      setRequestState({
        busy: false,
        message: response.result.message,
        tone: response.result.valid ? 'success' : 'error',
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Twilio validation failed.';
      setValidation({
        status: 'error',
        message,
        checkedAt: new Date().toISOString(),
      });
      setRequestState({
        busy: false,
        message,
        tone: 'error',
      });
    }
  }

  async function handleConnectTwilio() {
    setRequestState({
      busy: true,
      message: 'Connecting Twilio SMS...',
      tone: 'neutral',
    });
    try {
      requireConnectionFields(connection, true);
      const response = await apiRequest<{ result: { summary: string } }>('/v1/revenue/connectors/bootstrap', {
        method: 'POST',
        body: JSON.stringify({
          app_id: connection.appId,
          tenant_id: connection.tenantId,
          channel: 'sms',
          provider: 'twilio',
          config: {
            connector_id: twilioDraft.connectorId,
            account_sid: twilioDraft.accountSid,
            auth_token: twilioDraft.authToken,
            base_url: twilioDraft.baseUrl,
          },
        }),
      });
      setTwilioDraft(DEFAULT_TWILIO_DRAFT);
      setValidation({
        status: 'success',
        message: response.result.summary,
        checkedAt: new Date().toISOString(),
      });
      await loadWorkspace(true, connection, false);
      setRequestState({
        busy: false,
        message: response.result.summary,
        tone: 'success',
      });
      setTwilioMaintenanceUnlocked(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Twilio bootstrap failed.';
      setValidation({
        status: 'error',
        message,
        checkedAt: new Date().toISOString(),
      });
      setRequestState({
        busy: false,
        message,
        tone: 'error',
      });
    }
  }

  async function handleSendTestMissedCall() {
    setRequestState({
      busy: true,
      message: 'Sending a test missed call event...',
      tone: 'neutral',
    });
    try {
      requireConnectionFields(connection, true);
      const callbackNumber =
        workspace?.profile.callbackNumber || profileDraft.callbackNumber || '+12025550199';
      const result = await apiRequest<{ result: { patch: { summary: string } } }>('/v1/revenue/events', {
        method: 'POST',
        body: JSON.stringify({
          app_id: connection.appId,
          tenant_id: connection.tenantId,
          event: {
            type: 'call.missed',
            fromNumber: testCaller.trim(),
            toNumber: callbackNumber,
            callSid: `CA_${Date.now()}`,
            source: 'missed-call-text-back-addon',
          },
        }),
      });
      await loadWorkspace(false, connection, false);
      setRequestState({
        busy: false,
        message: result.result.patch.summary,
        tone: 'success',
      });
    } catch (error) {
      setRequestState({
        busy: false,
        message: error instanceof Error ? error.message : 'Test missed call failed.',
        tone: 'error',
      });
    }
  }

  async function handleRunDueFollowups() {
    setRequestState({
      busy: true,
      message: 'Running due follow-ups...',
      tone: 'neutral',
    });
    try {
      requireConnectionFields(connection, true);
      const response = await apiRequest<{ result: { summary: string } }>('/v1/runtime/followups/run', {
        method: 'POST',
        body: JSON.stringify({
          app_id: connection.appId,
          tenant_id: connection.tenantId,
        }),
      });
      await loadWorkspace(false, connection, false);
      setRequestState({
        busy: false,
        message: response.result.summary,
        tone: 'success',
      });
    } catch (error) {
      setRequestState({
        busy: false,
        message: error instanceof Error ? error.message : 'Running due follow-ups failed.',
        tone: 'error',
      });
    }
  }

  async function handleCompleteTask(taskId: string, title: string) {
    setRequestState({
      busy: true,
      message: `Completing ${title}...`,
      tone: 'neutral',
    });
    try {
      requireConnectionFields(connection, true);
      const response = await apiRequest<{ result: { summary: string } }>('/v1/revenue/tasks/complete', {
        method: 'POST',
        body: JSON.stringify({
          app_id: connection.appId,
          tenant_id: connection.tenantId,
          task_id: taskId,
        }),
      });
      await loadWorkspace(false, connection, false);
      setRequestState({
        busy: false,
        message: response.result.summary,
        tone: 'success',
      });
    } catch (error) {
      setRequestState({
        busy: false,
        message: error instanceof Error ? error.message : 'Completing the task failed.',
        tone: 'error',
      });
    }
  }

  async function handleCompleteFollowup(followupId: string, title: string) {
    setRequestState({
      busy: true,
      message: `Completing ${title}...`,
      tone: 'neutral',
    });
    try {
      requireConnectionFields(connection, true);
      const response = await apiRequest<{ result: { summary: string } }>('/v1/revenue/followups/complete', {
        method: 'POST',
        body: JSON.stringify({
          app_id: connection.appId,
          tenant_id: connection.tenantId,
          followup_id: followupId,
        }),
      });
      await loadWorkspace(false, connection, false);
      setRequestState({
        busy: false,
        message: response.result.summary,
        tone: 'success',
      });
    } catch (error) {
      setRequestState({
        busy: false,
        message: error instanceof Error ? error.message : 'Completing the follow-up failed.',
        tone: 'error',
      });
    }
  }

  async function handleCopyWebhook() {
    const webhookUrl = buildTwilioWebhookUrl(connection, connectionCheck.publicBaseUrl);
    if (!webhookUrl) {
      setRequestState({
        busy: false,
        message: 'Open a business first so the webhook URL can be generated.',
        tone: 'error',
      });
      return;
    }
    try {
      await navigator.clipboard.writeText(webhookUrl);
      setRequestState({
        busy: false,
        message: 'Webhook URL copied.',
        tone: 'success',
      });
    } catch {
      setRequestState({
        busy: false,
        message: 'Could not copy the webhook URL on this browser.',
        tone: 'error',
      });
    }
  }

  async function handleCopyValue(value: string, label: string) {
    if (!value.trim()) {
      setRequestState({
        busy: false,
        message: `${label} is not ready yet.`,
        tone: 'error',
      });
      return;
    }
    try {
      await navigator.clipboard.writeText(value);
      setRequestState({
        busy: false,
        message: `${label} copied.`,
        tone: 'success',
      });
    } catch {
      setRequestState({
        busy: false,
        message: `Could not copy ${label.toLowerCase()} on this browser.`,
        tone: 'error',
      });
    }
  }

  async function handleExportPacket() {
    setRequestState({
      busy: true,
      message: 'Exporting the handoff packet...',
      tone: 'neutral',
    });
    try {
      requireConnectionFields(connection, true);
      const response = await apiRequest<{ packet: OnboardingPacket }>(
        `/v1/revenue/onboarding-packet?app_id=${encodeURIComponent(
          connection.appId
        )}&tenant_id=${encodeURIComponent(connection.tenantId)}`
      );
      setPacketText(JSON.stringify(response.packet, null, 2));
      setRequestState({
        busy: false,
        message: `Exported handoff packet for ${response.packet.tenantId}.`,
        tone: 'success',
      });
    } catch (error) {
      setRequestState({
        busy: false,
        message: error instanceof Error ? error.message : 'Packet export failed.',
        tone: 'error',
      });
    }
  }

  async function handleImportPacket() {
    setRequestState({
      busy: true,
      message: 'Importing the handoff packet...',
      tone: 'neutral',
    });
    try {
      requireConnectionFields(connection, true);
      const parsed = JSON.parse(packetText) as OnboardingPacket;
      await apiRequest('/v1/revenue/onboarding-packet/import', {
        method: 'POST',
        body: JSON.stringify({
          app_id: connection.appId,
          tenant_id: connection.tenantId,
          packet: parsed,
        }),
      });
      await loadWorkspace(true, connection, false);
      setRequestState({
        busy: false,
        message: `Imported handoff packet into ${connection.tenantId}.`,
        tone: 'success',
      });
    } catch (error) {
      setRequestState({
        busy: false,
        message: error instanceof Error ? error.message : 'Packet import failed.',
        tone: 'error',
      });
    }
  }

  function serializeReplyOptions(replyOptions: ProfileDraft['replyOptions']) {
    return Object.fromEntries(
      MISSED_CALL_OPTION_KEYS.map((key) => [
        key,
        {
          title: replyOptions[key].title.trim(),
          reply: replyOptions[key].reply.trim(),
        },
      ])
    );
  }

  function setProfileDraftWithReplySync(
    updater: (current: ProfileDraft) => ProfileDraft,
    syncMissedCallReply = false
  ) {
    setProfileDraft((current) => {
      const next = updater(current);
      if (!syncMissedCallReply) {
        return next;
      }

      const currentAutoReply = buildDefaultMissedCallReply(current.businessName, current.replyOptions);
      const shouldSyncReply =
        !current.missedCallReply.trim() || current.missedCallReply.trim() === currentAutoReply;
      if (!shouldSyncReply) {
        return next;
      }

      return {
        ...next,
        missedCallReply: buildDefaultMissedCallReply(next.businessName, next.replyOptions),
      };
    });
  }

  function updateReplyOption(key: MissedCallOptionKey, field: 'title' | 'reply', value: string) {
    setProfileDraftWithReplySync(
      (current) => ({
        ...current,
        replyOptions: {
          ...current.replyOptions,
          [key]: {
            ...current.replyOptions[key],
            [field]: value,
          },
        },
      }),
      field === 'title'
    );
  }

  function downloadTextFile(filename: string, content: string, mimeType: string) {
    if (!content.trim()) {
      setRequestState({
        busy: false,
        message: `${filename} is not ready yet.`,
        tone: 'error',
      });
      return;
    }

    const blob = new Blob([content], { type: mimeType });
    const url = window.URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    document.body.append(anchor);
    anchor.click();
    anchor.remove();
    window.URL.revokeObjectURL(url);
    setRequestState({
      busy: false,
      message: `${filename} downloaded.`,
      tone: 'success',
    });
  }

  const webhookUrl = buildTwilioWebhookUrl(connection, connectionCheck.publicBaseUrl);
  const gatewayExposure = describeGatewayExposure(connection.gatewayUrl, connectionCheck.publicBaseUrl);
  const gatewayRuntime = describeGatewayRuntime(
    connection,
    connectionCheck.publicBaseUrl,
    connectionCheck.runtime
  );
  const runtimeStatus = connectionCheck.runtime;
  const smsChannel = workspace?.onboarding.channels.sms;
  const twilioLive = Boolean(smsChannel?.live);
  const systemSetupLocked = !connectionEditingUnlocked;
  const businessNumberLocked = twilioLive && !twilioMaintenanceUnlocked;
  const twilioSetupLocked = twilioLive && !twilioMaintenanceUnlocked;
  const twilioMaintenanceMode = twilioLive && twilioMaintenanceUnlocked;
  const configuredBusinessPhoneNumbers = buildBusinessPhoneNumbers(
    workspace?.profile.mainBusinessNumber || profileDraft.mainBusinessNumber,
    profileDraft.additionalBusinessNumbers ||
      (workspace?.profile.mainBusinessNumbers || [])
        .filter((item) => item !== (workspace?.profile.mainBusinessNumber || ''))
        .join('\n')
  );
  const mainBusinessNumberSet = Boolean(
    configuredBusinessPhoneNumbers.length
  );
  const configuredMissedCallReply =
    profileDraft.missedCallReply.trim() ||
    workspace?.profile.templates?.missedCallReply ||
    buildDefaultMissedCallReply(profileDraft.businessName, profileDraft.replyOptions);
  const currentSetupAssistKey = buildAiSetupAssistSourceKey(
    connection.tenantId,
    profileDraft,
    profileHours,
    workspace
  );
  const aiSetupAssistStale = Boolean(
    aiSetupAssist && aiSetupAssistSourceKey && aiSetupAssistSourceKey !== currentSetupAssistKey
  );
  const structuredReplyMenu = MISSED_CALL_OPTION_KEYS.map(
    (key) => profileDraft.replyOptions[key]
  );
  const suggestedReplyMenu = MISSED_CALL_OPTION_KEYS.map((key) => aiSetupAssist?.replyOptions[key]).filter(
    (item): item is MissedCallReplyOption => Boolean(item)
  );
  const clientBusinessNumbersLabel =
    configuredBusinessPhoneNumbers.length > 0
      ? configuredBusinessPhoneNumbers.join(', ')
      : 'Not set';
  const clientNumberStatusLabel =
    configuredBusinessPhoneNumbers.length > 1 ? 'Client numbers set' : 'Client number set';
  const savedBusinessLiveCount = savedBusinesses.filter((item) => item.mode === 'live').length;
  const savedBusinessTwilioReadyCount = savedBusinesses.filter((item) => item.smsLive).length;
  const savedBusinessRecoveredCalls = savedBusinesses.reduce(
    (total, item) => total + item.recoveredCalls,
    0
  );
  const savedBusinessOpenTasks = savedBusinesses.reduce(
    (total, item) => total + item.openTaskCount,
    0
  );
  const providerTone: StatusTone =
    !providerStatus
      ? 'neutral'
      : providerStatus.effective === 'gemini'
        ? 'success'
        : providerStatus.effective === 'mock'
          ? 'warning'
          : 'error';
  const modeTone = workspace?.summary.mode === 'live' ? 'success' : workspace ? 'warning' : 'neutral';
  const heroTitle = 'Plumbing AI Starter';
  const heroEyebrow = 'Starter plumbing automation';
  const essentialChecklist = workspace?.onboarding.checklist.filter((item) =>
    [
      'business_name',
      'main_business_number',
      'callback_number',
      'owner_alert_destination',
      'response_channel',
      'public_webhook',
    ].includes(item.itemId)
  );
  const missedCallActivities =
    workspace?.activity.filter(
      (item) => item.kind === 'event.processed' && item.title.toLowerCase().includes('call.missed')
    ) ?? [];
  const layoutGuide = [
    {
      step: '1',
      title: 'Open Or Create The Business',
      detail:
        'Enter the hosted gateway connection, choose the business ID, and open the workspace this add-on will use. Local install tools are only the helper path.',
    },
    {
      step: '2',
      title: 'Client Call Flow',
      detail:
        'Save the client name, the real number or numbers customers dial first, the Twilio relay number, and the text-back wording.',
    },
    {
      step: '3',
      title: 'Connect The Twilio Relay',
      detail:
        'Add the Twilio Account SID and Auth Token, then connect the hidden Twilio relay number that sends the text-back.',
    },
    {
      step: '4',
      title: 'Forward Missed Calls',
      detail:
        'Point the Twilio relay number at the ResponseOS webhook, then forward missed calls from each client-facing number into that relay line.',
    },
    {
      step: '5',
      title: 'Test A Missed Call',
      detail:
        'Trigger a safe test event before handing the add-on to a client so you know the flow is actually working.',
    },
    {
      step: 'View',
      title: 'Operating View',
      detail:
        'Watch recoveries, leads, tasks, and activity after launch. This is the part the client will care about day to day.',
    },
  ];
  const twilioRequirements = [
    'Twilio Account SID from the Twilio Console account dashboard.',
    'Twilio Auth Token from the same Twilio Console account area.',
    'One Twilio phone number with both SMS and Voice enabled to use as the hidden missed-call relay line.',
    'Access to that relay number in Twilio so you can paste the ResponseOS webhook URL into its webhook settings.',
    'Access to the client phone carrier or PBX so missed calls can forward from each real business number into the Twilio relay number.',
  ];
  const twilioTrialChecklist = [
    'Put the ResponseOS pilot website live before submitting Twilio toll-free verification.',
    'Use your real legal name in the Twilio legal entity field if you do not have an LLC or registered business yet.',
    'Remember that the Twilio trial account can only call or text verified phone numbers.',
    connectionCheck.publicBaseUrl
      ? `Twilio can use the configured public base URL: ${connectionCheck.publicBaseUrl}.`
      : 'Do not point Twilio at localhost. Set a public hostname, reverse proxy, or tunnel first.',
    'Rotate any Twilio Auth Token that was pasted into chat or exposed outside the Twilio console.',
  ];
  const clientHomeReady = Boolean(workspace?.summary.mode === 'live' && smsChannel?.live);
  const showInstallerPanels = !clientHomeReady || showSetupPanels;
  const twilioSectionTitle = twilioMaintenanceMode
    ? '3. Twilio Maintenance'
    : twilioSetupLocked
      ? '3. Twilio Live Status'
      : '3. Automation-Managed Twilio Setup';
  const twilioSectionCopy = twilioMaintenanceMode
    ? 'Re-enter Twilio credentials here when rotating the auth token, replacing the relay number, or moving the runtime.'
    : twilioSetupLocked
      ? 'Twilio is already connected for this business. Treat this section as live maintenance and verification, not setup.'
      : 'Twilio is the hidden relay line for missed calls and text-back. If this needs to change later, update the automation setup here instead of exposing vendor details to the client.';
  const twilioReferenceTitle = twilioLive ? '4. Live Twilio Reference' : '4. Twilio Copy/Paste Reference';
  const twilioSetupGuide = [
    {
      step: 'A',
      title: 'Keep the client number public',
      detail:
        'Customers keep dialing the client\'s real business number or numbers. The Twilio number stays behind the scenes as the missed-call relay line.',
    },
    {
      step: 'B',
      title: 'Forward only missed calls',
      detail:
        'On the client phone carrier or PBX, forward busy, no-answer, or missed calls from each client-facing number to the Twilio relay number.',
    },
    {
      step: 'C',
      title: 'Set inbound SMS on the relay line',
      detail:
        'In Twilio, under Messaging Configuration for the relay number, set "A message comes in" to the ResponseOS webhook URL and use POST.',
    },
    {
      step: 'D',
      title: 'Set inbound voice on the relay line',
      detail:
        'In Twilio, under Voice Configuration for the relay number, set "A call comes in" to the same ResponseOS webhook URL and use POST.',
    },
    {
      step: 'E',
      title: 'Optional direct-Twilio fallback',
      detail:
        'If a client ever uses the Twilio number as the public number instead of conditional forwarding, keep "Call status changes" on the same webhook too.',
    },
    {
      step: 'F',
      title: 'Run the first live test',
      detail:
        'Call one of the client-facing numbers from a verified phone, miss the call on purpose, then confirm the text-back, lead record, and operating dashboard update.',
    },
  ];
  const firstLiveTestChecklist = [
    'The business opens correctly in this add-on.',
    'Each client-facing number is a number customers actually dial.',
    'Twilio shows the hidden relay number with SMS and Voice enabled.',
    'Missed or no-answer calls from each client-facing number forward to the Twilio relay number.',
    'Inbound SMS webhook uses the ResponseOS URL and POST.',
    'Voice "A call comes in" on the Twilio relay number uses the same ResponseOS URL and POST.',
    'The test call is made from a verified number if the account is still trial.',
    'After the missed call, the text-back appears and the operating dashboard records the event.',
  ];
  const deploymentGuide: Array<{
    title: string;
    tone: StatusTone;
    label: string;
    detail: string;
  }> = [
    {
      title: 'Where it runs now',
      tone: gatewayRuntime.tone,
      label: gatewayRuntime.label,
      detail: gatewayRuntime.detail,
    },
    {
      title: 'Webhook reachability',
      tone: gatewayExposure.tone,
      label: gatewayExposure.label,
      detail: gatewayExposure.detail,
    },
    {
      title: 'Best next move',
      tone:
        !connectionCheck.publicBaseUrl || gatewayRuntime.label !== 'Looks hosted' ? 'warning' : 'success',
      label:
        !connectionCheck.publicBaseUrl
          ? 'Add public URL'
          : gatewayRuntime.label !== 'Looks hosted'
          ? 'Move to always-on machine'
          : 'Run the live test',
      detail:
        !connectionCheck.publicBaseUrl
          ? 'Set a public hostname, reverse proxy, or tunnel before wiring Twilio.'
          : gatewayRuntime.label !== 'Looks hosted'
          ? 'This setup still depends on the current machine staying on. Move the gateway to an always-on office machine or hosted server before relying on after-hours recovery.'
          : 'The runtime looks stable enough for a real live missed-call test once Twilio is ready.',
    },
  ];
  const handoffTaskLines = (workspace?.tasks ?? [])
    .filter((task) => task.status !== 'done')
    .slice(0, 5)
    .map((task) => `- ${task.title}: ${task.detail}`);
  const handoffSummaryText = [
    'ResponseOS Plumbing AI Starter - Handoff Notes',
    `Generated: ${new Date().toLocaleString('en-US')}`,
    '',
    `Business: ${workspace?.profile.businessName || 'Not opened yet'}`,
    `Business ID: ${connection.tenantId || 'Not set'}`,
    `Mode: ${
      workspace ? (workspace.summary.mode === 'live' ? 'Live automation' : 'Safe mode') : 'Not opened'
    }`,
    `Client-facing numbers: ${clientBusinessNumbersLabel}`,
    `Twilio relay number: ${workspace?.profile.callbackNumber || profileDraft.callbackNumber || 'Not set'}`,
    `Twilio status: ${smsChannel?.live ? 'Connected and live' : smsChannel?.detail || 'Not connected yet'}`,
    `Webhook URL: ${webhookUrl || 'Not ready yet'}`,
    `Public webhook status: ${gatewayExposure.label}`,
    `Runtime status: ${gatewayRuntime.label}`,
    `Runtime note: ${gatewayRuntime.detail}`,
    '',
    `Missed-call text reply: ${configuredMissedCallReply}`,
    '',
    'Starter plumbing flow:',
    '- 1: Opening prompt | Ask: leak, clog, water heater, or something else.',
    '- 2: Other fallback | Offer toilet, fixture, disposal, sewer, water pressure, or a custom issue description.',
    '- 3: Severity branch | Leak: constant vs sink-use only. Clog: fully blocked vs draining slowly.',
    '- 4: Urgency check | Ask whether flooding or urgent damage is happening right now.',
    '- 5: Location | Capture where the issue is happening.',
    '- 6: Customer name | Capture who the technician should call back.',
    '',
    'Daily use for the client:',
    '- Open Client Home and Operating View.',
    '- Watch recovered calls, leads, and human tasks.',
    '- Only reopen installer panels when changing setup.',
    '',
    'Before trusting after-hours recovery:',
    ...deploymentGuide.map((item) => `- ${item.title}: ${item.detail}`),
    ...firstLiveTestChecklist.map((item) => `- ${item}`),
    '',
    'Current human follow-up items:',
    ...(handoffTaskLines.length > 0 ? handoffTaskLines : ['- No open human handoff tasks right now.']),
  ].join('\n');

  return (
    <div className="app-shell">
      <div className="signal-backdrop" />
      
      <div className={`request-banner request-banner-${requestState.tone}`}>
        <strong>{requestState.busy ? 'Working:' : 'Status:'}</strong> {requestState.message}
      </div>

      <main className="layout-grid">
        {appMode === 'dashboard' && (
          <Dashboard 
            workspace={workspace}
            connectionCheck={connectionCheck}
            onOpenSetup={() => setAppMode('setup')}
            onOpenOperating={() => setAppMode('operations')}
            onOpenDemo={() => setAppMode('demo')}
          />
        )}

        {appMode === 'setup' && (
          <OnboardingWizard 
            profileDraft={profileDraft}
            onProfileChange={setProfileDraft}
            profileHours={profileHours}
            onProfileHoursChange={setProfileHours}
            twilioDraft={twilioDraft}
            onTwilioChange={setTwilioDraft}
            workspace={workspace}
            requestState={requestState}
            validation={validation}
            onAutoFill={handleAutoFillFromWebsite}
            onGenerateAi={handleGenerateAiSuggestions}
            onApplyAi={handleApplyAiSuggestions}
            onSaveBusiness={handleSaveBusiness}
            onValidateTwilio={handleValidateTwilio}
            onBootstrapTwilio={handleConnectTwilio}
            connection={connection}
            twilioLive={twilioLive}
            twilioSetupLocked={twilioSetupLocked}
            twilioMaintenanceMode={twilioMaintenanceMode}
            twilioSectionTitle={twilioSectionTitle}
            twilioSectionCopy={twilioSectionCopy}
            onCopyWebhook={handleCopyWebhook}
            onSendTestMissedCall={handleSendTestMissedCall}
            setTwilioMaintenanceUnlocked={setTwilioMaintenanceUnlocked}
            setValidation={setValidation}
            webhookUrl={webhookUrl}
            twilioRequirements={twilioRequirements}
            twilioSetupGuide={twilioSetupGuide}
            twilioTrialChecklist={twilioTrialChecklist}
            firstLiveTestChecklist={firstLiveTestChecklist}
          />
        )}

        {appMode === 'operations' && (
          <OperatingView
            workspace={workspace}
            missedCallActivities={workspace?.activity ?? []}
            starterFlowSteps={[
              {
                key: '1',
                title: 'Opening prompt',
                detail: 'Ask what is going on: leak, clog, water heater, or something else.',
              },
              {
                key: '2',
                title: 'Other fallback',
                detail: 'If they pick other, offer toilet, fixture, disposal, sewer, water pressure, or a custom issue description.',
              },
              {
                key: '3',
                title: 'Severity branch',
                detail: 'Leaks ask constant vs sink-use only. Clogs ask fully blocked vs draining slowly.',
              },
              {
                key: '4',
                title: 'Urgency check',
                detail: 'Ask if the issue is causing flooding or urgent damage right now.',
              },
              { key: '5', title: 'Location', detail: 'Capture where the issue is happening.' },
              { key: '6', title: 'Customer name', detail: 'Capture who the technician should call back.' },
            ]}
            busy={requestState.busy}
            onRunDueFollowups={handleRunDueFollowups}
            onCompleteTask={handleCompleteTask}
            onCompleteFollowup={handleCompleteFollowup}
          />
        )}

        {appMode === 'demo' && (
          <SalesDemoView
            connection={connection}
            workspace={workspace}
            profileBusinessName={profileDraft.businessName}
            automationTier={profileDraft.automationTier}
            onLoadDemo={() => {
              void handleUseDemo();
            }}
            onOpenSetup={() => setAppMode('setup')}
          />
        )}
      </main>

      <div className="setup-actions-fixed">
        <div className="setup-actions-nav">
          <button 
            className={`action-button ${appMode === 'dashboard' ? 'primary' : ''}`}
            onClick={() => setAppMode('dashboard')}
          >
            Dashboard
          </button>
          <button 
            className={`action-button ${appMode === 'demo' ? 'primary' : ''}`}
            onClick={() => setAppMode('demo')}
          >
            Demo
          </button>
          <button 
            className={`action-button ${appMode === 'setup' ? 'primary' : ''}`}
            onClick={() => setAppMode('setup')}
          >
            Setup
          </button>
          <button 
            className={`action-button ${appMode === 'operations' ? 'primary' : ''}`}
            onClick={() => setAppMode('operations')}
          >
            Operations
          </button>
        </div>
        <SystemStatus 
          connection={connection} 
          twilioReady={Boolean(workspace?.onboarding.channels.sms.live)}
          appId={connection.appId}
        />
      </div>
    </div>
  );
}

function requireConnectionFields(connection: ConnectionState, includeTenantId: boolean) {
  if (!connection.gatewayUrl.trim()) {
    throw new Error('Gateway URL is required.');
  }
  if (!connection.apiKey.trim()) {
    throw new Error('Access key is required.');
  }
  if (!connection.appId.trim()) {
    throw new Error('Workspace app ID is required.');
  }
  if (includeTenantId && !connection.tenantId.trim()) {
    throw new Error('Business ID is required.');
  }
}

function defaultSettings() {
  return {
    websiteUrl: '',
    bookingLink: '',
    reviewUrl: '',
    ownerAlertDestination: '',
    contactEmail: '',
    automation: {
      tier: 'starter',
      mode: 'hybrid',
      vertical: 'plumbing',
      maxRequestsPerDay: 75,
      requestsUsedToday: 0,
      requestsUsedOn: undefined,
      fallbackOnFailure: true,
      implementationStatus: 'starter_ready',
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
  };
}

function buildAiSetupAssistSourceKey(
  tenantId: string,
  profileDraft: ProfileDraft,
  profileHours: BusinessHoursSchedule | undefined,
  workspace: RevenueWorkspace | null
) {
  return JSON.stringify({
    tenantId: tenantId.trim(),
    businessName: profileDraft.businessName.trim(),
    mainBusinessNumber: profileDraft.mainBusinessNumber.trim(),
    additionalBusinessNumbers: splitPhoneList(profileDraft.additionalBusinessNumbers),
    callbackNumber: profileDraft.callbackNumber.trim(),
    timezone: profileDraft.timezone.trim(),
    services: splitCsv(profileDraft.services),
    serviceArea: profileDraft.serviceArea.trim(),
    websiteUrl: profileDraft.websiteUrl.trim(),
    ownerAlertDestination: profileDraft.ownerAlertDestination.trim(),
    contactEmail: profileDraft.contactEmail.trim(),
    bookingLink: profileDraft.bookingLink.trim(),
    reviewUrl: profileDraft.reviewUrl.trim(),
    automationTier: profileDraft.automationTier,
    automationMode: profileDraft.automationMode,
    automationVertical: profileDraft.automationVertical,
    maxRequestsPerDay: profileDraft.maxRequestsPerDay,
    fallbackOnFailure: profileDraft.fallbackOnFailure,
    hours: profileHours ?? workspace?.profile.hours ?? null,
    emergencyPolicy: workspace?.profile.emergencyPolicy ?? null,
  });
}

function truncateText(value: string, maxLength: number) {
  const normalized = value.trim();
  if (normalized.length <= maxLength) {
    return normalized;
  }
  return `${normalized.slice(0, Math.max(0, maxLength - 3)).trimEnd()}...`;
}

import {
  startTransition,
  useDeferredValue,
  useEffect,
  useState,
  type Dispatch,
  type FormEvent,
  type ReactNode,
  type SetStateAction,
} from 'react';

import { MetricCard } from './components';
import { formatDate, profileDraftFromWorkspace, splitCsv, updateDraft } from './helpers';
import { CLIENT_PRESETS, type ClientPreset } from './presets';
import {
  type BusinessHoursSchedule,
  CALENDAR_PROVIDER_OPTIONS,
  CONNECTION_PROFILES_STORAGE_KEY,
  CONNECTION_STORAGE_KEY,
  DEFAULT_CONNECTOR_BOOTSTRAP_DRAFT,
  DEFAULT_CONNECTION,
  DEFAULT_EVENT_DRAFT,
  DEFAULT_LEAD_DRAFT,
  DEFAULT_PROFILE_DRAFT,
  EMAIL_PROVIDER_OPTIONS,
  LEAD_STAGES,
  SMS_PROVIDER_OPTIONS,
  type ConnectionCheck,
  type ConnectionState,
  type ConnectorBootstrapDraft,
  type EventDraft,
  type GatewayConnector,
  type GatewayRuntimeStatus,
  type LeadDraft,
  type OnboardingPacket,
  type ProfileDraft,
  type RequestState,
  type RevenueTask,
  type RevenueWorkspace,
  type SavedClientProfile,
  type WebsiteDiscoveryResult,
} from './types';

type StatusTone = 'neutral' | 'success' | 'warning' | 'error';

type ChannelStatus = {
  title: string;
  tone: StatusTone;
  label: string;
  detail: string;
};

type ReadinessItem = {
  title: string;
  tone: StatusTone;
  label: string;
  note: string;
  ready: boolean;
};

type GuidedStep = {
  title: string;
  tone: StatusTone;
  label: string;
  note: string;
};

type WizardStepId = 'open' | 'basics' | 'channels' | 'go-live';

type WizardStep = {
  id: WizardStepId;
  title: string;
  tone: StatusTone;
  label: string;
  note: string;
};

type WizardContextItem = {
  title: string;
  detail: string;
};

type WorkspaceLoadStep = WizardStepId | 'auto' | 'opened-client';

type ValidationKey = 'twilio' | 'resend' | 'calendar';

type ValidationState = {
  status: 'idle' | 'validating' | 'success' | 'error';
  message: string;
  checkedAt?: string;
};

const DEFAULT_VALIDATION_STATE: Record<ValidationKey, ValidationState> = {
  twilio: { status: 'idle', message: 'Not validated yet.' },
  resend: { status: 'idle', message: 'Not validated yet.' },
  calendar: { status: 'idle', message: 'Not validated yet.' },
};

export default function App() {
  const [connection, setConnection] = useState<ConnectionState>(DEFAULT_CONNECTION);
  const [workspace, setWorkspace] = useState<RevenueWorkspace | null>(null);
  const [connectors, setConnectors] = useState<GatewayConnector[]>([]);
  const [savedClients, setSavedClients] = useState<SavedClientProfile[]>([]);
  const [connectionCheck, setConnectionCheck] = useState<ConnectionCheck>({ status: 'idle' });
  const [validationState, setValidationState] = useState<Record<ValidationKey, ValidationState>>(
    DEFAULT_VALIDATION_STATE
  );
  const [packetText, setPacketText] = useState('');
  const [profileDraft, setProfileDraft] = useState<ProfileDraft>(DEFAULT_PROFILE_DRAFT);
  const [connectorDraft, setConnectorDraft] = useState<ConnectorBootstrapDraft>(
    DEFAULT_CONNECTOR_BOOTSTRAP_DRAFT
  );
  const [leadDraft, setLeadDraft] = useState<LeadDraft>(DEFAULT_LEAD_DRAFT);
  const [eventDraft, setEventDraft] = useState<EventDraft>(DEFAULT_EVENT_DRAFT);
  const [requestState, setRequestState] = useState<RequestState>({
    busy: false,
    message: 'Ready.',
    tone: 'neutral',
  });
  const [profileHours, setProfileHours] = useState<BusinessHoursSchedule | undefined>(undefined);
  const [discoveryResult, setDiscoveryResult] = useState<WebsiteDiscoveryResult | null>(null);
  const [wizardStep, setWizardStep] = useState<WizardStepId>('open');
  const [connectionHydrated, setConnectionHydrated] = useState(false);
  const [savedClientsHydrated, setSavedClientsHydrated] = useState(false);
  const [startupAutoOpenAttempted, setStartupAutoOpenAttempted] = useState(false);
  const [leadSearch, setLeadSearch] = useState('');
  const deferredLeadSearch = useDeferredValue(leadSearch);

  useEffect(() => {
    const raw = window.localStorage.getItem(CONNECTION_STORAGE_KEY);
    if (!raw) {
      setConnectionHydrated(true);
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
      setConnectionHydrated(true);
    }
  }, []);

  useEffect(() => {
    const raw = window.localStorage.getItem(CONNECTION_PROFILES_STORAGE_KEY);
    if (!raw) {
      setSavedClientsHydrated(true);
      return;
    }
    try {
      const parsed = JSON.parse(raw) as SavedClientProfile[];
      if (Array.isArray(parsed)) {
        setSavedClients(parsed);
      }
    } catch {
      window.localStorage.removeItem(CONNECTION_PROFILES_STORAGE_KEY);
    } finally {
      setSavedClientsHydrated(true);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(CONNECTION_STORAGE_KEY, JSON.stringify(connection));
  }, [connection]);

  useEffect(() => {
    window.localStorage.setItem(CONNECTION_PROFILES_STORAGE_KEY, JSON.stringify(savedClients));
  }, [savedClients]);

  useEffect(() => {
    if (!workspace || !connection.apiKey || !connection.appId) return;
    const id = window.setInterval(() => {
      void loadWorkspace(false);
    }, 20000);
    return () => window.clearInterval(id);
  }, [workspace, connection.apiKey, connection.appId, connection.gatewayUrl, connection.tenantId]);

  useEffect(() => {
    if (!connectionHydrated || !savedClientsHydrated || startupAutoOpenAttempted || workspace) {
      return;
    }

    setStartupAutoOpenAttempted(true);
    void attemptStartupOpen();
  }, [
    connectionHydrated,
    savedClientsHydrated,
    startupAutoOpenAttempted,
    workspace,
    savedClients,
    connection,
  ]);

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
      ok: boolean;
      service?: string;
      publicBaseUrl?: string | null;
      automation?: {
        followupRunnerEnabled?: boolean;
        followupRunnerIntervalMs?: number;
        followupRunnerLimitPerTenant?: number;
      };
    };
    if (!healthJson.ok) {
      throw new Error('Gateway health check did not return ok.');
    }

    const providerJson = await apiRequest<{
      effective_provider: string;
      privacy_mode: boolean;
      allow_external_providers: boolean;
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
      provider: providerJson,
      runtime: runtimeJson.runtime,
    };
  }

  async function handleTestConnection(targetConnection: ConnectionState = connection) {
    setRequestState({ busy: true, message: 'Testing gateway and client access...', tone: 'neutral' });
    try {
      const checked = await verifyConnection(targetConnection);
      setConnectionCheck({
        status: 'connected',
        checkedAt: new Date().toISOString(),
        gatewayMessage: checked.health.service || 'Gateway reachable',
        provider: checked.provider.effective_provider,
        privacyMode: checked.provider.privacy_mode,
        allowExternalProviders: checked.provider.allow_external_providers,
        followupRunnerEnabled: checked.runtime.automation.followupRunnerEnabled,
        followupRunnerIntervalMs: checked.runtime.automation.followupRunnerIntervalMs,
        followupRunnerLimitPerTenant: checked.runtime.automation.followupRunnerLimitPerTenant,
        publicBaseUrl: checked.runtime.publicBaseUrl ?? checked.health.publicBaseUrl ?? undefined,
        runtime: checked.runtime,
      });
      setRequestState({
        busy: false,
        message: `Gateway reachable and API key accepted for ${targetConnection.appId}.`,
        tone: 'success',
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Connection test failed.';
      setConnectionCheck({
        status: 'error',
        checkedAt: new Date().toISOString(),
        gatewayMessage: message,
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
    nextStep?: WorkspaceLoadStep
  ) {
    setRequestState({ busy: true, message: 'Opening client workspace...', tone: 'neutral' });
    try {
      requireConnectionFields(targetConnection, true);
      const checked = await verifyConnection(targetConnection);
      const [workspaceResponse, connectorResponse] = await Promise.all([
        apiRequest<{ workspace: RevenueWorkspace }>(
          `/v1/revenue/workspace?app_id=${encodeURIComponent(targetConnection.appId)}&tenant_id=${encodeURIComponent(targetConnection.tenantId)}`,
          undefined,
          targetConnection
        ),
        apiRequest<{ connectors: GatewayConnector[] }>(
          `/v1/connectors?app_id=${encodeURIComponent(targetConnection.appId)}`,
          undefined,
          targetConnection
        ),
      ]);
      const syncedProfile = syncForms
        ? profileDraftFromWorkspace(workspaceResponse.workspace)
        : profileDraft;
      const resolvedWizardStep =
        nextStep === 'auto'
          ? suggestWizardStep({
              workspace: workspaceResponse.workspace,
              profileDraft: syncedProfile,
            })
          : nextStep === 'opened-client'
          ? landingStepForOpenedClient({
              workspace: workspaceResponse.workspace,
              profileDraft: syncedProfile,
            })
          : nextStep ?? (syncForms ? suggestWizardStep({
              workspace: workspaceResponse.workspace,
              profileDraft: syncedProfile,
            }) : wizardStep);
      startTransition(() => {
        setConnection(targetConnection);
        setWorkspace(workspaceResponse.workspace);
        setConnectors(connectorResponse.connectors);
        if (syncForms) {
          setProfileDraft(syncedProfile);
          setProfileHours(workspaceResponse.workspace.profile.hours);
          setDiscoveryResult(null);
        }
        setWizardStep(resolvedWizardStep);
      });
      setConnectionCheck({
        status: 'connected',
        checkedAt: new Date().toISOString(),
        gatewayMessage: checked.health.service || 'Gateway reachable',
        provider: checked.provider.effective_provider,
        privacyMode: checked.provider.privacy_mode,
        allowExternalProviders: checked.provider.allow_external_providers,
        followupRunnerEnabled: checked.runtime.automation.followupRunnerEnabled,
        followupRunnerIntervalMs: checked.runtime.automation.followupRunnerIntervalMs,
        followupRunnerLimitPerTenant: checked.runtime.automation.followupRunnerLimitPerTenant,
        publicBaseUrl: checked.runtime.publicBaseUrl ?? checked.health.publicBaseUrl ?? undefined,
        runtime: checked.runtime,
      });
      rememberClient(
        targetConnection,
        workspaceResponse.workspace.profile.businessName || targetConnection.tenantId
      );
      setRequestState({
        busy: false,
        message: `Loaded workspace for ${workspaceResponse.workspace.profile.businessName || workspaceResponse.workspace.tenantId}.`,
        tone: 'success',
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load workspace.';
      setConnectionCheck({
        status: 'error',
        checkedAt: new Date().toISOString(),
        gatewayMessage: message,
        runtime: undefined,
      });
      setRequestState({
        busy: false,
        message,
        tone: 'error',
      });
    }
  }

  function rememberClient(targetConnection: ConnectionState, label: string) {
    setSavedClients((current) =>
      upsertSavedClient(current, createSavedClientProfile(targetConnection, label))
    );
  }

  function handleRememberCurrentClient() {
    rememberClient(connection, resolveClientLabel(connection, workspace));
    setRequestState({
      busy: false,
      message: `Saved ${resolveClientLabel(connection, workspace)} for quick access.`,
      tone: 'success',
    });
  }

  async function handleUseDemoConnection() {
    setRequestState({
      busy: true,
      message: 'Loading the local demo profile...',
      tone: 'neutral',
    });
    try {
      const targetConnection = await resolveLocalConnectionTarget(
        buildPreviewDemoConnection(connection)
      );
      setConnection(targetConnection);
      setWorkspace(null);
      setConnectors([]);
      setProfileHours(undefined);
      setDiscoveryResult(null);
      setWizardStep('open');
      setConnectionCheck({
        status: 'idle',
        gatewayMessage: 'Demo profile loaded. Open the client to jump into the sample business.',
      });
      setRequestState({
        busy: false,
        message: 'Demo profile loaded into the form.',
        tone: 'neutral',
      });
    } catch (error) {
      setRequestState({
        busy: false,
        message: error instanceof Error ? error.message : 'Could not load the demo profile.',
        tone: 'error',
      });
    }
  }

  function handleOpenSavedClient(client: SavedClientProfile) {
    void loadWorkspace(true, toConnectionState(client), 'opened-client');
  }

  function handleRemoveSavedClient(clientId: string) {
    setSavedClients((current) => current.filter((item) => item.id !== clientId));
    setRequestState({
      busy: false,
      message: 'Saved client removed.',
      tone: 'neutral',
    });
  }

  async function handleExportPacket() {
    setRequestState({ busy: true, message: 'Exporting onboarding packet...', tone: 'neutral' });
    try {
      const response = await apiRequest<{ packet: OnboardingPacket }>(
        `/v1/revenue/onboarding-packet?app_id=${encodeURIComponent(connection.appId)}&tenant_id=${encodeURIComponent(connection.tenantId)}`
      );
      setPacketText(JSON.stringify(response.packet, null, 2));
      setRequestState({
        busy: false,
        message: `Exported onboarding packet for ${response.packet.tenantId}.`,
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
    setRequestState({ busy: true, message: 'Importing onboarding packet...', tone: 'neutral' });
    try {
      const parsed = JSON.parse(packetText) as OnboardingPacket;
      await apiRequest('/v1/revenue/onboarding-packet/import', {
        method: 'POST',
        body: JSON.stringify({
          app_id: connection.appId,
          tenant_id: connection.tenantId,
          packet: parsed,
        }),
      });
      await loadWorkspace(true, connection, 'opened-client');
      setRequestState({
        busy: false,
        message: `Imported onboarding packet into ${connection.tenantId}.`,
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

  async function handleTaskStatus(taskId: string, status: string) {
    setRequestState({ busy: true, message: `Updating task to ${status}...`, tone: 'neutral' });
    try {
      await apiRequest('/v1/revenue/tasks/status', {
        method: 'POST',
        body: JSON.stringify({
          app_id: connection.appId,
          tenant_id: connection.tenantId,
          task_id: taskId,
          status,
        }),
      });
      await loadWorkspace(false);
      setRequestState({
        busy: false,
        message: 'Task updated.',
        tone: 'success',
      });
    } catch (error) {
      setRequestState({
        busy: false,
        message: error instanceof Error ? error.message : 'Task update failed.',
        tone: 'error',
      });
    }
  }

  async function resolveLocalConnectionTarget(baseConnection: ConnectionState) {
    const detected = await detectGatewayCandidate(baseConnection.gatewayUrl);
    return {
      ...baseConnection,
      gatewayUrl: detected?.candidate || baseConnection.gatewayUrl,
    };
  }

  async function attemptStartupOpen() {
    const preferredClient = savedClients[0];
    const attempts = [
      preferredClient ? toConnectionState(preferredClient) : null,
      !isStarterConnection(connection) &&
      connection.gatewayUrl.trim() &&
      connection.apiKey.trim() &&
      connection.appId.trim()
        ? connection
        : null,
    ].filter((item): item is ConnectionState => Boolean(item));

    if (attempts.length === 0) {
      setConnectionCheck({
        status: 'idle',
        checkedAt: new Date().toISOString(),
        gatewayMessage: 'Enter the hosted gateway details or use the local install helper to continue.',
      });
      setRequestState({
        busy: false,
        message: 'No saved hosted client opened automatically. Enter the gateway URL and access key, or use the local install helper below.',
        tone: 'neutral',
      });
      return;
    }

    setRequestState({
      busy: true,
      message: 'Opening the saved or hosted client workspace...',
      tone: 'neutral',
    });

    for (const attempt of attempts) {
      try {
        const targetConnection = await resolveLocalConnectionTarget(attempt);
        await loadWorkspace(true, targetConnection, 'opened-client');
        return;
      } catch {
        // Try the next startup candidate before showing the setup screen.
      }
    }

    setConnectionCheck({
      status: 'idle',
      checkedAt: new Date().toISOString(),
      gatewayMessage: 'Automatic open did not find a ready hosted or saved client yet.',
    });
    setRequestState({
      busy: false,
      message: 'Could not open a saved client automatically. Enter the hosted gateway details, or use the local install helper below.',
      tone: 'neutral',
    });
  }

  async function handleDetectGateway() {
    setRequestState({ busy: true, message: 'Scanning for a local gateway...', tone: 'neutral' });
    const detected = await detectGatewayCandidate(connection.gatewayUrl);
    if (detected) {
      setConnection((current) => ({
        ...current,
        gatewayUrl: detected.candidate,
      }));
      setConnectionCheck({
        status: 'connected',
        checkedAt: new Date().toISOString(),
        gatewayMessage: `${detected.service || 'Gateway'} detected at ${detected.candidate}.`,
      });
      setRequestState({
        busy: false,
        message: `Detected gateway at ${detected.candidate}.`,
        tone: 'success',
      });
      return;
    }

    setConnectionCheck({
      status: 'error',
      checkedAt: new Date().toISOString(),
      gatewayMessage: 'No local gateway responded on the common ports.',
    });
    setRequestState({
      busy: false,
      message: 'No local gateway responded on the common ports.',
      tone: 'error',
    });
  }

  async function handleOpenLocalWorkspace() {
    setRequestState({
      busy: true,
      message: 'Looking for a local ResponseOS install on this computer...',
      tone: 'neutral',
    });
    try {
      const targetConnection = await resolveLocalConnectionTarget(connection);
      await loadWorkspace(true, targetConnection, 'opened-client');
    } catch (error) {
      setRequestState({
        busy: false,
        message: error instanceof Error ? error.message : 'Could not open the local workspace.',
        tone: 'error',
      });
    }
  }

  function handleApplyPreset(preset: ClientPreset) {
    setProfileDraft((current) => ({
      ...current,
      businessName:
        current.businessName.trim() || `${preset.label} Client`,
      services: preset.services.join(', '),
    }));
    setConnection((current) => ({
      ...current,
      tenantId:
        !current.tenantId.trim() || current.tenantId.trim() === 'default'
          ? preset.tenantId
          : current.tenantId,
    }));
    setRequestState({
      busy: false,
      message: `${preset.label} preset applied. Review business details and live channels next.`,
      tone: 'success',
    });
  }

  function buildConnectorRequest(kind: ValidationKey) {
    return kind === 'twilio'
      ? {
          app_id: connection.appId,
          tenant_id: connection.tenantId,
          channel: 'sms',
          provider: 'twilio',
          config: {
            connector_id: connectorDraft.twilioConnectorId,
            account_sid: connectorDraft.twilioAccountSid,
            auth_token: connectorDraft.twilioAuthToken,
            base_url: connectorDraft.twilioBaseUrl,
          },
        }
      : kind === 'resend'
      ? {
          app_id: connection.appId,
          tenant_id: connection.tenantId,
          channel: 'email',
          provider: 'resend',
          config: {
            connector_id: connectorDraft.resendConnectorId,
            api_key: connectorDraft.resendApiKey,
            base_url: connectorDraft.resendBaseUrl,
            from_email: connectorDraft.resendFromEmail,
            from_name: connectorDraft.resendFromName,
          },
        }
      : {
          app_id: connection.appId,
          tenant_id: connection.tenantId,
          channel: 'calendar',
          provider: 'generic-json',
          config: {
            connector_id: connectorDraft.calendarConnectorId,
            base_url: connectorDraft.calendarBaseUrl,
            path: connectorDraft.calendarPath,
            calendar_id: connectorDraft.calendarId,
            auth: buildCalendarAuth(connectorDraft),
          },
        };
  }

  async function handleValidateConnector(kind: ValidationKey) {
    const messages = {
      twilio: 'Validating Twilio credentials...',
      resend: 'Validating Resend credentials...',
      calendar: 'Validating calendar connector...',
    };

    setValidationState((current) => ({
      ...current,
      [kind]: {
        status: 'validating',
        message: messages[kind],
      },
    }));
    setRequestState({ busy: true, message: messages[kind], tone: 'neutral' });

    try {
      const response = await apiRequest<{
        result: { valid: boolean; message: string; sample?: unknown };
      }>('/v1/revenue/connectors/validate', {
        method: 'POST',
        body: JSON.stringify(buildConnectorRequest(kind)),
      });
      const status = response.result.valid ? 'success' : 'error';
      setValidationState((current) => ({
        ...current,
        [kind]: {
          status,
          message: response.result.message,
          checkedAt: new Date().toISOString(),
        },
      }));
      setRequestState({
        busy: false,
        message: response.result.message,
        tone: response.result.valid ? 'success' : 'error',
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Validation failed.';
      setValidationState((current) => ({
        ...current,
        [kind]: {
          status: 'error',
          message,
          checkedAt: new Date().toISOString(),
        },
      }));
      setRequestState({
        busy: false,
        message,
        tone: 'error',
      });
    }
  }

  async function handleBootstrapConnector(kind: 'twilio' | 'resend' | 'calendar') {
    const messages = {
      twilio: 'Bootstrapping Twilio SMS connector...',
      resend: 'Bootstrapping Resend email connector...',
      calendar: 'Bootstrapping calendar connector...',
    };

    setRequestState({ busy: true, message: messages[kind], tone: 'neutral' });
    try {
      const response = await apiRequest<{ result: { summary: string } }>('/v1/revenue/connectors/bootstrap', {
        method: 'POST',
        body: JSON.stringify(buildConnectorRequest(kind)),
      });
      setConnectorDraft((current) => resetConnectorDraft(current, kind));
      setValidationState((current) => ({
        ...current,
        [kind]: {
          status: 'success',
          message: response.result.summary,
          checkedAt: new Date().toISOString(),
        },
      }));
      await loadWorkspace(true, connection, 'channels');
      setRequestState({
        busy: false,
        message: response.result.summary,
        tone: 'success',
      });
    } catch (error) {
      setRequestState({
        busy: false,
        message: error instanceof Error ? error.message : 'Connector bootstrap failed.',
        tone: 'error',
      });
    }
  }

  async function discoverWebsiteSetup(targetDraft: ProfileDraft) {
    requireConnectionFields(connection, false);
    const websiteUrl = targetDraft.websiteUrl.trim();
    if (!websiteUrl) {
      throw new Error('Add the business website URL first.');
    }

    const response = await apiRequest<{ result: WebsiteDiscoveryResult }>('/v1/revenue/discovery/website', {
      method: 'POST',
      body: JSON.stringify({
        app_id: connection.appId,
        website_url: websiteUrl,
        business_name: targetDraft.businessName.trim() || undefined,
        callback_number: targetDraft.callbackNumber.trim() || undefined,
      }),
    });
    return response.result;
  }

  async function handleAutoFillFromWebsite() {
    setRequestState({ busy: true, message: 'Scanning the business website...', tone: 'neutral' });
    try {
      const result = await discoverWebsiteSetup(profileDraft);
      const nextDraft = mergeDiscoveryIntoDraft(profileDraft, result);
      setProfileDraft(nextDraft);
      setProfileHours((current) => mergeDiscoveryHours(current, result));
      setDiscoveryResult(result);
      setRequestState({
        busy: false,
        message: buildDiscoveryMessage(result),
        tone: 'success',
      });
    } catch (error) {
      setRequestState({
        busy: false,
        message: error instanceof Error ? error.message : 'Website auto-fill failed.',
        tone: 'error',
      });
    }
  }

  async function handleSaveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setRequestState({ busy: true, message: 'Saving onboarding settings...', tone: 'neutral' });
    try {
      let resolvedProfileDraft = profileDraft;
      let resolvedProfileHours = profileHours;
      let discoveryNote = '';

      if (profileDraft.websiteUrl.trim()) {
        try {
          const discovery = await discoverWebsiteSetup(profileDraft);
          resolvedProfileDraft = mergeDiscoveryIntoDraft(profileDraft, discovery);
          resolvedProfileHours = mergeDiscoveryHours(profileHours, discovery);
          setProfileDraft(resolvedProfileDraft);
          setProfileHours(resolvedProfileHours);
          setDiscoveryResult(discovery);
          discoveryNote = ` ${buildDiscoveryMessage(discovery)}`;
        } catch (error) {
          discoveryNote = ` Saved without website auto-fill: ${
            error instanceof Error ? error.message : 'website discovery failed.'
          }`;
        }
      }

      const resolvedTenantId =
        connection.tenantId.trim() && connection.tenantId.trim() !== 'default'
          ? connection.tenantId.trim()
          : slugFromBusinessName(resolvedProfileDraft.businessName) || connection.tenantId.trim() || 'default';
      if (resolvedTenantId !== connection.tenantId) {
        setConnection((current) => ({
          ...current,
          tenantId: resolvedTenantId,
        }));
      }
      await apiRequest('/v1/revenue/profile', {
        method: 'PUT',
        body: JSON.stringify({
          app_id: connection.appId,
          tenant_id: resolvedTenantId,
          profile: {
            businessName: resolvedProfileDraft.businessName,
            callbackNumber: resolvedProfileDraft.callbackNumber,
            timezone: resolvedProfileDraft.timezone,
            services:
              splitCsv(resolvedProfileDraft.services).length > 0
                ? splitCsv(resolvedProfileDraft.services)
                : ['general service'],
            serviceArea: resolvedProfileDraft.serviceArea,
            hours: resolvedProfileHours,
          },
          settings: {
            websiteUrl: resolvedProfileDraft.websiteUrl,
            bookingLink: resolvedProfileDraft.bookingLink,
            reviewUrl: resolvedProfileDraft.reviewUrl,
            ownerAlertDestination: resolvedProfileDraft.ownerAlertDestination,
            contactEmail: resolvedProfileDraft.contactEmail,
            sms: {
              provider: resolvedProfileDraft.smsProvider,
              connectorId: resolvedProfileDraft.smsConnectorId,
              path: resolvedProfileDraft.smsPath,
            },
            email: {
              provider: resolvedProfileDraft.emailProvider,
              connectorId: resolvedProfileDraft.emailConnectorId,
              path: resolvedProfileDraft.emailPath,
              fromEmail: resolvedProfileDraft.emailFromEmail,
              fromName: resolvedProfileDraft.emailFromName,
            },
            calendar: {
              provider: resolvedProfileDraft.calendarProvider,
              connectorId: resolvedProfileDraft.calendarConnectorId,
              path: resolvedProfileDraft.calendarPath,
              calendarId: resolvedProfileDraft.calendarId,
            },
          },
        }),
      });
      await loadWorkspace(true, {
        ...connection,
        tenantId: resolvedTenantId,
      }, wizardStep);
      setRequestState({
        busy: false,
        message: `Business setup saved.${discoveryNote}`,
        tone: 'success',
      });
    } catch (error) {
      setRequestState({
        busy: false,
        message: error instanceof Error ? error.message : 'Profile save failed.',
        tone: 'error',
      });
    }
  }

  async function handleLeadSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setRequestState({ busy: true, message: 'Submitting lead intake...', tone: 'neutral' });
    try {
      const result = await apiRequest<{ result: { status: string; warnings: string[] } }>('/v1/revenue/intake', {
        method: 'POST',
        body: JSON.stringify({
          app_id: connection.appId,
          tenant_id: connection.tenantId,
          lead: {
            name: leadDraft.name,
            phone: leadDraft.phone,
            email: leadDraft.email,
            service_requested: leadDraft.serviceRequested,
            location: leadDraft.location,
            source: leadDraft.source,
          },
        }),
      });
      setLeadDraft(DEFAULT_LEAD_DRAFT);
      await loadWorkspace(false);
      setRequestState({
        busy: false,
        message:
          result.result.status === 'accepted'
            ? 'Lead intake accepted.'
            : `Lead intake returned ${result.result.status}. ${result.result.warnings.join(' ')}`,
        tone: result.result.status === 'accepted' ? 'success' : 'error',
      });
    } catch (error) {
      setRequestState({
        busy: false,
        message: error instanceof Error ? error.message : 'Lead intake failed.',
        tone: 'error',
      });
    }
  }

  async function handleEventSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setRequestState({ busy: true, message: 'Dispatching automation event...', tone: 'neutral' });
    try {
      const payload =
        eventDraft.type === 'call.missed'
          ? {
              type: eventDraft.type,
              fromNumber: eventDraft.fromNumber,
              toNumber: eventDraft.toNumber,
              callSid: eventDraft.callSid || `CA_${Date.now().toString(36)}`,
            }
          : eventDraft.type === 'sms.received'
          ? {
              type: eventDraft.type,
              fromNumber: eventDraft.fromNumber,
              toNumber: eventDraft.toNumber,
              body: eventDraft.body,
            }
          : {
              type: eventDraft.type,
              leadId: eventDraft.leadId,
              leadPhone: eventDraft.leadPhone,
              leadStatus: eventDraft.leadStatus,
              reviewUrl: eventDraft.reviewUrl || profileDraft.reviewUrl,
            };

      const result = await apiRequest<{ result: { patch: { summary: string } } }>('/v1/revenue/events', {
        method: 'POST',
        body: JSON.stringify({
          app_id: connection.appId,
          tenant_id: connection.tenantId,
          event: payload,
        }),
      });
      await loadWorkspace(false);
      setRequestState({ busy: false, message: result.result.patch.summary, tone: 'success' });
    } catch (error) {
      setRequestState({
        busy: false,
        message: error instanceof Error ? error.message : 'Event dispatch failed.',
        tone: 'error',
      });
    }
  }

  async function handleLeadStageChange(leadId: string, stage: string) {
    setRequestState({ busy: true, message: `Updating lead stage to ${stage}...`, tone: 'neutral' });
    try {
      await apiRequest('/v1/revenue/leads/stage', {
        method: 'POST',
        body: JSON.stringify({
          app_id: connection.appId,
          tenant_id: connection.tenantId,
          lead_id: leadId,
          stage,
        }),
      });
      await loadWorkspace(false);
      setRequestState({ busy: false, message: 'Lead stage updated.', tone: 'success' });
    } catch (error) {
      setRequestState({
        busy: false,
        message: error instanceof Error ? error.message : 'Lead update failed.',
        tone: 'error',
      });
    }
  }

  async function handleRunDueFollowups() {
    setRequestState({ busy: true, message: 'Running due follow-ups...', tone: 'neutral' });
    try {
      const result = await apiRequest<{ result: { processed: number } }>('/v1/revenue/followups/run-due', {
        method: 'POST',
        body: JSON.stringify({
          app_id: connection.appId,
          tenant_id: connection.tenantId,
        }),
      });
      await loadWorkspace(false);
      setRequestState({
        busy: false,
        message: `Processed ${result.result.processed} follow-up item(s).`,
        tone: 'success',
      });
    } catch (error) {
      setRequestState({
        busy: false,
        message: error instanceof Error ? error.message : 'Follow-up run failed.',
        tone: 'error',
      });
    }
  }

  const filteredLeads = (workspace?.leads ?? []).filter((lead) => {
    if (!deferredLeadSearch.trim()) return true;
    const haystack = [
      lead.name,
      lead.phone,
      lead.email,
      lead.address,
      lead.serviceCategory,
      lead.stage,
      lead.tags.join(' '),
    ]
      .join(' ')
      .toLowerCase();
    return haystack.includes(deferredLeadSearch.toLowerCase());
  });

  const smsStatus = buildChannelStatus({
    title: 'SMS replies',
    provider: profileDraft.smsProvider,
    connectorId: profileDraft.smsConnectorId,
    connectors,
  });
  const emailStatus = buildChannelStatus({
    title: 'Email follow-up',
    provider: profileDraft.emailProvider,
    connectorId: profileDraft.emailConnectorId,
    connectors,
  });
  const calendarStatus = buildChannelStatus({
    title: 'Booking calendar',
    provider: profileDraft.calendarProvider,
    connectorId: profileDraft.calendarConnectorId,
    connectors,
    fallbackReady: Boolean(profileDraft.bookingLink),
    fallbackLabel: 'Booking link only',
    fallbackDetail: 'A booking link exists, but there is no live calendar connector yet.',
  });
  const readinessItems = buildReadinessItems({
    connectionCheck,
    workspace,
    profileDraft,
    smsStatus,
    emailStatus,
    calendarStatus,
  });
  const readyCount = readinessItems.filter((item) => item.ready).length;
  const nextBlocker = readinessItems.find((item) => !item.ready);
  const currentClientLabel = resolveClientLabel(connection, workspace);
  const currentBusinessName = workspace?.profile.businessName?.trim() || currentClientLabel;
  const customerReplyMenu = [
    { key: '1', title: 'Schedule appointment', detail: 'Starts the booking path when the client wants to reserve time.' },
    { key: '2', title: 'Request quote', detail: 'Captures a quote lead and asks for the next details.' },
    { key: '3', title: 'Emergency service', detail: 'Marks the lead urgent and escalates it faster.' },
    { key: '4', title: 'Ask a question', detail: 'Keeps the conversation open for general questions or follow-up.' },
  ];
  const wizardSteps = buildWizardSteps({
    connectionCheck,
    workspace,
    profileDraft,
  });
  const workspaceMode = workspace?.summary.mode;
  const workspaceModeTone = toneFromWorkspaceMode(workspaceMode);
  const wizardStepIndex = getWizardStepIndex(wizardStep);
  const canGoBack = wizardStepIndex > 0;
  const canGoNext = canAdvanceWizardStep(wizardStep, {
    workspace,
    profileDraft,
  });
  const showHeroConnectionActions =
    !workspace || connectionCheck.status === 'error' || wizardStep === 'open';
  const collapseOpenStep = Boolean(workspace && wizardStep !== 'open');
  const wizardContextItems: WizardContextItem[] = workspace
    ? [
        {
          title: 'What ResponseOS is doing now',
          detail:
            workspaceMode === 'live'
              ? 'Answering and following up automatically while still surfacing exceptions to a human.'
              : 'Accepting leads now and turning blocked work into clear human tasks instead of dropping it.',
        },
        {
          title: 'What to focus on next',
          detail:
            wizardStep === 'basics'
              ? 'Save the business basics so the system knows who the client is and where to respond.'
              : wizardStep === 'channels'
              ? 'Connect only the tools this client already has. Anything missing can wait.'
              : 'Review launch status, missing items, and anything still needing a human before handoff.',
        },
        {
          title: 'If the client is still incomplete',
          detail:
            workspace.summary.openTaskCount > 0
              ? `${workspace.summary.openTaskCount} human task(s) are already tracking the missing handoff work.`
              : 'Safe mode will keep catching work until more channels or details are added later.',
        },
      ]
    : [];
  const heroEyebrow = workspace
    ? workspaceMode === 'live'
      ? 'Client Live'
      : 'Client Safe Mode'
    : 'ResponseOS';
  const heroTitle = workspace
    ? currentBusinessName
    : 'Open a client, save the basics, and let everything else wait until later.';
  const heroDescription = workspace
    ? workspaceMode === 'live'
      ? `${currentBusinessName} is ready for live automation. ResponseOS can answer, follow up, and still hand anything unusual to a human.`
      : `${currentBusinessName} is open in safe mode. Leads can still come in now, and anything blocked or missing will fall into the human task list instead of failing.`
    : 'AI execution engine for automated systems. Start with the minimum a real business needs: who they are, what number customers should reach, and who gets alerted.';
  const heroSubnote = workspace
    ? `Callback number: ${workspace.profile.callbackNumber || 'not set yet'}`
    : 'Use step 1 to open the hosted gateway workspace. Local install tools are still available for demos or one-machine setups.';
  const nextWizardLabel =
    wizardStep === 'channels'
      ? 'Continue To Go Live'
      : wizardStep === 'go-live'
      ? 'Stay Here'
      : 'Continue';
  const launchSummary = workspace?.onboarding
    ? workspace.onboarding.mode === 'live'
      ? workspace.summary.openTaskCount > 0
        ? `Required setup is complete. ${workspace.summary.openTaskCount} human task(s) still need review.`
        : 'Required setup is complete. Live automation can run without the safe-mode fallback.'
      : `${workspace.onboarding.summary.blockerCount} required item(s) still block full automation. Leads can still enter, but blocked work will fall back to the human task list.`
    : nextBlocker
    ? `Next blocker: ${nextBlocker.title}. ${nextBlocker.note}`
    : 'Core setup is in place. You can move into live automation and customer testing.';

  return (
    <div className="app-shell">
      <div className="backdrop-grid" />
      <header className="hero">
        <div className="hero-copy">
          <span className="eyebrow">{heroEyebrow}</span>
          <h1>{heroTitle}</h1>
          <p>{heroDescription}</p>
          {showHeroConnectionActions ? (
            <div className="hero-actions">
              <button className="action-button" type="button" disabled={requestState.busy} onClick={() => void handleTestConnection()}>
                Test Connection
              </button>
              <button className="action-button" type="button" disabled={requestState.busy} onClick={() => void handleDetectGateway()}>
                Find Local Install
              </button>
              <button className="action-button primary" type="button" disabled={requestState.busy} onClick={() => void loadWorkspace(true, connection, 'opened-client')}>
                Open Business
              </button>
              <button className="action-button" type="button" disabled={requestState.busy} onClick={handleUseDemoConnection}>
                Load Demo Profile
              </button>
            </div>
          ) : null}
          <p className="hero-subnote">{heroSubnote}</p>
          <div className="hero-tags">
            <StatusBadge tone="neutral">{workspace ? 'Business' : 'Client'}: {currentClientLabel}</StatusBadge>
            {showHeroConnectionActions && (
              <StatusBadge
                tone={
                  connectionCheck.status === 'connected'
                    ? 'success'
                    : connectionCheck.status === 'error'
                    ? 'error'
                    : 'neutral'
                }
              >
                {connectionCheck.status === 'connected'
                  ? 'Gateway verified'
                  : connectionCheck.status === 'error'
                  ? 'Connection blocked'
                  : 'Not tested yet'}
              </StatusBadge>
            )}
            {showHeroConnectionActions && (
              <StatusBadge tone={savedClients.length > 0 ? 'success' : 'neutral'}>
                Saved clients: {savedClients.length}
              </StatusBadge>
            )}
            {workspaceMode && (
              <StatusBadge tone={workspaceModeTone}>
                {labelFromWorkspaceMode(workspaceMode)}
              </StatusBadge>
            )}
            {workspace && (
              <StatusBadge tone={workspace.summary.openTaskCount > 0 ? 'warning' : 'neutral'}>
                Human tasks: {workspace.summary.openTaskCount}
              </StatusBadge>
            )}
            {connectionCheck.followupRunnerEnabled !== undefined && (
              <StatusBadge
                tone={connectionCheck.followupRunnerEnabled ? 'success' : 'warning'}
              >
                {connectionCheck.followupRunnerEnabled
                  ? 'Auto follow-ups on'
                  : 'Auto follow-ups off'}
              </StatusBadge>
            )}
            {showHeroConnectionActions && connectionCheck.provider && (
              <StatusBadge tone="neutral">Provider: {connectionCheck.provider}</StatusBadge>
            )}
          </div>
        </div>
        <div className="status-card launch-card">
          <div className="launch-top">
            <span className="eyebrow eyebrow-soft">Go-Live Readiness</span>
            <div className="launch-score">
              <strong>{readyCount}</strong>
              <span>/ {readinessItems.length} ready</span>
            </div>
          </div>
          <p className="launch-summary">{launchSummary}</p>
          <div className="launch-list">
            {readinessItems.map((item) => (
              <article key={item.title} className="launch-item">
                <div className="launch-item-top">
                  <strong>{item.title}</strong>
                  <StatusBadge tone={item.tone}>{item.label}</StatusBadge>
                </div>
                <div className="stack-item-meta">{item.note}</div>
              </article>
            ))}
          </div>
          <div className="status-row">
            <span>Last Check</span>
            <strong>{formatDate(connectionCheck.checkedAt)}</strong>
          </div>
          <div className="status-row">
            <span>State</span>
            <strong className={`tone-${requestState.tone}`}>{requestState.message}</strong>
          </div>
          {connectionCheck.followupRunnerEnabled !== undefined && (
            <div className="status-row">
              <span>Auto Follow-ups</span>
              <strong>
                {connectionCheck.followupRunnerEnabled
                  ? `Enabled every ${Math.max(
                      1,
                      Math.round((connectionCheck.followupRunnerIntervalMs ?? 0) / 1000)
                    )}s`
                  : 'Disabled'}
              </strong>
            </div>
          )}
        </div>
      </header>

      <main className="layout-grid">
        {!workspace && <HowItWorksPanel />}
        <WizardPanel
          currentStep={wizardStep}
          steps={wizardSteps}
          contextItems={wizardContextItems}
          collapseOpenStep={collapseOpenStep}
          canGoBack={canGoBack}
          canGoNext={canGoNext}
          nextLabel={nextWizardLabel}
          onSelect={setWizardStep}
          onBack={() => setWizardStep(previousWizardStep(wizardStep))}
          onNext={() => {
            if (!canGoNext || wizardStep === 'go-live') return;
            setWizardStep(nextWizardStep(wizardStep));
          }}
        />

        {wizardStep === 'open' && (
          <section className="panel panel-wide">
            <div className="panel-header">
              <div>
                <h2>Open Business</h2>
                <p>
                  Production clients should open through the always-on gateway. Local install tools
                  stay here for demos, one-machine setups, or office-machine installs.
                </p>
              </div>
            </div>
            <div className="connection-grid">
              <article className="form-card">
                <span className="step-chip">Step 1</span>
                <h3>Hosted gateway connection</h3>
                <p className="form-copy">
                  This is the normal production path. Enter the always-on gateway URL and access key,
                  then open the business workspace that lives there.
                </p>
                <div className="form-grid">
                  <label>Gateway URL<input value={connection.gatewayUrl} onChange={(event) => setConnection((current) => ({ ...current, gatewayUrl: event.target.value }))} placeholder="https://gateway.your-domain.com" /></label>
                  <label>API Key<input value={connection.apiKey} onChange={(event) => setConnection((current) => ({ ...current, apiKey: event.target.value }))} placeholder="Client gateway key" /></label>
                  <label>App ID<input value={connection.appId} onChange={(event) => setConnection((current) => ({ ...current, appId: event.target.value }))} placeholder="responseos-app" /></label>
                  <label>Client ID<input value={connection.tenantId} onChange={(event) => setConnection((current) => ({ ...current, tenantId: event.target.value }))} placeholder="acme-hvac" /></label>
                </div>
                <div className="status-strip">
                  <StatusBadge
                    tone={
                      connectionCheck.status === 'connected'
                        ? 'success'
                        : connectionCheck.status === 'error'
                        ? 'error'
                        : 'neutral'
                    }
                  >
                    {connectionCheck.gatewayMessage || 'Gateway not checked yet'}
                  </StatusBadge>
                </div>
                <div className="button-row">
                  <button className="action-button" type="button" disabled={requestState.busy} onClick={() => void handleTestConnection()}>
                    Test Connection
                  </button>
                  <button className="action-button primary" type="button" disabled={requestState.busy} onClick={() => void loadWorkspace(true, connection, 'opened-client')}>
                    Open Business
                  </button>
                  <button className="action-button" type="button" disabled={requestState.busy} onClick={handleRememberCurrentClient}>
                    Save Client
                  </button>
                </div>

                <details className="advanced-panel advanced-panel-tight">
                  <summary>Local install helper</summary>
                  <p className="form-copy">
                    Use this only when the gateway is running on the current machine or an always-on
                    office machine you can reach locally.
                  </p>
                  <div className="button-row">
                    <button className="action-button primary" type="button" disabled={requestState.busy} onClick={() => void handleOpenLocalWorkspace()}>
                      Open Local ResponseOS
                    </button>
                    <button className="action-button" type="button" disabled={requestState.busy} onClick={() => void handleDetectGateway()}>
                      Find Local Install
                    </button>
                    <button className="action-button" type="button" disabled={requestState.busy} onClick={handleUseDemoConnection}>
                      Load Demo Profile
                    </button>
                    <button className="action-button" type="button" disabled={requestState.busy} onClick={() => void handleRunDueFollowups()}>
                      Run Due Follow-ups
                    </button>
                  </div>
                </details>
              </article>

              <article className="form-card">
                <span className="step-chip">Optional</span>
                <h3>Saved clients</h3>
                <p className="form-copy">
                  Reopen a stored hosted or local client without typing the connection details again.
                </p>
                <div className="saved-clients">
                  {savedClients.map((client) => (
                    <article key={client.id} className="saved-client-card">
                      <div className="saved-client-top">
                        <strong>{client.label}</strong>
                        <span>{formatDate(client.lastUsedAt)}</span>
                      </div>
                      <div className="saved-client-meta">
                        <span>{client.tenantId}</span>
                        <span>{client.appId}</span>
                      </div>
                      <div className="saved-client-url">{client.gatewayUrl}</div>
                      <div className="saved-client-actions">
                        <button className="mini-button" type="button" disabled={requestState.busy} onClick={() => handleOpenSavedClient(client)}>
                          Open
                        </button>
                        <button className="mini-button mini-button-quiet" type="button" disabled={requestState.busy} onClick={() => handleRemoveSavedClient(client.id)}>
                          Remove
                        </button>
                      </div>
                    </article>
                  ))}
                  {savedClients.length === 0 && <div className="empty-state">No saved clients yet. Save the first working connection.</div>}
                </div>
              </article>
            </div>
          </section>
        )}

        {wizardStep === 'basics' && (
          <ProfilePanel
            connectors={connectors}
            connectorValidation={validationState}
            channelStatuses={[smsStatus, emailStatus, calendarStatus]}
            connectorDraft={connectorDraft}
            discoveryResult={discoveryResult}
            profileDraft={profileDraft}
            setConnectorDraft={setConnectorDraft}
            setProfileDraft={setProfileDraft}
            onApplyPreset={handleApplyPreset}
            onAutoFillFromWebsite={handleAutoFillFromWebsite}
            onBootstrap={handleBootstrapConnector}
            onValidateConnector={handleValidateConnector}
            onSubmit={handleSaveProfile}
            busy={requestState.busy}
          />
        )}

        {wizardStep === 'channels' && (
          <ChannelSetupPanel
            connectors={connectors}
            connectorValidation={validationState}
            channelStatuses={[smsStatus, emailStatus, calendarStatus]}
            connectorDraft={connectorDraft}
            profileDraft={profileDraft}
            setConnectorDraft={setConnectorDraft}
            setProfileDraft={setProfileDraft}
            onBootstrap={handleBootstrapConnector}
            onValidateConnector={handleValidateConnector}
            onSubmit={handleSaveProfile}
            busy={requestState.busy}
          />
        )}

        {wizardStep === 'go-live' && (
          <>
            <LaunchModePanel workspace={workspace} />
            <InboundSetupPanel
              connection={connection}
              connectionCheck={connectionCheck}
              workspace={workspace}
            />
            <TaskPanel
              mode={workspaceMode}
              tasks={workspace?.tasks ?? []}
              onTaskStatus={handleTaskStatus}
              busy={requestState.busy}
            />
          </>
        )}

        <details className="advanced-workspace-panel panel panel-wide">
          <summary>Advanced Testing And Review</summary>
          <p className="advanced-copy">
            Use this only when you are testing automations, reviewing raw pipeline state, or doing
            operator work. A normal client setup should not need these panels first.
          </p>

          <section className="subsection subsection-no-line">
            <div className="subsection-header">
              <div>
                <h3>Detailed readiness</h3>
                <p>Detailed readiness cards for operator review.</p>
              </div>
            </div>
            <div className="checklist-grid">
              {readinessItems.map((item) => (
                <article key={item.title} className="check-card">
                  <div className="check-top">
                    <strong>{item.title}</strong>
                    <StatusBadge tone={item.tone}>{item.label}</StatusBadge>
                  </div>
                  <p>{item.note}</p>
                </article>
              ))}
            </div>
          </section>

          <PacketPanel
            connection={connection}
            packetText={packetText}
            setPacketText={setPacketText}
            onExport={handleExportPacket}
            onImport={handleImportPacket}
            busy={requestState.busy}
          />

          <LeadPanel
            leadDraft={leadDraft}
            setLeadDraft={setLeadDraft}
            onSubmit={handleLeadSubmit}
            busy={requestState.busy}
            mode={workspaceMode}
          />
          <EventPanel
            eventDraft={eventDraft}
            setEventDraft={setEventDraft}
            onSubmit={handleEventSubmit}
            busy={requestState.busy}
            defaultReviewUrl={profileDraft.reviewUrl}
            mode={workspaceMode}
          />

          <section className="subsection">
            <div className="panel-header">
              <div><h2>Metrics</h2><p>Operational output from the current client record.</p></div>
            </div>
            <div className="metric-grid">
              <MetricCard label="Events Processed" value={workspace?.metrics.eventsProcessed ?? 0} />
              <MetricCard label="Lead Intakes" value={workspace?.metrics.leadIntakes ?? 0} />
              <MetricCard label="Missed Calls Recovered" value={workspace?.metrics.missedCallsRecovered ?? 0} />
              <MetricCard label="Inbound Auto Replies" value={workspace?.metrics.inboundAutoReplies ?? 0} />
              <MetricCard label="Appointments Booked" value={workspace?.metrics.appointmentsBooked ?? 0} />
              <MetricCard label="Reviews Triggered" value={workspace?.metrics.reviewsTriggered ?? 0} />
              <MetricCard label="Hot Leads" value={workspace?.metrics.hotLeads ?? 0} />
              <MetricCard label="Failed Actions" value={workspace?.metrics.actionFailures ?? 0} />
            </div>
          </section>

          <section className="subsection">
            <div className="panel-header">
              <div>
                <h2>Customer Reply Flow</h2>
                <p>
                  This is the simplest live offer right now: missed call, instant text, then a
                  structured reply path the client can understand.
                </p>
              </div>
            </div>
            <div className="wizard-context-grid">
              <article className="wizard-context-card">
                <strong>Sample text-back</strong>
                <p>
                  Hi, sorry we missed your call. Reply 1 to schedule, 2 for a quote, 3 for urgent
                  help, or 4 to ask a question.
                </p>
              </article>
              {customerReplyMenu.map((item) => (
                <article key={item.key} className="wizard-context-card">
                  <strong>
                    {item.key}. {item.title}
                  </strong>
                  <p>{item.detail}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="subsection">
            <div className="panel-header">
              <div><h2>Leads</h2><p>Search the live pipeline and adjust stages without leaving the dashboard.</p></div>
              <input className="search-input" placeholder="Search by name, phone, service, stage, or tag" value={leadSearch} onChange={(event) => setLeadSearch(event.target.value)} />
            </div>
            <div className="table-wrap">
              <table>
                <thead><tr><th>Lead</th><th>Service</th><th>Urgency</th><th>Tags</th><th>Stage</th></tr></thead>
                <tbody>
                  {filteredLeads.map((lead) => (
                    <tr key={lead.leadId}>
                      <td><div className="table-title">{lead.name || lead.phone}</div><div className="table-subtitle">{lead.email || lead.address || lead.phone}</div></td>
                      <td>{lead.serviceCategory || 'General'}</td>
                      <td>{lead.urgencyScore}</td>
                      <td>{lead.tags.join(', ') || 'none'}</td>
                      <td>
                        <select value={lead.stage} onChange={(event) => void handleLeadStageChange(lead.leadId, event.target.value)}>
                          {LEAD_STAGES.map((stage) => <option key={stage} value={stage}>{stage}</option>)}
                        </select>
                      </td>
                    </tr>
                  ))}
                  {filteredLeads.length === 0 && <tr><td colSpan={5} className="empty-state">No leads loaded yet.</td></tr>}
                </tbody>
              </table>
            </div>
          </section>

          <div className="advanced-stack-grid subsection">
            <StackPanel
              title="Delivery Audit"
              subtitle="See what sent, how many attempts it took, and why anything failed."
            >
              {(workspace?.deliveries ?? []).map((item) => (
                <article key={item.deliveryId} className="stack-item">
                  <div className="stack-item-top">
                    <strong>{item.title}</strong>
                    <StatusBadge tone={toneFromDelivery(item)}>{labelFromDelivery(item)}</StatusBadge>
                  </div>
                  <div className="stack-item-main">{item.summary}</div>
                  <div className="stack-item-meta">
                    {formatDate(item.lastAttemptAt || item.createdAt)} / {formatDeliveryAttemptMeta(item)}
                  </div>
                  {item.error?.message && (
                    <div className="stack-item-meta">Failure: {item.error.message}</div>
                  )}
                </article>
              ))}
              {(workspace?.deliveries.length ?? 0) === 0 && (
                <div className="empty-state">No delivery records yet.</div>
              )}
            </StackPanel>

            <StackPanel title="Follow-ups" subtitle="Scheduled and executed follow-up jobs.">
              {(workspace?.followups ?? []).map((item) => (
                <article key={item.followupId} className="stack-item">
                  <div className="stack-item-top"><strong>{item.status}</strong><span>{formatDate(item.scheduledFor)}</span></div>
                  <div className="stack-item-main">{item.reason || item.strategy}</div>
                  <div className="stack-item-meta">{item.to || 'No destination'} / {item.source}</div>
                </article>
              ))}
              {(workspace?.followups.length ?? 0) === 0 && <div className="empty-state">No follow-ups yet.</div>}
            </StackPanel>

            <StackPanel title="Activity" subtitle="Recent automation, delivery, and operator events.">
              {(workspace?.activity ?? []).map((item) => (
                <article key={item.activityId} className="stack-item">
                  <div className="stack-item-top"><strong>{item.title}</strong><span>{formatDate(item.timestamp)}</span></div>
                  <div className="stack-item-main">{item.summary}</div>
                  <div className="stack-item-meta">{item.kind} / {item.status}</div>
                </article>
              ))}
              {(workspace?.activity.length ?? 0) === 0 && <div className="empty-state">No activity yet.</div>}
            </StackPanel>
          </div>
        </details>
      </main>
    </div>
  );
}

function buildCalendarAuth(draft: ConnectorBootstrapDraft) {
  if (draft.calendarAuthType === 'none') {
    return { type: 'none' };
  }
  if (draft.calendarAuthType === 'api_key') {
    return {
      type: 'api_key',
      header_name: draft.calendarApiKeyHeader,
      api_key: draft.calendarApiKeyValue,
    };
  }
  if (draft.calendarAuthType === 'basic') {
    return {
      type: 'basic',
      username: draft.calendarBasicUsername,
      password: draft.calendarBasicPassword,
    };
  }
  return {
    type: 'bearer',
    token: draft.calendarBearerToken,
  };
}

function resetConnectorDraft(
  current: ConnectorBootstrapDraft,
  kind: 'twilio' | 'resend' | 'calendar'
): ConnectorBootstrapDraft {
  if (kind === 'twilio') {
    return {
      ...current,
      twilioConnectorId: '',
      twilioAccountSid: '',
      twilioAuthToken: '',
      twilioBaseUrl: '',
    };
  }
  if (kind === 'resend') {
    return {
      ...current,
      resendConnectorId: '',
      resendApiKey: '',
      resendBaseUrl: '',
      resendFromEmail: '',
      resendFromName: '',
    };
  }
  return {
    ...current,
    calendarConnectorId: '',
    calendarBaseUrl: '',
    calendarPath: DEFAULT_CONNECTOR_BOOTSTRAP_DRAFT.calendarPath,
    calendarId: DEFAULT_CONNECTOR_BOOTSTRAP_DRAFT.calendarId,
    calendarAuthType: DEFAULT_CONNECTOR_BOOTSTRAP_DRAFT.calendarAuthType,
    calendarBearerToken: '',
    calendarApiKeyHeader: DEFAULT_CONNECTOR_BOOTSTRAP_DRAFT.calendarApiKeyHeader,
    calendarApiKeyValue: '',
    calendarBasicUsername: '',
    calendarBasicPassword: '',
  };
}

function StatusBadge({
  tone,
  children,
}: {
  tone: StatusTone;
  children: ReactNode;
}) {
  return <span className={`status-badge status-badge-${tone}`}>{children}</span>;
}

function toValidationTone(status: ValidationState['status']): StatusTone {
  if (status === 'success') return 'success';
  if (status === 'error') return 'error';
  if (status === 'validating') return 'warning';
  return 'neutral';
}

function hasBusinessHours(hours?: BusinessHoursSchedule) {
  return Boolean(hours && Object.keys(hours).length > 0);
}

function shouldReplaceServices(services: string) {
  const current = splitCsv(services).join(', ');
  const placeholder = splitCsv(DEFAULT_PROFILE_DRAFT.services).join(', ');
  return current.length === 0 || current === placeholder;
}

function mergeDiscoveryIntoDraft(draft: ProfileDraft, result: WebsiteDiscoveryResult): ProfileDraft {
  const discoveredServices = Array.isArray(result.profile.services) ? result.profile.services : [];
  return {
    ...draft,
    businessName: draft.businessName.trim() || result.profile.businessName || '',
    callbackNumber: draft.callbackNumber.trim() || result.profile.callbackNumber || '',
    services:
      shouldReplaceServices(draft.services) && discoveredServices.length > 0
        ? discoveredServices.join(', ')
        : draft.services,
    serviceArea: draft.serviceArea.trim() || result.profile.serviceArea || '',
    websiteUrl: result.settings.websiteUrl || result.websiteUrl || draft.websiteUrl,
    bookingLink: draft.bookingLink.trim() || result.settings.bookingLink || '',
    reviewUrl: draft.reviewUrl.trim() || result.settings.reviewUrl || '',
    contactEmail: draft.contactEmail.trim() || result.settings.contactEmail || '',
  };
}

function mergeDiscoveryHours(
  currentHours: BusinessHoursSchedule | undefined,
  result: WebsiteDiscoveryResult
) {
  if (hasBusinessHours(currentHours)) {
    return currentHours;
  }
  return result.profile.hours;
}

function buildDiscoveryMessage(result: WebsiteDiscoveryResult) {
  const count = result.summary.foundCount;
  return `Found ${count} public setup detail${count === 1 ? '' : 's'} from the website.`;
}

function buildChannelStatus(input: {
  title: string;
  provider: string;
  connectorId: string;
  connectors: GatewayConnector[];
  fallbackReady?: boolean;
  fallbackLabel?: string;
  fallbackDetail?: string;
}): ChannelStatus {
  const provider = input.provider.trim();
  const connectorId = input.connectorId.trim();
  const connector = connectorId
    ? input.connectors.find((item) => item.connector_id === connectorId)
    : undefined;

  if (!provider || provider === 'simulated') {
    return {
      title: input.title,
      tone: 'warning',
      label: 'Simulator only',
      detail: 'Good for demos and testing, but not yet ready for a live client handoff.',
    };
  }

  if (connector) {
    return {
      title: input.title,
      tone: 'success',
      label: `Live via ${provider}`,
      detail: `${connector.name || connector.connector_id} is attached and ready.`,
    };
  }

  if (input.fallbackReady) {
    return {
      title: input.title,
      tone: 'warning',
      label: input.fallbackLabel || 'Fallback path',
      detail: input.fallbackDetail || 'A fallback exists, but the live connector is still missing.',
    };
  }

  if (connectorId) {
    return {
      title: input.title,
      tone: 'error',
      label: 'Connector missing',
      detail: `The tenant expects connector "${connectorId}", but it is not available in the gateway.`,
    };
  }

  return {
    title: input.title,
    tone: 'error',
    label: 'Needs setup',
    detail: `No live ${input.title.toLowerCase()} path is configured yet.`,
  };
}

function buildReadinessItems(input: {
  connectionCheck: ConnectionCheck;
  workspace: RevenueWorkspace | null;
  profileDraft: ProfileDraft;
  smsStatus: ChannelStatus;
  emailStatus: ChannelStatus;
  calendarStatus: ChannelStatus;
}): ReadinessItem[] {
  const businessName = input.workspace?.profile.businessName || input.profileDraft.businessName;
  const callbackNumber = input.workspace?.profile.callbackNumber || input.profileDraft.callbackNumber;
  const services =
    input.workspace && input.workspace.profile.services.length > 0
      ? input.workspace.profile.services
      : splitCsv(input.profileDraft.services);
  const channelReady = input.smsStatus.tone === 'success' || input.emailStatus.tone === 'success';
  const bookingReady = Boolean(input.profileDraft.bookingLink) || input.calendarStatus.tone === 'success';

  return [
    input.connectionCheck.status === 'connected'
      ? {
          title: 'Gateway linked',
          tone: 'success',
          label: 'Ready',
          note: 'Gateway health and API access both passed.',
          ready: true,
        }
      : input.connectionCheck.status === 'error'
      ? {
          title: 'Gateway linked',
          tone: 'error',
          label: 'Blocked',
          note: input.connectionCheck.gatewayMessage || 'Gateway access is failing.',
          ready: false,
        }
      : {
          title: 'Gateway linked',
          tone: 'neutral',
          label: 'Not tested',
          note: 'Run a gateway test before handing this workspace to a client.',
          ready: false,
        },
    businessName && callbackNumber && services.length > 0
      ? {
          title: 'Business profile',
          tone: 'success',
          label: 'Ready',
          note: 'Identity, callback number, and services are present.',
          ready: true,
        }
      : {
          title: 'Business profile',
          tone: 'error',
          label: 'Incomplete',
          note: 'Business name, callback number, and at least one service are required.',
          ready: false,
        },
    channelReady
      ? {
          title: 'Response channel',
          tone: 'success',
          label: 'Ready',
          note: 'At least one live outbound response channel is connected.',
          ready: true,
        }
      : {
          title: 'Response channel',
          tone:
            input.smsStatus.tone === 'warning' || input.emailStatus.tone === 'warning'
              ? 'warning'
              : 'error',
          label:
            input.smsStatus.tone === 'warning' || input.emailStatus.tone === 'warning'
              ? 'Simulated'
              : 'Missing',
          note: 'Connect SMS or email before this tenant is truly live.',
          ready: false,
        },
    bookingReady
      ? {
          title: 'Booking path',
          tone: input.calendarStatus.tone === 'success' ? 'success' : 'warning',
          label: input.calendarStatus.tone === 'success' ? 'Ready' : 'Fallback',
          note:
            input.calendarStatus.tone === 'success'
              ? 'A live calendar connector is available for scheduling.'
              : 'A booking link exists, but there is no live calendar connector yet.',
          ready: true,
        }
      : {
          title: 'Booking path',
          tone: 'error',
          label: 'Missing',
          note: 'Add a booking link or connect the booking calendar.',
          ready: false,
        },
    input.profileDraft.ownerAlertDestination
      ? {
          title: 'Owner alerts',
          tone: 'success',
          label: 'Ready',
          note: 'A destination is configured for owner escalation.',
          ready: true,
        }
      : {
          title: 'Owner alerts',
          tone: 'warning',
          label: 'Recommended',
          note: 'Set an owner alert destination so hot leads do not depend only on automation.',
          ready: false,
        },
  ];
}

function buildGuidedSteps(input: {
  connectionCheck: ConnectionCheck;
  workspace: RevenueWorkspace | null;
  profileDraft: ProfileDraft;
}): GuidedStep[] {
  const businessName = input.workspace?.profile.businessName || input.profileDraft.businessName;
  const callbackNumber = input.workspace?.profile.callbackNumber || input.profileDraft.callbackNumber;
  const services =
    input.workspace && input.workspace.profile.services.length > 0
      ? input.workspace.profile.services
      : splitCsv(input.profileDraft.services);
  const hasBusinessBasics = Boolean(businessName && callbackNumber && services.length > 0);
  const channelState = input.workspace?.onboarding.channels;
  const hasLiveReply = Boolean(channelState?.sms.live || channelState?.email.live);
  const openTaskCount = input.workspace?.summary.openTaskCount ?? 0;

  return [
    input.workspace
      ? {
          title: '1. Open the business',
          tone: 'success',
          label: 'Ready',
          note: 'The business record is open. You are working inside the real client setup now.',
        }
      : input.connectionCheck.status === 'error'
      ? {
          title: '1. Open the business',
          tone: 'error',
          label: 'Blocked',
          note: input.connectionCheck.gatewayMessage || 'Fix the connection first so the business can open.',
        }
      : {
          title: '1. Open the business',
          tone: 'neutral',
          label: 'Do this first',
          note: 'Test the connection, then open the client so the business record loads.',
        },
    hasBusinessBasics
      ? {
          title: '2. Add the business basics',
          tone: 'success',
          label: 'Ready',
          note: 'Business name, callback number, and services are in place.',
        }
      : {
          title: '2. Add the business basics',
          tone: 'warning',
          label: 'Needed next',
          note: 'Fill in who the business is, what number customers should reach, and what they offer.',
        },
    hasLiveReply
      ? {
          title: '3. Choose how replies happen',
          tone: 'success',
          label: 'Live',
          note: 'A live SMS or email path exists, so customers can get automated replies.',
        }
      : {
          title: '3. Choose how replies happen',
          tone: 'warning',
          label: 'Can wait',
          note: 'If Twilio or email is not ready yet, save the basics first. ResponseOS will fall back to human tasks.',
        },
    openTaskCount > 0
      ? {
          title: '4. Check the human task list',
          tone: 'warning',
          label: `${openTaskCount} open`,
          note: 'When something is missing, ResponseOS creates a clear human follow-up task instead of silently failing.',
        }
      : {
          title: '4. Check the human task list',
          tone: 'success',
          label: 'Clear',
          note: 'There are no current human handoff items waiting.',
        },
  ];
}

function hasBusinessBasicsConfigured(input: {
  workspace: RevenueWorkspace | null;
  profileDraft: ProfileDraft;
}) {
  const businessName = input.workspace?.profile.businessName || input.profileDraft.businessName;
  const callbackNumber = input.workspace?.profile.callbackNumber || input.profileDraft.callbackNumber;
  const services =
    input.workspace && input.workspace.profile.services.length > 0
      ? input.workspace.profile.services
      : splitCsv(input.profileDraft.services);
  return Boolean(businessName && callbackNumber && services.length > 0);
}

function hasAnyChannelConfigured(input: {
  workspace: RevenueWorkspace | null;
  profileDraft: ProfileDraft;
}) {
  const channelState = input.workspace?.onboarding.channels;
  if (channelState?.sms.live || channelState?.email.live || channelState?.calendar.live) {
    return true;
  }

  return Boolean(
    input.profileDraft.bookingLink.trim() ||
      input.profileDraft.reviewUrl.trim() ||
      (input.profileDraft.smsProvider && input.profileDraft.smsProvider !== 'simulated') ||
      input.profileDraft.smsConnectorId.trim() ||
      (input.profileDraft.emailProvider && input.profileDraft.emailProvider !== 'simulated') ||
      input.profileDraft.emailConnectorId.trim() ||
      (input.profileDraft.calendarProvider &&
        input.profileDraft.calendarProvider !== 'simulated') ||
      input.profileDraft.calendarConnectorId.trim()
  );
}

function suggestWizardStep(input: {
  workspace: RevenueWorkspace | null;
  profileDraft: ProfileDraft;
}): WizardStepId {
  if (!input.workspace) {
    return 'open';
  }
  if (!hasBusinessBasicsConfigured(input)) {
    return 'basics';
  }
  if (!hasAnyChannelConfigured(input)) {
    return 'channels';
  }
  return 'go-live';
}

function landingStepForOpenedClient(input: {
  workspace: RevenueWorkspace | null;
  profileDraft: ProfileDraft;
}): WizardStepId {
  const suggestedStep = suggestWizardStep(input);
  return suggestedStep === 'go-live' ? 'go-live' : 'basics';
}

function buildWizardSteps(input: {
  connectionCheck: ConnectionCheck;
  workspace: RevenueWorkspace | null;
  profileDraft: ProfileDraft;
}): WizardStep[] {
  const openReady = Boolean(input.workspace);
  const basicsReady = hasBusinessBasicsConfigured(input);
  const channelsReady = hasAnyChannelConfigured(input);
  const liveMode = input.workspace?.summary.mode === 'live';
  const openTasks = input.workspace?.summary.openTaskCount ?? 0;

  return [
    openReady
      ? {
          id: 'open',
          title: 'Open business',
          tone: 'success',
          label: 'Open',
          note: 'The business record is already loaded. Come back here only if you need to switch clients.',
        }
      : input.connectionCheck.status === 'error'
      ? {
          id: 'open',
          title: 'Open business',
          tone: 'error',
          label: 'Blocked',
          note: input.connectionCheck.gatewayMessage || 'Fix the connection first so the business can open.',
        }
      : {
          id: 'open',
          title: 'Open business',
          tone: 'warning',
          label: 'Start here',
          note: 'Enter the hosted gateway details, or use the local install helper if this machine is the runtime.',
        },
    basicsReady
      ? {
          id: 'basics',
          title: 'Business basics',
          tone: 'success',
          label: 'Saved',
          note: 'Name, callback number, services, and alerts are in place.',
        }
      : {
          id: 'basics',
          title: 'Business basics',
          tone: 'warning',
          label: 'Needed',
          note: 'Save the minimum business details before worrying about integrations.',
        },
    channelsReady
      ? {
          id: 'channels',
          title: 'Channels',
          tone: 'success',
          label: 'Connected',
          note: 'At least one reply or booking path is configured.',
        }
      : {
          id: 'channels',
          title: 'Channels',
          tone: 'neutral',
          label: 'Optional',
          note: 'Skip this for now if the client does not have Twilio, email, or calendar yet.',
        },
    liveMode
      ? {
          id: 'go-live',
          title: 'Go live',
          tone: openTasks > 0 ? 'warning' : 'success',
          label: openTasks > 0 ? `${openTasks} tasks` : 'Live',
          note:
            openTasks > 0
              ? 'Automation is live, but there are still human follow-up items to review.'
              : 'The client is ready for live automation.',
        }
      : {
          id: 'go-live',
          title: 'Go live',
          tone: openReady ? 'warning' : 'neutral',
          label: openReady ? 'Safe mode' : 'Later',
          note: openReady
            ? 'The client can still launch in safe mode and hand missing work to humans.'
            : 'Open the business first to see launch status.',
        },
  ];
}

function getWizardStepIndex(step: WizardStepId) {
  return ['open', 'basics', 'channels', 'go-live'].indexOf(step);
}

function nextWizardStep(step: WizardStepId): WizardStepId {
  if (step === 'open') {
    return 'basics';
  }
  if (step === 'basics') {
    return 'channels';
  }
  return 'go-live';
}

function previousWizardStep(step: WizardStepId): WizardStepId {
  if (step === 'go-live') {
    return 'channels';
  }
  if (step === 'channels') {
    return 'basics';
  }
  return 'open';
}

function canAdvanceWizardStep(
  step: WizardStepId,
  input: { workspace: RevenueWorkspace | null; profileDraft: ProfileDraft }
) {
  if (step === 'open') {
    return Boolean(input.workspace);
  }
  if (step === 'basics') {
    return hasBusinessBasicsConfigured(input);
  }
  if (step === 'channels') {
    return true;
  }
  return false;
}

function toneFromWorkspaceMode(mode?: RevenueWorkspace['summary']['mode']): StatusTone {
  if (mode === 'live') {
    return 'success';
  }
  if (mode === 'protected') {
    return 'warning';
  }
  return 'neutral';
}

function labelFromWorkspaceMode(mode?: RevenueWorkspace['summary']['mode']) {
  if (mode === 'live') {
    return 'Live';
  }
  if (mode === 'protected') {
    return 'Safe mode';
  }
  return 'Not loaded';
}

function toneFromChecklistItem(
  item: RevenueWorkspace['onboarding']['checklist'][number]
): StatusTone {
  if (item.status === 'complete') {
    return 'success';
  }
  if (item.severity === 'required') {
    return 'error';
  }
  return 'warning';
}

function labelFromChecklistItem(item: RevenueWorkspace['onboarding']['checklist'][number]) {
  if (item.status === 'complete') {
    return 'Complete';
  }
  return item.severity === 'required' ? 'Required' : 'Recommended';
}

function toneFromChannelState(
  channel: RevenueWorkspace['onboarding']['channels'][keyof RevenueWorkspace['onboarding']['channels']]
): StatusTone {
  if (channel.status === 'live') {
    return 'success';
  }
  if (channel.status === 'blocked') {
    return 'error';
  }
  return 'warning';
}

function toneFromTask(task: RevenueTask): StatusTone {
  if (task.status === 'done') {
    return 'success';
  }
  if (task.severity === 'urgent') {
    return 'error';
  }
  return 'warning';
}

function labelFromTask(task: RevenueTask) {
  if (task.status === 'done') {
    return 'Completed';
  }
  return task.severity === 'urgent' ? 'Needs action' : 'Queued';
}

function toneFromDelivery(
  item: RevenueWorkspace['deliveries'][number]
): StatusTone {
  if (item.status === 'sent' || item.status === 'posted') {
    return 'success';
  }
  if (item.status === 'failed') {
    return 'error';
  }
  if (item.status === 'simulated') {
    return 'warning';
  }
  return 'neutral';
}

function labelFromDelivery(item: RevenueWorkspace['deliveries'][number]) {
  if (item.status === 'sent') {
    return 'Sent';
  }
  if (item.status === 'posted') {
    return 'Posted';
  }
  if (item.status === 'failed') {
    return 'Failed';
  }
  if (item.status === 'simulated') {
    return 'Simulated';
  }
  return item.status;
}

function formatDeliveryAttemptMeta(item: RevenueWorkspace['deliveries'][number]) {
  const lastAttempt = item.attempts.at(-1);
  const parts = [
    `${item.channel} via ${item.provider}`,
    item.mode,
    `${item.attemptCount} attempt${item.attemptCount === 1 ? '' : 's'}`,
  ];
  if (item.connectorId) {
    parts.push(item.connectorId);
  }
  if (lastAttempt?.statusCode) {
    parts.push(`last status ${lastAttempt.statusCode}`);
  }
  return parts.filter(Boolean).join(' / ');
}

function baseUrl(value: string) {
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

function buildTwilioWebhookUrl(connection: ConnectionState, publicBaseUrl?: string) {
  if (
    !connection.gatewayUrl.trim() ||
    !connection.appId.trim() ||
    !connection.tenantId.trim() ||
    !connection.apiKey.trim()
  ) {
    return '';
  }

  try {
    const url = new URL('/v1/revenue/webhooks/twilio', `${resolveWebhookBaseUrl(connection, publicBaseUrl)}/`);
    url.searchParams.set('app_id', connection.appId.trim());
    url.searchParams.set('tenant_id', connection.tenantId.trim());
    url.searchParams.set('api_key', connection.apiKey.trim());
    return url.toString();
  } catch {
    return '';
  }
}

function describeGatewayExposure(gatewayUrl: string, publicBaseUrl?: string) {
  try {
    const usingConfiguredPublicBase = Boolean(publicBaseUrl?.trim());
    const url = new URL(resolveWebhookBaseUrl({ gatewayUrl, apiKey: '', appId: '', tenantId: '' }, publicBaseUrl));
    const host = url.hostname.toLowerCase();
    const isLocal = isPrivateOrLocalHost(host);

    if (isLocal) {
      return {
        tone: 'warning' as const,
        label: usingConfiguredPublicBase ? 'Configured base is still local' : 'Local only',
        detail: usingConfiguredPublicBase
          ? 'The configured public base URL is still local/private. Set service.public_base_url to the real public hostname before wiring Twilio.'
          : 'This gateway URL is local/private. Twilio will need a public hostname, reverse proxy, or tunnel before these webhook URLs can be reached.',
      };
    }

    return {
      tone: 'success' as const,
      label: usingConfiguredPublicBase ? 'Using public base URL' : 'Public-looking URL',
      detail: usingConfiguredPublicBase
        ? `Twilio webhooks will use ${baseUrl(publicBaseUrl || '')}.`
        : 'This gateway URL looks externally reachable enough to wire into Twilio.',
    };
  } catch {
    return {
      tone: 'error' as const,
      label: 'Invalid URL',
      detail: 'Enter a valid gateway URL before generating inbound webhook endpoints.',
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

function describeGatewayRuntime(
  connection: ConnectionState,
  publicBaseUrl?: string,
  runtimeStatus?: GatewayRuntimeStatus
) {
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
        tone: 'warning' as const,
        label: 'Local machine only',
        detail:
          'If this PC is off, the gateway is off. Missed-call text-back and live Twilio callbacks stop until the machine is running again.',
      };
    }

    if (localGateway && publicBaseUrl?.trim()) {
      return {
        tone: localPublicHost ? 'warning' as const : 'neutral' as const,
        label: 'Public URL to this machine',
        detail:
          'Twilio can use the public URL, but uptime still depends on this machine or tunnel staying on. Turning the PC off still stops the automation.',
      };
    }

    return {
      tone: 'success' as const,
      label: 'Looks hosted',
      detail:
        'This gateway does not look local. The automation should keep running as long as that server or always-on office machine stays online.',
    };
  } catch {
    return {
      tone: 'neutral' as const,
      label: 'Runtime unknown',
      detail: 'Open a client with a valid gateway URL to confirm whether this is only a local install or an always-on runtime.',
    };
  }
}

function buildGatewayCandidates(currentValue: string) {
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
      for (const port of [currentPort - 1, currentPort, currentPort + 1]) {
        if (port > 0) {
          candidates.push(`${currentUrl.protocol}//${currentUrl.hostname}:${port}`);
        }
      }
    }
  } catch {
    // ignore window location parsing failures
  }

  return candidates
    .map((item) => baseUrl(item || ''))
    .filter(Boolean);
}

function dedupeGatewayCandidates(candidates: string[]) {
  return [...new Set(candidates)];
}

async function detectGatewayCandidate(currentValue: string) {
  const candidates = dedupeGatewayCandidates(buildGatewayCandidates(currentValue));
  for (const candidate of candidates) {
    try {
      const healthResponse = await fetch(`${candidate}/health`);
      if (!healthResponse.ok) {
        continue;
      }
      const healthJson = (await healthResponse.json()) as { ok?: boolean; service?: string };
      if (!healthJson.ok) {
        continue;
      }
      return {
        candidate,
        service: healthJson.service,
      };
    } catch {
      // try next candidate
    }
  }
  return null;
}

function slugFromBusinessName(value: string) {
  return String(value ?? '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function requireConnectionFields(connection: ConnectionState, includeTenantId: boolean) {
  if (!connection.gatewayUrl.trim()) {
    throw new Error('Gateway URL is required.');
  }
  if (!connection.apiKey.trim()) {
    throw new Error('API key is required.');
  }
  if (!connection.appId.trim()) {
    throw new Error('App ID is required.');
  }
  if (includeTenantId && !connection.tenantId.trim()) {
    throw new Error('Tenant ID is required.');
  }
}

function resolveClientLabel(connection: ConnectionState, workspace: RevenueWorkspace | null) {
  return workspace?.profile.businessName?.trim() || connection.tenantId.trim() || connection.appId.trim();
}

function createSavedClientProfile(connection: ConnectionState, label: string): SavedClientProfile {
  return {
    id: `${baseUrl(connection.gatewayUrl)}|${connection.appId.trim()}|${connection.tenantId.trim()}`.toLowerCase(),
    label: label.trim() || connection.tenantId.trim() || connection.appId.trim(),
    gatewayUrl: connection.gatewayUrl.trim(),
    apiKey: connection.apiKey.trim(),
    appId: connection.appId.trim(),
    tenantId: connection.tenantId.trim(),
    lastUsedAt: new Date().toISOString(),
  };
}

function upsertSavedClient(current: SavedClientProfile[], nextProfile: SavedClientProfile) {
  return [nextProfile, ...current.filter((item) => item.id !== nextProfile.id)].slice(0, 12);
}

function toConnectionState(client: SavedClientProfile): ConnectionState {
  return {
    gatewayUrl: client.gatewayUrl,
    apiKey: client.apiKey,
    appId: client.appId,
    tenantId: client.tenantId,
  };
}

function isStarterConnection(connection: ConnectionState) {
  return (
    connection.gatewayUrl.trim() === DEFAULT_CONNECTION.gatewayUrl &&
    connection.apiKey.trim() === DEFAULT_CONNECTION.apiKey &&
    connection.appId.trim() === DEFAULT_CONNECTION.appId &&
    connection.tenantId.trim() === DEFAULT_CONNECTION.tenantId
  );
}

function buildPreviewDemoConnection(connection: ConnectionState): ConnectionState {
  return {
    ...connection,
    apiKey: 'preview-key',
    appId: 'responseos-app',
    tenantId: 'demo-hvac-live-preview',
  };
}

function ProfilePanel({
  connectors,
  connectorValidation,
  channelStatuses,
  connectorDraft,
  discoveryResult,
  profileDraft,
  setConnectorDraft,
  setProfileDraft,
  onApplyPreset,
  onAutoFillFromWebsite,
  onBootstrap,
  onValidateConnector,
  onSubmit,
  busy,
}: {
  connectors: GatewayConnector[];
  connectorValidation: Record<ValidationKey, ValidationState>;
  channelStatuses: ChannelStatus[];
  connectorDraft: ConnectorBootstrapDraft;
  discoveryResult: WebsiteDiscoveryResult | null;
  profileDraft: ProfileDraft;
  setConnectorDraft: Dispatch<SetStateAction<ConnectorBootstrapDraft>>;
  setProfileDraft: Dispatch<SetStateAction<ProfileDraft>>;
  onApplyPreset: (preset: ClientPreset) => void;
  onAutoFillFromWebsite: () => Promise<void>;
  onBootstrap: (kind: 'twilio' | 'resend' | 'calendar') => Promise<void>;
  onValidateConnector: (kind: ValidationKey) => Promise<void>;
  onSubmit: (event: FormEvent<HTMLFormElement>) => Promise<void>;
  busy: boolean;
}) {
  return (
    <section className="panel panel-wide">
      <div className="panel-header">
        <div>
          <h2>Business Setup</h2>
          <p>
            Start with the basics. If the client does not have Twilio, email, or calendar yet,
            save the basics first and connect those later.
          </p>
        </div>
      </div>
      <form onSubmit={(event) => void onSubmit(event)}>
        <div className="setup-grid">
          <article className="setup-card">
            <span className="step-chip">Step 2</span>
            <h3>Minimum setup</h3>
            <div className="form-grid">
              <label>Business Name<input value={profileDraft.businessName} onChange={(event) => updateDraft(setProfileDraft, 'businessName', event.target.value)} /></label>
              <label>Callback Number<input value={profileDraft.callbackNumber} onChange={(event) => updateDraft(setProfileDraft, 'callbackNumber', event.target.value)} /></label>
              <label className="field-span">Website URL<input value={profileDraft.websiteUrl} onChange={(event) => updateDraft(setProfileDraft, 'websiteUrl', event.target.value)} placeholder="https://clientsite.com" /></label>
              <label>Services<input value={profileDraft.services} onChange={(event) => updateDraft(setProfileDraft, 'services', event.target.value)} /></label>
              <label>Timezone<input value={profileDraft.timezone} onChange={(event) => updateDraft(setProfileDraft, 'timezone', event.target.value)} /></label>
            </div>
            <p className="form-copy">
              If you know the website, ResponseOS can pull the public basics from it and fill the
              blanks for you.
            </p>
            <div className="button-row">
              <button className="action-button" type="button" disabled={busy} onClick={() => void onAutoFillFromWebsite()}>
                Auto-Fill From Website
              </button>
            </div>
            {discoveryResult && (
              <div className="discovery-card">
                <div className="check-top">
                  <strong>Website scan found {discoveryResult.summary.foundCount} public detail{discoveryResult.summary.foundCount === 1 ? '' : 's'}</strong>
                  <StatusBadge tone="success">{discoveryResult.summary.scannedCount} page{discoveryResult.summary.scannedCount === 1 ? '' : 's'}</StatusBadge>
                </div>
                <p>{discoveryResult.summary.notes.join(' ')}</p>
                <div className="discovery-meta">
                  {discoveryResult.summary.servicesFound.length > 0 && (
                    <span>Services: {discoveryResult.summary.servicesFound.join(', ')}</span>
                  )}
                  {discoveryResult.summary.hoursSummary && (
                    <span>{discoveryResult.summary.hoursSummary}</span>
                  )}
                </div>
              </div>
            )}
          </article>
          <article className="setup-card">
            <span className="step-chip">Step 2</span>
            <h3>Who should get alerts</h3>
            <div className="form-grid">
              <label>Owner Alert Destination<input value={profileDraft.ownerAlertDestination} onChange={(event) => updateDraft(setProfileDraft, 'ownerAlertDestination', event.target.value)} /></label>
              <label>Contact Email<input value={profileDraft.contactEmail} onChange={(event) => updateDraft(setProfileDraft, 'contactEmail', event.target.value)} /></label>
            </div>
            <p className="form-copy">
              This is enough to start. Booking links, review links, and live connectors can be
              added later.
            </p>
          </article>
        </div>

        <details className="advanced-panel">
          <summary>Add more later</summary>
          <div className="subsection subsection-no-line">
            <div className="subsection-header">
              <div>
                <h3>Tenant Presets</h3>
                <p>Use a service preset if you want the app to fill a starting template for you.</p>
              </div>
            </div>
            <div className="preset-grid">
              {CLIENT_PRESETS.map((preset) => (
                <article key={preset.id} className="preset-card">
                  <div className="preset-top">
                    <strong>{preset.label}</strong>
                    <span>{preset.tenantId}</span>
                  </div>
                  <p>{preset.description}</p>
                  <div className="stack-item-meta">Services: {preset.services.join(', ')}</div>
                  <div className="stack-item-meta">{preset.bookingHint}</div>
                  <div className="stack-item-meta">{preset.alertHint}</div>
                  <div className="button-row">
                    <button className="mini-button" type="button" disabled={busy} onClick={() => onApplyPreset(preset)}>
                      Use Preset
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </div>

          <div className="subsection">
            <div className="subsection-header">
              <div>
                <h3>Customer extras</h3>
                <p>These improve scheduling and review follow-up, but they are not required to start.</p>
              </div>
            </div>
            <div className="form-grid">
              <label>Service Area<input value={profileDraft.serviceArea} onChange={(event) => updateDraft(setProfileDraft, 'serviceArea', event.target.value)} /></label>
              <label>Booking Link<input value={profileDraft.bookingLink} onChange={(event) => updateDraft(setProfileDraft, 'bookingLink', event.target.value)} /></label>
              <label>Review URL<input value={profileDraft.reviewUrl} onChange={(event) => updateDraft(setProfileDraft, 'reviewUrl', event.target.value)} /></label>
            </div>
          </div>

          <div className="subsection">
            <div className="subsection-header">
              <div>
                <h3>Channel Readiness</h3>
                <p>Each delivery path tells you whether it is live, simulated, or still blocked.</p>
              </div>
            </div>
            <div className="checklist-grid">
              {channelStatuses.map((channel) => (
                <article key={channel.title} className="check-card">
                  <div className="check-top">
                    <strong>{channel.title}</strong>
                    <StatusBadge tone={channel.tone}>{channel.label}</StatusBadge>
                  </div>
                  <p>{channel.detail}</p>
                </article>
              ))}
            </div>
          </div>

          <div className="subsection">
            <div className="subsection-header">
              <div>
                <h3>Guided Connector Setup</h3>
                <p>Create encrypted provider connectors and apply them to the tenant immediately.</p>
              </div>
            </div>
            <div className="connector-grid">
              <article className="connector-card">
                <div className="connector-card-header">
                  <strong>Twilio SMS</strong>
                  <span>Creates a Basic Auth connector and activates the SMS channel.</span>
                </div>
                <div className="form-grid">
                  <label>Connector ID<input value={connectorDraft.twilioConnectorId} onChange={(event) => updateDraft(setConnectorDraft, 'twilioConnectorId', event.target.value)} placeholder="default: tenant-sms-twilio" /></label>
                  <label>Account SID<input value={connectorDraft.twilioAccountSid} onChange={(event) => updateDraft(setConnectorDraft, 'twilioAccountSid', event.target.value)} placeholder="AC..." /></label>
                  <label>Password / Auth Token<input type="password" value={connectorDraft.twilioAuthToken} onChange={(event) => updateDraft(setConnectorDraft, 'twilioAuthToken', event.target.value)} /></label>
                  <label>Base URL Override<input value={connectorDraft.twilioBaseUrl} onChange={(event) => updateDraft(setConnectorDraft, 'twilioBaseUrl', event.target.value)} placeholder="Optional local proxy or test URL" /></label>
                </div>
                <div className="status-strip">
                  <StatusBadge tone={toValidationTone(connectorValidation.twilio.status)}>
                    {connectorValidation.twilio.message}
                  </StatusBadge>
                </div>
                <div className="button-row">
                  <button className="action-button" type="button" disabled={busy} onClick={() => void onValidateConnector('twilio')}>Validate Credentials</button>
                  <button className="action-button" type="button" disabled={busy} onClick={() => void onBootstrap('twilio')}>Bootstrap Twilio SMS</button>
                </div>
              </article>

              <article className="connector-card">
                <div className="connector-card-header">
                  <strong>Resend Email</strong>
                  <span>Creates a Bearer token connector and applies the outbound email defaults.</span>
                </div>
                <div className="form-grid">
                  <label>Connector ID<input value={connectorDraft.resendConnectorId} onChange={(event) => updateDraft(setConnectorDraft, 'resendConnectorId', event.target.value)} placeholder="default: tenant-email-resend" /></label>
                  <label>API Key<input type="password" value={connectorDraft.resendApiKey} onChange={(event) => updateDraft(setConnectorDraft, 'resendApiKey', event.target.value)} placeholder="re_..." /></label>
                  <label>From Email<input value={connectorDraft.resendFromEmail} onChange={(event) => updateDraft(setConnectorDraft, 'resendFromEmail', event.target.value)} /></label>
                  <label>From Name<input value={connectorDraft.resendFromName} onChange={(event) => updateDraft(setConnectorDraft, 'resendFromName', event.target.value)} /></label>
                  <label className="field-span">Base URL Override<input value={connectorDraft.resendBaseUrl} onChange={(event) => updateDraft(setConnectorDraft, 'resendBaseUrl', event.target.value)} placeholder="Optional local proxy or test URL" /></label>
                </div>
                <div className="status-strip">
                  <StatusBadge tone={toValidationTone(connectorValidation.resend.status)}>
                    {connectorValidation.resend.message}
                  </StatusBadge>
                </div>
                <div className="button-row">
                  <button className="action-button" type="button" disabled={busy} onClick={() => void onValidateConnector('resend')}>Validate Credentials</button>
                  <button className="action-button" type="button" disabled={busy} onClick={() => void onBootstrap('resend')}>Bootstrap Resend Email</button>
                </div>
              </article>

              <article className="connector-card">
                <div className="connector-card-header">
                  <strong>Calendar API</strong>
                  <span>Creates a generic JSON connector for booking automation and calendar writes.</span>
                </div>
                <div className="form-grid">
                  <label>Connector ID<input value={connectorDraft.calendarConnectorId} onChange={(event) => updateDraft(setConnectorDraft, 'calendarConnectorId', event.target.value)} placeholder="default: tenant-calendar-generic-json" /></label>
                  <label>Base URL<input value={connectorDraft.calendarBaseUrl} onChange={(event) => updateDraft(setConnectorDraft, 'calendarBaseUrl', event.target.value)} placeholder="https://calendar.example.com/api/" /></label>
                  <label>Path<input value={connectorDraft.calendarPath} onChange={(event) => updateDraft(setConnectorDraft, 'calendarPath', event.target.value)} /></label>
                  <label>Calendar ID<input value={connectorDraft.calendarId} onChange={(event) => updateDraft(setConnectorDraft, 'calendarId', event.target.value)} /></label>
                  <label>
                    Auth Type
                    <select value={connectorDraft.calendarAuthType} onChange={(event) => updateDraft(setConnectorDraft, 'calendarAuthType', event.target.value as ConnectorBootstrapDraft['calendarAuthType'])}>
                      <option value="bearer">bearer</option>
                      <option value="api_key">api_key</option>
                      <option value="basic">basic</option>
                      <option value="none">none</option>
                    </select>
                  </label>
                  {connectorDraft.calendarAuthType === 'bearer' && (
                    <label>
                      Bearer Token
                      <input type="password" value={connectorDraft.calendarBearerToken} onChange={(event) => updateDraft(setConnectorDraft, 'calendarBearerToken', event.target.value)} />
                    </label>
                  )}
                  {connectorDraft.calendarAuthType === 'api_key' && (
                    <>
                      <label>Header Name<input value={connectorDraft.calendarApiKeyHeader} onChange={(event) => updateDraft(setConnectorDraft, 'calendarApiKeyHeader', event.target.value)} /></label>
                      <label>API Key<input type="password" value={connectorDraft.calendarApiKeyValue} onChange={(event) => updateDraft(setConnectorDraft, 'calendarApiKeyValue', event.target.value)} /></label>
                    </>
                  )}
                  {connectorDraft.calendarAuthType === 'basic' && (
                    <>
                      <label>Username<input value={connectorDraft.calendarBasicUsername} onChange={(event) => updateDraft(setConnectorDraft, 'calendarBasicUsername', event.target.value)} /></label>
                      <label>Password<input type="password" value={connectorDraft.calendarBasicPassword} onChange={(event) => updateDraft(setConnectorDraft, 'calendarBasicPassword', event.target.value)} /></label>
                    </>
                  )}
                </div>
                <div className="status-strip">
                  <StatusBadge tone={toValidationTone(connectorValidation.calendar.status)}>
                    {connectorValidation.calendar.message}
                  </StatusBadge>
                </div>
                <div className="button-row">
                  <button className="action-button" type="button" disabled={busy} onClick={() => void onValidateConnector('calendar')}>Validate Credentials</button>
                  <button className="action-button" type="button" disabled={busy} onClick={() => void onBootstrap('calendar')}>Bootstrap Calendar API</button>
                </div>
              </article>
            </div>
          </div>

          <div className="subsection">
            <div className="subsection-header">
              <div>
                <h3>Advanced overrides</h3>
                <p>Only use these if you need to override the guided setup defaults.</p>
              </div>
            </div>
          <div className="form-grid">
            <label>SMS Provider<select value={profileDraft.smsProvider} onChange={(event) => updateDraft(setProfileDraft, 'smsProvider', event.target.value)}>{SMS_PROVIDER_OPTIONS.map((value) => <option key={value} value={value}>{value}</option>)}</select></label>
            <label>SMS Connector ID<input value={profileDraft.smsConnectorId} onChange={(event) => updateDraft(setProfileDraft, 'smsConnectorId', event.target.value)} /></label>
            <label>SMS Path<input value={profileDraft.smsPath} onChange={(event) => updateDraft(setProfileDraft, 'smsPath', event.target.value)} /></label>
            <label>Email Provider<select value={profileDraft.emailProvider} onChange={(event) => updateDraft(setProfileDraft, 'emailProvider', event.target.value)}>{EMAIL_PROVIDER_OPTIONS.map((value) => <option key={value} value={value}>{value}</option>)}</select></label>
            <label>Email Connector ID<input value={profileDraft.emailConnectorId} onChange={(event) => updateDraft(setProfileDraft, 'emailConnectorId', event.target.value)} /></label>
            <label>Email Path<input value={profileDraft.emailPath} onChange={(event) => updateDraft(setProfileDraft, 'emailPath', event.target.value)} /></label>
            <label>Email From Address<input value={profileDraft.emailFromEmail} onChange={(event) => updateDraft(setProfileDraft, 'emailFromEmail', event.target.value)} /></label>
            <label>Email From Name<input value={profileDraft.emailFromName} onChange={(event) => updateDraft(setProfileDraft, 'emailFromName', event.target.value)} /></label>
            <label>Calendar Provider<select value={profileDraft.calendarProvider} onChange={(event) => updateDraft(setProfileDraft, 'calendarProvider', event.target.value)}>{CALENDAR_PROVIDER_OPTIONS.map((value) => <option key={value} value={value}>{value}</option>)}</select></label>
            <label>Calendar Connector ID<input value={profileDraft.calendarConnectorId} onChange={(event) => updateDraft(setProfileDraft, 'calendarConnectorId', event.target.value)} /></label>
            <label>Calendar Path<input value={profileDraft.calendarPath} onChange={(event) => updateDraft(setProfileDraft, 'calendarPath', event.target.value)} /></label>
            <label>Calendar ID<input value={profileDraft.calendarId} onChange={(event) => updateDraft(setProfileDraft, 'calendarId', event.target.value)} /></label>
          </div>
          </div>

          <div className="subsection">
            <div className="subsection-header">
              <div>
                <h3>Configured Connectors</h3>
                <p>Connector records are app-level and secrets stay masked after bootstrap.</p>
              </div>
            </div>
            <div className="connector-list">
              {connectors.map((connector) => (
                <article key={connector.connector_id} className="connector-list-item">
                  <div className="stack-item-top">
                    <strong>{connector.name || connector.connector_id}</strong>
                    <span>{formatDate(connector.updated_at)}</span>
                  </div>
                  <div className="stack-item-main">{connector.base_url}</div>
                  <div className="stack-item-meta">{connector.connector_id} / auth: {connector.auth.type}</div>
                </article>
              ))}
              {connectors.length === 0 && <div className="empty-state">No connectors created yet.</div>}
            </div>
          </div>
        </details>

        <div className="button-row"><button className="action-button primary" type="submit" disabled={busy}>Save Basics</button></div>
      </form>
    </section>
  );
}

function ChannelSetupPanel({
  connectors,
  connectorValidation,
  channelStatuses,
  connectorDraft,
  profileDraft,
  setConnectorDraft,
  setProfileDraft,
  onBootstrap,
  onValidateConnector,
  onSubmit,
  busy,
}: {
  connectors: GatewayConnector[];
  connectorValidation: Record<ValidationKey, ValidationState>;
  channelStatuses: ChannelStatus[];
  connectorDraft: ConnectorBootstrapDraft;
  profileDraft: ProfileDraft;
  setConnectorDraft: Dispatch<SetStateAction<ConnectorBootstrapDraft>>;
  setProfileDraft: Dispatch<SetStateAction<ProfileDraft>>;
  onBootstrap: (kind: 'twilio' | 'resend' | 'calendar') => Promise<void>;
  onValidateConnector: (kind: ValidationKey) => Promise<void>;
  onSubmit: (event: FormEvent<HTMLFormElement>) => Promise<void>;
  busy: boolean;
}) {
  return (
    <section className="panel panel-wide">
      <div className="panel-header">
        <div>
          <h2>Channels</h2>
          <p>Connect only the tools the client already has. Everything else can stay off for now.</p>
        </div>
      </div>
      <form onSubmit={(event) => void onSubmit(event)}>
        <div className="subsection subsection-no-line">
          <div className="subsection-header">
            <div>
              <h3>Optional customer links</h3>
              <p>These improve booking and review follow-up, but they are not required to go live.</p>
            </div>
          </div>
          <div className="form-grid">
            <label>Booking Link<input value={profileDraft.bookingLink} onChange={(event) => updateDraft(setProfileDraft, 'bookingLink', event.target.value)} /></label>
            <label>Review URL<input value={profileDraft.reviewUrl} onChange={(event) => updateDraft(setProfileDraft, 'reviewUrl', event.target.value)} /></label>
          </div>
        </div>

        <div className="subsection">
          <div className="subsection-header">
            <div>
              <h3>What is already live</h3>
              <p>Each delivery path tells you whether it is live, simulated, or still blocked.</p>
            </div>
          </div>
          <div className="checklist-grid">
            {channelStatuses.map((channel) => (
              <article key={channel.title} className="check-card">
                <div className="check-top">
                  <strong>{channel.title}</strong>
                  <StatusBadge tone={channel.tone}>{channel.label}</StatusBadge>
                </div>
                <p>{channel.detail}</p>
              </article>
            ))}
          </div>
        </div>

        <div className="subsection">
          <div className="subsection-header">
            <div>
              <h3>Connect channels</h3>
              <p>Use guided setup only for the services the client already owns.</p>
            </div>
          </div>
          <div className="connector-grid">
            <article className="connector-card">
              <div className="connector-card-header">
                <strong>Twilio SMS</strong>
                <span>Creates a Basic Auth connector and activates the SMS channel.</span>
              </div>
              <div className="form-grid">
                <label>Connector ID<input value={connectorDraft.twilioConnectorId} onChange={(event) => updateDraft(setConnectorDraft, 'twilioConnectorId', event.target.value)} placeholder="default: tenant-sms-twilio" /></label>
                <label>Account SID<input value={connectorDraft.twilioAccountSid} onChange={(event) => updateDraft(setConnectorDraft, 'twilioAccountSid', event.target.value)} placeholder="AC..." /></label>
                <label>Password / Auth Token<input type="password" value={connectorDraft.twilioAuthToken} onChange={(event) => updateDraft(setConnectorDraft, 'twilioAuthToken', event.target.value)} /></label>
                <label>Base URL Override<input value={connectorDraft.twilioBaseUrl} onChange={(event) => updateDraft(setConnectorDraft, 'twilioBaseUrl', event.target.value)} placeholder="Optional local proxy or test URL" /></label>
              </div>
              <div className="status-strip">
                <StatusBadge tone={toValidationTone(connectorValidation.twilio.status)}>
                  {connectorValidation.twilio.message}
                </StatusBadge>
              </div>
              <div className="button-row">
                <button className="action-button" type="button" disabled={busy} onClick={() => void onValidateConnector('twilio')}>Validate Credentials</button>
                <button className="action-button" type="button" disabled={busy} onClick={() => void onBootstrap('twilio')}>Bootstrap Twilio SMS</button>
              </div>
            </article>

            <article className="connector-card">
              <div className="connector-card-header">
                <strong>Resend Email</strong>
                <span>Creates a Bearer token connector and applies the outbound email defaults.</span>
              </div>
              <div className="form-grid">
                <label>Connector ID<input value={connectorDraft.resendConnectorId} onChange={(event) => updateDraft(setConnectorDraft, 'resendConnectorId', event.target.value)} placeholder="default: tenant-email-resend" /></label>
                <label>API Key<input type="password" value={connectorDraft.resendApiKey} onChange={(event) => updateDraft(setConnectorDraft, 'resendApiKey', event.target.value)} placeholder="re_..." /></label>
                <label>From Email<input value={connectorDraft.resendFromEmail} onChange={(event) => updateDraft(setConnectorDraft, 'resendFromEmail', event.target.value)} /></label>
                <label>From Name<input value={connectorDraft.resendFromName} onChange={(event) => updateDraft(setConnectorDraft, 'resendFromName', event.target.value)} /></label>
                <label className="field-span">Base URL Override<input value={connectorDraft.resendBaseUrl} onChange={(event) => updateDraft(setConnectorDraft, 'resendBaseUrl', event.target.value)} placeholder="Optional local proxy or test URL" /></label>
              </div>
              <div className="status-strip">
                <StatusBadge tone={toValidationTone(connectorValidation.resend.status)}>
                  {connectorValidation.resend.message}
                </StatusBadge>
              </div>
              <div className="button-row">
                <button className="action-button" type="button" disabled={busy} onClick={() => void onValidateConnector('resend')}>Validate Credentials</button>
                <button className="action-button" type="button" disabled={busy} onClick={() => void onBootstrap('resend')}>Bootstrap Resend Email</button>
              </div>
            </article>

            <article className="connector-card">
              <div className="connector-card-header">
                <strong>Calendar API</strong>
                <span>Creates a generic JSON connector for booking automation and calendar writes.</span>
              </div>
              <div className="form-grid">
                <label>Connector ID<input value={connectorDraft.calendarConnectorId} onChange={(event) => updateDraft(setConnectorDraft, 'calendarConnectorId', event.target.value)} placeholder="default: tenant-calendar-generic-json" /></label>
                <label>Base URL<input value={connectorDraft.calendarBaseUrl} onChange={(event) => updateDraft(setConnectorDraft, 'calendarBaseUrl', event.target.value)} placeholder="https://calendar.example.com/api/" /></label>
                <label>Path<input value={connectorDraft.calendarPath} onChange={(event) => updateDraft(setConnectorDraft, 'calendarPath', event.target.value)} /></label>
                <label>Calendar ID<input value={connectorDraft.calendarId} onChange={(event) => updateDraft(setConnectorDraft, 'calendarId', event.target.value)} /></label>
                <label>
                  Auth Type
                  <select value={connectorDraft.calendarAuthType} onChange={(event) => updateDraft(setConnectorDraft, 'calendarAuthType', event.target.value as ConnectorBootstrapDraft['calendarAuthType'])}>
                    <option value="bearer">bearer</option>
                    <option value="api_key">api_key</option>
                    <option value="basic">basic</option>
                    <option value="none">none</option>
                  </select>
                </label>
                {connectorDraft.calendarAuthType === 'bearer' && (
                  <label>
                    Bearer Token
                    <input type="password" value={connectorDraft.calendarBearerToken} onChange={(event) => updateDraft(setConnectorDraft, 'calendarBearerToken', event.target.value)} />
                  </label>
                )}
                {connectorDraft.calendarAuthType === 'api_key' && (
                  <>
                    <label>Header Name<input value={connectorDraft.calendarApiKeyHeader} onChange={(event) => updateDraft(setConnectorDraft, 'calendarApiKeyHeader', event.target.value)} /></label>
                    <label>API Key<input type="password" value={connectorDraft.calendarApiKeyValue} onChange={(event) => updateDraft(setConnectorDraft, 'calendarApiKeyValue', event.target.value)} /></label>
                  </>
                )}
                {connectorDraft.calendarAuthType === 'basic' && (
                  <>
                    <label>Username<input value={connectorDraft.calendarBasicUsername} onChange={(event) => updateDraft(setConnectorDraft, 'calendarBasicUsername', event.target.value)} /></label>
                    <label>Password<input type="password" value={connectorDraft.calendarBasicPassword} onChange={(event) => updateDraft(setConnectorDraft, 'calendarBasicPassword', event.target.value)} /></label>
                  </>
                )}
              </div>
              <div className="status-strip">
                <StatusBadge tone={toValidationTone(connectorValidation.calendar.status)}>
                  {connectorValidation.calendar.message}
                </StatusBadge>
              </div>
              <div className="button-row">
                <button className="action-button" type="button" disabled={busy} onClick={() => void onValidateConnector('calendar')}>Validate Credentials</button>
                <button className="action-button" type="button" disabled={busy} onClick={() => void onBootstrap('calendar')}>Bootstrap Calendar API</button>
              </div>
            </article>
          </div>
        </div>

        <details className="advanced-panel">
          <summary>Manual channel overrides</summary>
          <div className="subsection subsection-no-line">
            <div className="subsection-header">
              <div>
                <h3>Advanced overrides</h3>
                <p>Only use these if you need to override the guided setup defaults.</p>
              </div>
            </div>
            <div className="form-grid">
              <label>SMS Provider<select value={profileDraft.smsProvider} onChange={(event) => updateDraft(setProfileDraft, 'smsProvider', event.target.value)}>{SMS_PROVIDER_OPTIONS.map((value) => <option key={value} value={value}>{value}</option>)}</select></label>
              <label>SMS Connector ID<input value={profileDraft.smsConnectorId} onChange={(event) => updateDraft(setProfileDraft, 'smsConnectorId', event.target.value)} /></label>
              <label>SMS Path<input value={profileDraft.smsPath} onChange={(event) => updateDraft(setProfileDraft, 'smsPath', event.target.value)} /></label>
              <label>Email Provider<select value={profileDraft.emailProvider} onChange={(event) => updateDraft(setProfileDraft, 'emailProvider', event.target.value)}>{EMAIL_PROVIDER_OPTIONS.map((value) => <option key={value} value={value}>{value}</option>)}</select></label>
              <label>Email Connector ID<input value={profileDraft.emailConnectorId} onChange={(event) => updateDraft(setProfileDraft, 'emailConnectorId', event.target.value)} /></label>
              <label>Email Path<input value={profileDraft.emailPath} onChange={(event) => updateDraft(setProfileDraft, 'emailPath', event.target.value)} /></label>
              <label>Email From Address<input value={profileDraft.emailFromEmail} onChange={(event) => updateDraft(setProfileDraft, 'emailFromEmail', event.target.value)} /></label>
              <label>Email From Name<input value={profileDraft.emailFromName} onChange={(event) => updateDraft(setProfileDraft, 'emailFromName', event.target.value)} /></label>
              <label>Calendar Provider<select value={profileDraft.calendarProvider} onChange={(event) => updateDraft(setProfileDraft, 'calendarProvider', event.target.value)}>{CALENDAR_PROVIDER_OPTIONS.map((value) => <option key={value} value={value}>{value}</option>)}</select></label>
              <label>Calendar Connector ID<input value={profileDraft.calendarConnectorId} onChange={(event) => updateDraft(setProfileDraft, 'calendarConnectorId', event.target.value)} /></label>
              <label>Calendar Path<input value={profileDraft.calendarPath} onChange={(event) => updateDraft(setProfileDraft, 'calendarPath', event.target.value)} /></label>
              <label>Calendar ID<input value={profileDraft.calendarId} onChange={(event) => updateDraft(setProfileDraft, 'calendarId', event.target.value)} /></label>
            </div>
          </div>

          <div className="subsection">
            <div className="subsection-header">
              <div>
                <h3>Configured Connectors</h3>
                <p>Connector records are app-level and secrets stay masked after bootstrap.</p>
              </div>
            </div>
            <div className="connector-list">
              {connectors.map((connector) => (
                <article key={connector.connector_id} className="connector-list-item">
                  <div className="stack-item-top">
                    <strong>{connector.name || connector.connector_id}</strong>
                    <span>{formatDate(connector.updated_at)}</span>
                  </div>
                  <div className="stack-item-main">{connector.base_url}</div>
                  <div className="stack-item-meta">{connector.connector_id} / auth: {connector.auth.type}</div>
                </article>
              ))}
              {connectors.length === 0 && <div className="empty-state">No connectors created yet.</div>}
            </div>
          </div>
        </details>

        <div className="button-row">
          <button className="action-button primary" type="submit" disabled={busy}>
            Save Channel Settings
          </button>
        </div>
      </form>
    </section>
  );
}

function LaunchModePanel({
  workspace,
}: {
  workspace: RevenueWorkspace | null;
}) {
  return (
    <section className="panel panel-wide">
      <div className="panel-header">
        <div>
          <h2>Launch Status</h2>
          <p>Start with partial client info, then turn channels live one by one as details arrive.</p>
        </div>
        {workspace && (
          <StatusBadge tone={toneFromWorkspaceMode(workspace.summary.mode)}>
            {labelFromWorkspaceMode(workspace.summary.mode)}
          </StatusBadge>
        )}
      </div>
      {!workspace ? (
        <div className="empty-state">
          Open a client first. This panel will show what is missing, what can already go live, and
          whether the app is in safe mode or live mode.
        </div>
      ) : (
        <>
          <div className="mode-grid">
        <article className="mode-card">
              <div className="mode-top">
                <strong>Current launch mode</strong>
                <StatusBadge tone={toneFromWorkspaceMode(workspace.summary.mode)}>
                  {labelFromWorkspaceMode(workspace.summary.mode)}
                </StatusBadge>
              </div>
              <p className="mode-copy">
                {workspace.summary.mode === 'live'
                  ? 'Required setup is complete. The client can run live automations, and anything exceptional still lands in the human task list.'
                  : 'The client can accept leads now, but blocked or simulated automations will create human follow-up tasks until the required fields are completed.'}
              </p>
              <div className="mode-metric-grid">
                <article className="mode-metric">
                  <span>Required complete</span>
                  <strong>
                    {workspace.onboarding.summary.requiredComplete} /{' '}
                    {workspace.onboarding.summary.requiredTotal}
                  </strong>
                </article>
                <article className="mode-metric">
                  <span>Blockers</span>
                  <strong>{workspace.onboarding.summary.blockerCount}</strong>
                </article>
                <article className="mode-metric">
                  <span>Missing items</span>
                  <strong>{workspace.onboarding.summary.missingCount}</strong>
                </article>
                <article className="mode-metric">
                  <span>Open human tasks</span>
                  <strong>{workspace.summary.openTaskCount}</strong>
                </article>
              </div>
            </article>

            <article className="mode-card">
              <div className="mode-top">
                <strong>What can already go live</strong>
                <span className="mode-meta">Each channel can turn on independently.</span>
              </div>
              <div className="channel-activation-grid">
                {[
                  { title: 'SMS', channel: workspace.onboarding.channels.sms },
                  { title: 'Email', channel: workspace.onboarding.channels.email },
                  { title: 'Calendar', channel: workspace.onboarding.channels.calendar },
                ].map(({ title, channel }) => (
                  <article key={title} className="channel-card">
                    <div className="check-top">
                      <strong>{title}</strong>
                      <StatusBadge tone={toneFromChannelState(channel)}>
                        {channel.live ? 'Live' : channel.status}
                      </StatusBadge>
                    </div>
                    <p>{channel.detail}</p>
                    <div className="stack-item-meta">
                      Provider: {channel.provider}
                      {channel.connectorId ? ` / ${channel.connectorId}` : ''}
                    </div>
                  </article>
                ))}
              </div>
            </article>
          </div>

          <div className="subsection">
            <div className="subsection-header">
              <div>
                <h3>What is still missing</h3>
                <p>Required items block full automation. Recommended items make the handoff smoother.</p>
              </div>
            </div>
            <div className="checklist-grid">
              {workspace.onboarding.checklist.map((item) => (
                <article key={item.itemId} className="check-card">
                  <div className="check-top">
                    <strong>{item.title}</strong>
                    <StatusBadge tone={toneFromChecklistItem(item)}>
                      {labelFromChecklistItem(item)}
                    </StatusBadge>
                  </div>
                  <p>{item.detail}</p>
                </article>
              ))}
            </div>
          </div>
        </>
      )}
    </section>
  );
}

function HowItWorksPanel() {
  return (
    <section className="panel panel-wide">
      <div className="panel-header">
        <div>
          <h2>What This Actually Does</h2>
          <p>Think of ResponseOS as a front desk for a service business, not as a technical dashboard.</p>
        </div>
      </div>
      <div className="explain-grid">
        <article className="explain-card">
          <strong>1. You tell it who the business is</strong>
          <p>Business name, callback number, services, and owner contact.</p>
        </article>
        <article className="explain-card">
          <strong>2. You connect whatever tools they already have</strong>
          <p>Twilio, email, calendar, or nothing yet. Missing tools do not block setup.</p>
        </article>
        <article className="explain-card">
          <strong>3. It catches leads and customer messages</strong>
          <p>Website leads, inbound texts, missed calls, and follow-up events all flow into one place.</p>
        </article>
        <article className="explain-card">
          <strong>4. It either acts or gives a human a task</strong>
          <p>If automation is ready it responds. If not, it creates a human follow-up task instead of failing silently.</p>
        </article>
      </div>
    </section>
  );
}

function WizardPanel({
  currentStep,
  steps,
  contextItems,
  collapseOpenStep,
  canGoBack,
  canGoNext,
  nextLabel,
  onSelect,
  onBack,
  onNext,
}: {
  currentStep: WizardStepId;
  steps: WizardStep[];
  contextItems: WizardContextItem[];
  collapseOpenStep: boolean;
  canGoBack: boolean;
  canGoNext: boolean;
  nextLabel: string;
  onSelect: (step: WizardStepId) => void;
  onBack: () => void;
  onNext: () => void;
}) {
  return (
    <section className="panel panel-wide">
      <div className="panel-header">
        <div>
          <h2>Setup Wizard</h2>
          <p>
            {contextItems.length > 0
              ? 'This is now the main client handoff surface. Use it to finish setup without bouncing between separate explainer panels.'
              : 'Move through these four steps in order. The app only needs a few basics before it can start helping.'}
          </p>
        </div>
      </div>
      {contextItems.length > 0 && (
        <div className="wizard-context-grid">
          {contextItems.map((item) => (
            <article key={item.title} className="wizard-context-card">
              <strong>{item.title}</strong>
              <p>{item.detail}</p>
            </article>
          ))}
        </div>
      )}
      <div className="wizard-grid">
        {steps.map((step, index) => (
          <button
            key={step.id}
            className={`wizard-card ${currentStep === step.id ? 'wizard-card-active' : ''} ${collapseOpenStep && step.id === 'open' ? 'wizard-card-compact' : ''}`}
            type="button"
            onClick={() => onSelect(step.id)}
          >
            <span className="step-chip">Step {index + 1}</span>
            <div className="check-top">
              <strong>{collapseOpenStep && step.id === 'open' ? 'Switch business' : step.title}</strong>
              <StatusBadge tone={step.tone}>{step.label}</StatusBadge>
            </div>
            <p>{step.note}</p>
          </button>
        ))}
      </div>
      <div className="wizard-footer">
        <p className="advanced-copy">
          Channels can be skipped for now. If the client does not have Twilio, email, or calendar
          yet, ResponseOS will stay in safe mode and create human tasks instead of failing.
        </p>
        <div className="button-row wizard-button-row">
          <button className="action-button" type="button" disabled={!canGoBack} onClick={onBack}>
            Back
          </button>
          <button className="action-button primary" type="button" disabled={!canGoNext || currentStep === 'go-live'} onClick={onNext}>
            {currentStep === 'go-live' ? 'Ready' : nextLabel}
          </button>
        </div>
      </div>
    </section>
  );
}

function StartHerePanel({
  steps,
}: {
  steps: GuidedStep[];
}) {
  return (
    <section className="panel panel-wide">
      <div className="panel-header">
        <div>
          <h2>Start Here</h2>
          <p>This is the order a normal person should use. Ignore advanced panels until these make sense.</p>
        </div>
      </div>
      <div className="guide-grid">
        {steps.map((step) => (
          <article key={step.title} className="guide-card">
            <div className="check-top">
              <strong>{step.title}</strong>
              <StatusBadge tone={step.tone}>{step.label}</StatusBadge>
            </div>
            <p>{step.note}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function InboundSetupPanel({
  connection,
  connectionCheck,
  workspace,
}: {
  connection: ConnectionState;
  connectionCheck: ConnectionCheck;
  workspace: RevenueWorkspace | null;
}) {
  const webhookUrl = buildTwilioWebhookUrl(connection, connectionCheck.publicBaseUrl);
  const exposure = describeGatewayExposure(connection.gatewayUrl, connectionCheck.publicBaseUrl);
  const runtime = describeGatewayRuntime(
    connection,
    connectionCheck.publicBaseUrl,
    connectionCheck.runtime
  );
  const smsChannel = workspace?.onboarding.channels.sms;
  const runtimeStatus = connectionCheck.runtime;

  return (
    <section className="panel panel-wide">
      <div className="panel-header">
        <div>
          <h2>Connect Twilio When Ready</h2>
          <p>Only use this when the client is ready for live inbound texts or call callbacks.</p>
        </div>
        <StatusBadge tone={smsChannel?.provider === 'twilio' ? 'success' : 'warning'}>
          {smsChannel?.provider === 'twilio' ? 'Twilio selected' : 'Twilio not selected yet'}
        </StatusBadge>
      </div>
      <div className="connection-grid">
        <article className="form-card">
          <span className="step-chip">Step 4</span>
          <h3>Copy these into Twilio</h3>
          <p className="form-copy">
            Use the same endpoint for inbound SMS and missed-call status callbacks. The gateway
            will normalize the Twilio form payload into ResponseOS events.
          </p>
          <div className="form-grid">
            <label className="field-span">
              Inbound SMS URL
              <input readOnly value={webhookUrl} placeholder="Open a client first" />
            </label>
            <label className="field-span">
              Voice Status Callback URL
              <input readOnly value={webhookUrl} placeholder="Open a client first" />
            </label>
          </div>
          <div className="status-strip">
            <StatusBadge tone={exposure.tone}>{exposure.label}</StatusBadge>
            {connectionCheck.publicBaseUrl && (
              <StatusBadge tone="success">Public base set</StatusBadge>
            )}
            {connectionCheck.followupRunnerEnabled !== undefined && (
              <StatusBadge tone={connectionCheck.followupRunnerEnabled ? 'success' : 'warning'}>
                {connectionCheck.followupRunnerEnabled
                  ? `Auto runner every ${Math.max(
                      1,
                      Math.round((connectionCheck.followupRunnerIntervalMs ?? 0) / 1000)
                    )}s`
                  : 'Auto runner disabled'}
              </StatusBadge>
            )}
          </div>
          <div className="stack-item-meta inbound-note">{exposure.detail}</div>
          {connectionCheck.publicBaseUrl && (
            <div className="stack-item-meta inbound-note">
              Public hostname: {connectionCheck.publicBaseUrl}
            </div>
          )}
        </article>

        <article className="form-card">
          <span className="step-chip">Twilio Notes</span>
          <h3>What turns on after this</h3>
          <div className="snapshot-list">
            <article className="snapshot-item">
              <span>Inbound SMS</span>
              <strong>Creates an `sms.received` event and runs booking or auto-reply patches.</strong>
            </article>
            <article className="snapshot-item">
              <span>Missed calls</span>
              <strong>Turns `busy`, `failed`, `no-answer`, and `canceled` callbacks into `call.missed` events.</strong>
            </article>
            <article className="snapshot-item">
              <span>Follow-up runner</span>
              <strong>
                {connectionCheck.followupRunnerEnabled
                  ? 'Due follow-ups are processed automatically by the gateway.'
                  : 'Due follow-ups still need the manual Run Due Follow-ups button or a runner-enabled gateway config.'}
              </strong>
            </article>
          </div>
        </article>

        <article className="form-card">
          <span className="step-chip">Trial Checklist</span>
          <h3>Exact next steps for a Twilio trial</h3>
          <div className="snapshot-list">
            <article className="snapshot-item">
              <span>1. Public website</span>
              <strong>Put the pilot site live before submitting Twilio toll-free verification.</strong>
            </article>
            <article className="snapshot-item">
              <span>2. Legal entity field</span>
              <strong>Use your real legal name if you do not have an LLC or registered business yet.</strong>
            </article>
            <article className="snapshot-item">
              <span>3. Trial limits</span>
              <strong>Only verified phone numbers can receive calls or texts from the Twilio trial account.</strong>
            </article>
            <article className="snapshot-item">
              <span>4. Webhook target</span>
              <strong>
                {connectionCheck.publicBaseUrl
                  ? 'Twilio can use the configured public base URL shown here.'
                  : 'Do not point Twilio at localhost. Set a public hostname, tunnel, or reverse proxy first.'}
              </strong>
            </article>
            <article className="snapshot-item">
              <span>5. Security</span>
              <strong>Rotate any Twilio Auth Token that was pasted into chat or exposed outside the console.</strong>
            </article>
          </div>
        </article>

        <article className="form-card">
          <span className="step-chip">Runtime</span>
          <h3>Will it keep working if the PC is off?</h3>
          <div className="status-strip">
            <StatusBadge tone={runtime.tone}>{runtime.label}</StatusBadge>
            {runtimeStatus?.automation.followupRunnerRunning && (
              <StatusBadge tone="success">Runner active</StatusBadge>
            )}
          </div>
          <p className="form-copy">
            {runtime.detail}
          </p>
          <div className="snapshot-list">
            {runtimeStatus && (
              <>
                <article className="snapshot-item">
                  <span>Gateway bind</span>
                  <strong>
                    {runtimeStatus.bind.host}:{runtimeStatus.bind.port}
                  </strong>
                </article>
                <article className="snapshot-item">
                  <span>Data storage</span>
                  <strong>{runtimeStatus.storage.dataDir}</strong>
                </article>
                <article className="snapshot-item">
                  <span>Runner state</span>
                  <strong>
                    {runtimeStatus.automation.followupRunnerEnabled
                      ? runtimeStatus.automation.followupRunnerRunning
                        ? `Running every ${Math.max(
                            1,
                            Math.round(runtimeStatus.automation.followupRunnerIntervalMs / 1000)
                          )}s`
                        : 'Enabled but not running yet'
                      : 'Disabled'}
                  </strong>
                </article>
                <article className="snapshot-item">
                  <span>Gateway identity</span>
                  <strong>
                    {runtimeStatus.identity.clientId} / {runtimeStatus.identity.appId}
                  </strong>
                </article>
              </>
            )}
            <article className="snapshot-item">
              <span>Best use for local install</span>
              <strong>Demos, guided setup, and client-side visibility.</strong>
            </article>
            <article className="snapshot-item">
              <span>Best use for always-on runtime</span>
              <strong>Live missed-call recovery, inbound SMS, and follow-up processing after business hours.</strong>
            </article>
          </div>
        </article>
      </div>
    </section>
  );
}

function PacketPanel({
  connection,
  packetText,
  setPacketText,
  onExport,
  onImport,
  busy,
}: {
  connection: ConnectionState;
  packetText: string;
  setPacketText: Dispatch<SetStateAction<string>>;
  onExport: () => Promise<void>;
  onImport: () => Promise<void>;
  busy: boolean;
}) {
  return (
    <section className="panel">
      <div className="panel-header">
        <div>
          <h2>Transfer Setup</h2>
          <p>Export a handoff packet or paste one in to preload another client.</p>
        </div>
        <StatusBadge tone={packetText.trim() ? 'success' : 'neutral'}>
          {packetText.trim() ? 'Packet loaded' : 'No packet yet'}
        </StatusBadge>
      </div>
      <div className="snapshot-list">
        <article className="snapshot-item">
          <span>Current target</span>
          <strong>{connection.tenantId || 'Client ID not set yet'}</strong>
        </article>
        <article className="snapshot-item">
          <span>Why use this</span>
          <strong>Move partial onboarding between install calls, laptops, and client machines.</strong>
        </article>
      </div>
      <div className="subsection">
        <div className="subsection-header">
          <div>
            <h3>Packet JSON</h3>
            <p>Export from a working tenant or paste a packet received from another setup session.</p>
          </div>
        </div>
        <textarea
          className="packet-textarea"
          value={packetText}
          onChange={(event) => setPacketText(event.target.value)}
          placeholder='{"packetVersion":1,"tenantId":"acme-hvac","profile":{...}}'
        />
        <div className="button-row">
          <button className="action-button" type="button" disabled={busy} onClick={() => void onExport()}>
            Export Current Tenant
          </button>
          <button
            className="action-button primary"
            type="button"
            disabled={busy || !packetText.trim()}
            onClick={() => void onImport()}
          >
            Import Into This Client
          </button>
        </div>
      </div>
    </section>
  );
}

function TaskPanel({
  mode,
  tasks,
  onTaskStatus,
  busy,
}: {
  mode?: RevenueWorkspace['summary']['mode'];
  tasks: RevenueTask[];
  onTaskStatus: (taskId: string, status: string) => Promise<void>;
  busy: boolean;
}) {
  const orderedTasks = [...tasks].sort((left, right) => {
    if (left.status === right.status) {
      return right.updatedAt.localeCompare(left.updatedAt);
    }
    if (left.status === 'done') {
      return 1;
    }
    if (right.status === 'done') {
      return -1;
    }
    return right.updatedAt.localeCompare(left.updatedAt);
  });
  const openTaskCount = tasks.filter((task) => task.status !== 'done').length;

  return (
    <section className="panel">
      <div className="panel-header">
        <div>
          <h2>Things Still Needing A Human</h2>
          <p>
            Safe mode and failed deliveries land here so the client can still keep working.
          </p>
        </div>
        <StatusBadge
          tone={
            openTaskCount > 0 ? (mode === 'protected' ? 'warning' : 'error') : 'success'
          }
        >
          {openTaskCount} open
        </StatusBadge>
      </div>
      <div className="task-list">
        {orderedTasks.map((task) => (
          <article key={task.taskId} className="task-card">
            <div className="task-top">
              <strong>{task.title}</strong>
              <StatusBadge tone={toneFromTask(task)}>{labelFromTask(task)}</StatusBadge>
            </div>
            <div className="task-meta">
              <span>{task.taskType}</span>
              <span>{formatDate(task.updatedAt)}</span>
            </div>
            <p className="task-detail">{task.detail}</p>
            <div className="task-meta">
              <span>{task.source || 'human task list'}</span>
              <span>{task.relatedLeadId ? `Lead: ${task.relatedLeadId}` : 'No linked lead'}</span>
            </div>
            <div className="task-actions">
              {task.status !== 'done' ? (
                <button
                  className="mini-button"
                  type="button"
                  disabled={busy}
                  onClick={() => void onTaskStatus(task.taskId, 'done')}
                >
                  Mark Done
                </button>
              ) : (
                <button
                  className="mini-button mini-button-quiet"
                  type="button"
                  disabled={busy}
                  onClick={() => void onTaskStatus(task.taskId, 'pending')}
                >
                  Reopen
                </button>
              )}
            </div>
          </article>
        ))}
        {orderedTasks.length === 0 && (
          <div className="empty-state">
            No manual tasks right now. If a client is incomplete, safe-mode fallbacks will
            appear here automatically.
          </div>
        )}
      </div>
    </section>
  );
}

function LeadPanel({
  leadDraft,
  setLeadDraft,
  onSubmit,
  busy,
  mode,
}: {
  leadDraft: LeadDraft;
  setLeadDraft: Dispatch<SetStateAction<LeadDraft>>;
  onSubmit: (event: FormEvent<HTMLFormElement>) => Promise<void>;
  busy: boolean;
  mode?: RevenueWorkspace['summary']['mode'];
}) {
  return (
    <section className="panel">
      <div className="panel-header">
        <div>
          <h2>Lead Intake</h2>
          <p>
            {mode === 'protected'
              ? 'Safe mode is active. New leads are still accepted, and blocked automations create human tasks instead of silently failing.'
              : 'Simulate the normalized lead ingestion flow you specified in the planning docs.'}
          </p>
        </div>
        {mode && (
          <StatusBadge tone={toneFromWorkspaceMode(mode)}>
            {labelFromWorkspaceMode(mode)}
          </StatusBadge>
        )}
      </div>
      <form onSubmit={(event) => void onSubmit(event)}>
        <div className="form-grid">
          <label>Name<input value={leadDraft.name} onChange={(event) => updateDraft(setLeadDraft, 'name', event.target.value)} /></label>
          <label>Phone<input value={leadDraft.phone} onChange={(event) => updateDraft(setLeadDraft, 'phone', event.target.value)} /></label>
          <label>Email<input value={leadDraft.email} onChange={(event) => updateDraft(setLeadDraft, 'email', event.target.value)} /></label>
          <label>Service Requested<input value={leadDraft.serviceRequested} onChange={(event) => updateDraft(setLeadDraft, 'serviceRequested', event.target.value)} /></label>
          <label>Location<input value={leadDraft.location} onChange={(event) => updateDraft(setLeadDraft, 'location', event.target.value)} /></label>
          <label>Source<input value={leadDraft.source} onChange={(event) => updateDraft(setLeadDraft, 'source', event.target.value)} /></label>
        </div>
        <div className="button-row"><button className="action-button primary" type="submit" disabled={busy}>Submit Intake</button></div>
      </form>
    </section>
  );
}

function EventPanel({
  eventDraft,
  setEventDraft,
  onSubmit,
  busy,
  defaultReviewUrl,
  mode,
}: {
  eventDraft: EventDraft;
  setEventDraft: Dispatch<SetStateAction<EventDraft>>;
  onSubmit: (event: FormEvent<HTMLFormElement>) => Promise<void>;
  busy: boolean;
  defaultReviewUrl: string;
  mode?: RevenueWorkspace['summary']['mode'];
}) {
  return (
    <section className="panel">
      <div className="panel-header">
        <div>
          <h2>Event Runner</h2>
          <p>
            {mode === 'protected'
              ? 'Events still run in safe mode, but simulated or blocked actions are pushed into the human task list for review.'
              : 'Trigger patch execution for missed calls, inbound SMS, and completed jobs.'}
          </p>
        </div>
        {mode && (
          <StatusBadge tone={toneFromWorkspaceMode(mode)}>
            {labelFromWorkspaceMode(mode)}
          </StatusBadge>
        )}
      </div>
      <form onSubmit={(event) => void onSubmit(event)}>
        <div className="form-grid">
          <label>Event Type<select value={eventDraft.type} onChange={(event) => setEventDraft((current) => ({ ...current, type: event.target.value as EventDraft['type'] }))}><option value="call.missed">call.missed</option><option value="sms.received">sms.received</option><option value="job.completed">job.completed</option></select></label>
          {eventDraft.type !== 'job.completed' && <label>From Number<input value={eventDraft.fromNumber} onChange={(event) => updateDraft(setEventDraft, 'fromNumber', event.target.value)} /></label>}
          {eventDraft.type !== 'job.completed' && <label>To Number<input value={eventDraft.toNumber} onChange={(event) => updateDraft(setEventDraft, 'toNumber', event.target.value)} /></label>}
          {eventDraft.type === 'call.missed' && <label>Call SID<input value={eventDraft.callSid} onChange={(event) => updateDraft(setEventDraft, 'callSid', event.target.value)} /></label>}
          {eventDraft.type === 'sms.received' && <label className="field-span">SMS Body<textarea value={eventDraft.body} onChange={(event) => updateDraft(setEventDraft, 'body', event.target.value)} /></label>}
          {eventDraft.type === 'job.completed' && <label>Lead ID<input value={eventDraft.leadId} onChange={(event) => updateDraft(setEventDraft, 'leadId', event.target.value)} /></label>}
          {eventDraft.type === 'job.completed' && <label>Lead Phone<input value={eventDraft.leadPhone} onChange={(event) => updateDraft(setEventDraft, 'leadPhone', event.target.value)} /></label>}
          {eventDraft.type === 'job.completed' && <label>Lead Status<select value={eventDraft.leadStatus} onChange={(event) => updateDraft(setEventDraft, 'leadStatus', event.target.value)}>{LEAD_STAGES.map((stage) => <option key={stage} value={stage}>{stage}</option>)}</select></label>}
          {eventDraft.type === 'job.completed' && <label>Review URL<input value={eventDraft.reviewUrl || defaultReviewUrl} onChange={(event) => updateDraft(setEventDraft, 'reviewUrl', event.target.value)} /></label>}
        </div>
        <div className="button-row"><button className="action-button primary" type="submit" disabled={busy}>Run Event</button></div>
      </form>
    </section>
  );
}

function StackPanel({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <section className="panel">
      <div className="panel-header">
        <div><h2>{title}</h2><p>{subtitle}</p></div>
      </div>
      <div className="stack-list">{children}</div>
    </section>
  );
}

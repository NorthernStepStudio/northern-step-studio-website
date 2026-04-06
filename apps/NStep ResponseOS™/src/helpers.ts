import type { Dispatch, SetStateAction } from 'react';

import type { ProfileDraft, RevenueWorkspace } from './types';

export function updateDraft<T extends Record<string, string>>(
  setter: Dispatch<SetStateAction<T>>,
  key: keyof T,
  value: string
) {
  setter((current) => ({
    ...current,
    [key]: value,
  }));
}

export function splitCsv(value: string) {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

export function profileDraftFromWorkspace(workspace: RevenueWorkspace): ProfileDraft {
  return {
    businessName: workspace.profile.businessName || '',
    callbackNumber: workspace.profile.callbackNumber || '',
    timezone: workspace.profile.timezone || 'America/New_York',
    services: workspace.profile.services.join(', '),
    serviceArea: workspace.profile.serviceArea || '',
    websiteUrl: workspace.settings.websiteUrl || '',
    bookingLink: workspace.settings.bookingLink || '',
    reviewUrl: workspace.settings.reviewUrl || '',
    ownerAlertDestination: workspace.settings.ownerAlertDestination || '',
    contactEmail: workspace.settings.contactEmail || '',
    smsProvider: workspace.settings.sms.provider || 'simulated',
    smsConnectorId: workspace.settings.sms.connectorId || '',
    smsPath: workspace.settings.sms.path || 'Messages.json',
    emailProvider: workspace.settings.email.provider || 'simulated',
    emailConnectorId: workspace.settings.email.connectorId || '',
    emailPath: workspace.settings.email.path || '/emails',
    emailFromEmail: workspace.settings.email.fromEmail || '',
    emailFromName: workspace.settings.email.fromName || '',
    calendarProvider: workspace.settings.calendar.provider || 'simulated',
    calendarConnectorId: workspace.settings.calendar.connectorId || '',
    calendarPath: workspace.settings.calendar.path || '/events',
    calendarId: workspace.settings.calendar.calendarId || 'primary',
  };
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

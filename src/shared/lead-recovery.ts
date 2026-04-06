export type LeadRecoveryReplyOptionKey = "1" | "2" | "3" | "4";
export type LeadRecoveryConversationMode = "auto-reply" | "suggest-only" | "manual";
export type LeadRecoveryLeadStage = "new" | "engaged" | "qualified" | "recovered" | "closed";
export type LeadRecoveryUrgencyLabel = "normal" | "priority" | "emergency";
export type LeadRecoveryTaskStatus = "open" | "scheduled" | "blocked" | "done";
export type LeadRecoveryTaskType = "human_task" | "followup";

export type LeadRecoveryReplyOptionMap = Record<
  LeadRecoveryReplyOptionKey,
  {
    key: LeadRecoveryReplyOptionKey;
    title: string;
    reply: string;
  }
>;

export type LeadRecoveryEmergencyPolicy = {
  enabled: boolean;
  emergencyKeywords: string[];
  emergencyRoute: string;
};

export type LeadRecoveryProfile = {
  businessId: string;
  businessName: string;
  mainBusinessNumber: string;
  mainBusinessNumbers: string[];
  callbackNumber: string;
  timezone: string;
  services: string[];
  serviceArea: string;
  websiteUrl: string;
  bookingLink: string;
  reviewUrl: string;
  contactEmail: string;
  ownerAlertDestination: string;
  missedCallReply: string;
  replyOptions: LeadRecoveryReplyOptionMap;
  emergencyPolicy: LeadRecoveryEmergencyPolicy;
};

export type LeadRecoveryAutomationSettings = {
  tier: "starter" | "pro" | "elite";
  mode: "local" | "cloud" | "hybrid";
  vertical: "plumbing";
  maxRequestsPerDay: number;
  requestsUsedToday: number;
  requestsUsedOn?: string;
  fallbackOnFailure: boolean;
  implementationStatus: "starter_ready" | "upgrade_path";
};

export type LeadRecoverySettings = {
  websiteUrl: string;
  bookingLink: string;
  reviewUrl: string;
  ownerAlertDestination: string;
  contactEmail: string;
  automation: LeadRecoveryAutomationSettings;
  sms: {
    provider: string;
    connectorId: string;
    path: string;
    live: boolean;
    number: string;
    accountSid: string;
    heartbeatAt?: string;
    latencyMs?: number;
    status: string;
    detail: string;
  };
  email: {
    provider: string;
    connectorId: string;
    path: string;
    fromEmail: string;
    fromName: string;
    live: boolean;
    status: string;
    detail: string;
  };
  calendar: {
    provider: string;
    connectorId: string;
    path: string;
    calendarId: string;
    live: boolean;
    status: string;
    detail: string;
  };
};

export type LeadRecoveryMetrics = {
  missedCallsRecovered: number;
  inboundAutoReplies: number;
  leadIntakes: number;
  actionSuccess: number;
  actionFailures: number;
  lastUpdatedAt?: string;
};

export type LeadRecoveryLead = {
  leadId: string;
  phone: string;
  name?: string;
  email?: string;
  serviceCategory?: string;
  stage: LeadRecoveryLeadStage;
  urgencyScore: number;
  urgencyLabel?: LeadRecoveryUrgencyLabel;
  address?: string;
  notes?: string;
  lastInboundMessage?: string;
  conversationMode: LeadRecoveryConversationMode;
  messaging: {
    consentStatus: "unknown" | "active" | "opted_out";
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
  intake: {
    status: "idle" | "in_progress" | "completed";
    playbook: "starter_plumbing";
    currentQuestionKey?:
      | "issue_type"
      | "other_detail"
      | "severity_detail"
      | "urgency"
      | "location"
      | "customer_name";
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

export type LeadRecoveryTask = {
  taskId: string;
  taskType: LeadRecoveryTaskType;
  title: string;
  detail: string;
  status: LeadRecoveryTaskStatus;
  severity: "low" | "normal" | "high" | "critical";
  leadId?: string;
  scheduledFor?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
};

export type LeadRecoveryActivity = {
  activityId: string;
  kind: string;
  status: string;
  title: string;
  summary: string;
  body?: string;
  leadId?: string;
  channel?: "sms" | "call" | "system";
  direction?: "inbound" | "outbound" | "system";
  timestamp: string;
};

export type LeadRecoveryChecklistItem = {
  itemId: string;
  title: string;
  status: string;
  severity: string;
  detail: string;
};

export type LeadRecoveryWorkspace = {
  tenantId: string;
  sample: boolean;
  profile: LeadRecoveryProfile;
  settings: LeadRecoverySettings;
  metrics: LeadRecoveryMetrics;
  leads: LeadRecoveryLead[];
  followups: LeadRecoveryTask[];
  activity: LeadRecoveryActivity[];
  tasks: LeadRecoveryTask[];
  onboarding: {
    mode: "protected" | "live";
    checklist: LeadRecoveryChecklistItem[];
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
    mode: "protected" | "live";
  };
};

export const LEAD_RECOVERY_DEFAULT_TENANT_ID = "demo-plumbing-live-preview";

function isoMinutesFromNow(minutes: number, baseTime = Date.now()) {
  return new Date(baseTime + minutes * 60_000).toISOString();
}

function isoHoursAgo(hours: number, baseTime = Date.now()) {
  return new Date(baseTime - hours * 3_600_000).toISOString();
}

function isoDaysAgo(days: number, baseTime = Date.now()) {
  return new Date(baseTime - days * 86_400_000).toISOString();
}

export function createDemoLeadRecoveryWorkspace(
  tenantId = LEAD_RECOVERY_DEFAULT_TENANT_ID,
): LeadRecoveryWorkspace {
  const now = Date.now();

  const profile: LeadRecoveryProfile = {
    businessId: tenantId,
    businessName: "Demo Plumbing",
    mainBusinessNumber: "+12025550100",
    mainBusinessNumbers: ["+12025550100", "+12025550101"],
    callbackNumber: "+18777550689",
    timezone: "America/New_York",
    services: ["Leak repair", "Drain clearing", "Water heater help"],
    serviceArea: "Queens, NY",
    websiteUrl: "https://demo-plumbing.example.com",
    bookingLink: "https://demo-plumbing.example.com/book",
    reviewUrl: "https://g.page/r/demo-plumbing",
    contactEmail: "office@demo-plumbing.example.com",
    ownerAlertDestination: "+12025550122",
    missedCallReply:
      "Hey, sorry we missed your call. What's going on - leak, clog, water heater, or something else?",
    replyOptions: {
      "1": {
        key: "1",
        title: "Leak",
        reply: "Thanks. Is the leak actively dripping or pooling anywhere right now?",
      },
      "2": {
        key: "2",
        title: "Clog",
        reply: "Thanks. Is the sink completely blocked or just draining slowly?",
      },
      "3": {
        key: "3",
        title: "Other",
        reply: "Thanks. Tell us the best detail about the plumbing issue so we can route it correctly.",
      },
      "4": {
        key: "4",
        title: "Urgent",
        reply: "Thanks. Is water actively leaking or backing up right now, and what address should we use?",
      },
    },
    emergencyPolicy: {
      enabled: true,
      emergencyKeywords: ["urgent", "emergency", "asap"],
      emergencyRoute: "Route urgent damage straight to the office and flag the owner immediately.",
    },
  };

  const settings: LeadRecoverySettings = {
    websiteUrl: profile.websiteUrl,
    bookingLink: profile.bookingLink,
    reviewUrl: profile.reviewUrl,
    ownerAlertDestination: profile.ownerAlertDestination,
    contactEmail: profile.contactEmail,
    automation: {
      tier: "starter",
      mode: "hybrid",
      vertical: "plumbing",
      maxRequestsPerDay: 75,
      requestsUsedToday: 18,
      requestsUsedOn: new Date(now).toISOString().slice(0, 10),
      fallbackOnFailure: true,
      implementationStatus: "starter_ready",
    },
    sms: {
      provider: "twilio",
      connectorId: "AC00000000000000000000000000000000",
      path: "Messages.json",
      live: true,
      number: profile.callbackNumber,
      accountSid: "AC00000000000000000000000000000000",
      heartbeatAt: isoMinutesFromNow(-6, now),
      latencyMs: 186,
      status: "ready",
      detail: "Twilio relay is responding normally.",
    },
    email: {
      provider: "resend",
      connectorId: "re_demo_001",
      path: "/emails",
      fromEmail: "hello@northernstepstudio.com",
      fromName: "Northern Step Studio",
      live: true,
      status: "ready",
      detail: "Owner alerts and approval mail are active.",
    },
    calendar: {
      provider: "simulated",
      connectorId: "",
      path: "/events",
      calendarId: "primary",
      live: false,
      status: "optional",
      detail: "Calendar sync is optional for recovery follow-up.",
    },
  };

  const leads: LeadRecoveryLead[] = [
    {
      leadId: "lead_demo_1",
      phone: "+13475550110",
      name: "Maria Santos",
      email: "maria@example.com",
      serviceCategory: "Drain clearing",
      stage: "recovered",
      urgencyScore: 92,
      urgencyLabel: "priority",
      address: "Astoria, Queens",
      notes: "Text-back sent. Callback scheduled for this afternoon.",
      lastInboundMessage: "The sink is backing up again. Can someone call me today?",
      conversationMode: "auto-reply",
      messaging: {
        consentStatus: "active",
        consentSource: "missed-call text back",
        consentUpdatedAt: isoHoursAgo(5, now),
        lastHelpSentAt: isoHoursAgo(5, now),
        lastKeyword: "clog",
        lastOutboundStatus: "delivered",
        lastOutboundStatusAt: isoHoursAgo(5, now),
        lastOutboundMessageSid: "SMdemo001",
      },
      intake: {
        status: "completed",
        playbook: "starter_plumbing",
        currentQuestionKey: "customer_name",
        answers: {
          issueType: "clog",
          issueDescription: "Kitchen sink backing up.",
          severityDetail: "Drain is blocked and water is pooling.",
          urgentDamage: "No active flooding",
          location: "Kitchen",
          customerName: "Maria Santos",
        },
        startedAt: isoHoursAgo(6, now),
        completedAt: isoHoursAgo(5, now),
        ownerSummarySentAt: isoHoursAgo(5, now),
      },
      updatedAt: isoHoursAgo(4, now),
      createdAt: isoDaysAgo(2, now),
    },
    {
      leadId: "lead_demo_2",
      phone: "+13475550111",
      name: "Jordan Lee",
      email: "jordan@example.com",
      serviceCategory: "Leak repair",
      stage: "engaged",
      urgencyScore: 74,
      urgencyLabel: "priority",
      address: "Long Island City",
      notes: "Needs a same-day callback.",
      lastInboundMessage: "There is a leak under the bathroom sink.",
      conversationMode: "suggest-only",
      messaging: {
        consentStatus: "active",
        consentSource: "manual import",
        consentUpdatedAt: isoHoursAgo(10, now),
        lastHelpSentAt: isoHoursAgo(2, now),
        lastKeyword: "leak",
        lastOutboundStatus: "delivered",
        lastOutboundStatusAt: isoHoursAgo(2, now),
        lastOutboundMessageSid: "SMdemo002",
      },
      intake: {
        status: "in_progress",
        playbook: "starter_plumbing",
        currentQuestionKey: "urgency",
        answers: {
          issueType: "leak",
          issueDescription: "Under-sink leak in the bathroom.",
          severityDetail: "Small leak but spreading.",
        },
        startedAt: isoHoursAgo(2, now),
      },
      updatedAt: isoHoursAgo(1, now),
      createdAt: isoDaysAgo(1, now),
    },
    {
      leadId: "lead_demo_3",
      phone: "+13475550112",
      name: "Priya Patel",
      email: "priya@example.com",
      serviceCategory: "Water heater",
      stage: "qualified",
      urgencyScore: 61,
      urgencyLabel: "normal",
      address: "Jamaica, Queens",
      notes: "Waiting for quote approval.",
      lastInboundMessage: "The water heater is making a loud popping sound.",
      conversationMode: "manual",
      messaging: {
        consentStatus: "active",
        consentSource: "missed-call text back",
        consentUpdatedAt: isoHoursAgo(14, now),
        lastHelpSentAt: isoHoursAgo(14, now),
        lastKeyword: "water heater",
        lastOutboundStatus: "delivered",
        lastOutboundStatusAt: isoHoursAgo(14, now),
        lastOutboundMessageSid: "SMdemo003",
      },
      intake: {
        status: "completed",
        playbook: "starter_plumbing",
        currentQuestionKey: "customer_name",
        answers: {
          issueType: "water heater",
          issueDescription: "Popping and banging from tank.",
          severityDetail: "Hot water is still available but noisy.",
          urgentDamage: "No active flooding",
          location: "Utility closet",
          customerName: "Priya Patel",
        },
        startedAt: isoHoursAgo(16, now),
        completedAt: isoHoursAgo(15, now),
        ownerSummarySentAt: isoHoursAgo(15, now),
      },
      updatedAt: isoHoursAgo(1, now),
      createdAt: isoDaysAgo(3, now),
    },
    {
      leadId: "lead_demo_4",
      phone: "+13475550113",
      name: "Carlos Rivera",
      email: "carlos@example.com",
      serviceCategory: "Emergency shutoff",
      stage: "new",
      urgencyScore: 98,
      urgencyLabel: "emergency",
      address: "Flushing, Queens",
      notes: "Potential emergency damage.",
      lastInboundMessage: "Water is coming through the ceiling right now.",
      conversationMode: "auto-reply",
      messaging: {
        consentStatus: "active",
        consentSource: "missed-call text back",
        consentUpdatedAt: isoHoursAgo(1, now),
        lastHelpSentAt: isoHoursAgo(1, now),
        lastKeyword: "urgent",
        lastOutboundStatus: "delivered",
        lastOutboundStatusAt: isoHoursAgo(1, now),
        lastOutboundMessageSid: "SMdemo004",
      },
      intake: {
        status: "in_progress",
        playbook: "starter_plumbing",
        currentQuestionKey: "urgency",
        answers: {
          issueType: "other",
          issueDescription: "Water damage from ceiling leak.",
          otherDetail: "Active leak through the ceiling.",
          urgentDamage: "Yes, water is actively leaking",
        },
        startedAt: isoHoursAgo(1, now),
      },
      updatedAt: isoMinutesFromNow(-30, now),
      createdAt: isoHoursAgo(20, now),
    },
  ];

  const followups: LeadRecoveryTask[] = [
    {
      taskId: "followup_demo_1",
      taskType: "followup",
      title: "Call Maria Santos back",
      detail: "Confirm the drain-clearing slot and make sure the kitchen sink is stable.",
      status: "scheduled",
      severity: "high",
      leadId: "lead_demo_1",
      scheduledFor: isoMinutesFromNow(55, now),
      createdAt: isoHoursAgo(5, now),
      updatedAt: isoHoursAgo(5, now),
    },
    {
      taskId: "followup_demo_2",
      taskType: "followup",
      title: "Send emergency callback to Carlos",
      detail: "Owner intervention is needed before the afternoon floods get worse.",
      status: "open",
      severity: "critical",
      leadId: "lead_demo_4",
      scheduledFor: isoMinutesFromNow(10, now),
      createdAt: isoHoursAgo(1, now),
      updatedAt: isoHoursAgo(1, now),
    },
  ];

  const tasks: LeadRecoveryTask[] = [
    ...followups,
    {
      taskId: "task_demo_1",
      taskType: "human_task",
      title: "Review opt-out handling",
      detail: "Check the SMS fallback copy for any user who replies STOP.",
      status: "open",
      severity: "normal",
      createdAt: isoHoursAgo(7, now),
      updatedAt: isoHoursAgo(3, now),
    },
    {
      taskId: "task_demo_2",
      taskType: "human_task",
      title: "Validate Twilio heartbeat",
      detail: "Make sure the relay number and account SID remain in sync.",
      status: "done",
      severity: "low",
      completedAt: isoHoursAgo(1, now),
      createdAt: isoHoursAgo(6, now),
      updatedAt: isoHoursAgo(1, now),
    },
  ];

  const activity: LeadRecoveryActivity[] = [
    {
      activityId: "activity_demo_1",
      kind: "sms.inbound",
      status: "done",
      title: "New inbound SMS from Maria",
      summary: "Auto-reply opened the recovery flow and captured the issue.",
      body: "The sink is backing up again. Can someone call me today?",
      leadId: "lead_demo_1",
      channel: "sms",
      direction: "inbound",
      timestamp: isoHoursAgo(5, now),
    },
    {
      activityId: "activity_demo_2",
      kind: "sms.outbound",
      status: "done",
      title: "Follow-up text sent to Jordan",
      summary: "Suggested callback window and captured urgency details.",
      body: "We received your leak alert and flagged this for a same-day callback.",
      leadId: "lead_demo_2",
      channel: "sms",
      direction: "outbound",
      timestamp: isoHoursAgo(2, now),
    },
    {
      activityId: "activity_demo_3",
      kind: "sms.inbound",
      status: "done",
      title: "Emergency escalation from Carlos",
      summary: "Heartbeat flagged an urgent leak and routed manual intervention.",
      body: "Water is coming through the ceiling right now.",
      leadId: "lead_demo_4",
      channel: "sms",
      direction: "inbound",
      timestamp: isoMinutesFromNow(-25, now),
    },
    {
      activityId: "activity_demo_4",
      kind: "task.completed",
      status: "done",
      title: "Twilio heartbeat checked",
      summary: "Relay line passed the health check with a low response latency.",
      channel: "system",
      direction: "system",
      timestamp: isoHoursAgo(1, now),
    },
    {
      activityId: "activity_demo_5",
      kind: "lead.recovered",
      status: "done",
      title: "Maria Santos recovered",
      summary: "Recovered call moved from missed call to scheduled callback.",
      body: "Call back scheduled for later this afternoon.",
      leadId: "lead_demo_1",
      channel: "system",
      direction: "system",
      timestamp: isoHoursAgo(4, now),
    },
  ];

  const checklist: LeadRecoveryChecklistItem[] = [
    { itemId: "business_name", title: "Business name", status: "complete", severity: "low", detail: "Workspace branding is set." },
    { itemId: "main_business_number", title: "Main business number", status: "complete", severity: "low", detail: "Customers dial the published office line." },
    { itemId: "callback_number", title: "Twilio callback number", status: "complete", severity: "low", detail: "The hidden relay number is configured." },
    { itemId: "owner_alert_destination", title: "Owner alert destination", status: "complete", severity: "low", detail: "Owner escalation reaches the right phone." },
    { itemId: "response_channel", title: "SMS response channel", status: "complete", severity: "low", detail: "Auto-reply and manual override are both active." },
    { itemId: "public_webhook", title: "Public webhook", status: "complete", severity: "low", detail: "The response webhook is reachable." },
    { itemId: "first_live_test", title: "First live test", status: "complete", severity: "low", detail: "A live missed-call test already completed." },
  ];

  return {
    tenantId,
    sample: true,
    profile,
    settings,
    metrics: {
      missedCallsRecovered: 18,
      inboundAutoReplies: 27,
      leadIntakes: 21,
      actionSuccess: 94,
      actionFailures: 2,
      lastUpdatedAt: isoMinutesFromNow(-15, now),
    },
    leads,
    followups,
    activity,
    tasks,
    onboarding: {
      mode: "live",
      checklist,
      channels: {
        sms: { status: "ready", provider: settings.sms.provider, connectorId: settings.sms.connectorId, live: settings.sms.live, detail: settings.sms.detail },
        email: { status: "ready", provider: settings.email.provider, connectorId: settings.email.connectorId, live: settings.email.live, detail: settings.email.detail },
        calendar: { status: "optional", provider: settings.calendar.provider, connectorId: settings.calendar.connectorId, live: settings.calendar.live, detail: settings.calendar.detail },
      },
      summary: {
        requiredComplete: checklist.length,
        requiredTotal: checklist.length,
        blockerCount: 0,
        missingCount: 0,
      },
    },
    summary: {
      leadCount: leads.length,
      pendingFollowups: followups.filter((task) => task.status !== "done").length,
      dueFollowups: followups.filter((task) => task.status !== "done" && task.scheduledFor && task.scheduledFor <= new Date(now).toISOString()).length,
      lastActivityAt: activity[0]?.timestamp,
      openTaskCount: tasks.filter((task) => task.taskType !== "followup" && task.status !== "done").length,
      mode: "live",
    },
  };
}

type MentionNotificationPayload = {
  recipientIds: number[];
  referenceType: string;
  referenceId: number;
  content: string;
};

export async function sendMentionNotifications(payload: MentionNotificationPayload) {
  const recipientIds = Array.from(new Set(payload.recipientIds.filter((id) => Number.isFinite(id) && id > 0)));

  if (recipientIds.length === 0) {
    return;
  }

  await Promise.all(
    recipientIds.map(async (recipientId) => {
      const response = await fetch("/api/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipient_id: recipientId,
          type: "mention",
          reference_type: payload.referenceType,
          reference_id: payload.referenceId,
          content: payload.content,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.error || `Failed to create notification for recipient ${recipientId}`);
      }
    }),
  );
}

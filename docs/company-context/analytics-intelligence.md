# Synox Analytics and Business Intelligence: Privacy & Safety

This document outlines the scope, data retention, and privacy protections for the internal analytics and business intelligence system within Northern Step Studio.

## 1. Scope of Tracking
The system tracks internal operational metrics to help Matterhorn/Synox provide grounded business advice. It is **not** a public user surveillance system.

### Tracked Data:
*   **Website/App Interactions**: Page views, CTA clicks, play button clicks (anonymized, no PII).
*   **Admin Activity**: Audit logs of actions taken within Studio Intelligence (e.g., project updates, memory seeding).
*   **Build/Deployment Trends**: Counts and durations of engineering processes.
*   **Project Health**: Aggregated signals of notes, decisions, and risks.

### Prohibited Data:
*   **Personal Identifiable Information (PII)**: No names, emails, or phone numbers are stored in analytics.
*   **Secrets/Credentials**: Automatically redacted by Synox before storage.
*   **External Paid Tracking**: No third-party trackers (Google Analytics, Mixpanel, etc.) are integrated.

## 2. Retention and Aggregation
*   **Raw Events**: Retained for 90 days in the `analytics` table.
*   **Aggregated Momentum**: Daily summaries are stored indefinitely in `app_momentum_daily` to provide long-term trending awareness to Synox.
*   **Audit Logs**: Admin activity logs are kept for compliance and operational recovery.

## 3. Access Control
*   **Admin-Only**: All analytics and business intelligence routes are restricted to verified Northern Step Studio administrators.
*   **No Public Endpoints**: There are no public-facing API routes for analytics retrieval.

## 4. Matterhorn Advisory Role
Matterhorn uses this data to provide **advisory recommendations only**.
*   Matterhorn cannot execute business decisions (e.g., stopping a project, starting a launch).
*   Matterhorn cannot modify pricing or financial settings autonomously.
*   All outputs are phrased as "Based on current data, I recommend..." or "The trending momentum suggests...".

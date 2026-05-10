# Synox Executive Command Center: Operational Overview

This document defines the purpose and safety boundaries of the Executive Command Center within Studio Intelligence.

## 1. Core Purpose
The Command Center is a unified operational layer that synthesizes project intelligence, engineering health, and business momentum into actionable advisory signals for Northern Step Studio.

## 2. Advisory-Only Status
**Matterhorn and Synox are strictly advisory.**
*   The Command Center **recommends** actions; it does not execute them.
*   The Action Queue stores **suggested** next steps; they require manual approval and external execution.
*   No deployment, code modification, or file deletion can be triggered from this module.

## 3. Action Queue Statuses
*   **Suggested**: Default state for AI-generated recommendations.
*   **Accepted**: Admin has reviewed and intends to execute manually.
*   **In Progress**: Action is currently being performed externally.
*   **Done**: Action completed and verified.
*   **Blocked**: External dependencies prevent progress.
*   **Dismissed**: Recommendation rejected or no longer relevant.

## 4. Matterhorn Recommendation Format
Every recommendation produced by Matterhorn follows a grounded evidence structure:
1.  **Recommendation**: Clear, concise advisory statement.
2.  **Rationale**: Why it matters (the "Why").
3.  **Evidence**: Data sources used (e.g., build failure logs, risk impact).
4.  **Risk Level**: Impact of following or ignoring the advice.
5.  **Confidence**: AI's certainty based on available grounding.
6.  **Next Manual Step**: The exact human action required.

## 5. Prompt Output Support
The Command Center can generate structured text prompts designed for:
*   **Codex/Local Agents**: Scoped instructions for technical fixes.
*   **Build Debugging**: Investigation steps for failed CI/CD runs.
*   **Content Strategy**: Reasoning for launch readiness updates.

## 6. Safety Boundaries
*   **No Secret Exposure**: All logs and metadata are scrubbed of secrets before being presented.
*   **No Autonomous Deletion**: There are no destructive endpoints in the Command Center.
*   **No File Write Access**: Matterhorn cannot write to the repository; it can only suggest code snippets for manual application.

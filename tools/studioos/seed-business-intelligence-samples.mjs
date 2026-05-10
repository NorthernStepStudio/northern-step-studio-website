import fs from 'fs/promises';
import path from 'path';

/**
 * NStep AI: Business Intelligence Sample Seeder
 */

const API_ROOT = "http://127.0.0.1:8787/api/admin/intelligence";

async function seed() {
  console.log("🌱 Seeding Business Intelligence samples...");

  try {
    // 1. Seed Admin Activity
    await fetch(`${API_ROOT}/activity`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "login",
        target_type: "dashboard",
        summary: "Admin login from secure workstation."
      })
    });

    await fetch(`${API_ROOT}/activity`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "update_memory",
        target_type: "assistant_memory",
        summary: "Updated canonical naming rules in operational memory."
      })
    });

    // 2. Create sample Action Queue items
    const API_ASSISTANT = "http://127.0.0.1:8787/api/admin/intelligence";
    
    const ACTIONS = [
      {
        title: "Review latest repo snapshot",
        description: "A new snapshot was generated. Analyze for architectural drift.",
        priority: "medium",
        risk_level: "low",
        source_type: "system",
        reasoning_summary: "Fresh snapshot available for reasoning.",
        suggested_prompt: "What are the main architectural changes in the latest snapshot?"
      },
      {
        title: "Review failed Android build phase",
        description: "NeuroMoves build failed during gradle phase. Investigate OOM errors.",
        priority: "high",
        risk_level: "medium",
        source_type: "build_failure",
        reasoning_summary: "Build failure detected in logs.",
        suggested_prompt: "Explain the cause of the NeuroMoves build failure and suggest a fix."
      },
      {
        title: "Update launch readiness for NeuroMoves",
        description: "High severity warning detected in readiness check: Keystore rotation.",
        priority: "critical",
        risk_level: "high",
        source_type: "readiness_warning",
        reasoning_summary: "Readiness check warning for signing secrets.",
        suggested_prompt: "What steps are needed to resolve the keystore rotation warning for NeuroMoves?"
      }
    ];

    for (const action of ACTIONS) {
      await fetch(`${API_ASSISTANT}/actions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(action)
      });
    }

    console.log("✅  Seeding complete.");
  } catch (err) {
    console.error("❌  Seeding failed:", err.message);
  }
}

seed();

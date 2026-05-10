import fs from 'fs/promises';
import path from 'path';

/**
 * NStep AI: Build & Deployment Sample Seeder
 */

const API_ROOT = "http://127.0.0.1:8787/api/admin/intelligence";

async function seed() {
  console.log("🌱 Seeding Build & Deployment samples...");

  try {
    // 1. Create a Build Run
    const buildId = crypto.randomUUID();
    await fetch(`${API_ROOT}/builds`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: buildId,
        app_key: "neurormoves",
        platform: "android",
        build_type: "release",
        status: "failed",
        version_name: "1.2.0",
        version_code: 42,
        summary: "Android production build failed during Gradle execution.",
        risk_level: "medium"
      })
    });

    // 2. Add Logs to the Build
    await fetch(`${API_ROOT}/builds/${buildId}/logs`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        phase: "gradle",
        level: "error",
        message: "Execution failed for task ':app:bundleRelease'. > A failure occurred while executing com.android.build.gradle.internal.tasks.Workers$ActionFacade > java.lang.OutOfMemoryError (fake log)"
      })
    });

    // 3. Create a Deployment Run
    const deployId = crypto.randomUUID();
    await fetch(`${API_ROOT}/deployments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: deployId,
        app_key: "northern-step-studio-website",
        environment: "production",
        provider: "cloudflare",
        status: "completed",
        url: "https://northernstep.studio",
        summary: "Successful production deployment of the main studio website.",
        risk_level: "low"
      })
    });

    // 4. Create Release Readiness Checks
    await fetch(`${API_ROOT}/readiness`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        app_key: "provly",
        check_key: "auth_verified",
        status: "passed",
        message: "RBAC systems verified for ProvLy admin routes.",
        severity: "normal"
      })
    });

    await fetch(`${API_ROOT}/readiness`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        app_key: "neurormoves",
        check_key: "signing_keystore",
        status: "warning",
        message: "Keystore password rotation is overdue.",
        severity: "high"
      })
    });

    console.log("✅  Seeding complete.");
  } catch (err) {
    console.error("❌  Seeding failed:", err.message);
  }
}

seed();

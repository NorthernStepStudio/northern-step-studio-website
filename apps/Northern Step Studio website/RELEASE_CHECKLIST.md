# Northern Step Studio: Release Verification

Complete these 5 quick steps after every production push to the `main` branch.

### 🏁 Step 1: GitHub Build Check
Visit the **"Actions"** tab in your GitHub repository.
- Ensure the **"Cloudflare Production Deploy"** workflow is GREEN.
- If it's RED, check the logs for build-time errors.

### 🩺 Step 2: Version Verification
Visit: `https://northernstepstudio.com/api/health`
- Ensure the `"version"` field matches the latest version in your `package.json` (currently **1.0.8**).
- This confirms that the Cloudflare Worker itself is fresh.

### ⚡ Step 3: Visual Check (Hard Refresh)
Visit: `https://northernstepstudio.com/`
- Press **Ctrl+F5** (Windows) or **Cmd+Shift+R** (Mac).
- Ensure your latest UI changes (e.g. the Hero reorganization) are visible.

### 🤖 Step 4: AI Assistant Heartbeat
Visit: `https://northernstepstudio.com/ai` (or use the chat bubble).
- Send a test message: *"Hello"*.
- If it responds accurately, your backend worker and Gemini API are linked correctly.

### 🧹 Step 5: Cloudflare Purge (Emergency Only)
If you still see stale files despite the version being correct:
1. Log in to [Cloudflare Dashboard](https://dash.cloudflare.com).
2. Go to: **Caching** > **Configuration**.
3. Click **"Purge Everything"**.
4. Your site will respond with the latest version within 30 seconds globally.

---
*Note: Our new cache strategy automates this, so Step 5 should rarely be needed.*

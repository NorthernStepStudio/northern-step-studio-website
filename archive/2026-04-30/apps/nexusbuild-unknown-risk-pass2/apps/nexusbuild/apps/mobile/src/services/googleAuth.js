/**
 * Google OAuth Sign-In service for NexusBuild mobile app.
 *
 * Uses expo-web-browser to open a Chrome Custom Tab with the Google
 * consent screen. The backend handles token exchange and user
 * creation/lookup, then redirects back to the app via deep link.
 */

import * as AuthSession from "expo-auth-session";
import * as WebBrowser from "expo-web-browser";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";
import { getApiBaseUrl } from "../core/config";
import logger from "../core/logger";

// Ensures the auth session is properly completed on Android
WebBrowser.maybeCompleteAuthSession();

/**
 * Warm up the Android Chrome Custom Tab for faster opening.
 */
export function warmUpBrowser() {
  if (Platform.OS === "android") {
    WebBrowser.warmUpAsync().catch(() => {});
  }
}

export function coolDownBrowser() {
  if (Platform.OS === "android") {
    WebBrowser.coolDownAsync().catch(() => {});
  }
}

const parseCallbackParams = (callbackUrl) => {
  try {
    const parsed = new URL(callbackUrl);
    if (parsed.search) {
      return new URLSearchParams(parsed.search);
    }
    if (parsed.hash) {
      const hash = parsed.hash.startsWith("#")
        ? parsed.hash.slice(1)
        : parsed.hash;
      return new URLSearchParams(hash);
    }
  } catch {
    // Fallback parser for malformed/custom callback URLs.
  }

  const queryIndex = callbackUrl.indexOf("?");
  const hashIndex = callbackUrl.indexOf("#");
  const payloadStart = queryIndex >= 0 ? queryIndex + 1 : hashIndex + 1;
  const payload =
    payloadStart > 0 && payloadStart < callbackUrl.length
      ? callbackUrl.slice(payloadStart)
      : "";

  return new URLSearchParams(payload);
};

const getParam = (params, key) => {
  const value = params.get(key);
  return typeof value === "string" && value.length > 0 ? value : null;
};

/**
 * Initiate Google Sign-In from the mobile app.
 *
 * Returns { success: true, token, user } on success,
 * or { success: false, error: string } on failure.
 */
export async function signInWithGoogle() {
  const apiBase = getApiBaseUrl();
  if (!apiBase) {
    return { success: false, error: "API base URL is not configured." };
  }

  try {
    // Step 1: Ask the backend for the Google OAuth redirect URL.
    logger.log("[GoogleAuth] Fetching redirect URL.");
    const redirectInfoResponse = await fetch(
      `${apiBase}/auth/google/redirect_url?platform=mobile`,
    );

    if (!redirectInfoResponse.ok) {
      const errorBody = await redirectInfoResponse.json().catch(() => ({}));
      logger.error(
        "[GoogleAuth] Backend error:",
        redirectInfoResponse.status,
        errorBody,
      );
      return {
        success: false,
        error: errorBody?.message || "Google sign-in is not available right now.",
      };
    }

    const { redirectUrl } = await redirectInfoResponse.json();
    if (!redirectUrl) {
      return { success: false, error: "Backend returned no redirect URL." };
    }
    logger.log("[GoogleAuth] Got Google auth URL from backend.");

    // Step 2: Build the callback URI that the auth session listens for.
    const redirectUri = AuthSession.makeRedirectUri({
      scheme: "nexusbuild",
      path: "auth/callback",
    });
    logger.log("[GoogleAuth] Callback redirect URI:", redirectUri);

    // Step 3: Tell the backend to redirect back to mobile via the state param.
    const state = JSON.stringify({
      platform: "mobile",
      redirect_uri: redirectUri,
    });

    const authUrl = `${redirectUrl}&state=${encodeURIComponent(state)}`;
    logger.log("[GoogleAuth] Opening browser auth session...");

    // Step 4: Open Chrome Custom Tab for Google consent.
    const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUri, {
      showInRecents: true,
    });

    logger.log("[GoogleAuth] Browser result type:", result.type);

    if (result.type !== "success" || !result.url) {
      if (result.type === "cancel" || result.type === "dismiss") {
        return { success: false, error: "Sign-in was cancelled." };
      }
      return {
        success: false,
        error: `Sign-in could not be completed (${result.type}).`,
      };
    }

    // Step 5: Parse callback params.
    logger.log("[GoogleAuth] Parsing callback response.");
    const params = parseCallbackParams(result.url);

    const oauthError = getParam(params, "error");
    if (oauthError) {
      const errorDescription =
        getParam(params, "error_description") ||
        getParam(params, "message") ||
        oauthError;
      logger.error("[GoogleAuth] OAuth error:", oauthError, errorDescription);
      return {
        success: false,
        error: errorDescription,
      };
    }

    const token = getParam(params, "token");
    const refreshToken = getParam(params, "refresh_token");
    const userJson = getParam(params, "user");

    if (!token) {
      logger.error("[GoogleAuth] No token in callback response.");
      return { success: false, error: "No authentication token received." };
    }

    // Step 6: Extract user from inline payload or fetch /auth/me.
    let user = null;
    if (userJson) {
      try {
        user = JSON.parse(userJson);
      } catch {
        logger.warn("[GoogleAuth] Failed to parse inline user, fetching /auth/me.");
      }
    }

    if (!user) {
      const meResponse = await fetch(`${apiBase}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (meResponse.ok) {
        user = await meResponse.json();
      }
    }

    if (!user) {
      return {
        success: false,
        error: "Signed in but could not retrieve user profile.",
      };
    }

    // Step 7: Persist session.
    await AsyncStorage.setItem("authToken", token);
    if (refreshToken) {
      await AsyncStorage.setItem("refreshToken", refreshToken);
    }
    await AsyncStorage.setItem("user", JSON.stringify(user));

    logger.log("[GoogleAuth] Sign-in completed successfully.");
    return { success: true, token, refreshToken, user };
  } catch (err) {
    logger.error("[GoogleAuth] Error:", err);
    return {
      success: false,
      error: err?.message || "An unexpected error occurred during sign-in.",
    };
  }
}

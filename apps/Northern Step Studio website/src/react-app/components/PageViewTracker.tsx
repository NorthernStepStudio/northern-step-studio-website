import { useEffect, useRef } from "react";
import { useLocation } from "react-router";
import { useAuth } from "@/react-app/lib/auth";

/**
 * PageViewTracker automatically tracks page views to the analytics system.
 * Records:
 * - Page path and full URL
 * - Referrer (where the user came from)
 * - User agent and screen size
 * - Session ID (generated per browser session)
 * - User ID (if authenticated)
 */
export default function PageViewTracker() {
  const location = useLocation();
  const { user } = useAuth();
  const previousPath = useRef<string>("");

  useEffect(() => {
    // Don't track if path hasn't changed (avoids duplicate tracking on re-renders)
    if (location.pathname === previousPath.current) {
      return;
    }

    previousPath.current = location.pathname;

    // Get or create session ID (persists for browser session)
    let sessionId = sessionStorage.getItem("visitor_session_id");
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem("visitor_session_id", sessionId);
    }

    // Track page view
    const trackPageView = async () => {
      try {
        await fetch("/api/analytics/track", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            event: "page_view",
            user_id: user?.id || null,
            metadata: JSON.stringify({
              path: location.pathname,
              search: location.search,
              hash: location.hash,
              full_url: window.location.href,
              referrer: document.referrer || "direct",
              session_id: sessionId,
              user_agent: navigator.userAgent,
              screen_width: window.screen.width,
              screen_height: window.screen.height,
              timestamp: new Date().toISOString(),
            }),
          }),
        });
      } catch (error) {
        // Silently fail - don't disrupt user experience if tracking fails
        console.error("Analytics tracking failed:", error);
      }
    };

    trackPageView();
  }, [location, user]);

  return null;
}

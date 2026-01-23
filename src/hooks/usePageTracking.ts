import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

// Generate a unique session ID for tracking
const getSessionId = () => {
  let sessionId = sessionStorage.getItem("analytics_session_id");
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    sessionStorage.setItem("analytics_session_id", sessionId);
  }
  return sessionId;
};

// Detect device type
const getDeviceType = (): string => {
  const ua = navigator.userAgent;
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
    return "tablet";
  }
  if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) {
    return "mobile";
  }
  return "desktop";
};

// Detect browser
const getBrowser = (): string => {
  const ua = navigator.userAgent;
  if (ua.includes("Firefox")) return "Firefox";
  if (ua.includes("SamsungBrowser")) return "Samsung Browser";
  if (ua.includes("Opera") || ua.includes("OPR")) return "Opera";
  if (ua.includes("Trident")) return "IE";
  if (ua.includes("Edge")) return "Edge Legacy";
  if (ua.includes("Edg")) return "Edge";
  if (ua.includes("Chrome")) return "Chrome";
  if (ua.includes("Safari")) return "Safari";
  return "Unknown";
};

// Detect OS
const getOS = (): string => {
  const ua = navigator.userAgent;
  if (ua.includes("Windows")) return "Windows";
  if (ua.includes("Mac OS")) return "macOS";
  if (ua.includes("Linux")) return "Linux";
  if (ua.includes("Android")) return "Android";
  if (ua.includes("iOS") || ua.includes("iPhone") || ua.includes("iPad")) return "iOS";
  return "Unknown";
};

export const usePageTracking = () => {
  const location = useLocation();
  const pageEntryTime = useRef<number>(Date.now());
  const currentPageViewId = useRef<string | null>(null);

  useEffect(() => {
    const trackPageView = async () => {
      try {
        const sessionId = getSessionId();
        pageEntryTime.current = Date.now();

        const { data, error } = await supabase.from("page_views").insert({
          page_path: location.pathname,
          page_title: document.title,
          referrer: document.referrer || null,
          user_agent: navigator.userAgent,
          session_id: sessionId,
          device_type: getDeviceType(),
          browser: getBrowser(),
          os: getOS(),
          screen_width: window.screen.width,
          screen_height: window.screen.height,
        }).select('id').single();

        if (!error && data) {
          currentPageViewId.current = data.id;
        }
        // Silently ignore errors - table may not exist
      } catch {
        // Silently fail - don't break the app for analytics
      }
    };

    trackPageView();

    // Update time spent when leaving page
    return () => {
      if (currentPageViewId.current) {
        const timeSpent = Math.round((Date.now() - pageEntryTime.current) / 1000);
        // Fire and forget - don't await
        supabase
          .from("page_views")
          .update({ time_spent: timeSpent })
          .eq("id", currentPageViewId.current)
          .then(() => {});
      }
    };
  }, [location.pathname]);
};

import { useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

interface UseSessionTimeoutOptions {
  timeoutMinutes?: number;
  warningMinutes?: number;
  onTimeout?: () => void;
}

export const useSessionTimeout = ({
  timeoutMinutes = 15,
  warningMinutes = 2,
  onTimeout,
}: UseSessionTimeoutOptions = {}) => {
  const navigate = useNavigate();
  const { signOut, user } = useAuth();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const warningRef = useRef<NodeJS.Timeout | null>(null);
  const warningShownRef = useRef(false);

  const handleTimeout = useCallback(async () => {
    if (onTimeout) {
      onTimeout();
    }

    // Clear session storage
    sessionStorage.clear();

    // Sign out
    await signOut();

    toast.info("Session expired due to inactivity. Please sign in again.");
    navigate("/admin/auth", { replace: true });
  }, [signOut, navigate, onTimeout]);

  const showWarning = useCallback(() => {
    if (!warningShownRef.current) {
      warningShownRef.current = true;
      toast.warning(`Session will expire in ${warningMinutes} minutes due to inactivity.`, {
        duration: 10000,
      });
    }
  }, [warningMinutes]);

  const resetTimer = useCallback(() => {
    // Clear existing timers
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (warningRef.current) {
      clearTimeout(warningRef.current);
    }

    // Reset warning flag
    warningShownRef.current = false;

    // Only set timers if user is logged in
    if (!user) return;

    const timeoutMs = timeoutMinutes * 60 * 1000;
    const warningMs = (timeoutMinutes - warningMinutes) * 60 * 1000;

    // Set warning timer
    warningRef.current = setTimeout(showWarning, warningMs);

    // Set timeout timer
    timeoutRef.current = setTimeout(handleTimeout, timeoutMs);
  }, [timeoutMinutes, warningMinutes, user, handleTimeout, showWarning]);

  useEffect(() => {
    if (!user) return;

    // Events that reset the timer
    const events = [
      "mousedown",
      "mousemove",
      "keydown",
      "scroll",
      "touchstart",
      "click",
    ];

    // Throttle the reset to avoid excessive calls
    let lastReset = Date.now();
    const throttledReset = () => {
      const now = Date.now();
      if (now - lastReset > 1000) {
        lastReset = now;
        resetTimer();
      }
    };

    // Add event listeners
    events.forEach((event) => {
      document.addEventListener(event, throttledReset, { passive: true });
    });

    // Initial timer setup
    resetTimer();

    // Cleanup
    return () => {
      events.forEach((event) => {
        document.removeEventListener(event, throttledReset);
      });
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (warningRef.current) {
        clearTimeout(warningRef.current);
      }
    };
  }, [user, resetTimer]);

  return { resetTimer };
};

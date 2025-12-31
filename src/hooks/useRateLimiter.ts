import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface RateLimitState {
  allowed: boolean;
  remaining: number;
  resetIn: number;
  limit: number;
}

interface RateLimiterConfig {
  action: string;
  onBlocked?: () => void;
  showToast?: boolean;
}

// Client-side rate limiting with localStorage cache
const getClientRateKey = (action: string): string => `rate_limit_${action}`;

interface ClientRateData {
  count: number;
  windowStart: number;
}

const CLIENT_LIMITS: Record<string, { maxRequests: number; windowMs: number }> = {
  submit_order: { maxRequests: 5, windowMs: 3600000 },      // 5 per hour
  contact_form: { maxRequests: 10, windowMs: 3600000 },     // 10 per hour
  newsletter_subscribe: { maxRequests: 3, windowMs: 86400000 }, // 3 per day
  button_click: { maxRequests: 30, windowMs: 60000 },       // 30 per minute (anti-spam)
  api_call: { maxRequests: 60, windowMs: 60000 },           // 60 per minute
};

const checkClientRateLimit = (action: string): { allowed: boolean; remaining: number } => {
  const key = getClientRateKey(action);
  const config = CLIENT_LIMITS[action] || CLIENT_LIMITS.api_call;
  const now = Date.now();

  try {
    const stored = localStorage.getItem(key);
    let data: ClientRateData = stored 
      ? JSON.parse(stored) 
      : { count: 0, windowStart: now };

    // Reset window if expired
    if (now - data.windowStart > config.windowMs) {
      data = { count: 0, windowStart: now };
    }

    const allowed = data.count < config.maxRequests;
    const remaining = Math.max(0, config.maxRequests - data.count - 1);

    if (allowed) {
      data.count++;
      localStorage.setItem(key, JSON.stringify(data));
    }

    return { allowed, remaining };
  } catch {
    // localStorage not available, allow request
    return { allowed: true, remaining: 1 };
  }
};

export const useRateLimiter = ({ action, onBlocked, showToast = true }: RateLimiterConfig) => {
  const [state, setState] = useState<RateLimitState>({
    allowed: true,
    remaining: 10,
    resetIn: 0,
    limit: 10,
  });
  const [checking, setChecking] = useState(false);

  const checkRateLimit = useCallback(async (): Promise<boolean> => {
    // First, do a quick client-side check
    const clientCheck = checkClientRateLimit(action);
    if (!clientCheck.allowed) {
      if (showToast) {
        toast.error('Please slow down. Too many requests.');
      }
      onBlocked?.();
      setState(prev => ({ ...prev, allowed: false, remaining: 0 }));
      return false;
    }

    // For critical actions, also check server-side
    const criticalActions = ['submit_order', 'contact_form', 'newsletter_subscribe', 'password_reset'];
    
    if (criticalActions.includes(action)) {
      setChecking(true);
      try {
        const { data, error } = await supabase.functions.invoke('rate-limiter', {
          body: { action },
        });

        if (error) {
          console.error('Rate limit check failed:', error);
          // Fail open - allow on error
          return true;
        }

        setState({
          allowed: data.allowed,
          remaining: data.remaining,
          resetIn: data.resetIn,
          limit: data.limit,
        });

        if (!data.allowed) {
          if (showToast) {
            const minutes = Math.ceil(data.resetIn / 60);
            toast.error(`Too many requests. Please try again in ${minutes} minutes.`);
          }
          onBlocked?.();
          return false;
        }

        return true;
      } catch (err) {
        console.error('Rate limit error:', err);
        // Fail open
        return true;
      } finally {
        setChecking(false);
      }
    }

    return true;
  }, [action, onBlocked, showToast]);

  const resetClientLimit = useCallback((targetAction?: string) => {
    const key = getClientRateKey(targetAction || action);
    localStorage.removeItem(key);
    setState(prev => ({ ...prev, allowed: true, remaining: prev.limit }));
  }, [action]);

  return {
    ...state,
    checking,
    checkRateLimit,
    resetClientLimit,
  };
};

export default useRateLimiter;

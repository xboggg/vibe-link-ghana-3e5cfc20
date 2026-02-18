# VibeLink Event - Security & QA Documentation

**Date:** February 16, 2026
**Project:** VibeLink Event Website
**Domain:** vibelinkevent.com
**Prepared by:** Claude Code (AI Assistant)

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Branding Updates](#branding-updates)
3. [Security Improvements](#security-improvements)
4. [Nginx Configuration](#nginx-configuration)
5. [Supabase Edge Functions](#supabase-edge-functions)
6. [Files Modified](#files-modified)
7. [Code Changes](#code-changes)
8. [Deployment Summary](#deployment-summary)
9. [Future Recommendations](#future-recommendations)

---

## Executive Summary

This document details the comprehensive security audit and quality assurance work performed on the VibeLink Event website. The work included:

- **Branding Migration:** Updated all references from "VibeLink Ghana" to "VibeLink Event"
- **Security Hardening:** Implemented session management, password policies, and rate limiting
- **XSS Prevention:** Verified DOMPurify usage for user-generated content
- **Server Security:** Added security headers and access controls to Nginx
- **API Security:** Deployed rate-limited Supabase Edge Functions

---

## Branding Updates

### Domain Migration
- **Old Domain:** vibelinkgh.com
- **New Domain:** vibelinkevent.com

### Updated Brand References

| Location | Old Value | New Value |
|----------|-----------|-----------|
| Site Title | VibeLink Ghana | VibeLink Event |
| Meta Description | VibeLink Ghana | VibeLink Event |
| OG Title | VibeLink Ghana | VibeLink Event |
| Twitter Handle | @vibelinkgh | @vibelinkevent |
| Email Domain | vibelinkgh.com | vibelinkevent.com |
| Sitemap URL | vibelinkgh.com | vibelinkevent.com |

### Files Updated for Branding

1. **index.html**
   - Page title and meta tags
   - Open Graph tags
   - Twitter Card tags
   - Structured data (JSON-LD)
   - Social media links

2. **robots.txt**
   - Sitemap URL updated

3. **src/index.css**
   - Design system comment header

4. **src/components/admin/NewsletterManager.tsx**
   - Newsletter header text

5. **All 16 Supabase Edge Functions**
   - Email templates
   - From addresses
   - Footer text

---

## Security Improvements

### 1. Session Timeout Management

**File:** `src/hooks/useSessionTimeout.ts` (NEW)

Implements automatic session expiration for inactive users:

- **Timeout Duration:** 15 minutes of inactivity
- **Warning:** 2 minutes before expiration
- **Auto-logout:** Clears session storage and signs out user
- **Activity Tracking:** Mouse, keyboard, scroll, touch, click events
- **Throttling:** 1-second throttle on activity detection to prevent excessive calls

```typescript
// Usage in Admin.tsx
useSessionTimeout({
  timeoutMinutes: 15,
  warningMinutes: 2
});
```

### 2. Password Policy Strengthening

**File:** `src/pages/AdminAuth.tsx`

#### Login Requirements
- Minimum 8 characters (unchanged for backwards compatibility)

#### Signup Requirements (NEW)
- Minimum 12 characters
- At least one uppercase letter (A-Z)
- At least one lowercase letter (a-z)
- At least one number (0-9)

```typescript
const signupSchema = z.object({
  password: z.string()
    .min(12, "Password must be at least 12 characters")
    .regex(/[A-Z]/, "Must contain uppercase letter")
    .regex(/[a-z]/, "Must contain lowercase letter")
    .regex(/[0-9]/, "Must contain a number"),
});
```

### 3. Two-Factor Authentication Rate Limiting

**File:** `src/components/auth/TwoFactorVerify.tsx`

Prevents brute-force attacks on 2FA codes:

- **Max Attempts:** 3 failed attempts
- **Lockout Duration:** 60 seconds
- **Visual Feedback:** Countdown timer displayed
- **Reset:** Counter resets after successful verification or lockout expiry

```typescript
const MAX_ATTEMPTS = 3;
const LOCKOUT_DURATION_MS = 60000; // 1 minute

// Visual indicator during lockout
{isLocked && (
  <div className="flex items-center gap-2 p-3 bg-destructive/10">
    <AlertTriangle className="h-4 w-4 text-destructive" />
    <p>Too many failed attempts. Wait {lockoutRemaining}s</p>
  </div>
)}
```

### 4. XSS Prevention

**Existing Protection:** DOMPurify is used throughout the application for sanitizing user-generated content.

**Files using DOMPurify:**
- Newsletter content rendering
- User profile data display
- Order notes and comments
- Admin dashboard data

---

## Nginx Configuration

**File:** `/etc/nginx/sites-enabled/vibelinkevent.com`

### Security Headers Added

```nginx
# Prevent XSS attacks
add_header X-XSS-Protection "1; mode=block" always;

# Control referrer information
add_header Referrer-Policy "strict-origin-when-cross-origin" always;

# Disable dangerous browser features
add_header Permissions-Policy "geolocation=(), microphone=(), camera=()" always;

# Content Security Policy
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://*.supabase.co wss://*.supabase.co;" always;
```

### Endpoint Security

#### GitHub Webhook (Restricted to GitHub IPs)
```nginx
location /deploy-webhook {
    allow 192.30.252.0/22;   # GitHub
    allow 185.199.108.0/22;  # GitHub
    allow 140.82.112.0/20;   # GitHub
    allow 143.55.64.0/20;    # GitHub
    deny all;
    # ... proxy config
}
```

#### Manual Deploy (Localhost Only)
```nginx
location /deploy-now {
    allow 127.0.0.1;
    deny all;
    # ... proxy config
}
```

### Root Directory Fix
```nginx
root /var/www/vibelinkevent.com;  # Fixed from vibelinkgh.com
```

---

## Supabase Edge Functions

### Functions Deployed (22 Total)

All functions updated with:
- VibeLink Event branding in email templates
- Rate limiting via `check_rate_limit` RPC
- Updated `from` addresses to `@vibelinkevent.com`

| Function | Purpose | Rate Limit |
|----------|---------|------------|
| auto-payment-reminder | Automated payment reminders | 10/hour |
| customer-chat | Real-time chat handling | 50/hour |
| newsletter-preferences | Manage newsletter prefs | 20/hour |
| send-admin-notification | Admin alerts | 20/hour |
| send-admin-payment-notification | Payment alerts | 20/hour |
| send-follow-up-emails | Follow-up automation | 10/hour |
| send-newsletter | Bulk newsletter sends | 5/hour |
| send-order-confirmation | Order confirmations | 5/hour |
| send-payment-confirmation | Payment confirmations | 5/hour |
| send-payment-reminder | Payment reminders | 10/hour |
| send-scheduled-newsletters | Scheduled newsletters | 5/hour |
| send-status-email | Order status updates | 20/hour |
| send-telegram-notification | Telegram alerts | 30/hour |
| send-welcome-email | Welcome emails | 10/hour |
| unsubscribe-newsletter | Unsubscribe handling | 20/hour |
| generate-tracking-number | Order tracking | 10/hour |

### Rate Limiting Implementation

```typescript
// Rate limiting constants
const RATE_LIMIT_MAX_REQUESTS = 5;
const RATE_LIMIT_WINDOW_MINUTES = 60;

async function checkRateLimit(
  supabase: any,
  functionName: string,
  clientIp: string
): Promise<boolean> {
  const { data, error } = await supabase.rpc('check_rate_limit', {
    p_function_name: functionName,
    p_client_ip: clientIp,
    p_max_requests: RATE_LIMIT_MAX_REQUESTS,
    p_window_minutes: RATE_LIMIT_WINDOW_MINUTES
  });

  if (error) {
    console.error("Rate limit check error:", error);
    return true; // Allow on error
  }

  return data === true;
}
```

---

## Files Modified

### New Files Created
| File | Purpose |
|------|---------|
| `src/hooks/useSessionTimeout.ts` | Session timeout management |
| `docs/SECURITY_QA_DOCUMENTATION.md` | This documentation |

### Frontend Files Modified
| File | Changes |
|------|---------|
| `index.html` | Branding, meta tags, structured data |
| `public/robots.txt` | Sitemap URL |
| `src/index.css` | Design system comment |
| `src/pages/Admin.tsx` | Added useSessionTimeout hook |
| `src/pages/AdminAuth.tsx` | Stronger password validation |
| `src/components/auth/TwoFactorVerify.tsx` | Rate limiting |
| `src/components/admin/NewsletterManager.tsx` | Branding |

### Server Files Modified
| File | Changes |
|------|---------|
| `/etc/nginx/sites-enabled/vibelinkevent.com` | Security headers, endpoint restrictions |

### Supabase Functions Modified
All 16 edge functions in `supabase/functions/`:
- Branding updates
- Rate limiting implementation
- Email template updates

---

## Code Changes

### Session Timeout Hook (Complete Implementation)

```typescript
// src/hooks/useSessionTimeout.ts
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
    sessionStorage.clear();
    await signOut();
    toast.info("Session expired due to inactivity. Please sign in again.");
    navigate("/admin/auth", { replace: true });
  }, [signOut, navigate, onTimeout]);

  const showWarning = useCallback(() => {
    if (!warningShownRef.current) {
      warningShownRef.current = true;
      toast.warning(
        `Session will expire in ${warningMinutes} minutes due to inactivity.`,
        { duration: 10000 }
      );
    }
  }, [warningMinutes]);

  const resetTimer = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (warningRef.current) clearTimeout(warningRef.current);
    warningShownRef.current = false;

    if (!user) return;

    const timeoutMs = timeoutMinutes * 60 * 1000;
    const warningMs = (timeoutMinutes - warningMinutes) * 60 * 1000;

    warningRef.current = setTimeout(showWarning, warningMs);
    timeoutRef.current = setTimeout(handleTimeout, timeoutMs);
  }, [timeoutMinutes, warningMinutes, user, handleTimeout, showWarning]);

  useEffect(() => {
    if (!user) return;

    const events = [
      "mousedown", "mousemove", "keydown",
      "scroll", "touchstart", "click"
    ];

    let lastReset = Date.now();
    const throttledReset = () => {
      const now = Date.now();
      if (now - lastReset > 1000) {
        lastReset = now;
        resetTimer();
      }
    };

    events.forEach((event) => {
      document.addEventListener(event, throttledReset, { passive: true });
    });

    resetTimer();

    return () => {
      events.forEach((event) => {
        document.removeEventListener(event, throttledReset);
      });
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (warningRef.current) clearTimeout(warningRef.current);
    };
  }, [user, resetTimer]);

  return { resetTimer };
};
```

### 2FA Rate Limiting (Key Changes)

```typescript
// src/components/auth/TwoFactorVerify.tsx
const MAX_ATTEMPTS = 3;
const LOCKOUT_DURATION_MS = 60000;

const [attempts, setAttempts] = useState(0);
const [lockedUntil, setLockedUntil] = useState<number | null>(null);
const [lockoutRemaining, setLockoutRemaining] = useState(0);
const lockoutTimerRef = useRef<NodeJS.Timeout | null>(null);

const startLockoutTimer = useCallback(() => {
  const endTime = Date.now() + LOCKOUT_DURATION_MS;
  setLockedUntil(endTime);

  const updateRemaining = () => {
    const remaining = Math.max(0, Math.ceil((endTime - Date.now()) / 1000));
    setLockoutRemaining(remaining);
    if (remaining > 0) {
      lockoutTimerRef.current = setTimeout(updateRemaining, 1000);
    } else {
      setLockedUntil(null);
      setAttempts(0);
    }
  };
  updateRemaining();
}, []);

const isLocked = lockedUntil !== null && Date.now() < lockedUntil;

// In handleVerify:
if (isLocked) {
  toast.error(`Too many attempts. Please wait ${lockoutRemaining} seconds.`);
  return;
}

// After failed attempt:
const newAttempts = attempts + 1;
setAttempts(newAttempts);
if (newAttempts >= MAX_ATTEMPTS) {
  startLockoutTimer();
  toast.error(`Too many failed attempts. Please wait 60 seconds.`);
}
```

---

## Deployment Summary

### Deployment Commands Executed

```bash
# 1. Deployed Supabase Edge Functions
cd /path/to/vibelink/app
npx supabase functions deploy --project-ref <project-ref>

# 2. Reloaded Nginx configuration
sudo nginx -t && sudo systemctl reload nginx

# 3. Built and deployed frontend
npm run build
# (Deployed via existing CI/CD pipeline)
```

### Verification Steps

1. **Session Timeout:** Login to admin, wait 15 minutes without activity - should auto-logout
2. **Password Policy:** Try creating account with weak password - should be rejected
3. **2FA Rate Limiting:** Enter wrong 2FA code 3 times - should show lockout
4. **Security Headers:** Check response headers in browser DevTools
5. **Branding:** Verify all email templates show "VibeLink Event"

---

## Future Recommendations

### High Priority

1. **HTTPS Strict Transport Security (HSTS)**
   - Add `Strict-Transport-Security` header for HTTPS enforcement
   ```nginx
   add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
   ```

2. **Content Security Policy Refinement**
   - Remove `unsafe-inline` and `unsafe-eval` from script-src
   - Use nonces or hashes for inline scripts

3. **Password Special Characters**
   - Add requirement for special characters in passwords
   ```typescript
   .regex(/[!@#$%^&*]/, "Must contain special character")
   ```

4. **Account Lockout**
   - Implement server-side account lockout after failed login attempts
   - Current rate limiting is client-side only

### Medium Priority

5. **Audit Logging**
   - Log all admin actions to database
   - Track login attempts, data changes, permission changes

6. **IP-Based Rate Limiting**
   - Implement at Nginx level for additional protection
   ```nginx
   limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
   ```

7. **Session Fingerprinting**
   - Track browser/device fingerprint to detect session hijacking

8. **Two-Factor Authentication Enhancement**
   - Consider adding WebAuthn/FIDO2 support
   - Implement recovery codes rotation

### Low Priority

9. **Security Headers Enhancement**
   ```nginx
   add_header X-Content-Type-Options "nosniff" always;
   add_header X-Permitted-Cross-Domain-Policies "none" always;
   ```

10. **Subresource Integrity (SRI)**
    - Add integrity hashes to external scripts/stylesheets

---

## Contact

For questions about this documentation or the security implementations:

- **GitHub:** https://github.com/xboggg
- **Project:** vibelink

---

*Document generated: February 16, 2026*
*Last updated: February 16, 2026*

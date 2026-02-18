# VibeLink Event - Changelog

## February 16, 2026

### Branding Changes
- Migrated all references from "VibeLink Ghana" to "VibeLink Event"
- Updated domain references from vibelinkgh.com to vibelinkevent.com
- Updated social media handles from @vibelinkgh to @vibelinkevent
- Updated all 16 Supabase Edge Functions with new branding

### Security Improvements

#### Session Management
- Added `useSessionTimeout` hook for 15-minute inactivity timeout
- Shows warning 2 minutes before session expires
- Auto-logout clears session storage and redirects to login

#### Password Policy
- Signup now requires:
  - Minimum 12 characters (was 8)
  - At least one uppercase letter
  - At least one lowercase letter
  - At least one number
- Login unchanged at 8 characters for backwards compatibility

#### 2FA Rate Limiting
- Maximum 3 failed attempts before lockout
- 60-second lockout with visual countdown
- Counter resets after successful verification

#### Nginx Security Headers
- Added X-XSS-Protection
- Added Referrer-Policy
- Added Permissions-Policy
- Added Content-Security-Policy
- Restricted /deploy-webhook to GitHub IPs only
- Restricted /deploy-now to localhost only

### Files Changed

**New Files:**
- `src/hooks/useSessionTimeout.ts`
- `docs/SECURITY_QA_DOCUMENTATION.md`
- `docs/CHANGELOG_2026-02-16.md`

**Modified Files:**
- `index.html`
- `public/robots.txt`
- `src/index.css`
- `src/pages/Admin.tsx`
- `src/pages/AdminAuth.tsx`
- `src/components/auth/TwoFactorVerify.tsx`
- `src/components/admin/NewsletterManager.tsx`
- All 16 Supabase Edge Functions

**Server Files:**
- `/etc/nginx/sites-enabled/vibelinkevent.com`

### Deployment
- All Supabase functions deployed via `npx supabase functions deploy`
- Nginx configuration reloaded
- Frontend built and deployed

---

For full details, see [SECURITY_QA_DOCUMENTATION.md](./SECURITY_QA_DOCUMENTATION.md)

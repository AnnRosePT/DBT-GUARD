# 🚀 DBT-GUARD Enterprise Deployment & Runbook

This runbook provides technical procedures for deploying and maintaining **DBT-GUARD** in state-level e-governance environments (NIC Cloud MeghRaj / State Data Centres) and modern serverless edge hosting.

---

## 1. Hosting Architecture
- **Static Asset Layer:** Vercel Edge / Cloudflare Pages / NIC MeghRaj CDN.
- **Client Cache Storage:** Cache-Control headers with persistent PWA service workers for offline rural resilience.
- **Serverless API Bridge:** Vercel serverless micro-endpoints (`/api/send-sms.js`, `/api/make-call.js`) for secure upstream telecom and Gemini API key segregation.

---

## 2. Environment Variables Configuration

Create a `.env.local` or configure CI/CD repository secrets:

```bash
# Telecom SMS Gateway (Fast2SMS Indian Gateway)
FAST2SMS_API_KEY="your_fast2sms_authorization_token"

# Twilio SMS / Telephony Gateway (Fallback)
TWILIO_ACCOUNT_SID="AC_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
TWILIO_AUTH_TOKEN="your_twilio_auth_token"
TWILIO_PHONE_NUMBER="+1xxxxxxxxxx"

# Google Gemini Vernacular AI Engine
VITE_GEMINI_API_KEY="AIzaSy_xxxxxxxxxxxxxxxxxxxxxxxxx"

# Recipient Test Override (Direct dispatch during live demos)
VITE_DEFAULT_RECIPIENT_MOBILE="+919746515417"
```

---

## 3. Build & Deployment Procedure

```bash
# 1. Clean installation of dependencies
npm ci

# 2. Type validation
npx tsc -b

# 3. Production Vite compilation
npm run build

# 4. Preview locally
npm run preview
```

---

## 4. Disaster Recovery & Offline Triage Mode
In situations where state central networks or PFMS endpoints are unreachable:
1. **Zustand LocalStorage Fallback:** Field officers continue logging grievance actions and uploading document evidence offline.
2. **Re-Sync Trigger:** When connectivity resumes, the client automatically synchronizes pending batch verification queues with the central registry.
3. **Data Export:** Officers can click **"Export Batch CSV"** to generate hardcopy logs for weekly District Level Consultative Committee (DLCC) meetings.

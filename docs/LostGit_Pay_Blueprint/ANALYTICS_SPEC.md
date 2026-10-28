# LostGit Pay — Website Analytics & Telemetry Specification

## 1. Tracking SDK Architecture

The LostGit Pay Analytics SDK is a lightweight (< 5KB), zero-dependency JavaScript tag designed for high performance and privacy compliance.

### Embed Snippet
```html
<script
  defer
  src="https://pay.lostgit.com/sdk/lostgit-analytics.js"
  data-project-key="LGT-TRK-XXXXXXXX"
  data-endpoint="https://pay.lostgit.com/api/v1/analytics/collect"
></script>
```

---

## 2. Collected Data & Schema

### A. Pageview Event
- `event_type`: `'pageview'`
- `path`: Current URL pathname (e.g. `/pricing`)
- `title`: `document.title`
- `referrer`: `document.referrer` (truncated to origin / clean path)
- `device_category`: `'desktop' | 'mobile' | 'tablet'`
- `browser`: Detected browser family (e.g. `'Chrome'`, `'Firefox'`, `'Safari'`, `'Edge'`)
- `session_id`: Ephemeral UUID stored in `sessionStorage` (cleared when tab closes)
- `visitor_hash`: Daily rotating hash of IP + User-Agent + Project Salt (never raw IP)

### B. Click Interaction Event
- `event_type`: `'click'`
- `element_tag`: Tag name (e.g. `'BUTTON'`, `'A'`)
- `element_id`: Element HTML `id` attribute
- `element_text`: Safe text snippet (e.g. `"Book Demo"`, max 50 chars)
- `data_track`: Value of `data-track` attribute if configured by website developer

### C. Engagement & Session Duration
- `event_type`: `'heartbeat'` or `'session_end'`
- Tracked using `document.visibilityState` and `window.addEventListener('beforeunload', ...)`
- Dispatched via `navigator.sendBeacon()` to guarantee delivery when visitor leaves the website without stalling navigation.

### D. Safe Error / Integration Diagnostics
- `event_type`: `'error'`
- Safe diagnostic string reporting SDK initialization failures or CSP blocks without capturing customer data.

---

## 3. Privacy & DPDP Act Compliance
1. **No Sensitive Input Harvesting**: Inputs, textareas, and password fields are strictly ignored.
2. **No Third-Party Ad Cookies**: The SDK does not set persistent 3rd-party cross-site advertising cookies.
3. **Daily Pseudo-anonymization**: Daily rotated salt hashes prevent long-term personal profiling while allowing daily unique visitor counting.
4. **Data Minimization**: IP addresses are processed in memory to derive country/city and salt hash, then immediately discarded.

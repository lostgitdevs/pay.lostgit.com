# LostGit Pay — REST API Specifications

## 1. Analytics Endpoints

### Ingestion: `POST /api/v1/analytics/collect`
Receives batched or single telemetry events from the browser SDK.
- **Headers**:
  - `Content-Type: application/json` or `text/plain` (for `sendBeacon` compatibility)
  - `Origin: https://client-website.com`
- **Request Body**:
```json
{
  "projectKey": "LGT-TRK-A8F299CD",
  "events": [
    {
      "eventType": "pageview",
      "sessionId": "sess_8f3d4a2b",
      "path": "/products/crm",
      "title": "CRM Software - Acme Co",
      "referrer": "https://google.com",
      "deviceCategory": "desktop",
      "browser": "Chrome"
    },
    {
      "eventType": "click",
      "sessionId": "sess_8f3d4a2b",
      "elementTag": "BUTTON",
      "elementId": "hero-cta",
      "elementText": "Start Free Trial"
    }
  ]
}
```
- **Responses**:
  - `200 OK`: `{"received": 2, "status": "processed"}`
  - `400 Bad Request`: `{"error": "Invalid payload schema"}`
  - `403 Forbidden`: `{"error": "Unauthorized origin or invalid project key"}`

### Health Ping: `POST /api/v1/analytics/ping`
SDK diagnostic ping to measure latency and record SDK health.
- **Request Body**:
```json
{
  "projectKey": "LGT-TRK-A8F299CD",
  "sdkVersion": "1.0.0",
  "timestamp": 1787042000000
}
```
- **Response (200 OK)**:
```json
{
  "status": "healthy",
  "projectStatus": "active",
  "entitlement": "active"
}
```

### Metrics Query: `GET /api/v1/analytics/stats?projectId=...&range=7d`
Returns aggregated time-series, unique visitors, total page views, average session duration, top pages, and top clicked elements for dashboards.

---

## 2. Entitlement Endpoints

### Verify Licence: `POST /api/v1/licence/verify`
```json
{
  "licenceKey": "LGT-A8F2-99CD-E104-762B",
  "domain": "portal.clientcompany.com"
}
```

---

## 3. Billing Endpoints

### Create Payment Order: `POST /api/pay/[token]/order`
### Verify Payment Signature: `POST /api/pay/[token]/verify`
### Razorpay Webhook Receiver: `POST /api/webhooks/razorpay`

# LostGit Pay — Database & Entity Specifications

## 1. Analytics & Telemetry Entities

### `analytics_events`
Stores individual telemetry events (pageviews, clicks, heartbeats, errors).
- `id` (UUID, PK)
- `project_id` (UUID, references `projects.id` ON DELETE CASCADE)
- `event_type` (TEXT: `'pageview' | 'click' | 'heartbeat' | 'session_end' | 'error'`)
- `session_id` (TEXT NOT NULL)
- `visitor_hash` (TEXT NOT NULL)
- `path` (TEXT NOT NULL)
- `referrer` (TEXT)
- `device_category` (TEXT CHECK in `'desktop', 'mobile', 'tablet'`)
- `browser` (TEXT)
- `duration_seconds` (INT DEFAULT 0)
- `element_tag` (TEXT)
- `element_id` (TEXT)
- `element_text` (TEXT)
- `metadata` (JSONB DEFAULT '{}')
- `created_at` (TIMESTAMPTZ DEFAULT NOW())

Indexes:
- `idx_analytics_events_project_created`: `(project_id, created_at DESC)`
- `idx_analytics_events_session`: `(session_id)`
- `idx_analytics_events_visitor`: `(visitor_hash)`

### `analytics_sessions`
Aggregated session statistics for rapid dashboard loading.
- `id` (UUID, PK)
- `project_id` (UUID, references `projects.id` ON DELETE CASCADE)
- `session_id` (TEXT UNIQUE)
- `visitor_hash` (TEXT NOT NULL)
- `entry_path` (TEXT NOT NULL)
- `exit_path` (TEXT)
- `page_views_count` (INT DEFAULT 1)
- `total_duration_seconds` (INT DEFAULT 0)
- `is_bounce` (BOOLEAN DEFAULT true)
- `started_at` (TIMESTAMPTZ DEFAULT NOW())
- `ended_at` (TIMESTAMPTZ DEFAULT NOW())

### `project_integrations`
Tracks the health, latency, and status of connected client websites.
- `id` (UUID, PK)
- `project_id` (UUID UNIQUE, references `projects.id` ON DELETE CASCADE)
- `sdk_version` (TEXT)
- `status` (TEXT CHECK in `'healthy', 'degraded', 'offline'`)
- `last_ping_at` (TIMESTAMPTZ)
- `latency_ms` (INT DEFAULT 0)
- `error_count` (INT DEFAULT 0)
- `last_error` (TEXT)
- `updated_at` (TIMESTAMPTZ DEFAULT NOW())

---

## 2. Row Level Security Policies for Analytics

- **Public / Ingestion Access**: `anon` role can insert into `analytics_events` ONLY when matching a valid registered project key and allowed domains.
- **Client Access**: Client users can query `analytics_events`, `analytics_sessions`, and `project_integrations` ONLY for projects where `project.client_id = profile.client_id`.
- **Staff Access**: Staff (owner, admin, finance, support) can query all project analytics across the platform.

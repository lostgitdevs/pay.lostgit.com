-- ============================================================================
-- LostGit Pay: Website Analytics & Integration Health Migration
-- Migration: 20261028000003_analytics_schema.sql
-- Description: Analytics telemetry events, session aggregations, and integration health
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. Analytics Events Table
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS analytics_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL CHECK (event_type IN ('pageview', 'click', 'heartbeat', 'session_end', 'error')),
    session_id TEXT NOT NULL,
    visitor_hash TEXT NOT NULL,
    path TEXT NOT NULL,
    title TEXT,
    referrer TEXT,
    device_category TEXT CHECK (device_category IN ('desktop', 'mobile', 'tablet')),
    browser TEXT,
    duration_seconds INT NOT NULL DEFAULT 0,
    element_tag TEXT,
    element_id TEXT,
    element_text TEXT,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_analytics_events_project_created ON analytics_events(project_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_events_session ON analytics_events(session_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_visitor ON analytics_events(visitor_hash);
CREATE INDEX IF NOT EXISTS idx_analytics_events_type ON analytics_events(event_type);

-- ----------------------------------------------------------------------------
-- 2. Analytics Sessions Table
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS analytics_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    session_id TEXT NOT NULL UNIQUE,
    visitor_hash TEXT NOT NULL,
    entry_path TEXT NOT NULL,
    exit_path TEXT,
    page_views_count INT NOT NULL DEFAULT 1,
    total_duration_seconds INT NOT NULL DEFAULT 0,
    is_bounce BOOLEAN NOT NULL DEFAULT true,
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    ended_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_analytics_sessions_project_started ON analytics_sessions(project_id, started_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_sessions_visitor ON analytics_sessions(visitor_hash);

-- ----------------------------------------------------------------------------
-- 3. Project Integrations Table (Health & Telemetry Pings)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS project_integrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL UNIQUE REFERENCES projects(id) ON DELETE CASCADE,
    sdk_version TEXT NOT NULL DEFAULT '1.0.0',
    status TEXT NOT NULL DEFAULT 'healthy' CHECK (status IN ('healthy', 'degraded', 'offline')),
    last_ping_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    latency_ms INT NOT NULL DEFAULT 0,
    error_count INT NOT NULL DEFAULT 0,
    last_error TEXT,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_project_integrations_status ON project_integrations(status);

-- ----------------------------------------------------------------------------
-- 4. Enable Row Level Security (RLS)
-- ----------------------------------------------------------------------------
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_integrations ENABLE ROW LEVEL SECURITY;

-- Staff can view all analytics
CREATE POLICY "Staff can view all analytics_events"
    ON analytics_events FOR SELECT
    USING (public.current_user_is_staff());

CREATE POLICY "Staff can view all analytics_sessions"
    ON analytics_sessions FOR SELECT
    USING (public.current_user_is_staff());

CREATE POLICY "Staff can view all project_integrations"
    ON project_integrations FOR ALL
    USING (public.current_user_is_staff());

-- Client users can view analytics for their owned projects
CREATE POLICY "Clients can view own project analytics_events"
    ON analytics_events FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM projects
            WHERE projects.id = analytics_events.project_id
            AND projects.client_id = public.current_user_client_id()
        )
    );

CREATE POLICY "Clients can view own project analytics_sessions"
    ON analytics_sessions FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM projects
            WHERE projects.id = analytics_sessions.project_id
            AND projects.client_id = public.current_user_client_id()
        )
    );

CREATE POLICY "Clients can view own project_integrations"
    ON project_integrations FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM projects
            WHERE projects.id = project_integrations.project_id
            AND projects.client_id = public.current_user_client_id()
        )
    );

-- Allow public ingestion via service role or controlled anon insert
CREATE POLICY "Allow public analytics insertion"
    ON analytics_events FOR INSERT
    TO anon
    WITH CHECK (true);

CREATE POLICY "Allow public analytics session upsert"
    ON analytics_sessions FOR INSERT
    TO anon
    WITH CHECK (true);

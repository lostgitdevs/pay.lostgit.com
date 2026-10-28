import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { createAdminClient } from '@/lib/supabase/server';

function corsHeaders(origin: string = '*') {
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, User-Agent',
    'Access-Control-Max-Age': '86400',
  };
}

export async function OPTIONS(request: Request) {
  const origin = request.headers.get('origin') || '*';
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders(origin),
  });
}

/**
 * Derives a privacy-preserving visitor hash.
 * Combines IP, User-Agent, and current calendar day so the hash automatically rotates every 24h.
 */
function generateVisitorHash(ip: string, userAgent: string): string {
  const dateStr = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  const salt = process.env.APP_ENCRYPTION_KEY || 'lostgit_analytics_default_salt';
  return crypto
    .createHmac('sha256', salt)
    .update(`${ip}|${userAgent}|${dateStr}`)
    .digest('hex')
    .slice(0, 24);
}

export async function POST(request: Request) {
  const origin = request.headers.get('origin') || '*';

  try {
    const rawText = await request.text();
    let body: any;
    try {
      body = JSON.parse(rawText);
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON payload' },
        { status: 400, headers: corsHeaders(origin) }
      );
    }

    const { projectKey, events } = body;

    if (!projectKey || !Array.isArray(events) || events.length === 0) {
      return NextResponse.json(
        { error: 'Invalid project key or missing events array' },
        { status: 400, headers: corsHeaders(origin) }
      );
    }

    const supabase = createAdminClient();

    // 1. Resolve project by licence_key or tracking metadata
    const { data: project, error: projError } = await supabase
      .from('projects')
      .select('id, name, entitlement_status, status')
      .or(`licence_key.eq.${projectKey.trim()},id.eq.${projectKey.trim()}`)
      .maybeSingle();

    if (projError || !project) {
      return NextResponse.json(
        { error: 'Project not recognized or inactive' },
        { status: 403, headers: corsHeaders(origin) }
      );
    }

    const clientIp =
      request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
      request.headers.get('x-real-ip') ||
      '127.0.0.1';
    const userAgent = request.headers.get('user-agent') || 'Unknown';
    const visitorHash = generateVisitorHash(clientIp, userAgent);

    // 2. Format events for insertion
    const recordsToInsert = events.map((evt: any) => ({
      project_id: project.id,
      event_type: ['pageview', 'click', 'heartbeat', 'session_end', 'error'].includes(
        evt.eventType
      )
        ? evt.eventType
        : 'pageview',
      session_id: String(evt.sessionId || `sess_${Date.now()}`),
      visitor_hash: visitorHash,
      path: String(evt.path || '/').substring(0, 500),
      title: evt.title ? String(evt.title).substring(0, 200) : null,
      referrer: evt.referrer ? String(evt.referrer).substring(0, 500) : null,
      device_category: ['desktop', 'mobile', 'tablet'].includes(evt.deviceCategory)
        ? evt.deviceCategory
        : 'desktop',
      browser: evt.browser ? String(evt.browser).substring(0, 50) : null,
      duration_seconds: Number(evt.durationSeconds || 0),
      element_tag: evt.elementTag ? String(evt.elementTag).substring(0, 20) : null,
      element_id: evt.elementId ? String(evt.elementId).substring(0, 100) : null,
      element_text: evt.elementText ? String(evt.elementText).substring(0, 100) : null,
      metadata: evt.metadata && typeof evt.metadata === 'object' ? evt.metadata : {},
    }));

    // 3. Batch insert into analytics_events
    const { error: insertError } = await supabase
      .from('analytics_events')
      .insert(recordsToInsert);

    if (insertError) {
      console.error('Analytics batch insert error:', insertError);
      return NextResponse.json(
        { error: 'Failed to record analytics telemetry' },
        { status: 500, headers: corsHeaders(origin) }
      );
    }

    // 4. Update session statistics
    const primaryEvent = events[0];
    if (primaryEvent && primaryEvent.sessionId) {
      const sessionId = String(primaryEvent.sessionId);
      const isPageview = events.some((e: any) => e.eventType === 'pageview');
      const maxDuration = Math.max(
        0,
        ...events.map((e: any) => Number(e.durationSeconds || 0))
      );

      const { data: existingSession } = await supabase
        .from('analytics_sessions')
        .select('id, page_views_count, total_duration_seconds')
        .eq('session_id', sessionId)
        .maybeSingle();

      if (existingSession) {
        await supabase
          .from('analytics_sessions')
          .update({
            page_views_count: existingSession.page_views_count + (isPageview ? 1 : 0),
            total_duration_seconds: Math.max(
              existingSession.total_duration_seconds,
              maxDuration
            ),
            is_bounce: existingSession.page_views_count + (isPageview ? 1 : 0) <= 1,
            exit_path: primaryEvent.path || '/',
            ended_at: new Date().toISOString(),
          })
          .eq('id', existingSession.id);
      } else {
        await supabase.from('analytics_sessions').insert({
          project_id: project.id,
          session_id: sessionId,
          visitor_hash: visitorHash,
          entry_path: primaryEvent.path || '/',
          exit_path: primaryEvent.path || '/',
          page_views_count: isPageview ? 1 : 0,
          total_duration_seconds: maxDuration,
          is_bounce: true,
        });
      }
    }

    // 5. Update integration health ping
    await supabase
      .from('project_integrations')
      .upsert(
        {
          project_id: project.id,
          sdk_version: '1.0.0',
          status: 'healthy',
          last_ping_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'project_id' }
      );

    return NextResponse.json(
      {
        received: recordsToInsert.length,
        status: 'processed',
        entitlement: project.entitlement_status,
      },
      { status: 200, headers: corsHeaders(origin) }
    );
  } catch (error: any) {
    console.error('Analytics collect error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal analytics processing error' },
      { status: 500, headers: corsHeaders(origin) }
    );
  }
}

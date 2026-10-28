import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');

    if (!projectId) {
      return NextResponse.json({ error: 'Missing projectId' }, { status: 400 });
    }

    const supabase = await createClient();

    // Verify current user has access to this project (enforced by RLS)
    const { data: project, error: projError } = await supabase
      .from('projects')
      .select('id, name, entitlement_status, status')
      .eq('id', projectId)
      .single();

    if (projError || !project) {
      return NextResponse.json({ error: 'Project not found or unauthorized' }, { status: 404 });
    }

    // 1. Fetch recent events
    const { data: events } = await supabase
      .from('analytics_events')
      .select('event_type, path, visitor_hash, duration_seconds, element_tag, element_text, device_category, browser, created_at')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false })
      .limit(1000);

    const eventList = events || [];
    const pageviews = eventList.filter((e) => e.event_type === 'pageview');
    const clicks = eventList.filter((e) => e.event_type === 'click');

    // Unique visitors (distinct visitor_hash)
    const uniqueVisitors = new Set(eventList.map((e) => e.visitor_hash)).size;

    // Average duration on page
    const durations = eventList.filter((e) => e.duration_seconds > 0).map((e) => e.duration_seconds);
    const avgDuration =
      durations.length > 0
        ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length)
        : 0;

    // Top Pages
    const pageCounts: Record<string, number> = {};
    pageviews.forEach((p) => {
      pageCounts[p.path] = (pageCounts[p.path] || 0) + 1;
    });
    const topPages = Object.entries(pageCounts)
      .map(([path, count]) => ({ path, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Top Clicks
    const clickCounts: Record<string, number> = {};
    clicks.forEach((c) => {
      const label = c.element_text || c.element_tag || 'Click';
      clickCounts[label] = (clickCounts[label] || 0) + 1;
    });
    const topClicks = Object.entries(clickCounts)
      .map(([label, count]) => ({ label, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Integration Health
    const { data: integration } = await supabase
      .from('project_integrations')
      .select('*')
      .eq('project_id', projectId)
      .maybeSingle();

    return NextResponse.json({
      project,
      summary: {
        totalEvents: eventList.length,
        pageviewsCount: pageviews.length,
        uniqueVisitors,
        clicksCount: clicks.length,
        averageDurationSeconds: avgDuration,
      },
      topPages,
      topClicks,
      integration: integration || { status: 'offline', last_ping_at: null },
    });
  } catch (error: any) {
    console.error('Error in analytics stats route:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { isDomainAllowed, evaluateEntitlementStatus } from '@/lib/licence';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { licenceKey, domain } = body;

    if (!licenceKey || typeof licenceKey !== 'string') {
      return NextResponse.json(
        { valid: false, error: 'Missing or invalid licence key' },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    // Query licence by key
    const { data: licence, error: licenceError } = await supabase
      .from('licences')
      .select(`
        id,
        licence_key,
        status,
        allowed_domains,
        valid_until,
        grace_period_until,
        projects:project_id (
          id,
          name,
          entitlement_status
        ),
        clients:client_id (
          id,
          business_name
        )
      `)
      .eq('licence_key', licenceKey.trim())
      .maybeSingle();

    if (licenceError || !licence) {
      return NextResponse.json({
        valid: false,
        status: 'revoked',
        message: 'Licence key not found or revoked',
      });
    }

    // Domain check (if domain provided in request)
    if (domain && !isDomainAllowed(domain, licence.allowed_domains)) {
      return NextResponse.json({
        valid: false,
        status: 'suspended',
        message: `Domain '${domain}' is not authorized for this licence`,
      });
    }

    // Evaluate entitlement and grace periods
    const evaluation = evaluateEntitlementStatus({
      currentStatus: licence.status,
      validUntil: licence.valid_until,
      gracePeriodUntil: licence.grace_period_until,
    });

    // Update last_checked_at timestamp asynchronously
    await supabase
      .from('licences')
      .update({
        last_checked_at: new Date().toISOString(),
      })
      .eq('id', licence.id);

    return NextResponse.json({
      valid: evaluation.valid,
      status: evaluation.status,
      projectName: (licence.projects as any)?.name,
      clientName: (licence.clients as any)?.business_name,
      allowedDomains: licence.allowed_domains,
      validUntil: licence.valid_until,
      gracePeriodUntil: licence.grace_period_until,
      message: evaluation.valid
        ? evaluation.status === 'grace_period'
          ? 'Licence is in grace period. Please settle outstanding invoices.'
          : 'Licence is active and valid.'
        : `Licence is ${evaluation.status}.`,
    });
  } catch (error: any) {
    console.error('Error verifying licence:', error);
    return NextResponse.json(
      { valid: false, error: 'Internal licence verification error' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const licenceKey = searchParams.get('key') || searchParams.get('licenceKey');
  const domain = searchParams.get('domain') || '';

  if (!licenceKey) {
    return NextResponse.json(
      { valid: false, error: 'Query parameter "key" is required' },
      { status: 400 }
    );
  }

  // Delegate to POST logic
  return POST(
    new Request(request.url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ licenceKey, domain }),
    })
  );
}

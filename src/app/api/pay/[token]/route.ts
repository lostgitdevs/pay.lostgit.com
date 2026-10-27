import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { INVOICE_STATUS } from '@/lib/constants';

interface RouteContext {
  params: Promise<{
    token: string;
  }>;
}

/**
 * Public endpoint to fetch invoice details for a payment link token.
 * Validates token existence and expiry.
 */
export async function GET(request: Request, context: RouteContext) {
  try {
    const { token } = await context.params;

    if (!token || token.length < 16) {
      return NextResponse.json({ error: 'Invalid payment token' }, { status: 400 });
    }

    const supabase = createAdminClient();

    // Query invoice by payment link token
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .select(`
        id,
        invoice_number,
        invoice_type,
        status,
        subtotal_paise,
        tax_rate_percent,
        tax_amount_paise,
        discount_amount_paise,
        total_amount_paise,
        amount_paid_paise,
        currency,
        issue_date,
        due_date,
        payment_link_expires_at,
        notes,
        terms,
        clients:client_id (
          id,
          business_name,
          contact_name,
          email,
          phone,
          billing_address,
          tax_id
        ),
        projects:project_id (
          id,
          name,
          project_type
        ),
        invoice_items (
          id,
          description,
          quantity,
          unit_price_paise,
          total_paise,
          sort_order
        )
      `)
      .eq('payment_link_token', token)
      .single();

    if (invoiceError || !invoice) {
      return NextResponse.json(
        { error: 'Invoice not found or link has expired' },
        { status: 404 }
      );
    }

    // Check expiry
    if (invoice.payment_link_expires_at) {
      const expiresAt = new Date(invoice.payment_link_expires_at);
      if (expiresAt < new Date()) {
        return NextResponse.json(
          { error: 'Payment link has expired. Please contact LostGit Solutions for a new link.' },
          { status: 410 }
        );
      }
    }

    // Check if already fully paid or void
    if (invoice.status === INVOICE_STATUS.PAID) {
      return NextResponse.json({
        invoice,
        alreadyPaid: true,
        message: 'This invoice has already been fully paid.',
      });
    }

    if (invoice.status === INVOICE_STATUS.CANCELLED || invoice.status === INVOICE_STATUS.VOID) {
      return NextResponse.json(
        { error: 'This invoice is no longer active.' },
        { status: 400 }
      );
    }

    const remainingPaise = Math.max(0, invoice.total_amount_paise - invoice.amount_paid_paise);

    return NextResponse.json({
      invoice,
      remainingPaise,
      alreadyPaid: false,
    });
  } catch (error: any) {
    console.error('Error fetching payment link:', error);
    return NextResponse.json(
      { error: 'Internal server error processing payment link' },
      { status: 500 }
    );
  }
}

import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { createRazorpayOrder } from '@/lib/razorpay';
import { INVOICE_STATUS } from '@/lib/constants';

interface RouteContext {
  params: Promise<{
    token: string;
  }>;
}

export async function POST(request: Request, context: RouteContext) {
  try {
    const { token } = await context.params;

    if (!token) {
      return NextResponse.json({ error: 'Missing token' }, { status: 400 });
    }

    const supabase = createAdminClient();

    // Query invoice
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .select('id, invoice_number, status, total_amount_paise, amount_paid_paise, currency, client_id')
      .eq('payment_link_token', token)
      .single();

    if (invoiceError || !invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    if (invoice.status === INVOICE_STATUS.PAID) {
      return NextResponse.json(
        { error: 'Invoice is already paid in full' },
        { status: 400 }
      );
    }

    const remainingPaise = invoice.total_amount_paise - invoice.amount_paid_paise;
    if (remainingPaise <= 0) {
      return NextResponse.json(
        { error: 'No outstanding balance remaining on this invoice' },
        { status: 400 }
      );
    }

    // Create Razorpay order
    const order = await createRazorpayOrder({
      amountPaise: remainingPaise,
      receipt: invoice.invoice_number,
      currency: invoice.currency || 'INR',
      notes: {
        invoice_id: invoice.id,
        invoice_number: invoice.invoice_number,
        client_id: invoice.client_id,
        token,
      },
    });

    // Update invoice with razorpay order ID
    await supabase
      .from('invoices')
      .update({
        razorpay_order_id: order.id,
      })
      .eq('id', invoice.id);

    return NextResponse.json({
      orderId: order.id,
      amountPaise: order.amount,
      currency: order.currency,
      keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      receipt: order.receipt,
    });
  } catch (error: any) {
    console.error('Failed to create Razorpay order:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to initialize payment order' },
      { status: 500 }
    );
  }
}

import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { verifyPaymentSignature, getRazorpayClient } from '@/lib/razorpay';
import { INVOICE_STATUS, PAYMENT_STATUS } from '@/lib/constants';

interface RouteContext {
  params: Promise<{
    token: string;
  }>;
}

export async function POST(request: Request, context: RouteContext) {
  try {
    const { token } = await context.params;
    const body = await request.json();

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json(
        { error: 'Missing required Razorpay payment signature parameters' },
        { status: 400 }
      );
    }

    // 1. Verify cryptographic signature
    const isValidSignature = verifyPaymentSignature({
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      signature: razorpay_signature,
    });

    if (!isValidSignature) {
      return NextResponse.json(
        { error: 'Invalid payment signature. Verification failed.' },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    // 2. Fetch invoice
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .select('id, invoice_number, client_id, project_id, total_amount_paise, amount_paid_paise, currency')
      .eq('payment_link_token', token)
      .single();

    if (invoiceError || !invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    // 3. Check for idempotency: is this payment already recorded?
    const { data: existingPayment } = await supabase
      .from('payments')
      .select('id, receipt_number, status')
      .eq('razorpay_payment_id', razorpay_payment_id)
      .maybeSingle();

    if (existingPayment) {
      return NextResponse.json({
        success: true,
        message: 'Payment has already been processed',
        receiptNumber: existingPayment.receipt_number,
      });
    }

    // 4. Fetch payment details from Razorpay to get exact amount and payment method
    let paymentAmountPaise = invoice.total_amount_paise - invoice.amount_paid_paise;
    let paymentMethod = 'unknown';

    try {
      const razorpay = getRazorpayClient();
      const paymentDetails = await razorpay.payments.fetch(razorpay_payment_id);
      if (paymentDetails) {
        paymentAmountPaise = Number(paymentDetails.amount);
        paymentMethod = paymentDetails.method || 'unknown';
      }
    } catch (fetchErr) {
      console.warn('Could not fetch Razorpay payment details from API, using calculated balance:', fetchErr);
    }

    const receiptNumber = `RCT-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;

    // 5. Insert payment record
    const { error: paymentInsertError } = await supabase.from('payments').insert({
      invoice_id: invoice.id,
      client_id: invoice.client_id,
      amount_paise: paymentAmountPaise,
      currency: invoice.currency || 'INR',
      payment_method: paymentMethod,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      status: PAYMENT_STATUS.CAPTURED,
      receipt_number: receiptNumber,
      captured_at: new Date().toISOString(),
      metadata: {
        token,
        verified_via: 'checkout_callback',
      },
    });

    if (paymentInsertError) {
      console.error('Error recording payment:', paymentInsertError);
      return NextResponse.json(
        { error: 'Failed to record payment in database' },
        { status: 500 }
      );
    }

    // 6. Update invoice balance and status
    const newAmountPaid = invoice.amount_paid_paise + paymentAmountPaise;
    const isFullyPaid = newAmountPaid >= invoice.total_amount_paise;
    const newStatus = isFullyPaid ? INVOICE_STATUS.PAID : INVOICE_STATUS.PARTIALLY_PAID;

    await supabase
      .from('invoices')
      .update({
        amount_paid_paise: newAmountPaid,
        status: newStatus,
        updated_at: new Date().toISOString(),
      })
      .eq('id', invoice.id);

    // 7. Audit log
    await supabase.from('audit_logs').insert({
      action: 'payment.captured',
      entity_type: 'invoice',
      entity_id: invoice.id,
      details: {
        payment_id: razorpay_payment_id,
        amount_paise: paymentAmountPaise,
        receipt_number: receiptNumber,
        new_status: newStatus,
      },
    });

    return NextResponse.json({
      success: true,
      receiptNumber,
      status: newStatus,
      amountPaidPaise: paymentAmountPaise,
      invoiceNumber: invoice.invoice_number,
    });
  } catch (error: any) {
    console.error('Verification error:', error);
    return NextResponse.json(
      { error: error.message || 'Payment verification failed' },
      { status: 500 }
    );
  }
}

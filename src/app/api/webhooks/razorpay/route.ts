import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { verifyWebhookSignature } from '@/lib/razorpay';
import {
  RAZORPAY_EVENTS,
  INVOICE_STATUS,
  PAYMENT_STATUS,
  SUBSCRIPTION_STATUS,
} from '@/lib/constants';

export async function POST(request: Request) {
  const signature = request.headers.get('x-razorpay-signature');

  if (!signature) {
    return NextResponse.json({ error: 'Missing webhook signature header' }, { status: 400 });
  }

  const rawBody = await request.text();

  // 1. Verify cryptographic signature
  const isValid = verifyWebhookSignature({ rawBody, signature });
  if (!isValid) {
    console.error('Invalid Razorpay webhook signature');
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  let event: any;
  try {
    event = JSON.parse(rawBody);
  } catch (err) {
    return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
  }

  const eventId = request.headers.get('x-razorpay-event-id') || event.id || `evt_${Date.now()}`;
  const eventType = event.event;
  const supabase = createAdminClient();

  // 2. Idempotency Check: check if event has already been recorded
  const { data: existingEvent } = await supabase
    .from('webhook_events')
    .select('id, status')
    .eq('event_id', eventId)
    .maybeSingle();

  if (existingEvent && existingEvent.status === 'processed') {
    return NextResponse.json({ message: 'Event already processed' }, { status: 200 });
  }

  // Record initial receipt of event
  if (!existingEvent) {
    await supabase.from('webhook_events').insert({
      event_id: eventId,
      event_type: eventType,
      payload: event,
      status: 'processing',
    });
  }

  try {
    // 3. Handle events
    switch (eventType) {
      case RAZORPAY_EVENTS.PAYMENT_CAPTURED:
      case RAZORPAY_EVENTS.ORDER_PAID: {
        const paymentEntity = event.payload?.payment?.entity;
        if (!paymentEntity) break;

        const orderId = paymentEntity.order_id;
        const paymentId = paymentEntity.id;
        const amountPaise = Number(paymentEntity.amount);
        const paymentMethod = paymentEntity.method;

        // Check if payment already exists
        const { data: existingPayment } = await supabase
          .from('payments')
          .select('id')
          .eq('razorpay_payment_id', paymentId)
          .maybeSingle();

        if (!existingPayment) {
          // Look up invoice by razorpay_order_id
          const { data: invoice } = await supabase
            .from('invoices')
            .select('id, client_id, total_amount_paise, amount_paid_paise')
            .eq('razorpay_order_id', orderId)
            .maybeSingle();

          if (invoice) {
            const receiptNumber = `RCT-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;

            await supabase.from('payments').insert({
              invoice_id: invoice.id,
              client_id: invoice.client_id,
              amount_paise: amountPaise,
              currency: paymentEntity.currency || 'INR',
              payment_method: paymentMethod,
              razorpay_order_id: orderId,
              razorpay_payment_id: paymentId,
              status: PAYMENT_STATUS.CAPTURED,
              receipt_number: receiptNumber,
              captured_at: new Date().toISOString(),
              metadata: { webhook_event_id: eventId },
            });

            const newAmountPaid = invoice.amount_paid_paise + amountPaise;
            const newStatus =
              newAmountPaid >= invoice.total_amount_paise
                ? INVOICE_STATUS.PAID
                : INVOICE_STATUS.PARTIALLY_PAID;

            await supabase
              .from('invoices')
              .update({
                amount_paid_paise: newAmountPaid,
                status: newStatus,
                updated_at: new Date().toISOString(),
              })
              .eq('id', invoice.id);
          }
        }
        break;
      }

      case RAZORPAY_EVENTS.PAYMENT_FAILED: {
        const paymentEntity = event.payload?.payment?.entity;
        if (!paymentEntity) break;

        const orderId = paymentEntity.order_id;
        const paymentId = paymentEntity.id;

        const { data: invoice } = await supabase
          .from('invoices')
          .select('id, client_id')
          .eq('razorpay_order_id', orderId)
          .maybeSingle();

        if (invoice) {
          await supabase.from('payments').insert({
            invoice_id: invoice.id,
            client_id: invoice.client_id,
            amount_paise: Number(paymentEntity.amount || 0),
            currency: paymentEntity.currency || 'INR',
            razorpay_order_id: orderId,
            razorpay_payment_id: paymentId,
            status: PAYMENT_STATUS.FAILED,
            error_code: paymentEntity.error_code,
            error_description: paymentEntity.error_description,
            metadata: { webhook_event_id: eventId },
          });
        }
        break;
      }

      case RAZORPAY_EVENTS.SUBSCRIPTION_ACTIVATED:
      case RAZORPAY_EVENTS.SUBSCRIPTION_CHARGED: {
        const subEntity = event.payload?.subscription?.entity;
        if (!subEntity) break;

        const subId = subEntity.id;
        await supabase
          .from('subscriptions')
          .update({
            status: SUBSCRIPTION_STATUS.ACTIVE,
            current_start: subEntity.current_start
              ? new Date(subEntity.current_start * 1000).toISOString()
              : null,
            current_end: subEntity.current_end
              ? new Date(subEntity.current_end * 1000).toISOString()
              : null,
            charge_at: subEntity.charge_at
              ? new Date(subEntity.charge_at * 1000).toISOString()
              : null,
            updated_at: new Date().toISOString(),
          })
          .eq('razorpay_subscription_id', subId);
        break;
      }

      case RAZORPAY_EVENTS.SUBSCRIPTION_HALTED:
      case RAZORPAY_EVENTS.SUBSCRIPTION_CANCELLED: {
        const subEntity = event.payload?.subscription?.entity;
        if (!subEntity) break;

        const subId = subEntity.id;
        const newStatus =
          eventType === RAZORPAY_EVENTS.SUBSCRIPTION_HALTED
            ? SUBSCRIPTION_STATUS.HALTED
            : SUBSCRIPTION_STATUS.CANCELLED;

        await supabase
          .from('subscriptions')
          .update({
            status: newStatus,
            updated_at: new Date().toISOString(),
          })
          .eq('razorpay_subscription_id', subId);
        break;
      }

      default:
        // Other events logged but not mutating financial state
        break;
    }

    // Mark event as successfully processed
    await supabase
      .from('webhook_events')
      .update({
        status: 'processed',
        processed_at: new Date().toISOString(),
      })
      .eq('event_id', eventId);

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error: any) {
    console.error('Error processing webhook event:', error);

    await supabase
      .from('webhook_events')
      .update({
        status: 'failed',
        error_message: error.message || 'Unknown processing error',
      })
      .eq('event_id', eventId);

    return NextResponse.json(
      { error: 'Webhook processing error', details: error.message },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "../../../../lib/supabase-admin";
import { createDownloadToken } from "../../../../lib/download-token";
import { verifyPaypalWebhookSignature } from "../../../../lib/paypal";

async function completeOrder(orderId: string, paypalOrderId: string, payload: any) {
  const { data: existing } = await supabaseAdmin
    .from("payments")
    .select("id")
    .eq("provider", "paypal")
    .eq("provider_txn_id", paypalOrderId)
    .maybeSingle();

  if (existing?.id) return { idempotent: true };

  await supabaseAdmin.from("payments").insert({
    order_id: orderId,
    provider: "paypal",
    provider_txn_id: paypalOrderId,
    raw_payload: payload,
    status: "paid",
  });

  await supabaseAdmin
    .from("orders")
    .update({ status: "paid", paid_at: new Date().toISOString(), provider_order_id: paypalOrderId })
    .eq("id", orderId)
    .eq("status", "pending");

  const { data: orderItems } = await supabaseAdmin
    .from("order_items")
    .select("product_id")
    .eq("order_id", orderId);

  for (const it of orderItems || []) {
    await createDownloadToken(orderId, it.product_id);
  }

  return { idempotent: false };
}

export async function POST(request: NextRequest) {
  const body = await request.json();

  const signatureOk = await verifyPaypalWebhookSignature(request.headers, body);
  if (!signatureOk) {
    return NextResponse.json({ error: "invalid signature" }, { status: 401 });
  }

  const eventType = String(body.event_type || "");
  const resource = body.resource || {};

  const paypalOrderId = String(
    resource.id ||
      resource.supplementary_data?.related_ids?.order_id ||
      resource.supplementary_data?.related_ids?.capture_id ||
      ""
  ).trim();
  const referenceId = String(
    resource.supplementary_data?.related_ids?.invoice_id ||
      resource.custom_id ||
      resource.purchase_units?.[0]?.reference_id ||
      ""
  ).trim();

  if (!paypalOrderId) {
    return NextResponse.json({ error: "missing paypal order id" }, { status: 400 });
  }

  let orderId = referenceId;
  if (!orderId) {
    const { data: found } = await supabaseAdmin
      .from("orders")
      .select("id")
      .eq("provider_order_id", paypalOrderId)
      .maybeSingle();
    orderId = found?.id || "";
  }

  if (!orderId) {
    return NextResponse.json({ error: "order not found" }, { status: 404 });
  }

  if (!["PAYMENT.CAPTURE.COMPLETED", "CHECKOUT.ORDER.APPROVED"].includes(eventType)) {
    return NextResponse.json({ ok: true, ignored: eventType || "unknown" });
  }

  const result = await completeOrder(orderId, paypalOrderId, body);
  return NextResponse.json({ ok: true, ...result });
}

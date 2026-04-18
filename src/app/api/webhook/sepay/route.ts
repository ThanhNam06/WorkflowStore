import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "../../../../lib/supabase-admin";
import { env } from "../../../../lib/env";
import { verifySepayAuthorization, normalizeProviderTxnId } from "../../../../lib/security";
import { createDownloadToken } from "../../../../lib/download-token";

async function markOrderPaid(orderId: string, providerTxnId: string, raw: any) {
  const { data: existing } = await supabaseAdmin
    .from("payments")
    .select("id")
    .eq("provider", "sepay")
    .eq("provider_txn_id", providerTxnId)
    .maybeSingle();

  if (existing?.id) return { idempotent: true };

  await supabaseAdmin.from("payments").insert({
    order_id: orderId,
    provider: "sepay",
    provider_txn_id: providerTxnId,
    raw_payload: raw,
    status: "paid",
  });

  await supabaseAdmin
    .from("orders")
    .update({ status: "paid", paid_at: new Date().toISOString(), provider_order_id: providerTxnId })
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
  const authHeader = request.headers.get("authorization");
  if (!verifySepayAuthorization(authHeader, env.SEPAY_WEBHOOK_SECRET)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const orderId = String(body.order_id || body.orderId || "").trim();
  const status = String(body.status || "").toLowerCase();
  const amount = Number(body.amount || 0);
  const providerTxnId = normalizeProviderTxnId(body.provider_txn_id || body.transaction_id || body.txnId);

  if (!orderId || !providerTxnId) {
    return NextResponse.json({ error: "order_id/provider_txn_id required" }, { status: 400 });
  }

  const { data: order, error } = await supabaseAdmin
    .from("orders")
    .select("id,status,amount,currency")
    .eq("id", orderId)
    .maybeSingle();

  if (error || !order) {
    return NextResponse.json({ error: "order not found" }, { status: 404 });
  }

  if (status !== "paid") {
    await supabaseAdmin.from("payments").insert({
      order_id: orderId,
      provider: "sepay",
      provider_txn_id: providerTxnId,
      raw_payload: body,
      status: "failed",
    });
    return NextResponse.json({ ok: true, skipped: "status_not_paid" });
  }

  if (order.currency !== "VND") {
    return NextResponse.json({ error: "currency mismatch" }, { status: 400 });
  }

  if (amount && Number(order.amount) !== amount) {
    return NextResponse.json({ error: "amount mismatch" }, { status: 400 });
  }

  const result = await markOrderPaid(orderId, providerTxnId, body);
  return NextResponse.json({ ok: true, ...result });
}

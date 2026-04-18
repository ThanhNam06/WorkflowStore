import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { env } from "@/lib/env";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { createDownloadToken } from "@/lib/download-token";

const Body = z.object({ orderId: z.string().uuid() });

export async function POST(request: NextRequest) {
  const auth = request.headers.get("x-admin-key") || "";
  if (!env.ADMIN_API_KEY || auth !== env.ADMIN_API_KEY) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const parsed = Body.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const orderId = parsed.data.orderId;

  await supabaseAdmin
    .from("orders")
    .update({ status: "paid", paid_at: new Date().toISOString() })
    .eq("id", orderId);

  const { data: orderItems } = await supabaseAdmin
    .from("order_items")
    .select("product_id")
    .eq("order_id", orderId);

  const tokens: string[] = [];
  for (const it of orderItems || []) {
    tokens.push(await createDownloadToken(orderId, it.product_id));
  }

  return NextResponse.json({ ok: true, orderId, tokens });
}

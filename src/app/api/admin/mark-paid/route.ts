import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { env } from "@/lib/env";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { sendOrderPaidEmail } from "@/lib/order-email";
import { requireAdminFromRequest } from "@/lib/admin-access";

const Body = z.object({ orderId: z.string().uuid() });

export async function POST(request: NextRequest) {
  const auth = request.headers.get("x-admin-key") || "";
  const adminByKey = !!env.ADMIN_API_KEY && auth === env.ADMIN_API_KEY;

  let adminByUser = false;
  if (!adminByKey) {
    const admin = await requireAdminFromRequest(request);
    adminByUser = admin.ok;
  }

  if (!adminByKey && !adminByUser) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const parsed = Body.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const orderId = parsed.data.orderId;

  const { error: updateErr } = await supabaseAdmin
    .from("orders")
    .update({ status: "paid", paid_at: new Date().toISOString() })
    .eq("id", orderId);

  if (updateErr) {
    return NextResponse.json({ error: updateErr.message }, { status: 500 });
  }

  let emailResult: any = null;
  let emailError: string | null = null;
  try {
    emailResult = await sendOrderPaidEmail({ orderId });
  } catch (e: any) {
    emailError = String(e?.message || e || "sendOrderPaidEmail failed");
    console.error("[admin/mark-paid] sendOrderPaidEmail failed", e);
  }

  return NextResponse.json({ ok: true, orderId, email: emailResult, emailError });
}

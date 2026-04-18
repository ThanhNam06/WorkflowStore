import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const accessToken = new URL(req.url).searchParams.get("accessToken") || "";

  const { data, error } = await supabaseAdmin
    .from("orders")
    .select("id,status,currency,amount,payment_provider,paid_at,access_token")
    .eq("id", params.id)
    .maybeSingle();

  if (error || !data) {
    return NextResponse.json({ error: "order not found" }, { status: 404 });
  }

  if (!accessToken || data.access_token !== accessToken) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  return NextResponse.json({
    id: data.id,
    status: data.status,
    currency: data.currency,
    amount: data.amount,
    payment_provider: data.payment_provider,
    paid_at: data.paid_at,
  });
}

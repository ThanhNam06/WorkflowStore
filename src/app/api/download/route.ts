import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { verifyAndConsumeDownloadToken } from "@/lib/download-token";
import { supabaseAdmin } from "@/lib/supabase-admin";

const Query = z.object({ token: z.string().min(8) });

export async function GET(request: NextRequest) {
  const parsed = Query.safeParse(Object.fromEntries(request.nextUrl.searchParams.entries()));
  if (!parsed.success) {
    return NextResponse.json({ error: "token invalid" }, { status: 400 });
  }

  const checked = await verifyAndConsumeDownloadToken(parsed.data.token);
  if (!checked.ok) {
    return NextResponse.json({ error: checked.reason }, { status: 410 });
  }

  const { data: product, error } = await supabaseAdmin
    .from("products")
    .select("file_path")
    .eq("id", checked.productId)
    .maybeSingle();

  if (error || !product?.file_path) {
    return NextResponse.json({ error: "file not found" }, { status: 404 });
  }

  const { data: signed, error: signErr } = await supabaseAdmin.storage
    .from("workflows")
    .createSignedUrl(product.file_path, 60);

  if (signErr || !signed?.signedUrl) {
    return NextResponse.json({ error: signErr?.message || "cannot sign url" }, { status: 500 });
  }

  return NextResponse.redirect(signed.signedUrl, { status: 307 });
}

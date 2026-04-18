import { randomUUID } from "node:crypto";
import { env } from "@/lib/env";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function createDownloadToken(orderId: string, productId: string) {
  const token = randomUUID().replace(/-/g, "");
  const expiresAt = new Date(Date.now() + env.DOWNLOAD_TOKEN_TTL_HOURS * 60 * 60 * 1000).toISOString();

  const { error } = await supabaseAdmin.from("download_tokens").insert({
    token,
    order_id: orderId,
    product_id: productId,
    expires_at: expiresAt,
    remaining: env.DOWNLOAD_MAX_ATTEMPTS,
  });

  if (error) {
    throw new Error(`createDownloadToken failed: ${error.message}`);
  }

  return token;
}

export async function verifyAndConsumeDownloadToken(token: string) {
  const { data, error } = await supabaseAdmin
    .from("download_tokens")
    .select("token,order_id,product_id,expires_at,remaining")
    .eq("token", token)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) return { ok: false as const, reason: "not_found" as const };

  const now = Date.now();
  const exp = new Date(data.expires_at).getTime();
  if (exp < now) {
    await supabaseAdmin.from("download_tokens").delete().eq("token", token);
    return { ok: false as const, reason: "expired" as const };
  }

  if (data.remaining <= 0) {
    await supabaseAdmin.from("download_tokens").delete().eq("token", token);
    return { ok: false as const, reason: "exhausted" as const };
  }

  const next = data.remaining - 1;
  if (next <= 0) {
    await supabaseAdmin.from("download_tokens").delete().eq("token", token);
  } else {
    await supabaseAdmin.from("download_tokens").update({ remaining: next }).eq("token", token);
  }

  return {
    ok: true as const,
    orderId: data.order_id,
    productId: data.product_id,
    remainingAfter: next,
  };
}

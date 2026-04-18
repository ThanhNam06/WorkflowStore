import { products } from "@/lib/products";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function seedProductsIfMissing() {
  const ids = products.map((p) => p.dbId);

  const { data: existing, error: findErr } = await supabaseAdmin
    .from("products")
    .select("id")
    .in("id", ids);

  if (findErr) {
    throw new Error(`seedProductsIfMissing/select failed: ${findErr.message}`);
  }

  const existSet = new Set((existing || []).map((x: any) => x.id));
  const missing = products.filter((p) => !existSet.has(p.dbId));

  if (!missing.length) return { inserted: 0 };

  const rows = missing.map((p) => ({
    id: p.dbId,
    slug: p.slug,
    name: p.name,
    description: p.description,
    price_vnd: p.price_vnd,
    price_usd: p.price_usd,
    file_path: `${p.platform}/${p.catalogId}.json`,
    is_active: true,
  }));

  const { error: insErr } = await supabaseAdmin.from("products").insert(rows);
  if (insErr) {
    throw new Error(`seedProductsIfMissing/insert failed: ${insErr.message}`);
  }

  return { inserted: rows.length };
}

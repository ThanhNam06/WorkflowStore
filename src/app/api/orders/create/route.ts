import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { detectCountryFromHeaders, paymentProviderByCountry } from "../../../../lib/geo";
import { findProductByCatalogId } from "../../../../lib/products";
import { supabaseAdmin } from "../../../../lib/supabase-admin";
import { createPaypalOrder } from "../../../../lib/paypal";
import { env } from "../../../../lib/env";
import { seedProductsIfMissing } from "../../../../lib/seed-products";

const BodySchema = z.object({
  productIds: z.array(z.string()).min(1),
  email: z.string().email(),
  forceCountry: z.string().optional(),
});

export async function POST(request: NextRequest) {
  const parsed = BodySchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { productIds, email, forceCountry } = parsed.data;
  await seedProductsIfMissing();

  const country = (forceCountry || detectCountryFromHeaders(request.headers)).toUpperCase();
  const locale = paymentProviderByCountry(country);

  const items = productIds
    .map((id) => findProductByCatalogId(id))
    .filter(Boolean) as NonNullable<ReturnType<typeof findProductByCatalogId>>[];

  if (!items.length) {
    return NextResponse.json({ error: "No valid products" }, { status: 400 });
  }

  const amount =
    locale.currency === "VND"
      ? items.reduce((s, i) => s + i.price_vnd, 0)
      : Math.round(items.reduce((s, i) => s + i.price_usd, 0) * 100) / 100;

  const { data: createdOrder, error: orderErr } = await supabaseAdmin
    .from("orders")
    .insert({
      email,
      country_code: country,
      currency: locale.currency,
      amount,
      status: "pending",
      payment_provider: locale.provider,
    })
    .select("id,access_token,currency,amount,payment_provider")
    .single();

  if (orderErr || !createdOrder) {
    return NextResponse.json({ error: orderErr?.message || "Create order failed" }, { status: 500 });
  }

  const orderItems = items.map((item) => ({
    order_id: createdOrder.id,
    product_id: item.dbId,
    product_name: item.name,
    unit_price: locale.currency === "VND" ? item.price_vnd : item.price_usd,
    quantity: 1,
  }));

  const { error: itemErr } = await supabaseAdmin.from("order_items").insert(orderItems);
  if (itemErr) {
    return NextResponse.json({ error: itemErr.message }, { status: 500 });
  }

  if (locale.provider === "sepay") {
    const transferContent = `ORD_${createdOrder.id}`;
    return NextResponse.json({
      orderId: createdOrder.id,
      accessToken: createdOrder.access_token,
      provider: "sepay",
      currency: "VND",
      amountVnd: createdOrder.amount,
      bank: {
        code: env.SEPAY_BANK_CODE,
        accountNo: env.SEPAY_ACCOUNT_NO,
        accountName: env.SEPAY_ACCOUNT_NAME,
      },
      transferContent,
      qrText: `${env.SEPAY_BANK_CODE}|${env.SEPAY_ACCOUNT_NO}|${createdOrder.amount}|${transferContent}`,
    });
  }

  try {
    const pp = await createPaypalOrder({
      amountUsd: Number(createdOrder.amount),
      referenceId: createdOrder.id,
      returnUrl: `${env.APP_BASE_URL}/?paypal=success&order=${createdOrder.id}`,
      cancelUrl: `${env.APP_BASE_URL}/?paypal=cancel&order=${createdOrder.id}`,
    });

    await supabaseAdmin
      .from("orders")
      .update({ provider_order_id: pp.id })
      .eq("id", createdOrder.id);

    return NextResponse.json({
      orderId: createdOrder.id,
      accessToken: createdOrder.access_token,
      provider: "paypal",
      currency: "USD",
      amountUsd: createdOrder.amount,
      paypalOrderId: pp.id,
      approveUrl: pp.approveUrl,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "PayPal create failed" }, { status: 500 });
  }
}

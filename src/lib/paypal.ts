import { env } from "@/lib/env";

type PaypalOrderParams = {
  amountUsd: number;
  referenceId: string;
  returnUrl: string;
  cancelUrl: string;
};

function paypalBaseUrl() {
  return env.PAYPAL_MODE === "live"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";
}

async function getPaypalAccessToken() {
  const basic = Buffer.from(`${env.PAYPAL_CLIENT_ID}:${env.PAYPAL_SECRET}`).toString("base64");
  const body = new URLSearchParams({ grant_type: "client_credentials" });

  const res = await fetch(`${paypalBaseUrl()}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${basic}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`PayPal auth failed: ${res.status} ${text}`);
  }

  const json = await res.json();
  if (!json?.access_token) {
    throw new Error("PayPal auth failed: access_token missing");
  }

  return String(json.access_token);
}

export async function createPaypalOrder(params: PaypalOrderParams) {
  const token = await getPaypalAccessToken();

  const payload = {
    intent: "CAPTURE",
    purchase_units: [
      {
        reference_id: params.referenceId,
        custom_id: params.referenceId,
        amount: {
          currency_code: "USD",
          value: params.amountUsd.toFixed(2),
        },
      },
    ],
    application_context: {
      return_url: params.returnUrl,
      cancel_url: params.cancelUrl,
      shipping_preference: "NO_SHIPPING",
      user_action: "PAY_NOW",
    },
  };

  const res = await fetch(`${paypalBaseUrl()}/v2/checkout/orders`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`PayPal create order failed: ${res.status} ${text}`);
  }

  const json = await res.json();
  const approve = (json?.links || []).find((l: any) => l?.rel === "approve")?.href || null;

  return {
    id: String(json?.id || ""),
    status: String(json?.status || ""),
    approveUrl: approve as string | null,
    raw: json,
  };
}

export async function verifyPaypalWebhookSignature(headers: Headers, webhookEvent: any) {
  if (!env.PAYPAL_WEBHOOK_ID) return false;

  const transmissionId = headers.get("paypal-transmission-id") || "";
  const transmissionTime = headers.get("paypal-transmission-time") || "";
  const certUrl = headers.get("paypal-cert-url") || "";
  const authAlgo = headers.get("paypal-auth-algo") || "";
  const transmissionSig = headers.get("paypal-transmission-sig") || "";

  if (!transmissionId || !transmissionTime || !certUrl || !authAlgo || !transmissionSig) {
    return false;
  }

  const token = await getPaypalAccessToken();

  const verifyRes = await fetch(`${paypalBaseUrl()}/v1/notifications/verify-webhook-signature`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      transmission_id: transmissionId,
      transmission_time: transmissionTime,
      cert_url: certUrl,
      auth_algo: authAlgo,
      transmission_sig: transmissionSig,
      webhook_id: env.PAYPAL_WEBHOOK_ID,
      webhook_event: webhookEvent,
    }),
    cache: "no-store",
  });

  if (!verifyRes.ok) {
    return false;
  }

  const verifyJson = await verifyRes.json();
  return String(verifyJson?.verification_status || "") === "SUCCESS";
}

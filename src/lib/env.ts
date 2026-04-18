export const env = {
  APP_BASE_URL: process.env.APP_BASE_URL || "http://localhost:3000",
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY || "",

  PAYPAL_CLIENT_ID: process.env.PAYPAL_CLIENT_ID || "",
  PAYPAL_SECRET: process.env.PAYPAL_SECRET || "",
  PAYPAL_WEBHOOK_ID: process.env.PAYPAL_WEBHOOK_ID || "",
  PAYPAL_MODE: process.env.PAYPAL_MODE || "sandbox",

  SEPAY_WEBHOOK_SECRET: process.env.SEPAY_WEBHOOK_SECRET || "",
  SEPAY_BANK_CODE: process.env.SEPAY_BANK_CODE || "BIDV",
  SEPAY_ACCOUNT_NO: process.env.SEPAY_ACCOUNT_NO || "",
  SEPAY_ACCOUNT_NAME: process.env.SEPAY_ACCOUNT_NAME || "",

  ADMIN_API_KEY: process.env.ADMIN_API_KEY || "",
  RESEND_API_KEY: process.env.RESEND_API_KEY || "",
  DOWNLOAD_TOKEN_TTL_HOURS: Number(process.env.DOWNLOAD_TOKEN_TTL_HOURS || 24),
  DOWNLOAD_MAX_ATTEMPTS: Number(process.env.DOWNLOAD_MAX_ATTEMPTS || 3),
};

export function assertServerEnv() {
  const required = [
    "NEXT_PUBLIC_SUPABASE_URL",
    "SUPABASE_SERVICE_ROLE_KEY",
    "PAYPAL_CLIENT_ID",
    "PAYPAL_SECRET",
    "SEPAY_WEBHOOK_SECRET",
    "ADMIN_API_KEY",
  ] as const;
  const missing = required.filter((k) => !env[k]);
  if (missing.length) {
    throw new Error(`Missing env vars: ${missing.join(", ")}`);
  }
}

export function detectCountryFromHeaders(headers: Headers): string {
  return (
    headers.get("x-vercel-ip-country") ||
    headers.get("x-geo-country") ||
    headers.get("x-country") ||
    "US"
  ).toUpperCase();
}

export function paymentProviderByCountry(countryCode: string) {
  const isVN = countryCode === "VN";
  return {
    countryCode,
    isVN,
    currency: isVN ? "VND" as const : "USD" as const,
    provider: isVN ? "sepay" as const : "paypal" as const,
  };
}

import { NextRequest, NextResponse } from "next/server";
import { detectCountryFromHeaders, paymentProviderByCountry } from "../../../lib/geo";

export async function GET(request: NextRequest) {
  const forced = request.nextUrl.searchParams.get("forceCountry");
  const country = (forced || detectCountryFromHeaders(request.headers)).toUpperCase();
  const data = paymentProviderByCountry(country);
  return NextResponse.json(data);
}

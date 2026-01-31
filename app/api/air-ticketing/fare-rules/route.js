import { NextResponse } from 'next/server';

const extractRules = (pricingInfo) => {
  const rules = pricingInfo?.FareInfo?.[0]?.TPA_Extensions?.Rules || pricingInfo?.TPA_Extensions?.Rules;
  if (!rules) return { cancellation: null, dateChange: null, noShow: null };
  return {
    cancellation: rules?.Cancellation || null,
    dateChange: rules?.DateChange || null,
    noShow: rules?.NoShow || null
  };
};

export async function POST(request) {
  try {
    const body = await request.json();
    const { pricingInfo } = body;
    if (!pricingInfo) {
      return NextResponse.json({ error: 'pricingInfo required' }, { status: 400 });
    }
    const rules = extractRules(pricingInfo);
    return NextResponse.json({ success: true, rules });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to extract fare rules', message: error.message }, { status: 500 });
  }
}

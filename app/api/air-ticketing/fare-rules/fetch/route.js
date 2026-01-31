import { NextResponse } from 'next/server';

const extractFareBasisCodes = (pricingInfo) => {
  try {
    const list = pricingInfo?.PTC_FareBreakdowns?.PTC_FareBreakdown?.[0]?.FareBasisCodes?.FareBasisCode || [];
    return list.map(f => (typeof f === 'string' ? f : (f?.content || f?.FareBasisCode || ''))).filter(Boolean);
  } catch {
    return [];
  }
};

const extractExistingRules = (pricingInfo) => {
  const rules =
    pricingInfo?.FareInfo?.[0]?.TPA_Extensions?.Rules ||
    pricingInfo?.TPA_Extensions?.Rules ||
    null;
  if (!rules) return null;
  return {
    cancellation: rules?.Cancellation || null,
    dateChange: rules?.DateChange || null,
    noShow: rules?.NoShow || null,
  };
};

export async function POST(request) {
  try {
    const body = await request.json();
    const { pricingInfo } = body;
    if (!pricingInfo) {
      return NextResponse.json({ error: 'pricingInfo required' }, { status: 400 });
    }

    const fareBasisCodes = extractFareBasisCodes(pricingInfo);
    const existing = extractExistingRules(pricingInfo);

    // If rules already exist, return them directly
    if (existing && (existing.cancellation || existing.dateChange || existing.noShow)) {
      return NextResponse.json({
        success: true,
        rules: existing,
        fareBasisCodes
      });
    }

    // Fallback: Provide structured placeholders tied to fare basis
    const placeholders = {
      cancellation: fareBasisCodes.length
        ? `Cancellation rules for fare ${fareBasisCodes[0]} are not provided in search response`
        : 'Cancellation rules not available',
      dateChange: fareBasisCodes.length
        ? `Date change rules for fare ${fareBasisCodes[0]} are not provided in search response`
        : 'Date change rules not available',
      noShow: 'No-show policy not available'
    };

    return NextResponse.json({
      success: true,
      rules: placeholders,
      fareBasisCodes
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message || 'Failed to fetch fare rules' }, { status: 200 });
  }
}

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
      // Infer refundable from existing cancellation text if possible
      const txt = `${existing.cancellation || ''} ${existing.dateChange || ''} ${existing.noShow || ''}`.toUpperCase();
      let inferredRefundable = null;
      let source = null;
      if (txt.includes('NON REFUNDABLE') || txt.includes('NON-REFUNDABLE') || txt.includes('NOT REFUNDABLE') || txt.includes('NONREFUNDABLE') || txt.includes('NONREF')) {
        inferredRefundable = false; source = 'rules';
      } else if (txt.includes('REFUNDABLE')) {
        inferredRefundable = true; source = 'rules';
      }
      if (inferredRefundable === null && fareBasisCodes.length > 0) {
        const hasNR = fareBasisCodes.some(c => String(c || '').toUpperCase().includes('NR'));
        if (hasNR) { inferredRefundable = false; source = 'farebasis'; }
      }
      return NextResponse.json({
        success: true,
        rules: existing,
        fareBasisCodes,
        inferredRefundable,
        inferredSource: source
      });
    }

    // Fallback: return nulls so UI shows standard fallback text
    const placeholders = {
      cancellation: null,
      dateChange: null,
      noShow: null
    };

    // Infer refundable from fare basis if possible
    let inferredRefundable = null;
    let source = null;
    if (fareBasisCodes.length > 0) {
      const hasNR = fareBasisCodes.some(c => String(c || '').toUpperCase().includes('NR'));
      if (hasNR) { inferredRefundable = false; source = 'farebasis'; }
    }

    return NextResponse.json({
      success: true,
      rules: placeholders,
      fareBasisCodes,
      inferredRefundable,
      inferredSource: source
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message || 'Failed to fetch fare rules' }, { status: 200 });
  }
}

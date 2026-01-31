import { NextResponse } from 'next/server';

const extractBaggage = (pricingInfo) => {
  const cands = [
    pricingInfo?.TPA_Extensions?.Baggage?.Checkin,
    pricingInfo?.TPA_Extensions?.Baggage?.Cabin,
    pricingInfo?.FareInfo?.[0]?.TPA_Extensions?.Baggage?.Checkin,
    pricingInfo?.FareInfo?.[0]?.TPA_Extensions?.Baggage?.Cabin,
    pricingInfo?.PTC_FareBreakdowns?.[0]?.TPA_Extensions?.Baggage?.Checkin,
    pricingInfo?.PTC_FareBreakdowns?.[0]?.TPA_Extensions?.Baggage?.Cabin
  ];
  const direct = cands.find(Boolean);
  if (direct) return { text: direct };
  const info = pricingInfo?.FareInfo?.[0]?.TPA_Extensions?.BaggageInformation || pricingInfo?.TPA_Extensions?.BaggageInformation;
  if (info) {
    const first = Array.isArray(info) ? info[0] : info;
    const desc = first?.Description || first?.Provision || (first?.BaggageDetails && first.BaggageDetails[0]?.Description);
    if (desc) return { text: desc };
    const pieces = first?.Pieces;
    const weight = first?.Weight;
    if (pieces) return { text: `${pieces}PC` };
    if (weight) return { text: `${weight}KG` };
  }
  return null;
};

export async function POST(request) {
  try {
    const body = await request.json();
    const { pricingInfo } = body;
    if (!pricingInfo) {
      return NextResponse.json({ error: 'pricingInfo required' }, { status: 400 });
    }
    const bag = extractBaggage(pricingInfo);
    return NextResponse.json({ success: true, baggage: bag?.text || null });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to extract baggage', message: error.message }, { status: 500 });
  }
}

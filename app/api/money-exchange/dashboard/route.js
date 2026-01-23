import { NextResponse } from 'next/server';
import { getDb } from '../../../../lib/mongodb';

// GET money exchange dashboard summary
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const currencyCode = searchParams.get('currencyCode');
    const fromDate = searchParams.get('fromDate');
    const toDate = searchParams.get('toDate');

    const db = await getDb();
    const exchangesCollection = db.collection('money_exchanges');

    // Build query
    const query = {};
    
    if (currencyCode) {
      query.currencyCode = currencyCode;
    }
    
    if (fromDate || toDate) {
      query.date = {};
      if (fromDate) {
        query.date.$gte = new Date(fromDate);
      }
      if (toDate) {
        query.date.$lte = new Date(toDate);
      }
    }

    const exchanges = await exchangesCollection.find(query).toArray();

    // Calculate summary
    const buyExchanges = exchanges.filter(e => e.type === 'Buy' && e.isActive !== false);
    const sellExchanges = exchanges.filter(e => e.type === 'Sell' && e.isActive !== false);

    const totalPurchaseCost = buyExchanges.reduce((sum, e) => sum + (Number(e.amount_bdt) || 0), 0);
    const totalSaleRevenue = sellExchanges.reduce((sum, e) => sum + (Number(e.amount_bdt) || 0), 0);
    
    // Calculate realized profit/loss (completed transactions)
    const totalRealizedProfitLoss = totalSaleRevenue - totalPurchaseCost;
    
    // For unrealized, we'd need current exchange rates and inventory
    // This is simplified - you might want to track inventory separately
    const totalUnrealizedProfitLoss = 0;
    
    // Calculate current reserve value (inventory of foreign currencies)
    const currencyReserves = {};
    buyExchanges.forEach(e => {
      const code = e.currencyCode;
      if (!currencyReserves[code]) {
        currencyReserves[code] = { quantity: 0, cost: 0 };
      }
      currencyReserves[code].quantity += Number(e.quantity) || 0;
      currencyReserves[code].cost += Number(e.amount_bdt) || 0;
    });
    
    sellExchanges.forEach(e => {
      const code = e.currencyCode;
      if (!currencyReserves[code]) {
        currencyReserves[code] = { quantity: 0, cost: 0 };
      }
      currencyReserves[code].quantity -= Number(e.quantity) || 0;
      // Cost reduction proportional to quantity sold
      if (currencyReserves[code].quantity > 0) {
        const avgCost = currencyReserves[code].cost / (currencyReserves[code].quantity + Number(e.quantity));
        currencyReserves[code].cost = currencyReserves[code].quantity * avgCost;
      } else {
        currencyReserves[code].cost = 0;
      }
    });

    const totalCurrentReserveValue = Object.values(currencyReserves).reduce(
      (sum, reserve) => sum + (Number(reserve.cost) || 0), 
      0
    );

    return NextResponse.json({
      summary: {
        totalRealizedProfitLoss,
        totalUnrealizedProfitLoss,
        totalPurchaseCost,
        totalSaleRevenue,
        totalCurrentReserveValue,
        totalCurrencies: Object.keys(currencyReserves).length,
      },
      currencyReserves,
    }, { status: 200 });
  } catch (error) {
    console.error('Error fetching exchange dashboard:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data', message: error.message },
      { status: 500 }
    );
  }
}

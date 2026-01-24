import { NextResponse } from 'next/server';
import { getDb } from '../../../../lib/mongodb';

// GET currency reserves
export async function GET(request) {
  try {
    const db = await getDb();
    const exchangesCollection = db.collection('money_exchanges');

    // Get all active exchanges
    const exchanges = await exchangesCollection
      .find({ isActive: { $ne: false } })
      .sort({ date: -1 })
      .toArray();

    // Calculate reserves for each currency
    const currencyReserves = {};
    
    exchanges.forEach(exchange => {
      const code = exchange.currencyCode;
      if (!code) return;
      
      if (!currencyReserves[code]) {
        currencyReserves[code] = {
          currencyCode: code,
          currencyName: exchange.currencyName || code,
          totalBought: 0,
          totalSold: 0,
          adjustmentAmount: 0,
          reserve: 0,
          weightedAveragePurchasePrice: 0,
          lastBuyRate: 0,
          lastSellRate: 0,
          currentReserveValue: 0,
          totalCost: 0,
          totalQuantity: 0
        };
      }

      if (exchange.type === 'Buy') {
        const quantity = Number(exchange.quantity) || 0;
        const amountBDT = Number(exchange.amount_bdt) || 0;
        const rate = Number(exchange.exchangeRate) || 0;
        
        currencyReserves[code].totalBought += quantity;
        currencyReserves[code].totalCost += amountBDT;
        currencyReserves[code].totalQuantity += quantity;
        
        if (rate > 0) {
          currencyReserves[code].lastBuyRate = rate;
        }
      } else if (exchange.type === 'Sell') {
        const quantity = Number(exchange.quantity) || 0;
        const rate = Number(exchange.exchangeRate) || 0;
        
        currencyReserves[code].totalSold += quantity;
        currencyReserves[code].totalQuantity -= quantity;
        
        if (rate > 0) {
          currencyReserves[code].lastSellRate = rate;
        }
      } else if (exchange.type === 'Adjustment') {
        const quantity = Number(exchange.quantity) || 0;
        currencyReserves[code].adjustmentAmount += quantity;
        currencyReserves[code].totalQuantity += quantity;
      }
    });

    // Calculate final reserves and weighted average
    const reserves = Object.values(currencyReserves).map(reserve => {
      reserve.reserve = reserve.totalQuantity;
      
      // Calculate weighted average purchase price
      if (reserve.totalBought > 0) {
        reserve.weightedAveragePurchasePrice = reserve.totalCost / reserve.totalBought;
      }
      
      // Calculate current reserve value using last sell rate or weighted average
      const rate = reserve.lastSellRate || reserve.weightedAveragePurchasePrice || 0;
      reserve.currentReserveValue = reserve.reserve * rate;
      
      return reserve;
    }).filter(r => r.reserve !== 0 || r.totalBought > 0 || r.totalSold > 0);

    // Calculate summary
    const totalCurrencies = reserves.length;
    const totalReserveValue = reserves.reduce((sum, r) => sum + (r.currentReserveValue || 0), 0);

    return NextResponse.json({
      success: true,
      data: reserves,
      summary: {
        totalCurrencies,
        totalReserveValue
      }
    }, { status: 200 });
  } catch (error) {
    console.error('Error fetching reserves:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reserves', message: error.message },
      { status: 500 }
    );
  }
}

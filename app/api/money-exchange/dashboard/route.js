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
    const query = { isActive: { $ne: false } };
    
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
    const buyExchanges = exchanges.filter(e => e.type === 'Buy');
    const sellExchanges = exchanges.filter(e => e.type === 'Sell');

    const totalPurchaseCost = buyExchanges.reduce((sum, e) => sum + (Number(e.amount_bdt) || 0), 0);
    const totalSaleRevenue = sellExchanges.reduce((sum, e) => sum + (Number(e.amount_bdt) || 0), 0);
    
    // Calculate realized profit/loss (completed transactions)
    const totalRealizedProfitLoss = totalSaleRevenue - totalPurchaseCost;
    
    // For unrealized, we'd need current exchange rates and inventory
    const totalUnrealizedProfitLoss = 0;
    
    // Calculate per-currency statistics
    const currencyStats = {};
    
    buyExchanges.forEach(e => {
      const code = e.currencyCode;
      if (!code) return;
      
      if (!currencyStats[code]) {
        currencyStats[code] = {
          currencyCode: code,
          currencyName: e.currencyName || code,
          totalBought: 0,
          totalSold: 0,
          currentReserve: 0,
          totalPurchaseCost: 0,
          totalSaleRevenue: 0,
          totalCost: 0,
          totalQuantity: 0
        };
      }
      
      const quantity = Number(e.quantity) || 0;
      const amountBDT = Number(e.amount_bdt) || 0;
      
      currencyStats[code].totalBought += quantity;
      currencyStats[code].totalPurchaseCost += amountBDT;
      currencyStats[code].totalCost += amountBDT;
      currencyStats[code].totalQuantity += quantity;
    });
    
    sellExchanges.forEach(e => {
      const code = e.currencyCode;
      if (!code) return;
      
      if (!currencyStats[code]) {
        currencyStats[code] = {
          currencyCode: code,
          currencyName: e.currencyName || code,
          totalBought: 0,
          totalSold: 0,
          currentReserve: 0,
          totalPurchaseCost: 0,
          totalSaleRevenue: 0,
          totalCost: 0,
          totalQuantity: 0
        };
      }
      
      const quantity = Number(e.quantity) || 0;
      const amountBDT = Number(e.amount_bdt) || 0;
      
      currencyStats[code].totalSold += quantity;
      currencyStats[code].totalSaleRevenue += amountBDT;
      currencyStats[code].totalQuantity -= quantity;
    });

    // Calculate final stats for each currency
    const dashboardItems = Object.values(currencyStats).map(stat => {
      stat.currentReserve = stat.totalQuantity;
      
      // Calculate weighted average purchase price
      const weightedAveragePurchasePrice = stat.totalBought > 0 
        ? stat.totalPurchaseCost / stat.totalBought 
        : 0;
      
      // Calculate realized profit/loss for this currency
      const realizedProfitLoss = stat.totalSaleRevenue - stat.totalPurchaseCost;
      
      return {
        currencyCode: stat.currencyCode,
        currencyName: stat.currencyName,
        totalBought: stat.totalBought,
        totalSold: stat.totalSold,
        currentReserve: stat.currentReserve,
        weightedAveragePurchasePrice: weightedAveragePurchasePrice,
        realizedProfitLoss: realizedProfitLoss,
        totalPurchaseCost: stat.totalPurchaseCost,
        totalSaleRevenue: stat.totalSaleRevenue
      };
    }).filter(item => item.totalBought > 0 || item.totalSold > 0);

    // Calculate total current reserve value
    const totalCurrentReserveValue = dashboardItems.reduce(
      (sum, item) => sum + (item.currentReserve * item.weightedAveragePurchasePrice), 
      0
    );

    return NextResponse.json({
      success: true,
      data: dashboardItems,
      summary: {
        totalRealizedProfitLoss,
        totalUnrealizedProfitLoss,
        totalPurchaseCost,
        totalSaleRevenue,
        totalCurrentReserveValue,
        totalCurrencies: dashboardItems.length,
      }
    }, { status: 200 });
  } catch (error) {
    console.error('Error fetching exchange dashboard:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data', message: error.message },
      { status: 500 }
    );
  }
}

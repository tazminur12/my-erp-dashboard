import { NextResponse } from 'next/server';
import { getDb } from '../../../../lib/mongodb';
import { ObjectId } from 'mongodb';

// GET vendor dashboard statistics
export async function GET(request) {
  try {
    const db = await getDb();
    const vendorsCollection = db.collection('vendors');
    const vendorBillsCollection = db.collection('vendor_bills');

    // Get all vendors with their bill statistics
    const allVendors = await vendorsCollection.find({}).toArray();

    // Calculate global statistics from vendors collection (Source of Truth for payments/due)
    const totalVendors = allVendors.length;
    
    const globalStats = allVendors.reduce((acc, vendor) => {
      const paid = Number(vendor.totalPaid || vendor.paidAmount || vendor.totalPaidAmount || 0);
      const due = Number(vendor.totalDue || vendor.dueAmount || vendor.outstandingAmount || vendor.totalDueAmount || 0);
      return {
        totalPaid: acc.totalPaid + paid,
        totalDue: acc.totalDue + due
      };
    }, { totalPaid: 0, totalDue: 0 });

    // Calculate bill statistics from bills collection
    const allBills = await vendorBillsCollection.find({}).toArray();
    const totalBills = allBills.length;
    const totalBillAmount = allBills.reduce((sum, bill) => sum + (Number(bill.totalAmount) || Number(bill.amount) || 0), 0);

    // Calculate bill counts per vendor
    const vendorBillCounts = {};
    const vendorBillAmounts = {}; // Track bill amounts per vendor from bills collection
    
    allBills.forEach((bill) => {
      // Handle different vendor ID formats
      let vendorId = '';
      if (bill.vendorId) {
        if (typeof bill.vendorId === 'string') {
          vendorId = bill.vendorId;
        } else if (bill.vendorId instanceof ObjectId) {
          vendorId = bill.vendorId.toString();
        }
      } else if (bill.vendorIdString) {
        vendorId = bill.vendorIdString.toString();
      }
      
      if (vendorId) {
        vendorBillCounts[vendorId] = (vendorBillCounts[vendorId] || 0) + 1;
        vendorBillAmounts[vendorId] = (vendorBillAmounts[vendorId] || 0) + (Number(bill.totalAmount) || Number(bill.amount) || 0);
      }
    });

    // Format vendors with statistics
    const formattedRecentVendors = allVendors.map((vendor) => {
      const vendorId = vendor._id.toString();
      const vendorIdAlt = vendor.vendorId?.toString() || vendorId;
      
      // Get bill count from our aggregation
      const billCount = vendorBillCounts[vendorId] || vendorBillCounts[vendorIdAlt] || 0;
      
      // Get financial stats from Vendor document (Source of Truth)
      const paidAmount = Number(vendor.totalPaid || vendor.paidAmount || vendor.totalPaidAmount || 0);
      const dueAmount = Number(vendor.totalDue || vendor.dueAmount || vendor.outstandingAmount || vendor.totalDueAmount || 0);
      
      // For total bill amount, we can use the sum of bills OR (paid + due)
      // Using sum of bills is more accurate for "Billed Amount", but might mismatch (Paid + Due) if data is inconsistent
      // Let's use the sum of bills from the bills collection
      const totalBillAmount = vendorBillAmounts[vendorId] || vendorBillAmounts[vendorIdAlt] || 0;

      return {
        _id: vendorId,
        vendorId: vendorIdAlt,
        tradeName: vendor.tradeName || '',
        tradeLocation: vendor.tradeLocation || '',
        ownerName: vendor.ownerName || '',
        contactNo: vendor.contactNo || '',
        logo: vendor.logo || vendor.photo || vendor.photoUrl || vendor.image || vendor.avatar || vendor.profilePicture || null,
        status: vendor.status || 'active',
        created_at: vendor.created_at ? vendor.created_at.toISOString() : new Date().toISOString(),
        billCount: billCount,
        totalBillAmount: totalBillAmount,
        paidAmount: paidAmount,
        dueAmount: dueAmount,
      };
    });

    // Get status distribution
    const activeVendors = allVendors.filter(v => v.status === 'active').length;
    const inactiveVendors = allVendors.filter(v => v.status === 'inactive').length;

    const dashboardData = {
      statistics: {
        totalVendors,
        activeVendors,
        inactiveVendors,
      },
      bills: {
        totalBills,
        totalAmount: totalBillAmount,
        totalPaid: globalStats.totalPaid,
        totalDue: globalStats.totalDue,
      },
      recentActivity: {
        vendors: formattedRecentVendors,
      },
      distribution: {
        active: activeVendors,
        inactive: inactiveVendors,
      },
    };

    console.log('Dashboard Data Calculated:', {
      totalPaid: globalStats.totalPaid,
      totalDue: globalStats.totalDue,
      totalBillAmount
    });

    return NextResponse.json(
      { ...dashboardData, data: dashboardData },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching vendor dashboard:', error);
    return NextResponse.json(
      { error: 'Failed to fetch vendor dashboard', message: error.message },
      { status: 500 }
    );
  }
}

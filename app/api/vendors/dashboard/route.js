import { NextResponse } from 'next/server';
import { getDb } from '../../../../lib/mongodb';

// GET vendor dashboard statistics
export async function GET(request) {
  try {
    const db = await getDb();
    const vendorsCollection = db.collection('vendors');
    const vendorBillsCollection = db.collection('vendor_bills');

    // Get total vendors count
    const totalVendors = await vendorsCollection.countDocuments({});

    // Get all vendor bills for statistics
    const allBills = await vendorBillsCollection.find({}).toArray();

    // Calculate bill statistics
    const totalBills = allBills.length;
    const totalAmount = allBills.reduce((sum, bill) => sum + (Number(bill.totalAmount) || Number(bill.amount) || 0), 0);
    const totalPaid = allBills.reduce((sum, bill) => sum + (Number(bill.paidAmount) || 0), 0);
    const totalDue = Math.max(0, totalAmount - totalPaid);

    // Get recent vendors (last 10)
    const recentVendors = await vendorsCollection
      .find({})
      .sort({ created_at: -1 })
      .limit(10)
      .toArray();

    // Format recent vendors
    const formattedRecentVendors = recentVendors.map((vendor) => ({
      _id: vendor._id.toString(),
      vendorId: vendor.vendorId || vendor._id.toString(),
      tradeName: vendor.tradeName || '',
      tradeLocation: vendor.tradeLocation || '',
      ownerName: vendor.ownerName || '',
      contactNo: vendor.contactNo || '',
      logo: vendor.logo || vendor.photo || vendor.photoUrl || vendor.image || vendor.avatar || vendor.profilePicture || null,
      status: vendor.status || 'active',
      created_at: vendor.created_at ? vendor.created_at.toISOString() : new Date().toISOString(),
    }));

    // Get status distribution
    const activeVendors = await vendorsCollection.countDocuments({ status: 'active' });
    const inactiveVendors = await vendorsCollection.countDocuments({ status: 'inactive' });

    const dashboardData = {
      statistics: {
        totalVendors,
        activeVendors,
        inactiveVendors,
      },
      bills: {
        totalBills,
        totalAmount,
        totalPaid,
        totalDue,
      },
      recentActivity: {
        vendors: formattedRecentVendors,
      },
      distribution: {
        active: activeVendors,
        inactive: inactiveVendors,
      },
    };

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

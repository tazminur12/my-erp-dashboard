import { NextResponse } from 'next/server';
import { getDb } from '../../../../lib/mongodb';

// GET all vendor bills (with optional filters)
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const vendorId = searchParams.get('vendorId');
    const billType = searchParams.get('billType');
    const paymentStatus = searchParams.get('paymentStatus');
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    const db = await getDb();
    const vendorBillsCollection = db.collection('vendor_bills');

    // Build query
    const query = {};
    
    if (vendorId) {
      query.vendorId = vendorId;
    }
    
    if (billType) {
      query.billType = billType;
    }
    
    if (paymentStatus) {
      query.paymentStatus = paymentStatus;
    }
    
    if (dateFrom || dateTo) {
      query.billDate = {};
      if (dateFrom) {
        query.billDate.$gte = new Date(dateFrom);
      }
      if (dateTo) {
        query.billDate.$lte = new Date(dateTo);
      }
    }
    
    if (search) {
      query.$or = [
        { billNumber: { $regex: search, $options: 'i' } },
        { billId: { $regex: search, $options: 'i' } },
        { vendorName: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    // Get total count
    const total = await vendorBillsCollection.countDocuments(query);
    const skip = (page - 1) * limit;

    const bills = await vendorBillsCollection
      .find(query)
      .sort({ createdAt: -1, billDate: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    // Format bills for frontend
    const formattedBills = bills.map((bill) => ({
      id: bill._id?.toString() || bill.billId || '',
      _id: bill._id?.toString() || bill.billId || '',
      billId: bill.billId || bill._id?.toString() || '',
      billNumber: bill.billNumber || bill.billId || '',
      vendorId: bill.vendorId || '',
      vendorName: bill.vendorName || '',
      billType: bill.billType || '',
      billDate: bill.billDate ? (bill.billDate instanceof Date ? bill.billDate.toISOString().split('T')[0] : bill.billDate) : '',
      totalAmount: bill.totalAmount || bill.amount || 0,
      paidAmount: bill.paidAmount || 0,
      dueAmount: (bill.totalAmount || bill.amount || 0) - (bill.paidAmount || 0),
      dueDate: bill.dueDate || '',
      paymentMethod: bill.paymentMethod || '',
      paymentStatus: bill.paymentStatus || 'pending',
      description: bill.description || '',
      notes: bill.notes || '',
      createdAt: bill.createdAt ? (bill.createdAt instanceof Date ? bill.createdAt.toISOString() : bill.createdAt) : new Date().toISOString(),
      updatedAt: bill.updatedAt ? (bill.updatedAt instanceof Date ? bill.updatedAt.toISOString() : bill.updatedAt) : bill.createdAt ? (bill.createdAt instanceof Date ? bill.createdAt.toISOString() : bill.createdAt) : new Date().toISOString(),
    }));

    return NextResponse.json({
      bills: formattedBills,
      data: formattedBills,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    }, { status: 200 });
  } catch (error) {
    console.error('Error fetching vendor bills:', error);
    return NextResponse.json(
      { error: 'Failed to fetch vendor bills', message: error.message },
      { status: 500 }
    );
  }
}

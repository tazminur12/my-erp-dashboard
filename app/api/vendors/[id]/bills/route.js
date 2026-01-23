import { NextResponse } from 'next/server';
import { getDb } from '../../../../../lib/mongodb';
import { ObjectId } from 'mongodb';

// GET all bills for a vendor
export async function GET(request, { params }) {
  try {
    const resolvedParams = params instanceof Promise ? await params : params;
    const { id } = resolvedParams;

    if (!id) {
      return NextResponse.json(
        { error: 'Vendor ID is required' },
        { status: 400 }
      );
    }

    const db = await getDb();
    const vendorBillsCollection = db.collection('vendor_bills');

    const bills = await vendorBillsCollection
      .find({ vendorId: id })
      .sort({ createdAt: -1 })
      .toArray();

    const formattedBills = bills.map((bill) => ({
      id: bill._id?.toString() || bill.billId || '',
      _id: bill._id?.toString() || bill.billId || '',
      billId: bill.billId || bill._id?.toString() || '',
      billNumber: bill.billNumber || bill.billId || '',
      billType: bill.billType || '',
      billDate: bill.billDate || bill.createdAt || '',
      totalAmount: bill.totalAmount || bill.amount || 0,
      paidAmount: bill.paidAmount || 0,
      dueDate: bill.dueDate || '',
      paymentMethod: bill.paymentMethod || '',
      paymentStatus: bill.paymentStatus || 'pending',
      description: bill.description || '',
      notes: bill.notes || '',
      createdAt: bill.createdAt || bill.billDate || new Date().toISOString(),
    }));

    return NextResponse.json({ bills: formattedBills, data: formattedBills }, { status: 200 });
  } catch (error) {
    console.error('Error fetching vendor bills:', error);
    return NextResponse.json(
      { error: 'Failed to fetch vendor bills', message: error.message },
      { status: 500 }
    );
  }
}

// POST create new bill for a vendor
export async function POST(request, { params }) {
  try {
    const resolvedParams = params instanceof Promise ? await params : params;
    const { id } = resolvedParams;
    const body = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: 'Vendor ID is required' },
        { status: 400 }
      );
    }

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid vendor ID format' },
        { status: 400 }
      );
    }

    const db = await getDb();
    const vendorsCollection = db.collection('vendors');
    const vendorBillsCollection = db.collection('vendor_bills');

    // Check if vendor exists
    const vendor = await vendorsCollection.findOne({ _id: new ObjectId(id) });

    if (!vendor) {
      return NextResponse.json(
        { error: 'Vendor not found' },
        { status: 404 }
      );
    }

    // Generate unique bill ID if not provided
    let billId = body.billId || body.billNumber;
    if (!billId) {
      const billsWithIds = await vendorBillsCollection
        .find({ billId: { $regex: /^BILL\d+$/i } })
        .toArray();
      
      let maxNumber = 0;
      if (billsWithIds.length > 0) {
        billsWithIds.forEach(bill => {
          if (bill.billId) {
            const idNumber = parseInt(bill.billId.toUpperCase().replace(/^BILL-?/, '')) || 0;
            if (idNumber > maxNumber) {
              maxNumber = idNumber;
            }
          }
        });
      }
      
      billId = `BILL${String(maxNumber + 1).padStart(6, '0')}`;
    }

    // Create new bill
    const newBill = {
      billId,
      billNumber: body.billNumber || billId,
      vendorId: id,
      vendorName: body.vendorName || vendor.tradeName || '',
      billType: body.billType || '',
      billDate: body.billDate || new Date().toISOString(),
      description: body.description ? body.description.trim() : '',
      totalAmount: parseFloat(body.totalAmount || body.amount || 0),
      amount: parseFloat(body.totalAmount || body.amount || 0),
      paidAmount: parseFloat(body.paidAmount || 0),
      paymentStatus: body.paymentStatus || (parseFloat(body.paidAmount || 0) >= parseFloat(body.totalAmount || body.amount || 0) ? 'paid' : 'pending'),
      dueDate: body.dueDate || '',
      paymentMethod: body.paymentMethod || '',
      notes: body.notes ? body.notes.trim() : '',
      // Air ticket specific fields
      tripType: body.tripType || '',
      flightType: body.flightType || '',
      bookingId: body.bookingId || '',
      gdsPnr: body.gdsPnr || '',
      airlinePnr: body.airlinePnr || '',
      airline: body.airline || '',
      origin: body.origin || '',
      destination: body.destination || '',
      flightDate: body.flightDate || '',
      returnDate: body.returnDate || '',
      segments: Array.isArray(body.segments) ? body.segments : [],
      agent: body.agent || '',
      purposeType: body.purposeType || '',
      adultCount: parseInt(body.adultCount) || 0,
      childCount: parseInt(body.childCount) || 0,
      infantCount: parseInt(body.infantCount) || 0,
      customerDeal: parseFloat(body.customerDeal) || 0,
      customerPaid: parseFloat(body.customerPaid) || 0,
      customerDue: parseFloat(body.customerDue) || 0,
      baseFare: parseFloat(body.baseFare) || 0,
      taxBD: parseFloat(body.taxBD) || 0,
      e5: parseFloat(body.e5) || 0,
      e7: parseFloat(body.e7) || 0,
      g8: parseFloat(body.g8) || 0,
      ow: parseFloat(body.ow) || 0,
      p7: parseFloat(body.p7) || 0,
      p8: parseFloat(body.p8) || 0,
      ts: parseFloat(body.ts) || 0,
      ut: parseFloat(body.ut) || 0,
      yq: parseFloat(body.yq) || 0,
      taxes: parseFloat(body.taxes) || 0,
      totalTaxes: parseFloat(body.totalTaxes) || 0,
      ait: parseFloat(body.ait) || 0,
      commissionRate: parseFloat(body.commissionRate) || 0,
      plb: parseFloat(body.plb) || 0,
      salmaAirServiceCharge: parseFloat(body.salmaAirServiceCharge) || 0,
      vendorServiceCharge: parseFloat(body.vendorServiceCharge) || 0,
      vendorAmount: parseFloat(body.vendorAmount) || 0,
      vendorPaidFh: parseFloat(body.vendorPaidFh) || 0,
      vendorDue: parseFloat(body.vendorDue) || 0,
      profit: parseFloat(body.profit) || 0,
      segmentCount: parseInt(body.segmentCount) || 1,
      flownSegment: Boolean(body.flownSegment),
      ticketId: body.ticketId || '',
      ticketReference: body.ticketReference || body.bookingId || '',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await vendorBillsCollection.insertOne(newBill);

    // Fetch created bill
    const createdBill = await vendorBillsCollection.findOne({
      _id: result.insertedId
    });

    // Format bill for frontend
    const formattedBill = {
      id: createdBill._id.toString(),
      _id: createdBill._id.toString(),
      billId: createdBill.billId,
      billNumber: createdBill.billNumber,
      ...newBill,
      createdAt: createdBill.createdAt.toISOString(),
      updatedAt: createdBill.updatedAt.toISOString(),
    };

    return NextResponse.json({
      success: true,
      message: 'Vendor bill created successfully',
      bill: formattedBill,
      data: formattedBill,
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating vendor bill:', error);
    return NextResponse.json(
      { error: 'Failed to create vendor bill', message: error.message },
      { status: 500 }
    );
  }
}

import { NextResponse } from 'next/server';
import { getDb } from '../../../../../../lib/mongodb';
import { ObjectId } from 'mongodb';

// GET single bill
export async function GET(request, { params }) {
  try {
    const resolvedParams = params instanceof Promise ? await params : params;
    const { id, billId } = resolvedParams;

    if (!id || !billId) {
      return NextResponse.json(
        { error: 'Vendor ID and Bill ID are required' },
        { status: 400 }
      );
    }

    const db = await getDb();
    const vendorBillsCollection = db.collection('vendor_bills');

    let bill = null;
    if (ObjectId.isValid(billId)) {
      bill = await vendorBillsCollection.findOne({ 
        _id: new ObjectId(billId),
        vendorId: id 
      });
    }

    if (!bill) {
      // Try to find by billId field
      bill = await vendorBillsCollection.findOne({ 
        billId: billId,
        vendorId: id 
      });
    }

    if (!bill) {
      return NextResponse.json(
        { error: 'Bill not found' },
        { status: 404 }
      );
    }

    const formattedBill = {
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
    };

    return NextResponse.json({ bill: formattedBill }, { status: 200 });
  } catch (error) {
    console.error('Error fetching vendor bill:', error);
    return NextResponse.json(
      { error: 'Failed to fetch vendor bill', message: error.message },
      { status: 500 }
    );
  }
}

// PUT update bill
export async function PUT(request, { params }) {
  try {
    const resolvedParams = params instanceof Promise ? await params : params;
    const { id, billId } = resolvedParams;
    const body = await request.json();

    if (!id || !billId) {
      return NextResponse.json(
        { error: 'Vendor ID and Bill ID are required' },
        { status: 400 }
      );
    }

    const {
      billNumber,
      billType,
      billDate,
      totalAmount,
      paidAmount,
      dueDate,
      paymentMethod,
      paymentStatus,
      description,
      notes
    } = body;

    // Validation
    if (!billNumber || !billNumber.trim()) {
      return NextResponse.json(
        { error: 'Bill Number is required' },
        { status: 400 }
      );
    }

    if (!totalAmount || parseFloat(totalAmount) < 0) {
      return NextResponse.json(
        { error: 'Valid total amount is required' },
        { status: 400 }
      );
    }

    const db = await getDb();
    const vendorBillsCollection = db.collection('vendor_bills');

    // Find bill
    let bill = null;
    if (ObjectId.isValid(billId)) {
      bill = await vendorBillsCollection.findOne({ 
        _id: new ObjectId(billId),
        vendorId: id 
      });
    }

    if (!bill) {
      bill = await vendorBillsCollection.findOne({ 
        billId: billId,
        vendorId: id 
      });
    }

    if (!bill) {
      return NextResponse.json(
        { error: 'Bill not found' },
        { status: 404 }
      );
    }

    // Update bill
    const updateData = {
      billNumber: billNumber.trim(),
      billType: billType?.trim() || '',
      billDate: billDate || new Date().toISOString(),
      totalAmount: parseFloat(totalAmount),
      paidAmount: parseFloat(paidAmount || 0),
      dueDate: dueDate || '',
      paymentMethod: paymentMethod?.trim() || '',
      paymentStatus: paymentStatus || 'pending',
      description: description?.trim() || '',
      notes: notes?.trim() || '',
      updatedAt: new Date(),
    };

    const updateQuery = ObjectId.isValid(billId) 
      ? { _id: new ObjectId(billId) }
      : { billId: billId };

    await vendorBillsCollection.updateOne(
      updateQuery,
      { $set: updateData }
    );

    const updatedBill = await vendorBillsCollection.findOne(updateQuery);

    const formattedBill = {
      id: updatedBill._id?.toString() || billId,
      _id: updatedBill._id?.toString() || billId,
      billId: updatedBill.billId || updatedBill._id?.toString() || billId,
      ...updateData,
      createdAt: updatedBill.createdAt || bill.createdAt || new Date().toISOString(),
    };

    return NextResponse.json(
      { message: 'Bill updated successfully', bill: formattedBill },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating vendor bill:', error);
    return NextResponse.json(
      { error: 'Failed to update vendor bill', message: error.message },
      { status: 500 }
    );
  }
}

// DELETE bill
export async function DELETE(request, { params }) {
  try {
    const resolvedParams = params instanceof Promise ? await params : params;
    const { id, billId } = resolvedParams;

    if (!id || !billId) {
      return NextResponse.json(
        { error: 'Vendor ID and Bill ID are required' },
        { status: 400 }
      );
    }

    const db = await getDb();
    const vendorBillsCollection = db.collection('vendor_bills');

    // Find bill
    let bill = null;
    if (ObjectId.isValid(billId)) {
      bill = await vendorBillsCollection.findOne({ 
        _id: new ObjectId(billId),
        vendorId: id 
      });
    }

    if (!bill) {
      bill = await vendorBillsCollection.findOne({ 
        billId: billId,
        vendorId: id 
      });
    }

    if (!bill) {
      return NextResponse.json(
        { error: 'Bill not found' },
        { status: 404 }
      );
    }

    const deleteQuery = ObjectId.isValid(billId) 
      ? { _id: new ObjectId(billId) }
      : { billId: billId };

    await vendorBillsCollection.deleteOne(deleteQuery);

    return NextResponse.json(
      { message: 'Bill deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting vendor bill:', error);
    return NextResponse.json(
      { error: 'Failed to delete vendor bill', message: error.message },
      { status: 500 }
    );
  }
}

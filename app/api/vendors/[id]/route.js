import { NextResponse } from 'next/server';
import { getDb } from '../../../../lib/mongodb';
import { ObjectId } from 'mongodb';

// GET single vendor
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

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid vendor ID format' },
        { status: 400 }
      );
    }

    const db = await getDb();
    const vendorsCollection = db.collection('vendors');

    const vendor = await vendorsCollection.findOne({ _id: new ObjectId(id) });

    if (!vendor) {
      return NextResponse.json(
        { error: 'Vendor not found' },
        { status: 404 }
      );
    }

    const formattedVendor = {
      id: vendor._id.toString(),
      _id: vendor._id.toString(),
      vendorId: vendor.vendorId || vendor._id.toString(),
      tradeName: vendor.tradeName || '',
      tradeLocation: vendor.tradeLocation || '',
      ownerName: vendor.ownerName || '',
      contactNo: vendor.contactNo || '',
      dob: vendor.dob || '',
      nid: vendor.nid || '',
      passport: vendor.passport || '',
      logo: vendor.logo || '',
      totalPaid: vendor.totalPaid || vendor.totalPaidAmount || 0,
      totalDue: vendor.totalDue || vendor.dueAmount || vendor.outstandingAmount || vendor.totalDueAmount || 0,
      paidAmount: vendor.totalPaid || vendor.paidAmount || vendor.totalPaidAmount || 0,
      dueAmount: vendor.totalDue || vendor.dueAmount || vendor.outstandingAmount || vendor.totalDueAmount || 0,
      status: vendor.status || 'active',
      created_at: vendor.created_at ? vendor.created_at.toISOString() : '',
      updated_at: vendor.updated_at ? vendor.updated_at.toISOString() : '',
    };

    return NextResponse.json({ vendor: formattedVendor }, { status: 200 });
  } catch (error) {
    console.error('Error fetching vendor:', error);
    return NextResponse.json(
      { error: 'Failed to fetch vendor', message: error.message },
      { status: 500 }
    );
  }
}

// PUT update vendor
export async function PUT(request, { params }) {
  try {
    const resolvedParams = params instanceof Promise ? await params : params;
    const { id } = resolvedParams;
    const body = await request.json();
    const { tradeName, tradeLocation, ownerName, contactNo, dob, nid, passport, logo } = body;

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

    // Validation
    if (!tradeName || !tradeName.trim()) {
      return NextResponse.json(
        { error: 'Trade Name is required' },
        { status: 400 }
      );
    }

    if (!tradeLocation || !tradeLocation.trim()) {
      return NextResponse.json(
        { error: 'Trade Location is required' },
        { status: 400 }
      );
    }

    if (!ownerName || !ownerName.trim()) {
      return NextResponse.json(
        { error: "Owner's Name is required" },
        { status: 400 }
      );
    }

    if (!contactNo || !contactNo.trim()) {
      return NextResponse.json(
        { error: 'Contact No is required' },
        { status: 400 }
      );
    }

    // Validate phone number format
    const phoneRegex = /^\+?[0-9\-()\s]{6,20}$/;
    if (!phoneRegex.test(contactNo.trim())) {
      return NextResponse.json(
        { error: 'Enter a valid phone number' },
        { status: 400 }
      );
    }

    // Validate NID if provided
    if (nid && nid.trim()) {
      const nidRegex = /^[0-9]{8,20}$/;
      if (!nidRegex.test(nid.trim())) {
        return NextResponse.json(
          { error: 'NID should be 8-20 digits' },
          { status: 400 }
        );
      }
    }

    // Validate Passport if provided
    if (passport && passport.trim()) {
      const passportRegex = /^[A-Za-z0-9]{6,12}$/;
      if (!passportRegex.test(passport.trim())) {
        return NextResponse.json(
          { error: 'Passport should be 6-12 alphanumeric characters' },
          { status: 400 }
        );
      }
    }

    const db = await getDb();
    const vendorsCollection = db.collection('vendors');

    // Check if vendor exists
    const existingVendor = await vendorsCollection.findOne({ _id: new ObjectId(id) });

    if (!existingVendor) {
      return NextResponse.json(
        { error: 'Vendor not found' },
        { status: 404 }
      );
    }

    // Check if trade name already exists for another vendor
    const duplicateVendor = await vendorsCollection.findOne({
      tradeName: tradeName.trim(),
      _id: { $ne: new ObjectId(id) }
    });

    if (duplicateVendor) {
      return NextResponse.json(
        { error: 'Vendor with this trade name already exists' },
        { status: 400 }
      );
    }

    // Update vendor
    const updateData = {
      tradeName: tradeName.trim(),
      tradeLocation: tradeLocation.trim(),
      ownerName: ownerName.trim(),
      contactNo: contactNo.trim(),
      dob: dob || '',
      nid: nid ? nid.trim() : '',
      passport: passport ? passport.trim() : '',
      logo: logo || '',
      updated_at: new Date(),
    };

    await vendorsCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    const updatedVendor = await vendorsCollection.findOne({ _id: new ObjectId(id) });

    const formattedVendor = {
      id: updatedVendor._id.toString(),
      _id: updatedVendor._id.toString(),
      vendorId: updatedVendor.vendorId || updatedVendor._id.toString(),
      ...updateData,
      totalPaid: updatedVendor.totalPaid || 0,
      totalDue: updatedVendor.totalDue || 0,
      status: updatedVendor.status || 'active',
      created_at: updatedVendor.created_at ? updatedVendor.created_at.toISOString() : '',
      updated_at: updateData.updated_at.toISOString(),
    };

    return NextResponse.json(
      { message: 'Vendor updated successfully', vendor: formattedVendor },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating vendor:', error);
    return NextResponse.json(
      { error: 'Failed to update vendor', message: error.message },
      { status: 500 }
    );
  }
}

// DELETE vendor
export async function DELETE(request, { params }) {
  try {
    const resolvedParams = params instanceof Promise ? await params : params;
    const { id } = resolvedParams;

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

    // Find vendor
    const existingVendor = await vendorsCollection.findOne({ _id: new ObjectId(id) });

    if (!existingVendor) {
      return NextResponse.json(
        { error: 'Vendor not found' },
        { status: 404 }
      );
    }

    // Soft delete - set status to inactive instead of deleting
    await vendorsCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: { status: 'inactive', updated_at: new Date() } }
    );

    return NextResponse.json(
      { message: 'Vendor deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting vendor:', error);
    return NextResponse.json(
      { error: 'Failed to delete vendor', message: error.message },
      { status: 500 }
    );
  }
}

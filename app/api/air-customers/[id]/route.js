import { NextResponse } from 'next/server';
import { getDb } from '../../../../lib/mongodb';
import { ObjectId } from 'mongodb';

// GET single air customer
export async function GET(request, { params }) {
  try {
    const resolvedParams = params instanceof Promise ? await params : params;
    const { id } = resolvedParams;

    if (!id) {
      return NextResponse.json(
        { error: 'Customer ID is required' },
        { status: 400 }
      );
    }

    const db = await getDb();
    const airCustomersCollection = db.collection('air_customers');

    // Try to find by _id first, then by customerId
    let customer = null;
    if (ObjectId.isValid(id)) {
      customer = await airCustomersCollection.findOne({ _id: new ObjectId(id) });
    }
    
    if (!customer) {
      customer = await airCustomersCollection.findOne({ customerId: id });
    }

    if (!customer) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      );
    }

    // Format customer for frontend
    const formattedCustomer = {
      id: customer._id.toString(),
      _id: customer._id.toString(),
      customerId: customer.customerId || '',
      name: customer.name || `${customer.firstName || ''} ${customer.lastName || ''}`.trim(),
      firstName: customer.firstName || '',
      lastName: customer.lastName || '',
      mobile: customer.mobile || '',
      whatsappNo: customer.whatsappNo || '',
      email: customer.email || '',
      customerType: customer.customerType || '',
      division: customer.division || '',
      district: customer.district || '',
      upazila: customer.upazila || '',
      address: customer.address || '',
      occupation: customer.occupation || '',
      passportNumber: customer.passportNumber || '',
      passportType: customer.passportType || '',
      issueDate: customer.issueDate || null,
      expiryDate: customer.expiryDate || null,
      dateOfBirth: customer.dateOfBirth || null,
      nidNumber: customer.nidNumber || '',
      passportFirstName: customer.passportFirstName || '',
      passportLastName: customer.passportLastName || '',
      nationality: customer.nationality || '',
      previousPassport: customer.previousPassport || '',
      gender: customer.gender || '',
      fatherName: customer.fatherName || '',
      motherName: customer.motherName || '',
      spouseName: customer.spouseName || '',
      maritalStatus: customer.maritalStatus || '',
      notes: customer.notes || '',
      referenceBy: customer.referenceBy || '',
      referenceCustomerId: customer.referenceCustomerId || '',
      customerImage: customer.customerImage || '',
      passportCopy: customer.passportCopy || '',
      nidCopy: customer.nidCopy || '',
      postCode: customer.postCode || '',
      isActive: customer.isActive !== undefined ? customer.isActive : true,
      totalAmount: customer.totalAmount || customer.calculatedTotalAmount || 0,
      paidAmount: customer.paidAmount || customer.calculatedPaidAmount || 0,
      totalDue: customer.totalDue || customer.calculatedTotalDue || 0,
      calculatedTotalAmount: customer.calculatedTotalAmount || 0,
      calculatedPaidAmount: customer.calculatedPaidAmount || 0,
      calculatedTotalDue: customer.calculatedTotalDue || 0,
      createdAt: customer.createdAt || customer._id.getTimestamp().toISOString(),
      updatedAt: customer.updatedAt || customer._id.getTimestamp().toISOString(),
    };

    return NextResponse.json({ passenger: formattedCustomer }, { status: 200 });
  } catch (error) {
    console.error('Error fetching air customer:', error);
    return NextResponse.json(
      { error: 'Failed to fetch customer', message: error.message },
      { status: 500 }
    );
  }
}

// PUT update air customer
export async function PUT(request, { params }) {
  try {
    const resolvedParams = params instanceof Promise ? await params : params;
    const { id } = resolvedParams;
    const body = await request.json();
    
    if (!id) {
      return NextResponse.json(
        { error: 'Customer ID is required' },
        { status: 400 }
      );
    }
    
    const db = await getDb();
    const airCustomersCollection = db.collection('air_customers');
    
    // Locate by _id or customerId
    let customer = null;
    if (ObjectId.isValid(id)) {
      customer = await airCustomersCollection.findOne({ _id: new ObjectId(id) });
    }
    if (!customer) {
      customer = await airCustomersCollection.findOne({ customerId: id });
    }
    if (!customer) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      );
    }
    
    // Basic validations
    if (body.mobile && body.mobile.trim()) {
      const mobileRegex = /^01[3-9]\d{8}$/;
      if (!mobileRegex.test(body.mobile.trim())) {
        return NextResponse.json(
          { error: 'Invalid mobile number format. Please use format: 01XXXXXXXXX' },
          { status: 400 }
        );
      }
    }
    if (body.email && body.email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(body.email.trim())) {
        return NextResponse.json(
          { error: 'Invalid email format' },
          { status: 400 }
        );
      }
    }
    
    const updateFields = {
      name: body.name ?? customer.name,
      banglaName: body.banglaName ?? customer.banglaName,
      firstName: body.firstName ?? customer.firstName,
      lastName: body.lastName ?? customer.lastName,
      mobile: body.mobile ?? customer.mobile,
      whatsappNo: body.whatsappNo ?? customer.whatsappNo,
      email: body.email ?? customer.email,
      occupation: body.occupation ?? customer.occupation,
      address: body.address ?? customer.address,
      division: body.division ?? customer.division,
      district: body.district ?? customer.district,
      upazila: body.upazila ?? customer.upazila,
      postCode: body.postCode ?? customer.postCode,
      customerType: body.customerType ?? customer.customerType,
      customerImage: body.customerImage ?? customer.customerImage,
      passportNumber: body.passportNumber ?? customer.passportNumber,
      passportType: body.passportType ?? customer.passportType,
      issueDate: body.issueDate ?? customer.issueDate,
      expiryDate: body.expiryDate ?? customer.expiryDate,
      dateOfBirth: body.dateOfBirth ?? customer.dateOfBirth,
      nidNumber: body.nidNumber ?? customer.nidNumber,
      passportFirstName: body.passportFirstName ?? customer.passportFirstName,
      passportLastName: body.passportLastName ?? customer.passportLastName,
      nationality: body.nationality ?? customer.nationality,
      previousPassport: body.previousPassport ?? customer.previousPassport,
      gender: body.gender ?? customer.gender,
      fatherName: body.fatherName ?? customer.fatherName,
      motherName: body.motherName ?? customer.motherName,
      spouseName: body.spouseName ?? customer.spouseName,
      maritalStatus: body.maritalStatus ?? customer.maritalStatus,
      notes: body.notes ?? customer.notes,
      referenceBy: body.referenceBy ?? customer.referenceBy,
      referenceCustomerId: body.referenceCustomerId ?? customer.referenceCustomerId,
      passportCopy: body.passportCopy ?? customer.passportCopy,
      nidCopy: body.nidCopy ?? customer.nidCopy,
      isActive: body.isActive ?? (customer.isActive !== undefined ? customer.isActive : true),
      updatedAt: new Date().toISOString(),
    };
    
    await airCustomersCollection.updateOne(
      { _id: customer._id },
      { $set: updateFields }
    );
    
    return NextResponse.json({ success: true, message: 'Customer updated successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error updating air customer:', error);
    return NextResponse.json(
      { error: 'Failed to update customer', message: error.message },
      { status: 500 }
    );
  }
}

// DELETE air customer
export async function DELETE(request, { params }) {
  try {
    const resolvedParams = params instanceof Promise ? await params : params;
    const { id } = resolvedParams;

    if (!id) {
      return NextResponse.json(
        { error: 'Customer ID is required' },
        { status: 400 }
      );
    }

    const db = await getDb();
    const airCustomersCollection = db.collection('air_customers');

    // Try to find by _id first, then by customerId
    let customer = null;
    if (ObjectId.isValid(id)) {
      customer = await airCustomersCollection.findOne({ _id: new ObjectId(id) });
    }
    
    if (!customer) {
      customer = await airCustomersCollection.findOne({ customerId: id });
    }

    if (!customer) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      );
    }

    // Soft delete - set isActive to false instead of deleting
    const updateResult = await airCustomersCollection.updateOne(
      { _id: customer._id },
      { $set: { isActive: false, updatedAt: new Date().toISOString() } }
    );

    if (updateResult.modifiedCount === 0) {
      return NextResponse.json(
        { error: 'Failed to delete customer' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: 'Customer deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting air customer:', error);
    return NextResponse.json(
      { error: 'Failed to delete customer', message: error.message },
      { status: 500 }
    );
  }
}

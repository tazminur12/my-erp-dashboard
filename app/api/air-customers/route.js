import { NextResponse } from 'next/server';
import { getDb } from '../../../lib/mongodb';
import { ObjectId } from 'mongodb';

// GET search air customers
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const searchTerm = searchParams.get('search') || '';
    const limit = parseInt(searchParams.get('limit')) || 50;
    const page = parseInt(searchParams.get('page')) || 1;
    const isActiveParam = searchParams.get('isActive');

    const db = await getDb();
    const airCustomersCollection = db.collection('air_customers');

    // Build query for search
    const query = {};
    
    if (searchTerm && searchTerm.trim()) {
      const searchRegex = { $regex: searchTerm.trim(), $options: 'i' };
      query.$or = [
        { name: searchRegex },
        { firstName: searchRegex },
        { lastName: searchRegex },
        { mobile: searchRegex },
        { customerId: searchRegex },
        { email: searchRegex },
        { passportNumber: searchRegex }
      ];
    }

    // Filter by isActive if provided
    if (isActiveParam === 'true') {
      query.isActive = { $ne: false };
    } else if (isActiveParam === 'false') {
      query.isActive = false;
    }

    // Get total count for pagination
    const total = await airCustomersCollection.countDocuments(query);

    // Calculate skip for pagination
    const skip = (page - 1) * limit;

    const customers = await airCustomersCollection
      .find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    // Format customers for frontend
    const formattedCustomers = customers.map((customer) => ({
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
      customerImage: customer.customerImage || '',
      isActive: customer.isActive !== undefined ? customer.isActive : true,
      totalAmount: customer.totalAmount || customer.calculatedTotalAmount || 0,
      paidAmount: customer.paidAmount || customer.calculatedPaidAmount || 0,
      totalDue: customer.totalDue || customer.calculatedTotalDue || 0,
      createdAt: customer.createdAt || customer._id.getTimestamp().toISOString(),
      updatedAt: customer.updatedAt || customer._id.getTimestamp().toISOString(),
    }));

    return NextResponse.json({
      customers: formattedCustomers,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    }, { status: 200 });
  } catch (error) {
    console.error('Error fetching air customers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch air customers', message: error.message },
      { status: 500 }
    );
  }
}

// POST create new air customer
export async function POST(request) {
  try {
    const body = await request.json();

    // Validation
    if (!body.firstName || !body.firstName.trim()) {
      return NextResponse.json(
        { error: 'First name is required' },
        { status: 400 }
      );
    }

    if (!body.mobile || !body.mobile.trim()) {
      return NextResponse.json(
        { error: 'Mobile number is required' },
        { status: 400 }
      );
    }

    // Validate mobile number format
    const mobileRegex = /^01[3-9]\d{8}$/;
    if (!mobileRegex.test(body.mobile.trim())) {
      return NextResponse.json(
        { error: 'Invalid mobile number format. Please use format: 01XXXXXXXXX' },
        { status: 400 }
      );
    }

    // Validate email format if provided
    if (body.email && body.email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(body.email.trim())) {
        return NextResponse.json(
          { error: 'Invalid email format' },
          { status: 400 }
        );
      }
    }

    const db = await getDb();
    const airCustomersCollection = db.collection('air_customers');

    // Check if customer with same mobile already exists
    const existingCustomer = await airCustomersCollection.findOne({
      mobile: body.mobile.trim()
    });
    
    if (existingCustomer) {
      return NextResponse.json(
        { error: 'Customer with this mobile number already exists' },
        { status: 400 }
      );
    }

    // Generate customer ID if not provided
    let customerId = body.customerId;
    if (!customerId) {
      // Get the last customer to generate next customer ID
      const lastCustomer = await airCustomersCollection
        .findOne({}, { sort: { createdAt: -1 } });
      
      if (lastCustomer && lastCustomer.customerId) {
        // Handle formats: AIR-0001, AIR0001, etc.
        const lastNumber = parseInt(lastCustomer.customerId.replace(/^AIR-?/, '')) || 0;
        customerId = `AIR${String(lastNumber + 1).padStart(4, '0')}`;
      } else {
        customerId = 'AIR0001';
      }
    }

    // Check if customer ID already exists
    const existingCustomerId = await airCustomersCollection.findOne({ customerId });
    if (existingCustomerId) {
      // Regenerate if exists
      const lastCustomer = await airCustomersCollection
        .findOne({}, { sort: { createdAt: -1 } });
      const lastNumber = parseInt(lastCustomer.customerId.replace(/^AIR-?/, '')) || 0;
      customerId = `AIR${String(lastNumber + 1).padStart(4, '0')}`;
    }

    // Create new air customer
    const newCustomer = {
      customerId,
      name: body.name || `${body.firstName || ''} ${body.lastName || ''}`.trim(),
      firstName: body.firstName || '',
      lastName: body.lastName || '',
      mobile: body.mobile.trim(),
      whatsappNo: body.whatsappNo || body.mobile.trim(),
      email: body.email || null,
      occupation: body.occupation || null,
      address: body.address || null,
      division: body.division || null,
      district: body.district || null,
      upazila: body.upazila || null,
      postCode: body.postCode || null,
      customerType: body.customerType || null,
      customerImage: body.customerImage || null,
      
      // Passport information
      passportNumber: body.passportNumber || null,
      passportType: body.passportType || null,
      issueDate: body.issueDate || null,
      expiryDate: body.expiryDate || null,
      dateOfBirth: body.dateOfBirth || null,
      nidNumber: body.nidNumber || null,
      passportFirstName: body.passportFirstName || null,
      passportLastName: body.passportLastName || null,
      nationality: body.nationality || null,
      previousPassport: body.previousPassport || null,
      gender: body.gender || null,

      // Family details
      fatherName: body.fatherName || null,
      motherName: body.motherName || null,
      spouseName: body.spouseName || null,
      maritalStatus: body.maritalStatus || null,

      // Additional information
      notes: body.notes || null,
      referenceBy: body.referenceBy || null,
      referenceCustomerId: body.referenceCustomerId || null,
      
      // Document uploads
      passportCopy: body.passportCopy || null,
      nidCopy: body.nidCopy || null,
      
      isActive: body.isActive !== undefined ? body.isActive : true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const result = await airCustomersCollection.insertOne(newCustomer);

    return NextResponse.json({
      success: true,
      message: 'Air customer created successfully',
      customer: {
        id: result.insertedId.toString(),
        ...newCustomer,
      },
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating air customer:', error);
    return NextResponse.json(
      { error: 'Failed to create air customer', message: error.message },
      { status: 500 }
    );
  }
}

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
    const period = searchParams.get('period');
    const createdBy = searchParams.get('createdBy');

    const db = await getDb();
    const airCustomersCollection = db.collection('air_customers');

    // Build query for search
    const query = {};
    
    // Filter by createdBy if provided
    if (createdBy) {
      query.$or = [
        { createdBy: createdBy },
        { employer_id: createdBy },
        { employerId: createdBy }
      ];
    }
    
    // Date filtering based on period
    if (period) {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      let startDate;
      if (period === 'today') {
        startDate = today;
      } else if (period === 'month') {
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      } else if (period === 'year') {
        startDate = new Date(now.getFullYear(), 0, 1);
      }

      if (startDate) {
        // Assuming createdAt is stored as ISO string or Date object
        // We'll try to match both string comparison and Date object comparison if possible, 
        // but typically it's ISO string in this codebase based on POST method.
        query.createdAt = { $gte: startDate.toISOString() };
      }
    }

    if (searchTerm && searchTerm.trim()) {
      const searchRegex = { $regex: searchTerm.trim(), $options: 'i' };
      const searchConditions = [
        { name: searchRegex },
        { firstName: searchRegex },
        { lastName: searchRegex },
        { mobile: searchRegex },
        { customerId: searchRegex },
        { email: searchRegex },
        { passportNumber: searchRegex }
      ];

      if (query.$or) {
        // If createdBy filter exists (which uses $or), we need to combine them with $and
        const createdByConditions = query.$or;
        delete query.$or;
        
        query.$and = [
          { $or: createdByConditions },
          { $or: searchConditions }
        ];
      } else {
        query.$or = searchConditions;
      }
    }

    // Filter by isActive if provided
    if (isActiveParam === 'true') {
      query.isActive = { $ne: false };
    } else if (isActiveParam === 'false') {
      query.isActive = false;
    }

    // Get total count for pagination
    const total = await airCustomersCollection.countDocuments(query);

    // Calculate stats (Total Amount, Paid, Due)
    const statsPipeline = [
      { $match: query },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: { $ifNull: ["$totalAmount", 0] } },
          paidAmount: { $sum: { $ifNull: ["$paidAmount", 0] } },
          totalDue: { $sum: { $ifNull: ["$totalDue", 0] } }
        }
      }
    ];
    
    const statsResult = await airCustomersCollection.aggregate(statsPipeline).toArray();
    const stats = statsResult[0] || { totalAmount: 0, paidAmount: 0, totalDue: 0 };

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
      stats: {
        totalAmount: stats.totalAmount || 0,
        paidAmount: stats.paidAmount || 0,
        totalDue: stats.totalDue || 0
      }
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
    // const existingCustomer = await airCustomersCollection.findOne({
    //   mobile: body.mobile.trim()
    // });
    
    // if (existingCustomer) {
    //   return NextResponse.json(
    //     { error: 'Customer with this mobile number already exists' },
    //     { status: 400 }
    //   );
    // }

    // Generate unique customer ID if not provided
    let customerId = body.customerId;
    if (!customerId || !customerId.trim()) {
      // Find all customers with AIR prefix IDs and get the highest number
      const customersWithIds = await airCustomersCollection
        .find({ customerId: { $regex: /^AIR\d+$/i } })
        .toArray();
      
      let maxNumber = 0;
      if (customersWithIds.length > 0) {
        // Extract numbers from all IDs and find the maximum
        customersWithIds.forEach(customer => {
          if (customer.customerId) {
            const idNumber = parseInt(customer.customerId.toUpperCase().replace(/^AIR-?/, '')) || 0;
            if (idNumber > maxNumber) {
              maxNumber = idNumber;
            }
          }
        });
      }
      
      // Generate next ID
      customerId = `AIR${String(maxNumber + 1).padStart(4, '0')}`;

      // Ensure uniqueness - check if generated ID already exists and increment if needed
      let attempts = 0;
      const maxAttempts = 100;
      while (attempts < maxAttempts) {
        const existingCustomerId = await airCustomersCollection.findOne({ customerId });
        if (!existingCustomerId) {
          break; // ID is unique, proceed
        }
        
        // Extract number and increment
        const currentNumber = parseInt(customerId.replace(/^AIR-?/i, '')) || 0;
        customerId = `AIR${String(currentNumber + 1).padStart(4, '0')}`;
        attempts++;
      }

      if (attempts >= maxAttempts) {
        return NextResponse.json(
          { error: 'Failed to generate unique customer ID. Please try again.' },
          { status: 500 }
        );
      }
    } else {
      // If customer ID is provided, validate format and check uniqueness
      customerId = customerId.trim().toUpperCase();
      
      // Validate format: AIR followed by 4 digits
      if (!/^AIR\d{4}$/.test(customerId)) {
        return NextResponse.json(
          { error: 'Invalid customer ID format. Must be in format AIR0001' },
          { status: 400 }
        );
      }

      // Check if provided ID already exists
      const existingCustomerId = await airCustomersCollection.findOne({ customerId });
      if (existingCustomerId) {
        return NextResponse.json(
          { error: `Customer ID ${customerId} already exists` },
          { status: 400 }
        );
      }
    }

    // Create new air customer
    const newCustomer = {
      customerId,
      name: body.name || `${body.firstName || ''} ${body.lastName || ''}`.trim(),
      banglaName: body.banglaName || null,
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

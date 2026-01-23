import { NextResponse } from 'next/server';
import { getDb } from '../../../lib/mongodb';

// GET all other customers with search and filters
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || searchParams.get('q');
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const db = await getDb();
    const otherCustomersCollection = db.collection('other_customers');

    // Build query
    const query = {};
    
    if (status && status !== 'all') {
      query.status = status;
    }
    
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { name: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { city: { $regex: search, $options: 'i' } },
        { country: { $regex: search, $options: 'i' } },
      ];
    }

    // Get total count for pagination
    const total = await otherCustomersCollection.countDocuments(query);

    // Calculate skip for pagination
    const skip = (page - 1) * limit;

    const customers = await otherCustomersCollection
      .find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    // Format customers for frontend
    const formattedCustomers = customers.map((customer) => ({
      id: customer._id.toString(),
      _id: customer._id.toString(),
      customerId: customer.customerId || customer._id.toString(),
      name: customer.name || '',
      firstName: customer.firstName || '',
      lastName: customer.lastName || '',
      phone: customer.phone || '',
      email: customer.email || '',
      address: customer.address || '',
      city: customer.city || '',
      country: customer.country || '',
      status: customer.status || 'active',
      notes: customer.notes || '',
      createdAt: customer.createdAt ? customer.createdAt.toISOString() : customer._id.getTimestamp().toISOString(),
      updatedAt: customer.updatedAt ? customer.updatedAt.toISOString() : customer._id.getTimestamp().toISOString(),
    }));

    return NextResponse.json({
      customers: formattedCustomers,
      data: formattedCustomers,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    }, { status: 200 });
  } catch (error) {
    console.error('Error fetching other customers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch other customers', message: error.message },
      { status: 500 }
    );
  }
}

// POST create new other customer
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

    if (!body.lastName || !body.lastName.trim()) {
      return NextResponse.json(
        { error: 'Last name is required' },
        { status: 400 }
      );
    }

    if (!body.phone || !body.phone.trim()) {
      return NextResponse.json(
        { error: 'Phone number is required' },
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
    const otherCustomersCollection = db.collection('other_customers');

    // Check if customer with same phone already exists
    const existingCustomer = await otherCustomersCollection.findOne({
      phone: body.phone.trim()
    });
    
    if (existingCustomer) {
      return NextResponse.json(
        { error: 'Customer with this phone number already exists' },
        { status: 400 }
      );
    }

    // Generate unique customer ID in format OSC-0001, OSC-0002, etc.
    let customerId = body.customerId;
    if (!customerId || !customerId.trim()) {
      // Find all customers with OSC prefix IDs
      const customersWithIds = await otherCustomersCollection
        .find({ customerId: { $regex: /^OSC-?\d+$/i } })
        .toArray();
      
      let maxNumber = 0;
      if (customersWithIds.length > 0) {
        customersWithIds.forEach(customer => {
          if (customer.customerId) {
            // Handle both formats: OSC-0001 and OSC0001
            const idNumber = parseInt(customer.customerId.toUpperCase().replace(/^OSC-?/, '')) || 0;
            if (idNumber > maxNumber) {
              maxNumber = idNumber;
            }
          }
        });
      }
      
      // Generate next ID in format OSC-0001
      customerId = `OSC-${String(maxNumber + 1).padStart(4, '0')}`;

      // Ensure uniqueness - check if generated ID already exists and increment if needed
      let attempts = 0;
      const maxAttempts = 100;
      while (attempts < maxAttempts) {
        const existingCustomerId = await otherCustomersCollection.findOne({ customerId });
        if (!existingCustomerId) {
          break; // ID is unique, proceed
        }
        
        // Extract number and increment
        const currentNumber = parseInt(customerId.replace(/^OSC-?/i, '')) || 0;
        customerId = `OSC-${String(currentNumber + 1).padStart(4, '0')}`;
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
      
      // Validate format: OSC-0001 or OSC0001
      if (!/^OSC-?\d+$/i.test(customerId)) {
        return NextResponse.json(
          { error: 'Invalid customer ID format. Must be in format OSC-0001' },
          { status: 400 }
        );
      }

      // Normalize to OSC-0001 format
      const idNumber = customerId.replace(/^OSC-?/i, '');
      customerId = `OSC-${idNumber.padStart(4, '0')}`;

      // Check if provided ID already exists
      const existingCustomerId = await otherCustomersCollection.findOne({ customerId });
      if (existingCustomerId) {
        return NextResponse.json(
          { error: `Customer ID ${customerId} already exists` },
          { status: 400 }
        );
      }
    }

    // Create new other customer
    const newCustomer = {
      customerId,
      name: body.name || `${body.firstName.trim()} ${body.lastName.trim()}`.trim(),
      firstName: body.firstName.trim(),
      lastName: body.lastName.trim(),
      phone: body.phone.trim(),
      email: body.email ? body.email.trim() : null,
      address: body.address ? body.address.trim() : null,
      city: body.city ? body.city.trim() : null,
      country: body.country ? body.country.trim() : null,
      status: body.status || 'active',
      notes: body.notes ? body.notes.trim() : null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await otherCustomersCollection.insertOne(newCustomer);

    // Fetch created customer
    const createdCustomer = await otherCustomersCollection.findOne({
      _id: result.insertedId
    });

    // Format customer for frontend
    const formattedCustomer = {
      id: createdCustomer._id.toString(),
      _id: createdCustomer._id.toString(),
      ...newCustomer,
      createdAt: createdCustomer.createdAt.toISOString(),
      updatedAt: createdCustomer.updatedAt.toISOString(),
    };

    return NextResponse.json({
      success: true,
      message: 'Other customer created successfully',
      customer: formattedCustomer,
      data: formattedCustomer,
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating other customer:', error);
    return NextResponse.json(
      { error: 'Failed to create other customer', message: error.message },
      { status: 500 }
    );
  }
}

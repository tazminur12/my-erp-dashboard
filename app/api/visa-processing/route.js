import { NextResponse } from 'next/server';
import { getDb } from '../../../lib/mongodb';

// GET all visa processing services with search and filters
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || searchParams.get('q');
    const status = searchParams.get('status');
    const country = searchParams.get('country');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const db = await getDb();
    const visaProcessingCollection = db.collection('visa_processing');

    // Build query
    const query = {};
    
    if (status && status !== 'all') {
      query.status = status;
    }
    
    if (country && country !== 'all') {
      query.country = country;
    }
    
    if (search) {
      query.$or = [
        { clientName: { $regex: search, $options: 'i' } },
        { applicantName: { $regex: search, $options: 'i' } },
        { clientId: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { passportNumber: { $regex: search, $options: 'i' } },
        { applicationId: { $regex: search, $options: 'i' } },
      ];
    }

    // Get total count for pagination
    const total = await visaProcessingCollection.countDocuments(query);

    // Calculate skip for pagination
    const skip = (page - 1) * limit;

    const services = await visaProcessingCollection
      .find(query)
      .sort({ appliedDate: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    // Format services for frontend
    const formattedServices = services.map((service) => ({
      id: service._id.toString(),
      _id: service._id.toString(),
      applicationId: service.applicationId || service._id.toString(),
      clientId: service.clientId || '',
      clientName: service.clientName || '',
      applicantName: service.applicantName || service.clientName || '',
      country: service.country || '',
      visaType: service.visaType || 'tourist',
      passportNumber: service.passportNumber || '',
      phone: service.phone || '',
      email: service.email || '',
      address: service.address || '',
      appliedDate: service.appliedDate || service.date || '',
      expectedDeliveryDate: service.expectedDeliveryDate || '',
      vendorId: service.vendorId || '',
      vendorName: service.vendorName || '',
      vendorBill: service.vendorBill || 0,
      othersBill: service.othersBill || 0,
      totalBill: service.totalBill || service.totalAmount || 0,
      totalAmount: service.totalAmount || service.totalBill || 0,
      paidAmount: service.paidAmount || 0,
      dueAmount: service.dueAmount || (service.totalAmount || service.totalBill || 0) - (service.paidAmount || 0),
      status: service.status || 'pending',
      notes: service.notes || '',
      createdAt: service.createdAt ? service.createdAt.toISOString() : service._id.getTimestamp().toISOString(),
      updatedAt: service.updatedAt ? service.updatedAt.toISOString() : service._id.getTimestamp().toISOString(),
    }));

    return NextResponse.json({
      services: formattedServices,
      data: formattedServices,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        pages: Math.ceil(total / limit),
      },
    }, { status: 200 });
  } catch (error) {
    console.error('Error fetching visa processing services:', error);
    return NextResponse.json(
      { error: 'Failed to fetch visa processing services', message: error.message },
      { status: 500 }
    );
  }
}

// POST create new visa processing service
export async function POST(request) {
  try {
    const body = await request.json();

    // Validation
    if (!body.clientName || !body.clientName.trim()) {
      return NextResponse.json(
        { error: 'Client name is required' },
        { status: 400 }
      );
    }

    if (!body.phone || !body.phone.trim()) {
      return NextResponse.json(
        { error: 'Phone number is required' },
        { status: 400 }
      );
    }

    if (!body.appliedDate && !body.date) {
      return NextResponse.json(
        { error: 'Applied date is required' },
        { status: 400 }
      );
    }

    if (!body.country || !body.country.trim()) {
      return NextResponse.json(
        { error: 'Country is required' },
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
    const visaProcessingCollection = db.collection('visa_processing');

    // Generate unique application ID if not provided
    const servicesWithIds = await visaProcessingCollection
      .find({ applicationId: { $regex: /^VP\d+$/i } })
      .toArray();
    
    let maxNumber = 0;
    if (servicesWithIds.length > 0) {
      servicesWithIds.forEach(service => {
        if (service.applicationId) {
          const idNumber = parseInt(service.applicationId.toUpperCase().replace(/^VP-?/, '')) || 0;
          if (idNumber > maxNumber) {
            maxNumber = idNumber;
          }
        }
      });
    }
    
    const applicationId = `VP${String(maxNumber + 1).padStart(6, '0')}`;

    // Calculate amounts
    const vendorBill = parseFloat(body.vendorBill) || 0;
    const othersBill = parseFloat(body.othersBill) || 0;
    const totalBill = vendorBill + othersBill;
    const paidAmount = parseFloat(body.paidAmount) || 0;
    const dueAmount = totalBill - paidAmount;

    // Create new visa processing service
    const newService = {
      applicationId,
      clientId: body.clientId || '',
      clientName: body.clientName.trim(),
      applicantName: body.applicantName || body.clientName.trim(),
      country: body.country.trim(),
      visaType: body.visaType || 'tourist',
      passportNumber: body.passportNumber ? body.passportNumber.trim() : null,
      phone: body.phone.trim(),
      email: body.email ? body.email.trim() : null,
      address: body.address ? body.address.trim() : null,
      appliedDate: body.appliedDate || body.date || new Date().toISOString().split('T')[0],
      expectedDeliveryDate: body.expectedDeliveryDate || null,
      vendorId: body.vendorId || null,
      vendorName: body.vendorName || null,
      vendorBill: vendorBill,
      othersBill: othersBill,
      totalBill: totalBill,
      totalAmount: totalBill,
      paidAmount: paidAmount,
      dueAmount: dueAmount,
      status: body.status || 'pending',
      notes: body.notes ? body.notes.trim() : null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await visaProcessingCollection.insertOne(newService);

    // Fetch created service
    const createdService = await visaProcessingCollection.findOne({
      _id: result.insertedId
    });

    // Format service for frontend
    const formattedService = {
      id: createdService._id.toString(),
      _id: createdService._id.toString(),
      applicationId: createdService.applicationId,
      ...newService,
      createdAt: createdService.createdAt.toISOString(),
      updatedAt: createdService.updatedAt.toISOString(),
    };

    return NextResponse.json({
      success: true,
      message: 'Visa processing service created successfully',
      service: formattedService,
      data: formattedService,
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating visa processing service:', error);
    return NextResponse.json(
      { error: 'Failed to create visa processing service', message: error.message },
      { status: 500 }
    );
  }
}

import { NextResponse } from 'next/server';
import { getDb } from '../../../lib/mongodb';

// GET all manpower services with search and filters
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || searchParams.get('q');
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const db = await getDb();
    const manpowerServicesCollection = db.collection('manpower_services');

    // Build query
    const query = {};
    
    if (status && status !== 'all') {
      query.status = status;
    }
    
    if (search) {
      query.$or = [
        { clientName: { $regex: search, $options: 'i' } },
        { companyName: { $regex: search, $options: 'i' } },
        { clientId: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { position: { $regex: search, $options: 'i' } },
        { jobTitle: { $regex: search, $options: 'i' } },
        { serviceId: { $regex: search, $options: 'i' } },
      ];
    }

    // Get total count for pagination
    const total = await manpowerServicesCollection.countDocuments(query);

    // Calculate skip for pagination
    const skip = (page - 1) * limit;

    const services = await manpowerServicesCollection
      .find(query)
      .sort({ appliedDate: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    // Format services for frontend
    const formattedServices = services.map((service) => ({
      id: service._id.toString(),
      _id: service._id.toString(),
      serviceId: service.serviceId || service._id.toString(),
      clientId: service.clientId || '',
      clientName: service.clientName || service.companyName || '',
      companyName: service.companyName || service.clientName || '',
      serviceType: service.serviceType || 'recruitment',
      phone: service.phone || '',
      email: service.email || '',
      address: service.address || '',
      appliedDate: service.appliedDate || service.date || '',
      expectedDeliveryDate: service.expectedDeliveryDate || '',
      vendorId: service.vendorId || '',
      vendorName: service.vendorName || '',
      vendorBill: service.vendorBill || 0,
      othersBill: service.othersBill || 0,
      serviceCharge: service.serviceCharge || 0,
      totalBill: service.totalBill || service.totalAmount || 0,
      totalAmount: service.totalAmount || service.totalBill || 0,
      paidAmount: service.paidAmount || 0,
      dueAmount: service.dueAmount || (service.totalAmount || service.totalBill || 0) - (service.paidAmount || 0),
      status: service.status || 'active',
      notes: service.notes || '',
      position: service.position || service.jobTitle || '',
      jobTitle: service.jobTitle || service.position || '',
      requiredCount: service.requiredCount || null,
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
    console.error('Error fetching manpower services:', error);
    return NextResponse.json(
      { error: 'Failed to fetch manpower services', message: error.message },
      { status: 500 }
    );
  }
}

// POST create new manpower service
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
    const manpowerServicesCollection = db.collection('manpower_services');

    // Generate unique service ID if not provided
    const servicesWithIds = await manpowerServicesCollection
      .find({ serviceId: { $regex: /^MP\d+$/i } })
      .toArray();
    
    let maxNumber = 0;
    if (servicesWithIds.length > 0) {
      servicesWithIds.forEach(service => {
        if (service.serviceId) {
          const idNumber = parseInt(service.serviceId.toUpperCase().replace(/^MP-?/, '')) || 0;
          if (idNumber > maxNumber) {
            maxNumber = idNumber;
          }
        }
      });
    }
    
    const serviceId = `MP${String(maxNumber + 1).padStart(6, '0')}`;

    // Calculate amounts
    const vendorBill = parseFloat(body.vendorBill) || 0;
    const othersBill = parseFloat(body.othersBill) || 0;
    const serviceCharge = parseFloat(body.serviceCharge) || 0;
    const totalBill = vendorBill + othersBill + serviceCharge;
    const paidAmount = parseFloat(body.paidAmount) || 0;
    const dueAmount = totalBill - paidAmount;

    // Create new manpower service
    const newService = {
      serviceId,
      clientId: body.clientId || '',
      clientName: body.clientName.trim(),
      companyName: body.companyName || body.clientName.trim(),
      serviceType: body.serviceType || 'recruitment',
      phone: body.phone.trim(),
      email: body.email ? body.email.trim() : null,
      address: body.address ? body.address.trim() : null,
      appliedDate: body.appliedDate || body.date || new Date().toISOString().split('T')[0],
      expectedDeliveryDate: body.expectedDeliveryDate || null,
      vendorId: body.vendorId || null,
      vendorName: body.vendorName || null,
      vendorBill: vendorBill,
      othersBill: othersBill,
      serviceCharge: serviceCharge,
      totalBill: totalBill,
      totalAmount: totalBill,
      paidAmount: paidAmount,
      dueAmount: dueAmount,
      status: body.status || 'active',
      notes: body.notes ? body.notes.trim() : null,
      position: body.position || body.jobTitle || null,
      jobTitle: body.jobTitle || body.position || null,
      requiredCount: body.requiredCount ? parseInt(body.requiredCount) : null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await manpowerServicesCollection.insertOne(newService);

    // Fetch created service
    const createdService = await manpowerServicesCollection.findOne({
      _id: result.insertedId
    });

    // Format service for frontend
    const formattedService = {
      id: createdService._id.toString(),
      _id: createdService._id.toString(),
      serviceId: createdService.serviceId,
      ...newService,
      createdAt: createdService.createdAt.toISOString(),
      updatedAt: createdService.updatedAt.toISOString(),
    };

    return NextResponse.json({
      success: true,
      message: 'Manpower service created successfully',
      service: formattedService,
      data: formattedService,
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating manpower service:', error);
    return NextResponse.json(
      { error: 'Failed to create manpower service', message: error.message },
      { status: 500 }
    );
  }
}

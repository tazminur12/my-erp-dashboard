import { NextResponse } from 'next/server';
import { getDb } from '../../../lib/mongodb';

// GET all other services with search and filters
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || searchParams.get('q');
    const status = searchParams.get('status');
    const serviceType = searchParams.get('serviceType');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const db = await getDb();
    const otherServicesCollection = db.collection('other_services');

    // Build query
    const query = {};
    
    if (status && status !== 'all') {
      query.status = status;
    }
    
    if (serviceType && serviceType !== 'all') {
      query.serviceType = serviceType;
    }
    
    if (search) {
      query.$or = [
        { clientName: { $regex: search, $options: 'i' } },
        { clientId: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { serviceId: { $regex: search, $options: 'i' } },
      ];
    }

    // Get total count for pagination
    const total = await otherServicesCollection.countDocuments(query);

    // Calculate skip for pagination
    const skip = (page - 1) * limit;

    const services = await otherServicesCollection
      .find(query)
      .sort({ serviceDate: -1, date: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    // Format services for frontend
    const formattedServices = services.map((service) => ({
      id: service._id.toString(),
      _id: service._id.toString(),
      serviceId: service.serviceId || service._id.toString(),
      clientId: service.clientId || '',
      clientName: service.clientName || '',
      serviceType: service.serviceType || 'general',
      description: service.description || '',
      phone: service.phone || '',
      email: service.email || '',
      address: service.address || '',
      date: service.serviceDate || service.date || '',
      serviceDate: service.serviceDate || service.date || '',
      expectedDeliveryDate: service.deliveryDate || service.expectedDeliveryDate || '',
      deliveryDate: service.deliveryDate || service.expectedDeliveryDate || '',
      vendorId: service.vendorId || '',
      vendorName: service.vendorName || '',
      vendorCost: service.vendorCost || service.vendorBill || 0,
      vendorBill: service.vendorBill || service.vendorCost || 0,
      otherCost: service.otherCost || service.othersBill || 0,
      othersBill: service.othersBill || service.otherCost || 0,
      serviceFee: service.serviceFee || service.serviceCharge || 0,
      serviceCharge: service.serviceCharge || service.serviceFee || 0,
      totalAmount: service.totalAmount || service.totalBill || 0,
      totalBill: service.totalBill || service.totalAmount || 0,
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
        currentPage: page,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        pages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: limit,
      },
    }, { status: 200 });
  } catch (error) {
    console.error('Error fetching other services:', error);
    return NextResponse.json(
      { error: 'Failed to fetch other services', message: error.message },
      { status: 500 }
    );
  }
}

// POST create new other service
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

    if (!body.serviceDate && !body.date) {
      return NextResponse.json(
        { error: 'Service date is required' },
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
    const otherServicesCollection = db.collection('other_services');

    // Generate unique service ID if not provided
    const servicesWithIds = await otherServicesCollection
      .find({ serviceId: { $regex: /^OS\d+$/i } })
      .toArray();
    
    let maxNumber = 0;
    if (servicesWithIds.length > 0) {
      servicesWithIds.forEach(service => {
        if (service.serviceId) {
          const idNumber = parseInt(service.serviceId.toUpperCase().replace(/^OS-?/, '')) || 0;
          if (idNumber > maxNumber) {
            maxNumber = idNumber;
          }
        }
      });
    }
    
    const serviceId = `OS${String(maxNumber + 1).padStart(6, '0')}`;

    // Calculate amounts
    const vendorCost = parseFloat(body.vendorCost || body.vendorBill) || 0;
    const otherCost = parseFloat(body.otherCost || body.othersBill) || 0;
    const serviceFee = parseFloat(body.serviceFee || body.serviceCharge) || 0;
    const totalAmount = vendorCost + otherCost + serviceFee;

    // Create new other service
    const newService = {
      serviceId,
      clientId: body.clientId || '',
      clientName: body.clientName.trim(),
      serviceType: body.serviceType || 'general',
      description: body.description ? body.description.trim() : null,
      phone: body.phone.trim(),
      email: body.email ? body.email.trim() : null,
      address: body.address ? body.address.trim() : null,
      serviceDate: body.serviceDate || body.date || new Date().toISOString().split('T')[0],
      date: body.serviceDate || body.date || new Date().toISOString().split('T')[0],
      deliveryDate: body.deliveryDate || body.expectedDeliveryDate || null,
      expectedDeliveryDate: body.deliveryDate || body.expectedDeliveryDate || null,
      vendorId: body.vendorId || null,
      vendorName: body.vendorName || null,
      vendorCost: vendorCost,
      vendorBill: vendorCost,
      otherCost: otherCost,
      othersBill: otherCost,
      serviceFee: serviceFee,
      serviceCharge: serviceFee,
      totalAmount: totalAmount,
      totalBill: totalAmount,
      status: body.status || 'pending',
      notes: body.notes ? body.notes.trim() : null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await otherServicesCollection.insertOne(newService);

    // Fetch created service
    const createdService = await otherServicesCollection.findOne({
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
      message: 'Other service created successfully',
      service: formattedService,
      data: formattedService,
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating other service:', error);
    return NextResponse.json(
      { error: 'Failed to create other service', message: error.message },
      { status: 500 }
    );
  }
}

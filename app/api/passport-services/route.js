import { NextResponse } from 'next/server';
import { getDb } from '../../../lib/mongodb';

// GET all passport services with search and filters
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || searchParams.get('q');
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const db = await getDb();
    const passportServicesCollection = db.collection('passport_services');

    // Build query
    const query = {};
    
    if (status && status !== 'all') {
      query.status = status;
    }
    
    if (search) {
      query.$or = [
        { clientName: { $regex: search, $options: 'i' } },
        { clientId: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { applicationNumber: { $regex: search, $options: 'i' } },
        { serviceId: { $regex: search, $options: 'i' } },
      ];
    }

    // Get total count for pagination
    const total = await passportServicesCollection.countDocuments(query);

    // Calculate skip for pagination
    const skip = (page - 1) * limit;

    const services = await passportServicesCollection
      .find(query)
      .sort({ date: -1, createdAt: -1 })
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
      serviceType: service.serviceType || 'new_passport',
      phone: service.phone || '',
      email: service.email || '',
      address: service.address || '',
      date: service.date || '',
      status: service.status || 'pending',
      notes: service.notes || '',
      expectedDeliveryDate: service.expectedDeliveryDate || '',
      applicationNumber: service.applicationNumber || '',
      dateOfBirth: service.dateOfBirth || '',
      validity: service.validity || '',
      pages: service.pages || '',
      deliveryType: service.deliveryType || '',
      officeContactPersonId: service.officeContactPersonId || '',
      officeContactPersonName: service.officeContactPersonName || '',
      passportFees: service.passportFees || 0,
      bankCharges: service.bankCharges || 0,
      vendorFees: service.vendorFees || 0,
      formFillupCharge: service.formFillupCharge || 0,
      totalBill: service.totalBill || service.totalAmount || 0,
      totalAmount: service.totalAmount || service.totalBill || 0,
      paidAmount: service.paidAmount || 0,
      dueAmount: service.dueAmount || (service.totalAmount || service.totalBill || 0) - (service.paidAmount || 0),
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
    console.error('Error fetching passport services:', error);
    return NextResponse.json(
      { error: 'Failed to fetch passport services', message: error.message },
      { status: 500 }
    );
  }
}

// POST create new passport service
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

    if (!body.date || !body.date.trim()) {
      return NextResponse.json(
        { error: 'Date is required' },
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
    const passportServicesCollection = db.collection('passport_services');

    // Generate unique service ID if not provided
    const servicesWithIds = await passportServicesCollection
      .find({ serviceId: { $regex: /^PS\d+$/i } })
      .toArray();
    
    let maxNumber = 0;
    if (servicesWithIds.length > 0) {
      servicesWithIds.forEach(service => {
        if (service.serviceId) {
          const idNumber = parseInt(service.serviceId.toUpperCase().replace(/^PS-?/, '')) || 0;
          if (idNumber > maxNumber) {
            maxNumber = idNumber;
          }
        }
      });
    }
    
    const serviceId = `PS${String(maxNumber + 1).padStart(6, '0')}`;

    // Calculate amounts
    const passportFees = parseFloat(body.passportFees) || 0;
    const bankCharges = parseFloat(body.bankCharges) || 0;
    const vendorFees = parseFloat(body.vendorFees) || 0;
    const formFillupCharge = parseFloat(body.formFillupCharge) || 0;
    const totalBill = passportFees + bankCharges + vendorFees + formFillupCharge;
    const paidAmount = parseFloat(body.paidAmount) || 0;
    const dueAmount = totalBill - paidAmount;

    // Create new passport service
    const newService = {
      serviceId,
      clientId: body.clientId || '',
      clientName: body.clientName.trim(),
      serviceType: body.serviceType || 'new_passport',
      phone: body.phone.trim(),
      email: body.email ? body.email.trim() : null,
      address: body.address ? body.address.trim() : null,
      date: body.date.trim(),
      status: body.status || 'pending',
      notes: body.notes ? body.notes.trim() : null,
      expectedDeliveryDate: body.expectedDeliveryDate || null,
      applicationNumber: body.applicationNumber || null,
      dateOfBirth: body.dateOfBirth || null,
      validity: body.validity || null,
      pages: body.pages || null,
      deliveryType: body.deliveryType || null,
      officeContactPersonId: body.officeContactPersonId || null,
      officeContactPersonName: body.officeContactPersonName || null,
      passportFees: passportFees,
      bankCharges: bankCharges,
      vendorFees: vendorFees,
      formFillupCharge: formFillupCharge,
      totalBill: totalBill,
      totalAmount: totalBill,
      paidAmount: paidAmount,
      dueAmount: dueAmount,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await passportServicesCollection.insertOne(newService);

    // Fetch created service
    const createdService = await passportServicesCollection.findOne({
      _id: result.insertedId
    });

    // Format service for frontend
    const formattedService = {
      id: createdService._id.toString(),
      _id: createdService._id.toString(),
      ...newService,
      createdAt: createdService.createdAt.toISOString(),
      updatedAt: createdService.updatedAt.toISOString(),
    };

    return NextResponse.json({
      success: true,
      message: 'Passport service created successfully',
      service: formattedService,
      data: formattedService,
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating passport service:', error);
    return NextResponse.json(
      { error: 'Failed to create passport service', message: error.message },
      { status: 500 }
    );
  }
}

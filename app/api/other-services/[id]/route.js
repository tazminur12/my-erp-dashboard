import { NextResponse } from 'next/server';
import { getDb } from '../../../../lib/mongodb';
import { ObjectId } from 'mongodb';

// GET single other service
export async function GET(request, { params }) {
  try {
    const resolvedParams = await params;
    const { id } = resolvedParams;

    if (!id) {
      return NextResponse.json(
        { error: 'Service ID is required' },
        { status: 400 }
      );
    }

    const db = await getDb();
    const otherServicesCollection = db.collection('other_services');

    let service;
    try {
      service = await otherServicesCollection.findOne({ _id: new ObjectId(id) });
    } catch (err) {
      // Try finding by serviceId if ObjectId fails
      service = await otherServicesCollection.findOne({ serviceId: id });
    }

    if (!service) {
      return NextResponse.json(
        { error: 'Service not found' },
        { status: 404 }
      );
    }

    // Format service for frontend
    const formattedService = {
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
    };

    return NextResponse.json({
      service: formattedService,
      data: formattedService,
    }, { status: 200 });
  } catch (error) {
    console.error('Error fetching other service:', error);
    return NextResponse.json(
      { error: 'Failed to fetch other service', message: error.message },
      { status: 500 }
    );
  }
}

// PUT update other service
export async function PUT(request, { params }) {
  try {
    const resolvedParams = await params;
    const { id } = resolvedParams;
    const body = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: 'Service ID is required' },
        { status: 400 }
      );
    }

    const db = await getDb();
    const otherServicesCollection = db.collection('other_services');

    // Find service
    let service;
    try {
      service = await otherServicesCollection.findOne({ _id: new ObjectId(id) });
    } catch (err) {
      service = await otherServicesCollection.findOne({ serviceId: id });
    }

    if (!service) {
      return NextResponse.json(
        { error: 'Service not found' },
        { status: 404 }
      );
    }

    // Calculate amounts
    const vendorCost = parseFloat(body.vendorCost || body.vendorBill) || 0;
    const otherCost = parseFloat(body.otherCost || body.othersBill) || 0;
    const serviceFee = parseFloat(body.serviceFee || body.serviceCharge) || 0;
    const totalAmount = vendorCost + otherCost + serviceFee;

    // Update service
    const updateData = {
      clientId: body.clientId !== undefined ? body.clientId : service.clientId,
      clientName: body.clientName ? body.clientName.trim() : service.clientName,
      serviceType: body.serviceType || service.serviceType || 'general',
      description: body.description !== undefined ? (body.description ? body.description.trim() : null) : service.description,
      phone: body.phone ? body.phone.trim() : service.phone,
      email: body.email !== undefined ? (body.email ? body.email.trim() : null) : service.email,
      address: body.address !== undefined ? (body.address ? body.address.trim() : null) : service.address,
      serviceDate: body.serviceDate || body.date || service.serviceDate || service.date,
      date: body.serviceDate || body.date || service.serviceDate || service.date,
      deliveryDate: body.deliveryDate || body.expectedDeliveryDate || service.deliveryDate || service.expectedDeliveryDate || null,
      expectedDeliveryDate: body.deliveryDate || body.expectedDeliveryDate || service.deliveryDate || service.expectedDeliveryDate || null,
      vendorId: body.vendorId !== undefined ? body.vendorId : service.vendorId,
      vendorName: body.vendorName !== undefined ? body.vendorName : service.vendorName,
      vendorCost: vendorCost,
      vendorBill: vendorCost,
      otherCost: otherCost,
      othersBill: otherCost,
      serviceFee: serviceFee,
      serviceCharge: serviceFee,
      totalAmount: totalAmount,
      totalBill: totalAmount,
      status: body.status || service.status || 'pending',
      notes: body.notes !== undefined ? (body.notes ? body.notes.trim() : null) : service.notes,
      updatedAt: new Date(),
    };

    const query = service._id instanceof ObjectId 
      ? { _id: service._id }
      : { serviceId: service.serviceId };

    await otherServicesCollection.updateOne(query, { $set: updateData });

    // Fetch updated service
    const updatedService = await otherServicesCollection.findOne(query);

    // Format service for frontend
    const formattedService = {
      id: updatedService._id.toString(),
      _id: updatedService._id.toString(),
      serviceId: updatedService.serviceId || updatedService._id.toString(),
      ...updateData,
      createdAt: updatedService.createdAt ? updatedService.createdAt.toISOString() : updatedService._id.getTimestamp().toISOString(),
      updatedAt: updatedService.updatedAt.toISOString(),
    };

    return NextResponse.json({
      success: true,
      message: 'Other service updated successfully',
      service: formattedService,
      data: formattedService,
    }, { status: 200 });
  } catch (error) {
    console.error('Error updating other service:', error);
    return NextResponse.json(
      { error: 'Failed to update other service', message: error.message },
      { status: 500 }
    );
  }
}

// DELETE other service
export async function DELETE(request, { params }) {
  try {
    const resolvedParams = await params;
    const { id } = resolvedParams;

    if (!id) {
      return NextResponse.json(
        { error: 'Service ID is required' },
        { status: 400 }
      );
    }

    const db = await getDb();
    const otherServicesCollection = db.collection('other_services');

    // Find and delete service
    let result;
    try {
      result = await otherServicesCollection.deleteOne({ _id: new ObjectId(id) });
    } catch (err) {
      result = await otherServicesCollection.deleteOne({ serviceId: id });
    }

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: 'Service not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Other service deleted successfully',
    }, { status: 200 });
  } catch (error) {
    console.error('Error deleting other service:', error);
    return NextResponse.json(
      { error: 'Failed to delete other service', message: error.message },
      { status: 500 }
    );
  }
}

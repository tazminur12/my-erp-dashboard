import { NextResponse } from 'next/server';
import { getDb } from '../../../../lib/mongodb';
import { ObjectId } from 'mongodb';

// GET single visa processing service
export async function GET(request, { params }) {
  try {
    const resolvedParams = params instanceof Promise ? await params : params;
    const { id } = resolvedParams;

    if (!id) {
      return NextResponse.json(
        { error: 'Service ID is required' },
        { status: 400 }
      );
    }

    const db = await getDb();
    const visaProcessingCollection = db.collection('visa_processing');

    let service = null;
    
    // Try to find by ObjectId first
    if (ObjectId.isValid(id)) {
      service = await visaProcessingCollection.findOne({ _id: new ObjectId(id) });
    }
    
    // If not found, try by applicationId
    if (!service) {
      service = await visaProcessingCollection.findOne({ applicationId: id });
    }

    if (!service) {
      return NextResponse.json(
        { error: 'Visa processing service not found' },
        { status: 404 }
      );
    }

    const formattedService = {
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
    };

    return NextResponse.json({
      service: formattedService,
      data: formattedService,
    }, { status: 200 });
  } catch (error) {
    console.error('Error fetching visa processing service:', error);
    return NextResponse.json(
      { error: 'Failed to fetch visa processing service', message: error.message },
      { status: 500 }
    );
  }
}

// PUT/PATCH update visa processing service
export async function PUT(request, { params }) {
  try {
    const resolvedParams = params instanceof Promise ? await params : params;
    const { id } = resolvedParams;
    const body = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: 'Service ID is required' },
        { status: 400 }
      );
    }

    const db = await getDb();
    const visaProcessingCollection = db.collection('visa_processing');

    // Find service
    let service = null;
    if (ObjectId.isValid(id)) {
      service = await visaProcessingCollection.findOne({ _id: new ObjectId(id) });
    }
    if (!service) {
      service = await visaProcessingCollection.findOne({ applicationId: id });
    }

    if (!service) {
      return NextResponse.json(
        { error: 'Visa processing service not found' },
        { status: 404 }
      );
    }

    // Build update data
    const updateData = {
      updatedAt: new Date(),
    };

    if (body.clientName !== undefined) updateData.clientName = body.clientName.trim();
    if (body.applicantName !== undefined) updateData.applicantName = body.applicantName.trim();
    if (body.clientId !== undefined) updateData.clientId = body.clientId;
    if (body.country !== undefined) updateData.country = body.country.trim();
    if (body.visaType !== undefined) updateData.visaType = body.visaType;
    if (body.passportNumber !== undefined) updateData.passportNumber = body.passportNumber ? body.passportNumber.trim() : null;
    if (body.phone !== undefined) updateData.phone = body.phone.trim();
    if (body.email !== undefined) updateData.email = body.email ? body.email.trim() : null;
    if (body.address !== undefined) updateData.address = body.address ? body.address.trim() : null;
    if (body.appliedDate !== undefined || body.date !== undefined) {
      updateData.appliedDate = body.appliedDate || body.date || new Date().toISOString().split('T')[0];
    }
    if (body.expectedDeliveryDate !== undefined) updateData.expectedDeliveryDate = body.expectedDeliveryDate || null;
    if (body.vendorId !== undefined) updateData.vendorId = body.vendorId || null;
    if (body.vendorName !== undefined) updateData.vendorName = body.vendorName || null;
    if (body.status !== undefined) updateData.status = body.status;
    if (body.notes !== undefined) updateData.notes = body.notes ? body.notes.trim() : null;

    // Recalculate amounts if any financial field changed
    if (body.vendorBill !== undefined || body.othersBill !== undefined) {
      const vendorBill = body.vendorBill !== undefined ? parseFloat(body.vendorBill) : (service.vendorBill || 0);
      const othersBill = body.othersBill !== undefined ? parseFloat(body.othersBill) : (service.othersBill || 0);
      const totalBill = vendorBill + othersBill;
      
      updateData.vendorBill = vendorBill;
      updateData.othersBill = othersBill;
      updateData.totalBill = totalBill;
      updateData.totalAmount = totalBill;
      
      const paidAmount = body.paidAmount !== undefined ? parseFloat(body.paidAmount) : (service.paidAmount || 0);
      updateData.paidAmount = paidAmount;
      updateData.dueAmount = totalBill - paidAmount;
    } else if (body.paidAmount !== undefined) {
      const totalBill = service.totalBill || service.totalAmount || 0;
      const paidAmount = parseFloat(body.paidAmount) || 0;
      updateData.paidAmount = paidAmount;
      updateData.dueAmount = totalBill - paidAmount;
    }

    const query = ObjectId.isValid(id) ? { _id: new ObjectId(id) } : { applicationId: id };
    await visaProcessingCollection.updateOne(query, { $set: updateData });

    // Fetch updated service
    const updatedService = await visaProcessingCollection.findOne(query);

    const formattedService = {
      id: updatedService._id.toString(),
      _id: updatedService._id.toString(),
      applicationId: updatedService.applicationId || updatedService._id.toString(),
      clientId: updatedService.clientId || '',
      clientName: updatedService.clientName || '',
      applicantName: updatedService.applicantName || updatedService.clientName || '',
      country: updatedService.country || '',
      visaType: updatedService.visaType || 'tourist',
      passportNumber: updatedService.passportNumber || '',
      phone: updatedService.phone || '',
      email: updatedService.email || '',
      address: updatedService.address || '',
      appliedDate: updatedService.appliedDate || updatedService.date || '',
      expectedDeliveryDate: updatedService.expectedDeliveryDate || '',
      vendorId: updatedService.vendorId || '',
      vendorName: updatedService.vendorName || '',
      vendorBill: updatedService.vendorBill || 0,
      othersBill: updatedService.othersBill || 0,
      totalBill: updatedService.totalBill || updatedService.totalAmount || 0,
      totalAmount: updatedService.totalAmount || updatedService.totalBill || 0,
      paidAmount: updatedService.paidAmount || 0,
      dueAmount: updatedService.dueAmount || (updatedService.totalAmount || updatedService.totalBill || 0) - (updatedService.paidAmount || 0),
      status: updatedService.status || 'pending',
      notes: updatedService.notes || '',
      createdAt: updatedService.createdAt ? updatedService.createdAt.toISOString() : updatedService._id.getTimestamp().toISOString(),
      updatedAt: updatedService.updatedAt ? updatedService.updatedAt.toISOString() : updatedService._id.getTimestamp().toISOString(),
    };

    return NextResponse.json({
      success: true,
      message: 'Visa processing service updated successfully',
      service: formattedService,
      data: formattedService,
    }, { status: 200 });
  } catch (error) {
    console.error('Error updating visa processing service:', error);
    return NextResponse.json(
      { error: 'Failed to update visa processing service', message: error.message },
      { status: 500 }
    );
  }
}

// DELETE visa processing service
export async function DELETE(request, { params }) {
  try {
    const resolvedParams = params instanceof Promise ? await params : params;
    const { id } = resolvedParams;

    if (!id) {
      return NextResponse.json(
        { error: 'Service ID is required' },
        { status: 400 }
      );
    }

    const db = await getDb();
    const visaProcessingCollection = db.collection('visa_processing');

    // Find and delete service
    let service = null;
    let deleteResult = null;
    
    if (ObjectId.isValid(id)) {
      service = await visaProcessingCollection.findOne({ _id: new ObjectId(id) });
      if (service) {
        deleteResult = await visaProcessingCollection.deleteOne({ _id: new ObjectId(id) });
      }
    }
    
    if (!service) {
      service = await visaProcessingCollection.findOne({ applicationId: id });
      if (service) {
        deleteResult = await visaProcessingCollection.deleteOne({ applicationId: id });
      }
    }

    if (!service) {
      return NextResponse.json(
        { error: 'Visa processing service not found' },
        { status: 404 }
      );
    }

    if (deleteResult.deletedCount === 0) {
      return NextResponse.json(
        { error: 'Failed to delete visa processing service' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Visa processing service deleted successfully',
    }, { status: 200 });
  } catch (error) {
    console.error('Error deleting visa processing service:', error);
    return NextResponse.json(
      { error: 'Failed to delete visa processing service', message: error.message },
      { status: 500 }
    );
  }
}

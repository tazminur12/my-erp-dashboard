import { NextResponse } from 'next/server';
import { getDb } from '../../../../lib/mongodb';
import { ObjectId } from 'mongodb';

// GET single passport service
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
    const passportServicesCollection = db.collection('passport_services');

    let service = null;
    
    // Try to find by ObjectId first
    if (ObjectId.isValid(id)) {
      service = await passportServicesCollection.findOne({ _id: new ObjectId(id) });
    }
    
    // If not found, try by serviceId
    if (!service) {
      service = await passportServicesCollection.findOne({ serviceId: id });
    }

    if (!service) {
      return NextResponse.json(
        { error: 'Passport service not found' },
        { status: 404 }
      );
    }

    const formattedService = {
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
    };

    return NextResponse.json({
      service: formattedService,
      data: formattedService,
    }, { status: 200 });
  } catch (error) {
    console.error('Error fetching passport service:', error);
    return NextResponse.json(
      { error: 'Failed to fetch passport service', message: error.message },
      { status: 500 }
    );
  }
}

// PUT/PATCH update passport service
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
    const passportServicesCollection = db.collection('passport_services');

    // Find service
    let service = null;
    if (ObjectId.isValid(id)) {
      service = await passportServicesCollection.findOne({ _id: new ObjectId(id) });
    }
    if (!service) {
      service = await passportServicesCollection.findOne({ serviceId: id });
    }

    if (!service) {
      return NextResponse.json(
        { error: 'Passport service not found' },
        { status: 404 }
      );
    }

    // Build update data
    const updateData = {
      updatedAt: new Date(),
    };

    if (body.clientName !== undefined) updateData.clientName = body.clientName.trim();
    if (body.clientId !== undefined) updateData.clientId = body.clientId;
    if (body.serviceType !== undefined) updateData.serviceType = body.serviceType;
    if (body.phone !== undefined) updateData.phone = body.phone.trim();
    if (body.email !== undefined) updateData.email = body.email ? body.email.trim() : null;
    if (body.address !== undefined) updateData.address = body.address ? body.address.trim() : null;
    if (body.date !== undefined) updateData.date = body.date.trim();
    if (body.status !== undefined) updateData.status = body.status;
    if (body.notes !== undefined) updateData.notes = body.notes ? body.notes.trim() : null;
    if (body.expectedDeliveryDate !== undefined) updateData.expectedDeliveryDate = body.expectedDeliveryDate || null;
    if (body.applicationNumber !== undefined) updateData.applicationNumber = body.applicationNumber || null;
    if (body.dateOfBirth !== undefined) updateData.dateOfBirth = body.dateOfBirth || null;
    if (body.validity !== undefined) updateData.validity = body.validity || null;
    if (body.pages !== undefined) updateData.pages = body.pages || null;
    if (body.deliveryType !== undefined) updateData.deliveryType = body.deliveryType || null;
    if (body.officeContactPersonId !== undefined) updateData.officeContactPersonId = body.officeContactPersonId || null;
    if (body.officeContactPersonName !== undefined) updateData.officeContactPersonName = body.officeContactPersonName || null;

    // Recalculate amounts if any financial field changed
    if (body.passportFees !== undefined || body.bankCharges !== undefined || 
        body.vendorFees !== undefined || body.formFillupCharge !== undefined) {
      const passportFees = body.passportFees !== undefined ? parseFloat(body.passportFees) : (service.passportFees || 0);
      const bankCharges = body.bankCharges !== undefined ? parseFloat(body.bankCharges) : (service.bankCharges || 0);
      const vendorFees = body.vendorFees !== undefined ? parseFloat(body.vendorFees) : (service.vendorFees || 0);
      const formFillupCharge = body.formFillupCharge !== undefined ? parseFloat(body.formFillupCharge) : (service.formFillupCharge || 0);
      const totalBill = passportFees + bankCharges + vendorFees + formFillupCharge;
      
      updateData.passportFees = passportFees;
      updateData.bankCharges = bankCharges;
      updateData.vendorFees = vendorFees;
      updateData.formFillupCharge = formFillupCharge;
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

    const query = ObjectId.isValid(id) ? { _id: new ObjectId(id) } : { serviceId: id };
    await passportServicesCollection.updateOne(query, { $set: updateData });

    // Fetch updated service
    const updatedService = await passportServicesCollection.findOne(query);

    const formattedService = {
      id: updatedService._id.toString(),
      _id: updatedService._id.toString(),
      serviceId: updatedService.serviceId || updatedService._id.toString(),
      clientId: updatedService.clientId || '',
      clientName: updatedService.clientName || '',
      serviceType: updatedService.serviceType || 'new_passport',
      phone: updatedService.phone || '',
      email: updatedService.email || '',
      address: updatedService.address || '',
      date: updatedService.date || '',
      status: updatedService.status || 'pending',
      notes: updatedService.notes || '',
      expectedDeliveryDate: updatedService.expectedDeliveryDate || '',
      applicationNumber: updatedService.applicationNumber || '',
      dateOfBirth: updatedService.dateOfBirth || '',
      validity: updatedService.validity || '',
      pages: updatedService.pages || '',
      deliveryType: updatedService.deliveryType || '',
      officeContactPersonId: updatedService.officeContactPersonId || '',
      officeContactPersonName: updatedService.officeContactPersonName || '',
      passportFees: updatedService.passportFees || 0,
      bankCharges: updatedService.bankCharges || 0,
      vendorFees: updatedService.vendorFees || 0,
      formFillupCharge: updatedService.formFillupCharge || 0,
      totalBill: updatedService.totalBill || updatedService.totalAmount || 0,
      totalAmount: updatedService.totalAmount || updatedService.totalBill || 0,
      paidAmount: updatedService.paidAmount || 0,
      dueAmount: updatedService.dueAmount || (updatedService.totalAmount || updatedService.totalBill || 0) - (updatedService.paidAmount || 0),
      createdAt: updatedService.createdAt ? updatedService.createdAt.toISOString() : updatedService._id.getTimestamp().toISOString(),
      updatedAt: updatedService.updatedAt ? updatedService.updatedAt.toISOString() : updatedService._id.getTimestamp().toISOString(),
    };

    return NextResponse.json({
      success: true,
      message: 'Passport service updated successfully',
      service: formattedService,
      data: formattedService,
    }, { status: 200 });
  } catch (error) {
    console.error('Error updating passport service:', error);
    return NextResponse.json(
      { error: 'Failed to update passport service', message: error.message },
      { status: 500 }
    );
  }
}

// DELETE passport service
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
    const passportServicesCollection = db.collection('passport_services');

    // Find and delete service
    let service = null;
    let deleteResult = null;
    
    if (ObjectId.isValid(id)) {
      service = await passportServicesCollection.findOne({ _id: new ObjectId(id) });
      if (service) {
        deleteResult = await passportServicesCollection.deleteOne({ _id: new ObjectId(id) });
      }
    }
    
    if (!service) {
      service = await passportServicesCollection.findOne({ serviceId: id });
      if (service) {
        deleteResult = await passportServicesCollection.deleteOne({ serviceId: id });
      }
    }

    if (!service) {
      return NextResponse.json(
        { error: 'Passport service not found' },
        { status: 404 }
      );
    }

    if (deleteResult.deletedCount === 0) {
      return NextResponse.json(
        { error: 'Failed to delete passport service' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Passport service deleted successfully',
    }, { status: 200 });
  } catch (error) {
    console.error('Error deleting passport service:', error);
    return NextResponse.json(
      { error: 'Failed to delete passport service', message: error.message },
      { status: 500 }
    );
  }
}

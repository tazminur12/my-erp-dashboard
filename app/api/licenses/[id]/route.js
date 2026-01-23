import { NextResponse } from 'next/server';
import { getDb } from '../../../../lib/mongodb';
import { ObjectId } from 'mongodb';

// GET single license
export async function GET(request, { params }) {
  try {
    const resolvedParams = params instanceof Promise ? await params : params;
    const { id } = resolvedParams;

    if (!id) {
      return NextResponse.json(
        { error: 'License ID is required' },
        { status: 400 }
      );
    }

    const db = await getDb();
    const licensesCollection = db.collection('licenses');

    let license = null;
    if (ObjectId.isValid(id)) {
      license = await licensesCollection.findOne({ _id: new ObjectId(id) });
    }

    if (!license) {
      return NextResponse.json(
        { error: 'License not found', id: id },
        { status: 404 }
      );
    }

    // Calculate statistics
    const hajisCollection = db.collection('hajis');
    const licenseId = license._id.toString();
    
    const totalHajjPerformers = await hajisCollection.countDocuments({
      $or: [
        { license_id: licenseId },
        { licenseId: licenseId }
      ],
      service_status: 'হজ্ব সম্পন্নকারী'
    });
    
    const preRegistered = await hajisCollection.countDocuments({
      $or: [
        { license_id: licenseId },
        { licenseId: licenseId }
      ],
      service_status: 'প্রাক-নিবন্ধিত'
    });
    
    const registered = await hajisCollection.countDocuments({
      $or: [
        { license_id: licenseId },
        { licenseId: licenseId }
      ],
      service_status: 'নিবন্ধিত'
    });
    
    const archive = await hajisCollection.countDocuments({
      $or: [
        { license_id: licenseId },
        { licenseId: licenseId }
      ],
      service_status: 'আর্কাইভ'
    });
    
    const refunded = await hajisCollection.countDocuments({
      $or: [
        { license_id: licenseId },
        { licenseId: licenseId }
      ],
      service_status: 'রিফান্ডেড'
    });
    
    const received = await hajisCollection.countDocuments({
      $or: [
        { license_id: licenseId },
        { licenseId: licenseId }
      ],
      service_status: 'রিসিভড'
    });
    
    const transferred = await hajisCollection.countDocuments({
      $or: [
        { license_id: licenseId },
        { licenseId: licenseId }
      ],
      service_status: 'ট্রান্সফার্ড'
    });

    const formattedLicense = {
      id: license._id.toString(),
      _id: license._id.toString(),
      logo: license.logo || '',
      licenseNumber: license.licenseNumber || '',
      licenseName: license.licenseName || '',
      ownerName: license.ownerName || '',
      mobileNumber: license.mobileNumber || '',
      email: license.email || '',
      address: license.address || '',
      totalHajjPerformers: totalHajjPerformers,
      hajjPerformersCount: totalHajjPerformers,
      preRegistered: preRegistered,
      preRegisteredCount: preRegistered,
      registered: registered,
      registeredCount: registered,
      archive: archive,
      archiveCount: archive,
      refunded: refunded,
      refundedCount: refunded,
      received: received,
      receivedCount: received,
      transferred: transferred,
      transferredCount: transferred,
      created_at: license.created_at || license._id.getTimestamp().toISOString(),
      updated_at: license.updated_at || license.created_at || license._id.getTimestamp().toISOString(),
    };

    return NextResponse.json({ license: formattedLicense }, { status: 200 });
  } catch (error) {
    console.error('Error fetching license:', error);
    return NextResponse.json(
      { error: 'Failed to fetch license', message: error.message },
      { status: 500 }
    );
  }
}

// PUT update license
export async function PUT(request, { params }) {
  try {
    const resolvedParams = params instanceof Promise ? await params : params;
    const { id } = resolvedParams;
    const body = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: 'License ID is required' },
        { status: 400 }
      );
    }

    if (!body.licenseNumber || !body.licenseName) {
      return NextResponse.json(
        { error: 'License number and license name are required' },
        { status: 400 }
      );
    }

    const db = await getDb();
    const licensesCollection = db.collection('licenses');

    // Check if license exists
    let existingLicense = null;
    if (ObjectId.isValid(id)) {
      existingLicense = await licensesCollection.findOne({ _id: new ObjectId(id) });
    }

    if (!existingLicense) {
      return NextResponse.json(
        { error: 'License not found' },
        { status: 404 }
      );
    }

    // Check if license number is being changed and if it already exists
    if (body.licenseNumber.trim() !== existingLicense.licenseNumber) {
      const duplicateLicense = await licensesCollection.findOne({
        licenseNumber: body.licenseNumber.trim(),
        _id: { $ne: new ObjectId(id) }
      });

      if (duplicateLicense) {
        return NextResponse.json(
          { error: 'License number already exists' },
          { status: 400 }
        );
      }
    }

    // Update license
    const updateData = {
      logo: body.logo || '',
      licenseNumber: body.licenseNumber.trim(),
      licenseName: body.licenseName.trim(),
      ownerName: body.ownerName?.trim() || '',
      mobileNumber: body.mobileNumber?.trim() || '',
      email: body.email?.trim() || '',
      address: body.address?.trim() || '',
      updated_at: new Date().toISOString(),
    };

    await licensesCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    const updatedLicense = await licensesCollection.findOne({ _id: new ObjectId(id) });

    // Calculate statistics
    const hajisCollection = db.collection('hajis');
    const licenseId = updatedLicense._id.toString();
    
    const totalHajjPerformers = await hajisCollection.countDocuments({
      $or: [
        { license_id: licenseId },
        { licenseId: licenseId }
      ],
      service_status: 'হজ্ব সম্পন্নকারী'
    });
    
    const preRegistered = await hajisCollection.countDocuments({
      $or: [
        { license_id: licenseId },
        { licenseId: licenseId }
      ],
      service_status: 'প্রাক-নিবন্ধিত'
    });
    
    const registered = await hajisCollection.countDocuments({
      $or: [
        { license_id: licenseId },
        { licenseId: licenseId }
      ],
      service_status: 'নিবন্ধিত'
    });
    
    const archive = await hajisCollection.countDocuments({
      $or: [
        { license_id: licenseId },
        { licenseId: licenseId }
      ],
      service_status: 'আর্কাইভ'
    });
    
    const refunded = await hajisCollection.countDocuments({
      $or: [
        { license_id: licenseId },
        { licenseId: licenseId }
      ],
      service_status: 'রিফান্ডেড'
    });
    
    const received = await hajisCollection.countDocuments({
      $or: [
        { license_id: licenseId },
        { licenseId: licenseId }
      ],
      service_status: 'রিসিভড'
    });
    
    const transferred = await hajisCollection.countDocuments({
      $or: [
        { license_id: licenseId },
        { licenseId: licenseId }
      ],
      service_status: 'ট্রান্সফার্ড'
    });

    const formattedLicense = {
      id: updatedLicense._id.toString(),
      _id: updatedLicense._id.toString(),
      ...updateData,
      totalHajjPerformers: totalHajjPerformers,
      hajjPerformersCount: totalHajjPerformers,
      preRegistered: preRegistered,
      preRegisteredCount: preRegistered,
      registered: registered,
      registeredCount: registered,
      archive: archive,
      archiveCount: archive,
      refunded: refunded,
      refundedCount: refunded,
      received: received,
      receivedCount: received,
      transferred: transferred,
      transferredCount: transferred,
      created_at: updatedLicense.created_at || updatedLicense._id.getTimestamp().toISOString(),
      updated_at: updateData.updated_at,
    };

    return NextResponse.json(
      { license: formattedLicense, message: 'License updated successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating license:', error);
    return NextResponse.json(
      { error: 'Failed to update license', message: error.message },
      { status: 500 }
    );
  }
}

// DELETE license (soft delete)
export async function DELETE(request, { params }) {
  try {
    const resolvedParams = params instanceof Promise ? await params : params;
    const { id } = resolvedParams;

    if (!id) {
      return NextResponse.json(
        { error: 'License ID is required' },
        { status: 400 }
      );
    }

    const db = await getDb();
    const licensesCollection = db.collection('licenses');

    // Check if license exists
    let license = null;
    if (ObjectId.isValid(id)) {
      license = await licensesCollection.findOne({ _id: new ObjectId(id) });
    }

    if (!license) {
      return NextResponse.json(
        { error: 'License not found' },
        { status: 404 }
      );
    }

    // Check if license has associated hajjis
    const hajisCollection = db.collection('hajis');
    const licenseId = license._id.toString();
    const hajisCount = await hajisCollection.countDocuments({
      $or: [
        { license_id: licenseId },
        { licenseId: licenseId }
      ]
    });

    if (hajisCount > 0) {
      return NextResponse.json(
        { error: `Cannot delete license. It has ${hajisCount} associated hajjis. Please transfer or remove them first.` },
        { status: 400 }
      );
    }

    // Delete license
    await licensesCollection.deleteOne({ _id: new ObjectId(id) });

    return NextResponse.json(
      { message: 'License deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting license:', error);
    return NextResponse.json(
      { error: 'Failed to delete license', message: error.message },
      { status: 500 }
    );
  }
}

import { NextResponse } from 'next/server';
import { getDb } from '../../../lib/mongodb';
import { ObjectId } from 'mongodb';

// GET all licenses
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const limit = parseInt(searchParams.get('limit')) || 1000;
    const page = parseInt(searchParams.get('page')) || 1;
    const skip = (page - 1) * limit;

    const db = await getDb();
    const licensesCollection = db.collection('licenses');

    // Build query
    const query = {};
    if (search) {
      query.$or = [
        { licenseNumber: { $regex: search, $options: 'i' } },
        { licenseName: { $regex: search, $options: 'i' } }
      ];
    }

    // Get total count for pagination
    const total = await licensesCollection.countDocuments(query);

    // Fetch licenses
    const licenses = await licensesCollection
      .find(query)
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    // Calculate statistics for each license
    const hajisCollection = db.collection('hajis');
    
    const formattedLicenses = await Promise.all(licenses.map(async (license) => {
      const licenseId = license._id.toString();
      
      // Count hajjis by status for this license (using snake_case field names)
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

      return {
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
    }));

    return NextResponse.json(
      {
        licenses: formattedLicenses,
        data: formattedLicenses,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching licenses:', error);
    return NextResponse.json(
      { error: 'Failed to fetch licenses', message: error.message },
      { status: 500 }
    );
  }
}

// POST create new license
export async function POST(request) {
  try {
    const body = await request.json();

    // Validation
    if (!body.licenseNumber || !body.licenseName) {
      return NextResponse.json(
        { error: 'License number and license name are required' },
        { status: 400 }
      );
    }

    const db = await getDb();
    const licensesCollection = db.collection('licenses');

    // Check if license number already exists
    const existingLicense = await licensesCollection.findOne({
      licenseNumber: body.licenseNumber.trim()
    });

    if (existingLicense) {
      return NextResponse.json(
        { error: 'License number already exists' },
        { status: 400 }
      );
    }

    // Create new license
    const newLicense = {
      logo: body.logo || '',
      licenseNumber: body.licenseNumber.trim(),
      licenseName: body.licenseName.trim(),
      ownerName: body.ownerName?.trim() || '',
      mobileNumber: body.mobileNumber?.trim() || '',
      email: body.email?.trim() || '',
      address: body.address?.trim() || '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const result = await licensesCollection.insertOne(newLicense);

    const formattedLicense = {
      id: result.insertedId.toString(),
      _id: result.insertedId.toString(),
      ...newLicense,
      totalHajjPerformers: 0,
      preRegistered: 0,
      registered: 0,
      archive: 0,
      refunded: 0,
      received: 0,
      transferred: 0,
    };

    return NextResponse.json(
      { license: formattedLicense, message: 'License created successfully' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating license:', error);
    return NextResponse.json(
      { error: 'Failed to create license', message: error.message },
      { status: 500 }
    );
  }
}

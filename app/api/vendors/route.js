import { NextResponse } from 'next/server';
import { getDb } from '../../../lib/mongodb';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../lib/auth';
import { getBranchFilter, getBranchInfo } from '../../../lib/branchHelper';

// GET all vendors
export async function GET(request) {
  try {
    // Get user session for branch filtering
    const userSession = await getServerSession(authOptions);
    const branchFilter = getBranchFilter(userSession);
    
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status'); // Optional filter by status

    const db = await getDb();
    const vendorsCollection = db.collection('vendors');

    // Build query with branch filter
    const query = { ...branchFilter };
    if (status) {
      query.status = status;
    }

    const vendors = await vendorsCollection
      .find(query)
      .sort({ created_at: -1 })
      .toArray();

    // Format vendors for frontend
    const formattedVendors = vendors.map((vendor) => ({
      id: vendor._id.toString(),
      _id: vendor._id.toString(),
      vendorId: vendor.vendorId || vendor._id.toString(),
      tradeName: vendor.tradeName || '',
      tradeLocation: vendor.tradeLocation || '',
      ownerName: vendor.ownerName || '',
      contactNo: vendor.contactNo || '',
      dob: vendor.dob || '',
      nid: vendor.nid || '',
      passport: vendor.passport || '',
      logo: vendor.logo || '',
      totalPaid: vendor.totalPaid || vendor.totalPaidAmount || 0,
      totalDue: vendor.totalDue || vendor.dueAmount || vendor.outstandingAmount || vendor.totalDueAmount || 0,
      paidAmount: vendor.totalPaid || vendor.paidAmount || vendor.totalPaidAmount || 0,
      dueAmount: vendor.totalDue || vendor.dueAmount || vendor.outstandingAmount || vendor.totalDueAmount || 0,
      status: vendor.status || 'active',
      created_at: vendor.created_at ? vendor.created_at.toISOString() : '',
      updated_at: vendor.updated_at ? vendor.updated_at.toISOString() : '',
    }));

    return NextResponse.json(
      { vendors: formattedVendors, data: formattedVendors, count: formattedVendors.length },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching vendors:', error);
    return NextResponse.json(
      { error: 'Failed to fetch vendors', message: error.message },
      { status: 500 }
    );
  }
}

// POST create new vendor
export async function POST(request) {
  try {
    // Get user session for branch info
    const userSession = await getServerSession(authOptions);
    const branchInfo = getBranchInfo(userSession);
    
    const body = await request.json();
    const { tradeName, tradeLocation, ownerName, contactNo, dob, nid, passport, logo } = body;

    // Validation
    if (!tradeName || !tradeName.trim()) {
      return NextResponse.json(
        { error: 'Trade Name is required' },
        { status: 400 }
      );
    }

    if (!tradeLocation || !tradeLocation.trim()) {
      return NextResponse.json(
        { error: 'Trade Location is required' },
        { status: 400 }
      );
    }

    if (!ownerName || !ownerName.trim()) {
      return NextResponse.json(
        { error: "Owner's Name is required" },
        { status: 400 }
      );
    }

    if (!contactNo || !contactNo.trim()) {
      return NextResponse.json(
        { error: 'Contact No is required' },
        { status: 400 }
      );
    }

    // Validate phone number format
    const phoneRegex = /^\+?[0-9\-()\s]{6,20}$/;
    if (!phoneRegex.test(contactNo.trim())) {
      return NextResponse.json(
        { error: 'Enter a valid phone number' },
        { status: 400 }
      );
    }

    // Validate NID if provided
    if (nid && nid.trim()) {
      const nidRegex = /^[0-9]{8,20}$/;
      if (!nidRegex.test(nid.trim())) {
        return NextResponse.json(
          { error: 'NID should be 8-20 digits' },
          { status: 400 }
        );
      }
    }

    // Validate Passport if provided
    if (passport && passport.trim()) {
      const passportRegex = /^[A-Za-z0-9]{6,12}$/;
      if (!passportRegex.test(passport.trim())) {
        return NextResponse.json(
          { error: 'Passport should be 6-12 alphanumeric characters' },
          { status: 400 }
        );
      }
    }

    const db = await getDb();
    const vendorsCollection = db.collection('vendors');

    // Check if vendor with same trade name already exists
    const existingVendor = await vendorsCollection.findOne({
      tradeName: tradeName.trim()
    });
    
    if (existingVendor) {
      return NextResponse.json(
        { error: 'Vendor with this trade name already exists' },
        { status: 400 }
      );
    }

    // Generate unique vendor ID (VN00010 format)
    const vendorsWithIds = await vendorsCollection
      .find({ vendorId: { $regex: /^VN\d+$/i } })
      .toArray();
    
    let maxNumber = 0;
    if (vendorsWithIds.length > 0) {
      vendorsWithIds.forEach(vendor => {
        if (vendor.vendorId) {
          const idNumber = parseInt(vendor.vendorId.toUpperCase().replace(/^VN/, '')) || 0;
          if (idNumber > maxNumber) {
            maxNumber = idNumber;
          }
        }
      });
    }
    
    const vendorId = `VN${String(maxNumber + 1).padStart(5, '0')}`;

    // Create new vendor with branch info
    const newVendor = {
      vendorId: vendorId,
      tradeName: tradeName.trim(),
      tradeLocation: tradeLocation.trim(),
      ownerName: ownerName.trim(),
      contactNo: contactNo.trim(),
      dob: dob || '',
      nid: nid ? nid.trim() : '',
      passport: passport ? passport.trim() : '',
      logo: logo || '',
      totalPaid: 0,
      totalDue: 0,
      status: 'active',
      branchId: branchInfo.branchId,
      branchName: branchInfo.branchName,
      created_at: new Date(),
      updated_at: new Date(),
    };

    const result = await vendorsCollection.insertOne(newVendor);

    // Return vendor
    const createdVendor = {
      id: result.insertedId.toString(),
      _id: result.insertedId.toString(),
      vendorId: vendorId,
      ...newVendor,
      created_at: newVendor.created_at.toISOString(),
      updated_at: newVendor.updated_at.toISOString(),
    };

    return NextResponse.json(
      { message: 'Vendor created successfully', vendor: createdVendor },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating vendor:', error);
    return NextResponse.json(
      { error: 'Failed to create vendor', message: error.message },
      { status: 500 }
    );
  }
}

// POST bulk create vendors (for Excel upload)
export async function PUT(request) {
  try {
    // Get user session for branch info
    const userSession = await getServerSession(authOptions);
    const branchInfo = getBranchInfo(userSession);
    
    const body = await request.json();
    const vendors = Array.isArray(body) ? body : [body];

    if (vendors.length === 0) {
      return NextResponse.json(
        { error: 'No vendors provided' },
        { status: 400 }
      );
    }

    const db = await getDb();
    const vendorsCollection = db.collection('vendors');

    const results = {
      success: [],
      errors: [],
    };

    for (const vendorData of vendors) {
      try {
        const { tradeName, tradeLocation, ownerName, contactNo, dob, nid, passport, logo } = vendorData;

        // Validation
        if (!tradeName || !tradeName.trim()) {
          results.errors.push({ vendor: vendorData, error: 'Trade Name is required' });
          continue;
        }

        if (!tradeLocation || !tradeLocation.trim()) {
          results.errors.push({ vendor: vendorData, error: 'Trade Location is required' });
          continue;
        }

        if (!ownerName || !ownerName.trim()) {
          results.errors.push({ vendor: vendorData, error: "Owner's Name is required" });
          continue;
        }

        if (!contactNo || !contactNo.trim()) {
          results.errors.push({ vendor: vendorData, error: 'Contact No is required' });
          continue;
        }

        // Validate phone number format
        const phoneRegex = /^\+?[0-9\-()\s]{6,20}$/;
        if (!phoneRegex.test(contactNo.trim())) {
          results.errors.push({ vendor: vendorData, error: 'Enter a valid phone number' });
          continue;
        }

        // Check if vendor already exists
        const existingVendor = await vendorsCollection.findOne({
          tradeName: tradeName.trim()
        });
        
        if (existingVendor) {
          results.errors.push({ vendor: vendorData, error: 'Vendor with this trade name already exists' });
          continue;
        }

        // Create new vendor with branch info
        const newVendor = {
          tradeName: tradeName.trim(),
          tradeLocation: tradeLocation.trim(),
          ownerName: ownerName.trim(),
          contactNo: contactNo.trim(),
          dob: dob || '',
          nid: nid ? nid.trim() : '',
          passport: passport ? passport.trim() : '',
          logo: logo || '',
          totalPaid: 0,
          totalDue: 0,
          status: 'active',
          branchId: branchInfo.branchId,
          branchName: branchInfo.branchName,
          created_at: new Date(),
          updated_at: new Date(),
        };

        const result = await vendorsCollection.insertOne(newVendor);
        results.success.push({
          id: result.insertedId.toString(),
          ...newVendor,
        });
      } catch (error) {
        results.errors.push({ vendor: vendorData, error: error.message });
      }
    }

    return NextResponse.json(
      { 
        message: `Processed ${vendors.length} vendors. ${results.success.length} successful, ${results.errors.length} failed.`,
        results 
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error bulk creating vendors:', error);
    return NextResponse.json(
      { error: 'Failed to bulk create vendors', message: error.message },
      { status: 500 }
    );
  }
}

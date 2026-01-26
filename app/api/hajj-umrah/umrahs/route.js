import { NextResponse } from 'next/server';
import { getDb } from '../../../../lib/mongodb';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../../lib/auth';
import { getBranchFilter, getBranchInfo } from '../../../../lib/branchHelper';

// GET all umrahs
export async function GET(request) {
  try {
    // Get user session for branch filtering
    const userSession = await getServerSession(authOptions);
    const branchFilter = getBranchFilter(userSession);
    
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit')) || 100;
    const page = parseInt(searchParams.get('page')) || 1;
    const skip = (page - 1) * limit;
    const search = searchParams.get('search') || '';
    const serviceStatus = searchParams.get('serviceStatus') || '';
    const packageId = searchParams.get('packageId');

    const db = await getDb();
    const umrahsCollection = db.collection('umrahs');

    // Build query with branch filter
    const query = { service_type: 'umrah', ...branchFilter };
    
    // Handle packageId filter
    if (packageId) {
      const packageQuery = {
        $or: [
          { packageId: packageId },
          { package_id: packageId },
          { 'packageInfo.packageId': packageId },
          { 'packageInfo._id': packageId }
        ]
      };
      
      if (search || serviceStatus) {
        // If we have other filters, use $and
        if (!query.$and) query.$and = [];
        query.$and.push(packageQuery);
      } else {
        // Otherwise, merge directly
        Object.assign(query, packageQuery);
      }
    }
    
    if (search) {
      const searchQuery = {
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { customer_id: { $regex: search, $options: 'i' } },
          { mobile: { $regex: search, $options: 'i' } },
          { passport_number: { $regex: search, $options: 'i' } },
          { nid_number: { $regex: search, $options: 'i' } },
        ]
      };
      
      if (packageId) {
        if (!query.$and) query.$and = [];
        query.$and.push(searchQuery);
      } else {
        Object.assign(query, searchQuery);
      }
    }

    if (serviceStatus) {
      query.service_status = serviceStatus;
    }

    const umrahs = await umrahsCollection
      .find(query)
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    const total = await umrahsCollection.countDocuments(query);

    // Format umrahs for frontend
    const formattedUmrahs = umrahs.map((umrah) => ({
      id: umrah._id.toString(),
      customer_id: umrah.customer_id || '',
      manual_serial_number: umrah.manual_serial_number || '',
      pid_no: umrah.pid_no || '',
      ng_serial_no: umrah.ng_serial_no || '',
      tracking_no: umrah.tracking_no || '',
      name: umrah.name || `${umrah.first_name || ''} ${umrah.last_name || ''}`.trim(),
      bangla_name: umrah.bangla_name || '',
      first_name: umrah.first_name || '',
      last_name: umrah.last_name || '',
      father_name: umrah.father_name || '',
      mother_name: umrah.mother_name || '',
      spouse_name: umrah.spouse_name || '',
      occupation: umrah.occupation || '',
      date_of_birth: umrah.date_of_birth || '',
      gender: umrah.gender || '',
      marital_status: umrah.marital_status || '',
      nationality: umrah.nationality || '',
      passport_number: umrah.passport_number || '',
      passport_type: umrah.passport_type || '',
      issue_date: umrah.issue_date || '',
      expiry_date: umrah.expiry_date || '',
      nid_number: umrah.nid_number || '',
      mobile: umrah.mobile || '',
      whatsapp_no: umrah.whatsapp_no || '',
      email: umrah.email || '',
      address: umrah.address || '',
      division: umrah.division || '',
      district: umrah.district || '',
      upazila: umrah.upazila || '',
      area: umrah.area || '',
      post_code: umrah.post_code || '',
      emergency_contact: umrah.emergency_contact || '',
      emergency_phone: umrah.emergency_phone || '',
      package_id: umrah.package_id || '',
      agent_id: umrah.agent_id || '',
      departure_date: umrah.departure_date || '',
      return_date: umrah.return_date || '',
      total_amount: umrah.total_amount || umrah.totalAmount || 0,
      paid_amount: umrah.paid_amount || umrah.paidAmount || 0,
      payment_method: umrah.payment_method || '',
      payment_status: umrah.payment_status || 'pending',
      service_type: umrah.service_type || 'umrah',
      service_status: umrah.service_status || '',
      is_active: umrah.is_active !== undefined ? umrah.is_active : true,
      previous_hajj: umrah.previous_hajj || false,
      previous_umrah: umrah.previous_umrah || false,
      special_requirements: umrah.special_requirements || '',
      notes: umrah.notes || '',
      reference_by: umrah.reference_by || '',
      reference_customer_id: umrah.reference_customer_id || '',
      employer_id: umrah.employer_id || umrah.employerId || '',
      employerId: umrah.employer_id || umrah.employerId || '',
      source_type: umrah.source_type || 'office',
      branch_id: umrah.branch_id || '',
      reference_haji: umrah.reference_haji || '',
      photo: umrah.photo || umrah.photo_url || '',
      photo_url: umrah.photo || umrah.photo_url || '',
      passport_copy: umrah.passport_copy || umrah.passport_copy_url || '',
      passport_copy_url: umrah.passport_copy || umrah.passport_copy_url || '',
      nid_copy: umrah.nid_copy || umrah.nid_copy_url || '',
      nid_copy_url: umrah.nid_copy || umrah.nid_copy_url || '',
      created_at: umrah.created_at || umrah._id.getTimestamp().toISOString(),
      updated_at: umrah.updated_at || umrah._id.getTimestamp().toISOString(),
    }));

    return NextResponse.json({
      umrahs: formattedUmrahs,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    }, { status: 200 });
  } catch (error) {
    console.error('Error fetching umrahs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch umrahs', message: error.message },
      { status: 500 }
    );
  }
}

// POST create new umrah
export async function POST(request) {
  try {
    // Get user session for branch info
    const userSession = await getServerSession(authOptions);
    const branchInfo = getBranchInfo(userSession);
    
    const body = await request.json();

    // Validation
    if (!body.name && (!body.first_name || !body.last_name)) {
      return NextResponse.json(
        { error: 'Name or first name and last name are required' },
        { status: 400 }
      );
    }

    if (!body.mobile) {
      return NextResponse.json(
        { error: 'Mobile number is required' },
        { status: 400 }
      );
    }

    const db = await getDb();
    const umrahsCollection = db.collection('umrahs');

    // Generate customer_id if not provided
    let customerId = body.customer_id;
    if (!customerId) {
      // Get the last umrah to generate next customer ID
      const lastUmrah = await umrahsCollection
        .findOne({ service_type: 'umrah' }, { sort: { created_at: -1 } });
      
      if (lastUmrah && lastUmrah.customer_id) {
        // Handle both formats: UMR-0001 and UMR0001
        const lastNumber = parseInt(lastUmrah.customer_id.replace(/^UMR-?/, '')) || 0;
        customerId = `UMR${String(lastNumber + 1).padStart(4, '0')}`;
      } else {
        customerId = 'UMR0001';
      }
    }

    // Check if customer_id already exists
    const existingUmrah = await umrahsCollection.findOne({ customer_id: customerId });
    if (existingUmrah) {
      return NextResponse.json(
        { error: 'Umrah with this customer ID already exists' },
        { status: 400 }
      );
    }

    // Create new umrah
    const newUmrah = {
      customer_id: customerId,
      manual_serial_number: body.manual_serial_number || '',
      pid_no: body.pid_no || '',
      ng_serial_no: body.ng_serial_no || '',
      tracking_no: body.tracking_no || '',
      name: body.name || `${body.first_name || ''} ${body.last_name || ''}`.trim(),
      bangla_name: body.bangla_name || '',
      first_name: body.first_name || '',
      last_name: body.last_name || '',
      father_name: body.father_name || '',
      mother_name: body.mother_name || '',
      spouse_name: body.spouse_name || '',
      occupation: body.occupation || '',
      date_of_birth: body.date_of_birth || '',
      gender: body.gender || '',
      marital_status: body.marital_status || '',
      nationality: body.nationality || 'Bangladeshi',
      passport_number: body.passport_number || '',
      passport_type: body.passport_type || '',
      issue_date: body.issue_date || '',
      expiry_date: body.expiry_date || '',
      nid_number: body.nid_number || '',
      mobile: body.mobile,
      whatsapp_no: body.whatsapp_no || body.mobile,
      email: body.email || '',
      address: body.address || '',
      division: body.division || '',
      district: body.district || '',
      upazila: body.upazila || '',
      area: body.area || '',
      post_code: body.post_code || '',
      emergency_contact: body.emergency_contact || '',
      emergency_phone: body.emergency_phone || '',
      package_id: body.package_id || '',
      agent_id: body.agent_id || '',
      departure_date: body.departure_date || '',
      return_date: body.return_date || '',
      total_amount: parseFloat(body.total_amount) || 0,
      paid_amount: parseFloat(body.paid_amount) || 0,
      payment_method: body.payment_method || '',
      payment_status: body.payment_status || 'pending',
      service_type: 'umrah',
      service_status: body.service_status || '',
      is_active: body.is_active !== undefined ? body.is_active : true,
      previous_hajj: body.previous_hajj || false,
      previous_umrah: body.previous_umrah || false,
      special_requirements: body.special_requirements || '',
      notes: body.notes || '',
      reference_by: body.reference_by || '',
      reference_customer_id: body.reference_customer_id || '',
      employer_id: body.employer_id || body.employerId || '',
      employerId: body.employer_id || body.employerId || '',
      source_type: body.source_type || 'office',
      branch_id: body.branch_id || branchInfo.branchId || '',
      reference_haji: body.reference_haji || '',
      photo: body.photo || body.photo_url || '',
      photo_url: body.photo || body.photo_url || '',
      passport_copy: body.passport_copy || body.passport_copy_url || '',
      passport_copy_url: body.passport_copy || body.passport_copy_url || '',
      nid_copy: body.nid_copy || body.nid_copy_url || '',
      nid_copy_url: body.nid_copy || body.nid_copy_url || '',
      branchId: branchInfo.branchId,
      branchName: branchInfo.branchName,
      created_at: new Date(),
      updated_at: new Date(),
    };

    const result = await umrahsCollection.insertOne(newUmrah);

    // Return umrah
    const createdUmrah = {
      id: result.insertedId.toString(),
      customer_id: newUmrah.customer_id,
      ...newUmrah,
    };

    return NextResponse.json(
      { message: 'Umrah created successfully', umrah: createdUmrah },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating umrah:', error);
    return NextResponse.json(
      { error: 'Failed to create umrah', message: error.message },
      { status: 500 }
    );
  }
}

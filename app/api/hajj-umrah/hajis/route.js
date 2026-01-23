import { NextResponse } from 'next/server';
import { getDb } from '../../../../lib/mongodb';

// GET all hajis
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit')) || 100;
    const page = parseInt(searchParams.get('page')) || 1;
    const skip = (page - 1) * limit;
    const packageId = searchParams.get('packageId');

    const db = await getDb();
    const hajisCollection = db.collection('hajis');

    // Build query
    const query = {};
    
    if (packageId) {
      query.$or = [
        { packageId: packageId },
        { package_id: packageId },
        { 'packageInfo.packageId': packageId },
        { 'packageInfo._id': packageId }
      ];
    }

    const hajis = await hajisCollection
      .find(query)
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    const total = await hajisCollection.countDocuments(query);

    // Format hajis for frontend
    const formattedHajis = hajis.map((haji) => ({
      id: haji._id.toString(),
      customer_id: haji.customer_id || '',
      manual_serial_number: haji.manual_serial_number || '',
      pid_no: haji.pid_no || '',
      ng_serial_no: haji.ng_serial_no || '',
      tracking_no: haji.tracking_no || '',
      name: haji.name || `${haji.first_name || ''} ${haji.last_name || ''}`.trim(),
      first_name: haji.first_name || '',
      last_name: haji.last_name || '',
      father_name: haji.father_name || '',
      mother_name: haji.mother_name || '',
      spouse_name: haji.spouse_name || '',
      occupation: haji.occupation || '',
      date_of_birth: haji.date_of_birth || '',
      gender: haji.gender || '',
      marital_status: haji.marital_status || '',
      nationality: haji.nationality || '',
      passport_number: haji.passport_number || '',
      passport_type: haji.passport_type || '',
      issue_date: haji.issue_date || '',
      expiry_date: haji.expiry_date || '',
      nid_number: haji.nid_number || '',
      mobile: haji.mobile || '',
      whatsapp_no: haji.whatsapp_no || '',
      email: haji.email || '',
      address: haji.address || '',
      division: haji.division || '',
      district: haji.district || '',
      upazila: haji.upazila || '',
      area: haji.area || '',
      post_code: haji.post_code || '',
      emergency_contact: haji.emergency_contact || '',
      emergency_phone: haji.emergency_phone || '',
      package_id: haji.package_id || '',
      agent_id: haji.agent_id || '',
      license_id: haji.license_id || '',
      departure_date: haji.departure_date || '',
      return_date: haji.return_date || '',
      total_amount: haji.total_amount || 0,
      paid_amount: haji.paid_amount || 0,
      payment_method: haji.payment_method || '',
      payment_status: haji.payment_status || 'pending',
      service_type: haji.service_type || 'hajj',
      service_status: haji.service_status || 'আনপেইড',
      is_active: haji.is_active !== undefined ? haji.is_active : true,
      previous_hajj: haji.previous_hajj || false,
      previous_umrah: haji.previous_umrah || false,
      special_requirements: haji.special_requirements || '',
      notes: haji.notes || '',
      reference_by: haji.reference_by || '',
      reference_customer_id: haji.reference_customer_id || '',
      employer_id: haji.employer_id || haji.employerId || '',
      employerId: haji.employer_id || haji.employerId || '',
      photo: haji.photo || haji.photo_url || '',
      photo_url: haji.photo || haji.photo_url || '',
      passport_copy: haji.passport_copy || haji.passport_copy_url || '',
      passport_copy_url: haji.passport_copy || haji.passport_copy_url || '',
      nid_copy: haji.nid_copy || haji.nid_copy_url || '',
      nid_copy_url: haji.nid_copy || haji.nid_copy_url || '',
      created_at: haji.created_at || haji._id.getTimestamp().toISOString(),
      updated_at: haji.updated_at || haji._id.getTimestamp().toISOString(),
    }));

    return NextResponse.json({
      hajis: formattedHajis,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    }, { status: 200 });
  } catch (error) {
    console.error('Error fetching hajis:', error);
    return NextResponse.json(
      { error: 'Failed to fetch hajis', message: error.message },
      { status: 500 }
    );
  }
}

// POST create new haji
export async function POST(request) {
  try {
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
    const hajisCollection = db.collection('hajis');

    // Generate customer_id if not provided
    let customerId = body.customer_id;
    if (!customerId) {
      // Get the last haji to generate next customer ID
      const lastHaji = await hajisCollection
        .findOne({}, { sort: { created_at: -1 } });
      
      if (lastHaji && lastHaji.customer_id) {
        // Handle both formats: HAJ-0001 and HAJ0001
        const lastNumber = parseInt(lastHaji.customer_id.replace(/^HAJ-?/, '')) || 0;
        customerId = `HAJ${String(lastNumber + 1).padStart(4, '0')}`;
      } else {
        customerId = 'HAJ0001';
      }
    }

    // Check if customer_id already exists
    const existingHaji = await hajisCollection.findOne({ customer_id: customerId });
    if (existingHaji) {
      return NextResponse.json(
        { error: 'Haji with this customer ID already exists' },
        { status: 400 }
      );
    }

    // Create new haji
    const newHaji = {
      customer_id: customerId,
      manual_serial_number: body.manual_serial_number || '',
      pid_no: body.pid_no || '',
      ng_serial_no: body.ng_serial_no || '',
      tracking_no: body.tracking_no || '',
      name: body.name || `${body.first_name || ''} ${body.last_name || ''}`.trim(),
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
      license_id: body.license_id || '',
      departure_date: body.departure_date || '',
      return_date: body.return_date || '',
      total_amount: parseFloat(body.total_amount) || 0,
      paid_amount: parseFloat(body.paid_amount) || 0,
      payment_method: body.payment_method || '',
      payment_status: body.payment_status || 'pending',
      service_type: body.service_type || 'hajj',
      service_status: body.service_status || 'আনপেইড',
      is_active: body.is_active !== undefined ? body.is_active : true,
      previous_hajj: body.previous_hajj || false,
      previous_umrah: body.previous_umrah || false,
      special_requirements: body.special_requirements || '',
      notes: body.notes || '',
      reference_by: body.reference_by || '',
      reference_customer_id: body.reference_customer_id || '',
      employer_id: body.employer_id || body.employerId || '',
      employerId: body.employer_id || body.employerId || '',
      photo: body.photo || '',
      photo_url: body.photo || '',
      passport_copy: body.passport_copy || '',
      passport_copy_url: body.passport_copy || '',
      nid_copy: body.nid_copy || '',
      nid_copy_url: body.nid_copy || '',
      created_at: new Date(),
      updated_at: new Date(),
    };

    const result = await hajisCollection.insertOne(newHaji);

    // Return haji
    const createdHaji = {
      id: result.insertedId.toString(),
      customer_id: newHaji.customer_id,
      ...newHaji,
    };

    return NextResponse.json(
      { message: 'Haji created successfully', haji: createdHaji },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating haji:', error);
    return NextResponse.json(
      { error: 'Failed to create haji', message: error.message },
      { status: 500 }
    );
  }
}

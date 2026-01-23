import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { getDb } from '../../../../../lib/mongodb';

// GET single haji
export async function GET(request, { params }) {
  try {
    // Handle both sync and async params
    const resolvedParams = params instanceof Promise ? await params : params;
    const { id } = resolvedParams;

    if (!id) {
      return NextResponse.json(
        { error: 'Haji ID is required' },
        { status: 400 }
      );
    }

    const db = await getDb();
    const hajisCollection = db.collection('hajis');

    let haji = null;

    // Try to find by ObjectId first
    if (ObjectId.isValid(id)) {
      haji = await hajisCollection.findOne({ _id: new ObjectId(id) });
    }

    // If not found by ObjectId, try to find by customer_id
    if (!haji) {
      haji = await hajisCollection.findOne({ customer_id: id });
    }

    if (!haji) {
      return NextResponse.json(
        { error: 'Haji not found', id: id },
        { status: 404 }
      );
    }

    // Format haji for frontend
    const formattedHaji = {
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
      total_amount: haji.total_amount || haji.totalAmount || 0,
      paid_amount: haji.paid_amount || haji.paidAmount || 0,
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
    };

    return NextResponse.json({ haji: formattedHaji }, { status: 200 });
  } catch (error) {
    console.error('Error fetching haji:', error);
    return NextResponse.json(
      { error: 'Failed to fetch haji', message: error.message },
      { status: 500 }
    );
  }
}

// PUT update haji
export async function PUT(request, { params }) {
  try {
    // Handle both sync and async params
    const resolvedParams = params instanceof Promise ? await params : params;
    const { id } = resolvedParams;
    const body = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: 'Haji ID is required' },
        { status: 400 }
      );
    }

    const db = await getDb();
    const hajisCollection = db.collection('hajis');

    // Find haji by ObjectId or customer_id
    let existingHaji = null;
    let query = {};

    if (ObjectId.isValid(id)) {
      query._id = new ObjectId(id);
      existingHaji = await hajisCollection.findOne(query);
    }

    if (!existingHaji) {
      query = { customer_id: id };
      existingHaji = await hajisCollection.findOne(query);
    }

    if (!existingHaji) {
      return NextResponse.json(
        { error: 'Haji not found' },
        { status: 404 }
      );
    }

    // Check if customer_id is being changed and if it's already taken
    if (body.customer_id && body.customer_id !== existingHaji.customer_id) {
      const customerIdExists = await hajisCollection.findOne({
        customer_id: body.customer_id,
        _id: { $ne: existingHaji._id },
      });
      if (customerIdExists) {
        return NextResponse.json(
          { error: 'Customer ID already in use by another haji' },
          { status: 400 }
        );
      }
    }

    // Update haji
    const updateData = {
      updated_at: new Date(),
    };

    // Update all fields that are provided
    const fieldsToUpdate = [
      'customer_id', 'manual_serial_number', 'pid_no', 'ng_serial_no', 'tracking_no',
      'name', 'first_name', 'last_name', 'father_name', 'mother_name', 'spouse_name',
      'occupation', 'date_of_birth', 'gender', 'marital_status', 'nationality',
      'passport_number', 'passport_type', 'issue_date', 'expiry_date', 'nid_number',
      'mobile', 'whatsapp_no', 'email', 'address', 'division', 'district', 'upazila',
      'area', 'post_code', 'emergency_contact', 'emergency_phone',
      'package_id', 'agent_id', 'license_id', 'departure_date', 'return_date',
      'total_amount', 'paid_amount', 'payment_method', 'payment_status',
      'service_type', 'service_status', 'is_active', 'previous_hajj', 'previous_umrah',
      'special_requirements', 'notes', 'reference_by', 'reference_customer_id',
      'employer_id', 'employerId',
      'photo', 'photo_url', 'passport_copy', 'passport_copy_url', 'nid_copy', 'nid_copy_url'
    ];

    fieldsToUpdate.forEach(field => {
      if (body[field] !== undefined) {
        if (field.includes('amount')) {
          updateData[field] = parseFloat(body[field]) || 0;
        } else if (field === 'is_active' || field === 'previous_hajj' || field === 'previous_umrah') {
          updateData[field] = Boolean(body[field]);
        } else {
          updateData[field] = body[field];
        }
      }
    });

    // Handle employer_id/employerId - update both fields
    if (body.employer_id !== undefined || body.employerId !== undefined) {
      const employerId = body.employer_id || body.employerId || '';
      updateData.employer_id = employerId;
      updateData.employerId = employerId;
    }

    // Update name if first_name or last_name changed
    if (body.first_name !== undefined || body.last_name !== undefined) {
      const firstName = body.first_name !== undefined ? body.first_name : existingHaji.first_name;
      const lastName = body.last_name !== undefined ? body.last_name : existingHaji.last_name;
      updateData.name = `${firstName || ''} ${lastName || ''}`.trim();
    }

    await hajisCollection.updateOne(
      query,
      { $set: updateData }
    );

    // Fetch updated haji
    const updatedHaji = await hajisCollection.findOne(query);

    const formattedHaji = {
      id: updatedHaji._id.toString(),
      customer_id: updatedHaji.customer_id || '',
      ...updatedHaji,
    };

    return NextResponse.json(
      { message: 'Haji updated successfully', haji: formattedHaji },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating haji:', error);
    return NextResponse.json(
      { error: 'Failed to update haji', message: error.message },
      { status: 500 }
    );
  }
}

// DELETE haji
export async function DELETE(request, { params }) {
  try {
    // Handle both sync and async params
    const resolvedParams = params instanceof Promise ? await params : params;
    const { id } = resolvedParams;

    if (!id) {
      return NextResponse.json(
        { error: 'Haji ID is required' },
        { status: 400 }
      );
    }

    const db = await getDb();
    const hajisCollection = db.collection('hajis');

    // Find haji by ObjectId or customer_id
    let existingHaji = null;
    let query = {};

    if (ObjectId.isValid(id)) {
      query._id = new ObjectId(id);
      existingHaji = await hajisCollection.findOne(query);
    }

    if (!existingHaji) {
      query = { customer_id: id };
      existingHaji = await hajisCollection.findOne(query);
    }

    if (!existingHaji) {
      return NextResponse.json(
        { error: 'Haji not found' },
        { status: 404 }
      );
    }

    // Soft delete - set is_active to false instead of deleting
    await hajisCollection.updateOne(
      query,
      { $set: { is_active: false, updated_at: new Date() } }
    );

    return NextResponse.json(
      { message: 'Haji deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting haji:', error);
    return NextResponse.json(
      { error: 'Failed to delete haji', message: error.message },
      { status: 500 }
    );
  }
}

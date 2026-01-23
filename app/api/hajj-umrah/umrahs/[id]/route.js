import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { getDb } from '../../../../../lib/mongodb';

// GET single umrah
export async function GET(request, { params }) {
  try {
    // Handle both sync and async params
    const resolvedParams = params instanceof Promise ? await params : params;
    const { id } = resolvedParams;

    if (!id) {
      return NextResponse.json(
        { error: 'Umrah ID is required' },
        { status: 400 }
      );
    }

    const db = await getDb();
    const umrahsCollection = db.collection('umrahs');

    let umrah = null;

    // Try to find by ObjectId first
    if (ObjectId.isValid(id)) {
      umrah = await umrahsCollection.findOne({ _id: new ObjectId(id) });
    }

    // If not found by ObjectId, try to find by customer_id
    if (!umrah) {
      umrah = await umrahsCollection.findOne({ customer_id: id });
    }

    if (!umrah) {
      return NextResponse.json(
        { error: 'Umrah not found', id: id },
        { status: 404 }
      );
    }

    // Format umrah for frontend
    const formattedUmrah = {
      id: umrah._id.toString(),
      customer_id: umrah.customer_id || '',
      manual_serial_number: umrah.manual_serial_number || '',
      pid_no: umrah.pid_no || '',
      ng_serial_no: umrah.ng_serial_no || '',
      tracking_no: umrah.tracking_no || '',
      name: umrah.name || `${umrah.first_name || ''} ${umrah.last_name || ''}`.trim(),
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
      total_amount: umrah.total_amount || 0,
      paid_amount: umrah.paid_amount || 0,
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
      photo: umrah.photo || umrah.photo_url || '',
      photo_url: umrah.photo || umrah.photo_url || '',
      passport_copy: umrah.passport_copy || umrah.passport_copy_url || '',
      passport_copy_url: umrah.passport_copy || umrah.passport_copy_url || '',
      nid_copy: umrah.nid_copy || umrah.nid_copy_url || '',
      nid_copy_url: umrah.nid_copy || umrah.nid_copy_url || '',
      created_at: umrah.created_at || umrah._id.getTimestamp().toISOString(),
      updated_at: umrah.updated_at || umrah._id.getTimestamp().toISOString(),
    };

    return NextResponse.json({ umrah: formattedUmrah }, { status: 200 });
  } catch (error) {
    console.error('Error fetching umrah:', error);
    return NextResponse.json(
      { error: 'Failed to fetch umrah', message: error.message },
      { status: 500 }
    );
  }
}

// PUT update umrah
export async function PUT(request, { params }) {
  try {
    // Handle both sync and async params
    const resolvedParams = params instanceof Promise ? await params : params;
    const { id } = resolvedParams;
    const body = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: 'Umrah ID is required' },
        { status: 400 }
      );
    }

    const db = await getDb();
    const umrahsCollection = db.collection('umrahs');

    // Find umrah by ObjectId or customer_id
    let existingUmrah = null;
    let query = {};

    if (ObjectId.isValid(id)) {
      query._id = new ObjectId(id);
      existingUmrah = await umrahsCollection.findOne(query);
    }

    if (!existingUmrah) {
      query = { customer_id: id };
      existingUmrah = await umrahsCollection.findOne(query);
    }

    if (!existingUmrah) {
      return NextResponse.json(
        { error: 'Umrah not found' },
        { status: 404 }
      );
    }

    // Check if customer_id is being changed and if it's already taken
    if (body.customer_id && body.customer_id !== existingUmrah.customer_id) {
      const customerIdExists = await umrahsCollection.findOne({
        customer_id: body.customer_id,
        _id: { $ne: existingUmrah._id },
      });
      if (customerIdExists) {
        return NextResponse.json(
          { error: 'Customer ID already in use by another umrah' },
          { status: 400 }
        );
      }
    }

    // Update umrah
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
      'package_id', 'agent_id', 'departure_date', 'return_date',
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
      const firstName = body.first_name !== undefined ? body.first_name : existingUmrah.first_name;
      const lastName = body.last_name !== undefined ? body.last_name : existingUmrah.last_name;
      updateData.name = `${firstName || ''} ${lastName || ''}`.trim();
    }

    await umrahsCollection.updateOne(
      query,
      { $set: updateData }
    );

    // Fetch updated umrah
    const updatedUmrah = await umrahsCollection.findOne(query);

    const formattedUmrah = {
      id: updatedUmrah._id.toString(),
      customer_id: updatedUmrah.customer_id || '',
      ...updatedUmrah,
    };

    return NextResponse.json(
      { message: 'Umrah updated successfully', umrah: formattedUmrah },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating umrah:', error);
    return NextResponse.json(
      { error: 'Failed to update umrah', message: error.message },
      { status: 500 }
    );
  }
}

// DELETE umrah
export async function DELETE(request, { params }) {
  try {
    // Handle both sync and async params
    const resolvedParams = params instanceof Promise ? await params : params;
    const { id } = resolvedParams;

    if (!id) {
      return NextResponse.json(
        { error: 'Umrah ID is required' },
        { status: 400 }
      );
    }

    const db = await getDb();
    const umrahsCollection = db.collection('umrahs');

    // Find umrah by ObjectId or customer_id
    let existingUmrah = null;
    let query = {};

    if (ObjectId.isValid(id)) {
      query._id = new ObjectId(id);
      existingUmrah = await umrahsCollection.findOne(query);
    }

    if (!existingUmrah) {
      query = { customer_id: id };
      existingUmrah = await umrahsCollection.findOne(query);
    }

    if (!existingUmrah) {
      return NextResponse.json(
        { error: 'Umrah not found' },
        { status: 404 }
      );
    }

    // Soft delete - set is_active to false instead of deleting
    await umrahsCollection.updateOne(
      query,
      { $set: { is_active: false, updated_at: new Date() } }
    );

    return NextResponse.json(
      { message: 'Umrah deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting umrah:', error);
    return NextResponse.json(
      { error: 'Failed to delete umrah', message: error.message },
      { status: 500 }
    );
  }
}

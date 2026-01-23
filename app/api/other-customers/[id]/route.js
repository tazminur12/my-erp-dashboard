import { NextResponse } from 'next/server';
import { getDb } from '../../../../lib/mongodb';
import { ObjectId } from 'mongodb';

// GET single other customer
export async function GET(request, { params }) {
  try {
    const resolvedParams = params instanceof Promise ? await params : params;
    const { id } = resolvedParams;

    if (!id) {
      return NextResponse.json(
        { error: 'Customer ID is required' },
        { status: 400 }
      );
    }

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid customer ID format' },
        { status: 400 }
      );
    }

    const db = await getDb();
    const otherCustomersCollection = db.collection('other_customers');

    const customer = await otherCustomersCollection.findOne({ _id: new ObjectId(id) });

    if (!customer) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      );
    }

    const formattedCustomer = {
      id: customer._id.toString(),
      _id: customer._id.toString(),
      customerId: customer.customerId || customer._id.toString(),
      name: customer.name || '',
      firstName: customer.firstName || '',
      lastName: customer.lastName || '',
      phone: customer.phone || '',
      email: customer.email || '',
      address: customer.address || '',
      city: customer.city || '',
      country: customer.country || '',
      status: customer.status || 'active',
      notes: customer.notes || '',
      createdAt: customer.createdAt ? customer.createdAt.toISOString() : customer._id.getTimestamp().toISOString(),
      updatedAt: customer.updatedAt ? customer.updatedAt.toISOString() : customer._id.getTimestamp().toISOString(),
    };

    return NextResponse.json({
      customer: formattedCustomer,
      data: formattedCustomer,
    }, { status: 200 });
  } catch (error) {
    console.error('Error fetching other customer:', error);
    return NextResponse.json(
      { error: 'Failed to fetch other customer', message: error.message },
      { status: 500 }
    );
  }
}

// PUT/PATCH update other customer
export async function PUT(request, { params }) {
  try {
    const resolvedParams = params instanceof Promise ? await params : params;
    const { id } = resolvedParams;
    const body = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: 'Customer ID is required' },
        { status: 400 }
      );
    }

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid customer ID format' },
        { status: 400 }
      );
    }

    const db = await getDb();
    const otherCustomersCollection = db.collection('other_customers');

    // Check if customer exists
    const existingCustomer = await otherCustomersCollection.findOne({ _id: new ObjectId(id) });

    if (!existingCustomer) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      );
    }

    // Build update data
    const updateData = {
      updatedAt: new Date(),
    };

    if (body.firstName !== undefined) updateData.firstName = body.firstName.trim();
    if (body.lastName !== undefined) updateData.lastName = body.lastName.trim();
    if (body.name !== undefined) updateData.name = body.name.trim();
    if (body.phone !== undefined) updateData.phone = body.phone.trim();
    if (body.email !== undefined) updateData.email = body.email ? body.email.trim() : null;
    if (body.address !== undefined) updateData.address = body.address ? body.address.trim() : null;
    if (body.city !== undefined) updateData.city = body.city ? body.city.trim() : null;
    if (body.country !== undefined) updateData.country = body.country ? body.country.trim() : null;
    if (body.status !== undefined) updateData.status = body.status;
    if (body.notes !== undefined) updateData.notes = body.notes ? body.notes.trim() : null;

    // Update name if firstName or lastName changed
    if (body.firstName !== undefined || body.lastName !== undefined) {
      const firstName = updateData.firstName !== undefined ? updateData.firstName : existingCustomer.firstName;
      const lastName = updateData.lastName !== undefined ? updateData.lastName : existingCustomer.lastName;
      updateData.name = `${firstName || ''} ${lastName || ''}`.trim();
    }

    await otherCustomersCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    // Fetch updated customer
    const updatedCustomer = await otherCustomersCollection.findOne({ _id: new ObjectId(id) });

    const formattedCustomer = {
      id: updatedCustomer._id.toString(),
      _id: updatedCustomer._id.toString(),
      customerId: updatedCustomer.customerId || updatedCustomer._id.toString(),
      name: updatedCustomer.name || '',
      firstName: updatedCustomer.firstName || '',
      lastName: updatedCustomer.lastName || '',
      phone: updatedCustomer.phone || '',
      email: updatedCustomer.email || '',
      address: updatedCustomer.address || '',
      city: updatedCustomer.city || '',
      country: updatedCustomer.country || '',
      status: updatedCustomer.status || 'active',
      notes: updatedCustomer.notes || '',
      createdAt: updatedCustomer.createdAt ? updatedCustomer.createdAt.toISOString() : updatedCustomer._id.getTimestamp().toISOString(),
      updatedAt: updatedCustomer.updatedAt ? updatedCustomer.updatedAt.toISOString() : updatedCustomer._id.getTimestamp().toISOString(),
    };

    return NextResponse.json({
      success: true,
      message: 'Customer updated successfully',
      customer: formattedCustomer,
      data: formattedCustomer,
    }, { status: 200 });
  } catch (error) {
    console.error('Error updating other customer:', error);
    return NextResponse.json(
      { error: 'Failed to update other customer', message: error.message },
      { status: 500 }
    );
  }
}

// DELETE other customer
export async function DELETE(request, { params }) {
  try {
    const resolvedParams = params instanceof Promise ? await params : params;
    const { id } = resolvedParams;

    if (!id) {
      return NextResponse.json(
        { error: 'Customer ID is required' },
        { status: 400 }
      );
    }

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid customer ID format' },
        { status: 400 }
      );
    }

    const db = await getDb();
    const otherCustomersCollection = db.collection('other_customers');

    // Check if customer exists
    const customer = await otherCustomersCollection.findOne({ _id: new ObjectId(id) });

    if (!customer) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      );
    }

    await otherCustomersCollection.deleteOne({ _id: new ObjectId(id) });

    return NextResponse.json({
      success: true,
      message: 'Customer deleted successfully',
    }, { status: 200 });
  } catch (error) {
    console.error('Error deleting other customer:', error);
    return NextResponse.json(
      { error: 'Failed to delete other customer', message: error.message },
      { status: 500 }
    );
  }
}

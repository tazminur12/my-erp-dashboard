import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { getDb } from '../../../../../../lib/mongodb';

// DELETE - Remove customer from agent package
export async function DELETE(request, { params }) {
  try {
    const { id, customerId } = params;

    if (!id) {
      return NextResponse.json(
        { error: 'Package ID is required' },
        { status: 400 }
      );
    }

    if (!customerId) {
      return NextResponse.json(
        { error: 'Customer ID is required' },
        { status: 400 }
      );
    }

    const db = await getDb();
    const packagesCollection = db.collection('agent_packages');

    // Check if package exists
    const pkg = await packagesCollection.findOne({ _id: new ObjectId(id) });
    if (!pkg) {
      return NextResponse.json(
        { error: 'Package not found' },
        { status: 404 }
      );
    }

    // Get existing assigned customers
    const existingCustomers = pkg.assignedCustomers || [];
    
    // Remove customer from array
    const updatedCustomers = existingCustomers.filter(
      customer => customer !== customerId && customer.toString() !== customerId.toString()
    );

    // Update package
    await packagesCollection.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          assignedCustomers: updatedCustomers,
          updatedAt: new Date(),
        },
      }
    );

    return NextResponse.json(
      { 
        message: 'Customer removed successfully',
        assignedCustomers: updatedCustomers
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error removing customer:', error);
    return NextResponse.json(
      { error: 'Failed to remove customer', message: error.message },
      { status: 500 }
    );
  }
}

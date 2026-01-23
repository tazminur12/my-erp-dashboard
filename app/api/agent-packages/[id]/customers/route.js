import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { getDb } from '../../../../../lib/mongodb';

// POST - Assign customers to agent package
export async function POST(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();
    const { customerIds } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Package ID is required' },
        { status: 400 }
      );
    }

    if (!customerIds || !Array.isArray(customerIds) || customerIds.length === 0) {
      return NextResponse.json(
        { error: 'Customer IDs array is required' },
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
    
    // Add new customers (avoid duplicates)
    const newCustomers = customerIds.filter(customerId => 
      !existingCustomers.includes(customerId)
    );
    
    const updatedCustomers = [...existingCustomers, ...newCustomers];

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
        message: 'Customers assigned successfully',
        assignedCustomers: updatedCustomers,
        newlyAdded: newCustomers.length
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error assigning customers:', error);
    return NextResponse.json(
      { error: 'Failed to assign customers', message: error.message },
      { status: 500 }
    );
  }
}

// GET - Get assigned customers for a package
export async function GET(request, { params }) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { error: 'Package ID is required' },
        { status: 400 }
      );
    }

    const db = await getDb();
    const packagesCollection = db.collection('agent_packages');

    const pkg = await packagesCollection.findOne({ _id: new ObjectId(id) });

    if (!pkg) {
      return NextResponse.json(
        { error: 'Package not found' },
        { status: 404 }
      );
    }

    const assignedCustomers = pkg.assignedCustomers || [];

    return NextResponse.json(
      { 
        customers: assignedCustomers,
        count: assignedCustomers.length
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching assigned customers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch assigned customers', message: error.message },
      { status: 500 }
    );
  }
}

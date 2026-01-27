import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { getDb } from '../../../../../lib/mongodb';

// POST - Assign customers to agent package
export async function POST(request, { params }) {
  try {
    const { id } = await params;
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
    let packagesCollection = db.collection('agent_packages');

    // Check if package exists in agent_packages
    let pkg = await packagesCollection.findOne({ _id: new ObjectId(id) });
    
    // If not found, check in packages collection
    if (!pkg) {
      packagesCollection = db.collection('packages');
      pkg = await packagesCollection.findOne({ _id: new ObjectId(id) });
    }

    if (!pkg) {
      return NextResponse.json(
        { error: 'Package not found' },
        { status: 404 }
      );
    }

    // Get package price (from profitLoss or totals)
    let packagePrice = 0;
    if (pkg.profitLoss && pkg.profitLoss.sellingPrice) {
      packagePrice = parseFloat(pkg.profitLoss.sellingPrice);
    } else if (pkg.profitLoss && pkg.profitLoss.packagePrice) {
      packagePrice = parseFloat(pkg.profitLoss.packagePrice);
    } else if (pkg.totalPrice) {
      packagePrice = parseFloat(pkg.totalPrice);
    } else if (pkg.totals && pkg.totals.subtotal) {
      packagePrice = parseFloat(pkg.totals.subtotal);
    }

    const hajisCollection = db.collection('hajis');
    const umrahsCollection = db.collection('umrahs');

    // Update customers with package info
    const updatePromises = customerIds.map(async (customerId) => {
      let objectId;
      try {
        objectId = new ObjectId(customerId);
      } catch (e) {
        objectId = customerId; // Keep as string if not valid ObjectId
      }

      const updateData = {
        agentPackageId: id, // Store as string for consistency
        agentPackageName: pkg.packageName,
        agentPackagePrice: packagePrice,
        packageId: id, // Also set standard packageId
        packageName: pkg.packageName,
        packagePrice: packagePrice,
        amount: packagePrice, // Set amount for financial calculations
        updatedAt: new Date()
      };

      // Try to update in hajis collection
      const hajiUpdate = await hajisCollection.updateOne(
        { _id: objectId },
        { $set: updateData }
      );

      // If not found in hajis, try umrahs
      if (hajiUpdate.matchedCount === 0) {
        await umrahsCollection.updateOne(
          { _id: objectId },
          { $set: updateData }
        );
      }
    });

    await Promise.all(updatePromises);

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
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: 'Package ID is required' },
        { status: 400 }
      );
    }

    const db = await getDb();
    let packagesCollection = db.collection('agent_packages');

    let pkg = await packagesCollection.findOne({ _id: new ObjectId(id) });

    if (!pkg) {
      packagesCollection = db.collection('packages');
      pkg = await packagesCollection.findOne({ _id: new ObjectId(id) });
    }

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

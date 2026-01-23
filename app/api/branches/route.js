import { NextResponse } from 'next/server';
import { getDb } from '../../../lib/mongodb';

// GET all branches
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status'); // Optional filter by status

    const db = await getDb();
    const branchesCollection = db.collection('branches');

    // Build query
    const query = {};
    if (status) {
      query.status = status;
    }

    const branches = await branchesCollection
      .find(query)
      .sort({ name: 1 })
      .toArray();

    // Format branches for frontend
    const formattedBranches = branches.map((branch) => ({
      id: branch._id.toString(),
      name: branch.name || branch.branchName || '',
      branchName: branch.branchName || branch.name || '',
      address: branch.address || '',
      phone: branch.phone || '',
      email: branch.email || '',
      manager: branch.manager || '',
      status: branch.status || 'active',
      created_at: branch.created_at || branch._id.getTimestamp().toISOString(),
    }));

    return NextResponse.json({ branches: formattedBranches }, { status: 200 });
  } catch (error) {
    console.error('Error fetching branches:', error);
    return NextResponse.json(
      { error: 'Failed to fetch branches', message: error.message },
      { status: 500 }
    );
  }
}

// POST create new branch
export async function POST(request) {
  try {
    const body = await request.json();
    const { name, address, phone, email, manager } = body;

    // Validation
    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: 'Branch name is required' },
        { status: 400 }
      );
    }

    const db = await getDb();
    const branchesCollection = db.collection('branches');

    // Check if branch name already exists
    const existingBranch = await branchesCollection.findOne({
      $or: [
        { name: name.trim() },
        { branchName: name.trim() }
      ]
    });
    
    if (existingBranch) {
      return NextResponse.json(
        { error: 'Branch with this name already exists' },
        { status: 400 }
      );
    }

    // Create new branch
    const newBranch = {
      name: name.trim(),
      branchName: name.trim(), // Keep both for compatibility
      address: address || '',
      phone: phone || '',
      email: email || '',
      manager: manager || '',
      status: 'active',
      created_at: new Date(),
      updated_at: new Date(),
    };

    const result = await branchesCollection.insertOne(newBranch);

    // Return branch
    const createdBranch = {
      id: result.insertedId.toString(),
      name: newBranch.name,
      branchName: newBranch.branchName,
      address: newBranch.address,
      phone: newBranch.phone,
      email: newBranch.email,
      manager: newBranch.manager,
      status: newBranch.status,
      created_at: newBranch.created_at.toISOString(),
    };

    return NextResponse.json(
      { message: 'Branch created successfully', branch: createdBranch },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating branch:', error);
    return NextResponse.json(
      { error: 'Failed to create branch', message: error.message },
      { status: 500 }
    );
  }
}

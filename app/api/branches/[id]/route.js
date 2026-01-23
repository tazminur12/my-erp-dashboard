import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { getDb } from '../../../../lib/mongodb';

// GET single branch
export async function GET(request, { params }) {
  try {
    const { id } = params;

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid branch ID' },
        { status: 400 }
      );
    }

    const db = await getDb();
    const branchesCollection = db.collection('branches');

    const branch = await branchesCollection.findOne({ _id: new ObjectId(id) });

    if (!branch) {
      return NextResponse.json(
        { error: 'Branch not found' },
        { status: 404 }
      );
    }

    const formattedBranch = {
      id: branch._id.toString(),
      name: branch.name || branch.branchName || '',
      branchName: branch.branchName || branch.name || '',
      address: branch.address || '',
      phone: branch.phone || '',
      email: branch.email || '',
      manager: branch.manager || '',
      status: branch.status || 'active',
      created_at: branch.created_at || branch._id.getTimestamp().toISOString(),
    };

    return NextResponse.json({ branch: formattedBranch }, { status: 200 });
  } catch (error) {
    console.error('Error fetching branch:', error);
    return NextResponse.json(
      { error: 'Failed to fetch branch', message: error.message },
      { status: 500 }
    );
  }
}

// PUT update branch
export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid branch ID' },
        { status: 400 }
      );
    }

    const db = await getDb();
    const branchesCollection = db.collection('branches');

    // Check if branch exists
    const existingBranch = await branchesCollection.findOne({ _id: new ObjectId(id) });
    if (!existingBranch) {
      return NextResponse.json(
        { error: 'Branch not found' },
        { status: 404 }
      );
    }

    // Check if branch name is being changed and if it's already taken
    if (body.name && body.name !== existingBranch.name && body.name !== existingBranch.branchName) {
      const nameExists = await branchesCollection.findOne({
        $or: [
          { name: body.name },
          { branchName: body.name }
        ],
        _id: { $ne: new ObjectId(id) },
      });
      if (nameExists) {
        return NextResponse.json(
          { error: 'Branch name already exists' },
          { status: 400 }
        );
      }
    }

    // Update branch
    const updateData = {
      updated_at: new Date(),
    };

    if (body.name !== undefined) {
      updateData.name = body.name;
      updateData.branchName = body.name; // Keep both for compatibility
    }
    if (body.address !== undefined) updateData.address = body.address;
    if (body.phone !== undefined) updateData.phone = body.phone;
    if (body.email !== undefined) updateData.email = body.email;
    if (body.manager !== undefined) updateData.manager = body.manager;
    if (body.status !== undefined) updateData.status = body.status;

    await branchesCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    // Fetch updated branch
    const updatedBranch = await branchesCollection.findOne({ _id: new ObjectId(id) });

    const formattedBranch = {
      id: updatedBranch._id.toString(),
      name: updatedBranch.name || updatedBranch.branchName || '',
      branchName: updatedBranch.branchName || updatedBranch.name || '',
      address: updatedBranch.address || '',
      phone: updatedBranch.phone || '',
      email: updatedBranch.email || '',
      manager: updatedBranch.manager || '',
      status: updatedBranch.status || 'active',
      created_at: updatedBranch.created_at || updatedBranch._id.getTimestamp().toISOString(),
    };

    return NextResponse.json(
      { message: 'Branch updated successfully', branch: formattedBranch },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating branch:', error);
    return NextResponse.json(
      { error: 'Failed to update branch', message: error.message },
      { status: 500 }
    );
  }
}

// DELETE branch
export async function DELETE(request, { params }) {
  try {
    const { id } = params;

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid branch ID' },
        { status: 400 }
      );
    }

    const db = await getDb();
    const branchesCollection = db.collection('branches');

    // Check if branch exists
    const existingBranch = await branchesCollection.findOne({ _id: new ObjectId(id) });
    if (!existingBranch) {
      return NextResponse.json(
        { error: 'Branch not found' },
        { status: 404 }
      );
    }

    // Soft delete - set status to inactive instead of deleting
    await branchesCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: { status: 'inactive', updated_at: new Date() } }
    );

    return NextResponse.json(
      { message: 'Branch deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting branch:', error);
    return NextResponse.json(
      { error: 'Failed to delete branch', message: error.message },
      { status: 500 }
    );
  }
}

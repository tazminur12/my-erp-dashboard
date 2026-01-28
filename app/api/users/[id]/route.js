import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../../lib/auth';
import { getDb } from '../../../../lib/mongodb';

// GET user details
export async function GET(request, { params }) {
  try {
    const resolvedParams = params instanceof Promise ? await params : params;
    const { id } = resolvedParams;

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid user ID' },
        { status: 400 }
      );
    }

    const db = await getDb();
    const usersCollection = db.collection('users');

    const user = await usersCollection.findOne(
      { _id: new ObjectId(id) },
      { projection: { password: 0 } }
    );

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check permissions
    const session = await getServerSession(authOptions);
    const currentUserRole = session?.user?.role;

    // If user is not super_admin and tries to view a super_admin
    if (currentUserRole !== 'super_admin' && user.role === 'super_admin') {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    const formattedUser = {
      id: user._id.toString(),
      name: user.name || user.email?.split('@')[0] || 'Unknown',
      email: user.email,
      phone: user.phone || 'N/A',
      role: user.role || 'user',
      branchId: user.branchId || '',
      branchName: user.branchName || '',
      status: user.status || 'active',
      image: user.image || null,
      created_at: user.created_at || user._id.getTimestamp().toISOString(),
      updated_at: user.updated_at || null,
    };

    return NextResponse.json(
      { user: formattedUser },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user', message: error.message },
      { status: 500 }
    );
  }
}

// PUT update user
export async function PUT(request, { params }) {
  try {
    const resolvedParams = params instanceof Promise ? await params : params;
    const { id } = resolvedParams;
    const body = await request.json();
    const { name, email, phone, role, branchId, branchName, employeeId } = body;

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid user ID' },
        { status: 400 }
      );
    }

    const db = await getDb();
    const usersCollection = db.collection('users');

    // Check if user exists
    const existingUser = await usersCollection.findOne({ _id: new ObjectId(id) });
    if (!existingUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check permissions
    const session = await getServerSession(authOptions);
    const currentUserRole = session?.user?.role;

    // If user is not super_admin and tries to update a super_admin
    if (currentUserRole !== 'super_admin' && existingUser.role === 'super_admin') {
      return NextResponse.json(
        { error: 'Access denied. You cannot modify a Super Admin.' },
        { status: 403 }
      );
    }

    // Check if email is being changed and if it's already taken
    if (email && email !== existingUser.email) {
      const emailExists = await usersCollection.findOne({ email, _id: { $ne: new ObjectId(id) } });
      if (emailExists) {
        return NextResponse.json(
          { error: 'Email already in use by another user' },
          { status: 400 }
        );
      }
    }

    // Update user
    const updateData = {
      updated_at: new Date(),
    };

    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (phone !== undefined) updateData.phone = phone;
    if (role !== undefined) updateData.role = role;
    if (branchId !== undefined) updateData.branchId = branchId;
    if (branchName !== undefined) updateData.branchName = branchName;
    if (employeeId !== undefined) updateData.employeeId = employeeId;

    await usersCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    // Fetch updated user
    const updatedUser = await usersCollection.findOne(
      { _id: new ObjectId(id) },
      { projection: { password: 0 } }
    );

    const formattedUser = {
      id: updatedUser._id.toString(),
      name: updatedUser.name || updatedUser.email?.split('@')[0] || 'Unknown',
      email: updatedUser.email,
      phone: updatedUser.phone || 'N/A',
      role: updatedUser.role || 'user',
      branchId: updatedUser.branchId || '',
      branchName: updatedUser.branchName || '',
      employeeId: updatedUser.employeeId || null,
      status: updatedUser.status || 'active',
      created_at: updatedUser.created_at || updatedUser._id.getTimestamp().toISOString(),
    };

    return NextResponse.json(
      { message: 'User updated successfully', user: formattedUser },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: 'Failed to update user', message: error.message },
      { status: 500 }
    );
  }
}

// DELETE user
export async function DELETE(request, { params }) {
  try {
    const resolvedParams = params instanceof Promise ? await params : params;
    const { id } = resolvedParams;

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid user ID' },
        { status: 400 }
      );
    }

    const db = await getDb();
    const usersCollection = db.collection('users');

    // Check if user exists
    const existingUser = await usersCollection.findOne({ _id: new ObjectId(id) });
    if (!existingUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check permissions
    const session = await getServerSession(authOptions);
    const currentUserRole = session?.user?.role;

    // If user is not super_admin and tries to delete a super_admin
    if (currentUserRole !== 'super_admin' && existingUser.role === 'super_admin') {
      return NextResponse.json(
        { error: 'Access denied. You cannot delete a Super Admin.' },
        { status: 403 }
      );
    }

    // Delete user
    await usersCollection.deleteOne({ _id: new ObjectId(id) });

    return NextResponse.json(
      { message: 'User deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { error: 'Failed to delete user', message: error.message },
      { status: 500 }
    );
  }
}

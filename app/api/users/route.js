import { NextResponse } from 'next/server';
import { getDb } from '../../../lib/mongodb';
import bcrypt from 'bcryptjs';

// GET all users
export async function GET() {
  try {
    const db = await getDb();
    const usersCollection = db.collection('users');

    const users = await usersCollection
      .find({})
      .project({ password: 0 }) // Exclude password from results
      .sort({ created_at: -1 })
      .toArray();

    // Format users for frontend
    const formattedUsers = users.map((user) => ({
      id: user._id.toString(),
      name: user.name || user.email?.split('@')[0] || 'Unknown',
      email: user.email,
      phone: user.phone || 'N/A',
      role: user.role || 'user',
      branchId: user.branchId || '',
      branchName: user.branchName || '',
      status: user.status || 'active',
      image: user.image || user.profileImage || user.avatar || null,
      created_at: user.created_at || user._id.getTimestamp().toISOString(),
    }));

    return NextResponse.json({ users: formattedUsers }, { status: 200 });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users', message: error.message },
      { status: 500 }
    );
  }
}

// POST create new user
export async function POST(request) {
  try {
    const body = await request.json();
    const { name, email, phone, role, branchId, branchName, password } = body;

    // Validation
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    if (!branchId) {
      return NextResponse.json(
        { error: 'Branch is required' },
        { status: 400 }
      );
    }

    const db = await getDb();
    const usersCollection = db.collection('users');

    // Check if user already exists
    const existingUser = await usersCollection.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = {
      name: name || email.split('@')[0],
      email,
      phone: phone || '',
      role: role || 'reservation',
      branchId: branchId || '',
      branchName: branchName || '',
      password: hashedPassword,
      status: 'active',
      created_at: new Date(),
      updated_at: new Date(),
    };

    const result = await usersCollection.insertOne(newUser);

    // Return user without password
    const createdUser = {
      id: result.insertedId.toString(),
      name: newUser.name,
      email: newUser.email,
      phone: newUser.phone,
      role: newUser.role,
      branchId: newUser.branchId,
      branchName: newUser.branchName,
      status: newUser.status,
      created_at: newUser.created_at.toISOString(),
    };

    return NextResponse.json(
      { message: 'User created successfully', user: createdUser },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { error: 'Failed to create user', message: error.message },
      { status: 500 }
    );
  }
}

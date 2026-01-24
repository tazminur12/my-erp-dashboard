import { NextResponse } from 'next/server';
import { getSession } from '../../../lib/auth';
import { getDb } from '../../../lib/mongodb';
import { ObjectId } from 'mongodb';

// GET current user profile
export async function GET() {
  try {
    const session = await getSession();
    
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Please login to view your profile' },
        { status: 401 }
      );
    }

    const db = await getDb();
    const usersCollection = db.collection('users');

    const user = await usersCollection.findOne(
      { _id: new ObjectId(session.user.id) },
      { projection: { password: 0 } }
    );

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const formattedUser = {
      id: user._id.toString(),
      name: user.name || user.email?.split('@')[0] || 'Unknown',
      email: user.email,
      phone: user.phone || '',
      role: user.role || 'user',
      status: user.status || 'active',
      image: user.image || user.profileImage || user.avatar || null,
      createdAt: user.created_at ? user.created_at.toISOString() : user._id.getTimestamp().toISOString(),
      updatedAt: user.updated_at ? user.updated_at.toISOString() : null,
    };

    return NextResponse.json({
      success: true,
      user: formattedUser,
    }, { status: 200 });
  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json(
      { error: 'Failed to fetch profile', message: error.message },
      { status: 500 }
    );
  }
}

// PUT update current user profile
export async function PUT(request) {
  try {
    const session = await getSession();
    
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Please login to update your profile' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, phone, image } = body;

    const db = await getDb();
    const usersCollection = db.collection('users');

    // Check if user exists
    const existingUser = await usersCollection.findOne({
      _id: new ObjectId(session.user.id)
    });

    if (!existingUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Update user
    const updateData = {
      updated_at: new Date(),
    };

    if (name !== undefined && name.trim()) {
      updateData.name = name.trim();
    }
    if (phone !== undefined) {
      updateData.phone = phone.trim() || '';
    }
    if (image !== undefined && image) {
      // Only accept Cloudinary URLs - reject base64 to avoid session/cookie size issues
      if (image.startsWith('data:image')) {
        return NextResponse.json(
          { error: 'Base64 images are not allowed. Please upload via Cloudinary (profile photo).' },
          { status: 400 }
        );
      }
      if (!image.startsWith('https://res.cloudinary.com/')) {
        return NextResponse.json(
          { error: 'Invalid image URL. Please use Cloudinary upload.' },
          { status: 400 }
        );
      }
      
      updateData.image = image;
      updateData.profileImage = image;
      updateData.avatar = image;
    }

    await usersCollection.updateOne(
      { _id: new ObjectId(session.user.id) },
      { $set: updateData }
    );

    // Fetch updated user
    const updatedUser = await usersCollection.findOne(
      { _id: new ObjectId(session.user.id) },
      { projection: { password: 0 } }
    );

    const formattedUser = {
      id: updatedUser._id.toString(),
      name: updatedUser.name || updatedUser.email?.split('@')[0] || 'Unknown',
      email: updatedUser.email,
      phone: updatedUser.phone || '',
      role: updatedUser.role || 'user',
      status: updatedUser.status || 'active',
      image: updatedUser.image || updatedUser.profileImage || updatedUser.avatar || null,
      createdAt: updatedUser.created_at ? updatedUser.created_at.toISOString() : updatedUser._id.getTimestamp().toISOString(),
      updatedAt: updateData.updated_at.toISOString(),
    };

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      user: formattedUser,
    }, { status: 200 });
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json(
      { error: 'Failed to update profile', message: error.message },
      { status: 500 }
    );
  }
}

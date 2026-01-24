import { NextResponse } from 'next/server';
import { getDb } from '../../../../../lib/mongodb';
import { ObjectId } from 'mongodb';

// GET single cattle
export async function GET(request, { params }) {
  try {
    const resolvedParams = await params;
    const { id } = resolvedParams;

    if (!id) {
      return NextResponse.json(
        { error: 'Cattle ID is required' },
        { status: 400 }
      );
    }

    const db = await getDb();
    const cattleCollection = db.collection('cattle');

    let cattle;
    try {
      cattle = await cattleCollection.findOne({ _id: new ObjectId(id) });
    } catch (err) {
      return NextResponse.json(
        { error: 'Invalid cattle ID' },
        { status: 400 }
      );
    }

    if (!cattle) {
      return NextResponse.json(
        { error: 'Cattle not found' },
        { status: 404 }
      );
    }

    // Format cattle for frontend
    const formattedCattle = {
      id: cattle._id.toString(),
      _id: cattle._id.toString(),
      name: cattle.name || '',
      gender: cattle.gender || '',
      breed: cattle.breed || '',
      age: cattle.age || 0,
      weight: Number(cattle.weight) || 0,
      purchaseDate: cattle.purchaseDate || '',
      healthStatus: cattle.healthStatus || 'healthy',
      image: cattle.image || '',
      imagePublicId: cattle.imagePublicId || '',
      color: cattle.color || '',
      tagNumber: cattle.tagNumber || '',
      purchasePrice: Number(cattle.purchasePrice) || 0,
      vendor: cattle.vendor || '',
      notes: cattle.notes || '',
      createdAt: cattle.createdAt ? cattle.createdAt.toISOString() : cattle._id.getTimestamp().toISOString(),
      updatedAt: cattle.updatedAt ? cattle.updatedAt.toISOString() : cattle.createdAt ? cattle.createdAt.toISOString() : cattle._id.getTimestamp().toISOString(),
    };

    return NextResponse.json({
      success: true,
      cattle: formattedCattle,
    }, { status: 200 });
  } catch (error) {
    console.error('Error fetching cattle:', error);
    return NextResponse.json(
      { error: 'Failed to fetch cattle', message: error.message },
      { status: 500 }
    );
  }
}

// PUT update cattle
export async function PUT(request, { params }) {
  try {
    const resolvedParams = await params;
    const { id } = resolvedParams;
    const body = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: 'Cattle ID is required' },
        { status: 400 }
      );
    }

    const db = await getDb();
    const cattleCollection = db.collection('cattle');

    // Find cattle
    let cattle;
    try {
      cattle = await cattleCollection.findOne({ _id: new ObjectId(id) });
    } catch (err) {
      return NextResponse.json(
        { error: 'Invalid cattle ID' },
        { status: 400 }
      );
    }

    if (!cattle) {
      return NextResponse.json(
        { error: 'Cattle not found' },
        { status: 404 }
      );
    }

    // Prepare update data
    const updateData = {
      name: body.name?.trim() || cattle.name || '',
      breed: body.breed || cattle.breed || '',
      age: body.age !== undefined ? Number(body.age) : (cattle.age || 0),
      weight: body.weight !== undefined ? Number(body.weight) : (Number(cattle.weight) || 0),
      purchaseDate: body.purchaseDate || cattle.purchaseDate || '',
      healthStatus: body.healthStatus || cattle.healthStatus || 'healthy',
      image: body.image !== undefined ? body.image : (cattle.image || ''),
      imagePublicId: body.imagePublicId !== undefined ? body.imagePublicId : (cattle.imagePublicId || ''),
      gender: body.gender || cattle.gender || 'female',
      color: body.color || cattle.color || '',
      tagNumber: body.tagNumber || cattle.tagNumber || '',
      purchasePrice: body.purchasePrice !== undefined ? Number(body.purchasePrice) : (Number(cattle.purchasePrice) || 0),
      vendor: body.vendor || cattle.vendor || '',
      notes: body.notes || cattle.notes || '',
      updatedAt: new Date(),
    };

    // Update cattle
    await cattleCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    // Fetch updated cattle
    const updatedCattle = await cattleCollection.findOne({
      _id: new ObjectId(id)
    });

    // Format cattle for frontend
    const formattedCattle = {
      id: updatedCattle._id.toString(),
      _id: updatedCattle._id.toString(),
      ...updateData,
      createdAt: updatedCattle.createdAt.toISOString(),
      updatedAt: updateData.updatedAt.toISOString(),
    };

    return NextResponse.json({
      success: true,
      message: 'Cattle updated successfully',
      cattle: formattedCattle,
    }, { status: 200 });
  } catch (error) {
    console.error('Error updating cattle:', error);
    return NextResponse.json(
      { error: 'Failed to update cattle', message: error.message },
      { status: 500 }
    );
  }
}

// DELETE cattle
export async function DELETE(request, { params }) {
  try {
    const resolvedParams = await params;
    const { id } = resolvedParams;

    if (!id) {
      return NextResponse.json(
        { error: 'Cattle ID is required' },
        { status: 400 }
      );
    }

    const db = await getDb();
    const cattleCollection = db.collection('cattle');

    // Find and delete cattle
    let result;
    try {
      result = await cattleCollection.deleteOne({ _id: new ObjectId(id) });
    } catch (err) {
      return NextResponse.json(
        { error: 'Invalid cattle ID' },
        { status: 400 }
      );
    }

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: 'Cattle not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Cattle deleted successfully',
    }, { status: 200 });
  } catch (error) {
    console.error('Error deleting cattle:', error);
    return NextResponse.json(
      { error: 'Failed to delete cattle', message: error.message },
      { status: 500 }
    );
  }
}

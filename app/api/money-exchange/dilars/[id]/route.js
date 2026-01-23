import { NextResponse } from 'next/server';
import { getDb } from '../../../../../lib/mongodb';
import { ObjectId } from 'mongodb';

// GET single dilar by ID
export async function GET(request, { params }) {
  try {
    const resolvedParams = params instanceof Promise ? await params : params;
    const { id } = resolvedParams;

    if (!id) {
      return NextResponse.json(
        { error: 'Dilar ID is required' },
        { status: 400 }
      );
    }

    const db = await getDb();
    const dilarsCollection = db.collection('dilars');

    let dilar;
    if (ObjectId.isValid(id)) {
      dilar = await dilarsCollection.findOne({ _id: new ObjectId(id) });
    } else {
      // Try finding by contactNo if ObjectId is invalid
      dilar = await dilarsCollection.findOne({ contactNo: id });
    }

    if (!dilar) {
      return NextResponse.json(
        { error: 'Dilar not found' },
        { status: 404 }
      );
    }

    const formattedDilar = {
      id: dilar._id.toString(),
      _id: dilar._id.toString(),
      contactNo: dilar.contactNo || '',
      ownerName: dilar.ownerName || '',
      tradeName: dilar.tradeName || '',
      tradeLocation: dilar.tradeLocation || '',
      nid: dilar.nid || '',
      logo: dilar.logo || dilar.profilePicture || '',
      status: dilar.status || 'active',
      createdAt: dilar.createdAt || dilar.created_at || dilar._id.getTimestamp(),
      updatedAt: dilar.updatedAt || dilar.updated_at || dilar.createdAt || dilar._id.getTimestamp(),
    };

    return NextResponse.json({
      dilar: formattedDilar,
      data: formattedDilar,
    }, { status: 200 });
  } catch (error) {
    console.error('Error fetching dilar:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dilar', message: error.message },
      { status: 500 }
    );
  }
}

// PUT update dilar
export async function PUT(request, { params }) {
  try {
    const resolvedParams = params instanceof Promise ? await params : params;
    const { id } = resolvedParams;
    const body = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: 'Dilar ID is required' },
        { status: 400 }
      );
    }

    // Validation
    if (!body.ownerName || !body.ownerName.trim()) {
      return NextResponse.json(
        { error: 'Owner name is required' },
        { status: 400 }
      );
    }

    if (!body.contactNo || !body.contactNo.trim()) {
      return NextResponse.json(
        { error: 'Contact number is required' },
        { status: 400 }
      );
    }

    if (!body.tradeLocation || !body.tradeLocation.trim()) {
      return NextResponse.json(
        { error: 'Trade location is required' },
        { status: 400 }
      );
    }

    const db = await getDb();
    const dilarsCollection = db.collection('dilars');

    // Find dilar
    let existingDilar;
    if (ObjectId.isValid(id)) {
      existingDilar = await dilarsCollection.findOne({ _id: new ObjectId(id) });
    } else {
      existingDilar = await dilarsCollection.findOne({ contactNo: id });
    }

    if (!existingDilar) {
      return NextResponse.json(
        { error: 'Dilar not found' },
        { status: 404 }
      );
    }

    // Check if contact number is being changed and if it conflicts with another dilar
    if (body.contactNo.trim() !== existingDilar.contactNo) {
      const conflictDilar = await dilarsCollection.findOne({
        contactNo: body.contactNo.trim(),
        _id: { $ne: existingDilar._id }
      });

      if (conflictDilar) {
        return NextResponse.json(
          { error: 'A dilar with this contact number already exists' },
          { status: 400 }
        );
      }
    }

    const updateData = {
      ownerName: body.ownerName.trim(),
      contactNo: body.contactNo.trim(),
      tradeLocation: body.tradeLocation.trim(),
      logo: body.logo || '',
      nid: body.nid || '',
      tradeName: body.tradeName || '',
      updatedAt: new Date(),
    };

    const result = await dilarsCollection.updateOne(
      { _id: existingDilar._id },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'Dilar not found' },
        { status: 404 }
      );
    }

    const updatedDilar = await dilarsCollection.findOne({ _id: existingDilar._id });

    return NextResponse.json({
      dilar: {
        ...updatedDilar,
        id: updatedDilar._id.toString(),
        _id: updatedDilar._id.toString(),
      },
      message: 'Dilar updated successfully',
    }, { status: 200 });
  } catch (error) {
    console.error('Error updating dilar:', error);
    return NextResponse.json(
      { error: 'Failed to update dilar', message: error.message },
      { status: 500 }
    );
  }
}

// DELETE dilar
export async function DELETE(request, { params }) {
  try {
    const resolvedParams = params instanceof Promise ? await params : params;
    const { id } = resolvedParams;

    if (!id) {
      return NextResponse.json(
        { error: 'Dilar ID is required' },
        { status: 400 }
      );
    }

    const db = await getDb();
    const dilarsCollection = db.collection('dilars');

    // Find and delete dilar
    let result;
    if (ObjectId.isValid(id)) {
      result = await dilarsCollection.deleteOne({ _id: new ObjectId(id) });
    } else {
      result = await dilarsCollection.deleteOne({ contactNo: id });
    }

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: 'Dilar not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Dilar deleted successfully',
    }, { status: 200 });
  } catch (error) {
    console.error('Error deleting dilar:', error);
    return NextResponse.json(
      { error: 'Failed to delete dilar', message: error.message },
      { status: 500 }
    );
  }
}

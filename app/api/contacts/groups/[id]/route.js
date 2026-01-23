import { NextResponse } from 'next/server';
import { getDb } from '../../../../../lib/mongodb';
import { ObjectId } from 'mongodb';

// GET single group
export async function GET(request, { params }) {
  try {
    const resolvedParams = await params;
    const { id } = resolvedParams;

    if (!id) {
      return NextResponse.json(
        { error: 'Group ID is required' },
        { status: 400 }
      );
    }

    const db = await getDb();
    const groupsCollection = db.collection('contact_groups');

    let group;
    try {
      group = await groupsCollection.findOne({ _id: new ObjectId(id) });
    } catch (err) {
      group = await groupsCollection.findOne({ id: id });
    }

    if (!group) {
      return NextResponse.json(
        { error: 'Group not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      group: {
        ...group,
        id: group._id.toString(),
      },
    }, { status: 200 });
  } catch (error) {
    console.error('Error fetching group:', error);
    return NextResponse.json(
      { error: 'Failed to fetch group', message: error.message },
      { status: 500 }
    );
  }
}

// PUT update group
export async function PUT(request, { params }) {
  try {
    const resolvedParams = await params;
    const { id } = resolvedParams;
    const body = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: 'Group ID is required' },
        { status: 400 }
      );
    }

    if (!body.name || !body.name.trim()) {
      return NextResponse.json(
        { error: 'Group name is required' },
        { status: 400 }
      );
    }

    const db = await getDb();
    const groupsCollection = db.collection('contact_groups');

    // Check if another group with same name exists
    const existingGroup = await groupsCollection.findOne({
      name: { $regex: new RegExp(`^${body.name.trim()}$`, 'i') },
      _id: { $ne: new ObjectId(id) }
    });

    if (existingGroup) {
      return NextResponse.json(
        { error: 'A group with this name already exists' },
        { status: 400 }
      );
    }

    const updateData = {
      name: body.name.trim(),
      description: body.description || '',
      color: body.color || 'blue',
      status: body.status || 'active',
      updatedAt: new Date(),
    };

    let result;
    try {
      result = await groupsCollection.updateOne(
        { _id: new ObjectId(id) },
        { $set: updateData }
      );
    } catch (err) {
      result = await groupsCollection.updateOne(
        { id: id },
        { $set: updateData }
      );
    }

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'Group not found' },
        { status: 404 }
      );
    }

    const updatedGroup = await groupsCollection.findOne(
      { _id: new ObjectId(id) }
    );

    return NextResponse.json({
      group: {
        ...updatedGroup,
        id: updatedGroup._id.toString(),
      },
    }, { status: 200 });
  } catch (error) {
    console.error('Error updating group:', error);
    return NextResponse.json(
      { error: 'Failed to update group', message: error.message },
      { status: 500 }
    );
  }
}

// DELETE group
export async function DELETE(request, { params }) {
  try {
    const resolvedParams = await params;
    const { id } = resolvedParams;

    if (!id) {
      return NextResponse.json(
        { error: 'Group ID is required' },
        { status: 400 }
      );
    }

    const db = await getDb();
    const groupsCollection = db.collection('contact_groups');

    let result;
    try {
      result = await groupsCollection.deleteOne({ _id: new ObjectId(id) });
    } catch (err) {
      result = await groupsCollection.deleteOne({ id: id });
    }

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: 'Group not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Group deleted successfully',
    }, { status: 200 });
  } catch (error) {
    console.error('Error deleting group:', error);
    return NextResponse.json(
      { error: 'Failed to delete group', message: error.message },
      { status: 500 }
    );
  }
}

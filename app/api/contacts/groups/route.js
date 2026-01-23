import { NextResponse } from 'next/server';
import { getDb } from '../../../../lib/mongodb';

// GET all contact groups
export async function GET(request) {
  try {
    const db = await getDb();
    const groupsCollection = db.collection('contact_groups');

    const groups = await groupsCollection
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    // Format groups for frontend
    const formattedGroups = groups.map(group => ({
      id: group._id.toString(),
      _id: group._id.toString(),
      name: group.name || '',
      description: group.description || '',
      color: group.color || 'blue',
      contactCount: group.contactCount || 0,
      status: group.status || 'active',
      createdDate: group.createdAt ? group.createdAt.toISOString() : group._id.getTimestamp().toISOString(),
      createdAt: group.createdAt ? group.createdAt.toISOString() : group._id.getTimestamp().toISOString(),
      lastUpdated: group.updatedAt ? group.updatedAt.toISOString() : group.createdAt ? group.createdAt.toISOString() : group._id.getTimestamp().toISOString(),
      updatedAt: group.updatedAt ? group.updatedAt.toISOString() : group.createdAt ? group.createdAt.toISOString() : group._id.getTimestamp().toISOString(),
    }));

    return NextResponse.json({
      groups: formattedGroups,
      data: formattedGroups,
    }, { status: 200 });
  } catch (error) {
    console.error('Error fetching groups:', error);
    return NextResponse.json(
      { error: 'Failed to fetch groups', message: error.message },
      { status: 500 }
    );
  }
}

// POST create new contact group
export async function POST(request) {
  try {
    const body = await request.json();

    // Validation
    if (!body.name || !body.name.trim()) {
      return NextResponse.json(
        { error: 'Group name is required' },
        { status: 400 }
      );
    }

    const db = await getDb();
    const groupsCollection = db.collection('contact_groups');

    // Check if group with same name exists
    const existingGroup = await groupsCollection.findOne({
      name: { $regex: new RegExp(`^${body.name.trim()}$`, 'i') }
    });

    if (existingGroup) {
      return NextResponse.json(
        { error: 'A group with this name already exists' },
        { status: 400 }
      );
    }

    const group = {
      name: body.name.trim(),
      description: body.description || '',
      color: body.color || 'blue',
      contactCount: 0,
      status: body.status || 'active',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await groupsCollection.insertOne(group);

    return NextResponse.json({
      group: {
        ...group,
        id: result.insertedId.toString(),
        _id: result.insertedId.toString(),
      },
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating group:', error);
    return NextResponse.json(
      { error: 'Failed to create group', message: error.message },
      { status: 500 }
    );
  }
}

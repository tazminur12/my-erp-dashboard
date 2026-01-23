import { NextResponse } from 'next/server';
import { getDb } from '../../../../lib/mongodb';
import { ObjectId } from 'mongodb';

// GET single contact
export async function GET(request, { params }) {
  try {
    const resolvedParams = await params;
    const { id } = resolvedParams;

    if (!id) {
      return NextResponse.json(
        { error: 'Contact ID is required' },
        { status: 400 }
      );
    }

    const db = await getDb();
    const contactsCollection = db.collection('contacts');

    let contact;
    try {
      contact = await contactsCollection.findOne({ _id: new ObjectId(id) });
    } catch (err) {
      contact = await contactsCollection.findOne({ id: id });
    }

    if (!contact) {
      return NextResponse.json(
        { error: 'Contact not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      contact: {
        ...contact,
        id: contact._id.toString(),
      },
    }, { status: 200 });
  } catch (error) {
    console.error('Error fetching contact:', error);
    return NextResponse.json(
      { error: 'Failed to fetch contact', message: error.message },
      { status: 500 }
    );
  }
}

// DELETE contact
export async function DELETE(request, { params }) {
  try {
    const resolvedParams = await params;
    const { id } = resolvedParams;

    if (!id) {
      return NextResponse.json(
        { error: 'Contact ID is required' },
        { status: 400 }
      );
    }

    const db = await getDb();
    const contactsCollection = db.collection('contacts');

    let result;
    try {
      result = await contactsCollection.deleteOne({ _id: new ObjectId(id) });
    } catch (err) {
      result = await contactsCollection.deleteOne({ id: id });
    }

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: 'Contact not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Contact deleted successfully',
    }, { status: 200 });
  } catch (error) {
    console.error('Error deleting contact:', error);
    return NextResponse.json(
      { error: 'Failed to delete contact', message: error.message },
      { status: 500 }
    );
  }
}

// PUT update contact
export async function PUT(request, { params }) {
  try {
    const resolvedParams = await params;
    const { id } = resolvedParams;
    const body = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: 'Contact ID is required' },
        { status: 400 }
      );
    }

    const db = await getDb();
    const contactsCollection = db.collection('contacts');

    const updateData = {
      ...body,
      updatedAt: new Date(),
    };

    let result;
    try {
      result = await contactsCollection.updateOne(
        { _id: new ObjectId(id) },
        { $set: updateData }
      );
    } catch (err) {
      result = await contactsCollection.updateOne(
        { id: id },
        { $set: updateData }
      );
    }

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'Contact not found' },
        { status: 404 }
      );
    }

    const updatedContact = await contactsCollection.findOne(
      { _id: new ObjectId(id) }
    );

    return NextResponse.json({
      contact: {
        ...updatedContact,
        id: updatedContact._id.toString(),
      },
    }, { status: 200 });
  } catch (error) {
    console.error('Error updating contact:', error);
    return NextResponse.json(
      { error: 'Failed to update contact', message: error.message },
      { status: 500 }
    );
  }
}

import { NextResponse } from 'next/server';
import { getDb } from '../../../../../lib/mongodb';
import { ObjectId } from 'mongodb';

// PUT update API config
export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();
    
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid ID format' }, { status: 400 });
    }

    const { 
      ipccName, 
      iataCode, 
      gds, 
      businessName, 
      contact, 
      email, 
      commission, 
      isPercent, 
      miscCharge, 
      configJson 
    } = body;

    const db = await getDb();
    const collection = db.collection('api_configs');

    const updateData = {
      ipccName,
      iataCode,
      gds,
      businessName,
      contact,
      email,
      commission,
      isPercent,
      miscCharge,
      configJson,
      updated_at: new Date(),
    };

    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Config not found' }, { status: 404 });
    }

    return NextResponse.json(
      { message: 'API Configuration updated successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating API config:', error);
    return NextResponse.json(
      { error: 'Failed to update API config', message: error.message },
      { status: 500 }
    );
  }
}

// DELETE API config
export async function DELETE(request, { params }) {
  try {
    const { id } = params;

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid ID format' }, { status: 400 });
    }

    const db = await getDb();
    const collection = db.collection('api_configs');

    const result = await collection.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Config not found' }, { status: 404 });
    }

    return NextResponse.json(
      { message: 'API Configuration deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting API config:', error);
    return NextResponse.json(
      { error: 'Failed to delete API config', message: error.message },
      { status: 500 }
    );
  }
}

import { NextResponse } from 'next/server';
import { getDb } from '../../../../lib/mongodb';
import { ObjectId } from 'mongodb';

// GET single airport by ID
export async function GET(request, { params }) {
  try {
    const resolvedParams = params instanceof Promise ? await params : params;
    const { id } = resolvedParams;

    if (!id) {
      return NextResponse.json(
        { error: 'Airport ID is required' },
        { status: 400 }
      );
    }

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid airport ID format' },
        { status: 400 }
      );
    }

    const db = await getDb();
    const airportsCollection = db.collection('airports');

    const airport = await airportsCollection.findOne({
      _id: new ObjectId(id)
    });

    if (!airport) {
      return NextResponse.json(
        { error: 'Airport not found' },
        { status: 404 }
      );
    }

    // Format airport for frontend
    const formattedAirport = {
      id: airport._id.toString(),
      _id: airport._id.toString(),
      name: airport.name || '',
      code: airport.code || '',
      city: airport.city || '',
      country: airport.country || '',
      timezone: airport.timezone || '',
      createdAt: airport.createdAt ? airport.createdAt.toISOString() : new Date().toISOString(),
      updatedAt: airport.updatedAt ? airport.updatedAt.toISOString() : new Date().toISOString(),
    };

    return NextResponse.json(
      { airport: formattedAirport, data: formattedAirport },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching airport:', error);
    return NextResponse.json(
      { error: 'Failed to fetch airport', message: error.message },
      { status: 500 }
    );
  }
}

// PUT update airport
export async function PUT(request, { params }) {
  try {
    const resolvedParams = params instanceof Promise ? await params : params;
    const { id } = resolvedParams;
    const body = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: 'Airport ID is required' },
        { status: 400 }
      );
    }

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid airport ID format' },
        { status: 400 }
      );
    }

    // Validation
    if (!body.name || !body.name.trim()) {
      return NextResponse.json(
        { error: 'Airport name is required' },
        { status: 400 }
      );
    }

    if (!body.code || !body.code.trim()) {
      return NextResponse.json(
        { error: 'Airport code is required' },
        { status: 400 }
      );
    }

    const db = await getDb();
    const airportsCollection = db.collection('airports');

    // Check if airport exists
    const existingAirport = await airportsCollection.findOne({
      _id: new ObjectId(id)
    });

    if (!existingAirport) {
      return NextResponse.json(
        { error: 'Airport not found' },
        { status: 404 }
      );
    }

    // Check if another airport with same code exists (excluding current)
    const duplicateAirport = await airportsCollection.findOne({
      code: body.code.trim().toUpperCase(),
      _id: { $ne: new ObjectId(id) }
    });
    
    if (duplicateAirport) {
      return NextResponse.json(
        { error: 'Airport with this code already exists' },
        { status: 400 }
      );
    }

    // Update airport
    const updateData = {
      name: body.name.trim(),
      code: body.code.trim().toUpperCase(),
      city: body.city ? body.city.trim() : null,
      country: body.country ? body.country.trim() : null,
      timezone: body.timezone ? body.timezone.trim() : null,
      updatedAt: new Date(),
    };

    await airportsCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    // Fetch updated airport
    const updatedAirport = await airportsCollection.findOne({
      _id: new ObjectId(id)
    });

    // Format airport for frontend
    const formattedAirport = {
      id: updatedAirport._id.toString(),
      _id: updatedAirport._id.toString(),
      name: updatedAirport.name || '',
      code: updatedAirport.code || '',
      city: updatedAirport.city || '',
      country: updatedAirport.country || '',
      timezone: updatedAirport.timezone || '',
      createdAt: updatedAirport.createdAt ? updatedAirport.createdAt.toISOString() : new Date().toISOString(),
      updatedAt: updatedAirport.updatedAt ? updatedAirport.updatedAt.toISOString() : new Date().toISOString(),
    };

    return NextResponse.json(
      { airport: formattedAirport, data: formattedAirport, message: 'Airport updated successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating airport:', error);
    return NextResponse.json(
      { error: 'Failed to update airport', message: error.message },
      { status: 500 }
    );
  }
}

// DELETE airport
export async function DELETE(request, { params }) {
  try {
    const resolvedParams = params instanceof Promise ? await params : params;
    const { id } = resolvedParams;

    if (!id) {
      return NextResponse.json(
        { error: 'Airport ID is required' },
        { status: 400 }
      );
    }

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid airport ID format' },
        { status: 400 }
      );
    }

    const db = await getDb();
    const airportsCollection = db.collection('airports');

    // Check if airport exists
    const existingAirport = await airportsCollection.findOne({
      _id: new ObjectId(id)
    });

    if (!existingAirport) {
      return NextResponse.json(
        { error: 'Airport not found' },
        { status: 404 }
      );
    }

    // Delete airport
    await airportsCollection.deleteOne({
      _id: new ObjectId(id)
    });

    return NextResponse.json(
      { message: 'Airport deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting airport:', error);
    return NextResponse.json(
      { error: 'Failed to delete airport', message: error.message },
      { status: 500 }
    );
  }
}

import { NextResponse } from 'next/server';
import { getDb } from '../../../../lib/mongodb';
import { ObjectId } from 'mongodb';

// GET single airline by ID
export async function GET(request, { params }) {
  try {
    // Handle both sync and async params
    const resolvedParams = params instanceof Promise ? await params : params;
    const { id } = resolvedParams;

    if (!id) {
      return NextResponse.json(
        { error: 'Airline ID is required' },
        { status: 400 }
      );
    }

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid airline ID format' },
        { status: 400 }
      );
    }

    const db = await getDb();
    const airlinesCollection = db.collection('airlines');

    const airline = await airlinesCollection.findOne({
      _id: new ObjectId(id)
    });

    if (!airline) {
      return NextResponse.json(
        { error: 'Airline not found' },
        { status: 404 }
      );
    }

    // Format airline for frontend
    const formattedAirline = {
      id: airline._id.toString(),
      _id: airline._id.toString(),
      airlineId: airline._id.toString(),
      name: airline.name || '',
      code: airline.code || '',
      icao: airline.icao || '',
      fs: airline.fs || '',
      isDomestic: airline.isDomestic || false,
      country: airline.country || '',
      headquarters: airline.headquarters || '',
      phone: airline.phone || '',
      email: airline.email || '',
      website: airline.website || '',
      established: airline.established || '',
      status: airline.status || 'Active',
      routes: airline.routes || 0,
      fleet: airline.fleet || 0,
      logo: airline.logo || '',
      createdAt: airline.createdAt ? airline.createdAt.toISOString() : new Date().toISOString(),
      updatedAt: airline.updatedAt ? airline.updatedAt.toISOString() : new Date().toISOString(),
    };

    return NextResponse.json(
      { airline: formattedAirline, data: formattedAirline },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching airline:', error);
    return NextResponse.json(
      { error: 'Failed to fetch airline', message: error.message },
      { status: 500 }
    );
  }
}

// PUT update airline
export async function PUT(request, { params }) {
  try {
    // Handle both sync and async params
    const resolvedParams = params instanceof Promise ? await params : params;
    const { id } = resolvedParams;
    const body = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: 'Airline ID is required' },
        { status: 400 }
      );
    }

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid airline ID format' },
        { status: 400 }
      );
    }

    // Validation
    if (!body.name || !body.name.trim()) {
      return NextResponse.json(
        { error: 'Airline name is required' },
        { status: 400 }
      );
    }

    if (!body.code || !body.code.trim()) {
      return NextResponse.json(
        { error: 'Airline code is required' },
        { status: 400 }
      );
    }

    // Validate email format if provided
    if (body.email && body.email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(body.email.trim())) {
        return NextResponse.json(
          { error: 'Invalid email format' },
          { status: 400 }
        );
      }
    }

    const db = await getDb();
    const airlinesCollection = db.collection('airlines');

    // Check if airline exists
    const existingAirline = await airlinesCollection.findOne({
      _id: new ObjectId(id)
    });

    if (!existingAirline) {
      return NextResponse.json(
        { error: 'Airline not found' },
        { status: 404 }
      );
    }

    // Check if another airline with same code exists (excluding current)
    const duplicateAirline = await airlinesCollection.findOne({
      code: body.code.trim().toUpperCase(),
      _id: { $ne: new ObjectId(id) }
    });
    
    if (duplicateAirline) {
      return NextResponse.json(
        { error: 'Airline with this code already exists' },
        { status: 400 }
      );
    }

    // Update airline
    const updateData = {
      name: body.name.trim(),
      code: body.code.trim().toUpperCase(),
      country: body.country ? body.country.trim() : null,
      headquarters: body.headquarters ? body.headquarters.trim() : null,
      phone: body.phone ? body.phone.trim() : null,
      email: body.email ? body.email.trim() : null,
      website: body.website ? body.website.trim() : null,
      established: body.established ? body.established.trim() : null,
      status: body.status || 'Active',
      routes: body.routes ? parseInt(body.routes) : 0,
      fleet: body.fleet ? parseInt(body.fleet) : 0,
      logo: body.logo || null,
      updatedAt: new Date(),
    };

    await airlinesCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    // Fetch updated airline
    const updatedAirline = await airlinesCollection.findOne({
      _id: new ObjectId(id)
    });

    // Format airline for frontend
    const formattedAirline = {
      id: updatedAirline._id.toString(),
      _id: updatedAirline._id.toString(),
      airlineId: updatedAirline._id.toString(),
      name: updatedAirline.name || '',
      code: updatedAirline.code || '',
      country: updatedAirline.country || '',
      headquarters: updatedAirline.headquarters || '',
      phone: updatedAirline.phone || '',
      email: updatedAirline.email || '',
      website: updatedAirline.website || '',
      established: updatedAirline.established || '',
      status: updatedAirline.status || 'Active',
      routes: updatedAirline.routes || 0,
      fleet: updatedAirline.fleet || 0,
      logo: updatedAirline.logo || '',
      createdAt: updatedAirline.createdAt ? updatedAirline.createdAt.toISOString() : new Date().toISOString(),
      updatedAt: updatedAirline.updatedAt ? updatedAirline.updatedAt.toISOString() : new Date().toISOString(),
    };

    return NextResponse.json(
      { airline: formattedAirline, data: formattedAirline, message: 'Airline updated successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating airline:', error);
    return NextResponse.json(
      { error: 'Failed to update airline', message: error.message },
      { status: 500 }
    );
  }
}

// DELETE airline
export async function DELETE(request, { params }) {
  try {
    // Handle both sync and async params
    const resolvedParams = params instanceof Promise ? await params : params;
    const { id } = resolvedParams;

    if (!id) {
      return NextResponse.json(
        { error: 'Airline ID is required' },
        { status: 400 }
      );
    }

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid airline ID format' },
        { status: 400 }
      );
    }

    const db = await getDb();
    const airlinesCollection = db.collection('airlines');

    // Check if airline exists
    const existingAirline = await airlinesCollection.findOne({
      _id: new ObjectId(id)
    });

    if (!existingAirline) {
      return NextResponse.json(
        { error: 'Airline not found' },
        { status: 404 }
      );
    }

    // Delete airline
    await airlinesCollection.deleteOne({
      _id: new ObjectId(id)
    });

    return NextResponse.json(
      { message: 'Airline deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting airline:', error);
    return NextResponse.json(
      { error: 'Failed to delete airline', message: error.message },
      { status: 500 }
    );
  }
}

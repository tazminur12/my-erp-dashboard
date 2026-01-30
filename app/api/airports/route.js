import { NextResponse } from 'next/server';
import { getDb } from '../../../lib/mongodb';

// GET all airports with search and pagination
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const searchTerm = searchParams.get('q') || searchParams.get('search') || '';
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 100;

    const db = await getDb();
    const airportsCollection = db.collection('airports');

    // Build query
    const query = {};
    
    if (searchTerm && searchTerm.trim()) {
      const searchRegex = { $regex: searchTerm.trim(), $options: 'i' };
      query.$or = [
        { name: searchRegex },
        { code: searchRegex },
        { city: searchRegex },
        { country: searchRegex }
      ];
    }

    // Get total count for pagination
    const total = await airportsCollection.countDocuments(query);

    // Calculate skip for pagination
    const skip = (page - 1) * limit;

    const airports = await airportsCollection
      .find(query)
      .sort({ name: 1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    // Format airports for frontend
    const formattedAirports = airports.map((airport) => ({
      id: airport._id.toString(),
      _id: airport._id.toString(),
      name: airport.name || '',
      code: airport.code || '',
      city: airport.city || '',
      country: airport.country || '',
      timezone: airport.timezone || '',
      createdAt: airport.createdAt ? airport.createdAt.toISOString() : new Date().toISOString(),
      updatedAt: airport.updatedAt ? airport.updatedAt.toISOString() : new Date().toISOString(),
    }));

    return NextResponse.json(
      {
        airports: formattedAirports,
        data: formattedAirports,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching airports:', error);
    return NextResponse.json(
      { error: 'Failed to fetch airports', message: error.message },
      { status: 500 }
    );
  }
}

// POST create new airport
export async function POST(request) {
  try {
    const body = await request.json();

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

    // Check if airport with same code already exists
    const existingAirport = await airportsCollection.findOne({
      code: body.code.trim().toUpperCase()
    });
    
    if (existingAirport) {
      return NextResponse.json(
        { error: 'Airport with this code already exists' },
        { status: 400 }
      );
    }

    // Create airport
    const airportData = {
      name: body.name.trim(),
      code: body.code.trim().toUpperCase(),
      city: body.city ? body.city.trim() : null,
      country: body.country ? body.country.trim() : null,
      timezone: body.timezone ? body.timezone.trim() : null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await airportsCollection.insertOne(airportData);

    // Fetch created airport
    const createdAirport = await airportsCollection.findOne({
      _id: result.insertedId
    });

    // Format airport for frontend
    const formattedAirport = {
      id: createdAirport._id.toString(),
      _id: createdAirport._id.toString(),
      name: createdAirport.name || '',
      code: createdAirport.code || '',
      city: createdAirport.city || '',
      country: createdAirport.country || '',
      timezone: createdAirport.timezone || '',
      createdAt: createdAirport.createdAt ? createdAirport.createdAt.toISOString() : new Date().toISOString(),
      updatedAt: createdAirport.updatedAt ? createdAirport.updatedAt.toISOString() : new Date().toISOString(),
    };

    return NextResponse.json(
      { airport: formattedAirport, data: formattedAirport, message: 'Airport created successfully' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating airport:', error);
    return NextResponse.json(
      { error: 'Failed to create airport', message: error.message },
      { status: 500 }
    );
  }
}

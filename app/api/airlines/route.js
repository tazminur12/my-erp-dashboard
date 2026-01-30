import { NextResponse } from 'next/server';
import { getDb } from '../../../lib/mongodb';

// GET all airlines with search and filters
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const searchTerm = searchParams.get('q') || searchParams.get('search') || '';
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 100;

    const db = await getDb();
    const airlinesCollection = db.collection('airlines');

    // Build query
    const query = {};
    
    if (searchTerm && searchTerm.trim()) {
      const searchRegex = { $regex: searchTerm.trim(), $options: 'i' };
      query.$or = [
        { name: searchRegex },
        { code: searchRegex },
        { country: searchRegex },
        { headquarters: searchRegex },
        { phone: searchRegex },
        { email: searchRegex }
      ];
    }

    if (status && status !== 'All') {
      query.status = status;
    }

    // Get total count for pagination
    const total = await airlinesCollection.countDocuments(query);

    // Calculate skip for pagination
    const skip = (page - 1) * limit;

    const airlines = await airlinesCollection
      .find(query)
      .sort({ name: 1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    // Format airlines for frontend
    const formattedAirlines = airlines.map((airline) => ({
      id: airline._id.toString(),
      _id: airline._id.toString(),
      airlineId: airline._id.toString(),
      name: airline.name || '',
      code: airline.code || '',
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
    }));

    return NextResponse.json(
      {
        airlines: formattedAirlines,
        data: formattedAirlines,
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
    console.error('Error fetching airlines:', error);
    return NextResponse.json(
      { error: 'Failed to fetch airlines', message: error.message },
      { status: 500 }
    );
  }
}

// POST create new airline
export async function POST(request) {
  try {
    const body = await request.json();

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

    // Check if airline with same code already exists
    const existingAirline = await airlinesCollection.findOne({
      code: body.code.trim().toUpperCase()
    });
    
    if (existingAirline) {
      return NextResponse.json(
        { error: 'Airline with this code already exists' },
        { status: 400 }
      );
    }

    // Create airline
    const airlineData = {
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
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await airlinesCollection.insertOne(airlineData);

    // Fetch created airline
    const createdAirline = await airlinesCollection.findOne({
      _id: result.insertedId
    });

    // Format airline for frontend
    const formattedAirline = {
      id: createdAirline._id.toString(),
      _id: createdAirline._id.toString(),
      airlineId: createdAirline._id.toString(),
      name: createdAirline.name || '',
      code: createdAirline.code || '',
      icao: createdAirline.icao || '',
      fs: createdAirline.fs || '',
      isDomestic: createdAirline.isDomestic || false,
      country: createdAirline.country || '',
      headquarters: createdAirline.headquarters || '',
      phone: createdAirline.phone || '',
      email: createdAirline.email || '',
      website: createdAirline.website || '',
      established: createdAirline.established || '',
      status: createdAirline.status || 'Active',
      routes: createdAirline.routes || 0,
      fleet: createdAirline.fleet || 0,
      logo: createdAirline.logo || '',
      createdAt: createdAirline.createdAt ? createdAirline.createdAt.toISOString() : new Date().toISOString(),
      updatedAt: createdAirline.updatedAt ? createdAirline.updatedAt.toISOString() : new Date().toISOString(),
    };

    return NextResponse.json(
      { airline: formattedAirline, data: formattedAirline, message: 'Airline created successfully' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating airline:', error);
    return NextResponse.json(
      { error: 'Failed to create airline', message: error.message },
      { status: 500 }
    );
  }
}

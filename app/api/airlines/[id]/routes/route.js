import { NextResponse } from 'next/server';
import { getDb } from '../../../../../lib/mongodb';
import { ObjectId } from 'mongodb';

// GET all routes for an airline
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
    const airlineRoutesCollection = db.collection('airline_routes');

    // Verify airline exists
    const airline = await airlinesCollection.findOne({
      _id: new ObjectId(id)
    });

    if (!airline) {
      return NextResponse.json(
        { error: 'Airline not found' },
        { status: 404 }
      );
    }

    // Fetch all routes for this airline
    const routes = await airlineRoutesCollection
      .find({ airlineId: new ObjectId(id) })
      .sort({ createdAt: -1 })
      .toArray();

    // Format routes for frontend
    const formattedRoutes = routes.map((route) => ({
      id: route._id.toString(),
      _id: route._id.toString(),
      airlineId: route.airlineId.toString(),
      origin: route.origin || '',
      destination: route.destination || '',
      segments: route.segments || [],
      segmentCount: route.segments ? route.segments.length : 0,
      status: route.status || 'Active',
      notes: route.notes || '',
      createdAt: route.createdAt ? route.createdAt.toISOString() : new Date().toISOString(),
      updatedAt: route.updatedAt ? route.updatedAt.toISOString() : new Date().toISOString(),
    }));

    return NextResponse.json(
      { routes: formattedRoutes, data: formattedRoutes, count: formattedRoutes.length },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching airline routes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch airline routes', message: error.message },
      { status: 500 }
    );
  }
}

// POST create new route for an airline
export async function POST(request, { params }) {
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
    if (!body.origin || !body.origin.trim()) {
      return NextResponse.json(
        { error: 'Origin is required' },
        { status: 400 }
      );
    }

    if (!body.destination || !body.destination.trim()) {
      return NextResponse.json(
        { error: 'Destination is required' },
        { status: 400 }
      );
    }

    const db = await getDb();
    const airlinesCollection = db.collection('airlines');
    const airlineRoutesCollection = db.collection('airline_routes');

    // Verify airline exists
    const airline = await airlinesCollection.findOne({
      _id: new ObjectId(id)
    });

    if (!airline) {
      return NextResponse.json(
        { error: 'Airline not found' },
        { status: 404 }
      );
    }

    // Validate segments if provided
    const segments = body.segments || [];
    if (Array.isArray(segments)) {
      for (const segment of segments) {
        if (!segment.from || !segment.to) {
          return NextResponse.json(
            { error: 'Each segment must have "from" and "to" fields' },
            { status: 400 }
          );
        }
      }
    }

    // Create route
    const routeData = {
      airlineId: new ObjectId(id),
      origin: body.origin.trim(),
      destination: body.destination.trim(),
      segments: segments.map(seg => ({
        from: seg.from.trim(),
        to: seg.to.trim(),
        flightNumber: seg.flightNumber || null,
        duration: seg.duration || null,
        aircraft: seg.aircraft || null,
        notes: seg.notes || null,
      })),
      status: body.status || 'Active',
      notes: body.notes ? body.notes.trim() : null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await airlineRoutesCollection.insertOne(routeData);

    // Fetch created route
    const createdRoute = await airlineRoutesCollection.findOne({
      _id: result.insertedId
    });

    // Format route for frontend
    const formattedRoute = {
      id: createdRoute._id.toString(),
      _id: createdRoute._id.toString(),
      airlineId: createdRoute.airlineId.toString(),
      origin: createdRoute.origin || '',
      destination: createdRoute.destination || '',
      segments: createdRoute.segments || [],
      segmentCount: createdRoute.segments ? createdRoute.segments.length : 0,
      status: createdRoute.status || 'Active',
      notes: createdRoute.notes || '',
      createdAt: createdRoute.createdAt ? createdRoute.createdAt.toISOString() : new Date().toISOString(),
      updatedAt: createdRoute.updatedAt ? createdRoute.updatedAt.toISOString() : new Date().toISOString(),
    };

    // Update airline routes count
    const routeCount = await airlineRoutesCollection.countDocuments({
      airlineId: new ObjectId(id)
    });
    await airlinesCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: { routes: routeCount, updatedAt: new Date() } }
    );

    return NextResponse.json(
      { route: formattedRoute, data: formattedRoute, message: 'Route created successfully' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating airline route:', error);
    return NextResponse.json(
      { error: 'Failed to create airline route', message: error.message },
      { status: 500 }
    );
  }
}

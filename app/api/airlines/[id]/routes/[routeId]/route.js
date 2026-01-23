import { NextResponse } from 'next/server';
import { getDb } from '../../../../../../lib/mongodb';
import { ObjectId } from 'mongodb';

// GET single route by ID
export async function GET(request, { params }) {
  try {
    // Handle both sync and async params
    const resolvedParams = params instanceof Promise ? await params : params;
    const { id, routeId } = resolvedParams;

    if (!id || !routeId) {
      return NextResponse.json(
        { error: 'Airline ID and Route ID are required' },
        { status: 400 }
      );
    }

    if (!ObjectId.isValid(id) || !ObjectId.isValid(routeId)) {
      return NextResponse.json(
        { error: 'Invalid ID format' },
        { status: 400 }
      );
    }

    const db = await getDb();
    const airlineRoutesCollection = db.collection('airline_routes');

    const route = await airlineRoutesCollection.findOne({
      _id: new ObjectId(routeId),
      airlineId: new ObjectId(id)
    });

    if (!route) {
      return NextResponse.json(
        { error: 'Route not found' },
        { status: 404 }
      );
    }

    // Format route for frontend
    const formattedRoute = {
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
    };

    return NextResponse.json(
      { route: formattedRoute, data: formattedRoute },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching airline route:', error);
    return NextResponse.json(
      { error: 'Failed to fetch airline route', message: error.message },
      { status: 500 }
    );
  }
}

// PUT update route
export async function PUT(request, { params }) {
  try {
    // Handle both sync and async params
    const resolvedParams = params instanceof Promise ? await params : params;
    const { id, routeId } = resolvedParams;
    const body = await request.json();

    if (!id || !routeId) {
      return NextResponse.json(
        { error: 'Airline ID and Route ID are required' },
        { status: 400 }
      );
    }

    if (!ObjectId.isValid(id) || !ObjectId.isValid(routeId)) {
      return NextResponse.json(
        { error: 'Invalid ID format' },
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
    const airlineRoutesCollection = db.collection('airline_routes');

    // Check if route exists
    const existingRoute = await airlineRoutesCollection.findOne({
      _id: new ObjectId(routeId),
      airlineId: new ObjectId(id)
    });

    if (!existingRoute) {
      return NextResponse.json(
        { error: 'Route not found' },
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

    // Update route
    const updateData = {
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
      updatedAt: new Date(),
    };

    await airlineRoutesCollection.updateOne(
      { _id: new ObjectId(routeId) },
      { $set: updateData }
    );

    // Fetch updated route
    const updatedRoute = await airlineRoutesCollection.findOne({
      _id: new ObjectId(routeId)
    });

    // Format route for frontend
    const formattedRoute = {
      id: updatedRoute._id.toString(),
      _id: updatedRoute._id.toString(),
      airlineId: updatedRoute.airlineId.toString(),
      origin: updatedRoute.origin || '',
      destination: updatedRoute.destination || '',
      segments: updatedRoute.segments || [],
      segmentCount: updatedRoute.segments ? updatedRoute.segments.length : 0,
      status: updatedRoute.status || 'Active',
      notes: updatedRoute.notes || '',
      createdAt: updatedRoute.createdAt ? updatedRoute.createdAt.toISOString() : new Date().toISOString(),
      updatedAt: updatedRoute.updatedAt ? updatedRoute.updatedAt.toISOString() : new Date().toISOString(),
    };

    return NextResponse.json(
      { route: formattedRoute, data: formattedRoute, message: 'Route updated successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating airline route:', error);
    return NextResponse.json(
      { error: 'Failed to update airline route', message: error.message },
      { status: 500 }
    );
  }
}

// DELETE route
export async function DELETE(request, { params }) {
  try {
    // Handle both sync and async params
    const resolvedParams = params instanceof Promise ? await params : params;
    const { id, routeId } = resolvedParams;

    if (!id || !routeId) {
      return NextResponse.json(
        { error: 'Airline ID and Route ID are required' },
        { status: 400 }
      );
    }

    if (!ObjectId.isValid(id) || !ObjectId.isValid(routeId)) {
      return NextResponse.json(
        { error: 'Invalid ID format' },
        { status: 400 }
      );
    }

    const db = await getDb();
    const airlinesCollection = db.collection('airlines');
    const airlineRoutesCollection = db.collection('airline_routes');

    // Check if route exists
    const existingRoute = await airlineRoutesCollection.findOne({
      _id: new ObjectId(routeId),
      airlineId: new ObjectId(id)
    });

    if (!existingRoute) {
      return NextResponse.json(
        { error: 'Route not found' },
        { status: 404 }
      );
    }

    // Delete route
    await airlineRoutesCollection.deleteOne({
      _id: new ObjectId(routeId)
    });

    // Update airline routes count
    const routeCount = await airlineRoutesCollection.countDocuments({
      airlineId: new ObjectId(id)
    });
    await airlinesCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: { routes: routeCount, updatedAt: new Date() } }
    );

    return NextResponse.json(
      { message: 'Route deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting airline route:', error);
    return NextResponse.json(
      { error: 'Failed to delete airline route', message: error.message },
      { status: 500 }
    );
  }
}

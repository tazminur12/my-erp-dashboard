import { NextResponse } from 'next/server';
import { getDb } from '../../../lib/mongodb';
import { ObjectId } from 'mongodb';

// GET all hotels
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const area = searchParams.get('area');
    const limit = parseInt(searchParams.get('limit')) || 1000;
    const page = parseInt(searchParams.get('page')) || 1;
    const skip = (page - 1) * limit;

    const db = await getDb();
    const hotelsCollection = db.collection('hotels');

    // Build query
    const query = {};
    if (area) {
      query.area = area;
    }
    if (search) {
      query.$or = [
        { hotelName: { $regex: search, $options: 'i' } },
        { area: { $regex: search, $options: 'i' } },
        { tasrihNumber: { $regex: search, $options: 'i' } },
        { tasnifNumber: { $regex: search, $options: 'i' } },
        { address: { $regex: search, $options: 'i' } },
        { mobileNumber: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    // Get total count for pagination
    const total = await hotelsCollection.countDocuments(query);

    // Fetch hotels
    const hotels = await hotelsCollection
      .find(query)
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    // Format hotels for frontend
    const formattedHotels = hotels.map((hotel) => ({
      id: hotel._id.toString(),
      _id: hotel._id.toString(),
      area: hotel.area || '',
      hotelName: hotel.hotelName || '',
      tasrihNumber: hotel.tasrihNumber || '',
      tasnifNumber: hotel.tasnifNumber || '',
      address: hotel.address || '',
      distanceFromHaram: hotel.distanceFromHaram || '',
      email: hotel.email || '',
      mobileNumber: hotel.mobileNumber || '',
      created_at: hotel.created_at || hotel._id.getTimestamp().toISOString(),
      updated_at: hotel.updated_at || hotel.created_at || hotel._id.getTimestamp().toISOString(),
    }));

    return NextResponse.json(
      {
        hotels: formattedHotels,
        data: formattedHotels,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        pagination: {
          totalItems: total,
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          itemsPerPage: limit
        }
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching hotels:', error);
    return NextResponse.json(
      { error: 'Failed to fetch hotels', message: error.message },
      { status: 500 }
    );
  }
}

// POST create new hotel
export async function POST(request) {
  try {
    const body = await request.json();

    // Validation
    if (!body.hotelName || !body.area) {
      return NextResponse.json(
        { error: 'Hotel name and area are required' },
        { status: 400 }
      );
    }

    const db = await getDb();
    const hotelsCollection = db.collection('hotels');

    // Create new hotel
    const newHotel = {
      area: body.area.trim(),
      hotelName: body.hotelName.trim(),
      tasrihNumber: body.tasrihNumber?.trim() || '',
      tasnifNumber: body.tasnifNumber?.trim() || '',
      address: body.address?.trim() || '',
      distanceFromHaram: body.distanceFromHaram?.trim() || '',
      email: body.email?.trim() || '',
      mobileNumber: body.mobileNumber?.trim() || '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const result = await hotelsCollection.insertOne(newHotel);

    const formattedHotel = {
      id: result.insertedId.toString(),
      _id: result.insertedId.toString(),
      ...newHotel,
    };

    return NextResponse.json(
      { hotel: formattedHotel, message: 'Hotel created successfully' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating hotel:', error);
    return NextResponse.json(
      { error: 'Failed to create hotel', message: error.message },
      { status: 500 }
    );
  }
}

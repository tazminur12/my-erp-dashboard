import { NextResponse } from 'next/server';
import { getDb } from '../../../../lib/mongodb';
import { ObjectId } from 'mongodb';

// GET single hotel
export async function GET(request, { params }) {
  try {
    const resolvedParams = params instanceof Promise ? await params : params;
    const { id } = resolvedParams;

    if (!id) {
      return NextResponse.json(
        { error: 'Hotel ID is required' },
        { status: 400 }
      );
    }

    const db = await getDb();
    const hotelsCollection = db.collection('hotels');

    let hotel = null;
    if (ObjectId.isValid(id)) {
      hotel = await hotelsCollection.findOne({ _id: new ObjectId(id) });
    }

    if (!hotel) {
      return NextResponse.json(
        { error: 'Hotel not found', id: id },
        { status: 404 }
      );
    }

    const formattedHotel = {
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
    };

    return NextResponse.json({ hotel: formattedHotel, data: formattedHotel }, { status: 200 });
  } catch (error) {
    console.error('Error fetching hotel:', error);
    return NextResponse.json(
      { error: 'Failed to fetch hotel', message: error.message },
      { status: 500 }
    );
  }
}

// PUT update hotel
export async function PUT(request, { params }) {
  try {
    const resolvedParams = params instanceof Promise ? await params : params;
    const { id } = resolvedParams;
    const body = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: 'Hotel ID is required' },
        { status: 400 }
      );
    }

    if (!body.hotelName || !body.area) {
      return NextResponse.json(
        { error: 'Hotel name and area are required' },
        { status: 400 }
      );
    }

    const db = await getDb();
    const hotelsCollection = db.collection('hotels');

    // Check if hotel exists
    let existingHotel = null;
    if (ObjectId.isValid(id)) {
      existingHotel = await hotelsCollection.findOne({ _id: new ObjectId(id) });
    }

    if (!existingHotel) {
      return NextResponse.json(
        { error: 'Hotel not found' },
        { status: 404 }
      );
    }

    // Update hotel
    const updateData = {
      area: body.area.trim(),
      hotelName: body.hotelName.trim(),
      tasrihNumber: body.tasrihNumber?.trim() || '',
      tasnifNumber: body.tasnifNumber?.trim() || '',
      address: body.address?.trim() || '',
      distanceFromHaram: body.distanceFromHaram?.trim() || '',
      email: body.email?.trim() || '',
      mobileNumber: body.mobileNumber?.trim() || '',
      updated_at: new Date().toISOString(),
    };

    await hotelsCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    const updatedHotel = await hotelsCollection.findOne({ _id: new ObjectId(id) });

    const formattedHotel = {
      id: updatedHotel._id.toString(),
      _id: updatedHotel._id.toString(),
      ...updateData,
      created_at: updatedHotel.created_at || updatedHotel._id.getTimestamp().toISOString(),
    };

    return NextResponse.json(
      { hotel: formattedHotel, message: 'Hotel updated successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating hotel:', error);
    return NextResponse.json(
      { error: 'Failed to update hotel', message: error.message },
      { status: 500 }
    );
  }
}

// DELETE hotel
export async function DELETE(request, { params }) {
  try {
    const resolvedParams = params instanceof Promise ? await params : params;
    const { id } = resolvedParams;

    if (!id) {
      return NextResponse.json(
        { error: 'Hotel ID is required' },
        { status: 400 }
      );
    }

    const db = await getDb();
    const hotelsCollection = db.collection('hotels');

    // Check if hotel exists
    let hotel = null;
    if (ObjectId.isValid(id)) {
      hotel = await hotelsCollection.findOne({ _id: new ObjectId(id) });
    }

    if (!hotel) {
      return NextResponse.json(
        { error: 'Hotel not found' },
        { status: 404 }
      );
    }

    // Check if hotel has associated contracts
    const contractsCollection = db.collection('hotel_contracts');
    const hotelId = hotel._id.toString();
    const contractsCount = await contractsCollection.countDocuments({
      $or: [
        { hotelId: hotelId },
        { hotel_id: hotelId }
      ]
    });

    if (contractsCount > 0) {
      return NextResponse.json(
        { error: `Cannot delete hotel. It has ${contractsCount} associated contracts. Please delete them first.` },
        { status: 400 }
      );
    }

    // Delete hotel
    await hotelsCollection.deleteOne({ _id: new ObjectId(id) });

    return NextResponse.json(
      { message: 'Hotel deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting hotel:', error);
    return NextResponse.json(
      { error: 'Failed to delete hotel', message: error.message },
      { status: 500 }
    );
  }
}

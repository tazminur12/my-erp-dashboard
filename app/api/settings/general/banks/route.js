import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

// GET all banks with search
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const searchTerm = searchParams.get('q') || '';
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 20;

    const db = await getDb();
    const banksCollection = db.collection('bd_banks');

    // Build query
    const query = {};
    if (searchTerm) {
      const regex = { $regex: searchTerm, $options: 'i' };
      query.$or = [
        { name: regex },
        { bank_code: regex },
        { 'districts.district_name': regex },
        { 'districts.branches.branch_name': regex },
        { 'districts.branches.swift_code': regex },
        { 'districts.branches.routing_number': regex }
      ];
    }

    const total = await banksCollection.countDocuments(query);
    const skip = (page - 1) * limit;

    const banks = await banksCollection
      .find(query)
      .sort({ name: 1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    return NextResponse.json({
      banks,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching banks:', error);
    return NextResponse.json({ error: 'Failed to fetch banks' }, { status: 500 });
  }
}

// POST create new bank
export async function POST(request) {
  try {
    const body = await request.json();
    const { name, bank_code, slug, logo } = body; // Added logo

    if (!name || !bank_code) {
      return NextResponse.json({ error: 'Name and Bank Code are required' }, { status: 400 });
    }

    const db = await getDb();
    const banksCollection = db.collection('bd_banks');

    const existingBank = await banksCollection.findOne({ 
      $or: [{ bank_code }, { name }] 
    });

    if (existingBank) {
      return NextResponse.json({ error: 'Bank already exists' }, { status: 400 });
    }

    const newBank = {
      name,
      bank_code,
      slug: slug || name.toUpperCase().replace(/\s+/g, '_'),
      logo: logo || null, // Store logo
      districts: body.districts || [], // Use provided districts or empty array
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await banksCollection.insertOne(newBank);

    return NextResponse.json({ 
      message: 'Bank created successfully',
      bank: { ...newBank, _id: result.insertedId }
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating bank:', error);
    return NextResponse.json({ error: 'Failed to create bank' }, { status: 500 });
  }
}

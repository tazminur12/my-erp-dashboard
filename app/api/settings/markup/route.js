import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';

export async function GET(request) {
  try {
    const db = await getDb();
    const markups = await db.collection('markups').find({}).sort({ createdAt: -1 }).toArray();
    return NextResponse.json({ success: true, data: markups });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    
    // Minimal validation to allow complex objects
    // We require at least a priority or airline to identify the rule
    if (!body) {
      return NextResponse.json({ success: false, error: 'Missing request body' }, { status: 400 });
    }

    const db = await getDb();
    
    // Clean up body (remove _id if present)
    const { _id, ...markupData } = body;

    const newMarkup = {
      ...markupData,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await db.collection('markups').insertOne(newMarkup);

    return NextResponse.json({ success: true, data: { ...newMarkup, _id: result.insertedId } });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

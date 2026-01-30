import { NextResponse } from 'next/server';
import { getDb } from '../../../../lib/mongodb';

// GET all API configs
export async function GET(request) {
  try {
    const db = await getDb();
    const collection = db.collection('api_configs');

    const configs = await collection
      .find({})
      .sort({ created_at: -1 })
      .toArray();

    // Format for frontend
    const formattedConfigs = configs.map((config) => ({
      id: config._id.toString(),
      ipccName: config.ipccName || '',
      iataCode: config.iataCode || '',
      gds: config.gds || 'SABRE BD',
      businessName: config.businessName || '',
      contact: config.contact || '',
      email: config.email || '',
      commission: config.commission || '0.00',
      isPercent: config.isPercent ?? true,
      miscCharge: config.miscCharge || '0.00',
      configJson: config.configJson || '',
      created_at: config.created_at || new Date().toISOString(),
    }));

    return NextResponse.json({ configs: formattedConfigs }, { status: 200 });
  } catch (error) {
    console.error('Error fetching API configs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch API configs', message: error.message },
      { status: 500 }
    );
  }
}

// POST create new API config
export async function POST(request) {
  try {
    const body = await request.json();
    const { 
      ipccName, 
      iataCode, 
      gds, 
      businessName, 
      contact, 
      email, 
      commission, 
      isPercent, 
      miscCharge, 
      configJson 
    } = body;

    // Validation
    if (!ipccName || !iataCode || !gds) {
      return NextResponse.json(
        { error: 'IPCC Name, IATA Code, and GDS are required' },
        { status: 400 }
      );
    }

    const db = await getDb();
    const collection = db.collection('api_configs');

    // Create new config
    const newConfig = {
      ipccName,
      iataCode,
      gds,
      businessName: businessName || '',
      contact: contact || '',
      email: email || '',
      commission: commission || '0.00',
      isPercent: isPercent ?? true,
      miscCharge: miscCharge || '0.00',
      configJson: configJson || '',
      created_at: new Date(),
      updated_at: new Date(),
    };

    const result = await collection.insertOne(newConfig);

    return NextResponse.json(
      { 
        message: 'API Configuration created successfully', 
        config: { ...newConfig, id: result.insertedId.toString() } 
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating API config:', error);
    return NextResponse.json(
      { error: 'Failed to create API config', message: error.message },
      { status: 500 }
    );
  }
}

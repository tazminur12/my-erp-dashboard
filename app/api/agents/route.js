import { NextResponse } from 'next/server';
import { getDb } from '../../../lib/mongodb';

// GET all agents
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status'); // Optional filter by status

    const db = await getDb();
    const agentsCollection = db.collection('agents');

    // Build query
    const query = {};
    if (status) {
      query.status = status;
    }

    const agents = await agentsCollection
      .find(query)
      .sort({ created_at: -1 })
      .toArray();

    // Format agents for frontend
    const formattedAgents = agents.map((agent) => ({
      id: agent._id.toString(),
      _id: agent._id.toString(),
      tradeName: agent.tradeName || '',
      tradeLocation: agent.tradeLocation || '',
      location: agent.tradeLocation || agent.location || '',
      ownerName: agent.ownerName || '',
      contactNo: agent.contactNo || '',
      contact: agent.contactNo || agent.contact || '',
      dob: agent.dob || '',
      nid: agent.nid || '',
      passport: agent.passport || '',
      profilePicture: agent.profilePicture || agent.profile_picture || '',
      status: agent.status || 'active',
      // Balance fields
      totalDue: agent.totalDue !== undefined ? agent.totalDue : (agent.total_due || 0),
      hajDue: agent.hajDue !== undefined ? agent.hajDue : (agent.haj_due || 0),
      umrahDue: agent.umrahDue !== undefined ? agent.umrahDue : (agent.umrah_due || 0),
      totalPaid: agent.totalPaid !== undefined ? agent.totalPaid : (agent.total_paid || 0),
      hajPaid: agent.hajPaid !== undefined ? agent.hajPaid : (agent.haj_paid || 0),
      umrahPaid: agent.umrahPaid !== undefined ? agent.umrahPaid : (agent.umrah_paid || 0),
      totalDeposit: agent.totalDeposit !== undefined ? agent.totalDeposit : (agent.total_deposit || 0),
      totalAdvance: agent.totalAdvance !== undefined ? agent.totalAdvance : (agent.total_advance || 0),
      hajAdvance: agent.hajAdvance !== undefined ? agent.hajAdvance : (agent.haj_advance || 0),
      umrahAdvance: agent.umrahAdvance !== undefined ? agent.umrahAdvance : (agent.umrah_advance || 0),
      created_at: agent.created_at ? agent.created_at.toISOString() : '',
      updated_at: agent.updated_at ? agent.updated_at.toISOString() : '',
    }));

    return NextResponse.json(
      { agents: formattedAgents, data: formattedAgents, count: formattedAgents.length },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching agents:', error);
    return NextResponse.json(
      { error: 'Failed to fetch agents', message: error.message },
      { status: 500 }
    );
  }
}

// POST create new agent
export async function POST(request) {
  try {
    const body = await request.json();
    const { tradeName, tradeLocation, ownerName, contactNo, dob, nid, passport, profilePicture } = body;

    // Validation
    if (!tradeName || !tradeName.trim()) {
      return NextResponse.json(
        { error: 'Trade Name is required' },
        { status: 400 }
      );
    }

    if (!tradeLocation || !tradeLocation.trim()) {
      return NextResponse.json(
        { error: 'Trade Location is required' },
        { status: 400 }
      );
    }

    if (!ownerName || !ownerName.trim()) {
      return NextResponse.json(
        { error: "Owner's Name is required" },
        { status: 400 }
      );
    }

    if (!contactNo || !contactNo.trim()) {
      return NextResponse.json(
        { error: 'Contact No is required' },
        { status: 400 }
      );
    }

    // Validate phone number format
    const phoneRegex = /^\+?[0-9\-()\s]{6,20}$/;
    if (!phoneRegex.test(contactNo.trim())) {
      return NextResponse.json(
        { error: 'Enter a valid phone number' },
        { status: 400 }
      );
    }

    // Validate NID if provided
    if (nid && nid.trim()) {
      const nidRegex = /^[0-9]{8,20}$/;
      if (!nidRegex.test(nid.trim())) {
        return NextResponse.json(
          { error: 'NID should be 8-20 digits' },
          { status: 400 }
        );
      }
    }

    // Validate Passport if provided
    if (passport && passport.trim()) {
      const passportRegex = /^[A-Za-z0-9]{6,12}$/;
      if (!passportRegex.test(passport.trim())) {
        return NextResponse.json(
          { error: 'Passport should be 6-12 alphanumeric characters' },
          { status: 400 }
        );
      }
    }

    const db = await getDb();
    const agentsCollection = db.collection('agents');

    // Check if agent with same trade name already exists
    const existingAgent = await agentsCollection.findOne({
      tradeName: tradeName.trim()
    });
    
    if (existingAgent) {
      return NextResponse.json(
        { error: 'Agent with this trade name already exists' },
        { status: 400 }
      );
    }

    // Create new agent
    const newAgent = {
      tradeName: tradeName.trim(),
      tradeLocation: tradeLocation.trim(),
      ownerName: ownerName.trim(),
      contactNo: contactNo.trim(),
      dob: dob || '',
      nid: nid ? nid.trim() : '',
      passport: passport ? passport.trim() : '',
      profilePicture: profilePicture || '',
      status: 'active',
      created_at: new Date(),
      updated_at: new Date(),
    };

    const result = await agentsCollection.insertOne(newAgent);

    // Return agent
    const createdAgent = {
      id: result.insertedId.toString(),
      _id: result.insertedId.toString(),
      ...newAgent,
      created_at: newAgent.created_at.toISOString(),
      updated_at: newAgent.updated_at.toISOString(),
    };

    return NextResponse.json(
      { message: 'Agent created successfully', agent: createdAgent },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating agent:', error);
    return NextResponse.json(
      { error: 'Failed to create agent', message: error.message },
      { status: 500 }
    );
  }
}

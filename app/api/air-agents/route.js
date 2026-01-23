import { NextResponse } from 'next/server';
import { getDb } from '../../../lib/mongodb';

// GET all air agents
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const searchTerm = searchParams.get('search') || '';
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 50;

    const db = await getDb();
    const airAgentsCollection = db.collection('air_agents');

    // Build query
    const query = {};
    
    if (searchTerm && searchTerm.trim()) {
      const searchRegex = { $regex: searchTerm.trim(), $options: 'i' };
      query.$or = [
        { name: searchRegex },
        { personalName: searchRegex },
        { email: searchRegex },
        { mobile: searchRegex },
        { tradeLicense: searchRegex },
        { tinNumber: searchRegex }
      ];
    }

    // Get total count for pagination
    const total = await airAgentsCollection.countDocuments(query);

    // Calculate skip for pagination
    const skip = (page - 1) * limit;

    const agents = await airAgentsCollection
      .find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    // Format agents for frontend
    const formattedAgents = agents.map((agent) => ({
      id: agent._id.toString(),
      _id: agent._id.toString(),
      agentId: agent.agentId || agent._id.toString(),
      idCode: agent.agentId || agent._id.toString(),
      name: agent.name || '',
      personalName: agent.personalName || '',
      email: agent.email || '',
      mobile: agent.mobile || '',
      address: agent.address || '',
      city: agent.city || '',
      state: agent.state || '',
      zipCode: agent.zipCode || '',
      country: agent.country || 'Bangladesh',
      nid: agent.nid || '',
      passport: agent.passport || '',
      tradeLicense: agent.tradeLicense || '',
      tinNumber: agent.tinNumber || '',
      status: agent.status || 'Active',
      isActive: agent.isActive !== false && agent.status !== 'Inactive',
      createdAt: agent.createdAt ? agent.createdAt.toISOString() : new Date().toISOString(),
      updatedAt: agent.updatedAt ? agent.updatedAt.toISOString() : new Date().toISOString(),
    }));

    return NextResponse.json(
      {
        agents: formattedAgents,
        data: formattedAgents,
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
    console.error('Error fetching air agents:', error);
    return NextResponse.json(
      { error: 'Failed to fetch air agents', message: error.message },
      { status: 500 }
    );
  }
}

// POST create new air agent
export async function POST(request) {
  try {
    const body = await request.json();

    // Validation
    if (!body.name || !body.name.trim()) {
      return NextResponse.json(
        { error: 'Trade Name is required' },
        { status: 400 }
      );
    }

    if (!body.email || !body.email.trim()) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    if (!body.mobile || !body.mobile.trim()) {
      return NextResponse.json(
        { error: 'Mobile number is required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.email.trim())) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Validate mobile number format (Bangladesh format)
    const mobileRegex = /^(\+880|880|0)?1[3-9]\d{8}$/;
    if (!mobileRegex.test(body.mobile.trim().replace(/\s+/g, ''))) {
      return NextResponse.json(
        { error: 'Invalid mobile number format. Please use format: 01XXXXXXXXX' },
        { status: 400 }
      );
    }

    const db = await getDb();
    const airAgentsCollection = db.collection('air_agents');

    // Check if agent with same email or mobile already exists
    const existingAgent = await airAgentsCollection.findOne({
      $or: [
        { email: body.email.trim() },
        { mobile: body.mobile.trim().replace(/\s+/g, '') }
      ]
    });
    
    if (existingAgent) {
      return NextResponse.json(
        { error: 'Agent with this email or mobile number already exists' },
        { status: 400 }
      );
    }

    // Generate unique agent ID if not provided
    let agentId = body.agentId;
    if (!agentId || !agentId.trim()) {
      // Find all agents with AGT prefix IDs and get the highest number
      const agentsWithIds = await airAgentsCollection
        .find({ agentId: { $regex: /^AGT\d+$/i } })
        .toArray();
      
      let maxNumber = 0;
      if (agentsWithIds.length > 0) {
        // Extract numbers from all IDs and find the maximum
        agentsWithIds.forEach(agent => {
          if (agent.agentId) {
            const idNumber = parseInt(agent.agentId.toUpperCase().replace(/^AGT-?/, '')) || 0;
            if (idNumber > maxNumber) {
              maxNumber = idNumber;
            }
          }
        });
      }
      
      // Generate next ID
      agentId = `AGT${String(maxNumber + 1).padStart(4, '0')}`;

      // Ensure uniqueness - check if generated ID already exists and increment if needed
      let attempts = 0;
      const maxAttempts = 100;
      while (attempts < maxAttempts) {
        const existingAgentId = await airAgentsCollection.findOne({ agentId });
        if (!existingAgentId) {
          break; // ID is unique, proceed
        }
        
        // Extract number and increment
        const currentNumber = parseInt(agentId.replace(/^AGT-?/i, '')) || 0;
        agentId = `AGT${String(currentNumber + 1).padStart(4, '0')}`;
        attempts++;
      }

      if (attempts >= maxAttempts) {
        return NextResponse.json(
          { error: 'Failed to generate unique agent ID. Please try again.' },
          { status: 500 }
        );
      }
    } else {
      // If agent ID is provided, validate format and check uniqueness
      agentId = agentId.trim().toUpperCase();
      
      // Validate format: AGT followed by 4 digits
      if (!/^AGT\d{4}$/.test(agentId)) {
        return NextResponse.json(
          { error: 'Invalid agent ID format. Must be in format AGT0001' },
          { status: 400 }
        );
      }

      // Check if provided ID already exists
      const existingAgentId = await airAgentsCollection.findOne({ agentId });
      if (existingAgentId) {
        return NextResponse.json(
          { error: `Agent ID ${agentId} already exists` },
          { status: 400 }
        );
      }
    }

    // Create agent
    const agentData = {
      agentId,
      name: body.name.trim(),
      personalName: body.personalName ? body.personalName.trim() : null,
      email: body.email.trim(),
      mobile: body.mobile.trim().replace(/\s+/g, ''),
      address: body.address ? body.address.trim() : null,
      city: body.city ? body.city.trim() : null,
      state: body.state ? body.state.trim() : null,
      zipCode: body.zipCode ? body.zipCode.trim() : null,
      country: body.country || 'Bangladesh',
      nid: body.nid ? body.nid.trim() : null,
      passport: body.passport ? body.passport.trim() : null,
      tradeLicense: body.tradeLicense ? body.tradeLicense.trim() : null,
      tinNumber: body.tinNumber ? body.tinNumber.trim() : null,
      status: body.status || 'Active',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await airAgentsCollection.insertOne(agentData);

    // Fetch created agent
    const createdAgent = await airAgentsCollection.findOne({
      _id: result.insertedId
    });

    // Format agent for frontend
    const formattedAgent = {
      id: createdAgent._id.toString(),
      _id: createdAgent._id.toString(),
      agentId: createdAgent.agentId || createdAgent._id.toString(),
      idCode: createdAgent.agentId || createdAgent._id.toString(),
      name: createdAgent.name || '',
      personalName: createdAgent.personalName || '',
      email: createdAgent.email || '',
      mobile: createdAgent.mobile || '',
      address: createdAgent.address || '',
      city: createdAgent.city || '',
      state: createdAgent.state || '',
      zipCode: createdAgent.zipCode || '',
      country: createdAgent.country || 'Bangladesh',
      nid: createdAgent.nid || '',
      passport: createdAgent.passport || '',
      tradeLicense: createdAgent.tradeLicense || '',
      tinNumber: createdAgent.tinNumber || '',
      status: createdAgent.status || 'Active',
      isActive: createdAgent.isActive !== false && createdAgent.status !== 'Inactive',
      createdAt: createdAgent.createdAt ? createdAgent.createdAt.toISOString() : new Date().toISOString(),
      updatedAt: createdAgent.updatedAt ? createdAgent.updatedAt.toISOString() : new Date().toISOString(),
    };

    return NextResponse.json(
      { agent: formattedAgent, data: formattedAgent, message: 'Air agent created successfully' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating air agent:', error);
    return NextResponse.json(
      { error: 'Failed to create air agent', message: error.message },
      { status: 500 }
    );
  }
}

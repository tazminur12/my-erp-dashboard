import { NextResponse } from 'next/server';
import { getDb } from '../../../../lib/mongodb';
import { ObjectId } from 'mongodb';

// GET single air agent by ID
export async function GET(request, { params }) {
  try {
    // Handle both sync and async params
    const resolvedParams = params instanceof Promise ? await params : params;
    const { id } = resolvedParams;

    if (!id) {
      return NextResponse.json(
        { error: 'Agent ID is required' },
        { status: 400 }
      );
    }

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid agent ID format' },
        { status: 400 }
      );
    }

    const db = await getDb();
    const airAgentsCollection = db.collection('air_agents');

    const agent = await airAgentsCollection.findOne({
      _id: new ObjectId(id)
    });

    if (!agent) {
      return NextResponse.json(
        { error: 'Agent not found' },
        { status: 404 }
      );
    }

    // Format agent for frontend
    const formattedAgent = {
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
    };

    return NextResponse.json(
      { agent: formattedAgent, data: formattedAgent },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching air agent:', error);
    return NextResponse.json(
      { error: 'Failed to fetch air agent', message: error.message },
      { status: 500 }
    );
  }
}

// PUT update air agent
export async function PUT(request, { params }) {
  try {
    // Handle both sync and async params
    const resolvedParams = params instanceof Promise ? await params : params;
    const { id } = resolvedParams;
    const body = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: 'Agent ID is required' },
        { status: 400 }
      );
    }

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid agent ID format' },
        { status: 400 }
      );
    }

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

    const db = await getDb();
    const airAgentsCollection = db.collection('air_agents');

    // Check if agent exists
    const existingAgent = await airAgentsCollection.findOne({
      _id: new ObjectId(id)
    });

    if (!existingAgent) {
      return NextResponse.json(
        { error: 'Agent not found' },
        { status: 404 }
      );
    }

    // Check if another agent with same email or mobile exists (excluding current)
    const duplicateAgent = await airAgentsCollection.findOne({
      _id: { $ne: new ObjectId(id) },
      $or: [
        { email: body.email.trim() },
        { mobile: body.mobile.trim().replace(/\s+/g, '') }
      ]
    });
    
    if (duplicateAgent) {
      return NextResponse.json(
        { error: 'Agent with this email or mobile number already exists' },
        { status: 400 }
      );
    }

    // Update agent
    const updateData = {
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
      updatedAt: new Date(),
    };

    await airAgentsCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    // Fetch updated agent
    const updatedAgent = await airAgentsCollection.findOne({
      _id: new ObjectId(id)
    });

    // Format agent for frontend
    const formattedAgent = {
      id: updatedAgent._id.toString(),
      _id: updatedAgent._id.toString(),
      agentId: updatedAgent.agentId || updatedAgent._id.toString(),
      idCode: updatedAgent.agentId || updatedAgent._id.toString(),
      name: updatedAgent.name || '',
      personalName: updatedAgent.personalName || '',
      email: updatedAgent.email || '',
      mobile: updatedAgent.mobile || '',
      address: updatedAgent.address || '',
      city: updatedAgent.city || '',
      state: updatedAgent.state || '',
      zipCode: updatedAgent.zipCode || '',
      country: updatedAgent.country || 'Bangladesh',
      nid: updatedAgent.nid || '',
      passport: updatedAgent.passport || '',
      tradeLicense: updatedAgent.tradeLicense || '',
      tinNumber: updatedAgent.tinNumber || '',
      status: updatedAgent.status || 'Active',
      isActive: updatedAgent.isActive !== false && updatedAgent.status !== 'Inactive',
      createdAt: updatedAgent.createdAt ? updatedAgent.createdAt.toISOString() : new Date().toISOString(),
      updatedAt: updatedAgent.updatedAt ? updatedAgent.updatedAt.toISOString() : new Date().toISOString(),
    };

    return NextResponse.json(
      { agent: formattedAgent, data: formattedAgent, message: 'Agent updated successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating air agent:', error);
    return NextResponse.json(
      { error: 'Failed to update air agent', message: error.message },
      { status: 500 }
    );
  }
}

// DELETE air agent
export async function DELETE(request, { params }) {
  try {
    // Handle both sync and async params
    const resolvedParams = params instanceof Promise ? await params : params;
    const { id } = resolvedParams;

    if (!id) {
      return NextResponse.json(
        { error: 'Agent ID is required' },
        { status: 400 }
      );
    }

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid agent ID format' },
        { status: 400 }
      );
    }

    const db = await getDb();
    const airAgentsCollection = db.collection('air_agents');

    // Check if agent exists
    const existingAgent = await airAgentsCollection.findOne({
      _id: new ObjectId(id)
    });

    if (!existingAgent) {
      return NextResponse.json(
        { error: 'Agent not found' },
        { status: 404 }
      );
    }

    // Soft delete - set status to inactive instead of hard delete
    await airAgentsCollection.updateOne(
      { _id: new ObjectId(id) },
      { 
        $set: { 
          status: 'Inactive',
          isActive: false,
          updatedAt: new Date()
        } 
      }
    );

    return NextResponse.json(
      { message: 'Agent deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting air agent:', error);
    return NextResponse.json(
      { error: 'Failed to delete air agent', message: error.message },
      { status: 500 }
    );
  }
}

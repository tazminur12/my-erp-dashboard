import { NextResponse } from 'next/server';
import { getDb } from '../../../../lib/mongodb';
import { ObjectId } from 'mongodb';

// GET single agent
export async function GET(request, { params }) {
  try {
    const resolvedParams = params instanceof Promise ? await params : params;
    const { id } = resolvedParams;

    if (!id) {
      return NextResponse.json(
        { error: 'Agent ID is required' },
        { status: 400 }
      );
    }

    const db = await getDb();
    const agentsCollection = db.collection('agents');

    let agent = null;
    if (ObjectId.isValid(id)) {
      agent = await agentsCollection.findOne({ _id: new ObjectId(id) });
    }

    if (!agent) {
      return NextResponse.json(
        { error: 'Agent not found' },
        { status: 404 }
      );
    }

    console.log('📊 Agent API - Raw agent data:', {
      id: agent._id.toString(),
      totalDue: agent.totalDue,
      hajDue: agent.hajDue,
      umrahDue: agent.umrahDue,
      totalPaid: agent.totalPaid,
      hajPaid: agent.hajPaid,
      umrahPaid: agent.umrahPaid,
      totalDeposit: agent.totalDeposit,
      totalBilled: agent.totalBilled,
      hajBilled: agent.hajBilled,
      umrahBilled: agent.umrahBilled,
      totalAdvance: agent.totalAdvance,
      hajAdvance: agent.hajAdvance,
      umrahAdvance: agent.umrahAdvance
    });

    const formattedAgent = {
      id: agent._id.toString(),
      _id: agent._id.toString(),
      agentId: agent.agentId || agent._id.toString(),
      tradeName: agent.tradeName || '',
      tradeLocation: agent.tradeLocation || '',
      ownerName: agent.ownerName || '',
      contactNo: agent.contactNo || '',
      dob: agent.dob || '',
      nid: agent.nid || '',
      passport: agent.passport || '',
      profilePicture: agent.profilePicture || agent.profile_picture || '',
      email: agent.email || '',
      licenseNumber: agent.licenseNumber || agent.license_number || '',
      bankAccount: agent.bankAccount || agent.bank_account || '',
      paymentMethod: agent.paymentMethod || agent.payment_method || '',
      totalRevenue: agent.totalRevenue || agent.total_revenue || 0,
      commissionRate: agent.commissionRate || agent.commission_rate || 0,
      pendingPayments: agent.pendingPayments || agent.pending_payments || 0,
      totalDue: agent.totalDue !== undefined ? agent.totalDue : (agent.total_due || 0),
      hajDue: agent.hajDue !== undefined ? agent.hajDue : (agent.haj_due || 0),
      umrahDue: agent.umrahDue !== undefined ? agent.umrahDue : (agent.umrah_due || 0),
      totalPaid: agent.totalPaid !== undefined ? agent.totalPaid : (agent.total_paid || 0),
      hajPaid: agent.hajPaid !== undefined ? agent.hajPaid : (agent.haj_paid || 0),
      umrahPaid: agent.umrahPaid !== undefined ? agent.umrahPaid : (agent.umrah_paid || 0),
      totalDeposit: agent.totalDeposit !== undefined ? agent.totalDeposit : (agent.total_deposit || 0),
      hajDeposit: agent.hajDeposit !== undefined ? agent.hajDeposit : (agent.haj_deposit || 0),
      umrahDeposit: agent.umrahDeposit !== undefined ? agent.umrahDeposit : (agent.umrah_deposit || 0),
      totalBilled: agent.totalBilled !== undefined ? agent.totalBilled : (agent.total_billed || agent.totalBill || agent.totalBillAmount || 0),
      hajBilled: agent.hajBilled !== undefined ? agent.hajBilled : (agent.haj_billed || agent.hajBill || agent.hajjBill || 0),
      umrahBilled: agent.umrahBilled !== undefined ? agent.umrahBilled : (agent.umrah_billed || agent.umrahBill || 0),
      totalAdvance: agent.totalAdvance !== undefined ? agent.totalAdvance : (agent.total_advance || 0),
      hajAdvance: agent.hajAdvance !== undefined ? agent.hajAdvance : (agent.haj_advance || 0),
      umrahAdvance: agent.umrahAdvance !== undefined ? agent.umrahAdvance : (agent.umrah_advance || 0),
      hajAdvance: agent.hajAdvance || agent.haj_advance || 0,
      umrahAdvance: agent.umrahAdvance || agent.umrah_advance || 0,
      totalProfit: agent.totalProfit || agent.total_profit || 0,
      hajProfit: agent.hajProfit || agent.haj_profit || 0,
      umrahProfit: agent.umrahProfit || agent.umrah_profit || 0,
      isActive: agent.isActive !== undefined ? agent.isActive : (agent.status === 'active' || agent.status === 'Active'),
      status: agent.status || 'active',
      lastActivity: agent.lastActivity || agent.last_activity || agent.updated_at || agent.created_at,
      created_at: agent.created_at ? (agent.created_at.toISOString ? agent.created_at.toISOString() : agent.created_at) : '',
      updated_at: agent.updated_at ? (agent.updated_at.toISOString ? agent.updated_at.toISOString() : agent.updated_at) : '',
    };

    return NextResponse.json({ agent: formattedAgent }, { status: 200 });
  } catch (error) {
    console.error('Error fetching agent:', error);
    return NextResponse.json(
      { error: 'Failed to fetch agent', message: error.message },
      { status: 500 }
    );
  }
}

// PUT update agent
export async function PUT(request, { params }) {
  try {
    const resolvedParams = params instanceof Promise ? await params : params;
    const { id } = resolvedParams;
    const body = await request.json();
    const { tradeName, tradeLocation, ownerName, contactNo, dob, nid, passport, profilePicture } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Agent ID is required' },
        { status: 400 }
      );
    }

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

    // Check if agent exists
    let existingAgent = null;
    if (ObjectId.isValid(id)) {
      existingAgent = await agentsCollection.findOne({ _id: new ObjectId(id) });
    }

    if (!existingAgent) {
      return NextResponse.json(
        { error: 'Agent not found' },
        { status: 404 }
      );
    }

    // Check if trade name already exists for another agent
    const duplicateAgent = await agentsCollection.findOne({
      tradeName: tradeName.trim(),
      _id: { $ne: new ObjectId(id) }
    });

    if (duplicateAgent) {
      return NextResponse.json(
        { error: 'Agent with this trade name already exists' },
        { status: 400 }
      );
    }

    // Update agent
    const updateData = {
      tradeName: tradeName.trim(),
      tradeLocation: tradeLocation.trim(),
      ownerName: ownerName.trim(),
      contactNo: contactNo.trim(),
      dob: dob || '',
      nid: nid ? nid.trim() : '',
      passport: passport ? passport.trim() : '',
      profilePicture: profilePicture || '',
      updated_at: new Date(),
    };

    await agentsCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    const updatedAgent = await agentsCollection.findOne({ _id: new ObjectId(id) });

    const formattedAgent = {
      id: updatedAgent._id.toString(),
      _id: updatedAgent._id.toString(),
      ...updateData,
      status: updatedAgent.status || 'active',
      created_at: updatedAgent.created_at ? updatedAgent.created_at.toISOString() : '',
      updated_at: updateData.updated_at.toISOString(),
    };

    return NextResponse.json(
      { message: 'Agent updated successfully', agent: formattedAgent },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating agent:', error);
    return NextResponse.json(
      { error: 'Failed to update agent', message: error.message },
      { status: 500 }
    );
  }
}

// DELETE agent
export async function DELETE(request, { params }) {
  try {
    const resolvedParams = params instanceof Promise ? await params : params;
    const { id } = resolvedParams;

    if (!id) {
      return NextResponse.json(
        { error: 'Agent ID is required' },
        { status: 400 }
      );
    }

    const db = await getDb();
    const agentsCollection = db.collection('agents');

    // Find agent
    let existingAgent = null;
    if (ObjectId.isValid(id)) {
      existingAgent = await agentsCollection.findOne({ _id: new ObjectId(id) });
    }

    if (!existingAgent) {
      return NextResponse.json(
        { error: 'Agent not found' },
        { status: 404 }
      );
    }

    // Hard delete - permanently remove from database
    const deleteResult = await agentsCollection.deleteOne({ _id: new ObjectId(id) });

    if (deleteResult.deletedCount === 0) {
      return NextResponse.json(
        { error: 'Failed to delete agent' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: 'Agent deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting agent:', error);
    return NextResponse.json(
      { error: 'Failed to delete agent', message: error.message },
      { status: 500 }
    );
  }
}

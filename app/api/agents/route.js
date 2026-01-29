import { NextResponse } from 'next/server';
import { getDb } from '../../../lib/mongodb';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../lib/auth';
import { getBranchFilter, getBranchInfo } from '../../../lib/branchHelper';

// GET all agents
export async function GET(request) {
  try {
    // Get user session for branch filtering
    const userSession = await getServerSession(authOptions);
    const branchFilter = getBranchFilter(userSession);
    
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status'); // Optional filter by status
    const search = searchParams.get('search'); // Optional search

    const db = await getDb();
    const agentsCollection = db.collection('agents');

    // Build query with branch filter
    const query = { ...branchFilter };

    if (search) {
      query.$or = [
        { tradeName: { $regex: search, $options: 'i' } },
        { ownerName: { $regex: search, $options: 'i' } },
        { contactNo: { $regex: search, $options: 'i' } },
        { agentId: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Filter by status - default to active only (exclude deleted/inactive agents)
    if (status === 'all') {
      // Show all agents including inactive
    } else if (status) {
      query.status = status;
    } else {
      // Default: only show active agents (hide soft-deleted)
      query.$or = [
        { status: 'active' },
        { status: { $exists: false } }, // Include old records without status
        { status: null },
        { status: '' }
      ];
    }

    const agents = await agentsCollection
      .find(query)
      .sort({ created_at: -1 })
      .toArray();

    // Get packages collection to calculate financial data
    const packagesCollection = db.collection('packages');
    
    // Format agents for frontend with calculated financial data from packages
    const formattedAgents = await Promise.all(agents.map(async (agent) => {
      const agentId = agent._id.toString();
      
      // Fetch all packages for this agent
      const agentPackages = await packagesCollection.find({
        $or: [
          { agentId: agentId },
          { agent_id: agentId },
          { 'agentInfo.agentId': agentId },
          { 'agentInfo._id': agentId }
        ]
      }).toArray();
      
      // Helper to resolve numbers safely
      const resolveNumber = (...values) => {
        for (const value of values) {
          if (value !== undefined && value !== null) {
            if (typeof value === 'number' && !Number.isNaN(value)) return value;
            if (typeof value === 'string') {
              const cleaned = value.replace(/[^0-9.-]/g, '');
              if (cleaned) {
                const numericValue = Number(cleaned);
                if (!Number.isNaN(numericValue)) return numericValue;
              }
            }
          }
        }
        return 0;
      };

      // Calculate financial totals from packages
      let hajjBill = 0, umrahBill = 0;
      let hajjPaid = 0, umrahPaid = 0;
      
      for (const pkg of agentPackages) {
        // Logic from AgentDetails page - Exactly matching field precedence
        const pkgTotal = resolveNumber(
          pkg.financialSummary?.totalBilled,
          pkg.financialSummary?.billTotal,
          pkg.financialSummary?.subtotal,
          pkg.paymentSummary?.totalBilled,
          pkg.paymentSummary?.billTotal,
          pkg.totalPrice,
          pkg.totalPriceBdt,
          pkg.totals?.grandTotal,
          pkg.totals?.subtotal,
          pkg.profitLoss?.packagePrice,
          pkg.profitLoss?.totalOriginalPrice
        );
  
        const pkgPaid = resolveNumber(
          pkg.financialSummary?.totalPaid,
          pkg.financialSummary?.paidAmount,
          pkg.paymentSummary?.totalPaid,
          pkg.paymentSummary?.paid,
          pkg.payments?.totalPaid,
          pkg.payments?.paid,
          pkg.totalPaid,
          pkg.depositReceived,
          pkg.receivedAmount
        );
        
        const isHajj = pkg.packageType === 'Hajj' || 
                       pkg.packageType === 'হজ্জ' || 
                       pkg.customPackageType === 'Custom Hajj' ||
                       pkg.customPackageType === 'Hajj';
        
        if (isHajj) {
          hajjBill += Number(pkgTotal) || 0;
          hajjPaid += Number(pkgPaid) || 0;
        } else {
          umrahBill += Number(pkgTotal) || 0;
          umrahPaid += Number(pkgPaid) || 0;
        }
      }
      
      const totalBilled = hajjBill + umrahBill;
      const totalPaid = hajjPaid + umrahPaid;
      
      // Use calculated values, fallback to stored values if no packages
      // For paid/deposit, we prioritize the calculated totalPaid
      const finalTotalBilled = totalBilled || agent.totalBilled || agent.totalBill || 0;
      const finalTotalPaid = totalPaid || agent.totalPaid || 0;
      const finalTotalDeposit = finalTotalPaid; // Total Deposit is effectively Total Paid in this context

      // Recalculate Due based on the FINAL Billed and Paid to ensure consistency
      // This matches AgentDetails page logic which falls back to stored agent totals
      const finalTotalDue = Math.max(0, finalTotalBilled - finalTotalPaid);

      const finalHajjBilled = hajjBill || agent.hajBilled || 0;
      const finalHajjPaid = hajjPaid || agent.hajPaid || 0;
      const finalHajjDue = Math.max(0, finalHajjBilled - finalHajjPaid);

      const finalUmrahBilled = umrahBill || agent.umrahBilled || 0;
      const finalUmrahPaid = umrahPaid || agent.umrahPaid || 0;
      const finalUmrahDue = Math.max(0, finalUmrahBilled - finalUmrahPaid);
      
      return {
        id: agentId,
        _id: agentId,
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
        // Calculated balance fields from packages
        totalBilled: finalTotalBilled,
        totalBill: finalTotalBilled,
        totalDue: finalTotalDue,
        hajDue: finalHajjDue,
        umrahDue: finalUmrahDue,
        hajBill: finalHajjBilled,
        umrahBill: finalUmrahBilled,
        totalPaid: finalTotalPaid,
        hajPaid: finalHajjPaid,
        umrahPaid: finalUmrahPaid,
        totalDeposit: finalTotalDeposit,
        totalAdvance: totalPaid > totalBilled ? (totalPaid - totalBilled) : (agent.totalAdvance || 0),
        hajAdvance: hajjPaid > hajjBill ? (hajjPaid - hajjBill) : (agent.hajAdvance || 0),
        umrahAdvance: umrahPaid > umrahBill ? (umrahPaid - umrahBill) : (agent.umrahAdvance || 0),
        packagesCount: agentPackages.length,
        created_at: agent.created_at ? agent.created_at.toISOString() : '',
        updated_at: agent.updated_at ? agent.updated_at.toISOString() : '',
      };
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
    // Get user session for branch info
    const userSession = await getServerSession(authOptions);
    const branchInfo = getBranchInfo(userSession);
    
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
      branchId: branchInfo.branchId,
      branchName: branchInfo.branchName,
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

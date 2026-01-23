import { NextResponse } from 'next/server';
import { getDb } from '../../../lib/mongodb';

// GET all agent packages
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const agentId = searchParams.get('agentId');
    const status = searchParams.get('status');
    const limitParam = searchParams.get('limit');
    const limit = limitParam ? parseInt(limitParam) : null; // No limit by default
    const page = parseInt(searchParams.get('page')) || 1;
    const skip = limit ? (page - 1) * limit : 0;

    const db = await getDb();
    const packagesCollection = db.collection('agent_packages');

    // Build query
    const query = {};
    if (agentId) {
      // Try to convert string agentId to ObjectId if needed
      try {
        const { ObjectId } = await import('mongodb');
        if (ObjectId.isValid(agentId)) {
          query.agentId = new ObjectId(agentId);
        } else {
          query.agentId = agentId;
        }
      } catch (e) {
        query.agentId = agentId;
      }
    }
    if (status) {
      query.status = status;
    }

    // Get total count for pagination
    const total = await packagesCollection.countDocuments(query);
    console.log(`Found ${total} packages in database`);

    // Fetch packages
    let queryBuilder = packagesCollection
      .find(query)
      .sort({ createdAt: -1 })
      .skip(skip);
    
    // Only apply limit if specified
    if (limit) {
      queryBuilder = queryBuilder.limit(limit);
    }
    
    const packages = await queryBuilder.toArray();
    console.log(`Fetched ${packages.length} packages from database`);

        // Fetch agent details for each package
    const agentsCollection = db.collection('agents');
    const packagesWithAgents = await Promise.all(
      packages.map(async (pkg) => {
        try {
          let agent = null;
          if (pkg.agentId) {
            try {
              // Handle both ObjectId and string agentId
              let agentQuery = {};
              const { ObjectId } = await import('mongodb');
              if (ObjectId.isValid(pkg.agentId)) {
                agentQuery._id = pkg.agentId instanceof ObjectId ? pkg.agentId : new ObjectId(pkg.agentId);
              } else {
                agentQuery._id = pkg.agentId;
              }
              
              const agentDoc = await agentsCollection.findOne(agentQuery);
              if (agentDoc) {
                agent = {
                  _id: agentDoc._id.toString(),
                  tradeName: agentDoc.tradeName || '',
                  ownerName: agentDoc.ownerName || '',
                  contact: agentDoc.contactNo || agentDoc.contact || '',
                  location: agentDoc.tradeLocation || agentDoc.location || '',
                };
              }
            } catch (err) {
              console.error('Error fetching agent:', err);
            }
          }

          return {
            id: pkg._id ? pkg._id.toString() : '',
            _id: pkg._id ? pkg._id.toString() : '',
            packageName: pkg.packageName || '',
            packageYear: pkg.packageYear || '',
            packageType: pkg.packageType || '',
            customPackageType: pkg.customPackageType || '',
            sarToBdtRate: pkg.sarToBdtRate || 0,
            status: pkg.status || 'Active',
            notes: pkg.notes || '',
            agentId: pkg.agentId ? (pkg.agentId.toString ? pkg.agentId.toString() : String(pkg.agentId)) : '',
            agent: agent,
            costs: pkg.costs || {},
            totals: pkg.totals || {},
            bangladeshAirfarePassengers: pkg.bangladeshAirfarePassengers || [],
            bangladeshBusPassengers: pkg.bangladeshBusPassengers || [],
            bangladeshTrainingOtherPassengers: pkg.bangladeshTrainingOtherPassengers || [],
            bangladeshVisaPassengers: pkg.bangladeshVisaPassengers || [],
            saudiVisaPassengers: pkg.saudiVisaPassengers || [],
            saudiMakkahHotelPassengers: pkg.saudiMakkahHotelPassengers || [],
            saudiMadinaHotelPassengers: pkg.saudiMadinaHotelPassengers || [],
            saudiMakkahFoodPassengers: pkg.saudiMakkahFoodPassengers || [],
            saudiMadinaFoodPassengers: pkg.saudiMadinaFoodPassengers || [],
            saudiMakkahZiyaraPassengers: pkg.saudiMakkahZiyaraPassengers || [],
            saudiMadinaZiyaraPassengers: pkg.saudiMadinaZiyaraPassengers || [],
            saudiTransportPassengers: pkg.saudiTransportPassengers || [],
            saudiCampFeePassengers: pkg.saudiCampFeePassengers || [],
            saudiAlMashayerPassengers: pkg.saudiAlMashayerPassengers || [],
            saudiOthersPassengers: pkg.saudiOthersPassengers || [],
            attachments: pkg.attachments || [],
            assignedCustomers: pkg.assignedCustomers || [],
            profitLoss: pkg.profitLoss || {},
            totalPrice: pkg.totals?.grandTotal || 0,
            isActive: pkg.status === 'Active' || pkg.isActive !== false,
            createdAt: pkg.createdAt 
              ? (pkg.createdAt instanceof Date ? pkg.createdAt.toISOString() : new Date(pkg.createdAt).toISOString())
              : (pkg._id && typeof pkg._id.getTimestamp === 'function' ? pkg._id.getTimestamp().toISOString() : new Date().toISOString()),
            updatedAt: pkg.updatedAt 
              ? (pkg.updatedAt instanceof Date ? pkg.updatedAt.toISOString() : new Date(pkg.updatedAt).toISOString())
              : (pkg.createdAt 
                ? (pkg.createdAt instanceof Date ? pkg.createdAt.toISOString() : new Date(pkg.createdAt).toISOString())
                : (pkg._id && typeof pkg._id.getTimestamp === 'function' ? pkg._id.getTimestamp().toISOString() : new Date().toISOString())),
          };
        } catch (err) {
          console.error('Error processing package:', err, pkg);
          return null;
        }
      })
    );
    
    // Filter out any null packages (from errors)
    const validPackages = packagesWithAgents.filter(pkg => pkg !== null);
    console.log(`Processed ${validPackages.length} valid packages`);

    return NextResponse.json(
      {
        data: validPackages,
        total: validPackages.length,
        page,
        limit: limit || validPackages.length, // Return total if no limit
        totalPages: limit ? Math.ceil(total / limit) : 1,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching agent packages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch agent packages', message: error.message },
      { status: 500 }
    );
  }
}

// POST create new agent package
export async function POST(request) {
  try {
    const body = await request.json();
    const {
      packageName,
      packageYear,
      packageType,
      customPackageType,
      sarToBdtRate,
      notes,
      agentId,
      status,
      costs,
      totals,
      bangladeshAirfarePassengers,
      bangladeshBusPassengers,
      bangladeshTrainingOtherPassengers,
      bangladeshVisaPassengers,
      saudiVisaPassengers,
      saudiMakkahHotelPassengers,
      saudiMadinaHotelPassengers,
      saudiMakkahFoodPassengers,
      saudiMadinaFoodPassengers,
      saudiMakkahZiyaraPassengers,
      saudiMadinaZiyaraPassengers,
      saudiTransportPassengers,
      saudiCampFeePassengers,
      saudiAlMashayerPassengers,
      saudiOthersPassengers,
      attachments,
    } = body;

    // Validation
    if (!packageName || !packageName.trim()) {
      return NextResponse.json(
        { error: 'Package name is required' },
        { status: 400 }
      );
    }

    if (!packageYear) {
      return NextResponse.json(
        { error: 'Package year is required' },
        { status: 400 }
      );
    }

    if (!agentId) {
      return NextResponse.json(
        { error: 'Agent ID is required' },
        { status: 400 }
      );
    }

    const db = await getDb();
    const packagesCollection = db.collection('agent_packages');
    const agentsCollection = db.collection('agents');

    // Verify agent exists
    const { ObjectId } = await import('mongodb');
    let agentQuery = {};
    if (ObjectId.isValid(agentId)) {
      agentQuery._id = new ObjectId(agentId);
    } else {
      agentQuery._id = agentId;
    }
    
    const agent = await agentsCollection.findOne(agentQuery);
    if (!agent) {
      return NextResponse.json(
        { error: 'Agent not found' },
        { status: 404 }
      );
    }
    
    // Store agentId as ObjectId for consistency
    const agentObjectId = agent._id instanceof ObjectId ? agent._id : new ObjectId(agent._id);

    // Calculate grand total from totals
    const grandTotal = totals?.grandTotal || 0;

    // Create new package
    const newPackage = {
      packageName: packageName.trim(),
      packageYear,
      packageType: packageType || 'Regular',
      customPackageType: customPackageType || '',
      sarToBdtRate: parseFloat(sarToBdtRate) || 0,
      notes: notes || '',
      agentId: agentObjectId,
      status: status || 'Active',
      costs: costs || {},
      totals: totals || {},
      bangladeshAirfarePassengers: bangladeshAirfarePassengers || [],
      bangladeshBusPassengers: bangladeshBusPassengers || [],
      bangladeshTrainingOtherPassengers: bangladeshTrainingOtherPassengers || [],
      bangladeshVisaPassengers: bangladeshVisaPassengers || [],
      saudiVisaPassengers: saudiVisaPassengers || [],
      saudiMakkahHotelPassengers: saudiMakkahHotelPassengers || [],
      saudiMadinaHotelPassengers: saudiMadinaHotelPassengers || [],
      saudiMakkahFoodPassengers: saudiMakkahFoodPassengers || [],
      saudiMadinaFoodPassengers: saudiMadinaFoodPassengers || [],
      saudiMakkahZiyaraPassengers: saudiMakkahZiyaraPassengers || [],
      saudiMadinaZiyaraPassengers: saudiMadinaZiyaraPassengers || [],
      saudiTransportPassengers: saudiTransportPassengers || [],
      saudiCampFeePassengers: saudiCampFeePassengers || [],
      saudiAlMashayerPassengers: saudiAlMashayerPassengers || [],
      saudiOthersPassengers: saudiOthersPassengers || [],
      attachments: attachments || [],
      assignedCustomers: [],
      profitLoss: {
        costingPrice: grandTotal,
        packagePrice: grandTotal,
        profitOrLoss: 0,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await packagesCollection.insertOne(newPackage);

    // Update agent's due amount (add package cost to due)
    const currentDue = parseFloat(agent.dueAmount || 0);
    const newDue = currentDue + grandTotal;
    await agentsCollection.updateOne(
      { _id: agentObjectId },
      {
        $set: {
          dueAmount: newDue,
          updated_at: new Date(),
        },
      }
    );

    // Return created package
    const createdPackage = {
      id: result.insertedId.toString(),
      _id: result.insertedId.toString(),
      ...newPackage,
      createdAt: newPackage.createdAt.toISOString(),
      updatedAt: newPackage.updatedAt.toISOString(),
    };

    return NextResponse.json(
      { message: 'Agent package created successfully', package: createdPackage },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating agent package:', error);
    return NextResponse.json(
      { error: 'Failed to create agent package', message: error.message },
      { status: 500 }
    );
  }
}

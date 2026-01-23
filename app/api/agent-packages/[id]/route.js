import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { getDb } from '../../../../lib/mongodb';

// GET single agent package
export async function GET(request, { params }) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { error: 'Package ID is required' },
        { status: 400 }
      );
    }

    const db = await getDb();
    // Check both collections - first agent_packages, then packages
    let packagesCollection = db.collection('agent_packages');
    let pkg = await packagesCollection.findOne({ _id: new ObjectId(id) });

    // If not found in agent_packages, check packages collection
    if (!pkg) {
      packagesCollection = db.collection('packages');
      pkg = await packagesCollection.findOne({ _id: new ObjectId(id) });
    }

    if (!pkg) {
      return NextResponse.json(
        { error: 'Package not found' },
        { status: 404 }
      );
    }

    // Fetch agent details
    let agent = null;
    if (pkg.agentId) {
      const agentsCollection = db.collection('agents');
      try {
        let agentQuery = {};
        if (pkg.agentId instanceof ObjectId) {
          agentQuery._id = pkg.agentId;
        } else if (ObjectId.isValid(pkg.agentId)) {
          agentQuery._id = new ObjectId(pkg.agentId);
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

    const formattedPackage = {
      id: pkg._id.toString(),
      _id: pkg._id.toString(),
      packageName: pkg.packageName || '',
      packageYear: pkg.packageYear || '',
      packageType: pkg.packageType || '',
      customPackageType: pkg.customPackageType || '',
      sarToBdtRate: pkg.sarToBdtRate || 0,
      status: pkg.status || 'Active',
      notes: pkg.notes || '',
      agentId: pkg.agentId || '',
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
      createdAt: pkg.createdAt ? pkg.createdAt.toISOString() : pkg._id.getTimestamp().toISOString(),
      updatedAt: pkg.updatedAt ? pkg.updatedAt.toISOString() : pkg.createdAt ? pkg.createdAt.toISOString() : pkg._id.getTimestamp().toISOString(),
    };

    return NextResponse.json(
      { package: formattedPackage, data: formattedPackage },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching agent package:', error);
    return NextResponse.json(
      { error: 'Failed to fetch agent package', message: error.message },
      { status: 500 }
    );
  }
}

// PUT update agent package
export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: 'Package ID is required' },
        { status: 400 }
      );
    }

    const db = await getDb();
    // Check both collections
    let packagesCollection = db.collection('agent_packages');
    let existingPackage = await packagesCollection.findOne({ _id: new ObjectId(id) });
    
    // If not found in agent_packages, check packages collection
    if (!existingPackage) {
      packagesCollection = db.collection('packages');
      existingPackage = await packagesCollection.findOne({ _id: new ObjectId(id) });
    }
    
    if (!existingPackage) {
      return NextResponse.json(
        { error: 'Package not found' },
        { status: 404 }
      );
    }

    // Prepare update data
    const updateData = {
      updatedAt: new Date(),
    };

    if (body.packageName !== undefined) updateData.packageName = body.packageName.trim();
    if (body.packageYear !== undefined) updateData.packageYear = body.packageYear;
    if (body.packageType !== undefined) updateData.packageType = body.packageType;
    if (body.customPackageType !== undefined) updateData.customPackageType = body.customPackageType;
    if (body.sarToBdtRate !== undefined) updateData.sarToBdtRate = parseFloat(body.sarToBdtRate) || 0;
    if (body.notes !== undefined) updateData.notes = body.notes;
    if (body.status !== undefined) updateData.status = body.status;
    if (body.costs !== undefined) updateData.costs = body.costs;
    if (body.totals !== undefined) updateData.totals = body.totals;
    if (body.bangladeshAirfarePassengers !== undefined) updateData.bangladeshAirfarePassengers = body.bangladeshAirfarePassengers;
    if (body.bangladeshBusPassengers !== undefined) updateData.bangladeshBusPassengers = body.bangladeshBusPassengers;
    if (body.bangladeshTrainingOtherPassengers !== undefined) updateData.bangladeshTrainingOtherPassengers = body.bangladeshTrainingOtherPassengers;
    if (body.bangladeshVisaPassengers !== undefined) updateData.bangladeshVisaPassengers = body.bangladeshVisaPassengers;
    if (body.saudiVisaPassengers !== undefined) updateData.saudiVisaPassengers = body.saudiVisaPassengers;
    if (body.saudiMakkahHotelPassengers !== undefined) updateData.saudiMakkahHotelPassengers = body.saudiMakkahHotelPassengers;
    if (body.saudiMadinaHotelPassengers !== undefined) updateData.saudiMadinaHotelPassengers = body.saudiMadinaHotelPassengers;
    if (body.saudiMakkahFoodPassengers !== undefined) updateData.saudiMakkahFoodPassengers = body.saudiMakkahFoodPassengers;
    if (body.saudiMadinaFoodPassengers !== undefined) updateData.saudiMadinaFoodPassengers = body.saudiMadinaFoodPassengers;
    if (body.saudiMakkahZiyaraPassengers !== undefined) updateData.saudiMakkahZiyaraPassengers = body.saudiMakkahZiyaraPassengers;
    if (body.saudiMadinaZiyaraPassengers !== undefined) updateData.saudiMadinaZiyaraPassengers = body.saudiMadinaZiyaraPassengers;
    if (body.saudiTransportPassengers !== undefined) updateData.saudiTransportPassengers = body.saudiTransportPassengers;
    if (body.saudiCampFeePassengers !== undefined) updateData.saudiCampFeePassengers = body.saudiCampFeePassengers;
    if (body.saudiAlMashayerPassengers !== undefined) updateData.saudiAlMashayerPassengers = body.saudiAlMashayerPassengers;
    if (body.saudiOthersPassengers !== undefined) updateData.saudiOthersPassengers = body.saudiOthersPassengers;
    if (body.attachments !== undefined) updateData.attachments = body.attachments;

    // Update profitLoss if totals changed
    if (body.totals) {
      const grandTotal = body.totals.grandTotal || 0;
      updateData.profitLoss = {
        costingPrice: grandTotal,
        packagePrice: grandTotal,
        profitOrLoss: 0,
      };
    }

    // Update package
    await packagesCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    // Fetch updated package
    const updatedPackage = await packagesCollection.findOne({ _id: new ObjectId(id) });

    // Fetch agent details
    let agent = null;
    if (updatedPackage.agentId) {
      const agentsCollection = db.collection('agents');
      try {
        let agentQuery = {};
        if (updatedPackage.agentId instanceof ObjectId) {
          agentQuery._id = updatedPackage.agentId;
        } else if (ObjectId.isValid(updatedPackage.agentId)) {
          agentQuery._id = new ObjectId(updatedPackage.agentId);
        } else {
          agentQuery._id = updatedPackage.agentId;
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

    const formattedPackage = {
      id: updatedPackage._id.toString(),
      _id: updatedPackage._id.toString(),
      packageName: updatedPackage.packageName || '',
      packageYear: updatedPackage.packageYear || '',
      packageType: updatedPackage.packageType || '',
      customPackageType: updatedPackage.customPackageType || '',
      sarToBdtRate: updatedPackage.sarToBdtRate || 0,
      status: updatedPackage.status || 'Active',
      notes: updatedPackage.notes || '',
      agentId: updatedPackage.agentId || '',
      agent: agent,
      costs: updatedPackage.costs || {},
      totals: updatedPackage.totals || {},
      bangladeshAirfarePassengers: updatedPackage.bangladeshAirfarePassengers || [],
      bangladeshBusPassengers: updatedPackage.bangladeshBusPassengers || [],
      bangladeshTrainingOtherPassengers: updatedPackage.bangladeshTrainingOtherPassengers || [],
      bangladeshVisaPassengers: updatedPackage.bangladeshVisaPassengers || [],
      saudiVisaPassengers: updatedPackage.saudiVisaPassengers || [],
      saudiMakkahHotelPassengers: updatedPackage.saudiMakkahHotelPassengers || [],
      saudiMadinaHotelPassengers: updatedPackage.saudiMadinaHotelPassengers || [],
      saudiMakkahFoodPassengers: updatedPackage.saudiMakkahFoodPassengers || [],
      saudiMadinaFoodPassengers: updatedPackage.saudiMadinaFoodPassengers || [],
      saudiMakkahZiyaraPassengers: updatedPackage.saudiMakkahZiyaraPassengers || [],
      saudiMadinaZiyaraPassengers: updatedPackage.saudiMadinaZiyaraPassengers || [],
      saudiTransportPassengers: updatedPackage.saudiTransportPassengers || [],
      saudiCampFeePassengers: updatedPackage.saudiCampFeePassengers || [],
      saudiAlMashayerPassengers: updatedPackage.saudiAlMashayerPassengers || [],
      saudiOthersPassengers: updatedPackage.saudiOthersPassengers || [],
      attachments: updatedPackage.attachments || [],
      assignedCustomers: updatedPackage.assignedCustomers || [],
      profitLoss: updatedPackage.profitLoss || {},
      totalPrice: updatedPackage.totals?.grandTotal || 0,
      isActive: updatedPackage.status === 'Active' || updatedPackage.isActive !== false,
      createdAt: updatedPackage.createdAt ? updatedPackage.createdAt.toISOString() : updatedPackage._id.getTimestamp().toISOString(),
      updatedAt: updatedPackage.updatedAt ? updatedPackage.updatedAt.toISOString() : updatedPackage.createdAt ? updatedPackage.createdAt.toISOString() : updatedPackage._id.getTimestamp().toISOString(),
    };

    return NextResponse.json(
      { message: 'Agent package updated successfully', package: formattedPackage },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating agent package:', error);
    return NextResponse.json(
      { error: 'Failed to update agent package', message: error.message },
      { status: 500 }
    );
  }
}

// DELETE agent package
export async function DELETE(request, { params }) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { error: 'Package ID is required' },
        { status: 400 }
      );
    }

    const db = await getDb();
    // Check both collections
    let packagesCollection = db.collection('agent_packages');
    let pkg = await packagesCollection.findOne({ _id: new ObjectId(id) });
    
    // If not found in agent_packages, check packages collection
    if (!pkg) {
      packagesCollection = db.collection('packages');
      pkg = await packagesCollection.findOne({ _id: new ObjectId(id) });
    }
    
    const agentsCollection = db.collection('agents');

    if (!pkg) {
      return NextResponse.json(
        { error: 'Package not found' },
        { status: 404 }
      );
    }

    // Update agent's due amount (subtract package cost from due)
    if (pkg.agentId) {
      let agentQuery = {};
      if (pkg.agentId instanceof ObjectId) {
        agentQuery._id = pkg.agentId;
      } else if (ObjectId.isValid(pkg.agentId)) {
        agentQuery._id = new ObjectId(pkg.agentId);
      } else {
        agentQuery._id = pkg.agentId;
      }
      
      const agent = await agentsCollection.findOne(agentQuery);
      if (agent) {
        const currentDue = parseFloat(agent.dueAmount || 0);
        const packageCost = pkg.totals?.grandTotal || 0;
        const newDue = Math.max(0, currentDue - packageCost);
        
        await agentsCollection.updateOne(
          agentQuery,
          {
            $set: {
              dueAmount: newDue,
              updated_at: new Date(),
            },
          }
        );
      }
    }

    // Delete package
    await packagesCollection.deleteOne({ _id: new ObjectId(id) });

    return NextResponse.json(
      { message: 'Agent package deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting agent package:', error);
    return NextResponse.json(
      { error: 'Failed to delete agent package', message: error.message },
      { status: 500 }
    );
  }
}

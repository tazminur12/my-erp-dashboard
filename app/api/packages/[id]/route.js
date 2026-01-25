import { NextResponse } from 'next/server';
import { getDb } from '../../../../lib/mongodb';
import { ObjectId } from 'mongodb';

// GET single package
export async function GET(request, { params }) {
  try {
    const resolvedParams = params instanceof Promise ? await params : params;
    const { id } = resolvedParams;

    if (!id) {
      return NextResponse.json(
        { error: 'Package ID is required' },
        { status: 400 }
      );
    }

    const db = await getDb();
    const packagesCollection = db.collection('packages');

    let packageData = null;
    if (ObjectId.isValid(id)) {
      packageData = await packagesCollection.findOne({ _id: new ObjectId(id) });
    }

    if (!packageData) {
      return NextResponse.json(
        { error: 'Package not found', id: id },
        { status: 404 }
      );
    }

    // Fetch agent details if agentId exists
    let agent = null;
    const agentId = packageData.agentId || packageData.agent_id;
    if (agentId) {
      const agentsCollection = db.collection('agents');
      try {
        let agentQuery = {};
        if (agentId instanceof ObjectId) {
          agentQuery._id = agentId;
        } else if (ObjectId.isValid(agentId)) {
          agentQuery._id = new ObjectId(agentId);
        } else {
          agentQuery._id = agentId;
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

    // Format package for frontend
    const formattedPackage = {
      id: packageData._id.toString(),
      _id: packageData._id.toString(),
      packageName: packageData.packageName || packageData.name || '',
      name: packageData.packageName || packageData.name || '',
      packageYear: packageData.packageYear || packageData.year || '',
      year: packageData.packageYear || packageData.year || '',
      packageMonth: packageData.packageMonth || packageData.month || '',
      month: packageData.packageMonth || packageData.month || '',
      packageType: packageData.packageType || '',
      customPackageType: packageData.customPackageType || '',
      sarToBdtRate: packageData.sarToBdtRate || 0,
      status: packageData.status || 'Active',
      notes: packageData.notes || '',
      agentId: agentId ? (agentId.toString ? agentId.toString() : String(agentId)) : '',
      agent: agent,
      costs: packageData.costs || {},
      totals: packageData.totals || {},
      bangladeshAirfarePassengers: packageData.bangladeshAirfarePassengers || [],
      bangladeshBusPassengers: packageData.bangladeshBusPassengers || [],
      bangladeshTrainingOtherPassengers: packageData.bangladeshTrainingOtherPassengers || [],
      bangladeshVisaPassengers: packageData.bangladeshVisaPassengers || [],
      saudiVisaPassengers: packageData.saudiVisaPassengers || [],
      saudiMakkahHotelPassengers: packageData.saudiMakkahHotelPassengers || [],
      saudiMadinaHotelPassengers: packageData.saudiMadinaHotelPassengers || [],
      saudiMakkahFoodPassengers: packageData.saudiMakkahFoodPassengers || [],
      saudiMadinaFoodPassengers: packageData.saudiMadinaFoodPassengers || [],
      saudiMakkahZiyaraPassengers: packageData.saudiMakkahZiyaraPassengers || [],
      saudiMadinaZiyaraPassengers: packageData.saudiMadinaZiyaraPassengers || [],
      saudiTransportPassengers: packageData.saudiTransportPassengers || [],
      saudiCampFeePassengers: packageData.saudiCampFeePassengers || [],
      saudiAlMashayerPassengers: packageData.saudiAlMashayerPassengers || [],
      saudiOthersPassengers: packageData.saudiOthersPassengers || [],
      attachments: packageData.attachments || [],
      assignedCustomers: packageData.assignedCustomers || [],
      profitLoss: packageData.profitLoss || {},
      totalPrice: packageData.totalPrice || packageData.totals?.grandTotal || 0,
      isActive: packageData.isActive !== undefined ? packageData.isActive : (packageData.status === 'Active'),
      created_at: packageData.created_at 
        ? (packageData.created_at instanceof Date ? packageData.created_at.toISOString() : new Date(packageData.created_at).toISOString())
        : (packageData._id && typeof packageData._id.getTimestamp === 'function' ? packageData._id.getTimestamp().toISOString() : new Date().toISOString()),
      updated_at: packageData.updated_at 
        ? (packageData.updated_at instanceof Date ? packageData.updated_at.toISOString() : new Date(packageData.updated_at).toISOString())
        : (packageData.created_at 
          ? (packageData.created_at instanceof Date ? packageData.created_at.toISOString() : new Date(packageData.created_at).toISOString())
          : (packageData._id && typeof packageData._id.getTimestamp === 'function' ? packageData._id.getTimestamp().toISOString() : new Date().toISOString())),
    };

    return NextResponse.json({ package: formattedPackage, data: formattedPackage }, { status: 200 });
  } catch (error) {
    console.error('Error fetching package:', error);
    return NextResponse.json(
      { error: 'Failed to fetch package', message: error.message },
      { status: 500 }
    );
  }
}

// PUT update package
export async function PUT(request, { params }) {
  try {
    const resolvedParams = params instanceof Promise ? await params : params;
    const { id } = resolvedParams;
    const body = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: 'Package ID is required' },
        { status: 400 }
      );
    }

    const db = await getDb();
    const packagesCollection = db.collection('packages');

    // Find package
    let existingPackage = null;
    if (ObjectId.isValid(id)) {
      existingPackage = await packagesCollection.findOne({ _id: new ObjectId(id) });
    }

    if (!existingPackage) {
      return NextResponse.json(
        { error: 'Package not found' },
        { status: 404 }
      );
    }

    // Update package
    const updateData = {
      ...body,
      updated_at: new Date(),
    };

    // Remove _id from update data if present
    delete updateData._id;
    delete updateData.id;

    // Ensure totalPrice is set from totals.grandTotal if not provided
    if (body.totals?.grandTotal && !body.totalPrice) {
      updateData.totalPrice = body.totals.grandTotal;
      updateData.costingPrice = body.totals.grandTotal;
    }

    await packagesCollection.updateOne(
      { _id: existingPackage._id },
      { $set: updateData }
    );

    // Update agent's financial summary if agentId exists
    const agentId = existingPackage.agentId || existingPackage.agent_id || body.agentId || body.agent_id;
    if (agentId) {
      const agentsCollection = db.collection('agents');
      try {
        let agentQuery = {};
        if (ObjectId.isValid(agentId)) {
          agentQuery._id = new ObjectId(agentId);
        } else {
          agentQuery._id = agentId;
        }
        
        // Get all packages for this agent to recalculate totals
        const agentPackages = await packagesCollection.find({
          $or: [
            { agentId: agentId },
            { agent_id: agentId },
            { 'agentInfo.agentId': agentId },
            { 'agentInfo._id': agentId }
          ]
        }).toArray();

        // Calculate totals for hajj and umrah separately
        let hajjBill = 0, umrahBill = 0;
        let hajjPaid = 0, umrahPaid = 0;
        
        for (const pkg of agentPackages) {
          const pkgTotal = pkg.totalPrice || pkg.totals?.grandTotal || 0;
          const pkgPaid = pkg.totalPaid || pkg.paymentSummary?.totalPaid || 0;
          
          const isHajj = pkg.packageType === 'Hajj' || 
                         pkg.packageType === 'হজ্জ' || 
                         pkg.customPackageType === 'Custom Hajj' ||
                         pkg.customPackageType === 'Hajj';
          
          if (isHajj) {
            hajjBill += pkgTotal;
            hajjPaid += pkgPaid;
          } else {
            umrahBill += pkgTotal;
            umrahPaid += pkgPaid;
          }
        }

        const totalBilled = hajjBill + umrahBill;
        const totalPaid = hajjPaid + umrahPaid;
        const totalDue = Math.max(0, totalBilled - totalPaid);
        const hajjDue = Math.max(0, hajjBill - hajjPaid);
        const umrahDue = Math.max(0, umrahBill - umrahPaid);

        await agentsCollection.updateOne(
          agentQuery,
          {
            $set: {
              totalBilled: totalBilled,
              totalBill: totalBilled,
              totalPaid: totalPaid,
              totalDue: totalDue,
              hajBill: hajjBill,
              hajjBill: hajjBill,
              hajPaid: hajjPaid,
              hajjPaid: hajjPaid,
              hajDue: hajjDue,
              umrahBill: umrahBill,
              umrahPaid: umrahPaid,
              umrahDue: umrahDue,
              updated_at: new Date(),
            },
          }
        );
        console.log('Updated agent financial summary:', { 
          agentId, totalBilled, totalPaid, totalDue, 
          hajjBill, hajjPaid, hajjDue, 
          umrahBill, umrahPaid, umrahDue 
        });
      } catch (err) {
        console.error('Error updating agent financial summary:', err);
      }
    }

    // Fetch updated package
    const updatedPackage = await packagesCollection.findOne({ _id: existingPackage._id });

    // Fetch agent details if agentId exists
    let agent = null;
    const updatedAgentId = updatedPackage.agentId || updatedPackage.agent_id;
    if (updatedAgentId) {
      const agentsCollection = db.collection('agents');
      try {
        let agentQuery = {};
        if (updatedAgentId instanceof ObjectId) {
          agentQuery._id = updatedAgentId;
        } else if (ObjectId.isValid(updatedAgentId)) {
          agentQuery._id = new ObjectId(updatedAgentId);
        } else {
          agentQuery._id = updatedAgentId;
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
      packageName: updatedPackage.packageName || updatedPackage.name || '',
      name: updatedPackage.packageName || updatedPackage.name || '',
      packageYear: updatedPackage.packageYear || updatedPackage.year || '',
      year: updatedPackage.packageYear || updatedPackage.year || '',
      packageMonth: updatedPackage.packageMonth || updatedPackage.month || '',
      month: updatedPackage.packageMonth || updatedPackage.month || '',
      packageType: updatedPackage.packageType || '',
      customPackageType: updatedPackage.customPackageType || '',
      sarToBdtRate: updatedPackage.sarToBdtRate || 0,
      status: updatedPackage.status || 'Active',
      notes: updatedPackage.notes || '',
      agentId: updatedAgentId ? (updatedAgentId.toString ? updatedAgentId.toString() : String(updatedAgentId)) : '',
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
      totalPrice: updatedPackage.totalPrice || updatedPackage.totals?.grandTotal || 0,
      isActive: updatedPackage.isActive !== undefined ? updatedPackage.isActive : (updatedPackage.status === 'Active'),
      created_at: updatedPackage.created_at 
        ? (updatedPackage.created_at instanceof Date ? updatedPackage.created_at.toISOString() : new Date(updatedPackage.created_at).toISOString())
        : (updatedPackage._id && typeof updatedPackage._id.getTimestamp === 'function' ? updatedPackage._id.getTimestamp().toISOString() : new Date().toISOString()),
      updated_at: updatedPackage.updated_at 
        ? (updatedPackage.updated_at instanceof Date ? updatedPackage.updated_at.toISOString() : new Date(updatedPackage.updated_at).toISOString())
        : (updatedPackage.created_at 
          ? (updatedPackage.created_at instanceof Date ? updatedPackage.created_at.toISOString() : new Date(updatedPackage.created_at).toISOString())
          : (updatedPackage._id && typeof updatedPackage._id.getTimestamp === 'function' ? updatedPackage._id.getTimestamp().toISOString() : new Date().toISOString())),
    };

    return NextResponse.json(
      { message: 'Package updated successfully', package: formattedPackage, data: formattedPackage },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating package:', error);
    return NextResponse.json(
      { error: 'Failed to update package', message: error.message },
      { status: 500 }
    );
  }
}

// DELETE package
export async function DELETE(request, { params }) {
  try {
    const resolvedParams = params instanceof Promise ? await params : params;
    const { id } = resolvedParams;

    if (!id) {
      return NextResponse.json(
        { error: 'Package ID is required' },
        { status: 400 }
      );
    }

    const db = await getDb();
    const packagesCollection = db.collection('packages');

    // Find package
    let existingPackage = null;
    if (ObjectId.isValid(id)) {
      existingPackage = await packagesCollection.findOne({ _id: new ObjectId(id) });
    }

    if (!existingPackage) {
      return NextResponse.json(
        { error: 'Package not found' },
        { status: 404 }
      );
    }

    // Update agent's due amount (subtract package cost from due) if agentId exists
    const agentId = existingPackage.agentId || existingPackage.agent_id;
    if (agentId) {
      const agentsCollection = db.collection('agents');
      try {
        let agentQuery = {};
        if (agentId instanceof ObjectId) {
          agentQuery._id = agentId;
        } else if (ObjectId.isValid(agentId)) {
          agentQuery._id = new ObjectId(agentId);
        } else {
          agentQuery._id = agentId;
        }
        
        const agent = await agentsCollection.findOne(agentQuery);
        if (agent) {
          const currentDue = parseFloat(agent.dueAmount || 0);
          const packageCost = existingPackage.totals?.grandTotal || existingPackage.totalPrice || 0;
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
      } catch (err) {
        console.error('Error updating agent due amount:', err);
      }
    }

    // Delete package permanently
    await packagesCollection.deleteOne({ _id: existingPackage._id });

    return NextResponse.json(
      { message: 'Package deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting package:', error);
    return NextResponse.json(
      { error: 'Failed to delete package', message: error.message },
      { status: 500 }
    );
  }
}

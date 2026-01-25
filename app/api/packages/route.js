import { NextResponse } from 'next/server';
import { getDb } from '../../../lib/mongodb';

// GET all packages
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const customPackageType = searchParams.get('customPackageType');
    const packageType = searchParams.get('packageType');
    const status = searchParams.get('status');
    const agentId = searchParams.get('agentId');
    const limit = parseInt(searchParams.get('limit')) || 1000;
    const page = parseInt(searchParams.get('page')) || 1;
    const skip = (page - 1) * limit;

    const db = await getDb();
    const packagesCollection = db.collection('packages');

    // Build query
    const query = {};
    if (customPackageType) {
      query.customPackageType = customPackageType;
    }
    if (packageType) {
      query.packageType = packageType;
    }
    if (status) {
      query.status = status;
    }
    if (agentId) {
      query.$or = [
        { agentId: agentId },
        { agent_id: agentId },
        { 'agentInfo.agentId': agentId },
        { 'agentInfo._id': agentId }
      ];
    }

    // Get total count for pagination
    const total = await packagesCollection.countDocuments(query);

    // Fetch packages
    const packages = await packagesCollection
      .find(query)
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    // Format packages for frontend
    const formattedPackages = packages.map((pkg) => {
      // Calculate totalPrice from totals if not set
      const grandTotal = pkg.totals?.grandTotal || 0;
      const subtotal = pkg.totals?.subtotal || 0;
      const calculatedTotalPrice = pkg.totalPrice || grandTotal || subtotal || 0;
      
      return {
        id: pkg._id.toString(),
        _id: pkg._id.toString(),
        packageName: pkg.packageName || pkg.name || '',
        name: pkg.packageName || pkg.name || '',
        packageYear: pkg.packageYear || pkg.year || '',
        year: pkg.packageYear || pkg.year || '',
        packageMonth: pkg.packageMonth || pkg.month || '',
        month: pkg.packageMonth || pkg.month || '',
        packageType: pkg.packageType || '',
        customPackageType: pkg.customPackageType || '',
        sarToBdtRate: pkg.sarToBdtRate || 0,
        status: pkg.status || 'Active',
        notes: pkg.notes || '',
        costs: pkg.costs || {},
        totals: {
          ...pkg.totals,
          grandTotal: grandTotal,
          subtotal: subtotal,
        },
        assignedCustomers: pkg.assignedCustomers || [],
        financialSummary: {
          totalBilled: calculatedTotalPrice,
          totalPaid: pkg.totalPaid || pkg.paymentSummary?.totalPaid || 0,
          totalDue: Math.max(0, calculatedTotalPrice - (pkg.totalPaid || pkg.paymentSummary?.totalPaid || 0)),
          ...pkg.financialSummary,
        },
        paymentSummary: pkg.paymentSummary || {},
        profitLoss: pkg.profitLoss || {},
        totalPrice: calculatedTotalPrice,
        totalPriceBdt: pkg.totalPriceBdt || calculatedTotalPrice,
        costingPrice: pkg.costingPrice || grandTotal || 0,
        totalPaid: pkg.totalPaid || pkg.paymentSummary?.totalPaid || 0,
        depositReceived: pkg.depositReceived || 0,
        receivedAmount: pkg.receivedAmount || 0,
        isActive: pkg.isActive !== undefined ? pkg.isActive : (pkg.status === 'Active'),
        agentId: pkg.agentId || pkg.agent_id || '',
        agent_id: pkg.agentId || pkg.agent_id || '',
        created_at: pkg.created_at || pkg._id.getTimestamp().toISOString(),
        updated_at: pkg.updated_at || pkg.created_at || pkg._id.getTimestamp().toISOString(),
      };
    });

    return NextResponse.json(
      {
        data: formattedPackages,
        packages: formattedPackages, // For compatibility
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching packages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch packages', message: error.message },
      { status: 500 }
    );
  }
}

// POST create new package
export async function POST(request) {
  try {
    const body = await request.json();

    // Validation
    if (!body.packageName || !body.packageName.trim()) {
      return NextResponse.json(
        { error: 'Package name is required' },
        { status: 400 }
      );
    }

    if (!body.packageYear) {
      return NextResponse.json(
        { error: 'Package year is required' },
        { status: 400 }
      );
    }

    const db = await getDb();
    const packagesCollection = db.collection('packages');

    // Check if package name already exists (optional - you might want to allow duplicates)
    // const existingPackage = await packagesCollection.findOne({
    //   packageName: body.packageName.trim()
    // });
    // if (existingPackage) {
    //   return NextResponse.json(
    //     { error: 'Package with this name already exists' },
    //     { status: 400 }
    //   );
    // }

    // Create new package
    const newPackage = {
      packageName: body.packageName.trim(),
      packageYear: body.packageYear,
      packageMonth: body.packageMonth || '',
      packageType: body.packageType || 'Regular',
      customPackageType: body.customPackageType || 'Custom Umrah',
      sarToBdtRate: parseFloat(body.sarToBdtRate) || 0,
      status: body.status || 'Active',
      notes: body.notes || '',
      agentId: body.agentId || body.agent_id || '',
      agent_id: body.agentId || body.agent_id || '',
      costs: body.costs || {},
      totals: body.totals || {},
      bangladeshAirfarePassengers: body.bangladeshAirfarePassengers || [],
      bangladeshBusPassengers: body.bangladeshBusPassengers || [],
      bangladeshTrainingOtherPassengers: body.bangladeshTrainingOtherPassengers || [],
      bangladeshVisaPassengers: body.bangladeshVisaPassengers || [],
      saudiVisaPassengers: body.saudiVisaPassengers || [],
      saudiMakkahHotelPassengers: body.saudiMakkahHotelPassengers || [],
      saudiMadinaHotelPassengers: body.saudiMadinaHotelPassengers || [],
      saudiMakkahFoodPassengers: body.saudiMakkahFoodPassengers || [],
      saudiMadinaFoodPassengers: body.saudiMadinaFoodPassengers || [],
      saudiMakkahZiyaraPassengers: body.saudiMakkahZiyaraPassengers || [],
      saudiMadinaZiyaraPassengers: body.saudiMadinaZiyaraPassengers || [],
      saudiTransportPassengers: body.saudiTransportPassengers || [],
      saudiCampFeePassengers: body.saudiCampFeePassengers || [],
      saudiAlMashayerPassengers: body.saudiAlMashayerPassengers || [],
      saudiOthersPassengers: body.saudiOthersPassengers || [],
      attachments: body.attachments || [],
      created_at: new Date(),
      updated_at: new Date(),
    };

    const result = await packagesCollection.insertOne(newPackage);

    // Return created package
    const createdPackage = {
      id: result.insertedId.toString(),
      _id: result.insertedId.toString(),
      ...newPackage,
      created_at: newPackage.created_at.toISOString(),
      updated_at: newPackage.updated_at.toISOString(),
    };

    return NextResponse.json(
      { message: 'Package created successfully', package: createdPackage, data: createdPackage },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating package:', error);
    return NextResponse.json(
      { error: 'Failed to create package', message: error.message },
      { status: 500 }
    );
  }
}

import { NextResponse } from 'next/server';
import { getDb } from '../../../lib/mongodb';

// GET all family assets
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q') || '';
    const type = searchParams.get('type') || '';
    const status = searchParams.get('status') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    const db = await getDb();
    const familyAssetsCollection = db.collection('family_assets');

    // Build query
    const query = {};
    if (type && type !== 'all') {
      query.type = type;
    }
    if (status && status !== 'all') {
      query.status = status;
    }
    if (q) {
      query.$or = [
        { name: { $regex: q, $options: 'i' } },
        { providerCompanyName: { $regex: q, $options: 'i' } },
        { type: { $regex: q, $options: 'i' } }
      ];
    }

    // Get total count for pagination
    const total = await familyAssetsCollection.countDocuments(query);

    // Fetch family assets with pagination
    const skip = (page - 1) * limit;
    const assets = await familyAssetsCollection
      .find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    // Format assets for frontend
    const formattedAssets = assets.map((asset) => ({
      id: asset._id.toString(),
      _id: asset._id.toString(),
      name: asset.name || '',
      type: asset.type || '',
      providerCompanyId: asset.providerCompanyId || '',
      providerCompanyName: asset.providerCompanyName || '',
      totalPaidAmount: Number(asset.totalPaidAmount) || 0,
      paymentType: asset.paymentType || 'one-time',
      paymentDate: asset.paymentDate || '',
      purchaseDate: asset.purchaseDate || '',
      status: asset.status || 'active',
      notes: asset.notes || '',
      numberOfInstallments: asset.numberOfInstallments || 0,
      installmentAmount: Number(asset.installmentAmount) || 0,
      installmentStartDate: asset.installmentStartDate || '',
      installmentEndDate: asset.installmentEndDate || '',
      createdAt: asset.createdAt ? asset.createdAt.toISOString() : asset._id.getTimestamp().toISOString(),
      updatedAt: asset.updatedAt ? asset.updatedAt.toISOString() : null,
    }));

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      success: true,
      assets: formattedAssets,
      data: formattedAssets,
      pagination: {
        page,
        limit,
        total,
        totalPages
      }
    }, { status: 200 });
  } catch (error) {
    console.error('Error fetching family assets:', error);
    return NextResponse.json(
      { error: 'Failed to fetch family assets', message: error.message },
      { status: 500 }
    );
  }
}

// POST create new family asset
export async function POST(request) {
  try {
    const body = await request.json();

    if (!body.name || !body.name.trim()) {
      return NextResponse.json(
        { error: 'Asset name is required' },
        { status: 400 }
      );
    }

    if (!body.type || !body.type.trim()) {
      return NextResponse.json(
        { error: 'Asset type is required' },
        { status: 400 }
      );
    }

    if (!body.totalPaidAmount || Number(body.totalPaidAmount) <= 0) {
      return NextResponse.json(
        { error: 'Total paid amount is required and must be greater than 0' },
        { status: 400 }
      );
    }

    if (!body.purchaseDate) {
      return NextResponse.json(
        { error: 'Purchase date is required' },
        { status: 400 }
      );
    }

    if (body.paymentType === 'one-time' && !body.paymentDate) {
      return NextResponse.json(
        { error: 'Payment date is required for one-time payment' },
        { status: 400 }
      );
    }

    if (body.paymentType === 'installment') {
      if (!body.numberOfInstallments || parseInt(body.numberOfInstallments) <= 0) {
        return NextResponse.json(
          { error: 'Number of installments is required' },
          { status: 400 }
        );
      }
      if (!body.installmentAmount || Number(body.installmentAmount) <= 0) {
        return NextResponse.json(
          { error: 'Installment amount is required' },
          { status: 400 }
        );
      }
      if (!body.installmentStartDate) {
        return NextResponse.json(
          { error: 'Installment start date is required' },
          { status: 400 }
        );
      }
    }

    const db = await getDb();
    const familyAssetsCollection = db.collection('family_assets');

    // Create new family asset
    const newAsset = {
      name: body.name.trim(),
      type: body.type.trim(),
      providerCompanyId: body.providerCompanyId || null,
      providerCompanyName: body.providerCompanyName || '',
      totalPaidAmount: Number(body.totalPaidAmount),
      paymentType: body.paymentType || 'one-time',
      purchaseDate: body.purchaseDate,
      status: body.status || 'active',
      notes: body.notes || '',
      ...(body.paymentType === 'one-time' && {
        paymentDate: body.paymentDate
      }),
      ...(body.paymentType === 'installment' && {
        numberOfInstallments: parseInt(body.numberOfInstallments),
        installmentAmount: Number(body.installmentAmount),
        installmentStartDate: body.installmentStartDate,
        installmentEndDate: body.installmentEndDate
      }),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await familyAssetsCollection.insertOne(newAsset);

    const formattedAsset = {
      id: result.insertedId.toString(),
      _id: result.insertedId.toString(),
      ...newAsset,
      createdAt: newAsset.createdAt.toISOString(),
      updatedAt: newAsset.updatedAt.toISOString(),
    };

    return NextResponse.json({
      success: true,
      message: 'Family asset created successfully',
      asset: formattedAsset,
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating family asset:', error);
    return NextResponse.json(
      { error: 'Failed to create family asset', message: error.message },
      { status: 500 }
    );
  }
}

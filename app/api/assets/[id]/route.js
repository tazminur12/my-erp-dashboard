import { NextResponse } from 'next/server';
import { getDb } from '../../../../lib/mongodb';
import { ObjectId } from 'mongodb';

// GET single asset by ID
export async function GET(request, { params }) {
  try {
    const resolvedParams = params instanceof Promise ? await params : params;
    const { id } = resolvedParams;

    if (!id) {
      return NextResponse.json(
        { error: 'Asset ID is required' },
        { status: 400 }
      );
    }

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid asset ID format' },
        { status: 400 }
      );
    }

    const db = await getDb();
    const assetsCollection = db.collection('assets');

    const asset = await assetsCollection.findOne({
      _id: new ObjectId(id)
    });

    if (!asset) {
      return NextResponse.json(
        { error: 'Asset not found' },
        { status: 404 }
      );
    }

    // Format asset for frontend
    const formattedAsset = {
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
    };

    return NextResponse.json({
      success: true,
      asset: formattedAsset,
      data: formattedAsset,
    }, { status: 200 });
  } catch (error) {
    console.error('Error fetching asset:', error);
    return NextResponse.json(
      { error: 'Failed to fetch asset', message: error.message },
      { status: 500 }
    );
  }
}

// PUT update asset
export async function PUT(request, { params }) {
  try {
    const resolvedParams = params instanceof Promise ? await params : params;
    const { id } = resolvedParams;
    const body = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: 'Asset ID is required' },
        { status: 400 }
      );
    }

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid asset ID format' },
        { status: 400 }
      );
    }

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

    const db = await getDb();
    const assetsCollection = db.collection('assets');

    // Check if asset exists
    const existingAsset = await assetsCollection.findOne({
      _id: new ObjectId(id)
    });

    if (!existingAsset) {
      return NextResponse.json(
        { error: 'Asset not found' },
        { status: 404 }
      );
    }

    // Update asset
    const updateData = {
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
        paymentDate: body.paymentDate,
        numberOfInstallments: null,
        installmentAmount: null,
        installmentStartDate: null,
        installmentEndDate: null
      }),
      ...(body.paymentType === 'installment' && {
        numberOfInstallments: parseInt(body.numberOfInstallments),
        installmentAmount: Number(body.installmentAmount),
        installmentStartDate: body.installmentStartDate,
        installmentEndDate: body.installmentEndDate,
        paymentDate: null
      }),
      updatedAt: new Date(),
    };

    await assetsCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    const updatedAsset = {
      id: id,
      _id: id,
      ...updateData,
      createdAt: existingAsset.createdAt ? existingAsset.createdAt.toISOString() : existingAsset._id.getTimestamp().toISOString(),
      updatedAt: updateData.updatedAt.toISOString(),
    };

    return NextResponse.json({
      success: true,
      message: 'Asset updated successfully',
      asset: updatedAsset,
    }, { status: 200 });
  } catch (error) {
    console.error('Error updating asset:', error);
    return NextResponse.json(
      { error: 'Failed to update asset', message: error.message },
      { status: 500 }
    );
  }
}

// DELETE asset
export async function DELETE(request, { params }) {
  try {
    const resolvedParams = params instanceof Promise ? await params : params;
    const { id } = resolvedParams;

    if (!id) {
      return NextResponse.json(
        { error: 'Asset ID is required' },
        { status: 400 }
      );
    }

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid asset ID format' },
        { status: 400 }
      );
    }

    const db = await getDb();
    const assetsCollection = db.collection('assets');

    // Check if asset exists
    const asset = await assetsCollection.findOne({
      _id: new ObjectId(id)
    });

    if (!asset) {
      return NextResponse.json(
        { error: 'Asset not found' },
        { status: 404 }
      );
    }

    // Delete asset
    await assetsCollection.deleteOne({
      _id: new ObjectId(id)
    });

    return NextResponse.json({
      success: true,
      message: 'Asset deleted successfully',
    }, { status: 200 });
  } catch (error) {
    console.error('Error deleting asset:', error);
    return NextResponse.json(
      { error: 'Failed to delete asset', message: error.message },
      { status: 500 }
    );
  }
}

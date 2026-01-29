import { NextResponse } from 'next/server';
import { getDb } from '../../../../lib/mongodb';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../../lib/auth';
import { getBranchFilter, getBranchInfo } from '../../../../lib/branchHelper';
import { ObjectId } from 'mongodb';

// GET all refunds
export async function GET(request) {
  try {
    const userSession = await getServerSession(authOptions);
    const branchFilter = getBranchFilter(userSession);
    
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit')) || 20;
    const page = parseInt(searchParams.get('page')) || 1;
    const skip = (page - 1) * limit;
    const search = searchParams.get('search');
    const status = searchParams.get('status');
    const type = searchParams.get('type');

    const db = await getDb();
    const refundsCollection = db.collection('hajj_umrah_refunds');

    // Build query
    const query = { ...branchFilter };
    
    if (search) {
      query.$or = [
        { customerName: { $regex: search, $options: 'i' } },
        { customerId: { $regex: search, $options: 'i' } },
        { refundId: { $regex: search, $options: 'i' } }
      ];
    }

    if (status) {
      query.status = status;
    }

    if (type) {
      query.customerType = type;
    }

    const refunds = await refundsCollection
      .find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    const total = await refundsCollection.countDocuments(query);

    return NextResponse.json({
      refunds: refunds.map(refund => ({
        ...refund,
        id: refund._id.toString()
      })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    }, { status: 200 });
  } catch (error) {
    console.error('Error fetching refunds:', error);
    return NextResponse.json(
      { error: 'Failed to fetch refunds', message: error.message },
      { status: 500 }
    );
  }
}

// POST create new refund
export async function POST(request) {
  try {
    const userSession = await getServerSession(authOptions);
    const branchInfo = getBranchInfo(userSession);
    
    const body = await request.json();

    if (!body.customerId || !body.amount) {
      return NextResponse.json(
        { error: 'Customer ID and Amount are required' },
        { status: 400 }
      );
    }

    const db = await getDb();
    const refundsCollection = db.collection('hajj_umrah_refunds');

    // Generate refund ID
    const lastRefund = await refundsCollection.findOne({}, { sort: { createdAt: -1 } });
    let refundId = 'REF-0001';
    if (lastRefund && lastRefund.refundId) {
      const lastNumber = parseInt(lastRefund.refundId.split('-')[1]);
      refundId = `REF-${String(lastNumber + 1).padStart(4, '0')}`;
    }

    const newRefund = {
      refundId,
      customerType: body.customerType || 'haji', // haji, umrah, agent
      customerId: body.customerId,
      customerName: body.customerName,
      amount: parseFloat(body.amount) || 0,
      refundDate: body.refundDate || new Date().toISOString(),
      refundMethod: body.refundMethod || 'cash',
      reason: body.reason || '',
      status: body.status || 'pending', // pending, approved, rejected, completed
      notes: body.notes || '',
      branchId: body.branchId || branchInfo.branchId,
      branchName: branchInfo.branchName,
      createdBy: userSession?.user?.id || 'SYSTEM',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await refundsCollection.insertOne(newRefund);

    return NextResponse.json(
      { message: 'Refund request created successfully', refund: { ...newRefund, id: result.insertedId.toString() } },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating refund:', error);
    return NextResponse.json(
      { error: 'Failed to create refund', message: error.message },
      { status: 500 }
    );
  }
}

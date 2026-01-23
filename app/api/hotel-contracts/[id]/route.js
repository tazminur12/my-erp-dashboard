import { NextResponse } from 'next/server';
import { getDb } from '../../../../lib/mongodb';
import { ObjectId } from 'mongodb';

// GET single hotel contract
export async function GET(request, { params }) {
  try {
    const resolvedParams = params instanceof Promise ? await params : params;
    const { id } = resolvedParams;

    if (!id) {
      return NextResponse.json(
        { error: 'Contract ID is required' },
        { status: 400 }
      );
    }

    const db = await getDb();
    const contractsCollection = db.collection('hotel_contracts');

    let contract = null;
    if (ObjectId.isValid(id)) {
      contract = await contractsCollection.findOne({ _id: new ObjectId(id) });
    }

    if (!contract) {
      return NextResponse.json(
        { error: 'Contract not found', id: id },
        { status: 404 }
      );
    }

    const nusukPayment = parseFloat(contract.nusukPayment || 0);
    const cashPayment = parseFloat(contract.cashPayment || 0);
    const otherBills = parseFloat(contract.otherBills || 0);
    const totalBill = parseFloat(contract.totalBill || 0) || (nusukPayment + cashPayment + otherBills);

    const formattedContract = {
      id: contract._id.toString(),
      _id: contract._id.toString(),
      hotelId: contract.hotelId || contract.hotel_id || '',
      contractType: contract.contractType || 'হজ্ব',
      nusukAgencyId: contract.nusukAgencyId || contract.nusuk_agency_id || '',
      requestNumber: contract.requestNumber || contract.request_number || '',
      hotelName: contract.hotelName || contract.hotel_name || '',
      contractNumber: contract.contractNumber || contract.contract_number || '',
      contractStart: contract.contractStart || contract.contract_start || '',
      contractEnd: contract.contractEnd || contract.contract_end || '',
      hajjiCount: contract.hajjiCount || contract.hajji_count || 0,
      nusukPayment: nusukPayment,
      cashPayment: cashPayment,
      otherBills: otherBills,
      totalBill: totalBill,
      created_at: contract.created_at || contract._id.getTimestamp().toISOString(),
      updated_at: contract.updated_at || contract.created_at || contract._id.getTimestamp().toISOString(),
    };

    return NextResponse.json({ contract: formattedContract, data: formattedContract }, { status: 200 });
  } catch (error) {
    console.error('Error fetching contract:', error);
    return NextResponse.json(
      { error: 'Failed to fetch contract', message: error.message },
      { status: 500 }
    );
  }
}

// PUT update hotel contract
export async function PUT(request, { params }) {
  try {
    const resolvedParams = params instanceof Promise ? await params : params;
    const { id } = resolvedParams;
    const body = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: 'Contract ID is required' },
        { status: 400 }
      );
    }

    const db = await getDb();
    const contractsCollection = db.collection('hotel_contracts');

    // Check if contract exists
    let existingContract = null;
    if (ObjectId.isValid(id)) {
      existingContract = await contractsCollection.findOne({ _id: new ObjectId(id) });
    }

    if (!existingContract) {
      return NextResponse.json(
        { error: 'Contract not found' },
        { status: 404 }
      );
    }

    const nusukPayment = parseFloat(body.nusukPayment || 0);
    const cashPayment = parseFloat(body.cashPayment || 0);
    const otherBills = parseFloat(body.otherBills || 0);
    const totalBill = nusukPayment + cashPayment + otherBills;

    // Update contract
    const updateData = {
      contractType: body.contractType,
      nusukAgencyId: body.nusukAgencyId || '',
      nusuk_agency_id: body.nusukAgencyId || '',
      requestNumber: body.requestNumber || '',
      request_number: body.requestNumber || '',
      hotelName: body.hotelName || '',
      hotel_name: body.hotelName || '',
      contractNumber: body.contractNumber,
      contract_number: body.contractNumber,
      contractStart: body.contractStart,
      contract_start: body.contractStart,
      contractEnd: body.contractEnd,
      contract_end: body.contractEnd,
      hajjiCount: parseFloat(body.hajjiCount || 0),
      hajji_count: parseFloat(body.hajjiCount || 0),
      nusukPayment: nusukPayment,
      cashPayment: cashPayment,
      otherBills: otherBills,
      totalBill: totalBill,
      updated_at: new Date().toISOString(),
    };

    await contractsCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    const updatedContract = await contractsCollection.findOne({ _id: new ObjectId(id) });

    const formattedContract = {
      id: updatedContract._id.toString(),
      _id: updatedContract._id.toString(),
      hotelId: updatedContract.hotelId || updatedContract.hotel_id || '',
      ...updateData,
      created_at: updatedContract.created_at || updatedContract._id.getTimestamp().toISOString(),
    };

    return NextResponse.json(
      { contract: formattedContract, message: 'Contract updated successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating contract:', error);
    return NextResponse.json(
      { error: 'Failed to update contract', message: error.message },
      { status: 500 }
    );
  }
}

// DELETE hotel contract
export async function DELETE(request, { params }) {
  try {
    const resolvedParams = params instanceof Promise ? await params : params;
    const { id } = resolvedParams;

    if (!id) {
      return NextResponse.json(
        { error: 'Contract ID is required' },
        { status: 400 }
      );
    }

    const db = await getDb();
    const contractsCollection = db.collection('hotel_contracts');

    // Check if contract exists
    let contract = null;
    if (ObjectId.isValid(id)) {
      contract = await contractsCollection.findOne({ _id: new ObjectId(id) });
    }

    if (!contract) {
      return NextResponse.json(
        { error: 'Contract not found' },
        { status: 404 }
      );
    }

    // Delete contract
    await contractsCollection.deleteOne({ _id: new ObjectId(id) });

    return NextResponse.json(
      { message: 'Contract deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting contract:', error);
    return NextResponse.json(
      { error: 'Failed to delete contract', message: error.message },
      { status: 500 }
    );
  }
}

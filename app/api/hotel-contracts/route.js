import { NextResponse } from 'next/server';
import { getDb } from '../../../lib/mongodb';
import { ObjectId } from 'mongodb';

// GET all hotel contracts
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const hotelId = searchParams.get('hotelId');
    const limit = parseInt(searchParams.get('limit')) || 1000;
    const page = parseInt(searchParams.get('page')) || 1;
    const skip = (page - 1) * limit;

    const db = await getDb();
    const contractsCollection = db.collection('hotel_contracts');

    // Build query
    const query = {};
    if (hotelId) {
      query.$or = [
        { hotelId: hotelId },
        { hotel_id: hotelId }
      ];
    }

    // Get total count for pagination
    const total = await contractsCollection.countDocuments(query);

    // Fetch contracts
    const contracts = await contractsCollection
      .find(query)
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    // Format contracts for frontend
    const formattedContracts = contracts.map((contract) => {
      const nusukPayment = parseFloat(contract.nusukPayment || 0);
      const cashPayment = parseFloat(contract.cashPayment || 0);
      const otherBills = parseFloat(contract.otherBills || 0);
      const totalBill = parseFloat(contract.totalBill || 0) || (nusukPayment + cashPayment + otherBills);

      return {
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
    });

    return NextResponse.json(
      {
        contracts: formattedContracts,
        data: formattedContracts,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching hotel contracts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch hotel contracts', message: error.message },
      { status: 500 }
    );
  }
}

// POST create new hotel contract
export async function POST(request) {
  try {
    const body = await request.json();

    // Validation
    if (!body.hotelId || !body.contractType || !body.contractNumber || !body.contractStart || !body.contractEnd) {
      return NextResponse.json(
        { error: 'Hotel ID, contract type, contract number, start date, and end date are required' },
        { status: 400 }
      );
    }

    const db = await getDb();
    const contractsCollection = db.collection('hotel_contracts');

    const nusukPayment = parseFloat(body.nusukPayment || 0);
    const cashPayment = parseFloat(body.cashPayment || 0);
    const otherBills = parseFloat(body.otherBills || 0);
    const totalBill = nusukPayment + cashPayment + otherBills;

    // Create new contract
    const newContract = {
      hotelId: body.hotelId,
      hotel_id: body.hotelId,
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
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const result = await contractsCollection.insertOne(newContract);

    const formattedContract = {
      id: result.insertedId.toString(),
      _id: result.insertedId.toString(),
      ...newContract,
    };

    return NextResponse.json(
      { contract: formattedContract, message: 'Hotel contract created successfully' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating hotel contract:', error);
    return NextResponse.json(
      { error: 'Failed to create hotel contract', message: error.message },
      { status: 500 }
    );
  }
}

import { NextResponse } from 'next/server';
import { getDb } from '../../../../lib/mongodb';

// GET all IATA & Airlines Capping investments
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status'); // Optional filter
    const investmentType = searchParams.get('investmentType'); // Optional filter

    const db = await getDb();
    const investmentsCollection = db.collection('investments');

    // Build query
    const query = {
      investmentType: { $in: ['IATA', 'Airlines Capping'] }
    };
    if (status) {
      query.status = status;
    }
    if (investmentType) {
      query.investmentType = investmentType;
    }

    const investments = await investmentsCollection
      .find(query)
      .sort({ investmentDate: -1 })
      .toArray();

    // Format investments for frontend
    const formattedInvestments = investments.map((investment) => ({
      id: investment._id.toString(),
      _id: investment._id.toString(),
      investmentType: investment.investmentType || '',
      airlineName: investment.airlineName || '',
      cappingAmount: investment.cappingAmount || 0,
      investmentDate: investment.investmentDate ? investment.investmentDate.toISOString() : '',
      maturityDate: investment.maturityDate ? investment.maturityDate.toISOString() : '',
      interestRate: investment.interestRate || 0,
      status: investment.status || 'active',
      notes: investment.notes || '',
      logo: investment.logo || '',
      created_at: investment.created_at ? investment.created_at.toISOString() : new Date().toISOString(),
      updated_at: investment.updated_at ? investment.updated_at.toISOString() : new Date().toISOString(),
    }));

    return NextResponse.json(
      { 
        investments: formattedInvestments, 
        data: formattedInvestments, 
        count: formattedInvestments.length 
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching investments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch investments', message: error.message },
      { status: 500 }
    );
  }
}

// POST create new IATA & Airlines Capping investment
export async function POST(request) {
  try {
    const body = await request.json();
    const {
      investmentType,
      airlineName,
      cappingAmount,
      investmentDate,
      maturityDate,
      interestRate,
      status,
      notes,
      logo
    } = body;

    // Validation
    if (!airlineName || !airlineName.trim()) {
      return NextResponse.json(
        { error: 'এয়ারলাইন নাম আবশ্যক' },
        { status: 400 }
      );
    }

    if (!cappingAmount || parseFloat(cappingAmount) <= 0) {
      return NextResponse.json(
        { error: 'বিনিয়োগ পরিমাণ আবশ্যক এবং ০ এর চেয়ে বেশি হতে হবে' },
        { status: 400 }
      );
    }

    if (!investmentDate) {
      return NextResponse.json(
        { error: 'বিনিয়োগ তারিখ আবশ্যক' },
        { status: 400 }
      );
    }

    if (!maturityDate) {
      return NextResponse.json(
        { error: 'পরিপক্কতার তারিখ আবশ্যক' },
        { status: 400 }
      );
    }

    // Validate dates
    const investmentDateObj = new Date(investmentDate);
    const maturityDateObj = new Date(maturityDate);
    if (maturityDateObj <= investmentDateObj) {
      return NextResponse.json(
        { error: 'পরিপক্কতার তারিখ বিনিয়োগ তারিখের পরে হতে হবে' },
        { status: 400 }
      );
    }

    if (interestRate === undefined || interestRate === null || interestRate === '' || 
        parseFloat(interestRate) < 0 || parseFloat(interestRate) > 100) {
      return NextResponse.json(
        { error: 'সুদের হার ০ থেকে ১০০ এর মধ্যে হতে হবে' },
        { status: 400 }
      );
    }

    const db = await getDb();
    const investmentsCollection = db.collection('investments');

    // Create new investment
    const newInvestment = {
      investmentType: investmentType || 'IATA',
      airlineName: airlineName.trim(),
      cappingAmount: parseFloat(cappingAmount),
      investmentDate: new Date(investmentDate),
      maturityDate: new Date(maturityDate),
      interestRate: parseFloat(interestRate),
      status: status || 'active',
      notes: notes ? notes.trim() : '',
      logo: logo || '',
      created_at: new Date(),
      updated_at: new Date(),
    };

    const result = await investmentsCollection.insertOne(newInvestment);

    // Return investment
    const createdInvestment = {
      id: result.insertedId.toString(),
      _id: result.insertedId.toString(),
      ...newInvestment,
      investmentDate: newInvestment.investmentDate.toISOString(),
      maturityDate: newInvestment.maturityDate.toISOString(),
      created_at: newInvestment.created_at.toISOString(),
      updated_at: newInvestment.updated_at.toISOString(),
    };

    return NextResponse.json(
      { 
        message: 'IATA & Airlines Capping investment created successfully', 
        investment: createdInvestment 
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating investment:', error);
    return NextResponse.json(
      { error: 'Failed to create investment', message: error.message },
      { status: 500 }
    );
  }
}

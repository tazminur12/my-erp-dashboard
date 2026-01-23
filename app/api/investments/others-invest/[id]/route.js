import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { getDb } from '../../../../../lib/mongodb';

// GET single Others Invest investment
export async function GET(request, { params }) {
  try {
    // Handle both sync and async params
    const resolvedParams = params instanceof Promise ? await params : params;
    const { id } = resolvedParams;

    if (!id) {
      return NextResponse.json(
        { error: 'Investment ID is required' },
        { status: 400 }
      );
    }

    const db = await getDb();
    const investmentsCollection = db.collection('investments');

    let investment = null;

    // Validate ObjectId format
    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid investment ID format', id: id },
        { status: 400 }
      );
    }

    // Try to find by ObjectId - exclude IATA and Airlines Capping
    investment = await investmentsCollection.findOne({
      _id: new ObjectId(id),
      investmentType: { $nin: ['IATA', 'Airlines Capping'] }
    });

    if (!investment) {
      console.log('Investment not found:', { id, isValid: ObjectId.isValid(id) });
      return NextResponse.json(
        { error: 'Investment not found', id: id },
        { status: 404 }
      );
    }

    // Format investment for frontend
    const formattedInvestment = {
      id: investment._id.toString(),
      _id: investment._id.toString(),
      investmentName: investment.investmentName || '',
      investmentType: investment.investmentType || '',
      investmentAmount: investment.investmentAmount || 0,
      returnAmount: investment.returnAmount || 0,
      investmentDate: investment.investmentDate ? investment.investmentDate.toISOString() : '',
      maturityDate: investment.maturityDate ? investment.maturityDate.toISOString() : '',
      interestRate: investment.interestRate || 0,
      status: investment.status || 'active',
      description: investment.description || '',
      notes: investment.notes || '',
      logo: investment.logo || '',
      created_at: investment.created_at ? investment.created_at.toISOString() : new Date().toISOString(),
      updated_at: investment.updated_at ? investment.updated_at.toISOString() : new Date().toISOString(),
    };

    return NextResponse.json(
      { investment: formattedInvestment, data: formattedInvestment },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching investment:', error);
    return NextResponse.json(
      { error: 'Failed to fetch investment', message: error.message },
      { status: 500 }
    );
  }
}

// PUT update Others Invest investment
export async function PUT(request, { params }) {
  try {
    // Handle both sync and async params
    const resolvedParams = params instanceof Promise ? await params : params;
    const { id } = resolvedParams;
    const body = await request.json();
    const {
      investmentName,
      investmentType,
      investmentAmount,
      returnAmount,
      investmentDate,
      maturityDate,
      interestRate,
      status,
      description,
      notes,
      logo
    } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Investment ID is required' },
        { status: 400 }
      );
    }

    // Validation
    if (!investmentName || !investmentName.trim()) {
      return NextResponse.json(
        { error: 'বিনিয়োগ নাম আবশ্যক' },
        { status: 400 }
      );
    }

    if (!investmentType || !investmentType.trim()) {
      return NextResponse.json(
        { error: 'বিনিয়োগ টাইপ আবশ্যক' },
        { status: 400 }
      );
    }

    if (!investmentAmount || parseFloat(investmentAmount) <= 0) {
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

    // Check if investment exists
    const existingInvestment = await investmentsCollection.findOne({
      _id: new ObjectId(id),
      investmentType: { $nin: ['IATA', 'Airlines Capping'] }
    });

    if (!existingInvestment) {
      return NextResponse.json(
        { error: 'Investment not found' },
        { status: 404 }
      );
    }

    // Update investment
    const updateData = {
      investmentName: investmentName.trim(),
      investmentType: investmentType.trim(),
      investmentAmount: parseFloat(investmentAmount),
      returnAmount: returnAmount ? parseFloat(returnAmount) : 0,
      investmentDate: new Date(investmentDate),
      maturityDate: new Date(maturityDate),
      interestRate: parseFloat(interestRate),
      status: status || 'active',
      description: description ? description.trim() : '',
      notes: notes ? notes.trim() : '',
      logo: logo || '',
      updated_at: new Date(),
    };

    await investmentsCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    // Fetch updated investment
    const updatedInvestment = await investmentsCollection.findOne({
      _id: new ObjectId(id)
    });

    // Format investment for frontend
    const formattedInvestment = {
      id: updatedInvestment._id.toString(),
      _id: updatedInvestment._id.toString(),
      investmentName: updatedInvestment.investmentName || '',
      investmentType: updatedInvestment.investmentType || '',
      investmentAmount: updatedInvestment.investmentAmount || 0,
      returnAmount: updatedInvestment.returnAmount || 0,
      investmentDate: updatedInvestment.investmentDate ? updatedInvestment.investmentDate.toISOString() : '',
      maturityDate: updatedInvestment.maturityDate ? updatedInvestment.maturityDate.toISOString() : '',
      interestRate: updatedInvestment.interestRate || 0,
      status: updatedInvestment.status || 'active',
      description: updatedInvestment.description || '',
      notes: updatedInvestment.notes || '',
      logo: updatedInvestment.logo || '',
      created_at: updatedInvestment.created_at ? updatedInvestment.created_at.toISOString() : new Date().toISOString(),
      updated_at: updatedInvestment.updated_at ? updatedInvestment.updated_at.toISOString() : new Date().toISOString(),
    };

    return NextResponse.json(
      { 
        message: 'Others Invest investment updated successfully', 
        investment: formattedInvestment 
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating investment:', error);
    return NextResponse.json(
      { error: 'Failed to update investment', message: error.message },
      { status: 500 }
    );
  }
}

// DELETE Others Invest investment
export async function DELETE(request, { params }) {
  try {
    // Handle both sync and async params
    const resolvedParams = params instanceof Promise ? await params : params;
    const { id } = resolvedParams;

    if (!id) {
      return NextResponse.json(
        { error: 'Investment ID is required' },
        { status: 400 }
      );
    }

    const db = await getDb();
    const investmentsCollection = db.collection('investments');

    // Check if investment exists
    const existingInvestment = await investmentsCollection.findOne({
      _id: new ObjectId(id),
      investmentType: { $nin: ['IATA', 'Airlines Capping'] }
    });

    if (!existingInvestment) {
      return NextResponse.json(
        { error: 'Investment not found' },
        { status: 404 }
      );
    }

    // Delete investment
    await investmentsCollection.deleteOne({
      _id: new ObjectId(id)
    });

    return NextResponse.json(
      { message: 'Others Invest investment deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting investment:', error);
    return NextResponse.json(
      { error: 'Failed to delete investment', message: error.message },
      { status: 500 }
    );
  }
}

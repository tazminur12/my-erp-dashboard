import { NextResponse } from 'next/server';
import { getDb } from '../../../../../lib/mongodb';
import { ObjectId } from 'mongodb';

// GET single loan
export async function GET(request, { params }) {
  try {
    const resolvedParams = await params;
    const { id } = resolvedParams;

    if (!id) {
      return NextResponse.json(
        { error: 'Loan ID is required' },
        { status: 400 }
      );
    }

    const db = await getDb();
    const loansCollection = db.collection('loans_giving');

    let loan;
    try {
      loan = await loansCollection.findOne({ _id: new ObjectId(id) });
    } catch (err) {
      loan = await loansCollection.findOne({ loanId: id });
    }

    if (!loan) {
      return NextResponse.json(
        { error: 'Loan not found' },
        { status: 404 }
      );
    }

    // Format loan for frontend
    const formattedLoan = {
      id: loan._id.toString(),
      _id: loan._id.toString(),
      loanId: loan.loanId || loan._id.toString(),
      firstName: loan.firstName || '',
      lastName: loan.lastName || '',
      fullName: loan.fullName || '',
      fatherName: loan.fatherName || '',
      motherName: loan.motherName || '',
      dateOfBirth: loan.dateOfBirth || '',
      gender: loan.gender || '',
      maritalStatus: loan.maritalStatus || '',
      nidNumber: loan.nidNumber || '',
      nidFrontImage: loan.nidFrontImage || '',
      nidBackImage: loan.nidBackImage || '',
      profilePhoto: loan.profilePhoto || '',
      presentAddress: loan.presentAddress || '',
      permanentAddress: loan.permanentAddress || '',
      district: loan.district || '',
      upazila: loan.upazila || '',
      postCode: loan.postCode || '',
      businessName: loan.businessName || '',
      businessType: loan.businessType || '',
      businessAddress: loan.businessAddress || '',
      businessRegistration: loan.businessRegistration || '',
      businessExperience: loan.businessExperience || '',
      contactPerson: loan.contactPerson || '',
      contactPhone: loan.contactPhone || '',
      contactEmail: loan.contactEmail || '',
      emergencyContact: loan.emergencyContact || '',
      emergencyPhone: loan.emergencyPhone || '',
      commencementDate: loan.commencementDate || '',
      completionDate: loan.completionDate || '',
      commitmentDate: loan.commitmentDate || '',
      notes: loan.notes || '',
      status: loan.status || 'active',
      createdBy: loan.createdBy || '',
      branchId: loan.branchId || '',
      createdAt: loan.createdAt ? loan.createdAt.toISOString() : loan._id.getTimestamp().toISOString(),
      updatedAt: loan.updatedAt ? loan.updatedAt.toISOString() : loan._id.getTimestamp().toISOString(),
    };

    return NextResponse.json({
      loan: formattedLoan,
      data: formattedLoan,
    }, { status: 200 });
  } catch (error) {
    console.error('Error fetching loan:', error);
    return NextResponse.json(
      { error: 'Failed to fetch loan', message: error.message },
      { status: 500 }
    );
  }
}

// PUT update loan
export async function PUT(request, { params }) {
  try {
    const resolvedParams = await params;
    const { id } = resolvedParams;
    const body = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: 'Loan ID is required' },
        { status: 400 }
      );
    }

    const db = await getDb();
    const loansCollection = db.collection('loans_giving');

    // Find loan
    let loan;
    try {
      loan = await loansCollection.findOne({ _id: new ObjectId(id) });
    } catch (err) {
      loan = await loansCollection.findOne({ loanId: id });
    }

    if (!loan) {
      return NextResponse.json(
        { error: 'Loan not found' },
        { status: 404 }
      );
    }

    // Prepare update data
    const updateData = {
      firstName: body.firstName?.trim() || loan.firstName || '',
      lastName: body.lastName?.trim() || loan.lastName || '',
      fullName: body.fullName?.trim() || body.firstName && body.lastName ? `${body.firstName.trim()} ${body.lastName.trim()}`.trim() : loan.fullName || '',
      fatherName: body.fatherName?.trim() || loan.fatherName || null,
      motherName: body.motherName?.trim() || loan.motherName || null,
      dateOfBirth: body.dateOfBirth || loan.dateOfBirth || null,
      gender: body.gender || loan.gender || null,
      maritalStatus: body.maritalStatus || loan.maritalStatus || null,
      nidNumber: body.nidNumber?.trim() || loan.nidNumber || null,
      nidFrontImage: body.nidFrontImage || loan.nidFrontImage || null,
      nidBackImage: body.nidBackImage || loan.nidBackImage || null,
      profilePhoto: body.profilePhoto || loan.profilePhoto || null,
      presentAddress: body.presentAddress?.trim() || loan.presentAddress || null,
      permanentAddress: body.permanentAddress?.trim() || loan.permanentAddress || null,
      district: body.district?.trim() || loan.district || null,
      upazila: body.upazila?.trim() || loan.upazila || null,
      postCode: body.postCode?.trim() || loan.postCode || null,
      businessName: body.businessName?.trim() || loan.businessName || null,
      businessType: body.businessType?.trim() || loan.businessType || null,
      businessAddress: body.businessAddress?.trim() || loan.businessAddress || null,
      businessRegistration: body.businessRegistration?.trim() || loan.businessRegistration || null,
      businessExperience: body.businessExperience?.trim() || loan.businessExperience || null,
      contactPerson: body.contactPerson?.trim() || loan.contactPerson || null,
      contactPhone: body.contactPhone?.trim() || loan.contactPhone || null,
      contactEmail: body.contactEmail?.trim() || loan.contactEmail || null,
      emergencyContact: body.emergencyContact?.trim() || loan.emergencyContact || null,
      emergencyPhone: body.emergencyPhone?.trim() || loan.emergencyPhone || null,
      commencementDate: body.commencementDate || loan.commencementDate || null,
      completionDate: body.completionDate || loan.completionDate || null,
      commitmentDate: body.commitmentDate || loan.commitmentDate || null,
      notes: body.notes?.trim() || loan.notes || null,
      status: body.status || loan.status || 'active',
      updatedAt: new Date(),
    };

    // Update loan
    const updateQuery = ObjectId.isValid(id) 
      ? { _id: new ObjectId(id) }
      : { loanId: id };

    await loansCollection.updateOne(
      updateQuery,
      { $set: updateData }
    );

    // Fetch updated loan
    const updatedLoan = await loansCollection.findOne(updateQuery);

    // Format loan for frontend
    const formattedLoan = {
      id: updatedLoan._id.toString(),
      _id: updatedLoan._id.toString(),
      loanId: updatedLoan.loanId || updatedLoan._id.toString(),
      ...updateData,
      createdAt: updatedLoan.createdAt ? updatedLoan.createdAt.toISOString() : updatedLoan._id.getTimestamp().toISOString(),
      updatedAt: updateData.updatedAt.toISOString(),
    };

    return NextResponse.json({
      success: true,
      message: 'Loan updated successfully',
      loan: formattedLoan,
      data: formattedLoan,
    }, { status: 200 });
  } catch (error) {
    console.error('Error updating loan:', error);
    return NextResponse.json(
      { error: 'Failed to update loan', message: error.message },
      { status: 500 }
    );
  }
}

// DELETE loan
export async function DELETE(request, { params }) {
  try {
    const resolvedParams = await params;
    const { id } = resolvedParams;

    if (!id) {
      return NextResponse.json(
        { error: 'Loan ID is required' },
        { status: 400 }
      );
    }

    const db = await getDb();
    const loansCollection = db.collection('loans_giving');

    // Find and delete loan
    let result;
    try {
      result = await loansCollection.deleteOne({ _id: new ObjectId(id) });
    } catch (err) {
      result = await loansCollection.deleteOne({ loanId: id });
    }

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: 'Loan not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Loan deleted successfully',
    }, { status: 200 });
  } catch (error) {
    console.error('Error deleting loan:', error);
    return NextResponse.json(
      { error: 'Failed to delete loan', message: error.message },
      { status: 500 }
    );
  }
}

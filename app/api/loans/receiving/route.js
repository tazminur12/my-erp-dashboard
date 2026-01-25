import { NextResponse } from 'next/server';
import { getDb } from '../../../../lib/mongodb';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../../lib/auth';
import { getBranchFilter, getBranchInfo } from '../../../../lib/branchHelper';

// POST create new loan receiving
export async function POST(request) {
  try {
    // Get user session for branch info
    const userSession = await getServerSession(authOptions);
    const branchInfo = getBranchInfo(userSession);
    
    const body = await request.json();

    // Validation
    if (!body.firstName || !body.firstName.trim()) {
      return NextResponse.json(
        { error: 'First name is required' },
        { status: 400 }
      );
    }

    if (!body.lastName || !body.lastName.trim()) {
      return NextResponse.json(
        { error: 'Last name is required' },
        { status: 400 }
      );
    }

    const db = await getDb();
    const loansCollection = db.collection('loans_receiving');

    // Generate unique loan ID
    const loansWithIds = await loansCollection
      .find({ loanId: { $regex: /^LR\d+$/i } })
      .toArray();
    
    let maxNumber = 0;
    if (loansWithIds.length > 0) {
      loansWithIds.forEach(loan => {
        if (loan.loanId) {
          const idNumber = parseInt(loan.loanId.toUpperCase().replace(/^LR-?/, '')) || 0;
          if (idNumber > maxNumber) {
            maxNumber = idNumber;
          }
        }
      });
    }
    
    const loanId = `LR${String(maxNumber + 1).padStart(6, '0')}`;

    // Create new loan
    const newLoan = {
      loanId,
      firstName: body.firstName.trim(),
      lastName: body.lastName.trim(),
      fullName: body.fullName || `${body.firstName.trim()} ${body.lastName.trim()}`.trim(),
      fatherName: body.fatherName ? body.fatherName.trim() : null,
      motherName: body.motherName ? body.motherName.trim() : null,
      dateOfBirth: body.dateOfBirth || null,
      gender: body.gender || null,
      maritalStatus: body.maritalStatus || null,
      nidNumber: body.nidNumber ? body.nidNumber.trim() : null,
      nidFrontImage: body.nidFrontImage || null,
      nidBackImage: body.nidBackImage || null,
      profilePhoto: body.profilePhoto || null,
      presentAddress: body.presentAddress ? body.presentAddress.trim() : null,
      permanentAddress: body.permanentAddress ? body.permanentAddress.trim() : null,
      district: body.district || null,
      upazila: body.upazila || null,
      postCode: body.postCode || null,
      businessName: body.businessName ? body.businessName.trim() : null,
      businessType: body.businessType ? body.businessType.trim() : null,
      businessAddress: body.businessAddress ? body.businessAddress.trim() : null,
      businessRegistration: body.businessRegistration ? body.businessRegistration.trim() : null,
      businessExperience: body.businessExperience ? body.businessExperience.trim() : null,
      contactPerson: body.contactPerson ? body.contactPerson.trim() : null,
      contactPhone: body.contactPhone ? body.contactPhone.trim() : null,
      contactEmail: body.contactEmail ? body.contactEmail.trim() : null,
      emergencyContact: body.emergencyContact ? body.emergencyContact.trim() : null,
      emergencyPhone: body.emergencyPhone ? body.emergencyPhone.trim() : null,
      commencementDate: body.commencementDate || new Date().toISOString().split('T')[0],
      completionDate: body.completionDate || null,
      commitmentDate: body.commitmentDate || null,
      notes: body.notes ? body.notes.trim() : null,
      loanDirection: 'receiving',
      type: 'receiving',
      createdBy: body.createdBy || 'unknown_user',
      branchId: branchInfo.branchId || body.branchId || 'main_branch',
      branchName: branchInfo.branchName || body.branchName || '',
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await loansCollection.insertOne(newLoan);

    // Fetch created loan
    const createdLoan = await loansCollection.findOne({
      _id: result.insertedId
    });

    // Format loan for frontend
    const formattedLoan = {
      id: createdLoan._id.toString(),
      _id: createdLoan._id.toString(),
      loanId: createdLoan.loanId,
      ...newLoan,
      createdAt: createdLoan.createdAt.toISOString(),
      updatedAt: createdLoan.updatedAt.toISOString(),
    };

    return NextResponse.json({
      success: true,
      message: 'Loan application submitted successfully',
      loan: formattedLoan,
      data: formattedLoan,
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating loan:', error);
    return NextResponse.json(
      { error: 'Failed to create loan', message: error.message },
      { status: 500 }
    );
  }
}

// GET all receiving loans with search and filters
export async function GET(request) {
  try {
    // Get user session for branch filtering
    const userSession = await getServerSession(authOptions);
    const branchFilter = getBranchFilter(userSession);
    
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || searchParams.get('q');
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const db = await getDb();
    const loansCollection = db.collection('loans_receiving');

    // Build query with branch filter
    const query = {
      loanDirection: 'receiving',
      type: 'receiving',
      ...branchFilter
    };
    
    if (status && status !== 'all') {
      query.status = status;
    }
    
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { fullName: { $regex: search, $options: 'i' } },
        { loanId: { $regex: search, $options: 'i' } },
        { nidNumber: { $regex: search, $options: 'i' } },
        { contactPhone: { $regex: search, $options: 'i' } },
        { contactEmail: { $regex: search, $options: 'i' } },
        { businessName: { $regex: search, $options: 'i' } },
      ];
    }

    // Get total count for pagination
    const total = await loansCollection.countDocuments(query);

    // Calculate skip for pagination
    const skip = (page - 1) * limit;

    const loans = await loansCollection
      .find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    // Format loans for frontend
    const formattedLoans = loans.map((loan) => ({
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
      totalAmount: loan.totalAmount || loan.amount || 0,
      paidAmount: loan.paidAmount || 0,
      remainingAmount: loan.remainingAmount || loan.totalDue || 0,
      notes: loan.notes || '',
      status: loan.status || 'pending',
      loanDirection: 'receiving',
      type: 'receiving',
      createdBy: loan.createdBy || '',
      branchId: loan.branchId || '',
      createdAt: loan.createdAt ? loan.createdAt.toISOString() : loan._id.getTimestamp().toISOString(),
      updatedAt: loan.updatedAt ? loan.updatedAt.toISOString() : loan._id.getTimestamp().toISOString(),
    }));

    return NextResponse.json({
      loans: formattedLoans,
      data: formattedLoans,
      pagination: {
        total,
        currentPage: page,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        pages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: limit,
      },
    }, { status: 200 });
  } catch (error) {
    console.error('Error fetching loans:', error);
    return NextResponse.json(
      { error: 'Failed to fetch loans', message: error.message },
      { status: 500 }
    );
  }
}

import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { getDb } from '../../../../lib/mongodb';

// GET single employee
export async function GET(request, { params }) {
  try {
    // Handle both sync and async params (for Next.js version compatibility)
    const resolvedParams = params instanceof Promise ? await params : params;
    const { id } = resolvedParams;

    if (!id) {
      return NextResponse.json(
        { error: 'Employee ID is required' },
        { status: 400 }
      );
    }

    const db = await getDb();
    const employeesCollection = db.collection('employees');

    let employee = null;

    // Try to find by ObjectId first
    if (ObjectId.isValid(id)) {
      employee = await employeesCollection.findOne({ _id: new ObjectId(id) });
    }

    // If not found by ObjectId, try to find by employeeId (custom ID)
    if (!employee) {
      employee = await employeesCollection.findOne({ employeeId: id });
    }

    if (!employee) {
      return NextResponse.json(
        { error: 'Employee not found', id: id },
        { status: 404 }
      );
    }

    const employeeId = employee._id.toString();
    const employeeIdString = employee.employeeId || employeeId;

    // Calculate statistics
    const hajisCollection = db.collection('hajis');
    const umrahsCollection = db.collection('umrahs');
    const ticketsCollection = db.collection('tickets');
    const passengersCollection = db.collection('passengers');

    // Count hajis where employer_id matches
    const hajiCount = await hajisCollection.countDocuments({
      $or: [
        { employer_id: employeeId },
        { employer_id: employeeIdString },
        { employerId: employeeId },
        { employerId: employeeIdString }
      ]
    });

    // Count umrahs where employer_id matches
    const umrahCount = await umrahsCollection.countDocuments({
      $or: [
        { employer_id: employeeId },
        { employer_id: employeeIdString },
        { employerId: employeeId },
        { employerId: employeeIdString }
      ]
    });

    // Count tickets where employer_id matches
    let ticketCount = 0;
    let ticketSellTotal = 0;
    
    try {
      ticketCount = await ticketsCollection.countDocuments({
        $or: [
          { employer_id: employeeId },
          { employer_id: employeeIdString },
          { employerId: employeeId },
          { employerId: employeeIdString }
        ]
      });

      // Calculate total ticket sales
      const tickets = await ticketsCollection.find({
        $or: [
          { employer_id: employeeId },
          { employer_id: employeeIdString },
          { employerId: employeeId },
          { employerId: employeeIdString }
        ]
      }).toArray();

      ticketSellTotal = tickets.reduce((sum, ticket) => {
        return sum + (parseFloat(ticket.total_amount || ticket.totalAmount || ticket.price || 0));
      }, 0);
    } catch (error) {
      console.error('Error fetching tickets:', error);
      // If tickets collection doesn't exist, try passengers collection
      try {
        ticketCount = await passengersCollection.countDocuments({
          $or: [
            { employer_id: employeeId },
            { employer_id: employeeIdString },
            { employerId: employeeId },
            { employerId: employeeIdString },
            { employee_id: employeeId },
            { employee_id: employeeIdString },
            { employeeId: employeeId },
            { employeeId: employeeIdString }
          ]
        });

        const passengers = await passengersCollection.find({
          $or: [
            { employer_id: employeeId },
            { employer_id: employeeIdString },
            { employerId: employeeId },
            { employerId: employeeIdString },
            { employee_id: employeeId },
            { employee_id: employeeIdString },
            { employeeId: employeeId },
            { employeeId: employeeIdString }
          ]
        }).toArray();

        ticketSellTotal = passengers.reduce((sum, passenger) => {
          return sum + (parseFloat(passenger.total_amount || passenger.totalAmount || passenger.price || 0));
        }, 0);
      } catch (err) {
        console.error('Error fetching passengers:', err);
      }
    }

    // Count additional services (passport, visa, manpower, etc.)
    let additionalServicesCount = 0;
    try {
      const additionalServicesCollection = db.collection('additional_services');
      additionalServicesCount = await additionalServicesCollection.countDocuments({
        $or: [
          { employer_id: employeeId },
          { employer_id: employeeIdString },
          { employerId: employeeId },
          { employerId: employeeIdString }
        ]
      });
    } catch (error) {
      console.error('Error fetching additional services:', error);
    }

    const formattedEmployee = {
      id: employee._id.toString(),
      ...employee,
      statistics: {
        ticketCount,
        ticketSellTotal,
        hajiCount,
        umrahCount,
        additionalServicesCount
      }
    };

    return NextResponse.json({ employee: formattedEmployee }, { status: 200 });
  } catch (error) {
    console.error('Error fetching employee:', error);
    return NextResponse.json(
      { error: 'Failed to fetch employee', message: error.message },
      { status: 500 }
    );
  }
}

// PUT update employee
export async function PUT(request, { params }) {
  try {
    // Handle both sync and async params
    const resolvedParams = params instanceof Promise ? await params : params;
    const { id } = resolvedParams;
    const body = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: 'Employee ID is required' },
        { status: 400 }
      );
    }

    const db = await getDb();
    const employeesCollection = db.collection('employees');

    // Find employee by ObjectId or employeeId
    let existingEmployee = null;
    let query = {};

    if (ObjectId.isValid(id)) {
      query._id = new ObjectId(id);
      existingEmployee = await employeesCollection.findOne(query);
    }

    if (!existingEmployee) {
      query = { employeeId: id };
      existingEmployee = await employeesCollection.findOne(query);
    }

    if (!existingEmployee) {
      return NextResponse.json(
        { error: 'Employee not found' },
        { status: 404 }
      );
    }

    // Check if employee ID is being changed and if it's already taken
    if (body.employeeId && body.employeeId !== existingEmployee.employeeId) {
      const employeeIdExists = await employeesCollection.findOne({
        employeeId: body.employeeId,
        _id: { $ne: existingEmployee._id },
      });
      if (employeeIdExists) {
        return NextResponse.json(
          { error: 'Employee ID already in use by another employee' },
          { status: 400 }
        );
      }
    }

    // Check if email is being changed and if it's already taken
    if (body.email && body.email.toLowerCase() !== existingEmployee.email) {
      const emailExists = await employeesCollection.findOne({
        email: body.email.toLowerCase(),
        _id: { $ne: existingEmployee._id },
      });
      if (emailExists) {
        return NextResponse.json(
          { error: 'Email already in use by another employee' },
          { status: 400 }
        );
      }
    }

    // Update employee
    const updateData = {
      updated_at: new Date(),
    };

    // Personal Information
    if (body.firstName !== undefined) updateData.firstName = body.firstName;
    if (body.lastName !== undefined) updateData.lastName = body.lastName;
    if (body.email !== undefined) updateData.email = body.email.toLowerCase();
    if (body.phone !== undefined) updateData.phone = body.phone;
    if (body.address !== undefined) updateData.address = body.address;
    if (body.dateOfBirth !== undefined) updateData.dateOfBirth = body.dateOfBirth;
    if (body.gender !== undefined) updateData.gender = body.gender;
    if (body.emergencyContact !== undefined) updateData.emergencyContact = body.emergencyContact;
    if (body.emergencyPhone !== undefined) updateData.emergencyPhone = body.emergencyPhone;

    // Employment Information
    if (body.employeeId !== undefined) updateData.employeeId = body.employeeId;
    if (body.position !== undefined) updateData.position = body.position;
    if (body.department !== undefined) updateData.department = body.department;
    if (body.manager !== undefined) updateData.manager = body.manager;
    if (body.joinDate !== undefined) updateData.joinDate = body.joinDate;
    if (body.employmentType !== undefined) updateData.employmentType = body.employmentType;
    if (body.workLocation !== undefined) updateData.workLocation = body.workLocation;
    if (body.branch !== undefined) updateData.branch = body.branch;

    // Salary Information
    if (body.basicSalary !== undefined) updateData.basicSalary = parseFloat(body.basicSalary) || 0;
    if (body.allowances !== undefined) updateData.allowances = parseFloat(body.allowances) || 0;
    if (body.benefits !== undefined) updateData.benefits = body.benefits;
    if (body.bankAccount !== undefined) updateData.bankAccount = body.bankAccount;
    if (body.bankName !== undefined) updateData.bankName = body.bankName;

    // Documents
    if (body.profilePictureUrl !== undefined) updateData.profilePictureUrl = body.profilePictureUrl;
    if (body.nidCopyUrl !== undefined) updateData.nidCopyUrl = body.nidCopyUrl;
    if (body.otherDocuments !== undefined) updateData.otherDocuments = body.otherDocuments;

    // Status
    if (body.status !== undefined) updateData.status = body.status;

    await employeesCollection.updateOne(
      query,
      { $set: updateData }
    );

    // Fetch updated employee
    const updatedEmployee = await employeesCollection.findOne(query);

    const formattedEmployee = {
      id: updatedEmployee._id.toString(),
      ...updatedEmployee,
    };

    return NextResponse.json(
      { message: 'Employee updated successfully', employee: formattedEmployee },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating employee:', error);
    return NextResponse.json(
      { error: 'Failed to update employee', message: error.message },
      { status: 500 }
    );
  }
}

// DELETE employee
export async function DELETE(request, { params }) {
  try {
    // Handle both sync and async params
    const resolvedParams = params instanceof Promise ? await params : params;
    const { id } = resolvedParams;

    if (!id) {
      return NextResponse.json(
        { error: 'Employee ID is required' },
        { status: 400 }
      );
    }

    const db = await getDb();
    const employeesCollection = db.collection('employees');

    // Find employee by ObjectId or employeeId
    let existingEmployee = null;
    let query = {};

    if (ObjectId.isValid(id)) {
      query._id = new ObjectId(id);
      existingEmployee = await employeesCollection.findOne(query);
    }

    if (!existingEmployee) {
      query = { employeeId: id };
      existingEmployee = await employeesCollection.findOne(query);
    }

    if (!existingEmployee) {
      return NextResponse.json(
        { error: 'Employee not found' },
        { status: 404 }
      );
    }

    // Hard delete - permanently remove from database
    const deleteResult = await employeesCollection.deleteOne(query);

    if (deleteResult.deletedCount === 0) {
      return NextResponse.json(
        { error: 'Failed to delete employee' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: 'Employee deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting employee:', error);
    return NextResponse.json(
      { error: 'Failed to delete employee', message: error.message },
      { status: 500 }
    );
  }
}

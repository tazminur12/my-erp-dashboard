import { NextResponse } from 'next/server';
import { getDb } from '../../../lib/mongodb';

// GET all employees
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const branch = searchParams.get('branch');
    const department = searchParams.get('department');
    const status = searchParams.get('status');

    const db = await getDb();
    const employeesCollection = db.collection('employees');

    // Build query
    const query = {};
    if (branch) query.branch = branch;
    if (department) query.department = department;
    if (status) query.status = status;

    const employees = await employeesCollection
      .find(query)
      .sort({ created_at: -1 })
      .toArray();

    // Format employees for frontend
    const formattedEmployees = employees.map((employee) => ({
      id: employee._id.toString(),
      firstName: employee.firstName || '',
      lastName: employee.lastName || '',
      fullName: `${employee.firstName || ''} ${employee.lastName || ''}`.trim(),
      email: employee.email || '',
      phone: employee.phone || '',
      employeeId: employee.employeeId || '',
      position: employee.position || '',
      department: employee.department || '',
      branch: employee.branch || '',
      joinDate: employee.joinDate || '',
      employmentType: employee.employmentType || '',
      status: employee.status || 'active',
      profilePictureUrl: employee.profilePictureUrl || '',
      basicSalary: employee.basicSalary || 0,
      created_at: employee.created_at || employee._id.getTimestamp().toISOString(),
    }));

    return NextResponse.json({ employees: formattedEmployees }, { status: 200 });
  } catch (error) {
    console.error('Error fetching employees:', error);
    return NextResponse.json(
      { error: 'Failed to fetch employees', message: error.message },
      { status: 500 }
    );
  }
}

// POST create new employee
export async function POST(request) {
  try {
    const body = await request.json();

    // Validation
    if (!body.firstName || !body.lastName || !body.email || !body.phone) {
      return NextResponse.json(
        { error: 'First name, last name, email, and phone are required' },
        { status: 400 }
      );
    }

    if (!body.employeeId || !body.position || !body.department || !body.branch) {
      return NextResponse.json(
        { error: 'Employee ID, position, department, and branch are required' },
        { status: 400 }
      );
    }

    const db = await getDb();
    const employeesCollection = db.collection('employees');

    // Check if employee ID already exists
    const existingEmployee = await employeesCollection.findOne({ employeeId: body.employeeId });
    if (existingEmployee) {
      return NextResponse.json(
        { error: 'Employee with this ID already exists' },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingEmail = await employeesCollection.findOne({ email: body.email.toLowerCase() });
    if (existingEmail) {
      return NextResponse.json(
        { error: 'Employee with this email already exists' },
        { status: 400 }
      );
    }

    // Create new employee
    const newEmployee = {
      // Personal Information
      firstName: body.firstName,
      lastName: body.lastName,
      email: body.email.toLowerCase(),
      phone: body.phone,
      address: body.address || '',
      dateOfBirth: body.dateOfBirth || '',
      gender: body.gender || '',
      emergencyContact: body.emergencyContact || '',
      emergencyPhone: body.emergencyPhone || '',

      // Employment Information
      employeeId: body.employeeId,
      position: body.position,
      department: body.department,
      manager: body.manager || '',
      joinDate: body.joinDate || '',
      employmentType: body.employmentType || '',
      workLocation: body.workLocation || '',
      branch: body.branch,

      // Salary Information
      basicSalary: parseFloat(body.basicSalary) || 0,
      allowances: parseFloat(body.allowances) || 0,
      benefits: body.benefits || '',
      bankAccount: body.bankAccount || '',
      bankName: body.bankName || '',

      // Documents
      profilePictureUrl: body.profilePictureUrl || '',
      nidCopyUrl: body.nidCopyUrl || '',
      otherDocuments: body.otherDocuments || [],

      // Status
      status: body.status || 'active',
      created_at: new Date(),
      updated_at: new Date(),
    };

    const result = await employeesCollection.insertOne(newEmployee);

    // Return employee
    const createdEmployee = {
      id: result.insertedId.toString(),
      ...newEmployee,
    };

    return NextResponse.json(
      { message: 'Employee created successfully', employee: createdEmployee },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating employee:', error);
    return NextResponse.json(
      { error: 'Failed to create employee', message: error.message },
      { status: 500 }
    );
  }
}

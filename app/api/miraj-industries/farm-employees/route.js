import { NextResponse } from 'next/server';
import { getDb } from '../../../../lib/mongodb';

// GET all farm employees
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 1000;
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';

    const db = await getDb();
    const employeesCollection = db.collection('farm_employees');

    // Build query
    const query = {};
    if (status && status !== 'all') {
      query.status = status;
    }
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { position: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (page - 1) * limit;
    const employees = await employeesCollection
      .find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    const total = await employeesCollection.countDocuments(query);

    // Format employees for frontend
    const formattedEmployees = employees.map((employee) => ({
      id: employee._id.toString(),
      _id: employee._id.toString(),
      name: employee.name || '',
      position: employee.position || '',
      phone: employee.phone || '',
      email: employee.email || '',
      address: employee.address || '',
      joinDate: employee.joinDate || '',
      salary: Number(employee.salary) || 0,
      workHours: Number(employee.workHours) || 0,
      status: employee.status || 'active',
      notes: employee.notes || '',
      image: employee.image || '',
      paidAmount: Number(employee.paidAmount) || 0,
      totalDue: Number(employee.totalDue) || 0,
      createdAt: employee.createdAt ? employee.createdAt.toISOString() : employee._id.getTimestamp().toISOString(),
      updatedAt: employee.updatedAt ? employee.updatedAt.toISOString() : employee.createdAt ? employee.createdAt.toISOString() : employee._id.getTimestamp().toISOString(),
    }));

    return NextResponse.json({
      success: true,
      employees: formattedEmployees,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    }, { status: 200 });
  } catch (error) {
    console.error('Error fetching farm employees:', error);
    return NextResponse.json(
      { error: 'Failed to fetch employees', message: error.message },
      { status: 500 }
    );
  }
}

// POST create new farm employee
export async function POST(request) {
  try {
    const body = await request.json();

    if (!body.name || !body.name.trim()) {
      return NextResponse.json(
        { error: 'Employee name is required' },
        { status: 400 }
      );
    }

    if (!body.position || !body.position.trim()) {
      return NextResponse.json(
        { error: 'Position is required' },
        { status: 400 }
      );
    }

    if (!body.phone || !body.phone.trim()) {
      return NextResponse.json(
        { error: 'Phone number is required' },
        { status: 400 }
      );
    }

    if (!body.joinDate) {
      return NextResponse.json(
        { error: 'Join date is required' },
        { status: 400 }
      );
    }

    if (!body.salary || Number(body.salary) <= 0) {
      return NextResponse.json(
        { error: 'Valid salary is required' },
        { status: 400 }
      );
    }

    const db = await getDb();
    const employeesCollection = db.collection('farm_employees');

    // Check if employee with same phone already exists
    const existingEmployee = await employeesCollection.findOne({
      phone: body.phone.trim()
    });

    if (existingEmployee) {
      return NextResponse.json(
        { error: 'Employee with this phone number already exists' },
        { status: 400 }
      );
    }

    // Create new employee
    const newEmployee = {
      name: body.name.trim(),
      position: body.position.trim(),
      phone: body.phone.trim(),
      email: body.email?.trim() || '',
      address: body.address?.trim() || '',
      joinDate: body.joinDate,
      salary: Number(body.salary) || 0,
      workHours: Number(body.workHours) || 0,
      status: body.status || 'active',
      notes: body.notes?.trim() || '',
      image: body.image || '',
      paidAmount: 0,
      totalDue: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await employeesCollection.insertOne(newEmployee);

    // Fetch created employee
    const createdEmployee = await employeesCollection.findOne({
      _id: result.insertedId
    });

    // Format employee for frontend
    const formattedEmployee = {
      id: createdEmployee._id.toString(),
      _id: createdEmployee._id.toString(),
      ...newEmployee,
      createdAt: createdEmployee.createdAt.toISOString(),
      updatedAt: createdEmployee.updatedAt.toISOString(),
    };

    return NextResponse.json({
      success: true,
      message: 'Employee created successfully',
      employee: formattedEmployee,
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating farm employee:', error);
    return NextResponse.json(
      { error: 'Failed to create employee', message: error.message },
      { status: 500 }
    );
  }
}

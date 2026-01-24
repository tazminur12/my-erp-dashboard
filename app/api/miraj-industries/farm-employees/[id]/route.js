import { NextResponse } from 'next/server';
import { getDb } from '../../../../../lib/mongodb';
import { ObjectId } from 'mongodb';

// GET single farm employee
export async function GET(request, { params }) {
  try {
    const resolvedParams = await params;
    const { id } = resolvedParams;

    if (!id) {
      return NextResponse.json(
        { error: 'Employee ID is required' },
        { status: 400 }
      );
    }

    const db = await getDb();
    const employeesCollection = db.collection('farm_employees');

    let employee;
    try {
      employee = await employeesCollection.findOne({ _id: new ObjectId(id) });
    } catch (err) {
      return NextResponse.json(
        { error: 'Invalid employee ID' },
        { status: 400 }
      );
    }

    if (!employee) {
      return NextResponse.json(
        { error: 'Employee not found' },
        { status: 404 }
      );
    }

    // Format employee for frontend
    const formattedEmployee = {
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
    };

    return NextResponse.json({
      success: true,
      employee: formattedEmployee,
    }, { status: 200 });
  } catch (error) {
    console.error('Error fetching farm employee:', error);
    return NextResponse.json(
      { error: 'Failed to fetch employee', message: error.message },
      { status: 500 }
    );
  }
}

// PUT update farm employee
export async function PUT(request, { params }) {
  try {
    const resolvedParams = await params;
    const { id } = resolvedParams;
    const body = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: 'Employee ID is required' },
        { status: 400 }
      );
    }

    const db = await getDb();
    const employeesCollection = db.collection('farm_employees');

    // Find employee
    let employee;
    try {
      employee = await employeesCollection.findOne({ _id: new ObjectId(id) });
    } catch (err) {
      return NextResponse.json(
        { error: 'Invalid employee ID' },
        { status: 400 }
      );
    }

    if (!employee) {
      return NextResponse.json(
        { error: 'Employee not found' },
        { status: 404 }
      );
    }

    // Prepare update data
    const updateData = {
      name: body.name?.trim() || employee.name || '',
      position: body.position?.trim() || employee.position || '',
      phone: body.phone?.trim() || employee.phone || '',
      email: body.email?.trim() || employee.email || '',
      address: body.address?.trim() || employee.address || '',
      joinDate: body.joinDate || employee.joinDate || '',
      salary: body.salary !== undefined ? Number(body.salary) : employee.salary || 0,
      workHours: body.workHours !== undefined ? Number(body.workHours) : employee.workHours || 0,
      status: body.status || employee.status || 'active',
      notes: body.notes?.trim() || employee.notes || '',
      image: body.image || employee.image || '',
      updatedAt: new Date(),
    };

    // Update employee
    await employeesCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    // Fetch updated employee
    const updatedEmployee = await employeesCollection.findOne({
      _id: new ObjectId(id)
    });

    // Format employee for frontend
    const formattedEmployee = {
      id: updatedEmployee._id.toString(),
      _id: updatedEmployee._id.toString(),
      ...updateData,
      paidAmount: updatedEmployee.paidAmount || 0,
      totalDue: updatedEmployee.totalDue || 0,
      createdAt: updatedEmployee.createdAt.toISOString(),
      updatedAt: updateData.updatedAt.toISOString(),
    };

    return NextResponse.json({
      success: true,
      message: 'Employee updated successfully',
      employee: formattedEmployee,
    }, { status: 200 });
  } catch (error) {
    console.error('Error updating farm employee:', error);
    return NextResponse.json(
      { error: 'Failed to update employee', message: error.message },
      { status: 500 }
    );
  }
}

// DELETE farm employee
export async function DELETE(request, { params }) {
  try {
    const resolvedParams = await params;
    const { id } = resolvedParams;

    if (!id) {
      return NextResponse.json(
        { error: 'Employee ID is required' },
        { status: 400 }
      );
    }

    const db = await getDb();
    const employeesCollection = db.collection('farm_employees');

    // Find and delete employee
    let result;
    try {
      result = await employeesCollection.deleteOne({ _id: new ObjectId(id) });
    } catch (err) {
      return NextResponse.json(
        { error: 'Invalid employee ID' },
        { status: 400 }
      );
    }

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: 'Employee not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Employee deleted successfully',
    }, { status: 200 });
  } catch (error) {
    console.error('Error deleting farm employee:', error);
    return NextResponse.json(
      { error: 'Failed to delete employee', message: error.message },
      { status: 500 }
    );
  }
}

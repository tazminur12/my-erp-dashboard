import { NextResponse } from 'next/server';
import { getDb } from '../../../../../lib/mongodb';

// GET farm employee statistics
export async function GET(request) {
  try {
    const db = await getDb();
    const employeesCollection = db.collection('farm_employees');

    // Get all employees
    const employees = await employeesCollection.find({}).toArray();

    // Calculate statistics
    const totalEmployees = employees.length;
    const activeEmployees = employees.filter(emp => emp.status === 'active').length;
    
    // Calculate total monthly salary
    const totalMonthlySalary = employees.reduce((sum, emp) => {
      return sum + (Number(emp.salary) || 0);
    }, 0);

    // For attendance stats, you might want to query from attendance collection
    // For now, returning placeholder values
    const presentToday = 0; // This should come from attendance collection
    const absentToday = 0; // This should come from attendance collection
    const monthlyAttendance = 0; // This should come from attendance collection

    return NextResponse.json({
      success: true,
      totalEmployees,
      activeEmployees,
      totalMonthlySalary,
      presentToday,
      absentToday,
      monthlyAttendance,
    }, { status: 200 });
  } catch (error) {
    console.error('Error fetching farm employee stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch statistics', message: error.message },
      { status: 500 }
    );
  }
}

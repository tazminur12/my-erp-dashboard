import { NextResponse } from 'next/server';
import { getDb } from '../../../../lib/mongodb';

export async function GET() {
  try {
    const db = await getDb();
    const employeesCollection = db.collection('employees');
    const categoriesCollection = db.collection('operating_expense_categories');

    const [employees, categories] = await Promise.all([
      employeesCollection.find({}).toArray(),
      categoriesCollection.find({}).toArray()
    ]);

    const totalEmployees = employees.length;
    const activeEmployees = employees.filter((e) => (e.status || '').toLowerCase() !== 'inactive').length;
    const monthlyPayroll = employees.reduce((sum, employee) => sum + (Number(employee.basicSalary) || 0), 0);

    const operatingExpenseTotal = categories.reduce((sum, category) => sum + (Number(category.totalAmount) || 0), 0);
    const monthlyExpenseDue = categories.reduce((sum, category) => {
      return category.frequency === 'monthly' ? sum + (Number(category.monthlyAmount) || 0) : sum;
    }, 0);

    const alerts = [];
    if (monthlyExpenseDue > 0) {
      alerts.push({
        title: 'অপারেটিং মাসিক বিল',
        description: `এই মাসে ${monthlyExpenseDue} টাকার অপারেটিং বিল আছে।`
      });
    }
    if (activeEmployees > 0) {
      alerts.push({
        title: 'পে-রোল প্রস্তুত',
        description: `${activeEmployees} জন কর্মচারীর বেতন প্রস্তুত আছে।`
      });
    }
    if (alerts.length === 0) {
      alerts.push({
        title: 'কোনো সতর্কতা নেই',
        description: 'এই মুহূর্তে কোনো জরুরি টাস্ক নেই।'
      });
    }

    return NextResponse.json(
      {
        success: true,
        summary: {
          totalEmployees,
          activeEmployees,
          monthlyPayroll,
          operatingExpenseTotal
        },
        alerts
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching office management dashboard:', error);
    return NextResponse.json(
      { error: 'Failed to fetch office management dashboard', message: error.message },
      { status: 500 }
    );
  }
}

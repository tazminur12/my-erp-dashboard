import { NextResponse } from 'next/server';
import { getDb } from '../../../../lib/mongodb';

// GET hajj umrah dashboard summary
export async function GET(request) {
  try {
    const db = await getDb();
    const hajisCollection = db.collection('hajis');
    const umrahsCollection = db.collection('umrahs');
    const agentsCollection = db.collection('agents');
    const packagesCollection = db.collection('packages');

    // Fetch all data
    const [hajis, umrahs, agents, packages] = await Promise.all([
      hajisCollection.find({}).toArray(),
      umrahsCollection.find({ service_type: 'umrah' }).toArray(),
      agentsCollection.find({}).toArray(),
      packagesCollection.find({}).toArray()
    ]);

    // Detailed Hajj Stats
    const hajjStats = {
      totalHajis: hajis.length,
      completedHajis: hajis.filter(h => {
        const status = h.serviceStatus || h.status || '';
        return status.includes('হজ্ব সম্পন্ন') || status.includes('hajj completed');
      }).length,
      preRegistered: hajis.filter(h => {
        const status = h.serviceStatus || h.status || '';
        return status.includes('প্রাক-নিবন্ধিত');
      }).length,
      registered: hajis.filter(h => {
        const status = h.serviceStatus || h.status || '';
        return status.includes('নিবন্ধিত') || status === 'registered';
      }).length,
      totalPackageAmount: hajis.reduce((sum, h) => sum + (Number(h.total_amount) || Number(h.totalAmount) || 0), 0),
      totalPaidAmount: hajis.reduce((sum, h) => sum + (Number(h.paid_amount) || Number(h.paidAmount) || 0), 0),
      totalDueAmount: 0 // Calculated below
    };
    hajjStats.totalDueAmount = Math.max(0, hajjStats.totalPackageAmount - hajjStats.totalPaidAmount);

    // Detailed Umrah Stats
    const umrahStats = {
      totalUmrahs: umrahs.length,
      completedUmrahs: umrahs.filter(u => {
        const status = u.serviceStatus || u.status || '';
        return status.includes('উমরাহ সম্পন্ন') || status.includes('umrah completed');
      }).length,
      readyForUmrah: umrahs.filter(u => {
        const status = u.serviceStatus || u.status || '';
        return status.includes('রেডি ফর উমরাহ') || status.includes('ready for umrah');
      }).length,
      totalPackageAmount: umrahs.reduce((sum, u) => sum + (Number(u.total_amount) || Number(u.totalAmount) || 0), 0),
      totalPaidAmount: umrahs.reduce((sum, u) => sum + (Number(u.paid_amount) || Number(u.paidAmount) || 0), 0),
      totalDueAmount: 0 // Calculated below
    };
    umrahStats.totalDueAmount = Math.max(0, umrahStats.totalPackageAmount - umrahStats.totalPaidAmount);

    // Detailed Agent Stats
    const agentStats = {
      totalAgents: agents.length,
      totalPaid: agents.reduce((sum, agent) => sum + (Number(agent.totalPaid) || Number(agent.totalDeposit) || 0), 0),
      totalBill: agents.reduce((sum, agent) => sum + (Number(agent.totalBilled) || Number(agent.totalBill) || 0), 0),
      totalDue: agents.reduce((sum, agent) => sum + (Number(agent.totalDue) || 0), 0)
    };

    return NextResponse.json({
      success: true,
      hajjStats,
      umrahStats,
      agentStats
    }, { status: 200 });
  } catch (error) {
    console.error('Error fetching hajj umrah dashboard:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data', message: error.message },
      { status: 500 }
    );
  }
}

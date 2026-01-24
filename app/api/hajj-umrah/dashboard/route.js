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

    // Overview
    const overview = {
      totalHaji: hajis.length,
      totalUmrah: umrahs.length,
      totalAgents: agents.length,
      totalPilgrims: hajis.length + umrahs.length
    };

    // Calculate Hajj Profit/Loss
    const hajjPackages = packages.filter(pkg => 
      pkg.packageType === 'Hajj' || pkg.customPackageType?.toLowerCase().includes('hajj')
    );
    
    const hajjTotalRevenue = hajis.reduce((sum, haji) => 
      sum + (Number(haji.total_amount) || Number(haji.totalAmount) || 0), 0
    );
    
    const hajjTotalCost = hajjPackages.reduce((sum, pkg) => {
      const packageCost = Number(pkg.costingPrice) || Number(pkg.totals?.costingPrice) || 0;
      const hajisInPackage = hajis.filter(h => 
        h.packageId === pkg._id.toString() || 
        h.package_id === pkg._id.toString() ||
        h.packageInfo?.packageId === pkg._id.toString()
      ).length;
      return sum + (packageCost * hajisInPackage);
    }, 0);
    
    const hajjProfitLoss = hajjTotalRevenue - hajjTotalCost;

    // Calculate Umrah Profit/Loss
    const umrahPackages = packages.filter(pkg => 
      pkg.packageType === 'Umrah' || pkg.customPackageType?.toLowerCase().includes('umrah')
    );
    
    const umrahTotalRevenue = umrahs.reduce((sum, umrah) => 
      sum + (Number(umrah.total_amount) || Number(umrah.totalAmount) || 0), 0
    );
    
    const umrahTotalCost = umrahPackages.reduce((sum, pkg) => {
      const packageCost = Number(pkg.costingPrice) || Number(pkg.totals?.costingPrice) || 0;
      const umrahsInPackage = umrahs.filter(u => 
        u.packageId === pkg._id.toString() || 
        u.package_id === pkg._id.toString() ||
        u.packageInfo?.packageId === pkg._id.toString()
      ).length;
      return sum + (packageCost * umrahsInPackage);
    }, 0);
    
    const umrahProfitLoss = umrahTotalRevenue - umrahTotalCost;

    // Profit/Loss Summary
    const profitLoss = {
      hajj: {
        totalRevenue: hajjTotalRevenue,
        totalCost: hajjTotalCost,
        profitLoss: hajjProfitLoss,
        isProfit: hajjProfitLoss >= 0,
        packageCount: hajjPackages.length
      },
      umrah: {
        totalRevenue: umrahTotalRevenue,
        totalCost: umrahTotalCost,
        profitLoss: umrahProfitLoss,
        isProfit: umrahProfitLoss >= 0,
        packageCount: umrahPackages.length
      },
      combined: {
        totalRevenue: hajjTotalRevenue + umrahTotalRevenue,
        totalCost: hajjTotalCost + umrahTotalCost,
        profitLoss: hajjProfitLoss + umrahProfitLoss,
        isProfit: (hajjProfitLoss + umrahProfitLoss) >= 0
      }
    };

    // Financial Summary
    const hajiTotalAmount = hajis.reduce((sum, haji) => 
      sum + (Number(haji.total_amount) || Number(haji.totalAmount) || 0), 0
    );
    const hajiTotalPaid = hajis.reduce((sum, haji) => 
      sum + (Number(haji.paid_amount) || Number(haji.paidAmount) || 0), 0
    );
    const hajiTotalDue = hajiTotalAmount - hajiTotalPaid;

    const umrahTotalAmount = umrahs.reduce((sum, umrah) => 
      sum + (Number(umrah.total_amount) || Number(umrah.totalAmount) || 0), 0
    );
    const umrahTotalPaid = umrahs.reduce((sum, umrah) => 
      sum + (Number(umrah.paid_amount) || Number(umrah.paidAmount) || 0), 0
    );
    const umrahTotalDue = umrahTotalAmount - umrahTotalPaid;

    const agentsTotalDue = agents.reduce((sum, agent) => 
      sum + (Number(agent.totalDue) || Number(agent.total_due) || 0), 0
    );
    const agentsHajDue = agents.reduce((sum, agent) => 
      sum + (Number(agent.hajDue) || Number(agent.haj_due) || 0), 0
    );
    const agentsUmrahDue = agents.reduce((sum, agent) => 
      sum + (Number(agent.umrahDue) || Number(agent.umrah_due) || 0), 0
    );

    const financialSummary = {
      haji: {
        totalAmount: hajiTotalAmount,
        totalPaid: hajiTotalPaid,
        totalDue: hajiTotalDue
      },
      umrah: {
        totalAmount: umrahTotalAmount,
        totalPaid: umrahTotalPaid,
        totalDue: umrahTotalDue
      },
      agents: {
        totalDue: agentsTotalDue,
        hajDue: agentsHajDue,
        umrahDue: agentsUmrahDue
      }
    };

    // Top Agents by Haji Count
    const agentHajiCounts = {};
    hajis.forEach(haji => {
      const agentId = haji.agent_id || haji.agentId || '';
      if (agentId) {
        if (!agentHajiCounts[agentId]) {
          agentHajiCounts[agentId] = { agentId, hajiCount: 0 };
        }
        agentHajiCounts[agentId].hajiCount++;
      }
    });

    const topAgentsByHaji = Object.values(agentHajiCounts)
      .map(item => {
        const agent = agents.find(a => 
          a._id.toString() === item.agentId || 
          a.agentId === item.agentId
        );
        return {
          agentId: item.agentId,
          agentName: agent?.tradeName || agent?.ownerName || 'Unknown',
          hajiCount: item.hajiCount
        };
      })
      .sort((a, b) => b.hajiCount - a.hajiCount)
      .slice(0, 10);

    // Agent Profit/Loss
    const agentProfitLoss = agents.map(agent => {
      const agentHajis = hajis.filter(h => 
        h.agent_id === agent._id.toString() || 
        h.agentId === agent._id.toString()
      );
      const agentUmrahs = umrahs.filter(u => 
        u.agent_id === agent._id.toString() || 
        u.agentId === agent._id.toString()
      );

      const agentHajjRevenue = agentHajis.reduce((sum, h) => 
        sum + (Number(h.total_amount) || Number(h.totalAmount) || 0), 0
      );
      const agentUmrahRevenue = agentUmrahs.reduce((sum, u) => 
        sum + (Number(u.total_amount) || Number(u.totalAmount) || 0), 0
      );
      const totalRevenue = agentHajjRevenue + agentUmrahRevenue;

      // Calculate costs from packages
      const agentPackages = packages.filter(pkg => 
        pkg.agentId === agent._id.toString() || 
        pkg.agent_id === agent._id.toString()
      );
      const totalCost = agentPackages.reduce((sum, pkg) => {
        const packageCost = Number(pkg.costingPrice) || Number(pkg.totals?.costingPrice) || 0;
        const hajisInPackage = agentHajis.filter(h => 
          h.packageId === pkg._id.toString() || 
          h.package_id === pkg._id.toString()
        ).length;
        const umrahsInPackage = agentUmrahs.filter(u => 
          u.packageId === pkg._id.toString() || 
          u.package_id === pkg._id.toString()
        ).length;
        return sum + (packageCost * (hajisInPackage + umrahsInPackage));
      }, 0);

      const profitLoss = totalRevenue - totalCost;
      const totalAdvance = Number(agent.totalAdvance) || Number(agent.total_advance) || 0;

      return {
        agentId: agent._id.toString(),
        agentName: agent.tradeName || agent.ownerName || 'Unknown',
        totalRevenue,
        totalCost,
        profitLoss,
        totalAdvance,
        packageCount: agentPackages.length
      };
    }).sort((a, b) => b.profitLoss - a.profitLoss);

    // Top Districts
    const districtCounts = {};
    [...hajis, ...umrahs].forEach(pilgrim => {
      const district = pilgrim.district || '';
      if (district) {
        if (!districtCounts[district]) {
          districtCounts[district] = { district, hajiCount: 0, umrahCount: 0 };
        }
        if (pilgrim.service_type === 'umrah' || pilgrim.serviceType === 'umrah') {
          districtCounts[district].umrahCount++;
        } else {
          districtCounts[district].hajiCount++;
        }
      }
    });

    const topDistricts = Object.values(districtCounts)
      .map(item => ({
        district: item.district,
        hajiCount: item.hajiCount,
        umrahCount: item.umrahCount,
        totalCount: item.hajiCount + item.umrahCount
      }))
      .sort((a, b) => b.totalCount - a.totalCount)
      .slice(0, 12);

    return NextResponse.json({
      success: true,
      overview,
      profitLoss,
      financialSummary,
      topAgentsByHaji,
      topDistricts,
      agentProfitLoss
    }, { status: 200 });
  } catch (error) {
    console.error('Error fetching hajj umrah dashboard:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data', message: error.message },
      { status: 500 }
    );
  }
}

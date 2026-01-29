import { NextResponse } from 'next/server';
import { getDb } from '../../../lib/mongodb';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../lib/auth';
import { getBranchFilterWithOverride, isSuperAdmin } from '../../../lib/branchHelper';

// GET unified dashboard summary - all data in one API call
export async function GET(request) {
  try {
    // Get user session for branch filtering
    const userSession = await getServerSession(authOptions);
    
    const { searchParams } = new URL(request.url);
    const fromDate = searchParams.get('fromDate');
    const toDate = searchParams.get('toDate');
    const selectedBranchId = searchParams.get('branchId'); // For super admin to select specific branch

    const db = await getDb();
    
    // Get branch filter based on user role
    const branchFilter = getBranchFilterWithOverride(userSession, selectedBranchId);
    const isAdmin = isSuperAdmin(userSession);

    // Fetch all data in parallel with branch filter
    const [
      hajis,
      umrahs,
      agents,
      packages,
      exchanges,
      receivingLoans,
      givingLoans,
      vendors,
      vendorBills,
      users,
      branches,
      bankAccounts,
    ] = await Promise.all([
      db.collection('hajis').find({ ...branchFilter }).toArray(),
      db.collection('umrahs').find({ service_type: 'umrah', ...branchFilter }).toArray(),
      db.collection('agents').find({ ...branchFilter }).toArray(),
      db.collection('packages').find({}).toArray(), // Packages are shared
      db
        .collection('money_exchanges')
        .find({ isActive: { $ne: false }, ...branchFilter })
        .toArray(),
      db.collection('loans_receiving').find({ ...branchFilter }).toArray(),
      db.collection('loans_giving').find({ ...branchFilter }).toArray(),
      db.collection('vendors').find({ ...branchFilter }).toArray(),
      db.collection('vendor_bills').find({ ...branchFilter }).toArray(),
      db.collection('users').find({}).toArray(), // Users list is for admin only
      db.collection('branches').find({}).toArray(), // All branches for dropdown
      db.collection('bank_accounts').find({ ...branchFilter }).toArray(),
    ]);

    // ========== HAJJ & UMRAH ==========
    const hajjPackages = packages.filter(
      (pkg) =>
        pkg.packageType === 'Hajj' || pkg.customPackageType?.toLowerCase().includes('hajj')
    );
    const umrahPackages = packages.filter(
      (pkg) =>
        pkg.packageType === 'Umrah' || pkg.customPackageType?.toLowerCase().includes('umrah')
    );

    const hajiTotalAmount = hajis.reduce((sum, haji) => sum + (Number(haji.total_amount) || Number(haji.totalAmount) || 0), 0);
    const hajiTotalPaid = hajis.reduce((sum, haji) => sum + (Number(haji.paid_amount) || Number(haji.paidAmount) || 0), 0);

    // Use Paid Amount for Revenue (Realized Income) instead of Total Contract Amount
    const hajjTotalRevenue = hajiTotalPaid;
    
    // Calculate Agent Revenue (Total Paid by Agents)
    // We should include agent payments as they often pay on behalf of groups
    const agentTotalPaid = agents.reduce((sum, agent) => sum + (Number(agent.totalPaid) || Number(agent.total_paid) || 0), 0);
    
    const hajjTotalCost = hajjPackages.reduce((sum, pkg) => {
      const packageCost = Number(pkg.costingPrice) || Number(pkg.totals?.costingPrice) || 0;
      const hajisInPackage = hajis.filter(
        (h) =>
          h.packageId === pkg._id.toString() ||
          h.package_id === pkg._id.toString() ||
          h.packageInfo?.packageId === pkg._id.toString()
      ).length;
      return sum + packageCost * hajisInPackage;
    }, 0);

    const umrahTotalAmount = umrahs.reduce((sum, umrah) => sum + (Number(umrah.total_amount) || Number(umrah.totalAmount) || 0), 0);
    const umrahTotalPaid = umrahs.reduce((sum, umrah) => sum + (Number(umrah.paid_amount) || Number(umrah.paidAmount) || 0), 0);

    // Use Paid Amount for Revenue (Realized Income) instead of Total Contract Amount
    const umrahTotalRevenue = umrahTotalPaid;

    const umrahTotalCost = umrahPackages.reduce((sum, pkg) => {
      const packageCost = Number(pkg.costingPrice) || Number(pkg.totals?.costingPrice) || 0;
      const umrahsInPackage = umrahs.filter(
        (u) =>
          u.packageId === pkg._id.toString() ||
          u.package_id === pkg._id.toString() ||
          u.packageInfo?.packageId === pkg._id.toString()
      ).length;
      return sum + packageCost * umrahsInPackage;
    }, 0);

    const huOverview = {
      totalHaji: hajis.length,
      totalUmrah: umrahs.length,
      totalAgents: agents.length,
      totalPilgrims: hajis.length + umrahs.length,
    };

    const huProfitLoss = {
      hajj: {
        totalRevenue: hajjTotalRevenue,
        totalCost: hajjTotalCost,
        profitLoss: hajjTotalRevenue - hajjTotalCost,
        isProfit: hajjTotalRevenue - hajjTotalCost >= 0,
      },
      umrah: {
        totalRevenue: umrahTotalRevenue,
        totalCost: umrahTotalCost,
        profitLoss: umrahTotalRevenue - umrahTotalCost,
        isProfit: umrahTotalRevenue - umrahTotalCost >= 0,
      },
      combined: {
        totalRevenue: hajjTotalRevenue + umrahTotalRevenue,
        totalCost: hajjTotalCost + umrahTotalCost,
        profitLoss: hajjTotalRevenue + umrahTotalRevenue - hajjTotalCost - umrahTotalCost,
        isProfit: hajjTotalRevenue + umrahTotalRevenue - hajjTotalCost - umrahTotalCost >= 0,
      },
    };

    // ========== MONEY EXCHANGE ==========
    const buyExchanges = exchanges.filter((e) => e.type === 'Buy');
    const sellExchanges = exchanges.filter((e) => e.type === 'Sell');
    const totalPurchaseCost = buyExchanges.reduce((sum, e) => sum + (Number(e.amount_bdt) || 0), 0);
    const totalSaleRevenue = sellExchanges.reduce((sum, e) => sum + (Number(e.amount_bdt) || 0), 0);

    // ========== LOANS ==========
    const receivingFinancial = {
      totalAmount: receivingLoans.reduce(
        (sum, loan) => sum + (Number(loan.totalAmount || loan.amount || 0)),
        0
      ),
      paidAmount: receivingLoans.reduce((sum, loan) => sum + (Number(loan.paidAmount || 0)), 0),
      totalDue: receivingLoans.reduce((sum, loan) => {
        const total = Number(loan.totalAmount || loan.amount || 0);
        const paid = Number(loan.paidAmount || 0);
        return sum + Math.max(0, total - paid);
      }, 0),
      taken: receivingLoans.reduce(
        (sum, loan) => sum + (Number(loan.totalAmount || loan.amount || 0)),
        0
      ),
      repaid: receivingLoans.reduce((sum, loan) => sum + (Number(loan.paidAmount || 0)), 0),
    };

    const givingFinancial = {
      totalAmount: givingLoans.reduce(
        (sum, loan) => sum + (Number(loan.totalAmount || loan.amount || 0)),
        0
      ),
      paidAmount: givingLoans.reduce((sum, loan) => sum + (Number(loan.paidAmount || 0)), 0),
      totalDue: givingLoans.reduce((sum, loan) => {
        const total = Number(loan.totalAmount || loan.amount || 0);
        const paid = Number(loan.paidAmount || 0);
        return sum + Math.max(0, total - paid);
      }, 0),
      disbursed: givingLoans.reduce(
        (sum, loan) => sum + (Number(loan.totalAmount || loan.amount || 0)),
        0
      ),
      repaid: givingLoans.reduce((sum, loan) => sum + (Number(loan.paidAmount || 0)), 0),
    };

    const loanTotals = {
      totalLoans: receivingLoans.length + givingLoans.length,
      active:
        [...receivingLoans, ...givingLoans].filter((l) => l.status === 'active').length,
      pending:
        [...receivingLoans, ...givingLoans].filter((l) => l.status === 'pending').length,
    };

    // ========== VENDORS ==========
    const vendorStats = {
      totalVendors: vendors.length,
      activeVendors: vendors.filter((v) => v.status === 'active').length,
      inactiveVendors: vendors.filter((v) => v.status === 'inactive').length,
    };

    const vendorBillsTotal = vendorBills.reduce(
      (sum, bill) => sum + (Number(bill.totalAmount) || Number(bill.amount) || 0),
      0
    );
    
    // Use vendors collection for accurate Due/Paid status (updated by transactions)
    const vendorTotalDue = vendors.reduce((sum, v) => sum + (Number(v.totalDue) || 0), 0);
    const vendorTotalPaid = vendors.reduce((sum, v) => sum + (Number(v.totalPaid) || 0), 0);
    
    // Keep these for backward compatibility in response, but map them to the accurate vendor totals
    const vendorBillsPaid = vendorTotalPaid;
    const vendorBillsDue = vendorTotalDue;

    // ========== BANK ACCOUNTS ==========
    const totalBankBalance = bankAccounts.reduce(
      (sum, a) => sum + (Number(a.currentBalance) || Number(a.initialBalance) || 0),
      0
    );
    const cashAccount =
      bankAccounts.find(
        (a) =>
          (a.accountCategory || '').toLowerCase() === 'cash' ||
          (a.accountType || '').toLowerCase() === 'cash'
      ) || bankAccounts[0];

    // ========== CALCULATE GRAND TOTALS ==========
    // Calculate total due from Hajj & Umrah
    const hajjTotalDue = hajiTotalAmount - hajiTotalPaid;
    const umrahTotalDue = umrahTotalAmount - umrahTotalPaid;
    const agentTotalDue = agents.reduce((sum, a) => sum + (Number(a.totalDue) || Number(a.total_due) || 0), 0);

    const totalRevenue =
      huProfitLoss.combined.totalRevenue +
      agentTotalPaid + // Add Agent Payments to Revenue
      totalSaleRevenue +
      receivingFinancial.taken +
      givingFinancial.repaid;

    const totalExpenses = totalPurchaseCost + givingFinancial.disbursed + vendorBillsTotal;

    const totalDue = receivingFinancial.totalDue + givingFinancial.totalDue + vendorTotalDue + hajjTotalDue + umrahTotalDue + agentTotalDue;

    const totalAssets = totalSaleRevenue - totalPurchaseCost + totalBankBalance; // Simplified

    const netProfit = totalRevenue - totalExpenses;

    // ========== OVERVIEW ==========
    const overview = {
      totalUsers: users.length,
      totalCustomers: huOverview.totalPilgrims,
      totalAgents: huOverview.totalAgents,
      totalVendors: vendorStats.totalVendors,
      totalBranches: branches.length,
    };

    // ========== BRANCH INFO FOR SUPER ADMIN ==========
    const branchInfo = {
      isSuperAdmin: isAdmin,
      currentBranchId: selectedBranchId || userSession?.user?.branchId || 'all',
      currentBranchName: selectedBranchId 
        ? branches.find(b => b._id?.toString() === selectedBranchId || b.branchId === selectedBranchId)?.name || 
          branches.find(b => b._id?.toString() === selectedBranchId || b.branchId === selectedBranchId)?.branchName || 
          'Selected Branch'
        : userSession?.user?.branchName || 'All Branches',
      availableBranches: isAdmin 
        ? [
            { id: 'all', name: 'All Branches', branchName: 'All Branches' },
            ...branches.map(b => ({
              id: b._id?.toString() || b.branchId,
              branchId: b.branchId,
              name: b.name || b.branchName,
              branchName: b.branchName || b.name,
            }))
          ]
        : [],
    };

    // ========== RESPONSE ==========
    return NextResponse.json(
      {
        overview,
        grandTotals: {
          totalRevenue,
          totalExpenses,
          totalDue,
          totalAssets,
          netProfit,
        },
        hu: {
          overview: huOverview,
          profitLoss: huProfitLoss,
        },
        moneyExchange: {
          totalPurchaseCost,
          totalSaleRevenue,
          netAmount: totalSaleRevenue - totalPurchaseCost,
          buyCount: buyExchanges.length,
          sellCount: sellExchanges.length,
        },
        loans: {
          totals: loanTotals,
          receiving: { financial: receivingFinancial },
          giving: { financial: givingFinancial },
        },
        vendors: {
          statistics: vendorStats,
          bills: {
            totalBills: vendorBills.length,
            totalAmount: vendorBillsTotal,
            totalPaid: vendorBillsPaid,
            totalDue: vendorBillsDue,
          },
        },
        financial: {
          transactions: {
            totalCredit: receivingFinancial.taken + givingFinancial.repaid,
            totalDebit: givingFinancial.disbursed,
            netAmount: receivingFinancial.taken + givingFinancial.repaid - givingFinancial.disbursed,
            totalCount: loanTotals.totalLoans,
          },
          invoices: {
            totalInvoices: vendorBills.length,
            totalAmount: vendorBillsTotal,
            paidAmount: vendorBillsPaid,
            dueAmount: vendorBillsDue,
          },
          accounts: {
            totalAccounts: bankAccounts.length,
            totalBalance: totalBankBalance,
          },
          bankAccounts: {
            totalBankAccounts: bankAccounts.length,
            totalBalance: totalBankBalance,
          },
          loans: {
            totalLoans: loanTotals.totalLoans,
            totalAmount: receivingFinancial.totalAmount + givingFinancial.totalAmount,
            paidAmount: receivingFinancial.paidAmount + givingFinancial.paidAmount,
            dueAmount: receivingFinancial.totalDue + givingFinancial.totalDue,
          },
        },
        services: {
          exchanges: {
            buyAmount: totalPurchaseCost,
            sellAmount: totalSaleRevenue,
            netAmount: totalSaleRevenue - totalPurchaseCost,
            buyCount: buyExchanges.length,
            sellCount: sellExchanges.length,
          },
        },
        cashAccount: cashAccount
          ? {
              id: cashAccount._id?.toString(),
              currency: cashAccount.currency || 'BDT',
              currentBalance: cashAccount.currentBalance || cashAccount.initialBalance || 0,
            }
          : null,
        branchInfo, // Branch filter info for frontend
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data', message: error.message },
      { status: 500 }
    );
  }
}

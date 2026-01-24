import { NextResponse } from 'next/server';
import { getDb } from '../../../lib/mongodb';
import { ObjectId } from 'mongodb';

// Global search across all modules
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q') || '';
    const limit = parseInt(searchParams.get('limit')) || 10;

    if (!q || q.trim().length === 0) {
      return NextResponse.json({
        success: true,
        results: {
          transactions: [],
          hajis: [],
          umrahs: [],
          airCustomers: [],
          airTickets: [],
          vendors: [],
          agents: []
        },
        total: 0
      });
    }

    const searchText = q.trim();
    const db = await getDb();
    const results = {
      transactions: [],
      hajis: [],
      umrahs: [],
      airCustomers: [],
      airTickets: [],
      vendors: [],
      agents: []
    };

    // Search Transactions
    try {
      const transactionsCollection = db.collection('transactions');
      const transactionQuery = {
        isActive: { $ne: false },
        $or: [
          { transactionId: { $regex: searchText, $options: 'i' } },
          { partyName: { $regex: searchText, $options: 'i' } },
          { notes: { $regex: searchText, $options: 'i' } },
          { reference: { $regex: searchText, $options: 'i' } }
        ]
      };
      const transactions = await transactionsCollection
        .find(transactionQuery)
        .sort({ date: -1, createdAt: -1 })
        .limit(limit)
        .toArray();
      
      results.transactions = transactions.map(t => ({
        id: String(t._id),
        type: 'transaction',
        title: t.transactionId || 'Transaction',
        subtitle: `${t.partyName || 'N/A'} - ${t.transactionType || 'N/A'}`,
        description: t.notes || t.reference || '',
        amount: t.amount || 0,
        date: t.date || t.createdAt,
        link: `/transactions?q=${encodeURIComponent(searchText)}`
      }));
    } catch (error) {
      console.error('Error searching transactions:', error);
    }

    // Search Hajis
    try {
      const hajisCollection = db.collection('hajis');
      const hajiQuery = {
        is_active: { $ne: false },
        $or: [
          { name: { $regex: searchText, $options: 'i' } },
          { customer_id: { $regex: searchText, $options: 'i' } },
          { mobile: { $regex: searchText, $options: 'i' } },
          { passport_number: { $regex: searchText, $options: 'i' } },
          { nid_number: { $regex: searchText, $options: 'i' } }
        ]
      };
      const hajis = await hajisCollection
        .find(hajiQuery)
        .sort({ created_at: -1 })
        .limit(limit)
        .toArray();
      
      results.hajis = hajis.map(h => ({
        id: String(h._id),
        type: 'haji',
        title: h.name || `${h.first_name || ''} ${h.last_name || ''}`.trim() || 'Haji',
        subtitle: `ID: ${h.customer_id || 'N/A'} | Mobile: ${h.mobile || 'N/A'}`,
        description: h.address || '',
        customerId: h.customer_id,
        mobile: h.mobile,
        link: `/hajj-umrah/hajj/haji/${h._id}`
      }));
    } catch (error) {
      console.error('Error searching hajis:', error);
    }

    // Search Umrahs
    try {
      const umrahsCollection = db.collection('umrahs');
      const umrahQuery = {
        service_type: 'umrah',
        is_active: { $ne: false },
        $or: [
          { name: { $regex: searchText, $options: 'i' } },
          { customer_id: { $regex: searchText, $options: 'i' } },
          { mobile: { $regex: searchText, $options: 'i' } },
          { passport_number: { $regex: searchText, $options: 'i' } },
          { nid_number: { $regex: searchText, $options: 'i' } }
        ]
      };
      const umrahs = await umrahsCollection
        .find(umrahQuery)
        .sort({ created_at: -1 })
        .limit(limit)
        .toArray();
      
      results.umrahs = umrahs.map(u => ({
        id: String(u._id),
        type: 'umrah',
        title: u.name || `${u.first_name || ''} ${u.last_name || ''}`.trim() || 'Umrah',
        subtitle: `ID: ${u.customer_id || 'N/A'} | Mobile: ${u.mobile || 'N/A'}`,
        description: u.address || '',
        customerId: u.customer_id,
        mobile: u.mobile,
        link: `/hajj-umrah/umrah/haji/${u._id}`
      }));
    } catch (error) {
      console.error('Error searching umrahs:', error);
    }

    // Search Air Customers
    try {
      const airCustomersCollection = db.collection('air_customers');
      const airCustomerQuery = {
        isActive: { $ne: false },
        $or: [
          { name: { $regex: searchText, $options: 'i' } },
          { customerId: { $regex: searchText, $options: 'i' } },
          { phone: { $regex: searchText, $options: 'i' } },
          { email: { $regex: searchText, $options: 'i' } },
          { passportNumber: { $regex: searchText, $options: 'i' } }
        ]
      };
      const airCustomers = await airCustomersCollection
        .find(airCustomerQuery)
        .sort({ createdAt: -1 })
        .limit(limit)
        .toArray();
      
      results.airCustomers = airCustomers.map(ac => ({
        id: String(ac._id),
        type: 'airCustomer',
        title: ac.name || 'Air Customer',
        subtitle: `ID: ${ac.customerId || 'N/A'} | Phone: ${ac.phone || 'N/A'}`,
        description: ac.email || ac.address || '',
        customerId: ac.customerId,
        phone: ac.phone,
        link: `/air-ticketing/customers/${ac._id}`
      }));
    } catch (error) {
      console.error('Error searching air customers:', error);
    }

    // Search Air Tickets
    try {
      const airTicketsCollection = db.collection('air_tickets');
      const airTicketQuery = {
        $or: [
          { bookingId: { $regex: searchText, $options: 'i' } },
          { ticketId: { $regex: searchText, $options: 'i' } },
          { gdsPnr: { $regex: searchText, $options: 'i' } },
          { airlinePnr: { $regex: searchText, $options: 'i' } },
          { customerName: { $regex: searchText, $options: 'i' } },
          { customerPhone: { $regex: searchText, $options: 'i' } }
        ]
      };
      const airTickets = await airTicketsCollection
        .find(airTicketQuery)
        .sort({ createdAt: -1 })
        .limit(limit)
        .toArray();
      
      results.airTickets = airTickets.map(at => ({
        id: String(at._id),
        type: 'airTicket',
        title: `Ticket: ${at.bookingId || at.ticketId || 'N/A'}`,
        subtitle: `Customer: ${at.customerName || 'N/A'} | PNR: ${at.gdsPnr || at.airlinePnr || 'N/A'}`,
        description: `${at.origin || ''} → ${at.destination || ''}`,
        bookingId: at.bookingId,
        customerName: at.customerName,
        link: `/air-ticketing/tickets?q=${encodeURIComponent(searchText)}`
      }));
    } catch (error) {
      console.error('Error searching air tickets:', error);
    }

    // Search Vendors
    try {
      const vendorsCollection = db.collection('vendors');
      const vendorQuery = {
        status: 'active',
        $or: [
          { tradeName: { $regex: searchText, $options: 'i' } },
          { ownerName: { $regex: searchText, $options: 'i' } },
          { vendorId: { $regex: searchText, $options: 'i' } },
          { contactNo: { $regex: searchText, $options: 'i' } },
          { nid: { $regex: searchText, $options: 'i' } },
          { passport: { $regex: searchText, $options: 'i' } }
        ]
      };
      const vendors = await vendorsCollection
        .find(vendorQuery)
        .sort({ created_at: -1 })
        .limit(limit)
        .toArray();
      
      results.vendors = vendors.map(v => ({
        id: String(v._id),
        type: 'vendor',
        title: v.tradeName || v.ownerName || 'Vendor',
        subtitle: `ID: ${v.vendorId || 'N/A'} | Phone: ${v.contactNo || 'N/A'}`,
        description: v.tradeLocation || '',
        vendorId: v.vendorId,
        phone: v.contactNo,
        link: `/vendors/${v._id}`
      }));
    } catch (error) {
      console.error('Error searching vendors:', error);
    }

    // Search Agents
    try {
      const agentsCollection = db.collection('agents');
      const agentQuery = {
        isActive: { $ne: false },
        $or: [
          { name: { $regex: searchText, $options: 'i' } },
          { agentId: { $regex: searchText, $options: 'i' } },
          { tradeName: { $regex: searchText, $options: 'i' } },
          { ownerName: { $regex: searchText, $options: 'i' } },
          { phone: { $regex: searchText, $options: 'i' } },
          { email: { $regex: searchText, $options: 'i' } }
        ]
      };
      const agents = await agentsCollection
        .find(agentQuery)
        .sort({ createdAt: -1 })
        .limit(limit)
        .toArray();
      
      results.agents = agents.map(a => ({
        id: String(a._id),
        type: 'agent',
        title: a.tradeName || a.name || a.ownerName || 'Agent',
        subtitle: `ID: ${a.agentId || 'N/A'} | Phone: ${a.phone || 'N/A'}`,
        description: a.address || a.email || '',
        agentId: a.agentId,
        phone: a.phone,
        link: `/hajj-umrah/b2b-agent/${a._id}`
      }));
    } catch (error) {
      console.error('Error searching agents:', error);
    }

    // Calculate total results
    const total = 
      results.transactions.length +
      results.hajis.length +
      results.umrahs.length +
      results.airCustomers.length +
      results.airTickets.length +
      results.vendors.length +
      results.agents.length;

    return NextResponse.json({
      success: true,
      results,
      total,
      query: searchText
    });
  } catch (error) {
    console.error('Error in global search:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Search failed' },
      { status: 500 }
    );
  }
}

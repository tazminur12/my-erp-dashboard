import { NextResponse } from 'next/server';
import { getDb } from '../../../../lib/mongodb';

const toDateOnlyString = (date) => date.toISOString().slice(0, 10);

const isWithinRange = (value, fromDate, toDate) => {
  if (!value) return false;
  const dateValue = new Date(value);
  if (Number.isNaN(dateValue.getTime())) return false;
  if (fromDate && dateValue < fromDate) return false;
  if (toDate && dateValue > toDate) return false;
  return true;
};

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const fromDateParam = searchParams.get('fromDate');
    const toDateParam = searchParams.get('toDate');

    const fromDate = fromDateParam ? new Date(fromDateParam) : null;
    const toDate = toDateParam ? new Date(toDateParam) : null;

    if (toDate) {
      toDate.setHours(23, 59, 59, 999);
    }

    const db = await getDb();

    const [
      airTickets,
      airCustomers,
      airAgents,
      airlines,
      ticketChecks,
      oldTicketReissues,
    ] = await Promise.all([
      db.collection('air_tickets').find({}).toArray(),
      db.collection('air_customers').find({}).toArray(),
      db.collection('air_agents').find({}).toArray(),
      db.collection('airlines').find({}).toArray(),
      db.collection('ticket_checks').find({}).toArray(),
      db.collection('old_ticket_reissues').find({}).toArray(),
    ]);

    const filteredTickets = fromDate || toDate
      ? airTickets.filter((ticket) =>
          isWithinRange(ticket.createdAt || ticket.date || ticket.flightDate, fromDate, toDate)
        )
      : airTickets;

    const today = new Date();
    const todayStr = toDateOnlyString(today);
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    const ticketsToday = filteredTickets.filter((ticket) => {
      const raw = ticket.date || ticket.flightDate || ticket.createdAt;
      if (!raw) return false;
      const dateOnly = typeof raw === 'string' ? raw.slice(0, 10) : toDateOnlyString(new Date(raw));
      return dateOnly === todayStr;
    });

    const monthlyTickets = filteredTickets.filter((ticket) => {
      const raw = ticket.date || ticket.flightDate || ticket.createdAt;
      if (!raw) return false;
      const parsed = new Date(raw);
      if (Number.isNaN(parsed.getTime())) return false;
      return parsed.getMonth() === currentMonth && parsed.getFullYear() === currentYear;
    });

    const monthlyRevenue = monthlyTickets.reduce((sum, ticket) => {
      const deal = Number(ticket.customerDeal ?? ticket.totalAmount ?? 0) || 0;
      return sum + deal;
    }, 0);

    const activeAgents = airAgents.filter(
      (agent) => agent.isActive !== false && agent.status !== 'Inactive'
    );

    const statusCounts = filteredTickets.reduce((acc, ticket) => {
      const status = ticket.status || 'pending';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});

    const routeCounts = {};
    filteredTickets.forEach((ticket) => {
      const origin = ticket.origin || '';
      const destination = ticket.destination || '';
      if (!origin || !destination) return;
      const key = `${origin} → ${destination}`;
      routeCounts[key] = (routeCounts[key] || 0) + 1;
    });

    const topRoutes = Object.entries(routeCounts)
      .map(([route, volume]) => ({ route, volume }))
      .sort((a, b) => b.volume - a.volume)
      .slice(0, 6);

    const recentTickets = filteredTickets
      .slice()
      .sort((a, b) => {
        const dateA = new Date(a.createdAt || a.date || a.flightDate || 0).getTime();
        const dateB = new Date(b.createdAt || b.date || b.flightDate || 0).getTime();
        return dateB - dateA;
      })
      .slice(0, 8)
      .map((ticket) => ({
        id: ticket.ticketId || ticket._id?.toString() || '',
        passenger: ticket.customerName || '',
        route: ticket.origin && ticket.destination ? `${ticket.origin} → ${ticket.destination}` : '',
        airline: ticket.airline || '',
        status: ticket.status || 'pending',
        amount: Number(ticket.customerDeal ?? ticket.totalAmount ?? 0) || 0,
        createdAt: ticket.createdAt || ticket.date || ticket.flightDate || null,
      }));

    return NextResponse.json(
      {
        success: true,
        summary: {
          ticketsToday: ticketsToday.length,
          totalTickets: filteredTickets.length,
          totalPassengers: airCustomers.length,
          activeAgents: activeAgents.length,
          monthlyRevenue,
        },
        counts: {
          airlines: airlines.length,
          ticketChecks: ticketChecks.length,
          oldReissues: oldTicketReissues.length,
          statuses: statusCounts,
        },
        topRoutes,
        recentTickets,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching air ticketing dashboard:', error);
    return NextResponse.json(
      { error: 'Failed to fetch air ticketing dashboard', message: error.message },
      { status: 500 }
    );
  }
}

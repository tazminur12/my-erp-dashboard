import { NextResponse } from 'next/server';
import { getDb } from '../../../lib/mongodb';

// GET all contacts aggregated from different sources
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const group = searchParams.get('group');
    const source = searchParams.get('source');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const db = await getDb();
    
    // Collections to fetch from
    const collections = [
      { name: 'air_customers', source: 'Air Ticket' },
      { name: 'other_customers', source: 'Other Services' },
      { name: 'hajj_customers', source: 'Hajj Package' },
      { name: 'umrah_customers', source: 'Umrah Package' },
    ];

    let allContacts = [];

    // Fetch from each collection
    for (const collection of collections) {
      try {
        const coll = db.collection(collection.name);
        
        // Build query
        const query = {};
        
        if (search) {
          query.$or = [
            { firstName: { $regex: search, $options: 'i' } },
            { lastName: { $regex: search, $options: 'i' } },
            { fullName: { $regex: search, $options: 'i' } },
            { name: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } },
            { contactEmail: { $regex: search, $options: 'i' } },
            { phone: { $regex: search, $options: 'i' } },
            { contactPhone: { $regex: search, $options: 'i' } },
            { mobile: { $regex: search, $options: 'i' } },
          ];
        }

        if (source && source !== 'all' && source === collection.source) {
          // Filter by source
        } else if (source && source !== 'all') {
          continue; // Skip this collection if source doesn't match
        }

        const docs = await coll.find(query).toArray();
        
        // Transform documents to contact format
        const contacts = docs.map(doc => ({
          id: doc._id.toString(),
          _id: doc._id.toString(),
          name: doc.fullName || doc.name || `${doc.firstName || ''} ${doc.lastName || ''}`.trim(),
          firstName: doc.firstName || '',
          lastName: doc.lastName || '',
          email: doc.email || doc.contactEmail || '',
          phone: doc.phone || doc.contactPhone || doc.mobile || '',
          group: doc.group || 'All Customers',
          source: collection.source,
          status: doc.status || doc.isActive !== false ? 'active' : 'inactive',
          dateAdded: doc.createdAt || doc.dateAdded || doc._id.getTimestamp(),
          createdAt: doc.createdAt || doc._id.getTimestamp(),
        }));

        allContacts = allContacts.concat(contacts);
      } catch (err) {
        console.error(`Error fetching from ${collection.name}:`, err);
        // Continue with other collections
      }
    }

    // Filter by group if specified
    if (group && group !== 'all') {
      allContacts = allContacts.filter(c => c.group === group);
    }

    // Sort by date added (newest first)
    allContacts.sort((a, b) => {
      const dateA = new Date(a.dateAdded || a.createdAt);
      const dateB = new Date(b.dateAdded || b.createdAt);
      return dateB - dateA;
    });

    // Pagination
    const total = allContacts.length;
    const skip = (page - 1) * limit;
    const paginatedContacts = allContacts.slice(skip, skip + limit);

    return NextResponse.json({
      contacts: paginatedContacts,
      data: paginatedContacts,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: limit,
      },
    }, { status: 200 });
  } catch (error) {
    console.error('Error fetching contacts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch contacts', message: error.message },
      { status: 500 }
    );
  }
}

// POST create new contact
export async function POST(request) {
  try {
    const body = await request.json();

    // Validation
    if (!body.name && !body.firstName) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      );
    }

    const db = await getDb();
    const contactsCollection = db.collection('contacts');

    const contact = {
      name: body.name || `${body.firstName || ''} ${body.lastName || ''}`.trim(),
      firstName: body.firstName || '',
      lastName: body.lastName || '',
      email: body.email || '',
      phone: body.phone || '',
      group: body.group || 'All Customers',
      source: body.source || 'Manual Entry',
      status: body.status || 'active',
      notes: body.notes || '',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await contactsCollection.insertOne(contact);

    return NextResponse.json({
      contact: {
        ...contact,
        id: result.insertedId.toString(),
        _id: result.insertedId.toString(),
      },
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating contact:', error);
    return NextResponse.json(
      { error: 'Failed to create contact', message: error.message },
      { status: 500 }
    );
  }
}

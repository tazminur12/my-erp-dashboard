import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { DEFAULT_ROLES } from '@/lib/permissions';

/**
 * Seed default roles into DB if collection is empty.
 */
async function seedRolesIfNeeded(db) {
  const col = db.collection('roles');
  const count = await col.countDocuments();
  if (count > 0) return;

  const roles = DEFAULT_ROLES.map((r) => ({
    slug: r.slug,
    name: r.name,
    nameBn: r.nameBn,
    permissions: r.permissions || [],
    moduleAccess: r.moduleAccess || [],
    createdAt: new Date(),
    updatedAt: new Date(),
  }));
  await col.insertMany(roles);
}

/**
 * GET /api/roles
 * List all roles with permissions and moduleAccess.
 */
export async function GET() {
  try {
    const db = await getDb();
    await seedRolesIfNeeded(db);

    const roles = await db
      .collection('roles')
      .find({})
      .sort({ slug: 1 })
      .toArray();

    const formatted = roles.map((r) => ({
      id: r._id.toString(),
      slug: r.slug,
      name: r.name,
      nameBn: r.nameBn,
      permissions: r.permissions || [],
      moduleAccess: r.moduleAccess || [],
      createdAt: r.createdAt?.toISOString?.(),
      updatedAt: r.updatedAt?.toISOString?.(),
    }));

    return NextResponse.json({ success: true, roles: formatted });
  } catch (error) {
    console.error('Error fetching roles:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch roles' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/roles
 * Create a new role.
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const { slug, name, nameBn, permissions = [], moduleAccess = [] } = body;

    if (!slug || !String(slug).trim()) {
      return NextResponse.json(
        { error: 'Role slug is required' },
        { status: 400 }
      );
    }

    const db = await getDb();
    await seedRolesIfNeeded(db);

    const existing = await db.collection('roles').findOne({ slug: String(slug).trim() });
    if (existing) {
      return NextResponse.json(
        { error: 'A role with this slug already exists' },
        { status: 400 }
      );
    }

    const newRole = {
      slug: String(slug).trim(),
      name: name || slug,
      nameBn: nameBn || name || slug,
      permissions: Array.isArray(permissions) ? permissions : [],
      moduleAccess: Array.isArray(moduleAccess) ? moduleAccess : [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection('roles').insertOne(newRole);
    const created = {
      id: result.insertedId.toString(),
      slug: newRole.slug,
      name: newRole.name,
      nameBn: newRole.nameBn,
      permissions: newRole.permissions,
      moduleAccess: newRole.moduleAccess,
      createdAt: newRole.createdAt.toISOString(),
      updatedAt: newRole.updatedAt.toISOString(),
    };

    return NextResponse.json(
      { success: true, message: 'Role created successfully', role: created },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating role:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create role' },
      { status: 500 }
    );
  }
}

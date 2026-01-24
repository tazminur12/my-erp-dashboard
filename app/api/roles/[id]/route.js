import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { getDb } from '@/lib/mongodb';

/** Find role by id (ObjectId) or slug */
async function findRole(db, id) {
  if (ObjectId.isValid(id) && String(new ObjectId(id)) === String(id)) {
    return db.collection('roles').findOne({ _id: new ObjectId(id) });
  }
  return db.collection('roles').findOne({ slug: String(id) });
}

/**
 * GET /api/roles/[id]
 * Get single role by id or slug.
 */
export async function GET(request, { params }) {
  try {
    const { id } = params;
    const db = await getDb();

    const role = await findRole(db, id);
    if (!role) {
      return NextResponse.json({ error: 'Role not found' }, { status: 404 });
    }

    const formatted = {
      id: role._id.toString(),
      slug: role.slug,
      name: role.name,
      nameBn: role.nameBn,
      permissions: role.permissions || [],
      moduleAccess: role.moduleAccess || [],
      createdAt: role.createdAt?.toISOString?.(),
      updatedAt: role.updatedAt?.toISOString?.(),
    };

    return NextResponse.json({ success: true, role: formatted });
  } catch (error) {
    console.error('Error fetching role:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch role' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/roles/[id]
 * Update role permissions and/or moduleAccess.
 */
export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();
    const { name, nameBn, permissions, moduleAccess } = body;

    const db = await getDb();
    const role = await findRole(db, id);
    if (!role) {
      return NextResponse.json({ error: 'Role not found' }, { status: 404 });
    }

    const update = { updatedAt: new Date() };
    if (name !== undefined) update.name = name;
    if (nameBn !== undefined) update.nameBn = nameBn;
    if (Array.isArray(permissions)) update.permissions = permissions;
    if (Array.isArray(moduleAccess)) update.moduleAccess = moduleAccess;

    await db.collection('roles').updateOne(
      { _id: role._id },
      { $set: update }
    );

    const updated = await db.collection('roles').findOne({ _id: role._id });
    const formatted = {
      id: updated._id.toString(),
      slug: updated.slug,
      name: updated.name,
      nameBn: updated.nameBn,
      permissions: updated.permissions || [],
      moduleAccess: updated.moduleAccess || [],
      createdAt: updated.createdAt?.toISOString?.(),
      updatedAt: updated.updatedAt?.toISOString?.(),
    };

    return NextResponse.json({
      success: true,
      message: 'Role updated successfully',
      role: formatted,
    });
  } catch (error) {
    console.error('Error updating role:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update role' },
      { status: 500 }
    );
  }
}

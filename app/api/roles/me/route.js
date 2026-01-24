import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getDb } from '@/lib/mongodb';
import { DEFAULT_ROLES } from '@/lib/permissions';

/**
 * Seed default roles if needed.
 */
async function ensureRoles(db) {
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
 * GET /api/roles/me
 * Returns current user's role, permissions, and moduleAccess.
 * User → Role → Permissions, ModuleAccess.
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized', permissions: [], moduleAccess: [] },
        { status: 401 }
      );
    }

    const roleSlug = session.user.role || 'reservation';
    const db = await getDb();
    await ensureRoles(db);

    let role = await db.collection('roles').findOne({ slug: roleSlug });
    if (!role) {
      const fallback = DEFAULT_ROLES.find((r) => r.slug === roleSlug);
      if (fallback) {
        role = {
          slug: fallback.slug,
          name: fallback.name,
          nameBn: fallback.nameBn,
          permissions: fallback.permissions || [],
          moduleAccess: fallback.moduleAccess || [],
        };
      } else {
        role = {
          slug: roleSlug,
          name: roleSlug,
          nameBn: roleSlug,
          permissions: [],
          moduleAccess: ['dashboard'],
        };
      }
    }

    const permissions = role.permissions || [];
    const moduleAccess = role.moduleAccess || [];

    return NextResponse.json({
      success: true,
      role: {
        slug: role.slug,
        name: role.name,
        nameBn: role.nameBn,
      },
      permissions,
      moduleAccess,
    });
  } catch (error) {
    console.error('Error fetching current user role:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to fetch role',
        permissions: [],
        moduleAccess: [],
      },
      { status: 500 }
    );
  }
}

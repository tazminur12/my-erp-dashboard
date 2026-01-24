import { NextResponse } from 'next/server';
import { getModules, getPermissions, getPermissionsByModule } from '@/lib/permissions';

/**
 * GET /api/permissions
 * Returns all modules and permissions (grouped by module).
 */
export async function GET() {
  try {
    const modules = getModules();
    const permissions = getPermissions();
    const byModule = getPermissionsByModule();

    return NextResponse.json({
      success: true,
      modules,
      permissions,
      permissionsByModule: byModule,
    });
  } catch (error) {
    console.error('Error fetching permissions:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch permissions' },
      { status: 500 }
    );
  }
}

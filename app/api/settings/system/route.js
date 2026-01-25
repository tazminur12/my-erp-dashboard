import { NextResponse } from 'next/server';
import { getDb } from '../../../../lib/mongodb';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../../lib/auth';

// Default system settings
const DEFAULT_SETTINGS = {
  otpEnabled: true,
  otpExpiryMinutes: 5,
  maxOtpAttempts: 3,
  maintenanceMode: false,
  allowRegistration: false,
  sessionTimeoutMinutes: 30,
};

// GET system settings
export async function GET() {
  try {
    const db = await getDb();
    const settingsCollection = db.collection('system_settings');

    // Get settings or create default
    let settings = await settingsCollection.findOne({ type: 'system' });

    if (!settings) {
      // Create default settings
      const newSettings = {
        type: 'system',
        ...DEFAULT_SETTINGS,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      await settingsCollection.insertOne(newSettings);
      settings = newSettings;
    }

    return NextResponse.json({
      success: true,
      settings: {
        otpEnabled: settings.otpEnabled ?? DEFAULT_SETTINGS.otpEnabled,
        otpExpiryMinutes: settings.otpExpiryMinutes ?? DEFAULT_SETTINGS.otpExpiryMinutes,
        maxOtpAttempts: settings.maxOtpAttempts ?? DEFAULT_SETTINGS.maxOtpAttempts,
        maintenanceMode: settings.maintenanceMode ?? DEFAULT_SETTINGS.maintenanceMode,
        allowRegistration: settings.allowRegistration ?? DEFAULT_SETTINGS.allowRegistration,
        sessionTimeoutMinutes: settings.sessionTimeoutMinutes ?? DEFAULT_SETTINGS.sessionTimeoutMinutes,
        updatedAt: settings.updatedAt ? settings.updatedAt.toISOString() : null,
      },
    }, { status: 200 });
  } catch (error) {
    console.error('Error fetching system settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch system settings', message: error.message },
      { status: 500 }
    );
  }
}

// PUT update system settings
export async function PUT(request) {
  try {
    // Check user session and role
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Please login to access settings' },
        { status: 401 }
      );
    }

    // Only super_admin and admin can update system settings
    if (!['super_admin', 'admin'].includes(session.user.role)) {
      return NextResponse.json(
        { error: 'Forbidden', message: 'You do not have permission to update system settings' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const db = await getDb();
    const settingsCollection = db.collection('system_settings');

    // Prepare update data
    const updateData = {
      updatedAt: new Date(),
      updatedBy: session.user.id,
      updatedByName: session.user.name,
    };

    // Only update fields that are provided
    if (typeof body.otpEnabled === 'boolean') {
      updateData.otpEnabled = body.otpEnabled;
    }
    if (typeof body.otpExpiryMinutes === 'number' && body.otpExpiryMinutes > 0) {
      updateData.otpExpiryMinutes = body.otpExpiryMinutes;
    }
    if (typeof body.maxOtpAttempts === 'number' && body.maxOtpAttempts > 0) {
      updateData.maxOtpAttempts = body.maxOtpAttempts;
    }
    if (typeof body.maintenanceMode === 'boolean') {
      updateData.maintenanceMode = body.maintenanceMode;
    }
    if (typeof body.allowRegistration === 'boolean') {
      updateData.allowRegistration = body.allowRegistration;
    }
    if (typeof body.sessionTimeoutMinutes === 'number' && body.sessionTimeoutMinutes > 0) {
      updateData.sessionTimeoutMinutes = body.sessionTimeoutMinutes;
    }

    // Update or insert settings
    await settingsCollection.updateOne(
      { type: 'system' },
      { 
        $set: updateData,
        $setOnInsert: { 
          type: 'system',
          createdAt: new Date(),
        }
      },
      { upsert: true }
    );

    // Fetch updated settings
    const updatedSettings = await settingsCollection.findOne({ type: 'system' });

    return NextResponse.json({
      success: true,
      message: 'System settings updated successfully',
      settings: {
        otpEnabled: updatedSettings.otpEnabled ?? DEFAULT_SETTINGS.otpEnabled,
        otpExpiryMinutes: updatedSettings.otpExpiryMinutes ?? DEFAULT_SETTINGS.otpExpiryMinutes,
        maxOtpAttempts: updatedSettings.maxOtpAttempts ?? DEFAULT_SETTINGS.maxOtpAttempts,
        maintenanceMode: updatedSettings.maintenanceMode ?? DEFAULT_SETTINGS.maintenanceMode,
        allowRegistration: updatedSettings.allowRegistration ?? DEFAULT_SETTINGS.allowRegistration,
        sessionTimeoutMinutes: updatedSettings.sessionTimeoutMinutes ?? DEFAULT_SETTINGS.sessionTimeoutMinutes,
        updatedAt: updatedSettings.updatedAt ? updatedSettings.updatedAt.toISOString() : null,
      },
    }, { status: 200 });
  } catch (error) {
    console.error('Error updating system settings:', error);
    return NextResponse.json(
      { error: 'Failed to update system settings', message: error.message },
      { status: 500 }
    );
  }
}

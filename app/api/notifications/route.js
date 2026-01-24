import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { getDb } from '../../../lib/mongodb';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../lib/auth';

// Helper function to format time ago
function formatTimeAgo(date) {
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);
  
  if (diffInSeconds < 60) {
    return 'Just now';
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  } else if (diffInSeconds < 604800) {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  } else {
    return date.toLocaleDateString();
  }
}

// GET: Fetch notifications
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    const db = await getDb();
    const notificationsCollection = db.collection('notifications');

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit')) || 50;
    const unreadOnly = searchParams.get('unreadOnly') === 'true';

    // Build query - for now, get all notifications (can be filtered by userId later)
    const query = {};
    if (unreadOnly) {
      query.read = false;
    }

    // Fetch notifications, sorted by createdAt (newest first)
    const notifications = await notificationsCollection
      .find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .toArray();

    // Format notifications for frontend
    const formattedNotifications = notifications.map((notif) => ({
      id: notif._id.toString(),
      _id: notif._id.toString(),
      title: notif.title || 'Notification',
      message: notif.message || '',
      type: notif.type || 'system',
      read: notif.read || false,
      time: formatTimeAgo(notif.createdAt),
      createdAt: notif.createdAt.toISOString(),
      link: notif.link || null,
      metadata: notif.metadata || {}
    }));

    // Get unread count
    const unreadCount = await notificationsCollection.countDocuments({ read: false });

    return NextResponse.json({
      success: true,
      notifications: formattedNotifications,
      unreadCount
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to fetch notifications'
      },
      { status: 500 }
    );
  }
}

// POST: Mark notifications as read
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    const db = await getDb();
    const notificationsCollection = db.collection('notifications');

    const body = await request.json();
    const { notificationId, markAllAsRead } = body;

    if (markAllAsRead) {
      // Mark all notifications as read
      const result = await notificationsCollection.updateMany(
        { read: false },
        { $set: { read: true, updatedAt: new Date() } }
      );

      return NextResponse.json({
        success: true,
        message: 'All notifications marked as read',
        updatedCount: result.modifiedCount
      });
    } else if (notificationId) {
      // Mark specific notification as read
      if (!ObjectId.isValid(notificationId)) {
        return NextResponse.json(
          { success: false, error: 'Invalid notification ID' },
          { status: 400 }
        );
      }

      const result = await notificationsCollection.updateOne(
        { _id: new ObjectId(notificationId) },
        { $set: { read: true, updatedAt: new Date() } }
      );

      if (result.matchedCount === 0) {
        return NextResponse.json(
          { success: false, error: 'Notification not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        message: 'Notification marked as read'
      });
    } else {
      return NextResponse.json(
        { success: false, error: 'Missing notificationId or markAllAsRead flag' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Error updating notification:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to update notification'
      },
      { status: 500 }
    );
  }
}

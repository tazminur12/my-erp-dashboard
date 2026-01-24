import { getDb } from './mongodb';

/**
 * Create a notification in the database.
 * Use this from API routes (transactions, vendor bills, etc.) to send real-time notifications.
 *
 * @param {Object} opts
 * @param {string} opts.title - Notification title
 * @param {string} opts.message - Notification message
 * @param {string} [opts.type='system'] - Type: 'transaction' | 'payment' | 'bill' | 'order' | 'system' | 'loan' | etc.
 * @param {string} [opts.link] - Optional link (e.g. /transactions, /vendors/123)
 * @param {Object} [opts.metadata] - Optional extra data
 * @param {string} [opts.userId] - Optional user ID for user-specific notifications (future use)
 */
export async function createNotification(opts) {
  try {
    const db = await getDb();
    const notificationsCollection = db.collection('notifications');

    const doc = {
      title: opts.title || 'Notification',
      message: opts.message || '',
      type: opts.type || 'system',
      read: false,
      link: opts.link || null,
      metadata: opts.metadata || {},
      userId: opts.userId || null,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await notificationsCollection.insertOne(doc);
  } catch (error) {
    console.warn('Error creating notification:', error.message);
  }
}

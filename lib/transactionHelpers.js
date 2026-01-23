import { ObjectId } from 'mongodb';
import { getDb } from './mongodb';

/**
 * Generate unique transaction ID based on branch code
 * Format: {BRANCH_CODE}-TXN-{YYYYMMDD}-{SEQUENCE}
 */
export async function generateTransactionId(db, branchCode = 'MAIN') {
  try {
    const transactionsCollection = db.collection('transactions');
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
    const prefix = `${branchCode.toUpperCase()}-TXN-${dateStr}-`;

    // Find the highest sequence number for today
    const todayTransactions = await transactionsCollection
      .find({
        transactionId: { $regex: `^${prefix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}` }
      })
      .sort({ transactionId: -1 })
      .limit(1)
      .toArray();

    let sequence = 1;
    if (todayTransactions.length > 0) {
      const lastId = todayTransactions[0].transactionId;
      const lastSequence = parseInt(lastId.split('-').pop()) || 0;
      sequence = lastSequence + 1;
    }

    return `${prefix}${String(sequence).padStart(4, '0')}`;
  } catch (error) {
    console.error('Error generating transaction ID:', error);
    // Fallback to timestamp-based ID
    const timestamp = Date.now();
    return `${branchCode.toUpperCase()}-TXN-${timestamp}`;
  }
}

/**
 * Trigger family recomputation for Haji profile
 * This function should recalculate family totals based on individual haji transactions
 */
export async function triggerFamilyRecomputeForHaji(hajiDoc, options = {}) {
  try {
    const db = await getDb();
    const hajiCollection = db.collection('hajis');
    const session = options.session || null;

    if (!hajiDoc || !hajiDoc._id) {
      return;
    }

    // If haji has family members, recalculate family totals
    // This is a placeholder - implement based on your family structure
    const familyId = hajiDoc.familyId || hajiDoc.family_id;
    
    if (familyId) {
      // Aggregate family totals
      const familyMembers = await hajiCollection
        .find({ 
          $or: [
            { familyId: familyId },
            { family_id: familyId }
          ],
          isActive: { $ne: false }
        }, session ? { session } : {})
        .toArray();

      const familyTotals = {
        totalAmount: 0,
        paidAmount: 0,
        totalDue: 0
      };

      familyMembers.forEach(member => {
        familyTotals.totalAmount += Number(member.totalAmount || 0);
        familyTotals.paidAmount += Number(member.paidAmount || 0);
        familyTotals.totalDue += Number(member.totalDue || 0);
      });

      // Update family record if you have a families collection
      // This is a placeholder - adjust based on your schema
      /*
      const familiesCollection = db.collection('families');
      await familiesCollection.updateOne(
        { _id: new ObjectId(familyId) },
        { $set: familyTotals },
        session ? { session } : {}
      );
      */
    }
  } catch (error) {
    console.warn('Error triggering family recompute for haji:', error.message);
    // Don't throw - this is a non-critical operation
  }
}

/**
 * Trigger family recomputation for Umrah profile
 * Similar to haji but for umrah profiles
 */
export async function triggerFamilyRecomputeForUmrah(umrahDoc, options = {}) {
  try {
    const db = await getDb();
    const umrahCollection = db.collection('umrahs');
    const session = options.session || null;

    if (!umrahDoc || !umrahDoc._id) {
      return;
    }

    // If umrah has family members, recalculate family totals
    const familyId = umrahDoc.familyId || umrahDoc.family_id;
    
    if (familyId) {
      const familyMembers = await umrahCollection
        .find({ 
          $or: [
            { familyId: familyId },
            { family_id: familyId }
          ],
          isActive: { $ne: false }
        }, session ? { session } : {})
        .toArray();

      const familyTotals = {
        totalAmount: 0,
        paidAmount: 0,
        totalDue: 0
      };

      familyMembers.forEach(member => {
        familyTotals.totalAmount += Number(member.totalAmount || 0);
        familyTotals.paidAmount += Number(member.paidAmount || 0);
        familyTotals.totalDue += Number(member.totalDue || 0);
      });

      // Update family record if you have a families collection
      // This is a placeholder - adjust based on your schema
    }
  } catch (error) {
    console.warn('Error triggering family recompute for umrah:', error.message);
    // Don't throw - this is a non-critical operation
  }
}

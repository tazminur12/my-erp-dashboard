import { NextResponse } from 'next/server';
import { getDb } from '../../../../../lib/mongodb';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../../../lib/auth';
import bcrypt from 'bcryptjs';

export async function PATCH(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'super_admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    const userId = params?.id;
    if (!userId) {
      return NextResponse.json({ error: 'User id missing' }, { status: 400 });
    }
    const body = await req.json();
    const newPassword = String(body?.password || '').trim();
    if (!newPassword || newPassword.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
    }
    const hash = await bcrypt.hash(newPassword, 10);
    const db = await getDb();
    const col = db.collection('users');
    const res = await col.updateOne({ id: userId }, { $set: { password: hash, updated_at: new Date() } });
    if (!res.matchedCount) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: err.message || 'Failed to reset password' }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { getDb } from '../../../../../lib/mongodb';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../../../lib/auth';
import { getBranchInfo } from '../../../../../lib/branchHelper';
import * as XLSX from 'xlsx';

const normalizeHeader = (h) => {
  const s = String(h || '').trim().toLowerCase();
  const map = {
    'customer id': 'customer_id',
    'customerid': 'customer_id',
    'manual serial': 'manual_serial_number',
    'manual serial number': 'manual_serial_number',
    'pid': 'pid_no',
    'pid no': 'pid_no',
    'ng serial no': 'ng_serial_no',
    'tracking no': 'tracking_no',
    'name': 'name',
    'bangla name': 'bangla_name',
    'first name': 'first_name',
    'last name': 'last_name',
    'father name': 'father_name',
    'mother name': 'mother_name',
    'spouse name': 'spouse_name',
    'occupation': 'occupation',
    'date of birth': 'date_of_birth',
    'dob': 'date_of_birth',
    'gender': 'gender',
    'marital status': 'marital_status',
    'nationality': 'nationality',
    'passport number': 'passport_number',
    'passport no': 'passport_number',
    'passport type': 'passport_type',
    'issue date': 'issue_date',
    'expiry date': 'expiry_date',
    'nid number': 'nid_number',
    'mobile': 'mobile',
    'whatsapp': 'whatsapp_no',
    'whatsapp no': 'whatsapp_no',
    'email': 'email',
    'address': 'address',
    'division': 'division',
    'district': 'district',
    'upazila': 'upazila',
    'area': 'area',
    'post code': 'post_code',
    'emergency contact': 'emergency_contact',
    'emergency phone': 'emergency_phone',
    'package id': 'package_id',
    'agent id': 'agent_id',
    'license id': 'license_id',
    'departure date': 'departure_date',
    'return date': 'return_date',
    'total amount': 'total_amount',
    'paid amount': 'paid_amount',
    'payment method': 'payment_method',
    'payment status': 'payment_status',
    'service type': 'service_type',
    'service status': 'service_status'
  };
  return map[s] || s.replace(/[^a-z0-9_]/g, '_');
};

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    const branchInfo = getBranchInfo(session);
    const form = await request.formData();
    const file = form.get('file');
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const wb = XLSX.read(buffer, { type: 'buffer' });
    const sheetName = wb.SheetNames[0];
    const ws = wb.Sheets[sheetName];
    const rawRows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });
    if (!rawRows || rawRows.length < 2) {
      return NextResponse.json({ error: 'Sheet contains no data' }, { status: 400 });
    }
    const headers = rawRows[0].map(normalizeHeader);
    const rows = rawRows.slice(1).filter(r => r.some(cell => String(cell).trim() !== ''));
    const docs = rows.map((r) => {
      const obj = {};
      headers.forEach((h, idx) => {
        const v = r[idx];
        if (h) obj[h] = typeof v === 'string' ? v.trim() : v;
      });
      obj.name = obj.name || `${obj.first_name || ''} ${obj.last_name || ''}`.trim();
      obj.total_amount = obj.total_amount ? parseFloat(obj.total_amount) : 0;
      obj.paid_amount = obj.paid_amount ? parseFloat(obj.paid_amount) : 0;
      obj.nationality = obj.nationality || 'Bangladeshi';
      obj.payment_status = obj.payment_status || 'pending';
      obj.service_type = 'umrah';
      obj.is_active = obj.is_active !== undefined ? !!obj.is_active : true;
      obj.branch_id = branchInfo.branchId || '';
      obj.branchId = branchInfo.branchId || '';
      obj.branchName = branchInfo.branchName || '';
      obj.created_by = session?.user?.id || 'SYSTEM';
      obj.created_at = new Date();
      obj.updated_at = new Date();
      return obj;
    });
    if (!docs.length) {
      return NextResponse.json({ error: 'No usable rows found' }, { status: 400 });
    }
    const db = await getDb();
    const col = db.collection('umrahs');
    const result = await col.insertMany(docs, { ordered: false });
    return NextResponse.json({
      success: true,
      insertedCount: result.insertedCount || docs.length,
      sheet: sheetName
    }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message || 'Upload failed' }, { status: 500 });
  }
}

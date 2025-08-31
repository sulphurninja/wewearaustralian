import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongo';
import Vendor from '@/models/Vendor';

export async function POST(req: Request) {
  await dbConnect();
  const { vendorName, contactId } = await req.json();
  await Vendor.updateOne({ name: vendorName }, { $set: { xeroContactId: contactId } });
  return NextResponse.json({ ok: true });
}

import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongo';
import Vendor from '@/models/Vendor';

export async function GET() {
  await dbConnect();
  const vendors = await Vendor.find({}).sort({ name: 1 }).lean();
  return NextResponse.json({ vendors });
}

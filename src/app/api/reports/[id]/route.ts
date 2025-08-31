import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongo';
import Report from '@/models/Report';

export async function GET(_: Request, { params }: { params: { id: string } }) {
  await dbConnect();
  const rpt = await Report.findById(params.id).lean();
  if (!rpt) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(rpt);
}

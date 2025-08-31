import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongo';
import Report from '@/models/Report';
import { makeVendorPdf } from '@/lib/pdf';

export const runtime = 'nodejs';

export async function GET(_req: Request, ctx: { params: Promise<{ vendor: string }> }) {
  await dbConnect();
  const { vendor } = await ctx.params;

  const rpt: any = await Report.findOne({}, {}, { sort: { createdAt: -1 } }).lean();
  if (!rpt) return new NextResponse('No report yet', { status: 404 });

  const row = rpt.rows.find((x: any) => x.vendor === decodeURIComponent(vendor));
  if (!row) return new NextResponse('Vendor not in latest report', { status: 404 });

  const pdf = await makeVendorPdf(row);
  return new NextResponse(pdf, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="Sales-Summary-${row.vendor}.pdf"`
    }
  });
}

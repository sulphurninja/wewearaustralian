import { NextResponse } from 'next/server';
import { parse } from 'csv-parse/sync';
import { z } from 'zod';
import { dbConnect } from '@/lib/mongo';
import Vendor from '@/models/Vendor';

const Row = z.object({
  brand: z.string(),
  commission: z.coerce.number(),
  email: z.string().email().optional(),
  website: z.string().optional(),
});

export async function POST(req: Request) {
  await dbConnect();
  const text = await req.text();
  const rows = parse(text, { columns: true, skip_empty_lines: true });
  let imported = 0;

  for (const r of rows) {
    const data = Row.safeParse({
      brand: r['Supplier / Brand'] ?? r['Brand'] ?? r['(Supplier / Brand)'],
      commission: r['Commission Rate'] ?? r['Commission'],
      email: r['Email'],
      website: r['Website'],
    });
    if (!data.success) continue;
    await Vendor.updateOne(
      { name: data.data.brand },
      { $set: { name: data.data.brand, commissionPct: data.data.commission, email: data.data.email, website: data.data.website } },
      { upsert: true }
    );
    imported++;
  }
  const total = await Vendor.countDocuments();
  return NextResponse.json({ imported, total });
}

import { NextResponse } from 'next/server';
import { withXero } from '@/lib/xero';

export async function GET(req: Request) {
  const q = new URL(req.url).searchParams.get('q') || '';
  const data = await withXero(async (xero, tenantId) => {
    const where = q ? `Name.Contains("${q.replace(/"/g,'\\"')}")` : undefined;
    const res = await xero.accountingApi.getContacts(tenantId, undefined, where, 'Name ASC', undefined, 1, false);
    return res.body.contacts || [];
  });
  return NextResponse.json(data.map(c => ({ id: c.contactID, name: c.name, email: c.emailAddress })));
}

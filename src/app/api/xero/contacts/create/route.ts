import { NextResponse } from 'next/server';
import { withXero } from '@/lib/xero';

export async function POST(req: Request) {
  const body = await req.json();
  const { name, email } = body;
  const created = await withXero(async (xero, tenantId) => {
    const res = await xero.accountingApi.createContacts(tenantId, {
      contacts: [{ name, emailAddress: email }]
    });
    return res.body.contacts?.[0];
  });
  return NextResponse.json({ id: created?.contactID, name: created?.name, email: created?.emailAddress });
}

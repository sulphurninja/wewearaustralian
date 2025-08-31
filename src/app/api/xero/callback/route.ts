import { NextResponse } from 'next/server';
import { newXeroClient, setTokenSet } from '@/lib/xero';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const xero = newXeroClient();
  const tokenSet = await xero.apiCallback(url.href);

  // Pull tenants (orgs) and store the first (or you can render a picker)
  await xero.updateTenants();
  const first = xero.tenants?.[0];
  await setTokenSet(tokenSet, first?.tenantId, first?.tenantName);

  return NextResponse.redirect(`${process.env.APP_URL}/dashboard/xero?connected=1`);
}

import { NextResponse } from 'next/server';
import { getXeroIntegration } from '@/lib/xero';

export async function GET() {
  const integ = await getXeroIntegration();
  return NextResponse.json({
    connected: Boolean(integ.tokenSet && integ.tenantId),
    tenantName: integ.tenantName || null
  });
}

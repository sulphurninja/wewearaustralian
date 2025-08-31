import { XeroClient } from 'xero-node';
import Integration from '@/models/Integration';
import { dbConnect } from './mongo';

export function newXeroClient() {
  return new XeroClient({
    clientId: process.env.XERO_CLIENT_ID!,
    clientSecret: process.env.XERO_CLIENT_SECRET!,
    redirectUris: [process.env.XERO_REDIRECT_URI!],
    scopes: ['offline_access','accounting.transactions','accounting.contacts','accounting.settings'],
  });
}

export async function getXeroIntegration() {
  await dbConnect();
  let integ = await Integration.findOne({ provider: 'xero' });
  if (!integ) integ = await Integration.create({ provider: 'xero' });
  return integ;
}

export async function setTokenSet(tokenSet:any, tenantId?:string, tenantName?:string) {
  await dbConnect();
  const integ = await getXeroIntegration();
  integ.tokenSet = tokenSet;
  if (tenantId) integ.tenantId = tenantId;
  if (tenantName) integ.tenantName = tenantName;
  await integ.save();
}

export async function withXero<T>(fn: (x: XeroClient, tenantId: string) => Promise<T>) {
  const integ = await getXeroIntegration();
  if (!integ.tokenSet) throw new Error('Xero not connected');
  if (!integ.tenantId) throw new Error('No Xero tenant selected');

  const xero = newXeroClient();
  await xero.setTokenSet(integ.tokenSet);

  // Refresh if needed
  if (xero.isTokenSetExpired()) {
    const newSet = await xero.refreshToken();
    await setTokenSet(newSet);
  }

  const res = await fn(xero, integ.tenantId);
  // persist potentially updated tokens
  await setTokenSet(await xero.readTokenSet(), integ.tenantId, integ.tenantName);
  return res;
}

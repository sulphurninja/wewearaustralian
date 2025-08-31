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
  if (!integ?.tokenSet) throw new Error('Xero not connected');
  if (!integ?.tenantId) throw new Error('No Xero tenant selected');

  const xero = newXeroClient();

  // Load the plain JSON token set you stored in Mongo
  await xero.setTokenSet(integ.tokenSet);

  // Read the SDK's TokenSet instance (has .expired())
  let ts = await xero.readTokenSet();

  // Refresh if needed
  if (!ts || ts.expired()) {
    const refreshed = await xero.refreshToken();
    await setTokenSet(refreshed, integ.tenantId, integ.tenantName);
    ts = refreshed;
  }

  // (Usually not necessary, but safe if tenants array isn't loaded)
  if (!xero.tenants?.length) await xero.updateTenants();

  const result = await fn(xero, integ.tenantId);

  // Persist possibly rotated refresh token after the API call
  await setTokenSet(await xero.readTokenSet(), integ.tenantId, integ.tenantName);

  return result;
}
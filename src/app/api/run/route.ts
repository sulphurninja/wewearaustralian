import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongo';
import Vendor from '@/models/Vendor';
import Report from '@/models/Report';
import { aggregateOrders } from '@/lib/aggregate';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fetchShopifyOrders } from '@/lib/providers/shopify';

function hasShopifyCreds() {
  return Boolean(process.env.SHOPIFY_STORE_DOMAIN && process.env.SHOPIFY_ADMIN_ACCESS_TOKEN);
}

const INLINE_FALLBACK = [
  // (a tiny inline order so API never fails; your real file still used if present)
  {
    id: 'gid://shopify/Order/FALLBACK',
    name: '#FALLBACK',
    createdAt: new Date().toISOString(),
    currencyCode: 'AUD',
    lineItems: { edges: [{ node: { id: 'li1', vendor: 'Brand A', sku: 'A-TEE', quantity: 1, discountedTotalSet: { shopMoney: { amount: '50.00' }}}}]},
    shippingLines: { edges: [{ node: { priceSet: { shopMoney: { amount: '5.00' }}}}]},
    refunds: { edges: [] }
  }
];

export async function POST() {
  await dbConnect();

  const end = new Date();
  const start = new Date(end); start.setDate(end.getDate() - 30);

  let orders: any[] = [];
  let source: 'shopify' | 'mock' | 'inline' = 'inline';

  try {
    if (hasShopifyCreds()) {
      orders = await fetchShopifyOrders(start, end);
      source = 'shopify';
    } else {
      const p = path.join(process.cwd(), 'data', 'orders-30d.json');
      const txt = await fs.readFile(p, 'utf8');
      orders = JSON.parse(txt);
      source = 'mock';
    }
  } catch (e) {
    console.error('Falling back to inline mock orders:', e);
    orders = INLINE_FALLBACK;
    source = 'inline';
  }

  const aggregates = aggregateOrders(orders); // fees=0

  const vendors = await Vendor.find({}).lean();
  const rows = aggregates.map(r => {
    const v = vendors.find(x => x.name === r.vendor);
    const pct = v?.commissionPct ?? 0;
    const commissionAmt = r.gross * pct / 100;
    const refundsCommission = r.refunds * pct / 100;
    const netPayable = commissionAmt - refundsCommission - r.fees + r.shipping;
    return { ...r, commissionPct: pct, commissionAmt, netPayable };
  });

  const rpt = await Report.create({ periodStart: start, periodEnd: end, rows });
  return NextResponse.json({ id: rpt._id.toString(), rows: rows.length, source });
}

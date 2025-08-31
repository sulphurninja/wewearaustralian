import { NextResponse } from 'next/server';
import Report from '@/models/Report';
import Vendor from '@/models/Vendor';
import { dbConnect } from '@/lib/mongo';
import { withXero } from '@/lib/xero';

export async function POST(req: Request) {
  await dbConnect();
  const { reportId } = await req.json();
  const rpt:any = await Report.findById(reportId).lean();
  if (!rpt) return NextResponse.json({ error: 'Report not found' }, { status: 404 });

  const vendors = await Vendor.find({}).lean();
  const payload = [];
  for (const row of rpt.rows) {
    const v = vendors.find(x => x.name === row.vendor);
    if (!v?.xeroContactId) continue; // skip unlinked
    payload.push({
      Date: new Date().toISOString().slice(0,10),
      Status: 'DRAFT',
      Reference: `Showroom commission ${new Date(rpt.periodStart).toISOString().slice(0,10)}→${new Date(rpt.periodEnd).toISOString().slice(0,10)}`,
      Contact: { ContactID: v.xeroContactId },
      LineItems: [{
        Description: `Commission payable for ${row.vendor}`,
        Quantity: 1, UnitAmount: row.netPayable, AccountCode: '300', TaxType: 'INPUT'
      }]
    });
  }

  const res = await withXero(async (xero, tenantId) => {
    if (!payload.length) return [];
    const out = await xero.accountingApi.createPurchaseOrders(tenantId, { purchaseOrders: payload });
    return out.body.purchaseOrders || [];
  });

  // save PO ids back
  for (const po of res) {
    await Report.updateOne(
      { _id: reportId, 'rows.vendor': po.contact?.name },
      { $set: { 'rows.$.xeroPoId': po.purchaseOrderID } }
    );
  }

  return NextResponse.json({ created: res.length });
}

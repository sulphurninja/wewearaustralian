import { NextResponse } from 'next/server';
import { withXero } from '@/lib/xero';
import Vendor from '@/models/Vendor';
import Report from '@/models/Report';
import { dbConnect } from '@/lib/mongo';

export async function POST(req: Request) {
  await dbConnect();
  const { reportId, vendorName } = await req.json();
  const vendor = await Vendor.findOne({ name: vendorName });
  if (!vendor?.xeroContactId) return NextResponse.json({ error: 'Vendor not linked to a Xero contact' }, { status: 400 });

  const rpt:any = await Report.findById(reportId).lean();
  if (!rpt) return NextResponse.json({ error: 'Report not found' }, { status: 404 });
  const row = rpt.rows.find((r:any)=> r.vendor === vendorName);
  if (!row) return NextResponse.json({ error: 'Vendor row not found' }, { status: 404 });

  const po = await withXero(async (xero, tenantId) => {
    const res = await xero.accountingApi.createPurchaseOrders(tenantId, {
      purchaseOrders: [{
        Date: new Date().toISOString().slice(0,10),
        Status: 'DRAFT',
        Reference: `Showroom commission ${new Date(rpt.periodStart).toISOString().slice(0,10)}→${new Date(rpt.periodEnd).toISOString().slice(0,10)}`,
        Contact: { ContactID: vendor.xeroContactId },
        LineItems: [{
          Description: `Commission payable for ${vendorName}`,
          Quantity: 1,
          UnitAmount: row.netPayable,
          AccountCode: '300',   // set default account
          TaxType: 'INPUT'      // adjust per region
        }]
      }]
    });
    return res.body.purchaseOrders?.[0];
  });

  // persist PO id
  await Report.updateOne(
    { _id: reportId, 'rows.vendor': vendorName },
    { $set: { 'rows.$.xeroPoId': po?.purchaseOrderID } }
  );

  return NextResponse.json({ id: po?.purchaseOrderID, number: po?.purchaseOrderNumber });
}

// Use pdfkit's standalone build so it doesn't try to read Helvetica.afm from disk
// @ts-expect-error - pdfkit doesn't ship types for the standalone path
import PDFDocument from 'pdfkit/js/pdfkit.standalone.js';

export async function makeVendorPdf(d: {
  vendor: string; currency: string; orders: number; units: number;
  gross: number; refunds: number; shipping: number; fees: number;
  commissionPct: number; commissionAmt: number; netPayable: number;
}) {
  const doc = new PDFDocument({ size: 'A4', margins: { top: 48, left: 48, right: 48, bottom: 48 } });

  const chunks: Buffer[] = [];
  doc.on('data', (c) => chunks.push(c));
  const done = new Promise<Buffer>((resolve) => doc.on('end', () => resolve(Buffer.concat(chunks))));

  // Use built-in PostScript fonts that need no files (works with standalone build)
  doc.font('Times-Bold').fontSize(18).text(`Sales Summary — ${d.vendor}`, { underline: true });
  doc.moveDown();
  doc.font('Times-Roman').fontSize(12);

  const f = (n: number, c: string) => `${n.toFixed(2)} ${c}`;

  doc.text(`Orders: ${d.orders}`);
  doc.text(`Units: ${d.units}`);
  doc.moveDown(0.5);
  doc.text(`Gross: ${f(d.gross, d.currency)}`);
  doc.text(`Refunds: ${f(d.refunds, d.currency)}`);
  doc.text(`Shipping: ${f(d.shipping, d.currency)}`);
  doc.text(`Payment fees: ${f(d.fees, d.currency)} (disabled)`);
  doc.moveDown();
  doc.text(`Commission (${d.commissionPct}%): ${f(d.commissionAmt, d.currency)}`);
  doc.moveDown(0.5);
  doc.font('Times-Bold').fontSize(14).text(`Net payable: ${f(d.netPayable, d.currency)}`);

  doc.end();
  return done;
}

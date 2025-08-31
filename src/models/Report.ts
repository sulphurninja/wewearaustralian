import { Schema, models, model } from 'mongoose';

const ReportItemSchema = new Schema({
  vendor: String, currency: String, orders: Number, units: Number,
  gross: Number, refunds: Number, shipping: Number,
  fees: { type: Number, default: 0 }, // fees OFF for now
  commissionPct: Number, commissionAmt: Number, netPayable: Number,
  xeroPoId: String, // store created PO id
}, { _id: false });

const ReportSchema = new Schema({
  periodStart: Date, periodEnd: Date, rows: [ReportItemSchema],
}, { timestamps: true });

export default models.Report || model('Report', ReportSchema);

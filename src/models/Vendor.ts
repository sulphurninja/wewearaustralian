import { Schema, models, model } from 'mongoose';

const VendorSchema = new Schema({
  name: { type: String, unique: true, required: true, index: true },
  commissionPct: { type: Number, default: 0 },
  email: String,
  website: String,
  xeroContactId: String,
}, { timestamps: true });

export default models.Vendor || model('Vendor', VendorSchema);

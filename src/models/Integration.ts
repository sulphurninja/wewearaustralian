import { Schema, models, model } from 'mongoose';

const IntegrationSchema = new Schema({
  provider: { type: String, required: true, index: true }, // 'xero'
  tokenSet: Schema.Types.Mixed, // xero-node token set
  tenantId: String,
  tenantName: String,
}, { timestamps: true });

export default models.Integration || model('Integration', IntegrationSchema);

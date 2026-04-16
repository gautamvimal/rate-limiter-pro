import mongoose from 'mongoose';

const policySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    scope: {
      type: String,
      enum: ['global', 'plan', 'user', 'organization'],
      default: 'global'
    },
    identifier: { type: String, default: 'default', index: true },
    limit: { type: Number, required: true, min: 1 },
    windowMs: { type: Number, required: true, min: 1000 },
    burstMultiplier: { type: Number, default: 1.3, min: 1 },
    queueLimit: { type: Number, default: 20, min: 0 },
    slaTier: {
      type: String,
      enum: ['bronze', 'silver', 'gold', 'platinum'],
      default: 'bronze'
    },
    currentAdaptiveLimit: { type: Number, default: null },
    active: { type: Boolean, default: true },
    notes: { type: String, default: '' }
  },
  { timestamps: true }
);

policySchema.index({ scope: 1, identifier: 1, active: 1 });

const Policy = mongoose.model('Policy', policySchema);

export default Policy;

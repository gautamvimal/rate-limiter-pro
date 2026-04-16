import mongoose from 'mongoose';

const usageLogSchema = new mongoose.Schema(
  {
    userId: { type: String, index: true },
    organizationId: { type: String, index: true },
    plan: { type: String, index: true },
    routeKey: { type: String, index: true },
    method: { type: String, default: 'GET' },
    policyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Policy', index: true },
    requestHash: { type: String, index: true },
    decision: {
      type: String,
      enum: ['allow', 'delay', 'reject'],
      required: true
    },
    usageCount: { type: Number, default: 0 },
    retryAfterSeconds: { type: Number, default: 0 },
    metadata: { type: Object, default: {} }
  },
  { timestamps: true }
);

usageLogSchema.index({ createdAt: -1 });

const UsageLog = mongoose.model('UsageLog', usageLogSchema);

export default UsageLog;

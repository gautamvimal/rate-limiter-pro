import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    email: { type: String, default: '' },
    organizationId: { type: String, default: 'personal' },
    plan: {
      type: String,
      enum: ['free', 'basic', 'pro', 'enterprise'],
      default: 'free'
    },
    active: { type: Boolean, default: true }
  },
  { timestamps: true }
);

const User = mongoose.model('User', userSchema);

export default User;

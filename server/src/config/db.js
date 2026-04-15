import mongoose from 'mongoose';
import env from './env.js';
import logger from '../utils/logger.js';

export const connectDB = async () => {
  mongoose.set('strictQuery', true);
  await mongoose.connect(env.mongoUri, {
    autoIndex: true
  });
  logger.info(`MongoDB connected: ${mongoose.connection.host}`);
};

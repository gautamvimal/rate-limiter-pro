import Redis from 'ioredis';
import env from './env.js';
import logger from '../utils/logger.js';

export const redisClient = new Redis(env.redisUrl, {
  maxRetriesPerRequest: 3,
  enableReadyCheck: true,
  lazyConnect: false
});

redisClient.on('connect', () => logger.info('Redis connected'));
redisClient.on('error', (error) => logger.error('Redis error', error.message));

export const pingRedis = async () => redisClient.ping();

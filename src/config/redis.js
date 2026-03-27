const { createClient } = require('redis');

let redisClient;

const connectRedis = async () => {
  redisClient = createClient({
    url: process.env.REDIS_URL || 'redis://127.0.0.1:6379'
  });

  redisClient.on('error', err => console.error('Redis Error:', err));

  await redisClient.connect();
  console.log("Redis Connected");
};

const getRedisClient = () => redisClient;

module.exports = { connectRedis, getRedisClient };
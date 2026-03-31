const Redis = require('ioredis');

let redis;

try {
  redis = new Redis(process.env.REDIS_URL, {
    lazyConnect: true,
    enableOfflineQueue: false,
    retryStrategy: () => null,
    maxRetriesPerRequest: 1,
  });

  redis.on('connect', () => console.log('Redis connected'));
  redis.on('error', (err) => console.warn('Redis unavailable:', err.message));
} catch {
  console.warn('Redis init failed — caching disabled');
}

const safeRedis = {
  get: async (key) => {
    try { return await redis.get(key); } catch { return null; }
  },
  setex: async (key, ttl, value) => {
    try { return await redis.setex(key, ttl, value); } catch { return null; }
  },
  del: async (...keys) => {
    try { return await redis.del(...keys); } catch { return null; }
  },
  keys: async (pattern) => {
    try { return await redis.keys(pattern); } catch { return []; }
  },
};

module.exports = safeRedis;

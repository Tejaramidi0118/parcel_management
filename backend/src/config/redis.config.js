import Redis from 'ioredis';

// Create Redis client with retry strategy
const redis = new Redis({
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASSWORD || undefined,
    retryStrategy(times) {
        if (times > 3) {
            console.warn('⚠️  Redis unavailable - running without cache');
            return null; // Stop retrying after 3 attempts
        }
        const delay = Math.min(times * 50, 2000);
        return delay;
    },
    maxRetriesPerRequest: 3,
    lazyConnect: true, // Don't connect immediately
});

// Handle connection events
redis.on('connect', () => {
    console.log('✅ Redis connected');
});

redis.on('error', (err) => {
    // Don't crash the app if Redis is unavailable
    console.warn('⚠️  Redis error (app will continue without cache):', err.message);
});

// Try to connect
redis.connect().catch(() => {
    console.warn('⚠️  Redis not available - caching disabled');
});

// Flag to check if Redis is available
let isRedisAvailable = false;
redis.on('connect', () => { isRedisAvailable = true; });
redis.on('error', () => { isRedisAvailable = false; });


// ===== CACHE HELPERS =====

/**
 * Get cached data
 * @param {string} key - Cache key
 * @returns {Promise<any>} - Parsed JSON data or null
 */
export async function getCache(key) {
    if (!isRedisAvailable) return null; // Skip if Redis unavailable

    try {
        const data = await redis.get(key);
        return data ? JSON.parse(data) : null;
    } catch (error) {
        console.error(`Cache get error for key "${key}":`, error);
        return null;
    }
}

/**
 * Set cache with TTL
 * @param {string} key - Cache key
 * @param {any} value - Data to cache
 * @param {number} ttlSeconds - Time to live in seconds (default: 60)
 */
export async function setCache(key, value, ttlSeconds = 60) {
    if (!isRedisAvailable) return false; // Skip if Redis unavailable

    try {
        await redis.setex(key, ttlSeconds, JSON.stringify(value));
        return true;
    } catch (error) {
        console.error(`Cache set error for key "${key}":`, error);
        return false;
    }
}

/**
 * Delete cache by key
 * @param {string} key - Cache key
 */
export async function deleteCache(key) {
    try {
        await redis.del(key);
        return true;
    } catch (error) {
        console.error(`Cache delete error for key "${key}":`, error);
        return false;
    }
}

/**
 * Delete cache by pattern (e.g., "products:*")
 * @param {string} pattern - Key pattern
 */
export async function deleteCachePattern(pattern) {
    try {
        const keys = await redis.keys(pattern);
        if (keys.length > 0) {
            await redis.del(...keys);
        }
        return true;
    } catch (error) {
        console.error(`Cache pattern delete error for "${pattern}":`, error);
        return false;
    }
}

// ===== DISTRIBUTED LOCK HELPERS =====

/**
 * Acquire distributed lock (for inventory locking during checkout)
 * @param {string} lockKey - Lock identifier
 * @param {number} ttlSeconds - Lock timeout in seconds (default: 10)
 * @param {number} retries - Number of retries (default: 3)
 * @returns {Promise<string|null>} - Lock token if acquired, null otherwise
 */
export async function acquireLock(lockKey, ttlSeconds = 10, retries = 3) {
    const lockToken = `lock:${Date.now()}:${Math.random()}`;

    for (let i = 0; i < retries; i++) {
        const result = await redis.set(
            lockKey,
            lockToken,
            'EX',
            ttlSeconds,
            'NX' // Only set if key doesn't exist
        );

        if (result === 'OK') {
            return lockToken;
        }

        // Wait before retry (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, 50 * (i + 1)));
    }

    return null;
}

/**
 * Release distributed lock
 * @param {string} lockKey - Lock identifier
 * @param {string} lockToken - Token returned from acquireLock
 */
export async function releaseLock(lockKey, lockToken) {
    if (!lockToken) return false;

    // Lua script to ensure we only delete if token matches (atomic)
    const luaScript = `
    if redis.call("get", KEYS[1]) == ARGV[1] then
      return redis.call("del", KEYS[1])
    else
      return 0
    end
  `;

    try {
        const result = await redis.eval(luaScript, 1, lockKey, lockToken);
        return result === 1;
    } catch (error) {
        console.error('Lock release error:', error);
        return false;
    }
}

// ===== SESSION/TOKEN BLACKLIST =====

/**
 * Add token to blacklist
 * @param {string} token - JWT token
 * @param {number} expiresInSeconds - Token expiry time
 */
export async function blacklistToken(token, expiresInSeconds) {
    try {
        await redis.setex(`blacklist:${token}`, expiresInSeconds, '1');
        return true;
    } catch (error) {
        console.error('Token blacklist error:', error);
        return false;
    }
}

/**
 * Check if token is blacklisted
 * @param {string} token - JWT token
 * @returns {Promise<boolean>}
 */
export async function isTokenBlacklisted(token) {
    try {
        const result = await redis.get(`blacklist:${token}`);
        return result !== null;
    } catch (error) {
        console.error('Token blacklist check error:', error);
        return false;
    }
}

export default redis;

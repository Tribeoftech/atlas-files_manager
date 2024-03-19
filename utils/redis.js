/**
 * Creates a Redis client instance to connect to a Redis server.
 * Promisifies the Redis client methods to use async/await instead of callbacks.
 * Exposes get(), set(), and del() methods to get, set, and delete values from Redis.
 */
const redis = require('redis');
const { promisify } = require('util');

class RedisClient {
  constructor() {
    this.client = redis.createClient({
    });

    this.client.on('error', (err) => {
      console.error('Redis client error:', err);
    });

       /**
     * Promisifies the Redis client methods to use async/await instead of callbacks.
     * Exposes async versions of get(), set(), and del() to get,
     * set and delete values from Redis.
     */
    this.getAsync = promisify(this.client.get).bind(this.client);
    this.setAsync = promisify(this.client.set).bind(this.client);
    this.delAsync = promisify(this.client.del).bind(this.client);
  }

    /**
   * Checks if the Redis client is currently connected.
   *
   * Gets a value from Redis. Wraps the promisified getAsync method.
   * Catches any errors and rethrows them.
   */
  isAlive() {
    return this.client.connected;
  }

  async get(key) {
    try {
      return await this.getAsync(key);
    } catch (error) {
      console.error("Error getting value from Redis:", error);
      throw error;
    }
  }

    /**
   * Sets a key-value pair in Redis with an optional expiration time.
   *
   * @param {string} key - The key to set in Redis
   * @param {string} value - The value to set for the key
   * @param {number} duration - Optional expiration time in seconds
   * @returns {Promise} Promise that resolves when the key is set
   * @throws {Error} If there was an error setting the key in Redis
   */
  async set(key, value, duration) {
    try {
      return await this.setAsync(key, value, "EX", duration);
    } catch (error) {
      console.error("Error setting value in Redis:", error);
      throw error;
    }
  }

    /**
   * Deletes a key from Redis.
   *
   * @param {string} key - The key to delete.
   *
   * @returns {Promise} Promise that resolves when the key is deleted.
   *
   * @throws {Error} If there was an error deleting the key.
   */
  async del(key) {
    try {
      return await this.delAsync(key);
    } catch (error) {
      console.error("Error deleting value from Redis:", error);
      throw error;
    }
  }
}

const redisClient = new RedisClient();
module.exports = redisClient;

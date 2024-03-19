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

    // Promisify Redis client methods
    this.getAsync = promisify(this.client.get).bind(this.client);
    this.setAsync = promisify(this.client.set).bind(this.client);
    this.delAsync = promisify(this.client.del).bind(this.client);
  }

  isAlive() {
    return this.client.connected;
  }

  // Gets a value from Redis
  async get(key) {
    try {
      return await this.getAsync(key);
    } catch (error) {
      console.error('Error getting value from Redis:', error);
      throw error;
    }
  }

  // Sets a value in Redis with an expiration
  async set(key, value, duration) {
    try {
      return await this.setAsync(key, value, 'EX', duration);
    } catch (error) {
      console.error('Error setting value in Redis:', error);
      throw error;
    }
  }

  // Deletes a key from Redis
  async del(key) {
    try {
      return await this.delAsync(key);
    } catch (error) {
      console.error('Error deleting value from Redis:', error);
      throw error;
    }
  }
}

const redisClient = new RedisClient();
module.exports = redisClient;
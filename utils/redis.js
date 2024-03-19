// Redis Client File - Task 0

// imports
import { resolve } from "path";
import redis from "redis";
import { promisify } from "util";


// RedisClient class
class RedisClient {
  constructor() {
    this.client = redis.createClient();
    this.client.on("error", (error) => {
      console.error(`Redis client not connected: ${error}`);
    });
    this.client.on("ready", () => {
      resolve();
    });
  }

  // Checks for Redis Connection
  isAlive() {
    if (!this.client.connected) {
      return false;
    }
    return true;
  }

  // Gets a key
  async get(key) {
    const asyncGet = promisify(this.client.get).bind(this.client);
    return asyncGet(key);
  }

  // Sets a key
  async set(key, value, duration) {
    const asyncSet = promisify(this.client.setex).bind(this.client);
    return asyncSet(key, duration, value);
  }

  // Deletes a key
  async del(key) {
    const asyncDel = promisify(this.client.del).bind(this.client);
    return asyncDel(key);
  }
}

// Exports redisClient
const redisClient = new RedisClient();
export default redisClient;

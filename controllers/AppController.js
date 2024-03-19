/**
 * Imports the Redis client instance and database client instance
 * that will be used throughout the application.
 */
import dbClient from "../utils/db";
import redisClient from "../utils/redis";

/**
 * Gets the status of Redis and database connections.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Promise} A promise that resolves with a JSON response
 * containing the status of the Redis and database connections.
 */
class AppController {
  static async getStatus(req, res) {
    const isRedisAlive = redisClient.isAlive();
    const isDbAlive = dbClient.isAlive();
    return res.status(200).json({ redis: isRedisAlive, db: isDbAlive });
  }
  /**
   * Gets stats about users and files from the database.
   *
   * This is an async method that queries the database client
   * to get the number of users and number of files currently
   * stored. It returns a JSON response with the results.
   */

  static async getStats(req, res) {
    const numberOfUsers = await dbClient.nbUsers();
    const numberOfFiles = await dbClient.nbFiles();
    return res.status(200).json({ users: numberOfUsers, files: numberOfFiles });
  }
}

module.exports = AppController;

/**
 * Imports the Redis and database client modules that are used in this controller.
 */
import dbClient from "../utils/db";
import redisClient from "../utils/redis";

/**
 * Gets the status of the Redis and database connections.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Object} - The status object with redis and db keys.
 */
class AppController {
  static async getStatus(req, res) {
    const redis = redisClient.isAlive();
    const db = dbClient.isAlive();
    return res.status(200).json({ redis, db });
  }

    /**
   * Gets stats about users and files from the database.
   *
   * @async
   * @param {object} req - Express request object
   * @param {object} res - Express response object
   * @returns {Promise<object>} - Promise resolving to object with user and file counts
   */
  static async getStats(req, res) {
    const users = await dbClient.nbUsers();
    const files = await dbClient.nbFiles();
    return res.status(200).json({ users, files });
  }
}

module.exports = AppController;

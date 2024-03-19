/**
 * Controller for app.
 * Exports AppController class with methods for:
 * - Getting app status by checking Redis and DB connections
 * - Getting app stats by getting number of users and files from DB
 */
// Controller for app
import dbClient from "../utils/db";
import redisClient from "../utils/redis";

// AppController class
class AppController {
  static async getStatus(req, res) {
    const redis = redisClient.isAlive();
    const db = dbClient.isAlive();
    return res.status(200).json({ redis, db });
  }

  /**
   * Gets app stats by retrieving number of users and files from the database.
   *
   * @returns {Object} Object with `users` and `files` properties containing counts.
   */
  // Getting stats
  static async getStats(req, res) {
    const users = await dbClient.nbUsers();
    const files = await dbClient.nbFiles();
    return res.status(200).json({ users, files });
  }
}

module.exports = AppController;

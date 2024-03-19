/**
 * AppController contains controller methods for the app.
 * getStatus gets the status of redis and db clients.
 * getStats gets user and file counts from the db.
 */
import dbClient from "../utils/db";
import redisClient from "../utils/redis";

class AppController {
  static getStatus(req, res) {
    const result = {
      redis: redisClient.isAlive(),
      db: dbClient.isAlive(),
    };

    res.status(200).send(result);
  }

  static async getStats(req, res) {
    const users = await dbClient.nbUsers();
    const files = await dbClient.nbFiles();

    const result = {
      users,
      files,
    };

    res.status(200).send(result);
  }
}

export default AppController;

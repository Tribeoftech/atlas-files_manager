/**
 * Authenticates a user and generates an auth token. Looks up the user by email
 * and password, generates a random token, stores it in Redis along with the user ID,
 * and returns the token.
 *
 * Signs out a user by deleting their auth token from Redis based on the provided token.
 */
import { v4 as uuidv4 } from 'uuid';
import dbClient from '../utils/db';
import redisClient from '../utils/redis';

/**
 * Checks for an authorization header and responds
 * with 401 unauthorized if no header is present.
 */
const AuthController = {
  getConnect: async (req, res) => {
    const authHeader = req.header("Authorization");
    console.log(authHeader);

    if (!authHeader) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    /**
     * Decodes the Basic authentication header to extract the email and password credentials.
     * Splits the decoded credentials string on ':' to separate email and password.
     * Returns 401 Unauthorized if email or password are missing.
     */
    const encodedCredentials = authHeader.slice("Basic ".length);
    const credentials = Buffer.from(encodedCredentials, "base64").toString();
    const [email, password] = credentials.split(":");

    if (!email || !password) {
      return res.status(401).json({ error: "Unauthorized" });
    }

        /**
     * Looks up the user by email and hashed password.
     * If no matching user is found, returns 401 Unauthorized error.
     * If user is found, continues with auth flow.
     */
    const hashedPassword = sha1(password);

    try {
      const user = await dbClient.findUser({ email, password: hashedPassword });
      if (!user) {
        return res.status(401).json({ error: "Unauthorized" });
      }

            /**
       * Generates a random auth token, stores it and the user ID in Redis with 24 hour expiration,
       * and returns the token in a 200 response.
       * Catches any errors and returns a 500 response.
       */
      const token = uuidv4();
      await redisClient.set(`auth_${token}`, user._id.toString(), 24 * 60 * 60); // set token valid for 24 hours

      return res.status(200).json({ token });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ error: "Internal server error" });
    }
  },

    /**
   * Signs out a user by deleting their auth token from Redis.
   *
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * Deletes the user's auth token from Redis based on the 'x-token' header.
   * Returns 401 unauthorized if token is invalid.
   * Returns 204 no content if token is successfully deleted.
   */
  getDisconnect: async (req, res) => {
    const token = req.headers["x-token"];
    if (!token) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    try {
      const reply = await redisClient.del(`auth_${token}`);
      if (reply === 0) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      return res.status(204).send(); // Adjusted with return
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Internal server error" }); // Adjusted with return
    }
  },
};

module.exports = AuthController;

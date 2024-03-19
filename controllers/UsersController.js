/**
 * Creates a new user.
 * Validates the email and password in the request body.
 * Checks if a user with the given email already exists.
 * Hashes the password, inserts the new user document into the database.
 * Returns the new user's id and email in the response.
 */

const sha1 = require('sha1') 
const UserModel = require('../utils/db');
//const mongo = require('mongodb');
//const redis = require('../utils/redis');
//const dbClient = require('../utils/db');
/**
 * Creates a new user.
 * @param {Object} req - The request object.
 * @param {string} req.body.email - The email of the user to create.
 * @param {string} req.body.password - The password of the user to create.
 */

class UsersController {
  static async createUser(req, res) {
    const { email, password } = req.body;

                /**
     * Validates the email and password fields in the request body.
     * Checks if a user with the given email already exists in the database.
     * If email or password is missing or invalid, returns 400 error response.
     * If email already exists, returns 400 error response.
     */
    if (!email) {
      return res.status(400).json({ error: "Missing email" });
    }
    if (!password) {
      return res.status(400).json({ error: "Missing password" });
    }

    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return res.status(400).send({ error: "Email already exists" });
    }

                /**
     * Hashes the password using SHA1 algorithm.
     * Creates a new user document with the email, hashed password.
     * Saves the new user document to the database.
     * Returns a 201 response with the new user's email and id.
     */
    const hashedPassword = sha1(password);

    const newUser = await UserModel.insertOne({
      email,
      password: hashedPassword,
    });

    await newUser.save();

    return res.status(201).json({ email: newUser.email, id: newUser._id });

            /**
     * Handles any errors creating the user by logging the error
     * and returning a 500 status with an 'Internal Server Error' message.
     */
  }
  catch(error) {
    console.error("Error creating user:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

module.exports = new UsersController();

/**
 * Creates a new user.
 * Validates the email and password in the request body.
 * Checks if a user with the given email already exists.
 * Hashes the password, inserts the new user document into the database.
 * Returns the new user's id and email in the response.
 */

const sha1 = require('sha1') // for hashing
const UserModel = require('../utils/db');
//const mongo = require('mongodb');
//const redis = require('../utils/redis');
//const dbClient = require('../utils/db');

class UsersController {
    static async createUser(req, res) {
        const { email, password } = req.body;

        // Check Email
        if (!email) {
            return res.status(400).json({ error: 'Missing email' });
        }
        // Check Password
        if (!password) {
            return res.status(400).json({ error: 'Missing password' });
        }

        // Check if email already exists in DB
        const existingUser = await UserModel.findOne({ email });
        if (existingUser) {
            return res.status(400).send({ error: 'Email already exists' });
        }

        // Hash the password using SHA1
        const hashedPassword = sha1(password);

        // Create a new user
        const newUser = await UserModel.insertOne({
            email,
            password: hashedPassword
        });

        // Save the new user to the database
        await newUser.save();

        // Respond with the new user's email and id
        return res.status(201).json({ email: newUser.email, id: newUser._id });

        } catch (error) {
            console.error('Error creating user:', error);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
}

module.exports = new UsersController();
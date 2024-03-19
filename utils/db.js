// MongoDB database 

// imports
import { MongoClient } from "mongodb";

// environment variables
const host = process.env.DB_HOST || "localhost";
const port = process.env.DB_PORT || "27017";
const database = process.env.DB_DATABASE || "files_manager";

// MongoDB client class
class DBClient {
  constructor() {
    this.dbUrl = `mongodb://${host}:${port}`;
    this.dbName = database;
    this.client = new MongoClient(this.dbUrl, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    this.client.connect((error) => {
      if (error) {
        console.error("Failed to connect to MongoDB", error);
        return;
      }
      console.log("Connected to MongoDB");
      this.db = this.client.db(this.dbName);
    });
  }

  // Checks for MongoDB Connection
  isAlive() {
    return (
      !!this.client &&
      !!this.client.topology &&
      this.client.topology.isConnected()
    );
  }

  // Gets user count
  async nbUsers() {
    if (this.db) {
      return this.db.collection("users").countDocuments();
    }
    throw new Error("DB is not initialized.");
  }

  // Gets file count
  async nbFiles() {
    if (this.db) {
      return this.db.collection("files").countDocuments();
    }
    throw new Error("DB is not initialized.");
  }

  // Finds User
  async findUser(filter) {
    try {
      const user = await this.db.collection("users").findOne(filter);
      return user;
    } catch (error) {
      console.error("Error finding user:", error);
      throw new Error("Failed to find user in database.");
    }
  }
}

// Exports dbClient
const dbClient = new DBClient();
export default dbClient;

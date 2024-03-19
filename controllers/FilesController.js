/**
 * Uploads a new file and saves metadata to the database.
 * Authenticates user based on provided token.
 * Validates required fields and input data.
 * Writes file data to local file system.
 * Inserts document into database with file metadata.
 * Returns saved document.
 */
const { v4: uuidv4 } = require('uuid');
const mongodb = require('mongodb');
const fsp = require('fs').promises;
const fs = require('fs');
const mime = require('mime-types');
const Mongo = require('../utils/db');
const Redis = require('../utils/redis');
const { fileQueue } = require('../worker');

/**
 * Gets the user ID from the authentication token by looking it up in Redis.
 *
 * @param {string} token - The authentication token
 * @returns {ObjectID} The user ID corresponding to the token
 * @throws {Error} If no user ID is found for the given token
 */
async function getUserIdFromToken(token) {
  const userIdString = await Redis.get(`auth_${token}`);
  if (!userIdString) {
    throw new Error("Unauthorized");
  }
  return new mongodb.ObjectID(userIdString);
}
/**
 * Validates the upload request and processes the file upload.
 *
 * Checks for required authentication token and validates it.
 * Validates required fields in request body.
 * Validates type is one of allowed values.
 * Writes file data to disk if provided.
 * Inserts document into DB with file metadata.
 * Returns saved document or error response.
 */

class FilesController {
  static async postUpload(req, res) {
    const token = req.header("X-Token");
    if (!token) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const userIdString = await Redis.get(`auth_${token}`);
    if (!userIdString) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const userId = new mongodb.ObjectID(userIdString);

    const { name, type, data, isPublic = false } = req.body;
    let { parentId = "0" } = req.body;

    if (!name) {
      return res.status(400).json({ error: "Missing name" });
    }
    if (!["folder", "file", "image"].includes(type)) {
      return res.status(400).json({ error: "Missing type" });
    }
    if (!data && type !== "folder") {
      return res.status(400).json({ error: "Missing data" });
    }

    /**
     * Validates the parentId parameter.
     * If parentId is '0', sets it to 0.
     * Otherwise ensures parentId is a valid ObjectId and the parent document exists and is a folder.
     * Throws 400 error responses for invalid parentIds.
     */
    if (parentId !== "0") {
      try {
        parentId = new mongodb.ObjectID(parentId);
      } catch (e) {
        return res.status(400).json({ error: "Parent not found" });
      }

      const parent = await Mongo.db
        .collection("files")
        .findOne({ _id: parentId, userId });
      if (!parent) {
        return res.status(400).json({ error: "Parent not found" });
      }
      if (parent.type !== "folder") {
        return res.status(400).json({ error: "Parent is not a folder" });
      }
    } else {
      parentId = 0;
    }

    const newFile = {
      userId,
      name,
      type,
      isPublic,
      parentId,
    };

        /**
     * Checks the file type and adds an image file to the file queue for processing if needed.
     * Then attempts to insert the new file document into the database.
     */

    if (type === "image") {
      const userIdString = await Redis.get(`auth_${token}`);
      await fileQueue.add({
        userId: userIdString,
        fileId: newFile.insertedId.toString(),
      });
    }

    try {
      if (type === "folder" || type === "file" || type === "image") {
                /**
         * Inserts a new file record into the database.
         *
         * If the file is a folder, inserts it directly.
         * If it is a file/image, writes the file data to disk and saves the path.
         *
         * Returns the inserted file record.
         */
        if (type === "folder") {
          const result = await Mongo.db.collection("files").insertOne(newFile);
          return res.status(201).json({
            id: result.insertedId.toString(),
            userId: userId.toString(),
            name,
            type,
            isPublic,
            parentId,
          });
        }
        if (type === "file" || type === "image") {
          const fileData = Buffer.from(data, "base64");
          const folderPath = process.env.FOLDER_PATH || "/tmp/files_manager";
          await fsp.mkdir(folderPath, { recursive: true });
          const filePath = `${folderPath}/${uuidv4()}`;
          await fsp.writeFile(filePath, fileData);
          newFile.localPath = filePath;
          const result = await Mongo.db.collection("files").insertOne(newFile);
          return res.status(201).json({
            id: result.insertedId.toString(),
            userId: userId.toString(),
            name,
            type,
            isPublic,
            parentId: parentId === 0 ? "0" : parentId.toString(),
            localPath: filePath,
          });
        }
      }
          /**
       * Handles errors from the file operations above.
       * If there is a server error, returns 500 status code.
       * If the file type is invalid, returns 400 status code.
       */
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Server error" });
    }
    return res.status(400).json({ error: "Wrong type" });
  }

    /**
   * Gets a file by its ID.
   *
   * @param {Object} req - The request object.
   * @param {Object} res - The response object.
   *
   * Checks for a valid auth token, gets the user ID from it.
   * Queries the database for the file with the given ID and user ID.
   * Returns the file if found, 404 error if not found.
   */
  static async getShow(req, res) {
    const fileId = req.params.id;
    const token = req.header("X-Token");

    if (!token) {
      return res.status(401).send({ error: "Unauthorized" });
    }

    try {
      const userId = await getUserIdFromToken(token);

      const file = await Mongo.db.collection("files").findOne({
        _id: new mongodb.ObjectID(fileId),
        userId,
      });

      if (!file) {
        return res.status(404).send({ error: "Not found" });
      }

            /**
       * Gets a file by ID.
       *
       * Checks for a valid auth token and user ID.
       * Queries the database for the file with the given ID and user ID.
       * Returns the file if found, 404 if not found, 401 if unauthorized, or 500 for any other errors.
       */
      return res.status(200).send(file);
    } catch (error) {
      console.error(error);
      if (error.message === "Unauthorized") {
        return res.status(401).send({ error: "Unauthorized" });
      }
      return res.status(500).send({ error: "Server error" });
    }
  }

  static async getIndex(req, res) {
    const token = req.header("X-Token");

    let userId;
    try {
      userId = await getUserIdFromToken(token);
    } catch (error) {
      console.error(error);
      return res.status(401).json({ error: "Unauthorized" });
      /**
       * Query the parentId and page query parameters.
       * parentId defaults to '0'.
       * page defaults to '0' and is parsed to an integer.
       * Multiply page by 20 to get the skip value for pagination.
       */
    }

    const { parentId = "0", page = "0" } = req.query;
    const skip = parseInt(page, 10) * 20;
    /**
     * Builds the query object for finding files based on the request parameters.
     * If a parentId is specified, adds a filter for that parentId.
     * Otherwise filters for files with parentId of '0' (root level files).
     */

    try {
      const matchQuery = { userId };
      if (parentId !== "0") {
        matchQuery.parentId = new mongodb.ObjectID(parentId);
      } else {
        matchQuery.parentId = "0";
      }

            /**
       * Queries the 'files' collection to find files matching the given criteria.
       * Applies skip and limit for pagination.
       */
      const files = await Mongo.db
        .collection("files")
        .aggregate([{ $match: matchQuery }, { $skip: skip }, { $limit: 20 }])
        .toArray();

            /**
       * Maps files query results to response format before sending to client.
       *
       * @param {Object[]} files - Query results of files from DB
       * @returns {Object[]} - Files mapped to response format
       */
      const responseFiles = files.map((file) => ({
        id: file._id,
        userId: file.userId,
        name: file.name,
        type: file.type,
        isPublic: file.isPublic,
        parentId: file.parentId,
      }));

      return res.status(200).send(responseFiles);
    } catch (error) {
      console.error(error);
      return res.status(500).send({ error: "Server error" });
    }
  }

  static async putPublish(req, res) {
    const fileId = req.params.id;
    const token = req.header("X-Token");

        /**
     * Publishes a file by ID by setting isPublic to true.
     *
     * Authenticates the request using the provided token.
     * Finds the file by ID and ensures it belongs to the user.
     * Updates the file, setting isPublic to true.
     * Returns the updated file on success, 404 if not found,
     * 401 if unauthorized, or 500 on any other error.
     */
    try {
      const userId = await getUserIdFromToken(token);

      const file = await Mongo.db
        .collection("files")
        .findOneAndUpdate(
          { _id: new mongodb.ObjectID(fileId), userId },
          { $set: { isPublic: true } },
          { returnOriginal: false }
        );

      if (!file.value) {
        return res.status(404).send({ error: "Not found" });
      }

      return res.status(200).send(file.value);
    } catch (error) {
      console.error(error);
      if (error.message === "Unauthorized") {
        return res.status(401).send({ error: "Unauthorized" });
      }
      return res.status(500).send({ error: "Server error" });
    }
  }

    /**
   * Unpublishes a file by setting isPublic to false.
   *
   * @param {Object} req - Express request object
   * @param {string} req.params.id - File ID
   * @param {string} req.header('X-Token') - Auth token
   * @param {Object} res - Express response object
   */
  static async putUnpublish(req, res) {
    const fileId = req.params.id;
    const token = req.header("X-Token");

    try {
      const userId = await getUserIdFromToken(token);

      const file = await Mongo.db
        .collection("files")
        .findOneAndUpdate(
          { _id: new mongodb.ObjectID(fileId), userId },
          { $set: { isPublic: false } },
          { returnOriginal: false }
        );

            /**
       * Handles error cases when updating a file's publish status.
       *
       * If file not found, returns 404.
       * If unauthorized, returns 401.
       * For any other errors, logs error and returns 500.
       */
      if (!file.value) {
        return res.status(404).send({ error: "Not found" });
      }

      return res.status(200).send(file.value);
    } catch (error) {
      console.error(error);
      if (error.message === "Unauthorized") {
        return res.status(401).send({ error: "Unauthorized" });
      }
      return res.status(500).send({ error: "Server error" });
    }
  }

    /**
   * Get a file by ID.
   *
   * Checks for auth token and gets user ID if present.
   * Returns 401 error if token is invalid.
   */
  static async getFile(req, res) {
    const fileId = req.params.id;
    const token = req.header("X-Token");
    let userId;

    if (token) {
      try {
        userId = await getUserIdFromToken(token);
      } catch (error) {
        return res.status(401).json({ error: "Unauthorized" });
      }
    }

        /**
     * Checks if file exists with given ID.
     * If user ID provided, checks file is public or belongs to user.
     * Validates size query param is allowed value.
     * Returns 404 if file not found or invalid size.
     */
    try {
      const query = { _id: new mongodb.ObjectID(fileId) };
      if (userId) {
        query.$or = [
          { isPublic: true },
          { userId: new mongodb.ObjectID(userId) },
        ];
      } else {
        query.isPublic = true;
      }

      const { size } = req.query;

      if (!["500", "250", "100"].includes(size)) {
        return res.status(404).json({ error: "Not found" });
      }
      /**
       * Gets a file from the database.
       *
       * Queries the 'files' collection by the file ID.
       * Returns 404 if no file found.
       */

      const file = await Mongo.db.collection("files").findOne(query);

      if (!file) {
        return res.status(404).send({ error: "Not found" });
      }
      /**
       * Checks if the file exists on disk and is not a folder before attempting
       * to serve it. Returns 404 if file doesn't exist, 400 if it is a folder.
       */

      if (file.type === "folder") {
        return res.status(400).send({ error: "A folder doesn't have content" });
      }

      if (!fs.existsSync(file.localPath)) {
        return res.status(404).send({ error: "Not found" });
      }

            /**
       * Streams the requested file to the response if found.
       * Sets the Content-Type header based on the file extension.
       * Handles any errors by logging to console and responding with 500.
       */
      res.type(mime.lookup(file.name) || "application/octet-stream");
      fs.createReadStream(file.localPath).pipe(res);
    } catch (error) {
      console.error(error);
      res.status(500).send({ error: "Server error" });
    }
  }
}

module.exports = FilesController;
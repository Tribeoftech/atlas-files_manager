/**
 * Defines API endpoint routes and maps them to controller methods.
 * Uses Express router to handle routing.
 */
const express = require('express');

/**
 * Imports controller modules and initializes Express router.
 * The imported controllers contain route handlers that will be mapped to API endpoints.
 */
const AppController = require("../controllers/AppController");
const AuthController = require("../controllers/AuthController");
const FilesController = require("../controllers/FilesController");
const UsersController = require("../controllers/UsersController");

const router = express.Router();

/**
 * GET /status - Get app status
 * GET /stats - Get app stats
 * GET /connect - Handle user connect
 * GET /disconnect - Handle user disconnect
 * GET /users/me - Get current user
 * GET /files/:id - Get file metadata
 * GET /files - List files
 * GET /files/:id/data - Get file contents
 */
router.get("/status", AppController.getStatus);
router.get("/stats", AppController.getStats);
router.get("/connect", AuthController.getConnect);
router.get("/disconnect", AuthController.getDisconnect);
router.get("/users/me", UsersController.getMe);
router.get("/files/:id", FilesController.getShow);
router.get("/files", FilesController.getIndex);
router.get("/files/:id/data", FilesController.getFile);

/**
 * Creates a new user record.
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */

/**
 * Uploads a new file and saves it.
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
router.post("/users", UsersController.postNew);
router.post("/files", FilesController.postUpload);

/**
 * PUT routes to publish and unpublish a file.
 * Publish makes a file publicly accessible.
 * Unpublish removes public access to a file.
 */
router.put("/files/:id/publish", FilesController.putPublish);
router.put("/files/:id/unpublish", FilesController.putUnpublish);

module.exports = router;

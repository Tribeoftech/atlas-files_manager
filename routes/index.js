
/**
 * Imports controllers to be registered as routes.
 */
import { Router } from "express";
import AppController from "../controllers/AppController";
import AuthController from "../controllers/AuthController";
import FilesController from "../controllers/FilesController";
import UsersController from "../controllers/UsersController";

/**
 * Creates a new router instance.
 */
const router = Router();


/**
 * GET /status - Get app status.
 * GET /stats - Get app stats.
 * GET /connect - Handle OAuth connect.
 * GET /disconnect - Handle OAuth disconnect.
 * GET /users/me - Get current user.
 * GET /files/:id - Get file info.
 * GET /files - List files.
 * GET /files/:id/data - Get file data.
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
 * POST /users - Create a new user.
 */

/**
 * POST /files - Upload a new file.
 */

router.post("/users", UsersController.postNew);
router.post("/files", FilesController.postUpload);

/**
 * PUT /files/:id/publish - Publish a file.
 *
 * PUT /files/:id/unpublish - Unpublish a file.
 */
router.put("/files/:id/publish", FilesController.putPublish);
router.put("/files/:id/unpublish", FilesController.putUnpublish);

module.exports = router;

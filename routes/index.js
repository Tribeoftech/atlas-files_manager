/**
 * Sets up routes and controllers for the Express app.
 * Imports router and controllers.
 * Defines router instance.
 * Sets up GET, POST, and PUT routes for status, stats, auth,
 * users, and files controllers.
 * Exports router.
 */
// Setting up routes
const { Router } = require('express');
import AppController from '../controllers/AppController';
import UsersController from '../controllers/UsersController';
import AuthController from '../controllers/AuthController';
import FilesController from '../controllers/FilesController';

const router = Router();

// Get Routes
router.get('/status', AppController.getStatus);
router.get('/stats', AppController.getStats);
router.get('/connect', AuthController.getConnect);
router.get('/disconnect', AuthController.getDisconnect);
router.get('/users/me', UsersController.getMe);
router.get('/files/:id', FilesController.getShow);
router.get('/files', FilesController.getIndex);
router.get('/files/:id/data', FilesController.getFile);

// Post Routes
router.post('/users', UsersController.createUser);
router.post('/files', FilesController.postUpload);

// Put Routes
router.put('/files/:id/publish', FilesController.putPublish);
router.put('/files/:id/unpublish', FilesController.putUnpublish);

module.exports = router;

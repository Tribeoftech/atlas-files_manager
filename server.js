/**
 * Imports modules for building an Express server.
 * Configures PORT from environment or default.
 * Creates Express app, configures JSON parsing middleware.
 * Attaches routing controller middleware.
 * Starts listening for connections on the configured PORT.
 */
import express from "express";
import { env } from "process";
import routingController from "./routes/index";

const PORT = env.PORT || 5000;

const app = express();

app.use(express.json());
routingController(app);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

/**
 * Sets up an Express server instance with JSON body parsing middleware and the
 * application routes. Exports the Express app instance.
 */
// Setting up the Express Server

import express from "express";
import routes from "./routes/index";

const app = express();
const port = process.env.PORT || 5000;

/**
 * Sets up middleware and routes in the Express app instance.
 *
 * Uses express.json() middleware to parse JSON request bodies.
 * Registers the routes defined in ./routes/index.js.
 * Starts listening on the defined port.
 * Exports the app instance.
 */
app.use(express.json());
app.use(routes);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

module.exports = app;

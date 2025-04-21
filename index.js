
import path from 'path';
import { fileURLToPath } from 'url';
import "dotenv/config.js"; // Load environment variables from .env file

// Resolve __dirname in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);



global.__basedir = __dirname;

import * as routes from "./routes/index.js";

async function init() {
  try {
    await routes.init();
  } catch (error) {
    console.error(`Failed to start the server, error: ${error}`);
  }
}

init();

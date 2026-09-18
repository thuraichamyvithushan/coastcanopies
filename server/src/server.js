import { env } from "./config/env.js";
import { connectDatabase } from "./config/db.js";
import { autoSeed } from "./seed/seedDatabase.js";
import { app } from "./app.js";

const start = async () => {
  await connectDatabase();
  await autoSeed();
  app.listen(env.port, () => {
    console.log(`Coast Canopies API listening on port ${env.port}`);
  });
};

start().catch((error) => {
  console.error("Failed to start server", error);
  process.exit(1);
});

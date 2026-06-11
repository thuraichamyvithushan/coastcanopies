import { app } from "../server/src/app.js";
import { connectDatabase } from "../server/src/config/db.js";

let databaseConnectionPromise;

const ensureDatabaseConnection = async () => {
  if (!databaseConnectionPromise) {
    databaseConnectionPromise = connectDatabase().catch((error) => {
      databaseConnectionPromise = undefined;
      throw error;
    });
  }

  await databaseConnectionPromise;
};

export default async function handler(req, res) {
  await ensureDatabaseConnection();
  return app(req, res);
}

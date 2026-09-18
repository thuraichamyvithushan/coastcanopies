import { env } from "../config/env.js";
import { connectDatabase } from "../config/db.js";
import { Admin } from "../models/Admin.js";

import { pathToFileURL } from "node:url";

export const autoSeed = async ({ syncPassword = false } = {}) => {
  let admin = await Admin.findOne({ email: env.adminEmail.toLowerCase() });

  if (!admin) {
    admin = new Admin({
      email: env.adminEmail.toLowerCase(),
      password: env.adminPassword,
      role: "admin"
    });
    await admin.save();
    console.log(`Created default admin account: ${env.adminEmail}`);
  } else if (syncPassword && !(await admin.comparePassword(env.adminPassword))) {
    admin.password = env.adminPassword;
    await admin.save();
    console.log(`Updated admin password for: ${env.adminEmail}`);
  }

  console.log("Admin seed completed successfully");
};

const runStandaloneSeed = async () => {
  await connectDatabase();
  await autoSeed({ syncPassword: true });
  process.exit(0);
};

const isDirectRun = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isDirectRun) {
  runStandaloneSeed().catch((error) => {
    console.error("Seed failed", error);
    process.exit(1);
  });
}

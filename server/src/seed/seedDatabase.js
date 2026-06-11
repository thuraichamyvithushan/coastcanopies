import { env } from "../config/env.js";
import { connectDatabase } from "../config/db.js";
import { defaultProducts } from "../data/defaultProducts.js";
import { defaultVehicles } from "../data/defaultVehicles.js";
import { Admin } from "../models/Admin.js";
import { Product } from "../models/Product.js";
import { Vehicle } from "../models/Vehicle.js";

const seed = async () => {
  await connectDatabase();

  let admin = await Admin.findOne({ email: env.adminEmail.toLowerCase() });

  if (!admin) {
    admin = new Admin({
      email: env.adminEmail.toLowerCase(),
      password: env.adminPassword,
      role: "admin"
    });
    await admin.save();
  } else if (!(await admin.comparePassword(env.adminPassword))) {
    admin.password = env.adminPassword;
    await admin.save();
  }

  await Promise.all(
    defaultVehicles.map((vehicle) =>
      Vehicle.findOneAndUpdate({ slug: vehicle.slug }, vehicle, {
        upsert: true,
        new: true,
        runValidators: true
      })
    )
  );

  await Promise.all(
    defaultProducts.map((product) =>
      Product.findOneAndUpdate({ slug: product.slug }, product, {
        upsert: true,
        new: true,
        runValidators: true
      })
    )
  );

  console.log("Database seeded successfully");
  process.exit(0);
};

seed().catch((error) => {
  console.error("Seed failed", error);
  process.exit(1);
});

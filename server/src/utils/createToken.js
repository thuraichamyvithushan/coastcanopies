import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export const createToken = (adminId) =>
  jwt.sign({ sub: adminId, role: "admin" }, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn
  });

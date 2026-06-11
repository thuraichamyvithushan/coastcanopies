import dotenv from "dotenv";

dotenv.config();

const required = ["MONGODB_URI", "JWT_SECRET"];
const defaultClientUrls = ["http://localhost:5173", "https://coastcanopies.vercel.app"];
export const getMissingRequiredEnv = () => required.filter((key) => !process.env[key]);

export const env = {
  port: Number(process.env.PORT || 5000),
  mongoUri: process.env.MONGODB_URI,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
  adminEmail: process.env.ADMIN_EMAIL || "admin@coastcanopies.com",
  adminPassword: process.env.ADMIN_PASSWORD || "ChangeMe123!",
  smtpHost: process.env.SMTP_HOST,
  smtpPort: Number(process.env.SMTP_PORT || 587),
  smtpSecure: process.env.SMTP_SECURE === "true",
  smtpUser: process.env.SMTP_USER,
  smtpPass: process.env.SMTP_PASS,
  quoteToEmail: process.env.QUOTE_TO_EMAIL || "admin@coastcanopies.com",
  clientUrl: process.env.CLIENT_URL || defaultClientUrls[0],
  clientUrls: Array.from(
    new Set(
      [
        ...defaultClientUrls,
        ...String(process.env.CLIENT_URL || "")
          .split(",")
          .map((value) => value.trim())
          .filter(Boolean)
      ]
    )
  )
};

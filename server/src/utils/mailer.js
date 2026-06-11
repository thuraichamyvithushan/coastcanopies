import nodemailer from "nodemailer";
import { env } from "../config/env.js";

let transporter;

const buildTransporter = () => {
  if (!env.smtpHost || !env.smtpUser || !env.smtpPass) {
    return null;
  }

  return nodemailer.createTransport({
    host: env.smtpHost,
    port: env.smtpPort,
    secure: env.smtpSecure,
    auth: {
      user: env.smtpUser,
      pass: env.smtpPass
    }
  });
};

export const sendQuoteNotification = async (quote) => {
  if (!transporter) {
    transporter = buildTransporter();
  }

  if (!transporter) {
    return false;
  }

  await transporter.sendMail({
    from: env.smtpUser,
    to: env.quoteToEmail,
    subject: `New Coast Canopies Quote - ${quote.customerInfo.name}`,
    text: [
      `Customer: ${quote.customerInfo.name}`,
      `Email: ${quote.customerInfo.email}`,
      `Phone: ${quote.customerInfo.phone}`,
      `Vehicle: ${quote.vehicle.name}`,
      `Base System: ${quote.baseSystem.name}`,
      `Total: $${quote.totalPrice.toLocaleString()}`,
      `Notes: ${quote.customerInfo.notes || "None"}`
    ].join("\n")
  });

  return true;
};

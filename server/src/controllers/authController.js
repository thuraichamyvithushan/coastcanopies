import { Admin } from "../models/Admin.js";
import { createToken } from "../utils/createToken.js";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const loginAdmin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError(400, "Email and password are required");
  }

  const admin = await Admin.findOne({ email: email.toLowerCase().trim() });

  if (!admin || !(await admin.comparePassword(password))) {
    throw new ApiError(401, "Invalid credentials");
  }

  res.json({
    token: createToken(admin._id),
    admin: {
      id: admin._id,
      email: admin.email,
      role: admin.role
    }
  });
});

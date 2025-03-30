import jwt from "jsonwebtoken";
import { EC_Staff } from "../models/EC_Staff.js";
import { EC_Volunteer } from "../models/EC_Volunteer.js";
import { formatResponse } from "../utils/formatApiResponse.js";

export const authenticateUser = async (req, res, next) => {
  try {
    // Extract token from cookie
    console.log("cookie = ", req.cookies);
    const token = req.cookies?.auth_token;
    console.log(token);
    if (!token) {
      return res
        .status(401)
        .json({ success: false, message: "Access denied. No token provided." });
    }

    // Verify JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { id, role } = decoded;

    let user = null;

    // Check role and find user in corresponding table
    if (role === "staff") {
      user = await EC_Staff.findOne({ where: { id } });
    } else if (role === "volunteer") {
      user = await EC_Volunteer.findOne({ where: { id } });
    } else {
      return res.status(403).json({ success: false, message: "Invalid role" });
    }

    // If user not found, reject authentication
    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "Unauthorized. User not found." });
    }

    // Attach user info to request
    req.verifier = { id: user.id, role };

    next(); // Continue to the next middleware/route handler
  } catch (err) {
    console.error("JWT Authentication Error:", err);
    return res
      .status(401)
      .json({ success: false, message: "Invalid or expired token" });
  }
};

export const verifierIsStaff = async (req, res, next) => {
  if (req.verifier.role != "staff") {
    return res
      .status(403)
      .json(formatResponse(false, null, 403, "Unauthorized request"));
  }
  console.log("just passing...")
  next()
};

export const verifierIsVolunteer = async (req, res, next) => {
  if (req.verifier.role != "volunteer") {
    return res
      .status(403)
      .json(formatResponse(false, null, 403, "Unauthorized request"));
  }

  next()
};
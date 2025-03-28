import { EC_Staff } from "../models/EC_Staff.js";
import { EC_Volunteer } from "../models/EC_Volunteer.js";
import { encryptData, decryptData, encryptBiometric } from "../utils/crypto.utils.js";
import { formatResponse } from "../utils/formatApiResponse.js";
import crypto from "crypto";
import jwt from "jsonwebtoken"

// take admin biometrics
export const handleEcStaffRegistration = async (req, res) => {
  const { id, name, password, biometric, contact } = req.body; // add contact
  try {
    const staffExist = await EC_Staff.findOne({
      where: {
        id: id,
      },
    });

    if (staffExist) {
      return res
        .status(409)
        .json(formatResponse(false, null, 409, "Staff already exists"));
    }

    const encryptedRightThumb = encryptBiometric(biometric.right);
    const encryptedLeftThumb = encryptBiometric(biometric.left);
    const hashedPassword = crypto
      .createHash("sha256")
      .update(password)
      .digest("hex");

    const staff = await EC_Staff.create({
      id: id,
      name: name,
      password: hashedPassword,
      biometric_right: encryptedRightThumb,
      biometric_left: encryptedLeftThumb,
      contact: contact,
    });

    const staffs = await EC_Staff.findAll(); // dont send password
    console.log(staffs);

    return res
      .status(201)
      .json(
        formatResponse(
          true,
          {
            message: "Staff created successfully",
            staff: {
              id: staff.id,
              name: staff.name,
              verifiedByStaff: staff.verifiedByStaff,
              biometric_right: staff.biometric_right,
              biometric_left: staff.biometric_left,
            }
          },
          null,
          null
        )
      );
  } catch (err) {
    console.error("Error during EC Staff registration:", err);
    return res
      .status(500)
      .json(
        formatResponse(false, null, 500, err.message || "Internal Server Error")
      );
  }
};

export const handleEcVolunteerRegistration = async (req, res) => {
  const { id, name, contact, biometric, verifiedByStaff, password } = req.body;

  try {
    // Check if volunteer already exists
    const volunteerExist = await EC_Volunteer.findOne({ where: { id } });

    if (volunteerExist) {
      return res
        .status(409)
        .json(formatResponse(false, null, 409, "Volunteer already exists"));
    }

    // Encrypt the volunteer's biometric data
    const encryptedRightThumb = encryptBiometric(biometric.right);
    const encryptedLeftThumb = encryptBiometric(biometric.left);

    // Verify the staff providing verification
    const staffProvided = await EC_Staff.findOne({
      where: { id: verifiedByStaff },
    });

    if (!staffProvided) {
      return res
        .status(404)
        .json(
          formatResponse(false, null, 404, "Staff not found for verification.")
        );
    }

    // Hash the password with salt using SHA-256
    const hashedPassword = crypto
      .createHash("sha256")
      .update(password)
      .digest("hex");

    // Create a new volunteer
    const volunteer = await EC_Volunteer.create({
      id,
      name,
      contact,
      password: `${hashedPassword}`, // Store salt and hash together
      biometric_right: encryptedRightThumb,
      biometric_left: encryptedLeftThumb,
      verifiedByStaff: verifiedByStaff,
    });

    return res
      .status(201)
      .json(
        formatResponse(
          true,
          {
            message: "Volunteer created successfully",
            volunteer: {
              id: volunteer.id,
              name: volunteer.name,
              contact: volunteer.contact,
              verifiedByStaff: volunteer.verifiedByStaff,
              biometric_right: volunteer.biometric_right,
              biometric_left: volunteer.biometric_left,
            }
          },
          null,
          null
        )
      );
  } catch (err) {
    console.error("Error during EC Volunteer registration:", err);
    return res
      .status(500)
      .json(
        formatResponse(false, null, 500, err.message || "Internal Server Error")
      );
  }
};

export const handleEcStaffLogin = async (req, res) => {
  const { id, password } = req.body;
  
  try {
    // Check if staff exists
    const staff = await EC_Staff.findOne({ where: { id } });

    if (!staff) {
      return res
        .status(404)
        .json(formatResponse(false, null, 404, "Staff not found"));
    }

    // Hash the provided password using SHA-256 (since no salt is used)
    const hashedPassword = crypto
      .createHash("sha256")
      .update(password)
      .digest("hex");

    // Compare stored password hash
    if (hashedPassword !== staff.password) {
      return res
        .status(401)
        .json(formatResponse(false, null, 401, "Invalid credentials"));
    }

    // Generate JWT
    const token = jwt.sign(
      { id: staff.id, role: "staff" },
      process.env.JWT_SECRET,
      {
        expiresIn: "12h",
      }
    );

    // Store JWT in an HTTP-only cookie
    res.cookie("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Secure only in production
      sameSite: "Strict",
      maxAge: 12 * 60 * 60 * 1000, // 12 hours
    });

    return res.status(200).json(
      formatResponse(
        true,
        {
          message: "Login successful",
          token,
          biometric_left: staff.biometric_left,
          biometric_right: staff.biometric_right,
        },
        null,
        null
      )
    );
  } catch (err) {
    console.error("Error during EC Staff login:", err);
    return res
      .status(500)
      .json(
        formatResponse(false, null, 500, err.message || "Internal Server Error")
      );
  }
};

export const handleEcVolunteerLogin = async (req, res) => {
  const { id, password } = req.body;

  try {
    // Check if staff exists
    const volunteer = await EC_Volunteer.findOne({ where: { id } });

    if (!volunteer) {
      return res
        .status(404)
        .json(formatResponse(false, null, 404, "Staff not found"));
    }

    // Hash the provided password using SHA-256 (since no salt is used)
    const hashedPassword = crypto
      .createHash("sha256")
      .update(password)
      .digest("hex");

    // Compare stored password hash
    if (hashedPassword !== volunteer.password) {
      return res
        .status(401)
        .json(formatResponse(false, null, 401, "Invalid credentials"));
    }

    // Generate JWT
    const token = jwt.sign(
      { id: volunteer.id, role: "volunteer" },
      process.env.JWT_SECRET,
      {
        expiresIn: "12h",
      }
    );

    // Store JWT in an HTTP-only cookie
    res.cookie("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Secure only in production
      sameSite: "None",
      maxAge: 12 * 60 * 60 * 1000, // 12 hours
    });

    return res.status(200).json(
      formatResponse(
        true,
        {
          message: "Login successful",
          token,
          biometric_left: volunteer.biometric_left,
          biometric_right: volunteer.biometric_right,
        },
        null,
        null
      )
    );
  } catch (err) {
    console.error("Error during EC Volunteer login:", err);
    return res
      .status(500)
      .json(
        formatResponse(false, null, 500, err.message || "Internal Server Error")
      );
  }
};

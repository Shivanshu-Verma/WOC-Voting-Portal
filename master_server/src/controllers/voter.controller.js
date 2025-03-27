import { Voter } from "../models/Voter.js";
import { EC_Staff } from "../models/EC_Staff.js";
import { EC_Volunteer } from "../models/EC_Volunteer.js";
import { encryptData, decryptData } from "../utils/crypto.utils.js";
import { formatResponse } from "../utils/formatApiResponse.js";
import { POSITIONS } from "../constants/positions.js";

export const handleVoterRegistration = async (req, res) => {
  const { voterId, name, biometric, verifiedByVolunteer } = req.body;

  if (!voterId || !name || !biometric || !verifiedByVolunteer) {
    return res
      .status(400)
      .json(formatResponse(false, null, 400, "Missing required fields."));
  }

  try {
    const encryptedRightThumb = encryptData(biometric.right);
    const encryptedLeftThumb = encryptData(biometric.left);

    // Verify EC Volunteer biometric
    const volunteerProvided = await EC_Volunteer.findOne({
      where: {
        id: verifiedByVolunteer,
      },
    });

    if (!volunteerProvided)
      return res
        .status(404)
        .json(formatResponse(false, null, 404, "Volunteer not found"));

    // Register voter
    const voter = await Voter.create({
      voterId,
      name,
      biometric_right: encryptedRightThumb,
      biometric_left: encryptedLeftThumb,
      verifiedByVolunteer: verifiedByVolunteer,
      imageUrl: req.file?.path,
    });

    return res
      .status(201)
      .json(
        formatResponse(
          true,
          { message: "Voter registered successfully", voter },
          null,
          null
        )
      );
  } catch (err) {
    console.error("Error during voter registration:", err);
    return res
      .status(500)
      .json(formatResponse(false, null, 500, "Internal Server Error"));
  }
};

export const getVoterById = async (req, res) => {
  const { id } = req.params; // Extract voter ID from request params

  try {
    console.log("id = ", id);
    // Check if voter exists
    const voter = await Voter.findOne({ where: { voterId: id } });

    console.log(voter);

    if (!voter) {
      return res
        .status(200)
        .json(formatResponse(true, { message: "New User" }, null, null));
    }

    // If voter exists, return their details
    return res.status(200).json(
      formatResponse(
        true,
        {
          message: "Old User",
          voter: {
            id: voter.id,
            name: voter.name,
            biometric_left: voter.biometric_left,
            biometric_right: voter.biometric_right,
            imageUrl: voter.imageUrl,
            allowedPositions: voter.allowedPositions,
          },
        },
        null,
        null
      )
    );
  } catch (err) {
    console.error("Error fetching voter by ID:", err);
    return res
      .status(500)
      .json(
        formatResponse(false, null, 500, err.message || "Internal Server Error")
      );
  }
};

export const verifyVoter = async (req, res) => {
  const { id, verifiedByStaff } = req.body;

  try {
    const voter = await Voter.findOne({ where: { voterId: id } });

    const staffExist = await EC_Staff.findOne({ where: { id: verifiedByStaff } });

    if (!staffExist) {
      res.status(404).json(formatResponse(false, null, 404, "Staff Not Found"));
    }
    voter.verifiedByStaff = verifiedByStaff;

    await voter.save();

    return res
      .status(200)
      .json(
        formatResponse(
          true,
          { message: "Voter verified successfully", voter },
          null,
          null
        )
      );
  } catch (error) {
    console.error("Error verifying voter:", error);
    return res
      .status(500)
      .json(
        formatResponse(
          false,
          null,
          500,
          error.message || "Internal Server Error"
        )
      );
  }
};

export const addPositions = async (req, res) => {
    try {
        const { id } = req.params;
        const { positions } = req.body;

        // Validate positions
        const invalidPositions = positions.filter(pos => !Object.values(POSITIONS).includes(pos));
        if (invalidPositions.length > 0) {
            return res.status(400).json({ message: `Invalid positions: ${invalidPositions.join(", ")}` });
        }

        // Find voter
        const voter = await Voter.findOne({ where: { voterId: id } });
        if (!voter) {
            return res.status(404).json({ message: "Voter not found" });
        }

        // Add new positions to allowedPositions (avoiding duplicates)
        const updatedPositions = Array.from(new Set([...voter.allowedPositions, ...positions]));
        await voter.update({ allowedPositions: updatedPositions });

        return res.status(200).json({ message: "Positions added successfully", allowedPositions: updatedPositions });
    } catch (error) {
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
};
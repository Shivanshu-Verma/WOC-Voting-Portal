/**
 * @params
 * id, name, contact, position, verifiedByStudent, verifiedByStaff
 */

import { POSITIONS } from "../constants/positions.js";
import { Candidate } from "../models/Candidate.js";
import { EC_Staff } from "../models/EC_Staff.js";
import { EC_Volunteer } from "../models/EC_Volunteer.js";
import { decryptData, encryptData } from "../utils/crypto.utils.js";
import { formatResponse } from "../utils/formatApiResponse.js";

export const handleCandidateRegistration = async (req, res) => {
  const { id, name, contact, position, biometric, verifiedByVolunteer } =
    req.body;

  try {
    const encryptedRightThumb = encryptData(biometric.right);
    const encryptedLeftThumb = encryptData(biometric.left);

    const candidateExists = await Candidate.findOne({
      where: {
        id: id,
      },
    });

    if (candidateExists) {
      return res
        .status(409)
        .json(formatResponse(false, null, 409, "Candidate already registered"));
    }

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

    if (!Object.values(POSITIONS).includes(position)) {
      return res
        .status(400)
        .json(formatResponse(false, null, 400, "Invalid position selected."));
    }

    const candidate = await Candidate.create({
      id: id,
      name: name,
      contact: contact,
      position: position,
      biometric_right: encryptedRightThumb,
      biometric_left: encryptedLeftThumb,
      verfiedByVolunteer: verifiedByVolunteer,
    });

    return res
      .status(201)
      .json(
        formatResponse(
          true,
          { message: "Candidate registered successfully", candidate },
          null,
          null
        )
      );
  } catch (err) {
    console.error("Error during candidate registration:", err);
    return res
      .status(500)
      .json(
        formatResponse(false, null, 500, err.message || "Internal Server Error")
      );
  }
};

export const verifyCandidate = async (req, res) => {
  const { id, verifiedByStaff } = req.body;

  try {
    const candidate = await Candidate.findOne({ where: { id } });

    const staffExist = await EC_Staff({ where: { id: verifiedByStaff } });

    if (!staffExist) {
      res.status(404).json(formatResponse(false, null, 404, "Staff Not Found"));
    }

    candidate.verifiedByStaff = verifiedByStaff;

    await candidate.save();

    return res
      .status(200)
      .json(
        formatResponse(
          true,
          { message: "Candidate verified successfully", voter },
          null,
          null
        )
      );
  } catch (error) {
    console.error("Error verifying candidate:", error);
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

/**
 * Basis:
 * whenever new candidate registers, he will have id++.
 * After registerations end say there are 4 candidates for a given pos, the "basis" will be
 * 0 0 0 1 for candidate with id 1
 * 0 0 1 0 for id 2
 * 0 1 0 0 for id 3
 * 1 0 0 0 for id 4
 * We may change the corresponding basis to id maps
 * After registeration process is complete, the "calculateBasis" function is called [make function in imdex.js]
 *
 */

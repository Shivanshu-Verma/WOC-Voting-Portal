/**
 * @params
 * id, name, contact, position, verifiedByStudent, verifiedByStaff
 */

import { POSITIONS } from "../constants/positions.js";
import { Candidate } from "../models/Candidate.js";
import { EC_Staff } from "../models/EC_Staff.js";
import { EC_Volunteer } from "../models/EC_Volunteer.js";
import { decryptData, encryptData, encryptBiometric } from "../utils/crypto.utils.js";
import { formatResponse } from "../utils/formatApiResponse.js";

export const handleCandidateRegistration = async (req, res) => {
  const { id, name, contact, position, verifiedByVolunteer } =
    req.body;

  try {

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
      verfiedByVolunteer: verifiedByVolunteer,
      imageUrl: req.file?.path,
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

import { Op } from "sequelize";

export const verifyCandidate = async (req, res) => {
  const { id } = req.params;

  // Ensure req.verifier exists
  if (!req.verifier || !req.verifier.id) {
    return res.status(403).json(formatResponse(false, null, 403, "Unauthorized request"));
  }

  const verifiedByStaff = req.verifier.id;

  try {
    const candidate = await Candidate.findOne({ where: { id } });

    if (!candidate) {
      return res.status(404).json(formatResponse(false, null, 404, "Candidate Not Found"));
    }
    if(candidate.verifiedByStaff != null){
      return res.status(200).json(formatResponse(true, null, 200, "Candidate already verified"));
    }
    const staffExist = await EC_Staff.findOne({ where: { id: verifiedByStaff } });

    if (!staffExist) {
      return res.status(404).json(formatResponse(false, null, 404, "Staff Not Found"));
    }

    const position = candidate.position;

    // Count real candidates (excluding NOTA)
    const realCandidatesCount = await Candidate.count({
      where: {
        position,
        name: { [Op.ne]: "NOTA" },
        verifiedByStaff: { [Op.ne]: null }, // Only count verified candidates
      },
    });

    if (realCandidatesCount === 0) {
      // If this is the first real candidate, give them basis = 1 first
      console.log("first");
      
      candidate.basis = "1";
      candidate.verifiedByStaff = verifiedByStaff;
      await candidate.save();

      // Then create NOTA
      await Candidate.create({
        id: `NOTA_${position}`,
        name: "NOTA",
        basis: "2",
        position,
      });

      return res.status(200).json(
        formatResponse(
          true,
          { message: "Candidate verified successfully (First candidate, NOTA added)", candidate },
          null,
          null
        )
      );
    }

    if (realCandidatesCount === 1) {
      // If this is the second real candidate, remove NOTA first
      await Candidate.destroy({ where: { position, name: `NOTA` } });

      // Assign basis to the new candidate
      candidate.basis = "2";
      candidate.verifiedByStaff = verifiedByStaff;
      await candidate.save();

      return res.status(200).json(
        formatResponse(
          true,
          { message: "Candidate verified successfully (Second candidate, NOTA removed)", candidate },
          null,
          null
        )
      );
    }

    // For other candidates, continue assigning basis normally
    // FIXED: Ensure we have a valid basis value
    let maxBasis = await Candidate.max("basis", { where: { position } });
    
    // Handle potential null or non-numeric values
    let numMaxBasis = 0;
    if (maxBasis !== null && maxBasis !== undefined) {
      const parsed = parseInt(maxBasis, 10);
      if (!isNaN(parsed)) {
        numMaxBasis = parsed;
      }
    }
    
    const newBasis = String(numMaxBasis + 1);

    // Double-check we're not assigning null or undefined
    if (!newBasis || newBasis === "NaN" || newBasis === "undefined") {
      candidate.basis = "1"; // Fallback to "1" if something went wrong
    } else {
      candidate.basis = newBasis;
    }

    candidate.verifiedByStaff = verifiedByStaff;
    await candidate.save();
    await Candidate.destroy({ where: { position, name: `NOTA` } });
    return res.status(200).json(
      formatResponse(
        true,
        { message: "Candidate verified successfully", candidate },
        null,
        null
      )
    );
  } catch (error) {
    console.error("Error verifying candidate:", error);
    return res
      .status(500)
      .json(
        formatResponse(false, null, 500, error.message || "Internal Server Error")
      );
  }
};
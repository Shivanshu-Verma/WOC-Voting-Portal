import { Voter } from "../models/Voter.js";
import { Commitment } from "../models/Commitments.js";
import { decryptData, encryptForEVM } from "../utils/crypto.utils.js";
import { fetchCandidateInfo } from "../utils/candidate.utils.js";
import { formatResponse } from "../utils/formatApiResponse.js";
import jwt from "jsonwebtoken";

export const handleVoterSession = async (req, res) => {
  try {
    const { voterId } = req.params; 

    console.log("Voter ID = ", voterId);
    const voter = await Voter.findOne({ where: { voterId } });
    if (!voter) {
      return res
        .status(404)
        .json(formatResponse(false, null, 404, "Voter not found."));
    }
    console.log("voter =", voter.voterId);
    if (!voter.verifiedByVolunteer || !voter.verifiedByStaff) {
      return res
        .status(403)
        .json(
          formatResponse(false, null, 403, "Voter has not been fully verified.")
        );
    }

    // Check if the voter has already voted
    if (voter.hasVoted) {
      return res
        .status(403)
        .json(formatResponse(false, null, 403, "Voter has already voted."));
    }

    // Generate session token
    const sessionToken = jwt.sign({ voterId }, process.env.JWT_SECRET, {
      expiresIn: "5m",
    }); // change to one minute
    const candidateInformation = await fetchCandidateInfo(voter);

    console.log("sending token");

    // Store session token in a secure cookie
    res.cookie("sessionToken", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
      maxAge: 7500000, // 1 minute
    });

    console.log("sent token");

    return res.status(200).json(
      formatResponse(
        true,
        {
          message: "Session established.",
          sessionToken: sessionToken, // for now only [testing, postman]
          voter: {
            id: voter.id,
            name: voter.name,
            biometric_left: voter.biometric_left,
            biometric_right: voter.biometric_right,
            imageUrl: voter.imageUrl,
          },
          candidateInformation
        },
        null,
        null
      )
    );
  } catch (error) {
    console.error("Error during voter login:", error);
    return res
      .status(500)
      .json(formatResponse(false, null, 500, "Internal Server Error"));
  }
};

export const handleCastVote = async (req, res) => {
  try {
    const { voterId } = req; // Retrieved from middleware
    const { commitments } = req.body; // req.decryptedData

    const voter = await Voter.findOne({ where: { voterId } });
    if (!voter) {
      return res
        .status(404)
        .json(formatResponse(false, null, 404, "Voter not found."));
    }

    if (voter.hasVoted) {
      return res
        .status(403)
        .json(
          formatResponse(false, null, 403, "Voter has already cast their vote.")
        );
    }

    // Store commitments
    for (const commitment of commitments) {
      const newCommit = await Commitment.create({
        position: commitment.position,
        evm: req.evm.id,
        commitment: commitment.commitment,
      });

      /**
       * [
       * {
       * position: "position",
       * commitment: "10, 26, 98"
       * }]
       */

      console.log("New Commitment Created = ", newCommit);
    }

    // Mark voter as voted
    await voter.update({ hasVoted: true });

    return res
      .status(200)
      .json(
        formatResponse(true, { message: "Vote cast successfully." }, null, null)
      );
  } catch (error) {
    console.error("Error during vote casting:", error);
    return res
      .status(500)
      .json(formatResponse(false, null, 500, "Internal Server Error"));
  }
};

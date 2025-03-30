import { Voter } from "../models/Voter.js";
import { Commitment } from "../models/Commitments.js";
import { decryptData, encryptForEVM } from "../utils/crypto.utils.js";
import { fetchCandidateInfo } from "../utils/candidate.utils.js";
import { formatResponse } from "../utils/formatApiResponse.js";
import jwt from "jsonwebtoken";
import { EVM } from "../models/EVM.js";

export const handleVoterSession = async (req, res) => {
  try {
    const { id } = req.params;

    console.log("Voter ID = ", id);
    const voter = await Voter.findOne({ where: { voterId: id } });
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
    const sessionToken = jwt.sign({ id }, process.env.JWT_SECRET, {
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
            id: voter.voterId,
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
    const voterId = req.voterId; // Retrieved from middleware
    const { commitments } = req.body; // req.decryptedData

    // Find the voter
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

    // Find the EVM
    const evm = await EVM.findOne({ where: { id: req.evm.id } });
    if (!evm) {
      return res
        .status(404)
        .json(formatResponse(false, null, 404, "EVM not found."));
    }

    // Store commitments
    for (const commitment of commitments) {
      const newCommit = await Commitment.create({
        position: commitment.position,
        evm: evm.id,
        commitment: String(commitment.commitment),
        voter: voterId,
      });

      /**
       * [
       *  {
       *    position: "position",
       *    commitment: "10, 26, 98"
       *  } 
       * ]
       */
      console.log("New Commitment Created... ");
    }

    // Add the voter to the EVM's buffer
    const currentBuffer = evm.buffer || []; // Retrieve the current buffer (default to an empty array if null)
    currentBuffer.push({
      voter: voterId,
      votedAt: new Date().toISOString(), // Use ISO string format for timestamps
    });

    // Update the EVM with the new buffer
    await EVM.update({ buffer: currentBuffer }, { where: { id: evm.id } });
    console.log("buffers updating...");
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


export const checkpointEVM = async (req, res) => {
  try {
    console.log("checkpointing called...");
    const evmId = "1ab63c1a-2cb9-4a87-b719-592b601447dd"; // EVM ID from the route parameter
    const { randomVector, clientCurrentTS } = req.body;
    const currentTimestamp = new Date();

    console.log("server TS = ", currentTimestamp)
    console.log("client TS = ", new Date(clientCurrentTS));

    if (new Date(clientCurrentTS) > currentTimestamp) {
      return res
        .status(400)
        .json(
          formatResponse(false, null, 400, "Client timestamp cannot be in the future.")
        );
    }
    console.log("req.body = ", req.body);
    // Validate randomVector schema
    if (
      !Array.isArray(randomVector) ||
      randomVector.some(
        (entry) =>
          typeof entry !== "object" ||
          !entry.position ||
          !entry.randomVector
      )
    ) {
      return res
        .status(400)
        .json(
          formatResponse(
            false,
            null,
            400,
            "Invalid randomVector format. Each entry must have 'position' and 'randomVector'."
          )
        );
    }

    // Fetch EVM
    const evm = await EVM.findByPk(evmId);
    if (!evm) {
      return res
        .status(404)
        .json(formatResponse(false, null, 404, "EVM not found."));
    }

    // Check buffer size
    // if (evm.buffer.length < 3) {
    //   return res
    //     .status(429)
    //     .json(
    //       formatResponse(
    //         false,
    //         null,
    //         429,
    //         "Buffer has less than 10 entries. Please wait before checkpointing."
    //       )
    //     );
    // }

    // Filter buffer to remove entries older than the current timestamp
    const filteredBuffer = evm.buffer.filter(
      (entry) => new Date(entry.votedAt) >= new Date(clientCurrentTS)
    );

    // Update the EVM buffer
    await EVM.update({ buffer: filteredBuffer }, { where: { id: evm.id } });

    evm.randomVector = randomVector.map(entry => ({
      position: entry.position,
      randomVector: JSON.stringify(entry.randomVector) // Ensures valid storage
    }));


    // Save updates
    await evm.save();

    console.log("evm = ", evm);

    return res
      .status(200)
      .json(
        formatResponse(
          true,
          { message: "Checkpointing successful.", randomVector },
          null,
          null
        )
      );
  } catch (error) {
    console.error("Error during checkpointing:", error);
    return res
      .status(500)
      .json(formatResponse(false, null, 500, "Internal Server Error"));
  }
};
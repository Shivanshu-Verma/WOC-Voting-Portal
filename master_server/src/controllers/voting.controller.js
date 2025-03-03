import { Voter } from "../models/Voter.js";
import { Commitment } from "../models/Commitments.js"
import { decryptData, encryptForEVM } from "../utils/crypto.utils.js";
import { fetchCandidateInfo } from "../utils/candidate.utils.js";
import { formatResponse } from "../utils/formatApiResponse.js";
import jwt from "jsonwebtoken"

// validate user, send session key [controller]
/**@master_server */
/** 
 * decrypt
 * take voter data {voterId, biometric_left, biometric_right}
 * validate data with db
 * * find voter
 * * validate verifiedByVolunteer and verifiedByStaff (all the way to admin)
 * * compare and validate biometrics
 * create random session key (JWT)
 * encrypt with recieved evmId
 * respond with encryption to the frontend
 */
export const handleVoterSession = async (req, res) => {
    try {
        const { voterId, biometric } = req.body; // will be replaced by req.decryptedData 

        const voter = await Voter.findOne({ where: { voterId } });
        if (!voter) {
            return res.status(404).json(formatResponse(false, null, 404, "Voter not found."));
        }

        console.log("voter = ", voter);

        const storedRight = decryptData(voter.biometric_right);
        const storedLeft = decryptData(voter.biometric_left);

        console.log(storedLeft);
        console.log(storedRight);
        console.log(biometric);

        if(biometric !== storedRight && biometric !== storedLeft) {
            return res.status(401).json(formatResponse(false, null, 401, "Biometric validation failed."));
        }

        if (!voter.verifiedByVolunteer || !voter.verifiedByStaff) {
            return res.status(403).json(formatResponse(false, null, 403, "Voter has not been fully verified."));
        }

        // Check if the voter has already voted
        if (voter.hasVoted) {
            return res.status(403).json(formatResponse(false, null, 403, "Voter has already voted."));
        }

        // Generate session token
        const sessionToken = jwt.sign({ voterId }, process.env.JWT_SECRET, { expiresIn: "5m" }); // change to one minute
        const candidateInformation = await fetchCandidateInfo(voter);

        // Store session token in a secure cookie
        res.cookie("sessionToken", sessionToken, {
            httpOnly: true,
            secure: true,
            sameSite: "Strict",
            maxAge: 300000, // 1 minute
        });

        return res.status(200).json(formatResponse(true, {
            message: "Session established.",
            sessionToken: sessionToken, // for now only [testing, postman]
            candidates: candidateInformation,
        }, null, null));

    } catch (error) {
        console.error("Error during voter login:", error);
        return res.status(500).json(formatResponse(false, null, 500, "Internal Server Error"));
    }
};


/** @evm */ // [clientside]
/**
 * store session key in local storage (or alt)
 * send with next message and delete
 */

// cast vote [controller]
/**
 * decrypt
 * validate session key
 * collect and store commitments
 */
export const handleCastVote = async (req, res) => {
    try {
        const { voterId } = req; // Retrieved from middleware
        const { commitments } = req.body;

        const voter = await Voter.findOne({ where: { voterId } });
        if (!voter) {
            return res.status(404).json(formatResponse(false, null, 404, "Voter not found."));
        }

        if (voter.hasVoted) {
            return res.status(403).json(formatResponse(false, null, 403, "Voter has already cast their vote."));
        }

        // Store commitments
        for (const commitment of commitments) {
            const newCommit = await Commitment.create({
                position: commitment.position,
                evm: req.evm.id,
                commitment: commitment.commitment,
            });

            console.log("New Commitment Created = ", newCommit);
        }

        // Mark voter as voted
        await voter.update({ hasVoted: true });

        return res.status(200).json(formatResponse(true, { message: "Vote cast successfully." }, null, null));

    } catch (error) {
        console.error("Error during vote casting:", error);
        return res.status(500).json(formatResponse(false, null, 500, "Internal Server Error"));
    }
};


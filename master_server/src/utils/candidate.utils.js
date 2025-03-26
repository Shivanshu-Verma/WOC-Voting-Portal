import { Candidate } from "../models/Candidate.js";

/**
 * Fetches candidates that a given voter is eligible to vote for.
 * 
 * @param {Object} voter - Voter object containing positions array.
 * @returns {Promise<Array>} - Array of candidates the voter can vote for.
 */
export const fetchCandidateInfo = async (voter) => {
    try {

        if (!voter || !Array.isArray(voter.allowedPositions)) {
            throw new Error("Invalid voter object");
        }

        // Fetch candidates matching the voter's eligible positions
        const candidates = await Candidate.findAll({
            where: {
                position: voter.allowedPositions,
                verifiedByStaff: { $ne: null }, 
            },
        });

        return candidates;
    } catch (error) {
        console.error("Error fetching candidate info:", error);
        throw new Error("Could not fetch candidate information");
    }
};

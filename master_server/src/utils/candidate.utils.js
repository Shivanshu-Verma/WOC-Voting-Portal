import { Candidate } from "../models/Candidate.js";
import { Op } from "sequelize"; 

/**
 * Fetches candidates that a given voter is eligible to vote for and attaches basis arrays.
 * 
 * @param {Object} voter - Voter object containing allowedPositions array.
 * @returns {Promise<Array>} - Array of candidates with basis arrays.
 */
export const fetchCandidateInfo = async (voter) => {
    try {
        // Validate voter object
        if (!voter || !Array.isArray(voter.allowedPositions)) {
            throw new Error("Invalid voter object");
        }

        // Fetch candidates matching the voter's eligible positions and who are verified
        const candidates = await Candidate.findAll({
            where: {
                position: { [Op.in]: voter.allowedPositions },
                verifiedByStaff: { [Op.ne]: null }, // Only verified candidates
            },
        });

        // Get max basis per position
        const maxBasisPerPosition = {};
        candidates.forEach(candidate => {
            const basisValue = parseInt(candidate.basis, 10) || 0;
            if (!maxBasisPerPosition[candidate.position] || maxBasisPerPosition[candidate.position] < basisValue) {
                maxBasisPerPosition[candidate.position] = basisValue;
            }
        });

        // Function to encode basis values
        const encodeBasis = (value, max) => {
            const basisArray = Array(max).fill(0);
            if (value > 0 && value <= max) {
                basisArray[value - 1] = 1;
            }
            return basisArray;
        };

        // Transform candidates with basis array
        return candidates.map(candidate => ({
            id: candidate.id,
            name: candidate.name,
            position: candidate.position,
            basisArray: encodeBasis(parseInt(candidate.basis, 10), maxBasisPerPosition[candidate.position]),
            imageUrl: candidate.imageUrl,
        }));

    } catch (error) {
        console.error("Error fetching candidate info:", error);
        throw new Error("Could not fetch candidate information");
    }
};

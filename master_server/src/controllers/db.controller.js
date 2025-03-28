import { Voter } from "../models/Voter.js";
import { Candidate } from "../models/Candidate.js";
import { EC_Volunteer } from "../models/EC_Volunteer.js";
import { EC_Staff } from "../models/EC_Staff.js";
import { EVM } from "../models/EVM.js"
import { Commitment } from "../models/Commitments.js";
import { formatResponse } from "../utils/formatApiResponse.js";

// Controller to get all voters
export const getAllVoters = async (req, res) => {
    try {
        const voters = await Voter.findAll();
        console.log(voters);
        return res.status(200).json(formatResponse(true, voters, null, null));
    } catch (error) {
        console.error("Error fetching voters:", error);
        return res.status(500).json(formatResponse(false, null, 500, "Internal Server Error"));
    }
};

export const getAllCandidates = async (req, res) => {
    try {
        const Candidates = await Candidate.findAll();
        console.log(Candidates);
        return res.status(200).json(formatResponse(true, Candidates, null, null));
    } catch (error) {
        console.error("Error fetching voters:", error);
        return res.status(500).json(formatResponse(false, null, 500, "Internal Server Error"));
    }
};

export const getAllVolunteers = async (req, res) => {
    try {
        const volunteers = await EC_Volunteer.findAll({
            attributes: { exclude: ["password"] }
        });
        console.log(volunteers);
        return res.status(200).json(formatResponse(true, volunteers, null, null));
    } catch (error) {
        console.error("Error fetching voters:", error);
        return res.status(500).json(formatResponse(false, null, 500, "Internal Server Error"));
    }
};

export const getAllStaff = async (req, res) => {
    try {
        const staff = await EC_Staff.findAll({
            attributes: { exclude: ["password"] }
        });
        console.log(staff);
        return res.status(200).json(formatResponse(true, staff, null, null));
    } catch (error) {
        console.error("Error fetching voters:", error);
        return res.status(500).json(formatResponse(false, null, 500, "Internal Server Error"));
    }
};

export const getAllEVM = async (req, res) => {
    try {
        const evm = await EVM.findAll();
        console.log(evm);
        return res.status(200).json(formatResponse(true, evm, null, null));
    } catch (error) {
        console.error("Error fetching voters:", error);
        return res.status(500).json(formatResponse(false, null, 500, "Internal Server Error"));
    }
};

export const getAllCommitments = async (req, res) => {
    try {
        const commitments = await Commitment.findAll();
        console.log(commitments);
        return res.status(200).json(formatResponse(true, commitments, null, null));
    } catch (error) {
        console.error("Error fetching voters:", error);
        return res.status(500).json(formatResponse(false, null, 500, "Internal Server Error"));
    }
};
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


// Controller to update a voter
export const updateVoter = async (req, res) => {
    try {
        const { id } = req.params;
        const [updated] = await Voter.update(req.body, { where: { id } });
        if (!updated) return res.status(404).json(formatResponse(false, null, 404, "Voter not found"));
        return res.status(200).json(formatResponse(true, "Voter updated successfully", null, null));
    } catch (error) {
        console.error("Error updating voter:", error);
        return res.status(500).json(formatResponse(false, null, 500, "Internal Server Error"));
    }
};

// Controller to update a candidate
export const updateCandidate = async (req, res) => {
    try {
        const { id } = req.params;
        const [updated] = await Candidate.update(req.body, { where: { id } });
        if (!updated) return res.status(404).json(formatResponse(false, null, 404, "Candidate not found"));
        return res.status(200).json(formatResponse(true, "Candidate updated successfully", null, null));
    } catch (error) {
        console.error("Error updating candidate:", error);
        return res.status(500).json(formatResponse(false, null, 500, "Internal Server Error"));
    }
};

// Controller to update a volunteer
export const updateVolunteer = async (req, res) => {
    try {
        const { id } = req.params;
        const [updated] = await EC_Volunteer.update(req.body, { where: { id } });
        if (!updated) return res.status(404).json(formatResponse(false, null, 404, "Volunteer not found"));
        return res.status(200).json(formatResponse(true, "Volunteer updated successfully", null, null));
    } catch (error) {
        console.error("Error updating volunteer:", error);
        return res.status(500).json(formatResponse(false, null, 500, "Internal Server Error"));
    }
};

// Controller to update a staff member
export const updateStaff = async (req, res) => {
    try {
        const { id } = req.params;
        const [updated] = await EC_Staff.update(req.body, { where: { id } });
        if (!updated) return res.status(404).json(formatResponse(false, null, 404, "Staff member not found"));
        return res.status(200).json(formatResponse(true, "Staff member updated successfully", null, null));
    } catch (error) {
        console.error("Error updating staff member:", error);
        return res.status(500).json(formatResponse(false, null, 500, "Internal Server Error"));
    }
};

// Controller to update an EVM
export const updateEVM = async (req, res) => {
    try {
        const { id } = req.params;
        const [updated] = await EVM.update(req.body, { where: { id } });
        if (!updated) return res.status(404).json(formatResponse(false, null, 404, "EVM not found"));
        return res.status(200).json(formatResponse(true, "EVM updated successfully", null, null));
    } catch (error) {
        console.error("Error updating EVM:", error);
        return res.status(500).json(formatResponse(false, null, 500, "Internal Server Error"));
    }
};

// Controller to update a commitment
export const updateCommitment = async (req, res) => {
    try {
        const { id } = req.params;
        const [updated] = await Commitment.update(req.body, { where: { id } });
        if (!updated) return res.status(404).json(formatResponse(false, null, 404, "Commitment not found"));
        return res.status(200).json(formatResponse(true, "Commitment updated successfully", null, null));
    } catch (error) {
        console.error("Error updating commitment:", error);
        return res.status(500).json(formatResponse(false, null, 500, "Internal Server Error"));
    }
};

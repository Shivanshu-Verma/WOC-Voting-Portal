import express from "express";
import {
    getAllVoters,
    getAllCandidates,
    getAllVolunteers,
    getAllStaff,
    getAllEVM,
    getAllCommitments
} from "../controllers/db.controller.js";

const router = express.Router();

// Route to get all voters
router.get("/voters", getAllVoters);
router.get("/candidates", getAllCandidates);
router.get("/volunteers", getAllVolunteers);
router.get("/staff", getAllStaff);
router.get("/evm", getAllEVM);
router.get("/commitments", getAllCommitments);


export default router;

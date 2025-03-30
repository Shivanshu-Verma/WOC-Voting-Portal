import express from "express";
import {
    getAllVoters, updateVoter,
    getAllCandidates, updateCandidate,
    getAllVolunteers, updateVolunteer,
    getAllStaff, updateStaff,
    getAllEVM, updateEVM,
    getAllCommitments, updateCommitment
} from "../controllers/db.controller.js";
import { authenticateUser, verifierIsStaff } from "../middlewares/auth.middleware.js";

const router = express.Router();

// GET routes
router.get("/voters", getAllVoters);
router.get("/candidates", getAllCandidates);
router.get("/volunteers", getAllVolunteers);
router.get("/staff", getAllStaff);
router.get("/evm", getAllEVM);
router.get("/commitments", getAllCommitments);

// PUT (Edit) routes
router.put("/voters/:id", authenticateUser, verifierIsStaff, updateVoter);
router.put("/candidates/:id", authenticateUser, verifierIsStaff, updateCandidate);
router.put("/volunteers/:id", authenticateUser, verifierIsStaff, updateVolunteer);
router.put("/staff/:id", authenticateUser, verifierIsStaff, updateStaff);
router.put("/evm/:id", authenticateUser, verifierIsStaff, updateEVM);
router.put("/commitments/:id", authenticateUser, verifierIsStaff, updateCommitment);

export default router;

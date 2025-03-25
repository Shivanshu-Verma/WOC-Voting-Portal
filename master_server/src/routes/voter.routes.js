import express from "express";
import {
  handleVoterRegistration,
  getVoterById,
  verifyVoter,
  addPositions,
} from "../controllers/voter.controller.js";
import { authenticateUser, verifierIsVolunteer, verifierIsStaff } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/register", handleVoterRegistration);
router.get("/:id", authenticateUser, getVoterById); // mw check
router.post("/verify", authenticateUser, verifierIsStaff, verifyVoter);
router.post("/add-positions/:id", authenticateUser, addPositions);

export default router;

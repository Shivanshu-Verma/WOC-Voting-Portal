import express from "express";
import {
  handleVoterRegistration,
  getVoterById,
  verifyVoter,
} from "../controllers/voter.controller.js";
import { authenticateUser } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/register", handleVoterRegistration);
router.get("/get/:id", authenticateUser,getVoterById); // mw check
router.post("/verify-voter", authenticateUser, verifyVoter);

export default router;

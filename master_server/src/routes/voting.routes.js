import express from "express";
import { decryptMiddleware } from "../middlewares/decryption.middleware.js";
import {
  handleCastVote,
  handleVoterSession,
} from "../controllers/voting.controller.js";
import { sessionValidationMW } from "../middlewares/voting.middleware.js";
import {
  authenticateUser,
  verifierIsStaff,
} from "../middlewares/auth.middleware.js";

const router = express.Router();

// router.get("/eligible-positions", voterAuthentication, getEligibleCandidates);
// router.post("/voter-commitment", voterAuthentication, storingCommitment);

router.post(
  "/login",
  authenticateUser,
  verifierIsStaff,
  decryptMiddleware,
  handleVoterSession
); 
router.post(
  "/cast",
  authenticateUser,
  verifierIsStaff,
  decryptMiddleware,
  sessionValidationMW,
  handleCastVote
);

export default router;

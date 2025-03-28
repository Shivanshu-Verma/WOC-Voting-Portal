import express from "express";
import {
  handleVoterRegistration,
  getVoterById,
  verifyVoter,
  addPositions,
} from "../controllers/voter.controller.js";
import { authenticateUser, verifierIsStaff, verifierIsVolunteer } from "../middlewares/auth.middleware.js";
import upload from "../middlewares/multer.middleware.js";

const router = express.Router();

router.post("/register", authenticateUser, verifierIsVolunteer, upload.single("image"), handleVoterRegistration);
router.get("/get/:id", authenticateUser, verifierIsVolunteer, getVoterById);
router.post("/verify-voter", authenticateUser, verifierIsStaff, verifyVoter);

export default router;

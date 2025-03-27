import express from "express";
import { handleCandidateRegistration, verifyCandidate } from "../controllers/candidate.controller.js";
import { authenticateUser, verifierIsStaff, verifierIsVolunteer } from "../middlewares/auth.middleware.js";
import upload from "../middlewares/multer.middleware.js";

const router = express.Router();

router.post("/register", authenticateUser, verifierIsVolunteer, upload.single("image"), handleCandidateRegistration);
router.get("/verify/:id", authenticateUser, verifierIsStaff, verifyCandidate)

export default router;

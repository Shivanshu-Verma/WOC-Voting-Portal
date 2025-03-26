import express from "express";
import { handleCandidateRegistration } from "../controllers/candidate.controller.js";
import { authenticateUser, verifierIsVolunteer } from "../middlewares/auth.middleware.js";
import upload from "../middlewares/multer.middleware.js";

const router = express.Router();

router.post("/register", authenticateUser, verifierIsVolunteer, upload.single("image"), handleCandidateRegistration);

export default router;

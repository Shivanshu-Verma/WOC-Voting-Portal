import express from "express";
import { handleEvmRegistration } from "../controllers/evm.controller.js";
import { authenticateUser, verifierIsStaff } from "../middlewares/auth.middleware.js"

const router = express.Router();
router.post("/register", authenticateUser, verifierIsStaff, handleEvmRegistration); // ec auth

export default router;
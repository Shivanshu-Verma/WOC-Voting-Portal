import express from "express";
import { handleEvmRegistration } from "../controllers/evm.controller.js";
import { authenticateUser, validateEvmRequest } from "../middlewares/auth.middleware.js"

const router = express.Router();
router.post("/register", authenticateUser, validateEvmRequest, handleEvmRegistration); // ec auth

export default router;
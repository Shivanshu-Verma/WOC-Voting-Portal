import express from "express";
import { handleEvmRegistration } from "../controllers/evm.controller.js";

const router = express.Router();
router.post("/register", authenticateUser, validateEvmRequest, handleEvmRegistration); // ec auth

export default router;
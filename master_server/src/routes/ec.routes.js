import express from "express";
import {
  handleEcStaffRegistration,
  handleEcVolunteerRegistration,
  handleEcStaffLogin,
  handleEcVolunteerLogin,
} from "../controllers/ec.controller.js";
import { authenticateUser, verifierIsStaff } from "../middlewares/auth.middleware.js"

const router = express.Router();

router.post("/register/staff", handleEcStaffRegistration);
router.post("/register/volunteer", authenticateUser, verifierIsStaff, handleEcVolunteerRegistration);

router.post("/login/staff", handleEcStaffLogin);
router.post("/login/volunteer", handleEcVolunteerLogin);

export default router;
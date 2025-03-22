import express from "express";
import {
  handleEcStaffRegistration,
  handleEcVolunteerRegistration,
  handleEcStaffLogin,
  handleEcVolunteerLogin,
} from "../controllers/ec.controller.js";

const router = express.Router();

router.post("/register/staff", handleEcStaffRegistration);
router.post("/register/volunteer", handleEcVolunteerRegistration);

router.post("/login/staff", handleEcStaffLogin);
router.post("/login/volunteer", handleEcVolunteerLogin);

export default router;
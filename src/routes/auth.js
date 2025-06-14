const express = require("express");
const router = express.Router();
const AuthController = require("../controllers/AuthController");
const authMiddleware = require("../middleware/auth");

// Input validation middleware
const { body } = require("express-validator");
const validate = require("../middleware/validate");

const registerValidation = [
  body("email").isEmail().withMessage("Invalid email address"),
  body("name").notEmpty().withMessage("Name is required"),
  body("userType").isIn(["HOTEL", "CUSTOMER"]).withMessage("Invalid user type"),
];

const verifyOtpValidation = [
  body("email").isEmail().withMessage("Invalid email address"),
  body("otp").isLength({ min: 6, max: 6 }).withMessage("Invalid OTP"),
];

// Auth routes for Registration
router.post(
  "/register/initiate",
  registerValidation,
  validate,
  AuthController.initiateRegistration
);
router.post(
  "/register/verify",
  verifyOtpValidation,
  validate,
  AuthController.verifyRegistrationOtp
);

// Auth routes for Login
router.post(
  "/login/initiate",
  body("email").isEmail().withMessage("Invalid email address"),
  validate,
  AuthController.initiateLogin
);
router.post(
  "/login/verify",
  verifyOtpValidation,
  validate,
  AuthController.verifyLoginOtp
);

// Other auth routes
router.post("/logout", authMiddleware, AuthController.logout);
router.post("/refresh-token", AuthController.refreshToken);

module.exports = router;

const express = require("express");
const router = express.Router();
const AuthController = require("../controllers/AuthController");
const authMiddleware = require("../middleware/auth");

// Input validation middleware
const { body } = require("express-validator");
const validate = require("../middleware/validate");

const registerValidation = [
  body("email").isEmail().withMessage("Invalid email address"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),
  body("name").notEmpty().withMessage("Name is required"),
  body("userType").isIn(["HOTEL", "CUSTOMER"]).withMessage("Invalid user type"),
];

const loginValidation = [
  body("email").isEmail().withMessage("Invalid email address"),
  body("password").notEmpty().withMessage("Password is required"),
];

// Auth routes
router.post("/register", registerValidation, validate, AuthController.register);
router.post("/login", loginValidation, validate, AuthController.login);
router.post("/logout", authMiddleware, AuthController.logout);
router.post("/refresh-token", AuthController.refreshToken);

module.exports = router;

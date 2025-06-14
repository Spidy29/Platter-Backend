const User = require("../models/User");
const TokenService = require("../services/TokenService");
const OtpService = require("../services/OtpService");

class AuthController {
  static async initiateRegistration(req, res) {
    try {
      const { email, name, userType } = req.body;

      // Check if user exists
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }

      // Store registration data in session or temporary storage
      req.session = req.session || {};
      req.session.registration = {
        email,
        name,
        userType,
      };

      // Generate and send OTP
      await OtpService.createOTP(email, "SIGNUP");

      res.status(200).json({
        message: "OTP sent successfully. Please verify your email.",
        email,
      });
    } catch (error) {
      console.error("Registration initiation error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }

  static async verifyRegistrationOtp(req, res) {
    try {
      const { email, otp } = req.body;

      // Verify OTP
      const isValid = await OtpService.verifyOTP(email, otp, "SIGNUP");
      if (!isValid) {
        return res.status(400).json({ message: "Invalid OTP" });
      }

      // Get registration data
      const registrationData = req.session?.registration;
      if (!registrationData || registrationData.email !== email) {
        return res
          .status(400)
          .json({ message: "Registration session expired" });
      }

      // Create user
      const user = await User.create({
        ...registrationData,
        isEmailVerified: true,
      });

      // Generate tokens
      const accessToken = TokenService.generateAccessToken(user);
      const refreshToken = TokenService.generateRefreshToken(user);

      // Save refresh token
      await user.update({ refreshToken });

      // Set cookies
      TokenService.setTokenCookie(res, accessToken, false);
      TokenService.setTokenCookie(res, refreshToken, true);

      // Clear registration session
      delete req.session.registration;

      // Remove sensitive data from response
      const userResponse = user.toJSON();
      delete userResponse.password;
      delete userResponse.refreshToken;

      res.status(201).json({
        message: "Registration successful",
        user: userResponse,
      });
    } catch (error) {
      console.error("Registration verification error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }

  static async initiateLogin(req, res) {
    try {
      const { email } = req.body;

      // Check if user exists
      const user = await User.findOne({ where: { email } });
      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }

      // Generate and send OTP
      await OtpService.createOTP(email, "LOGIN");

      res.status(200).json({
        message: "OTP sent successfully. Please verify to login.",
        email,
      });
    } catch (error) {
      console.error("Login initiation error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }

  static async verifyLoginOtp(req, res) {
    try {
      const { email, otp } = req.body;

      // Verify OTP
      const isValid = await OtpService.verifyOTP(email, otp, "LOGIN");
      if (!isValid) {
        return res.status(401).json({ message: "Invalid OTP" });
      }

      // Find user
      const user = await User.findOne({ where: { email } });
      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }

      // Generate tokens
      const accessToken = TokenService.generateAccessToken(user);
      const refreshToken = TokenService.generateRefreshToken(user);

      // Update refresh token and last login
      await user.update({
        refreshToken,
        lastLogin: new Date(),
      });

      // Set cookies
      TokenService.setTokenCookie(res, accessToken, false);
      TokenService.setTokenCookie(res, refreshToken, true);

      // Remove sensitive data from response
      const userResponse = user.toJSON();
      delete userResponse.password;
      delete userResponse.refreshToken;

      res.json({
        message: "Login successful",
        user: userResponse,
      });
    } catch (error) {
      console.error("Login verification error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }

  static async logout(req, res) {
    try {
      // Clear refresh token in database
      await req.user.update({ refreshToken: null });

      // Clear cookies
      res.clearCookie("accessToken");
      res.clearCookie("refreshToken");

      res.json({ message: "Logged out successfully" });
    } catch (error) {
      console.error("Logout error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }

  static async refreshToken(req, res) {
    try {
      const refreshToken = req.cookies.refreshToken;

      if (!refreshToken) {
        return res.status(401).json({ message: "Refresh token not found" });
      }

      // Verify refresh token
      const decoded = TokenService.verifyRefreshToken(refreshToken);
      if (!decoded) {
        return res.status(401).json({ message: "Invalid refresh token" });
      }

      // Find user
      const user = await User.findByPk(decoded.id);
      if (!user || user.refreshToken !== refreshToken) {
        return res.status(401).json({ message: "Invalid refresh token" });
      }

      // Generate new tokens
      const newAccessToken = TokenService.generateAccessToken(user);
      const newRefreshToken = TokenService.generateRefreshToken(user);

      // Update refresh token in database
      await user.update({ refreshToken: newRefreshToken });

      // Set new cookies
      TokenService.setTokenCookie(res, newAccessToken, false);
      TokenService.setTokenCookie(res, newRefreshToken, true);

      res.json({ message: "Token refreshed successfully" });
    } catch (error) {
      console.error("Token refresh error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
}

module.exports = AuthController;

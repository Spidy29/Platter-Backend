const User = require("../models/User");
const TokenService = require("../services/TokenService");

class AuthController {
  // Ensure all methods are defined as static
  constructor() {
    // This is just to ensure the class is properly constructed
  }
  static async register(req, res) {
    try {
      const { email, password, name, userType } = req.body;

      // Check if user exists
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }

      // Create user
      const user = await User.create({
        email,
        password,
        name,
        userType,
        isEmailVerified: false,
      });

      // Generate tokens
      const accessToken = TokenService.generateAccessToken(user);
      const refreshToken = TokenService.generateRefreshToken(user);

      // Save refresh token
      await user.update({ refreshToken });

      // Set cookies
      TokenService.setTokenCookie(res, accessToken, false);
      TokenService.setTokenCookie(res, refreshToken, true);

      // Remove password from response
      const userResponse = user.toJSON();
      delete userResponse.password;
      delete userResponse.refreshToken;

      res.status(201).json({ user: userResponse });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }

  static async login(req, res) {
    try {
      const { email, password } = req.body;

      // Find user
      const user = await User.findOne({ where: { email } });
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Validate password
      const isValidPassword = await user.validatePassword(password);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid credentials" });
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

      res.json({ user: userResponse });
    } catch (error) {
      console.error("Login error:", error);
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

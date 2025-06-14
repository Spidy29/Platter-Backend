const TokenService = require("../services/TokenService");
const User = require("../models/User");

const authMiddleware = async (req, res, next) => {
  try {
    // Get access token from cookie
    const accessToken = req.cookies.accessToken;

    if (!accessToken) {
      return res.status(401).json({ message: "Access token not found" });
    }

    // Verify access token
    const decoded = TokenService.verifyAccessToken(accessToken);

    if (!decoded) {
      // Try to refresh the token
      const refreshToken = req.cookies.refreshToken;

      if (!refreshToken) {
        return res.status(401).json({ message: "Refresh token not found" });
      }

      const refreshDecoded = TokenService.verifyRefreshToken(refreshToken);

      if (!refreshDecoded) {
        return res.status(401).json({ message: "Invalid refresh token" });
      }

      // Get user and generate new tokens
      const user = await User.findByPk(refreshDecoded.id);

      if (!user || user.refreshToken !== refreshToken) {
        return res.status(401).json({ message: "Invalid refresh token" });
      }

      const newAccessToken = TokenService.generateAccessToken(user);
      const newRefreshToken = TokenService.generateRefreshToken(user);

      // Update refresh token in database
      await user.update({ refreshToken: newRefreshToken });

      // Set new cookies
      TokenService.setTokenCookie(res, newAccessToken, false);
      TokenService.setTokenCookie(res, newRefreshToken, true);

      req.user = user;
    } else {
      // Access token is valid
      const user = await User.findByPk(decoded.id);
      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }
      req.user = user;
    }

    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = authMiddleware;

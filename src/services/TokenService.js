const jwt = require("jsonwebtoken");

class TokenService {
  static generateAccessToken(user) {
    return jwt.sign(
      {
        id: user.id,
        email: user.email,
        userType: user.userType,
      },
      process.env.JWT_ACCESS_SECRET,
      { expiresIn: process.env.ACCESS_TOKEN_EXPIRE || "24h" } // 24 hours
    );
  }

  static generateRefreshToken(user) {
    return jwt.sign(
      { id: user.id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: process.env.REFRESH_TOKEN_EXPIRE || "7d" } // 7 days
    );
  }

  static verifyAccessToken(token) {
    try {
      return jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    } catch (error) {
      return null;
    }
  }

  static verifyRefreshToken(token) {
    try {
      return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    } catch (error) {
      return null;
    }
  }

  static setTokenCookie(res, token, isRefreshToken = false) {
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
    };

    if (isRefreshToken) {
      // Set refresh token to expire in 7 days
      cookieOptions.maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days
      res.cookie("refreshToken", token, cookieOptions);
    } else {
      // Set access token to expire in 24 hours
      cookieOptions.maxAge = 24 * 60 * 60 * 1000; // 24 hours
      res.cookie("accessToken", token, cookieOptions);
    }
  }
}

module.exports = TokenService;

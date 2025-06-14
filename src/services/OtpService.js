const { Op } = require("sequelize");
const Otp = require("../models/Otp");
const EmailService = require("./EmailService");

class OtpService {
  static generateOTP(length = 6) {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  static async createOTP(email, purpose) {
    try {
      // Invalidate any existing OTPs for this email and purpose
      await Otp.update(
        { isUsed: true },
        { where: { email, purpose, isUsed: false } }
      );

      const otp = this.generateOTP();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

      // Create new OTP record
      const otpRecord = await Otp.create({
        email,
        otp,
        purpose,
        expiresAt,
      });

      // Send OTP via email
      const emailSent = await EmailService.sendOTP(email, otp);
      if (!emailSent) {
        throw new Error("Failed to send OTP email");
      }

      return true;
    } catch (error) {
      console.error("OTP creation error:", error);
      throw error;
    }
  }

  static async verifyOTP(email, otp, purpose) {
    try {
      const otpRecord = await Otp.findOne({
        where: {
          email,
          otp,
          purpose,
          isUsed: false,
          expiresAt: {
            [Op.gt]: new Date(), // Check if OTP hasn't expired
          },
        },
      });

      if (!otpRecord) {
        return false;
      }

      // Mark OTP as used
      await otpRecord.update({
        isUsed: true,
      });

      return true;
    } catch (error) {
      console.error("OTP verification error:", error);
      return false;
    }
  }

  static async incrementAttempts(email, purpose) {
    try {
      const otpRecord = await Otp.findOne({
        where: {
          email,
          purpose,
          isUsed: false,
        },
      });

      if (otpRecord) {
        await otpRecord.increment("attempts");
        return otpRecord.attempts + 1;
      }

      return 0;
    } catch (error) {
      console.error("Increment attempts error:", error);
      return 0;
    }
  }
}

module.exports = OtpService;

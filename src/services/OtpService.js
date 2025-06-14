const { Op } = require("sequelize");
const Otp = require("../models/Otp");
const EmailService = require("./EmailService");

class OtpService {
  static generateOTP(length = 6) {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  static async cleanupOldOTPs() {
    try {
      // Delete expired OTPs
      await Otp.destroy({
        where: {
          [Op.or]: [
            { expiresAt: { [Op.lt]: new Date() } }, // Delete expired OTPs
            { isUsed: true }, // Delete used OTPs
          ],
        },
      });
    } catch (error) {
      console.error("OTP cleanup error:", error);
    }
  }

  static async createOTP(email, purpose) {
    try {
      // First, cleanup old OTPs
      await this.cleanupOldOTPs();

      // Then, invalidate any existing active OTPs for this email and purpose
      await Otp.destroy({
        where: {
          email,
          purpose,
          isUsed: false,
          expiresAt: { [Op.gt]: new Date() },
        },
      });

      const otp = this.generateOTP();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

      // Create new OTP record
      const otpRecord = await Otp.create({
        email,
        otp,
        purpose,
        expiresAt,
        attempts: 0,
        isUsed: false,
      });

      // Send OTP via email
      const emailSent = await EmailService.sendOTP(email, otp);
      if (!emailSent) {
        // If email fails, delete the OTP record and throw error
        await otpRecord.destroy();
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
      // First, cleanup old OTPs
      await this.cleanupOldOTPs();

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
      await otpRecord.update({ isUsed: true });

      // Delete this OTP since it's now used
      await otpRecord.destroy();

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
          expiresAt: {
            [Op.gt]: new Date(),
          },
        },
      });

      if (otpRecord) {
        const attempts = otpRecord.attempts + 1;

        // If too many attempts (e.g., more than 3), invalidate the OTP
        if (attempts >= 3) {
          await otpRecord.destroy();
          return -1; // Indicate OTP is now invalid due to too many attempts
        }

        await otpRecord.update({ attempts });
        return attempts;
      }

      return 0;
    } catch (error) {
      console.error("Increment attempts error:", error);
      return 0;
    }
  }
}

module.exports = OtpService;

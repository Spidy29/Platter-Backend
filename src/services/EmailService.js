const nodemailer = require("nodemailer");

class EmailService {
  static transporter = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  static async sendOTP(email, otp) {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Your OTP for Platter Authentication",
      html: `
        <h1>Authentication OTP</h1>
        <p>Your OTP for authentication is: <strong>${otp}</strong></p>
        <p>This OTP will expire in 10 minutes.</p>
        <p>If you didn't request this OTP, please ignore this email.</p>
      `,
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log("\n=====================================");
      console.log("📧 Test Email Preview URL:");
      console.log(nodemailer.getTestMessageUrl(info));
      console.log("=====================================\n");
      return true;
    } catch (error) {
      console.error("Error sending email:", error);
      return false;
    }
  }
}

module.exports = EmailService;

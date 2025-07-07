const nodemailer = require("nodemailer");

class EmailService {
  static transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
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
  <div style="background-color:#f4f8fc; padding:30px; font-family:'Segoe UI', sans-serif;">
    <div style="max-width:600px; margin:0 auto; background:white; border-radius:12px; overflow:hidden; box-shadow:0 4px 20px rgba(0,0,0,0.1);">
      <div style="background:linear-gradient(135deg, #0077cc, #00aaff); padding:20px 30px;">
        <h1 style="color:white; margin:0; animation:fadeIn 1s ease-in-out;">🍽️ Platter - Your Taste, Our Passion</h1>
      </div>
      <div style="padding:30px; color:#333;">
        <h2 style="margin-top:0; color:#0077cc; animation:slideIn 1s ease-in-out;">Your OTP is Here!</h2>
        <p style="font-size:16px; line-height:1.6;">Thank you for using <strong>Platter</strong> to explore amazing food experiences. Use the OTP below to continue your journey with us:</p>
        <div style="text-align:center; margin:30px 0;">
          <span style="font-size:36px; font-weight:bold; color:#0077cc; background:#e6f2ff; padding:10px 20px; border-radius:8px; animation:pulse 1.5s infinite;">${otp}</span>
        </div>
        <p>This OTP will expire in <strong>10 minutes</strong>.</p>
        <p>If you didn’t request this OTP, please ignore this message.</p>
        <p>Bon Appétit!<br><strong>— Team Platter</strong></p>
      </div>
      <div style="background:#f0f8ff; padding:15px; text-align:center; font-size:13px; color:#555;">
        Need help? Reach out at <a href="mailto:support@platter.com" style="color:#0077cc; text-decoration:none;">support@platter.com</a>
      </div>
    </div>
  </div>

  <style>
    @keyframes fadeIn {
      from {opacity: 0;}
      to {opacity: 1;}
    }

    @keyframes slideIn {
      from {transform: translateY(-20px); opacity: 0;}
      to {transform: translateY(0); opacity: 1;}
    }

    @keyframes pulse {
      0% {transform: scale(1);}
      50% {transform: scale(1.05);}
      100% {transform: scale(1);}
    }
  </style>
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

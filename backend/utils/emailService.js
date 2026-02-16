const nodemailer = require("nodemailer");

// 1. Transporter ko bahar rakhein (Singleton Pattern)
// Isse har mail par naya connection open nahi karna padega
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendEmail = async (to, subject, text, html) => {
  // Credentials check
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn("⚠️ Email credentials missing. Skipping email send.");
    return;
  }

  try {
    const mailOptions = {
      from: `"Veridia Hiring Team" <${process.env.EMAIL_USER}>`, // Professional Display Name
      to,
      subject,
      text,
      html:
        html ||
        `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee;">
          <h2 style="color: #2563eb;">Veridia Portal</h2>
          <p style="color: #333; line-height: 1.6;">${text}</p>
          <footer style="margin-top: 20px; font-size: 12px; color: #888;">
            © 2026 Veridia | Aligned with AKTU Project Standards
          </footer>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Email Sent: ${info.messageId}`);
  } catch (error) {
    console.error("❌ Nodemailer Error:", error.message);
  }
};

module.exports = sendEmail;

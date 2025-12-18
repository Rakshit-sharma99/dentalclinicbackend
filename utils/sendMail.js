const nodemailer = require("nodemailer");

const sendMail = async (to, subject, text) => {
  console.log(`✉️ Preparing to send email to: ${to}`);
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true, // Use SSL
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      connectionTimeout: 10000, // 10 seconds timeout
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to,
      subject,
      text,
    };

    console.log("📤 Sending now...");
    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Mail sent successfully:", info.response);
  } catch (error) {
    console.error("❌ Error sending mail:", error);
  }
};

module.exports = sendMail;

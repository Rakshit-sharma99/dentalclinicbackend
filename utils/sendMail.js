const nodemailer = require("nodemailer");

const sendMail = async (to, subject, text) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "mansimran1414@gmail.com",
        pass: "rewn vxrf qbsn rvpa",  // use App Password (not normal Gmail password)
      },
    });

    const mailOptions = {
      from: "mansimran1414@gmail.com",
      to,
      subject,
      text,
    };

    await transporter.sendMail(mailOptions);
    console.log("✅ Mail sent successfully");
  } catch (error) {
    console.error("❌ Error sending mail:", error);
  }
};

module.exports = sendMail;

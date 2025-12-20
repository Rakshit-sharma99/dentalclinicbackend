const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    host: "smtp-relay.brevo.com",
    port: 587,
    secure: false,
    auth: {
        user: "apikey",
        pass: process.env.BREVO_API_KEY,
    },
});

const sendEmail = async ({ to, subject, text, html }) => {
    try {
        const info = await transporter.sendMail({
            from: `Dental Clinic <${process.env.EMAIL_FROM}>`,
            to,
            subject,
            text,
            html,
        });

        console.log("📩 Email sent:", info.messageId);
        return { success: true };

    } catch (error) {
        console.error("❌ Email error:", error);
        return { success: false, error: error.message };
    }
};

module.exports = { sendEmail };

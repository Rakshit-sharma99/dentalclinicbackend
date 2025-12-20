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

        console.log("📩 Brevo email sent:", info.messageId);
        return { success: true };

    } catch (err) {
        console.error("❌ Brevo mail error:", err);
        return { success: false, error: err.message };
    }
};

module.exports = { sendEmail };

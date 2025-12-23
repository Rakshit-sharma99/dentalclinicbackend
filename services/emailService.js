const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    host: "smtp-relay.brevo.com",
    port: 587,
    secure: false,
    auth: {
        user: process.env.BREVO_USER,
        pass: process.env.BREVO_SMTP_KEY
    }
});


const sendEmail = async ({ to, subject, text, html }) => {
    try {
        const info = await transporter.sendMail({
            from: `Modern Dental <${process.env.EMAIL_FROM}>`,
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

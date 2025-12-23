const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    host: "smtp-relay.brevo.com",
    port: 587,
    secure: false,
    connectionTimeout: 10000,  // 10 seconds timeout
    greetingTimeout: 10000,    // 10 seconds for greeting
    socketTimeout: 15000,      // 15 seconds for socket
    auth: {
        user: process.env.BREVO_USER,
        pass: process.env.BREVO_SMTP_KEY
    }
});

// Verify SMTP connection on startup (logs to Render console)
transporter.verify()
    .then(() => console.log("✅ Brevo SMTP connection verified"))
    .catch(err => console.error("❌ Brevo SMTP verification failed:", err.message));


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

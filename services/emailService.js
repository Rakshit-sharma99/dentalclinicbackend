const nodemailer = require("nodemailer");

// Create reusable transporter object using the default SMTP transport
const createTransporter = () => {
    return nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
        tls: {
            rejectUnauthorized: false
        }
    });
};

/**
 * Send an email
 * @param {string} to - Recipient email
 * @param {string} subject - Email subject
 * @param {string} text - Plain text body
 * @param {string} html - HTML body (optional)
 */
const sendEmail = async ({ to, subject, text, html }) => {
    try {
        const transporter = createTransporter();

        // Verify connection configuration
        await transporter.verify();
        console.log("✅ SMTP Connection Verified");

        const info = await transporter.sendMail({
            from: `"Dental Clinic" <${process.env.EMAIL_USER}>`, // sender address
            to, // list of receivers
            subject, // Subject line
            text, // plain text body
            html, // html body
        });

        console.log("📩 Message sent: %s", info.messageId);
        return { success: true, messageId: info.messageId };

    } catch (error) {
        console.error("❌ Error sending email:", error);
        return { success: false, error: error.message };
    }
};

module.exports = { sendEmail };

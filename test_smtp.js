const nodemailer = require("nodemailer");
require("dotenv").config();

console.log("🔍 Testing Brevo SMTP Connection...\n");

const transporter = nodemailer.createTransport({
    host: "smtp-relay.brevo.com",
    port: 587,
    secure: false,
    auth: {
        user: process.env.BREVO_USER,
        pass: process.env.BREVO_SMTP_KEY,
    },
});

async function verify() {
    try {
        await transporter.verify();
        console.log("✅ SMTP Connection Successful!");
        console.log("📧 Email Server: smtp-relay.brevo.com");
        console.log("👤 User:", process.env.BREVO_USER);
        console.log("📮 From Address:", process.env.EMAIL_FROM);
        console.log("\n✨ Email service is ready to send emails!");
    } catch (error) {
        console.error("❌ SMTP Connection Failed:");
        console.error(error.message);
        process.exit(1);
    }
}

verify();

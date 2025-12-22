const nodemailer = require("nodemailer");

const USER = process.env.BREVO_USER;
const PASS = process.env.BREVO_SMTP_KEY;

async function verify() {
    console.log(`🚀 Testing Final Config...`);
    console.log(`User: ${USER}`);

    const transporter = nodemailer.createTransport({
        host: "smtp-relay.brevo.com",
        port: 587,
        secure: false,
        auth: {
            user: USER,
            pass: PASS,
        },
    });

    try {
        await transporter.verify();
        console.log("✅✅✅ AUTH SUCCESS! We found the correct combination.");

        // Attempt send
        const info = await transporter.sendMail({
            from: "Modern Dental <noreply@moderndentalclinicphagwara.com>",
            to: "rakshitsharma5269@gmail.com",
            subject: "FINAL SYSTEM TEST",
            text: "The SMTP configuration is now correct.",
        });
        console.log("📨 Email Sent ID:", info.messageId);

    } catch (err) {
        console.error("❌ Failed:", err.message);
        if (err.responseCode) console.error("Response Code:", err.responseCode);
    }
}

verify();

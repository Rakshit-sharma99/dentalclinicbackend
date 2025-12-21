const nodemailer = require("nodemailer");

const USER = "9e7ddb001@smtp-brevo.com";
const PASS = "xsmtpsib-a13b42f890505de43ad80ef6e4bd03cf63fd28b2bd5993300642610c9b1f879f-SOEzSeTUM8J9Pw3D";

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

const { sendEmail } = require('./services/emailService');
require('dotenv').config();

async function runDebug() {
    console.log("--- Debugging Email Service ---");
    console.log("Using credentials from .env:");
    console.log("User:", process.env.EMAIL_USER);
    console.log("Pass:", process.env.EMAIL_PASS ? "********" : "Missing");

    const result = await sendEmail({
        to: process.env.EMAIL_USER, // Send to self
        subject: "Debug Test from New Service",
        text: "If you see this, the new emailService is working correctly!",
    });

    if (result.success) {
        console.log("✅ SUCCESS: Email sent!");
    } else {
        console.log("❌ FAILURE: Could not send email.");
        console.log("Error details:", result.error);
    }
}

runDebug();

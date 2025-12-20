const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
        user: "mdclinicjalandhar@gmail.com",
        pass: "paks zizd avgo xxfe",
    },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 10000,
});

const sendEmail = async ({ to, subject, text, html }) => {
    try {
        const info = await transporter.sendMail({
            from: `"Dental Clinic" <mdclinicjalandhar@gmail.com>`,
            to,
            subject,
            text,
            html,
        });

        console.log("📩 Message sent:", info.messageId);
        return { success: true };

    } catch (err) {
        console.error("❌ Mail error:", err);
        return { success: false, error: err.message };
    }
};

module.exports = { sendEmail };

const SibApiV3Sdk = require('sib-api-v3-sdk');

// Configure API key authorization
const defaultClient = SibApiV3Sdk.ApiClient.instance;
const apiKey = defaultClient.authentications['api-key'];
apiKey.apiKey = process.env.BREVO_API_KEY;

const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

const sendEmail = async ({ to, subject, text, html }) => {
    try {
        const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();

        sendSmtpEmail.subject = subject;
        sendSmtpEmail.htmlContent = html;
        sendSmtpEmail.textContent = text;
        sendSmtpEmail.sender = { "name": "Modern Dental", "email": process.env.EMAIL_FROM };
        sendSmtpEmail.to = [{ "email": to }];

        console.log(`📤 Sending email via Brevo API to: ${to}`);

        const data = await apiInstance.sendTransacEmail(sendSmtpEmail);

        console.log("✅ API email sent successfully via Brevo. Message ID:", data.messageId);
        return { success: true, data };

    } catch (error) {
        console.error("❌ Brevo API Error:", error);
        return { success: false, error: error.message };
    }
};

module.exports = { sendEmail };

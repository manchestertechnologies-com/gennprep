// Sends an email. With no email account set up in .env, it prints the
// message in the server terminal instead, so you can still test everything.
const sendEmail = async ({ to, subject, text }) => {
    if (!process.env.SMTP_HOST) {
        console.log("\n========== EMAIL (not sent: no SMTP set up) ==========");
        console.log(`To: ${to}\nSubject: ${subject}\n\n${text}`);
        console.log("=======================================================\n");
        return { sent: false };
    }

    const nodemailer = require("nodemailer");
    const port = Number(process.env.SMTP_PORT) || 587;
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port,
        secure: port === 465,
        auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });

    await transporter.sendMail({
        from: process.env.EMAIL_FROM || process.env.SMTP_USER,
        to,
        subject,
        text,
    });
    return { sent: true };
};

module.exports = sendEmail;
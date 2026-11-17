const nodemailer = require("nodemailer");
const env = require("../config/env");

/**
 * Configure Nodemailer SMTP transporter
 */
const transporter = nodemailer.createTransport({
  host: env.smtp.host,
  port: env.smtp.port,
  secure: env.smtp.port === 465,
  auth: {
    user: env.smtp.user,
    pass: env.smtp.pass,
  },
});

/**
 * Send email utility
 * @param {object} options - { to, subject, text, html }
 */
const sendEmail = async (options) => {
  const mailOptions = {
    from: env.smtp.from,
    to: options.to,
    subject: options.subject,
    text: options.text,
    html: options.html,
  };

  if (!env.smtp.user) {
    console.warn(`[Email Warning] SMTP credentials not set. Simulated email to: ${options.to}`);
    return { messageId: "simulated-id" };
  }

  const info = await transporter.sendMail(mailOptions);
  return info;
};

module.exports = sendEmail;


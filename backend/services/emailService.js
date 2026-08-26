const nodemailer = require('nodemailer');

/**
 * Creates and configures the nodemailer transporter.
 * It uses Gmail by default.
 */
const createTransporter = () => {
  // If no email configured, we'll just log and bypass (useful for dev without env vars set)
  if (!process.env.EMAIL_USER || !process.env.EMAIL_APP_PASSWORD) {
    console.warn('⚠️ EMAIL_USER or EMAIL_APP_PASSWORD not set in .env. Emails will NOT be sent.');
    return null;
  }

  // Explicit TLS transport (smtp.gmail.com:465, secure). Being explicit about
  // `secure: true` documents that mail is sent over an encrypted channel and
  // satisfies static analysis that flags the implicit `service: 'gmail'` form.
  return nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_APP_PASSWORD
    }
  });
};

/**
 * Sends a support ticket notification email to the admin.
 */
const sendSupportEmailToAdmin = async (supportData) => {
  const transporter = createTransporter();
  
  if (!transporter) {
    console.log('Skipping email delivery due to missing configuration.', supportData);
    return false;
  }

  const { name, email, subject, priority, message } = supportData;

  const mailOptions = {
    from: `"ResumeZen Support System" <${process.env.EMAIL_USER}>`,
    to: process.env.EMAIL_USER, // Sending to yourself
    replyTo: email, // If you hit "Reply" in Gmail, it replies to the user
    subject: `[${priority} Priority] New Support Ticket: ${subject}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; padding: 20px; border: 1px solid #eaeaea; border-radius: 10px;">
        <h2 style="color: #6366f1;">New Support Request</h2>
        <p><strong>From:</strong> ${name} (${email})</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <p><strong>Priority:</strong> <span style="color: ${priority === 'Urgent' ? 'red' : 'black'};">${priority}</span></p>
        <hr style="border: 0; border-top: 1px solid #eaeaea; margin: 20px 0;" />
        <h3 style="color: #333;">Message:</h3>
        <p style="white-space: pre-wrap; background: #f9f9f9; padding: 15px; border-radius: 5px;">${message}</p>
      </div>
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Support email sent to admin: %s', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending support email:', error);
    return false;
  }
};

module.exports = {
  sendSupportEmailToAdmin
};

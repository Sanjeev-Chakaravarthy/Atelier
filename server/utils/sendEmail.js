const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

const sendEmail = async (options) => {
  let transporter;

  // Check if SMTP configuration is present in .env
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  } else {
    // Local email simulation (writes an HTML email file in development)
    const emailDir = path.join(__dirname, '../temp-emails');
    if (!fs.existsSync(emailDir)) {
      fs.mkdirSync(emailDir, { recursive: true });
    }

    const cleanEmail = options.email.replace(/[^a-zA-Z0-9]/g, '_');
    const tempFilePath = path.join(emailDir, `reset-${cleanEmail}.html`);

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Password Reset Request</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            background-color: #faf9f5;
            color: #1b1c1a;
            padding: 40px 20px;
            margin: 0;
          }
          .container {
            max-width: 560px;
            margin: 0 auto;
            background-color: #ffffff;
            border: 1px solid rgba(0,0,0,0.08);
            border-radius: 12px;
            padding: 40px;
            box-shadow: 0 4px 16px rgba(0,0,0,0.02);
          }
          .header {
            font-size: 24px;
            font-weight: 700;
            margin-bottom: 20px;
            color: #030304;
            letter-spacing: -0.02em;
          }
          .body {
            font-size: 15px;
            line-height: 1.6;
            color: #5e5e5e;
            margin-bottom: 30px;
          }
          .btn-container {
            margin: 30px 0;
          }
          .btn {
            background-color: #667a52;
            color: #ffffff !important;
            text-decoration: none;
            padding: 12px 24px;
            font-size: 14px;
            font-weight: 600;
            border-radius: 8px;
            display: inline-block;
          }
          .footer {
            font-size: 12px;
            color: rgba(0,0,0,0.4);
            border-top: 1px solid rgba(0,0,0,0.06);
            padding-top: 20px;
            font-family: monospace;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">Atelier</div>
          <div class="body">
            <p>Hello,</p>
            <p>You are receiving this email because a password reset request was submitted for your account.</p>
            <div class="btn-container">
              <a href="${options.resetUrl}" class="btn" target="_blank">Reset Password</a>
            </div>
            <p>If you did not request this reset, please ignore this email and your password will remain unchanged.</p>
          </div>
          <div class="footer">
            © 2026 Atelier Corp. Secure verification token.
          </div>
        </div>
      </body>
      </html>
    `;

    fs.writeFileSync(tempFilePath, htmlContent, 'utf8');
    
    console.log(`\n📬 [EMAIL SIMULATED] Password reset email generated for ${options.email}:`);
    console.log(`👉 Open local email preview to click link: file://${tempFilePath}`);
    console.log(`👉 Directly go to reset link: ${options.resetUrl}\n`);
    
    return { simulated: true, filePath: tempFilePath };
  }

  const mailOptions = {
    from: `"Atelier Productivity" <${process.env.SMTP_FROM || 'noreply@atelier.com'}>`,
    to: options.email,
    subject: 'Atelier — Reset Your Password',
    html: `
      <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
        <h2 style="color: #333;">Reset Password Request</h2>
        <p>Please click on the link below to reset your password. This link is valid for 10 minutes.</p>
        <a href="${options.resetUrl}" style="padding: 12px 24px; background-color: #667a52; color: #fff; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">Reset Password</a>
        <p style="color: #666; font-size: 13px; margin-top: 20px;">If you did not request this, please ignore this email.</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;

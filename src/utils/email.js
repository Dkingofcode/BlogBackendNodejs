const nodemailer = require('nodemailer');
const logger = require('./logger');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  async sendVerificationEmail(email, username, token) {
    const verificationUrl = `${process.env.CLIENT_URL}/verify-email?token=${token}`;

    const mailOptions = {
      from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_FROM}>`,
      to: email,
      subject: 'Verify Your Email Address',
      html: `
        <h1>Welcome ${username}!</h1>
        <p>Please verify your email by clicking the link below:</p>
        <a href="${verificationUrl}" style="padding: 10px 20px; background: #4F46E5; color: white; text-decoration: none; border-radius: 5px; display: inline-block;">
          Verify Email
        </a>
        <p>Or copy this link: ${verificationUrl}</p>
        <p>This link expires in 24 hours.</p>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      logger.info(`Verification email sent to ${email}`);
    } catch (error) {
      logger.error('Send verification email error:', error);
      throw error;
    }
  }

  async sendPasswordResetEmail(email, username, token) {
    const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${token}`;

    const mailOptions = {
      from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_FROM}>`,
      to: email,
      subject: 'Password Reset Request',
      html: `
        <h1>Password Reset</h1>
        <p>Hello ${username},</p>
        <p>You requested to reset your password. Click the link below:</p>
        <a href="${resetUrl}" style="padding: 10px 20px; background: #EF4444; color: white; text-decoration: none; border-radius: 5px; display: inline-block;">
          Reset Password
        </a>
        <p>Or copy this link: ${resetUrl}</p>
        <p>This link expires in 1 hour.</p>
        <p>If you didn't request this, please ignore this email.</p>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      logger.info(`Password reset email sent to ${email}`);
    } catch (error) {
      logger.error('Send password reset email error:', error);
      throw error;
    }
  }
}

module.exports = new EmailService();



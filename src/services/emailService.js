const nodemailer = require('nodemailer');
const HTTP_STATUS = require('../constants/httpCodes');
const RESPONSE_MESSAGES = require('../responses/responses');

// Use console as fallback logger
const logger = {
  info: console.log,
  error: console.error
};

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT) : 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });
  }

  // Core generic email sender
  async sendEmail(to, subject, text, html) {
    try {
      const mailOptions = {
        from: process.env.FROM_EMAIL || process.env.EMAIL_FROM,
        to,
        subject,
        text,
        html,
      };

      await this.transporter.sendMail(mailOptions);
      logger.info(`Email sent to ${to} - Subject: ${subject}`);
      return { success: true };
    } catch (error) {
      logger.error('Email sending error:', error);
      return {
        success: false,
        status: HTTP_STATUS.INTERNAL_SERVER,
        message: RESPONSE_MESSAGES.SERVER_ERROR,
      };
    }
  }

  async sendOTPEmail(email, otp) {
    const subject = 'Your OTP for Account Verification';
    const text = `Your OTP is: ${otp}`;
    const html = `<p>Your OTP is: <strong>${otp}</strong></p>`;
    return this.sendEmail(email, subject, text, html);
  }

  async sendSubscriptionConfirmation(user, subscription) {
    const subject = 'Subscription Confirmation';
    const html = `
      <h2>Welcome to ${subscription.plan.displayName}!</h2>
      <p>Hi ${user.email},</p>
      <p>Your subscription has been successfully activated.</p>
      <p><strong>Plan Details:</strong></p>
      <ul>
        <li>Plan: ${subscription.plan.displayName}</li>
        <li>Credits: ${subscription.creditsTotal}</li>
        <li>Valid until: ${new Date(subscription.endDate).toDateString()}</li>
      </ul>
      <p>Start exploring our design library now!</p>
    `;
    return this.sendEmail(user.email, subject, '', html);
  }

  async sendSubscriptionExpiredNotification(user, subscription) {
    const subject = 'Subscription Expired';
    const html = `
      <h2>Subscription Expired</h2>
      <p>Hi ${user.email},</p>
      <p>Your ${subscription.plan.displayName} subscription has expired.</p>
      <p>Renew your subscription to continue accessing our design library.</p>
      <p><a href="${process.env.FRONTEND_URL}/plans">Renew Subscription</a></p>
    `;
    return this.sendEmail(user.email, subject, '', html);
  }

  async sendLowCreditsWarning(user, subscription) {
    const subject = 'Low Credits Warning';
    const html = `
      <h2>Low Credits Warning</h2>
      <p>Hi ${user.email},</p>
      <p>You have ${subscription.creditsRemaining} credits remaining in your ${subscription.plan.displayName} subscription.</p>
      <p>Consider upgrading your plan to get more credits.</p>
      <p><a href="${process.env.FRONTEND_URL}/plans">Upgrade Plan</a></p>
    `;
    return this.sendEmail(user.email, subject, '', html);
  }
}

module.exports = new EmailService();
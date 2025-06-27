import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

const BRAND_HEADER = '<div style="background:#007bff;color:#fff;padding:16px 24px;font-size:20px;font-weight:bold;">Currency Converter</div>';
const BRAND_FOOTER = '<div style="background:#f8f9fa;color:#333;padding:12px 24px;font-size:12px;">&copy; 2024 Currency Converter</div>';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  async sendMail(to: string, subject: string, text: string, html?: string) {
    try {
      await this.transporter.sendMail({
        from: process.env.SMTP_FROM,
        to,
        subject,
        text,
        html,
      });
      this.logger.log(`Email sent to ${to}`);
    } catch (error) {
      this.logger.error(`Failed to send email to ${to}`, error);
    }
  }

  async sendPasswordReset(email: string, token: string) {
    const url = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
    const html = `${BRAND_HEADER}<div style='padding:24px;font-size:16px;'>
      <p>We received a request to reset your password.</p>
      <p><a href="${url}" style="background:#007bff;color:#fff;padding:10px 18px;text-decoration:none;border-radius:4px;">Reset Password</a></p>
      <p>If you did not request this, you can ignore this email.</p>
    </div>${BRAND_FOOTER}`;
    await this.sendMail(email, 'Password Reset', `Reset your password: ${url}`, html);
  }

  async sendVerification(email: string, token: string) {
    const url = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;
    const html = `${BRAND_HEADER}<div style='padding:24px;font-size:16px;'>
      <p>Welcome! Please verify your email address to activate your account.</p>
      <p><a href="${url}" style="background:#007bff;color:#fff;padding:10px 18px;text-decoration:none;border-radius:4px;">Verify Email</a></p>
    </div>${BRAND_FOOTER}`;
    await this.sendMail(email, 'Verify Email', `Verify your email: ${url}`, html);
  }

  async sendAlert(email: string, message: string) {
    const html = `${BRAND_HEADER}<div style='padding:24px;font-size:16px;'>
      <p>${message}</p>
    </div>${BRAND_FOOTER}`;
    await this.sendMail(email, 'Currency Alert', message, html);
  }
} 
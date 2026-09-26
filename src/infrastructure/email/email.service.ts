import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

import * as dotenv from 'dotenv';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor(private readonly config: ConfigService) {}

  private getTransporter(): nodemailer.Transporter {
    // Reload from .env if variables aren't loaded in older running process
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      dotenv.config();
    }

    const rawUser = this.config.get<string>('SMTP_USER') || process.env.SMTP_USER || '';
    const rawPass = this.config.get<string>('SMTP_PASS') || process.env.SMTP_PASS || '';

    const user = rawUser.trim().replace(/^["']|["']$/g, '');
    const pass = rawPass.trim().replace(/^["']|["']$/g, '').replace(/\s+/g, '');

    const host = this.config.get<string>('SMTP_HOST') || process.env.SMTP_HOST || 'smtp.gmail.com';
    const port = Number(this.config.get<number>('SMTP_PORT') || process.env.SMTP_PORT || 587);
    const secure = (this.config.get<string>('SMTP_SECURE') || process.env.SMTP_SECURE || 'false') === 'true';

    return nodemailer.createTransport({
      host,
      port,
      secure,
      auth: user && pass ? { user, pass } : undefined,
    });
  }

  async sendPasswordResetEmail(to: string, resetLink: string): Promise<void> {
    const fromAddress =
      this.config.get<string>('SMTP_FROM') ||
      process.env.SMTP_FROM ||
      'EGMS Portal <noreply@egms.app>';

    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Password</title>
</head>
<body style="margin:0;padding:0;background:#0f172a;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0f172a;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:linear-gradient(135deg,#1e293b 0%,#0f172a 100%);border-radius:16px;border:1px solid rgba(99,102,241,0.2);overflow:hidden;">
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#6366f1 0%,#8b5cf6 100%);padding:32px;text-align:center;">
              <div style="background:rgba(255,255,255,0.15);display:inline-block;padding:12px 16px;border-radius:12px;margin-bottom:16px;">
                <span style="font-size:28px;">⚡</span>
              </div>
              <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:700;letter-spacing:-0.5px;">EGMS Portal</h1>
              <p style="margin:6px 0 0;color:rgba(255,255,255,0.75);font-size:13px;">Electric Garage Management System</p>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:36px 40px;">
              <h2 style="margin:0 0 12px;color:#f8fafc;font-size:22px;font-weight:700;">Reset Your Password</h2>
              <p style="margin:0 0 24px;color:#94a3b8;font-size:15px;line-height:1.6;">
                We received a request to reset the password for your EGMS account associated with <strong style="color:#a5b4fc;">${to}</strong>.
                Click the button below to set a new password. This link will expire in <strong style="color:#f59e0b;">1 hour</strong>.
              </p>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding:8px 0 28px;">
                    <a href="${resetLink}" style="display:inline-block;background:linear-gradient(135deg,#6366f1 0%,#8b5cf6 100%);color:#ffffff;text-decoration:none;font-size:16px;font-weight:600;padding:14px 36px;border-radius:10px;letter-spacing:0.3px;">
                      🔐 Reset My Password
                    </a>
                  </td>
                </tr>
              </table>
              <div style="background:rgba(99,102,241,0.08);border:1px solid rgba(99,102,241,0.15);border-radius:10px;padding:16px 20px;margin-bottom:24px;">
                <p style="margin:0 0 8px;color:#64748b;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:1px;">Or copy this link</p>
                <p style="margin:0;color:#818cf8;font-size:12px;word-break:break-all;">${resetLink}</p>
              </div>
              <p style="margin:0;color:#64748b;font-size:13px;line-height:1.5;">
                If you did not request a password reset, you can safely ignore this email. Your account remains secure.
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="border-top:1px solid rgba(99,102,241,0.1);padding:20px 40px;text-align:center;">
              <p style="margin:0;color:#475569;font-size:12px;">
                © ${new Date().getFullYear()} EGMS Portal. This is an automated message — please do not reply.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

    try {
      const transporter = this.getTransporter();
      await transporter.sendMail({
        from: fromAddress,
        to,
        subject: '🔐 Reset Your EGMS Password',
        html,
      });
      this.logger.log(`[EMAIL] Password reset email sent to ${to}`);
    } catch (err: any) {
      this.logger.error(`[EMAIL] Failed to send password reset email to ${to}: ${err.message}`);
      // Log the reset link so development works without SMTP configured
      this.logger.warn(`[EMAIL DEV FALLBACK] Reset link for ${to}: ${resetLink}`);
    }
  }

  async sendWelcomeEmail(to: string, companyName: string): Promise<void> {
    const fromAddress =
      this.config.get<string>('SMTP_FROM') ||
      process.env.SMTP_FROM ||
      'EGMS Portal <noreply@egms.app>';
    const appUrl =
      this.config.get<string>('APP_URL') ||
      process.env.APP_URL ||
      'https://localhost:3000';

    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Welcome to EGMS Portal</title>
</head>
<body style="margin:0;padding:0;background:#0f172a;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0f172a;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:linear-gradient(135deg,#1e293b 0%,#0f172a 100%);border-radius:16px;border:1px solid rgba(16,185,129,0.2);overflow:hidden;">
          <tr>
            <td style="background:linear-gradient(135deg,#059669 0%,#10b981 100%);padding:32px;text-align:center;">
              <div style="background:rgba(255,255,255,0.15);display:inline-block;padding:12px 16px;border-radius:12px;margin-bottom:16px;">
                <span style="font-size:28px;">⚡</span>
              </div>
              <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:700;">Welcome to EGMS!</h1>
              <p style="margin:6px 0 0;color:rgba(255,255,255,0.75);font-size:13px;">Your electric garage management portal is ready</p>
            </td>
          </tr>
          <tr>
            <td style="padding:36px 40px;">
              <h2 style="margin:0 0 12px;color:#f8fafc;font-size:20px;font-weight:700;">Hello, ${companyName}! 🎉</h2>
              <p style="margin:0 0 24px;color:#94a3b8;font-size:15px;line-height:1.6;">
                Your company account has been created successfully. You can now manage your customers, generate electric bills, and track financial metrics — all in one place.
              </p>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <div style="background:rgba(16,185,129,0.08);border:1px solid rgba(16,185,129,0.2);border-radius:10px;padding:20px;">
                      <p style="margin:0 0 12px;color:#10b981;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:1px;">Quick Start Guide</p>
                      <p style="margin:0 0 8px;color:#94a3b8;font-size:14px;">✅ Add your first customer from the Customers section</p>
                      <p style="margin:0 0 8px;color:#94a3b8;font-size:14px;">✅ Generate your first electric bill with the live calculator</p>
                      <p style="margin:0;color:#94a3b8;font-size:14px;">✅ Monitor financials on your Executive Dashboard</p>
                    </div>
                  </td>
                </tr>
              </table>
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:28px;">
                <tr>
                  <td align="center">
                    <a href="${appUrl}" style="display:inline-block;background:linear-gradient(135deg,#059669 0%,#10b981 100%);color:#ffffff;text-decoration:none;font-size:16px;font-weight:600;padding:14px 36px;border-radius:10px;">
                      🚀 Go to Dashboard
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="border-top:1px solid rgba(16,185,129,0.1);padding:20px 40px;text-align:center;">
              <p style="margin:0;color:#475569;font-size:12px;">© ${new Date().getFullYear()} EGMS Portal — Electric Garage Management System</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

    try {
      const transporter = this.getTransporter();
      await transporter.sendMail({
        from: fromAddress,
        to,
        subject: '🎉 Welcome to EGMS Portal!',
        html,
      });
      this.logger.log(`[EMAIL] Welcome email sent to ${to}`);
    } catch (err: any) {
      this.logger.error(`[EMAIL] Failed to send welcome email to ${to}: ${err.message}`);
    }
  }
}

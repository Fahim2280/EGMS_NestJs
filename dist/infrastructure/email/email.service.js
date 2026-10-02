"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var EmailService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
let EmailService = EmailService_1 = class EmailService {
    config;
    logger = new common_1.Logger(EmailService_1.name);
    constructor(config) {
        this.config = config;
    }
    async onModuleInit() {
        const rawUser = this.config.get('SMTP_USER') || process.env.SMTP_USER || '';
        const rawPass = this.config.get('SMTP_PASS') || process.env.SMTP_PASS || '';
        const host = this.config.get('SMTP_HOST') || process.env.SMTP_HOST || 'smtp.gmail.com';
        const port = Number(this.config.get('SMTP_PORT') || process.env.SMTP_PORT || 587);
        if (!rawUser || !rawPass) {
            this.logger.warn(`⚠️ [EMAIL] SMTP_USER or SMTP_PASS is NOT configured! Outgoing emails will NOT be sent.`);
            return;
        }
        try {
            const transporter = this.getTransporter();
            await transporter.verify();
            this.logger.log(`✅ [EMAIL] SMTP connection verified successfully with ${host}:${port} for ${rawUser}`);
        }
        catch (err) {
            this.logger.error(`❌ [EMAIL] SMTP verification failed with ${host}:${port}: ${err.message}`);
            if (err.message?.includes('535') || err.message?.includes('Username and Password not accepted')) {
                this.logger.error(`💡 [EMAIL HINT] Gmail requires an App Password (16 chars with 2-Step Verification). Normal account password will be rejected.`);
            }
            else if (err.code === 'ETIMEDOUT' || err.code === 'ECONNREFUSED') {
                this.logger.error(`💡 [EMAIL HINT] Port ${port} may be blocked by your VPS hosting firewall. Try port 465 with SMTP_SECURE=true or open port ${port}.`);
            }
        }
    }
    getTransporter() {
        if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
            dotenv.config();
        }
        const rawUser = this.config.get('SMTP_USER') || process.env.SMTP_USER || '';
        const rawPass = this.config.get('SMTP_PASS') || process.env.SMTP_PASS || '';
        const user = rawUser.trim().replace(/^["']|["']$/g, '');
        const pass = rawPass.trim().replace(/^["']|["']$/g, '').replace(/\s+/g, '');
        const host = this.config.get('SMTP_HOST') || process.env.SMTP_HOST || 'smtp.gmail.com';
        const port = Number(this.config.get('SMTP_PORT') || process.env.SMTP_PORT || 587);
        const secure = (this.config.get('SMTP_SECURE') || process.env.SMTP_SECURE || 'false') === 'true' ||
            port === 465;
        return nodemailer.createTransport({
            host,
            port,
            secure,
            auth: user && pass ? { user, pass } : undefined,
            tls: {
                rejectUnauthorized: false,
            },
            connectionTimeout: 10000,
            greetingTimeout: 10000,
            socketTimeout: 15000,
        });
    }
    async testSmtpConnection() {
        const rawUser = this.config.get('SMTP_USER') || process.env.SMTP_USER || '';
        const rawPass = this.config.get('SMTP_PASS') || process.env.SMTP_PASS || '';
        const host = this.config.get('SMTP_HOST') || process.env.SMTP_HOST || 'smtp.gmail.com';
        const port = Number(this.config.get('SMTP_PORT') || process.env.SMTP_PORT || 587);
        const secure = (this.config.get('SMTP_SECURE') || process.env.SMTP_SECURE || 'false') === 'true' ||
            port === 465;
        const maskedPass = rawPass ? `${rawPass.substring(0, 3)}••••••••${rawPass.slice(-3)}` : '(not set)';
        const configSummary = {
            host,
            port,
            secure,
            user: rawUser || '(not set)',
            password: maskedPass,
        };
        if (!rawUser || !rawPass) {
            return {
                success: false,
                config: configSummary,
                message: 'SMTP_USER or SMTP_PASS is missing or empty in environment.',
            };
        }
        try {
            const transporter = this.getTransporter();
            await transporter.verify();
            const adminEmail = this.config.get('ADMIN_APPROVAL_EMAIL') ||
                process.env.ADMIN_APPROVAL_EMAIL ||
                'kfahim2280@gmail.com';
            const from = this.getFromAddress();
            const sendResult = await transporter.sendMail({
                from,
                to: adminEmail,
                subject: '🧪 [TEST EMAIL] EGMS Portal SMTP Test',
                text: `This is a test email sent from EGMS Portal via ${host}:${port} at ${new Date().toISOString()}.`,
                html: `<div style="font-family:sans-serif;padding:20px;background:#f8fafc;border-radius:10px;">
          <h2 style="color:#059669;">✅ EGMS SMTP is Working!</h2>
          <p>This test email was successfully dispatched from <strong>${from}</strong> to <strong>${adminEmail}</strong>.</p>
          <p style="color:#64748b;font-size:12px;">Timestamp: ${new Date().toLocaleString('en-BD', { timeZone: 'Asia/Dhaka' })}</p>
        </div>`,
            });
            return {
                success: true,
                config: configSummary,
                message: `SMTP verified AND test email dispatched to ${adminEmail}! MessageId: ${sendResult.messageId}. Response: ${sendResult.response}`,
            };
        }
        catch (err) {
            return {
                success: false,
                config: configSummary,
                message: err.message || String(err),
            };
        }
    }
    getFromAddress() {
        const rawFrom = this.config.get('SMTP_FROM') ||
            process.env.SMTP_FROM ||
            '';
        const userEmail = this.config.get('SMTP_USER') ||
            process.env.SMTP_USER ||
            'noreply@egms.shop';
        const trimmed = rawFrom.trim();
        if (!trimmed) {
            return `EGMS Portal <${userEmail}>`;
        }
        if (trimmed.includes('@')) {
            return trimmed;
        }
        return `"${trimmed}" <${userEmail}>`;
    }
    async sendPasswordResetEmail(to, resetLink) {
        const fromAddress = this.getFromAddress();
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
        }
        catch (err) {
            this.logger.error(`[EMAIL] Failed to send password reset email to ${to}: ${err.message}`);
            this.logger.warn(`[EMAIL DEV FALLBACK] Reset link for ${to}: ${resetLink}`);
        }
    }
    async sendWelcomeEmail(to, companyName) {
        const fromAddress = this.getFromAddress();
        const appUrl = this.config.get('APP_URL') ||
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
        }
        catch (err) {
            this.logger.error(`[EMAIL] Failed to send welcome email to ${to}: ${err.message}`);
        }
    }
    async sendCompanyApprovalRequestEmail(to, companyName, companyEmail, approveUrl, rejectUrl) {
        const fromAddress = this.getFromAddress();
        const registeredAt = new Date().toLocaleString('en-BD', {
            timeZone: 'Asia/Dhaka',
            dateStyle: 'full',
            timeStyle: 'short',
        });
        const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Company Registration Approval</title>
</head>
<body style="margin:0;padding:0;background:#0f172a;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0f172a;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:linear-gradient(135deg,#1e293b 0%,#0f172a 100%);border-radius:16px;border:1px solid rgba(245,158,11,0.25);overflow:hidden;">
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#b45309 0%,#f59e0b 100%);padding:32px;text-align:center;">
              <div style="background:rgba(255,255,255,0.15);display:inline-block;padding:12px 16px;border-radius:12px;margin-bottom:16px;">
                <span style="font-size:28px;">🏢</span>
              </div>
              <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:700;letter-spacing:-0.5px;">New Company Registration</h1>
              <p style="margin:6px 0 0;color:rgba(255,255,255,0.8);font-size:13px;">Approval Required — EGMS Admin Panel</p>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:36px 40px;">
              <p style="margin:0 0 20px;color:#94a3b8;font-size:15px;line-height:1.6;">
                A new company has requested to register on the <strong style="color:#fbbf24;">EGMS Portal</strong>. Please review the details below and approve or reject this registration.
              </p>
              <!-- Company Details Card -->
              <div style="background:rgba(245,158,11,0.07);border:1px solid rgba(245,158,11,0.2);border-radius:12px;padding:20px 24px;margin-bottom:28px;">
                <p style="margin:0 0 4px;color:#f59e0b;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1.2px;">Company Details</p>
                <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:12px;">
                  <tr>
                    <td style="padding:6px 0;color:#64748b;font-size:13px;width:120px;">Company Name</td>
                    <td style="padding:6px 0;color:#f1f5f9;font-size:14px;font-weight:600;">${companyName}</td>
                  </tr>
                  <tr>
                    <td style="padding:6px 0;color:#64748b;font-size:13px;">Email</td>
                    <td style="padding:6px 0;color:#a5b4fc;font-size:14px;">${companyEmail}</td>
                  </tr>
                  <tr>
                    <td style="padding:6px 0;color:#64748b;font-size:13px;">Registered</td>
                    <td style="padding:6px 0;color:#94a3b8;font-size:13px;">${registeredAt}</td>
                  </tr>
                </table>
              </div>
              <!-- Action Buttons -->
              <p style="margin:0 0 16px;color:#94a3b8;font-size:14px;">Click one of the buttons below to take action. Each link can only be used <strong style="color:#fbbf24;">once</strong> and will expire in <strong style="color:#fbbf24;">48 hours</strong>.</p>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding:0 8px 0 0;">
                    <a href="${approveUrl}" style="display:inline-block;background:linear-gradient(135deg,#059669 0%,#10b981 100%);color:#ffffff;text-decoration:none;font-size:15px;font-weight:700;padding:14px 32px;border-radius:10px;letter-spacing:0.3px;">
                      ✅ Approve Company
                    </a>
                  </td>
                  <td align="center" style="padding:0 0 0 8px;">
                    <a href="${rejectUrl}" style="display:inline-block;background:linear-gradient(135deg,#dc2626 0%,#ef4444 100%);color:#ffffff;text-decoration:none;font-size:15px;font-weight:700;padding:14px 32px;border-radius:10px;letter-spacing:0.3px;">
                      ❌ Reject & Delete
                    </a>
                  </td>
                </tr>
              </table>
              <!-- Warning -->
              <div style="background:rgba(239,68,68,0.07);border:1px solid rgba(239,68,68,0.2);border-radius:10px;padding:14px 18px;margin-top:28px;">
                <p style="margin:0;color:#fca5a5;font-size:12px;line-height:1.6;">
                  ⚠️ <strong>Rejecting</strong> will permanently delete the company and all associated data. This action cannot be undone.
                </p>
              </div>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="border-top:1px solid rgba(245,158,11,0.1);padding:20px 40px;text-align:center;">
              <p style="margin:0;color:#475569;font-size:12px;">
                © ${new Date().getFullYear()} EGMS Portal — This is an automated admin notification. Do not reply to this email.
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
                subject: `🏢 [ACTION REQUIRED] New Company Registration: ${companyName}`,
                html,
            });
            this.logger.log(`[EMAIL] Approval request email sent to admin for company '${companyName}'`);
        }
        catch (err) {
            this.logger.error(`[EMAIL] Failed to send approval request email: ${err.message}`);
            this.logger.warn(`[EMAIL DEV FALLBACK] Approve: ${approveUrl} | Reject: ${rejectUrl}`);
        }
    }
};
exports.EmailService = EmailService;
exports.EmailService = EmailService = EmailService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], EmailService);
//# sourceMappingURL=email.service.js.map
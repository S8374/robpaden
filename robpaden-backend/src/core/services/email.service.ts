import nodemailer from "nodemailer";
import { AppLogger } from "@/core/logging/logger";

export class EmailService {
  private logger = new AppLogger("EmailService");
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST || "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASSWORD,
      },
    });
  }

  public async sendWelcomeEmail(
    toEmail: string,
    name: string,
    role: string,
    rawPassword: string,
    companyId?: number | null,
    companyName?: string,
    companyLogo?: string
  ): Promise<boolean> {
    try {
      const frontendLink = process.env.FRONTEND_LINK || "http://localhost:3000";
      const queryParams = companyId ? `?officeId=${companyId}` : '';
      const loginUrl = `${frontendLink}${queryParams}`;
      const senderName = process.env.MAIL_FROM_NAME || "Robpaden";
      const senderEmail = process.env.MAIL_FROM || process.env.MAIL_USER;

      const isAgent = role === "AGENT";
      const agentUrl = `${frontendLink}/tv/1`;
      const finalUrl = isAgent ? agentUrl : loginUrl;
      const buttonText = isAgent ? "See Leader Board" : "Log In to Dashboard";

      const credentialsBlock = isAgent ? "" : `
        <p>Here are your temporary login credentials:</p>
        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p style="margin: 0 0 10px 0;"><strong>Email:</strong> ${toEmail}</p>
          <p style="margin: 0;"><strong>Password:</strong> ${rawPassword}</p>
        </div>
        <p style="color: #555;">Please click the button below to log in to your account. We highly recommend changing your password after your first login.</p>
      `;

      const actionMessage = isAgent 
        ? `<p style="color: #555;">Please click the button below to access your sales portal.</p>`
        : credentialsBlock;

      const mailOptions = {
        from: `"${senderName}" <${senderEmail}>`,
        to: toEmail,
        subject: `Welcome to ${companyName || 'Robpaden'}! Your ${role} account has been created`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 30px; border: 1px solid #eaeaea; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); background-color: #ffffff;">
            <div style="text-align: center; margin-bottom: 20px;">
              ${companyLogo ? `<img src="${companyLogo}" alt="${companyName} Logo" style="max-height: 100px; object-fit: contain;" />` : `<div style="background-color: #5252ff; color: white; display: inline-block; width: 60px; height: 60px; border-radius: 30px; line-height: 60px; font-size: 28px; font-weight: bold;">${(companyName || 'R').charAt(0).toUpperCase()}</div>`}
            </div>
            <h2 style="text-align: center; color: #333;">Welcome to ${companyName || 'Robpaden'}, ${name}!</h2>
            <p style="color: #555; text-align: center; font-size: 16px;">An administrator has created a <strong>${role}</strong> account for you.</p>
            ${actionMessage}
            <div style="text-align: center; margin: 30px 0;">
              <a href="${finalUrl}" style="background-color: #5252ff; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px; display: inline-block;">
                ${buttonText}
              </a>
            </div>
            <p style="color: #777; font-size: 14px;">Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #5252ff; font-size: 13px;">${finalUrl}</p>
            <hr style="border: 1px solid #eee; margin-top: 40px; margin-bottom: 20px;" />
            <p style="font-size: 12px; color: #aaa; text-align: center;">If you didn't expect this email, please contact your administrator.</p>
          </div>
        `,
      };

      await this.transporter.sendMail(mailOptions);
      this.logger.info(`Welcome email sent successfully to ${toEmail}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to send welcome email to ${toEmail}`, error);
      return false;
    }
  }
  public async sendDailyReportEmail(
    toEmails: string[],
    companyName: string,
    managerName: string,
    summary: any,
    agents: any[],
    companyLogo?: string,
    csvContent?: string
  ): Promise<boolean> {
    try {
      const senderName = process.env.MAIL_FROM_NAME || "Robpaden Reports";
      const senderEmail = process.env.MAIL_FROM || process.env.MAIL_USER;
      const dateStr = new Date().toLocaleDateString("en-US", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

      const teamTotal = summary.teamTotal || 0;
      const activeAgents = summary.activeAgents || 0;

      const agentRows = agents.map((agent: any) => `
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #eee;"><strong>${agent.name}</strong></td>
          <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: center;">${agent.daily}</td>
          <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: center;">${agent.weekly}</td>
          <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: center;">#${agent.dailyRank}</td>
        </tr>
      `).join('');

      const attachments = csvContent ? [
        {
          filename: `robpaden_report_${new Date().toISOString().split('T')[0]}.csv`,
          content: csvContent
        }
      ] : undefined;

      const mailOptions = {
        from: `"${senderName}" <${senderEmail}>`,
        to: toEmails.join(','),
        subject: `[Robpaden] Daily Sales Report - ${companyName} (${dateStr})`,
        attachments,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 650px; margin: 0 auto; background-color: #f9f9f9; padding: 20px;">
            <div style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.05);">
              
              <!-- Header -->
              <div style="background-color: #5252ff; color: #ffffff; padding: 30px 20px; text-align: center;">
                <h1 style="margin: 0; font-size: 24px; font-weight: normal;">Daily Sales Report</h1>
                <p style="margin: 10px 0 0 0; opacity: 0.9; font-size: 14px;">${dateStr}</p>
              </div>

              <div style="padding: 30px;">
                <!-- Meta Info -->
                <div style="margin-bottom: 25px;">
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td width="50%">
                        <p style="margin: 0; color: #777; font-size: 12px; text-transform: uppercase;">Company</p>
                        <p style="margin: 4px 0 0 0; color: #333; font-weight: bold; font-size: 16px;">${companyName}</p>
                      </td>
                      <td width="50%" style="text-align: right;">
                        <p style="margin: 0; color: #777; font-size: 12px; text-transform: uppercase;">Manager</p>
                        <p style="margin: 4px 0 0 0; color: #333; font-weight: bold; font-size: 16px;">${managerName}</p>
                      </td>
                    </tr>
                  </table>
                </div>

                <!-- Summary Cards -->
                <div style="background-color: #f5f5ff; border-radius: 6px; padding: 20px; margin-bottom: 30px;">
                  <h3 style="margin: 0 0 15px 0; color: #5252ff; font-size: 14px; text-transform: uppercase;">Performance Summary</h3>
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td width="50%">
                        <p style="margin: 0; color: #555; font-size: 13px;">Team Total Sales</p>
                        <p style="margin: 5px 0 0 0; color: #111; font-weight: bold; font-size: 28px;">${teamTotal}</p>
                      </td>
                      <td width="50%">
                        <p style="margin: 0; color: #555; font-size: 13px;">Active Agents</p>
                        <p style="margin: 5px 0 0 0; color: #111; font-weight: bold; font-size: 28px;">${activeAgents}</p>
                      </td>
                    </tr>
                  </table>
                </div>

                <!-- Agent Table -->
                <h3 style="margin: 0 0 15px 0; color: #333; font-size: 16px;">Agent Breakdown</h3>
                <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse; font-size: 14px; text-align: left;">
                  <thead>
                    <tr style="background-color: #f0f0f0;">
                      <th style="padding: 12px; color: #555; border-bottom: 2px solid #ddd;">Agent Name</th>
                      <th style="padding: 12px; color: #555; border-bottom: 2px solid #ddd; text-align: center;">Daily</th>
                      <th style="padding: 12px; color: #555; border-bottom: 2px solid #ddd; text-align: center;">Weekly</th>
                      <th style="padding: 12px; color: #555; border-bottom: 2px solid #ddd; text-align: center;">Rank</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${agentRows || `<tr><td colspan="4" style="padding: 20px; text-align: center; color: #888;">No agents found</td></tr>`}
                  </tbody>
                </table>

              </div>
              
              <!-- Footer -->
              <div style="background-color: #f0f0f0; padding: 20px; text-align: center; color: #888; font-size: 12px;">
                <p style="margin: 0;">Powered by <strong>Robpaden</strong> Call Center Platform</p>
                <p style="margin: 5px 0 0 0;">This is an automated report. Do not reply to this email.</p>
              </div>
            </div>
          </div>
        `
      };

      await this.transporter.sendMail(mailOptions);
      this.logger.info(`Daily Report email sent successfully to ${toEmails.length} recipients`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to send Daily Report email`, error);
      return false;
    }
  }

  public async sendPasswordResetOtp(
    toEmail: string,
    otp: string,
    name: string
  ): Promise<boolean> {
    try {
      const senderName = process.env.MAIL_FROM_NAME || "Robpaden Security";
      const senderEmail = process.env.MAIL_FROM || process.env.MAIL_USER;

      const mailOptions = {
        from: `"${senderName}" <${senderEmail}>`,
        to: toEmail,
        subject: `Password Reset Verification Code`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 30px; border: 1px solid #eaeaea; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); background-color: #ffffff;">
            <div style="text-align: center; margin-bottom: 20px;">
              <div style="background-color: #5252ff; color: white; display: inline-block; width: 60px; height: 60px; border-radius: 30px; line-height: 60px; font-size: 28px; font-weight: bold;">R</div>
            </div>
            <h2 style="text-align: center; color: #333;">Password Reset Request</h2>
            <p style="color: #555; text-align: center; font-size: 16px;">Hi ${name},</p>
            <p style="color: #555; text-align: center; font-size: 16px;">We received a request to reset your password. Use the verification code below to complete the process.</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <div style="background-color: #f5f5ff; border: 1px dashed #5252ff; color: #5252ff; padding: 15px 30px; border-radius: 8px; font-weight: bold; font-size: 32px; letter-spacing: 5px; display: inline-block;">
                ${otp}
              </div>
            </div>
            
            <p style="color: #777; font-size: 14px; text-align: center;">This code will expire in 15 minutes.</p>
            
            <hr style="border: 1px solid #eee; margin-top: 40px; margin-bottom: 20px;" />
            <p style="font-size: 12px; color: #aaa; text-align: center;">If you didn't request a password reset, you can safely ignore this email. Your password will not change.</p>
          </div>
        `,
      };

      await this.transporter.sendMail(mailOptions);
      this.logger.info(`Password reset OTP sent to ${toEmail}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to send password reset OTP to ${toEmail}`, error);
      return false;
    }
  }

  public async sendManagerNewAgentNotification(
    managerEmail: string,
    managerName: string,
    agentName: string,
    agentEmail: string
  ): Promise<boolean> {
    try {
      const senderName = process.env.MAIL_FROM_NAME || "Robpaden System";
      const senderEmail = process.env.MAIL_FROM || process.env.MAIL_USER;
      const frontendLink = process.env.FRONTEND_LINK || "http://localhost:3000";
      const loginUrl = `${frontendLink}/dashboard`;

      const mailOptions = {
        from: `"${senderName}" <${senderEmail}>`,
        to: managerEmail,
        subject: `New Agent Assigned to Your Team`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 30px; border: 1px solid #eaeaea; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); background-color: #ffffff;">
            <div style="text-align: center; margin-bottom: 20px;">
              <div style="background-color: #5252ff; color: white; display: inline-block; width: 60px; height: 60px; border-radius: 30px; line-height: 60px; font-size: 28px; font-weight: bold;">R</div>
            </div>
            <h2 style="text-align: center; color: #333;">New Agent Assigned</h2>
            <p style="color: #555; text-align: center; font-size: 16px;">Hi ${managerName},</p>
            <p style="color: #555; text-align: center; font-size: 16px;">An administrator has just assigned a new agent to your team.</p>
            
            <div style="background-color: #f5f5ff; padding: 15px; border-radius: 5px; margin: 20px 0; border: 1px solid #e0e0ff;">
              <p style="margin: 0 0 10px 0; color: #333;"><strong>Agent Name:</strong> ${agentName}</p>
              <p style="margin: 0; color: #333;"><strong>Agent Email:</strong> ${agentEmail}</p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${loginUrl}" style="background-color: #5252ff; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px; display: inline-block;">
                Log In to Dashboard
              </a>
            </div>
            
            <hr style="border: 1px solid #eee; margin-top: 40px; margin-bottom: 20px;" />
            <p style="font-size: 12px; color: #aaa; text-align: center;">This is an automated notification. Do not reply to this email.</p>
          </div>
        `,
      };

      await this.transporter.sendMail(mailOptions);
      this.logger.info(`New agent notification sent to manager ${managerEmail}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to send new agent notification to ${managerEmail}`, error);
      return false;
    }
  }
}

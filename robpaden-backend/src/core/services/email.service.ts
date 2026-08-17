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
}

import { Request, Response } from "express";
import { ReportService } from "./report.service";

export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  public async getReportSummary(req: Request, res: Response) {
    try {
      const managerId = req.user!.userId;
      const { range, customStart, customEnd } = req.query;
      const summary = await this.reportService.getReportSummary(managerId, range as string || 'today', customStart as string, customEnd as string);
      res.json({ success: true, data: summary });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  public async getSalesByAgent(req: Request, res: Response) {
    try {
      const managerId = req.user!.userId;
      const { range, customStart, customEnd } = req.query;
      const agents = await this.reportService.getSalesByAgent(managerId, range as string || 'today', customStart as string, customEnd as string);
      res.json({ success: true, data: agents });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  public async getSalesEntryHistory(req: Request, res: Response) {
    try {
      const managerId = req.user!.userId;
      const { range, customStart, customEnd } = req.query;
      const history = await this.reportService.getSalesEntryHistory(managerId, range as string || 'today', customStart as string, customEnd as string);
      res.json({ success: true, data: history });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  public async getRecipients(req: Request, res: Response) {
    try {
      const managerId = req.user!.userId;
      const recipients = await this.reportService.getRecipients(managerId);
      res.json({ success: true, data: recipients });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  public async addRecipient(req: Request, res: Response) {
    try {
      const managerId = req.user!.userId;
      const { email } = req.body;
      if (!email) throw new Error("Email is required");
      const recipient = await this.reportService.addRecipient(managerId, email);
      res.json({ success: true, data: recipient });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  public async removeRecipient(req: Request, res: Response) {
    try {
      const managerId = req.user!.userId;
      const { email } = req.body; // or from params if we prefer, but let's use body
      if (!email) throw new Error("Email is required");
      await this.reportService.removeRecipient(managerId, email);
      res.json({ success: true, message: "Removed successfully" });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  public async getReportHistory(req: Request, res: Response) {
    try {
      const managerId = req.user!.userId;
      const history = await this.reportService.getReportHistory(managerId);
      res.json({ success: true, data: history });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  public async generateAndEmailReport(req: Request, res: Response) {
    try {
      const managerId = req.user!.userId;
      const report = await this.reportService.generateAndEmailReport(managerId);
      res.json({ success: true, data: report });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  public async toggleReportGeneration(req: Request, res: Response) {
    try {
      const managerId = req.user!.userId;
      const { isActive } = req.body;
      const result = await this.reportService.toggleReportGeneration(managerId, isActive);
      res.json({ success: true, data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }
}

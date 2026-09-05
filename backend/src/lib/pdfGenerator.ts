import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

interface ExportPdfParams {
  agents: { name: string, daily: number, weekly: number, dailyRank: number, weeklyRank: number, corrections?: string }[];
  summary: { teamTotal: number, activeAgents: number } | null | undefined;
  monthlyGoal: number;
  companyName: string;
  managerName: string;
  activeTab: string; // e.g., 'Today'
}

export const generateReportPdfBuffer = ({
  agents,
  summary,
  monthlyGoal,
  companyName,
  managerName,
  activeTab,
}: ExportPdfParams): Buffer => {
  if (!agents || agents.length === 0) {
    throw new Error("No data available to export.");
  }

  const teamTotal = summary?.teamTotal || 0;
  const remainingToGoal = Math.max(0, monthlyGoal - teamTotal);

  const doc = new jsPDF();
  
  // Theme Colors
  const primaryColor: [number, number, number] = [82, 82, 255]; // #5252ff
  
  // Header
  doc.setFontSize(22);
  doc.setTextColor(...primaryColor);
  doc.text("ROBPADEN SALES REPORT", 14, 20);
  
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(`Office / Company: ${companyName}`, 14, 30);
  doc.text(`Manager: ${managerName}`, 14, 35);
  doc.text(`Report Period: ${activeTab}`, 14, 40);
  doc.text(`Date Generated: ${new Date().toLocaleString()}`, 14, 45);

  // Summary Box
  doc.setDrawColor(...primaryColor);
  doc.setFillColor(245, 245, 255);
  doc.roundedRect(14, 55, 182, 25, 3, 3, "FD");
  
  doc.setFontSize(10);
  doc.setTextColor(50, 50, 50);
  doc.text("PERFORMANCE SUMMARY", 18, 62);
  
  doc.setFontSize(12);
  doc.setTextColor(...primaryColor);
  doc.text(`Total Sales: ${teamTotal}`, 18, 72);
  
  doc.setTextColor(50, 50, 50);
  doc.text(`Agents: ${summary?.activeAgents || 0}`, 70, 72);
  doc.text(`Goal: ${monthlyGoal}`, 110, 72);
  doc.text(`Remaining: ${remainingToGoal}`, 150, 72);

  // Agents Table
  const tableColumn = ["Agent Name", "Daily Sales", "Weekly Sales", "Daily Rank", "Weekly Rank", "Corrections"];
  const tableRows = agents.map((agent) => [
    agent.name,
    agent.daily,
    agent.weekly,
    `#${agent.dailyRank}`,
    `#${agent.weeklyRank}`,
    agent.corrections || "None"
  ]);

  autoTable(doc, {
    head: [tableColumn],
    body: tableRows,
    startY: 90,
    theme: 'grid',
    headStyles: { fillColor: primaryColor, textColor: 255, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [249, 250, 251] },
    styles: { fontSize: 9, cellPadding: 4 },
  });

  // Export as Buffer
  const arrayBuffer = doc.output('arraybuffer');
  return Buffer.from(arrayBuffer);
};

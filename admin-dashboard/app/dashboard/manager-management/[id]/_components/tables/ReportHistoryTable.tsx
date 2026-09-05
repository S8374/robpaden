"use client";

import React, { useState } from "react";
import { exportReportPdf } from "@/lib/utils/exportReportPdf";
import { Download, Loader2 } from "lucide-react";

interface ReportHistoryTableProps {
  reportHistory?: any[];
  managerId: number;
}

export function ReportHistoryTable({ reportHistory, managerId }: ReportHistoryTableProps) {
  const data = React.useMemo(() => {
    if (!reportHistory) return [];
    const uniqueDates = new Set();
    return reportHistory.filter((report) => {
      try {
        const dateStr = new Date(report.date).toISOString().split('T')[0];
        if (uniqueDates.has(dateStr)) {
          return false;
        }
        uniqueDates.add(dateStr);
        return true;
      } catch (e) {
        return true;
      }
    });
  }, [reportHistory]);

  const [downloadingId, setDownloadingId] = useState<number | null>(null);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatRecipients = (sentToStr: string) => {
    try {
      const parsed = JSON.parse(sentToStr);
      if (Array.isArray(parsed)) {
        return parsed.join(", ");
      }
    } catch (e) {
      // not a json string, fallback to original
    }
    return sentToStr;
  };

  const handleDownload = async (reportId: number, dateStr: string) => {
    try {
      setDownloadingId(reportId);
      const formattedDate = new Date(dateStr).toISOString().split('T')[0]; // YYYY-MM-DD
      const token = localStorage.getItem("adminToken");
      
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/v1/users/${managerId}/report-snapshot?date=${formattedDate}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (!res.ok) throw new Error("Failed to fetch report snapshot");
      
      const result = await res.json();
      const payload = result.data;

      // Extract custom formatted date string for PDF title
      const d = new Date(dateStr);
      const activeTabLabel = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });

      exportReportPdf({
        agents: payload.agents,
        summary: payload.summary,
        monthlyGoal: payload.monthlyGoal,
        companyName: payload.companyName,
        managerName: payload.managerName,
        activeTab: activeTabLabel
      });

    } catch (error) {
      console.error(error);
      alert("Error generating PDF. Please try again.");
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-zinc-200 overflow-hidden mt-6">
      <div className="p-5 border-b border-zinc-100 flex items-center justify-between">
        <h3 className="font-bold text-zinc-900">Report History</h3>
      </div>
      
      {/* Mobile View: Cards */}
      <div className="flex flex-col xl:hidden divide-y divide-zinc-100">
        {data.length === 0 ? (
          <div className="p-8 text-center text-zinc-500 text-sm">No report history found for this manager.</div>
        ) : (
          data.map((report) => (
            <div key={`mob-${report.id}`} className="p-4 hover:bg-zinc-50/50 transition-colors">
              <div className="flex justify-between items-start mb-2">
                <span className="font-bold text-zinc-900 text-sm">{formatDate(report.date)}</span>
                <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold ${
                  report.status === "SENT" || report.status === "Sent"
                    ? "bg-[#e5fcf1] text-[#1f9d55]" 
                    : "bg-[#ffe5e5] text-[#d62828]"
                }`}>
                  {report.status}
                </span>
              </div>
              <div className="text-[13px] text-zinc-500 mb-3 break-all">
                <span className="font-semibold text-zinc-400 uppercase text-[10px] block mb-0.5">Sent To:</span>
                {formatRecipients(report.sentTo)}
              </div>
              <div className="mt-3 flex justify-end">
                <button
                  onClick={() => handleDownload(report.id, report.date)}
                  disabled={downloadingId === report.id}
                  className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-800 disabled:opacity-50"
                >
                  {downloadingId === report.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                  Download PDF
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Desktop View: Table */}
      <div className="hidden xl:block overflow-x-auto">
        <table className="w-full text-left whitespace-nowrap">
        <thead className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider bg-zinc-50 border-b border-zinc-100">
          <tr>
            <th className="px-6 py-4">REPORT DATE</th>
            <th className="px-6 py-4">SENT TO</th>
            <th className="px-6 py-4 text-center">STATUS</th>
            <th className="px-6 py-4 text-right">ACTION</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-100 text-sm">
          {data.length === 0 ? (
            <tr>
              <td colSpan={4} className="px-6 py-8 text-center text-zinc-500">No report history found for this manager.</td>
            </tr>
          ) : (
            data.map((report) => (
              <tr key={report.id} className="hover:bg-zinc-50/50 transition-colors">
                <td className="px-6 py-4 font-semibold text-zinc-900 text-[13px]">
                  {formatDate(report.date)}
                </td>
                <td className="px-6 py-4 text-zinc-500 text-[13px]">
                  {formatRecipients(report.sentTo)}
                </td>
                <td className="px-6 py-4 text-center">
                  <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold ${
                    report.status === "SENT" || report.status === "Sent"
                      ? "bg-[#e5fcf1] text-[#1f9d55]" 
                      : "bg-[#ffe5e5] text-[#d62828]"
                  }`}>
                    {report.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button
                    onClick={() => handleDownload(report.id, report.date)}
                    disabled={downloadingId === report.id}
                    className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-indigo-600 hover:text-indigo-800 disabled:opacity-50 transition-colors"
                  >
                    {downloadingId === report.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                    Download PDF
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
        </table>
      </div>
    </div>
  );
}

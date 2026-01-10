import * as XLSX from "xlsx";
import { LeaveReport } from "@/types";

export const exportToCSV = <T extends Record<string, unknown>>(
  data: T[],
  filename: string
) => {
  const headers = Object.keys(data[0] || {});
  const csvContent = [
    headers.join(","),
    ...data.map((row) =>
      headers.map((header) => JSON.stringify(row[header] || "")).join(",")
    ),
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", `${filename}.csv`);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportToExcel = <T extends Record<string, unknown>>(
  data: T[],
  filename: string
) => {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
  XLSX.writeFile(workbook, `${filename}.xlsx`);
};

export const exportLeaveReport = (
  reports: LeaveReport[],
  filename: string = "leave-report"
) => {
  const flattened = reports.flatMap((report) =>
    report.applications.map((app) => ({
      "Employee Name": report.employeeName,
      "Leave Type": report.leaveType,
      "Start Date": app.startDate,
      "End Date": app.endDate,
      Days: app.days,
      Status: app.status,
      "Total Days": report.totalDays,
      "Used Days": report.usedDays,
      "Available Days": report.availableDays,
    }))
  );
  exportToExcel(flattened, filename);
};

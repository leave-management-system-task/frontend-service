"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { leaveService } from "@/lib/api/leave";
import { exportLeaveReport } from "@/utils/exportUtils";
import toast from "react-hot-toast";
import { getErrorMessage } from "@/utils/errorUtils";

interface ReportFormData {
  startDate?: string;
  endDate?: string;
  employeeId?: string;
  leaveType?: string;
}

export default function ReportGenerator() {
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit } = useForm<ReportFormData>();

  const downloadReport = async (
    format: "excel" | "csv",
    data: ReportFormData
  ) => {
    setLoading(true);
    try {
      const blob =
        format === "excel"
          ? await leaveService.downloadLeaveReportExcel({
              year: data.startDate
                ? new Date(data.startDate).getFullYear()
                : undefined,
              status: data.leaveType,
            })
          : await leaveService.downloadLeaveReportCSV({
              year: data.startDate
                ? new Date(data.startDate).getFullYear()
                : undefined,
              status: data.leaveType,
            });

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `leave-report-${Date.now()}.${format === "excel" ? "xlsx" : "csv"}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success(`Report downloaded successfully as ${format.toUpperCase()}`);
    } catch (error: unknown) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: ReportFormData) => {
    await downloadReport("excel", data);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-6">Generate Report</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Date
            </label>
            <input
              type="date"
              {...register("startDate")}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              End Date
            </label>
            <input
              type="date"
              {...register("endDate")}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Employee ID (optional)
          </label>
          <input
            type="text"
            {...register("employeeId")}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            placeholder="Leave empty for all employees"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Leave Type (optional)
          </label>
          <input
            type="text"
            {...register("leaveType")}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            placeholder="e.g., PERSONAL_TIME_OFF"
          />
        </div>
        <div className="flex space-x-3">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Generating..." : "Download Excel"}
          </button>
          <button
            type="button"
            onClick={() => handleSubmit((data) => downloadReport("csv", data))()}
            disabled={loading}
            className="flex-1 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? "Generating..." : "Download CSV"}
          </button>
        </div>
      </form>
    </div>
  );
}

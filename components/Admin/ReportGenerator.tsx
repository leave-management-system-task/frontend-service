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

  const onSubmit = async (data: ReportFormData) => {
    setLoading(true);
    try {
      const reports = await leaveService.generateReport(data);
      if (reports.length === 0) {
        toast.error("No data found for the selected criteria");
        return;
      }
      exportLeaveReport(reports, `leave-report-${Date.now()}`);
      toast.success("Report generated successfully");
    } catch (error: unknown) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
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
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Generating..." : "Generate Excel Report"}
        </button>
      </form>
    </div>
  );
}

"use client";

import React, { useMemo } from "react";
import { LeaveApplication, LeaveStatus } from "@/types";
import { formatDate } from "@/utils/dateUtils";
import Link from "next/link";
import { useUserNames } from "@/hooks/useUserNames";

interface LeaveApplicationListProps {
  applications: LeaveApplication[];
  showEmployeeName?: boolean;
}

export default function LeaveApplicationList({
  applications,
  showEmployeeName = false,
}: LeaveApplicationListProps) {
  // Memoize userIds to prevent creating new array on every render
  const userIds = useMemo(() => {
    if (!showEmployeeName) return [];
    return applications.map((app) => app.userId).filter(Boolean);
  }, [applications, showEmployeeName]);

  const { getUserName, loading: namesLoading } = useUserNames(userIds);

  const getStatusColor = (status: LeaveStatus) => {
    switch (status) {
      case LeaveStatus.APPROVED:
        return "bg-green-100 text-green-800";
      case LeaveStatus.REJECTED:
        return "bg-red-100 text-red-800";
      case LeaveStatus.REQUESTED:
      case LeaveStatus.PENDING:
        return "bg-yellow-100 text-yellow-800";
      case LeaveStatus.CANCELLED:
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (applications.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <p className="text-slate-500">No leave applications found</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-slate-200">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              {showEmployeeName && (
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Employee
                </th>
              )}
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Leave Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Period
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Days
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Submitted
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {applications.map((app) => (
              <tr key={app.id} className="hover:bg-slate-50 transition-colors">
                {showEmployeeName && (
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                    {namesLoading ? (
                      <span className="text-slate-400">Loading...</span>
                    ) : (
                      getUserName(app.userId)
                    )}
                  </td>
                )}
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                  {app.leaveTypeName ||
                    (app.leaveType
                      ? app.leaveType.replace(/_/g, " ").toLowerCase()
                      : "N/A")}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                  {formatDate(app.startDate)} - {formatDate(app.endDate)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                  {app.numberOfDays || app.days || 0}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(app.status)}`}
                  >
                    {app.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                  {app.createdAt || app.submittedAt
                    ? formatDate(app.createdAt || app.submittedAt!)
                    : "N/A"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <Link
                    href={`/leave/${app.id}`}
                    className="text-orange-600 hover:text-orange-700 font-medium transition-colors"
                  >
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

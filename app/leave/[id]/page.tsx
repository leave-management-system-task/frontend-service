"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter, useParams } from "next/navigation";
import Layout from "@/components/Layout/Layout";
import ApprovalForm from "@/components/Leave/ApprovalForm";
import { leaveService } from "@/lib/api/leave";
import { LeaveApplication, LeaveStatus, UserRole } from "@/types";
import { formatDate } from "@/utils/dateUtils";
import toast from "react-hot-toast";
import { getErrorMessage } from "@/utils/errorUtils";

export default function LeaveDetailsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const [application, setApplication] = useState<LeaveApplication | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  const loadApplication = useCallback(async () => {
    if (!params.id || typeof params.id !== "string") {
      toast.error("Invalid application ID");
      router.push("/leave/my");
      return;
    }

    try {
      const app = await leaveService.getLeaveRequestById(params.id);
      setApplication(app);
    } catch (error: unknown) {
      toast.error(getErrorMessage(error));
      router.push("/leave/my");
    } finally {
      setLoading(false);
    }
  }, [params.id, router]);

  useEffect(() => {
    if (user && params.id) {
      loadApplication();
    }
  }, [user, params.id, loadApplication]);

  const handleApproved = () => {
    router.push("/leave/approvals");
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user || !application) {
    return null;
  }

  const canApprove =
    (user.role === UserRole.MANAGER || user.role === UserRole.ADMIN) &&
    (application.status === LeaveStatus.REQUESTED || application.status === LeaveStatus.PENDING);

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <button
            onClick={() => router.back()}
            className="text-blue-600 hover:text-blue-700 mb-4"
          >
            ← Back
          </button>
          <h1 className="text-3xl font-bold text-gray-900">
            Leave Application Details
          </h1>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {application.employeeName && (
              <div>
                <p className="text-sm text-gray-600">Employee</p>
                <p className="font-medium">{application.employeeName}</p>
              </div>
            )}
            <div>
              <p className="text-sm text-gray-600">Leave Type</p>
              <p className="font-medium">
                {application.leaveTypeName || (application.leaveType ? application.leaveType.replace(/_/g, " ").toLowerCase() : "N/A")}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Start Date</p>
              <p className="font-medium">{formatDate(application.startDate)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">End Date</p>
              <p className="font-medium">{formatDate(application.endDate)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Days</p>
              <p className="font-medium">{application.numberOfDays || application.days || 0}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Status</p>
              <span
                className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                  application.status === LeaveStatus.APPROVED
                    ? "bg-green-100 text-green-800"
                    : application.status === LeaveStatus.REJECTED
                      ? "bg-red-100 text-red-800"
                      : application.status === LeaveStatus.REQUESTED || application.status === LeaveStatus.PENDING
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-gray-100 text-gray-800"
                }`}
              >
                {application.status}
              </span>
            </div>
            {application.reason && (
              <div className="col-span-2">
                <p className="text-sm text-gray-600">Reason</p>
                <p className="font-medium">{application.reason}</p>
              </div>
            )}
            {application.reviewerComment && (
              <div className="col-span-2">
                <p className="text-sm text-gray-600">Review Comments</p>
                <p className="font-medium">{application.reviewerComment}</p>
              </div>
            )}
            {application.reviewedBy && (
              <div>
                <p className="text-sm text-gray-600">Reviewed By</p>
                <p className="font-medium">{application.reviewedBy}</p>
              </div>
            )}
            {application.reviewedAt && (
              <div>
                <p className="text-sm text-gray-600">Reviewed At</p>
                <p className="font-medium">
                  {formatDate(application.reviewedAt)}
                </p>
              </div>
            )}
            {application.documentUrl && (
              <div className="col-span-2">
                <p className="text-sm text-gray-600">Document</p>
                <a
                  href={application.documentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-700 underline"
                >
                  View Document
                </a>
              </div>
            )}
          </div>

          {canApprove && (
            <div className="border-t pt-4 mt-4">
              <h3 className="text-lg font-semibold mb-4">Approve/Reject</h3>
              <ApprovalForm
                application={application}
                onApproved={handleApproved}
              />
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

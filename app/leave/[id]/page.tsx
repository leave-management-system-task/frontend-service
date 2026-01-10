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
    try {
      const applications = await leaveService.getMyApplications();
      const app = applications.find((a) => a.id === params.id);
      if (!app) {
        // Try pending approvals if not found in my applications
        if (user?.role === UserRole.MANAGER || user?.role === UserRole.ADMIN) {
          const pending = await leaveService.getPendingApprovals();
          const pendingApp = pending.find((a) => a.id === params.id);
          if (pendingApp) {
            setApplication(pendingApp);
            return;
          }
        }
        toast.error("Application not found");
        router.push("/leave/my");
        return;
      }
      setApplication(app);
    } catch (error: unknown) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }, [user, params.id, router]);

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
    application.status === LeaveStatus.PENDING;

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
            <div>
              <p className="text-sm text-gray-600">Employee</p>
              <p className="font-medium">{application.employeeName}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Leave Type</p>
              <p className="font-medium capitalize">
                {application.leaveType.replace(/_/g, " ").toLowerCase()}
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
              <p className="font-medium">{application.days}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Status</p>
              <span
                className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                  application.status === LeaveStatus.APPROVED
                    ? "bg-green-100 text-green-800"
                    : application.status === LeaveStatus.REJECTED
                      ? "bg-red-100 text-red-800"
                      : application.status === LeaveStatus.PENDING
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
            {application.approvalComments && (
              <div className="col-span-2">
                <p className="text-sm text-gray-600">Approval Comments</p>
                <p className="font-medium">{application.approvalComments}</p>
              </div>
            )}
            {application.approverName && (
              <div>
                <p className="text-sm text-gray-600">Approved By</p>
                <p className="font-medium">{application.approverName}</p>
              </div>
            )}
            {application.approvedAt && (
              <div>
                <p className="text-sm text-gray-600">Approved At</p>
                <p className="font-medium">
                  {formatDate(application.approvedAt)}
                </p>
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

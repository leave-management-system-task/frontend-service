"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter, useParams } from "next/navigation";
import Layout from "@/components/Layout/Layout";
import ApprovalForm from "@/components/Leave/ApprovalForm";
import { leaveService } from "@/lib/api/leave";
import { userService } from "@/lib/api/users";
import { LeaveApplication, LeaveStatus, UserRole } from "@/types";
import { formatDate } from "@/utils/dateUtils";
import toast from "react-hot-toast";
import { getErrorMessage } from "@/utils/errorUtils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Calendar,
  Clock,
  FileText,
  User,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ArrowLeft,
  Download,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function LeaveDetailsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const [application, setApplication] = useState<LeaveApplication | null>(null);
  const [loading, setLoading] = useState(true);
  const [employeeName, setEmployeeName] = useState<string>("");

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

      // Fetch employee name if userId is available
      if (app.userId) {
        try {
          const fullName = await userService.getUserFullNameById(app.userId);
          setEmployeeName(fullName);
        } catch (error) {
          console.error("Failed to fetch employee name:", error);
          setEmployeeName("Unknown User");
        }
      }
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

  const getStatusConfig = (status: LeaveStatus) => {
    switch (status) {
      case LeaveStatus.APPROVED:
        return {
          label: "Approved",
          icon: CheckCircle2,
          className: "bg-green-100 text-green-800 border-green-200",
          iconClassName: "text-green-600",
        };
      case LeaveStatus.REJECTED:
        return {
          label: "Rejected",
          icon: XCircle,
          className: "bg-red-100 text-red-800 border-red-200",
          iconClassName: "text-red-600",
        };
      case LeaveStatus.REQUESTED:
      case LeaveStatus.PENDING:
        return {
          label: status === "REQUESTED" ? "Requested" : "Pending",
          icon: AlertCircle,
          className: "bg-yellow-100 text-yellow-800 border-yellow-200",
          iconClassName: "text-yellow-600",
        };
      case LeaveStatus.CANCELLED:
        return {
          label: "Cancelled",
          icon: XCircle,
          className: "bg-gray-100 text-gray-800 border-gray-200",
          iconClassName: "text-gray-600",
        };
      default:
        return {
          label: status,
          icon: AlertCircle,
          className: "bg-gray-100 text-gray-800 border-gray-200",
          iconClassName: "text-gray-600",
        };
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user || !application) {
    return null;
  }

  const canApprove =
    (user.role === UserRole.MANAGER || user.role === UserRole.ADMIN) &&
    (application.status === LeaveStatus.REQUESTED ||
      application.status === LeaveStatus.PENDING);

  const statusConfig = getStatusConfig(application.status);

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
              className="hover:bg-slate-100"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-slate-800">
                Leave Application Details
              </h1>
              <p className="text-sm text-slate-600 mt-1">
                Application ID: {application.id.slice(0, 8)}...
              </p>
            </div>
          </div>
          <div
            className={cn(
              "flex items-center space-x-2 px-4 py-2 rounded-lg border",
              statusConfig.className
            )}
          >
            <statusConfig.icon
              className={cn("h-5 w-5", statusConfig.iconClassName)}
            />
            <span className="font-semibold">{statusConfig.label}</span>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Details */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-slate-200 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-slate-50 to-white border-b border-slate-200">
                <CardTitle className="text-xl font-semibold text-slate-800">
                  Application Information
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                {/* Employee Name - Only show if not current user's application */}
                {employeeName && application.userId !== user?.id && (
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                      <User className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-600 mb-1">
                        Employee
                      </p>
                      <p className="text-lg font-semibold text-slate-800">
                        {employeeName}
                      </p>
                    </div>
                  </div>
                )}

                {/* Leave Type */}
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-orange-100 flex items-center justify-center">
                    <FileText className="h-6 w-6 text-orange-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-600 mb-1">
                      Leave Type
                    </p>
                    <p className="text-lg font-semibold text-slate-800">
                      {application.leaveTypeName ||
                        (application.leaveType
                          ? application.leaveType
                              .replace(/_/g, " ")
                              .toLowerCase()
                          : "N/A")}
                    </p>
                  </div>
                </div>

                {/* Dates */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                      <Calendar className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-600 mb-1">
                        Start Date
                      </p>
                      <p className="text-lg font-semibold text-slate-800">
                        {formatDate(application.startDate)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                      <Calendar className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-600 mb-1">
                        End Date
                      </p>
                      <p className="text-lg font-semibold text-slate-800">
                        {formatDate(application.endDate)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Duration */}
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center">
                    <Clock className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-600 mb-1">
                      Duration
                    </p>
                    <p className="text-lg font-semibold text-slate-800">
                      {application.numberOfDays || application.days || 0} day
                      {application.numberOfDays !== 1 ? "s" : ""}
                    </p>
                  </div>
                </div>

                {/* Reason */}
                {application.reason && (
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center">
                      <FileText className="h-6 w-6 text-slate-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-600 mb-2">
                        Reason
                      </p>
                      <p className="text-base text-slate-800 bg-slate-50 rounded-lg p-4 border border-slate-200">
                        {application.reason}
                      </p>
                    </div>
                  </div>
                )}

                {/* Document */}
                {application.documentUrl && (
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                      <FileText className="h-6 w-6 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-600 mb-2">
                        Attached Document
                      </p>
                      <a
                        href={application.documentUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center space-x-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                      >
                        <Download className="h-4 w-4 text-slate-700" />
                        <span className="text-sm font-medium text-slate-700">
                          View Document
                        </span>
                      </a>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Approval Section */}
            {canApprove && (
              <Card className="border-slate-200 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-slate-50 to-white border-b border-slate-200">
                  <CardTitle className="text-xl font-semibold text-slate-800">
                    Review Application
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <ApprovalForm
                    application={application}
                    onApproved={handleApproved}
                  />
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - Metadata */}
          <div className="space-y-6">
            <Card className="border-slate-200 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-slate-50 to-white border-b border-slate-200">
                <CardTitle className="text-lg font-semibold text-slate-800">
                  Application Details
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div>
                  <p className="text-xs font-medium text-slate-500 mb-1">
                    Application ID
                  </p>
                  <p className="text-sm font-mono text-slate-700 break-all">
                    {application.id}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500 mb-1">
                    Submitted
                  </p>
                  <p className="text-sm text-slate-700">
                    {application.createdAt || application.submittedAt
                      ? formatDate(
                          application.createdAt || application.submittedAt!
                        )
                      : "N/A"}
                  </p>
                </div>
                {application.updatedAt && (
                  <div>
                    <p className="text-xs font-medium text-slate-500 mb-1">
                      Last Updated
                    </p>
                    <p className="text-sm text-slate-700">
                      {formatDate(application.updatedAt)}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Review Information */}
            {(application.reviewedBy ||
              application.reviewedAt ||
              application.reviewerComment) && (
              <Card className="border-slate-200 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-slate-50 to-white border-b border-slate-200">
                  <CardTitle className="text-lg font-semibold text-slate-800">
                    Review Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                  {application.reviewedBy && (
                    <div>
                      <p className="text-xs font-medium text-slate-500 mb-1">
                        Reviewed By
                      </p>
                      <p className="text-sm text-slate-700">
                        {application.reviewedBy}
                      </p>
                    </div>
                  )}
                  {application.reviewedAt && (
                    <div>
                      <p className="text-xs font-medium text-slate-500 mb-1">
                        Reviewed At
                      </p>
                      <p className="text-sm text-slate-700">
                        {formatDate(application.reviewedAt)}
                      </p>
                    </div>
                  )}
                  {application.reviewerComment && (
                    <div>
                      <p className="text-xs font-medium text-slate-500 mb-1">
                        Comments
                      </p>
                      <p className="text-sm text-slate-700 bg-slate-50 rounded-lg p-3 border border-slate-200">
                        {application.reviewerComment}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}

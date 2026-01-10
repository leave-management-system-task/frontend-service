"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Layout from "@/components/Layout/Layout";
import LeaveApplicationList from "@/components/Leave/LeaveApplicationList";
import { leaveService } from "@/lib/api/leave";
import { LeaveApplication } from "@/types";
import toast from "react-hot-toast";
import { getErrorMessage } from "@/utils/errorUtils";

export default function ApprovalsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [applications, setApplications] = useState<LeaveApplication[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    } else if (user && user.role !== "MANAGER" && user.role !== "ADMIN") {
      router.push("/dashboard");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user && (user.role === "MANAGER" || user.role === "ADMIN")) {
      loadPendingApprovals();
    }
  }, [user]);

  const loadPendingApprovals = async () => {
    try {
      const data = await leaveService.getPendingApprovals();
      setApplications(data);
    } catch (error: unknown) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
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

  if (!user || (user.role !== "MANAGER" && user.role !== "ADMIN")) {
    return null;
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">
            Pending Approvals
          </h1>
        </div>
        <LeaveApplicationList
          applications={applications}
          showEmployeeName={true}
        />
      </div>
    </Layout>
  );
}

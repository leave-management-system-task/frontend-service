"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Layout from "@/components/Layout/Layout";
import LeaveApplicationList from "@/components/Leave/LeaveApplicationList";
import ApplyLeaveModal from "@/components/Leave/ApplyLeaveModal";
import { leaveService } from "@/lib/api/leave";
import { LeaveApplication } from "@/types";
import toast from "react-hot-toast";
import { getErrorMessage } from "@/utils/errorUtils";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function MyLeavePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [applications, setApplications] = useState<LeaveApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      loadApplications();
    }
  }, [user]);

  const loadApplications = async () => {
    try {
      const response = await leaveService.getMyLeaveRequests({ size: 100 });
      setApplications(response.content);
    } catch (error: unknown) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const handleModalClose = () => {
    setModalOpen(false);
  };

  const handleSuccess = () => {
    loadApplications();
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

  if (!user) {
    return null;
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">
              My Leave Applications
            </h1>
            <p className="mt-1 text-slate-600">
              View and manage your leave requests
            </p>
          </div>
          <Button
            onClick={() => setModalOpen(true)}
            className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-md"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Leave Request
          </Button>
        </div>
        <LeaveApplicationList applications={applications} />
        <ApplyLeaveModal
          open={modalOpen}
          onClose={handleModalClose}
          onSuccess={handleSuccess}
        />
      </div>
    </Layout>
  );
}

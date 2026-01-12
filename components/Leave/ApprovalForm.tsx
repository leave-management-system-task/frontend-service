"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { leaveService } from "@/lib/api/leave";
import { LeaveApplication, LeaveStatus } from "@/types";
import toast from "react-hot-toast";
import { getErrorMessage } from "@/utils/errorUtils";

interface ApprovalFormProps {
  application: LeaveApplication;
  onApproved: () => void;
}

interface ApprovalFormData {
  comments: string;
}

export default function ApprovalForm({
  application,
  onApproved,
}: ApprovalFormProps) {
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit } = useForm<ApprovalFormData>();

  const handleApprove = async (data: ApprovalFormData) => {
    setLoading(true);
    try {
      await leaveService.reviewLeaveRequest(application.id, {
        decision: "APPROVE",
        comment: data.comments,
      });
      toast.success("Leave application approved");
      onApproved();
    } catch (error: unknown) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async (data: ApprovalFormData) => {
    if (!data.comments) {
      toast.error("Comments are required when rejecting an application");
      return;
    }

    setLoading(true);
    try {
      await leaveService.reviewLeaveRequest(application.id, {
        decision: "REJECT",
        comment: data.comments,
      });
      toast.success("Leave application rejected");
      onApproved();
    } catch (error: unknown) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Comments
        </label>
        <textarea
          {...register("comments")}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Add your comments (required for rejection)"
        />
      </div>
      <div className="flex space-x-3">
        <button
          type="button"
          onClick={handleSubmit(handleApprove)}
          disabled={loading}
          className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:opacity-50"
        >
          {loading ? "Processing..." : "Approve"}
        </button>
        <button
          type="button"
          onClick={handleSubmit(handleReject)}
          disabled={loading}
          className="flex-1 bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 disabled:opacity-50"
        >
          {loading ? "Processing..." : "Reject"}
        </button>
      </div>
    </form>
  );
}

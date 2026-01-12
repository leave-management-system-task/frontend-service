"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { leaveService, userService } from "@/lib/api";
import { User, LeaveBalance } from "@/types";
import toast from "react-hot-toast";
import { getErrorMessage } from "@/utils/errorUtils";

interface AdjustmentFormData {
  userId: string;
  balanceId: string;
  adjustmentAmount: number;
  reason: string;
}

export default function LeaveBalanceAdjustment() {
  const [users, setUsers] = useState<User[]>([]);
  const [balances, setBalances] = useState<LeaveBalance[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingBalances, setLoadingBalances] = useState(false);
  const { register, handleSubmit, reset, watch, setValue } =
    useForm<AdjustmentFormData>();

  const selectedUserId = watch("userId");

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    if (selectedUserId) {
      loadUserBalances(selectedUserId);
    } else {
      setBalances([]);
      setValue("balanceId", "");
    }
  }, [selectedUserId, setValue]);

  const loadUsers = async () => {
    try {
      const allUsers = await userService.getAllUsers();
      setUsers(allUsers);
      if (allUsers.length === 0) {
        toast.error("No users found");
      }
    } catch (error: unknown) {
      console.error("Failed to load users:", error);
      toast.error(getErrorMessage(error) || "Failed to load users");
    }
  };

  const loadUserBalances = async (userId: string) => {
    setLoadingBalances(true);
    try {
      const response = await leaveService.getUserLeaveBalances(userId, {
        size: 100,
      });
      setBalances(response.content);
    } catch (error: unknown) {
      toast.error(getErrorMessage(error));
      setBalances([]);
    } finally {
      setLoadingBalances(false);
    }
  };

  const onSubmit = async (data: AdjustmentFormData) => {
    if (!data.balanceId) {
      toast.error("Please select a leave balance");
      return;
    }
    setLoading(true);
    try {
      await leaveService.adjustLeaveBalance(data.balanceId, {
        adjustmentAmount: data.adjustmentAmount,
        reason: data.reason,
      });
      toast.success("Leave balance adjusted successfully");
      reset();
      if (data.userId) {
        loadUserBalances(data.userId);
      }
    } catch (error: unknown) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-6 text-slate-800">
        Adjust Leave Balance
      </h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Employee
          </label>
          <select
            {...register("userId", { required: true })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-slate-900 bg-white"
          >
            <option value="">Select employee</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.firstName} {user.lastName} ({user.email})
              </option>
            ))}
          </select>
        </div>
        {selectedUserId && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Leave Balance
            </label>
            {loadingBalances ? (
              <p className="text-sm text-slate-700">Loading balances...</p>
            ) : balances.length === 0 ? (
              <p className="text-sm text-slate-700">
                No leave balances found for this user
              </p>
            ) : (
              <select
                {...register("balanceId", { required: true })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-slate-900 bg-white"
              >
                <option value="">Select leave balance</option>
                {balances.map((balance) => (
                  <option key={balance.id} value={balance.id}>
                    {balance.leaveTypeName} ({balance.year}) - Available:{" "}
                    {balance.availableDays} days
                  </option>
                ))}
              </select>
            )}
          </div>
        )}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Adjustment Amount (positive to add, negative to subtract)
          </label>
          <input
            type="number"
            step="0.01"
            {...register("adjustmentAmount", {
              required: true,
              valueAsNumber: true,
            })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-slate-900 bg-white placeholder:text-slate-400"
            placeholder="e.g., 5.0 or -2.5"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Reason
          </label>
          <textarea
            {...register("reason", { required: true })}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-slate-900 bg-white placeholder:text-slate-400"
            placeholder="Reason for adjustment"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Adjusting..." : "Adjust Balance"}
        </button>
      </form>
    </div>
  );
}

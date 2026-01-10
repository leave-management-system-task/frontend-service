"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { leaveService, userService } from "@/lib/api";
import { User } from "@/types";
import toast from "react-hot-toast";
import { getErrorMessage } from "@/utils/errorUtils";

interface AdjustmentFormData {
  employeeId: string;
  leaveType: string;
  days: number;
  reason: string;
}

export default function LeaveBalanceAdjustment() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, reset } = useForm<AdjustmentFormData>();

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const allUsers = await userService.getAllUsers();
      setUsers(allUsers);
    } catch {
      toast.error("Failed to load users");
    }
  };

  const onSubmit = async (data: AdjustmentFormData) => {
    setLoading(true);
    try {
      await leaveService.adjustLeaveBalance(data);
      toast.success("Leave balance adjusted successfully");
      reset();
    } catch (error: unknown) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-6">Adjust Leave Balance</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Employee
          </label>
          <select
            {...register("employeeId", { required: true })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="">Select employee</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.firstName} {user.lastName} ({user.email})
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Leave Type
          </label>
          <input
            type="text"
            {...register("leaveType", { required: true })}
            placeholder="e.g., PERSONAL_TIME_OFF"
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Days (positive to add, negative to subtract)
          </label>
          <input
            type="number"
            step="0.01"
            {...register("days", { required: true, valueAsNumber: true })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Reason
          </label>
          <textarea
            {...register("reason", { required: true })}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
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

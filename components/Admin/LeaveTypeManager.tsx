"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { leaveService } from "@/lib/api/leave";
import { LeaveTypeConfig } from "@/types";
import toast from "react-hot-toast";
import { getErrorMessage } from "@/utils/errorUtils";

interface LeaveTypeFormData {
  name: string;
  description?: string;
  annualAllocation?: number;
  accrualRate?: number;
  requiresDocument: boolean;
  requiresReason: boolean;
  maxCarryoverDays?: number;
  carryoverExpiryMonth?: number;
  carryoverExpiryDay?: number;
  isActive?: boolean;
}

export default function LeaveTypeManager() {
  const [leaveTypes, setLeaveTypes] = useState<LeaveTypeConfig[]>([]);
  const [editingType, setEditingType] = useState<LeaveTypeConfig | null>(null);
  const [showForm, setShowForm] = useState(false);
  const { register, handleSubmit, reset, setValue } =
    useForm<LeaveTypeFormData>();

  const loadLeaveTypes = async () => {
    try {
      const types = await leaveService.getLeaveTypes();
      setLeaveTypes(types);
    } catch {
      toast.error("Failed to load leave types");
    }
  };

  useEffect(() => {
    void loadLeaveTypes();
  }, []);

  const onSubmit = async (data: LeaveTypeFormData) => {
    try {
      if (editingType) {
        await leaveService.updateLeaveType(editingType.id, {
          ...data,
          isActive: data.isActive ?? editingType.isActive,
        });
        toast.success("Leave type updated successfully");
      } else {
        await leaveService.createLeaveType({
          name: data.name,
          description: data.description,
          annualAllocation: data.annualAllocation,
          accrualRate: data.accrualRate,
          requiresDocument: data.requiresDocument,
          requiresReason: data.requiresReason,
          maxCarryoverDays: data.maxCarryoverDays,
          carryoverExpiryMonth: data.carryoverExpiryMonth,
          carryoverExpiryDay: data.carryoverExpiryDay,
        });
        toast.success("Leave type created successfully");
      }
      reset();
      setShowForm(false);
      setEditingType(null);
      loadLeaveTypes();
    } catch (error: unknown) {
      toast.error(getErrorMessage(error));
    }
  };

  const handleEdit = (type: LeaveTypeConfig) => {
    setEditingType(type);
    setValue("name", type.name);
    setValue("description", type.description || "");
    setValue("annualAllocation", type.annualAllocation || type.maxDays || 0);
    setValue("accrualRate", type.accrualRate || 0);
    setValue("requiresDocument", type.requiresDocument);
    setValue("requiresReason", type.requiresReason);
    setValue("maxCarryoverDays", type.maxCarryoverDays || 0);
    setValue("carryoverExpiryMonth", type.carryoverExpiryMonth || 0);
    setValue("carryoverExpiryDay", type.carryoverExpiryDay || 0);
    setValue("isActive", type.isActive);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this leave type?")) {
      return;
    }
    try {
      await leaveService.deleteLeaveType(id);
      toast.success("Leave type deleted successfully");
      loadLeaveTypes();
    } catch (error: unknown) {
      toast.error(getErrorMessage(error));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">Leave Types</h2>
        <button
          onClick={() => {
            setShowForm(true);
            setEditingType(null);
            reset();
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          Add Leave Type
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">
            {editingType ? "Edit Leave Type" : "Create Leave Type"}
          </h3>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                {...register("name", { required: true })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                {...register("description")}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Annual Allocation (days)
                </label>
                <input
                  type="number"
                  {...register("annualAllocation", { valueAsNumber: true })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Accrual Rate (days/month)
                </label>
                <input
                  type="number"
                  step="0.01"
                  {...register("accrualRate", { valueAsNumber: true })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Max Carryover Days
                </label>
                <input
                  type="number"
                  {...register("maxCarryoverDays", { valueAsNumber: true })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Carryover Expiry Month
                </label>
                <input
                  type="number"
                  min="1"
                  max="12"
                  {...register("carryoverExpiryMonth", { valueAsNumber: true })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Carryover Expiry Day
                </label>
                <input
                  type="number"
                  min="1"
                  max="31"
                  {...register("carryoverExpiryDay", { valueAsNumber: true })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  {...register("requiresDocument")}
                  className="mr-2"
                />
                Requires Document <span className="text-red-500">*</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  {...register("requiresReason")}
                  className="mr-2"
                />
                Requires Reason <span className="text-red-500">*</span>
              </label>
              {editingType && (
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    {...register("isActive")}
                    className="mr-2"
                  />
                  Active
                </label>
              )}
            </div>
            <div className="flex space-x-3">
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                {editingType ? "Update" : "Create"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingType(null);
                  reset();
                }}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Description
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Annual Allocation
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Accrual Rate
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {leaveTypes.map((type) => (
              <tr key={type.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {type.name}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {type.description || "-"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {type.annualAllocation || type.maxDays || 0}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {type.accrualRate} days/month
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      type.isActive
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {type.isActive ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                  <button
                    onClick={() => handleEdit(type)}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(type.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

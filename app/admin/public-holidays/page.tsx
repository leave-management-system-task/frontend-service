"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Layout from "@/components/Layout/Layout";
import { leaveService } from "@/lib/api/leave";
import { PublicHoliday } from "@/types";
import { formatDate } from "@/utils/dateUtils";
import toast from "react-hot-toast";
import { getErrorMessage } from "@/utils/errorUtils";
import { UserRole } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";

interface PublicHolidayFormData {
  name: string;
  date: string;
  description?: string;
  isRecurring: boolean;
}

export default function PublicHolidaysPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [holidays, setHolidays] = useState<PublicHoliday[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingHoliday, setEditingHoliday] = useState<PublicHoliday | null>(
    null
  );
  const { register, handleSubmit, reset, setValue } =
    useForm<PublicHolidayFormData>();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    } else if (user && user.role !== UserRole.ADMIN) {
      router.push("/dashboard");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user && user.role === UserRole.ADMIN) {
      loadHolidays();
    }
  }, [user]);

  const loadHolidays = async () => {
    try {
      const currentYear = new Date().getFullYear();
      const response = await leaveService.getPublicHolidaysByYear(currentYear, {
        size: 100,
      });
      setHolidays(response.content);
    } catch (error: unknown) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: PublicHolidayFormData) => {
    try {
      if (editingHoliday) {
        await leaveService.updatePublicHoliday(editingHoliday.id, {
          name: data.name,
          date: data.date,
          description: data.description,
          isRecurring: data.isRecurring,
        });
        toast.success("Public holiday updated successfully");
      } else {
        await leaveService.createPublicHoliday({
          name: data.name,
          date: data.date,
          description: data.description,
          isRecurring: data.isRecurring,
        });
        toast.success("Public holiday created successfully");
      }
      reset();
      setShowForm(false);
      setEditingHoliday(null);
      loadHolidays();
    } catch (error: unknown) {
      toast.error(getErrorMessage(error));
    }
  };

  const handleEdit = (holiday: PublicHoliday) => {
    setEditingHoliday(holiday);
    setValue("name", holiday.name);
    setValue("date", holiday.date);
    setValue("description", holiday.description || "");
    setValue("isRecurring", holiday.isRecurring);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this public holiday?")) {
      return;
    }
    try {
      await leaveService.deletePublicHoliday(id);
      toast.success("Public holiday deleted successfully");
      loadHolidays();
    } catch (error: unknown) {
      toast.error(getErrorMessage(error));
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

  if (!user || user.role !== UserRole.ADMIN) {
    return null;
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Public Holidays Management
            </h1>
            <p className="mt-2 text-gray-600">
              Manage public holidays for the organization
            </p>
          </div>
          <Dialog open={showForm} onOpenChange={setShowForm}>
            <DialogTrigger asChild>
              <Button
                onClick={() => {
                  setEditingHoliday(null);
                  reset();
                }}
              >
                Add Public Holiday
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingHoliday
                    ? "Edit Public Holiday"
                    : "Create Public Holiday"}
                </DialogTitle>
                <DialogDescription>
                  {editingHoliday
                    ? "Update the public holiday details"
                    : "Add a new public holiday to the calendar"}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">
                    Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="name"
                    {...register("name", { required: true })}
                    placeholder="e.g., New Year's Day"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date">
                    Date <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="date"
                    type="date"
                    {...register("date", { required: true })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    {...register("description")}
                    rows={3}
                    placeholder="Optional description"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isRecurring"
                    {...register("isRecurring")}
                    className="rounded"
                  />
                  <Label htmlFor="isRecurring">Recurring (yearly)</Label>
                </div>
                <div className="flex space-x-3">
                  <Button type="submit" className="flex-1">
                    {editingHoliday ? "Update" : "Create"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowForm(false);
                      setEditingHoliday(null);
                      reset();
                    }}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Public Holidays</CardTitle>
          </CardHeader>
          <CardContent>
            {holidays.length === 0 ? (
              <p className="text-center text-gray-500 py-8">
                No public holidays found
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Description
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Recurring
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {holidays.map((holiday) => (
                      <tr key={holiday.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {holiday.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(holiday.date)}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {holiday.description || "-"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 text-xs rounded-full ${
                              holiday.isRecurring
                                ? "bg-green-100 text-green-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {holiday.isRecurring ? "Yes" : "No"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                          <button
                            onClick={() => handleEdit(holiday)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(holiday.id)}
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
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}

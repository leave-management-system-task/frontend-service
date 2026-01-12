"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import DatePicker from "react-datepicker";
import { leaveService } from "@/lib/api/leave";
import { LeaveTypeConfig } from "@/types";
import { calculateDays } from "@/utils/dateUtils";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { getErrorMessage } from "@/utils/errorUtils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ApplyLeaveFormData {
  leaveType: string;
  startDate: Date;
  endDate: Date;
  reason?: string;
  documents?: FileList;
}

export default function ApplyLeaveForm() {
  const router = useRouter();
  const [leaveTypes, setLeaveTypes] = useState<LeaveTypeConfig[]>([]);
  const [selectedType, setSelectedType] = useState<LeaveTypeConfig | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ApplyLeaveFormData>();

  const startDate = watch("startDate");
  const endDate = watch("endDate");

  useEffect(() => {
    loadLeaveTypes();
  }, []);

  const loadLeaveTypes = async () => {
    try {
      const types = await leaveService.getLeaveTypes();
      setLeaveTypes(types.filter((t) => t.isActive));
    } catch {
      toast.error("Failed to load leave types");
    }
  };

  const handleTypeChange = (typeId: string) => {
    const type = leaveTypes.find((t) => t.id === typeId);
    setSelectedType(type || null);
  };

  const onSubmit = async (data: ApplyLeaveFormData) => {
    if (!data.startDate || !data.endDate) {
      toast.error("Please select start and end dates");
      return;
    }

    if (data.endDate < data.startDate) {
      toast.error("End date must be after start date");
      return;
    }

    const days = calculateDays(data.startDate, data.endDate);
    if (days <= 0) {
      toast.error("Invalid date range");
      return;
    }

    setLoading(true);
    try {
      const document =
        data.documents && data.documents.length > 0
          ? data.documents[0]
          : undefined;

      await leaveService.createLeaveRequest({
        leaveTypeId: data.leaveType,
        startDate: data.startDate.toISOString().split("T")[0],
        endDate: data.endDate.toISOString().split("T")[0],
        reason: data.reason,
        document,
      });
      toast.success("Leave application submitted successfully!");
      router.push("/leave/my");
    } catch (error: unknown) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const calculatedDays =
    startDate && endDate && endDate >= startDate
      ? calculateDays(startDate, endDate)
      : 0;

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">Apply for Leave</CardTitle>
        <CardDescription>Submit a new leave application</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="leaveType">
              Leave Type <span className="text-destructive">*</span>
            </Label>
            <Select
              onValueChange={(value) => {
                setValue("leaveType", value, { shouldValidate: true });
                handleTypeChange(value);
              }}
            >
              <SelectTrigger id="leaveType">
                <SelectValue placeholder="Select leave type" />
              </SelectTrigger>
              <SelectContent>
                {leaveTypes.map((type) => (
                  <SelectItem key={type.id} value={type.id}>
                    {type.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <input
              type="hidden"
              {...register("leaveType", { required: "Leave type is required" })}
            />
            {errors.leaveType && (
              <p className="text-sm text-destructive">
                {errors.leaveType.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">
                Start Date <span className="text-destructive">*</span>
              </Label>
              <DatePicker
                selected={startDate}
                // onChange={(date: Date) => setValue("startDate", date)}
                minDate={new Date()}
                className="w-full"
                wrapperClassName="w-full"
                customInput={<Input id="startDate" />}
                dateFormat="yyyy-MM-dd"
              />
              {errors.startDate && (
                <p className="text-sm text-destructive">
                  Start date is required
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate">
                End Date <span className="text-destructive">*</span>
              </Label>
              <DatePicker
                selected={endDate}
                // onChange={(date: Date) => setValue("endDate", date)}
                minDate={startDate || new Date()}
                className="w-full"
                wrapperClassName="w-full"
                customInput={<Input id="endDate" />}
                dateFormat="yyyy-MM-dd"
              />
              {errors.endDate && (
                <p className="text-sm text-destructive">End date is required</p>
              )}
            </div>
          </div>

          {calculatedDays > 0 && (
            <div className="bg-[var(--color-primary)]/10 p-4 rounded-md">
              <p className="text-sm text-[var(--color-primary)]">
                Total days:{" "}
                <span className="font-semibold">{calculatedDays}</span>
              </p>
            </div>
          )}

          {selectedType?.requiresReason && (
            <div className="space-y-2">
              <Label htmlFor="reason">
                Reason{" "}
                {selectedType.requiresReason && (
                  <span className="text-destructive">*</span>
                )}
              </Label>
              <Textarea
                id="reason"
                {...register("reason", {
                  required: selectedType.requiresReason
                    ? "Reason is required"
                    : false,
                })}
                rows={4}
                placeholder="Please provide a reason for your leave request"
              />
              {errors.reason && (
                <p className="text-sm text-destructive">
                  {errors.reason.message}
                </p>
              )}
            </div>
          )}

          {selectedType?.requiresDocument && (
            <div className="space-y-2">
              <Label htmlFor="documents">
                Documents <span className="text-destructive">*</span>
              </Label>
              <Input
                id="documents"
                type="file"
                {...register("documents", {
                  required: selectedType.requiresDocument
                    ? "Documents are required"
                    : false,
                })}
                multiple
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              />
              {errors.documents && (
                <p className="text-sm text-destructive">
                  {errors.documents.message}
                </p>
              )}
              <p className="text-xs text-[var(--color-muted-foreground)]">
                Accepted formats: PDF, DOC, DOCX, JPG, PNG
              </p>
            </div>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Submitting..." : "Submit Application"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

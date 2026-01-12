"use client";

import React, { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import DatePicker from "react-datepicker";
import { leaveService } from "@/lib/api/leave";
import { LeaveTypeConfig } from "@/types";
import { calculateDays } from "@/utils/dateUtils";
import toast from "react-hot-toast";
import { getErrorMessage } from "@/utils/errorUtils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Upload, X, FileText, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ApplyLeaveFormData {
  leaveType: string;
  startDate: Date | null;
  endDate: Date | null;
  reason?: string;
  document?: File;
}

interface ApplyLeaveModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function ApplyLeaveModal({
  open,
  onClose,
  onSuccess,
}: ApplyLeaveModalProps) {
  const [leaveTypes, setLeaveTypes] = useState<LeaveTypeConfig[]>([]);
  const [selectedType, setSelectedType] = useState<LeaveTypeConfig | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<ApplyLeaveFormData>({
    defaultValues: {
      leaveType: "",
      startDate: null,
      endDate: null,
      reason: "",
      document: undefined,
    },
  });

  const startDate = watch("startDate");
  const endDate = watch("endDate");

  useEffect(() => {
    if (open) {
      loadLeaveTypes();
      reset();
      setSelectedType(null);
      setSelectedFile(null);
    }
  }, [open, reset]);

  const loadLeaveTypes = async () => {
    try {
      const response = await leaveService.getActiveLeaveTypes({ size: 100 });
      setLeaveTypes(response.content);
    } catch {
      toast.error("Failed to load leave types");
    }
  };

  const handleTypeChange = (typeId: string) => {
    const type = leaveTypes.find((t) => t.id === typeId);
    setSelectedType(type || null);
    setValue("leaveType", typeId, { shouldValidate: true });
  };

  const handleStartDateChange = (date: Date | null) => {
    setValue("startDate", date, { shouldValidate: true });
    // If end date is before new start date, reset end date
    if (date && endDate && endDate < date) {
      setValue("endDate", null, { shouldValidate: true });
    }
  };

  const handleEndDateChange = (date: Date | null) => {
    setValue("endDate", date, { shouldValidate: true });
  };

  const validateFile = (file: File): boolean => {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "image/jpeg",
      "image/jpg",
      "image/png",
    ];

    if (file.size > maxSize) {
      toast.error("File size must be less than 10MB");
      return false;
    }

    if (!allowedTypes.includes(file.type)) {
      toast.error(
        "Invalid file type. Please upload PDF, DOC, DOCX, JPG, or PNG files"
      );
      return false;
    }

    return true;
  };

  const handleFileSelect = (file: File | null) => {
    if (!file) {
      setSelectedFile(null);
      setValue("document", undefined, { shouldValidate: true });
      return;
    }

    if (validateFile(file)) {
      setSelectedFile(file);
      setValue("document", file, { shouldValidate: true });
    }
  };

  const handleFileInputChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0] || null;
    handleFileSelect(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0] || null;
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setValue("document", undefined, { shouldValidate: true });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
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

    if (!data.leaveType) {
      toast.error("Please select a leave type");
      return;
    }

    const days = calculateDays(data.startDate, data.endDate);
    if (days <= 0) {
      toast.error("Invalid date range");
      return;
    }

    setLoading(true);
    try {
      await leaveService.createLeaveRequest({
        leaveTypeId: data.leaveType,
        startDate: data.startDate.toISOString().split("T")[0],
        endDate: data.endDate.toISOString().split("T")[0],
        reason: data.reason,
        document: data.document,
      });
      toast.success("Leave application submitted successfully!");
      reset();
      setSelectedType(null);
      setSelectedFile(null);
      onClose();
      if (onSuccess) {
        onSuccess();
      }
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
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Apply for Leave</DialogTitle>
          <DialogDescription>Submit a new leave application</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="leaveType">
              Leave Type <span className="text-destructive">*</span>
            </Label>
            <Select onValueChange={handleTypeChange}>
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
                onChange={handleStartDateChange}
                minDate={new Date()}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                wrapperClassName="w-full"
                customInput={<Input id="startDate" readOnly />}
                dateFormat="yyyy-MM-dd"
                placeholderText="Select start date"
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
                onChange={handleEndDateChange}
                minDate={startDate || new Date()}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                wrapperClassName="w-full"
                customInput={<Input id="endDate" readOnly />}
                dateFormat="yyyy-MM-dd"
                placeholderText="Select end date"
              />
              {errors.endDate && (
                <p className="text-sm text-destructive">End date is required</p>
              )}
            </div>
          </div>

          {calculatedDays > 0 && (
            <div className="bg-orange-50 border border-orange-200 p-4 rounded-lg">
              <p className="text-sm text-orange-800">
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
              <Label htmlFor="document">
                Document <span className="text-destructive">*</span>
              </Label>

              {!selectedFile ? (
                <div
                  className={cn(
                    "relative border-2 border-dashed rounded-lg p-6 transition-colors cursor-pointer",
                    isDragging
                      ? "border-orange-500 bg-orange-50"
                      : "border-slate-300 hover:border-orange-400 hover:bg-slate-50",
                    errors.document && "border-red-500"
                  )}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    ref={fileInputRef}
                    id="document"
                    type="file"
                    className="hidden"
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    onChange={handleFileInputChange}
                  />
                  <div className="flex flex-col items-center justify-center text-center">
                    <Upload
                      className={cn(
                        "h-10 w-10 mb-3",
                        isDragging ? "text-orange-500" : "text-slate-400"
                      )}
                    />
                    <p className="text-sm font-medium text-slate-700 mb-1">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-xs text-slate-500">
                      PDF, DOC, DOCX, JPG, or PNG (max 10MB)
                    </p>
                  </div>
                </div>
              ) : (
                <div className="border border-slate-200 rounded-lg p-4 bg-slate-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                          <FileText className="h-5 w-5 text-orange-600" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-800 truncate">
                          {selectedFile.name}
                        </p>
                        <p className="text-xs text-slate-500">
                          {formatFileSize(selectedFile.size)}
                        </p>
                      </div>
                      <div className="flex-shrink-0">
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="ml-2 h-8 w-8 text-slate-500 hover:text-red-600 hover:bg-red-50"
                      onClick={handleRemoveFile}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}

              <input
                type="hidden"
                {...register("document", {
                  required: selectedType.requiresDocument
                    ? "Document is required"
                    : false,
                  validate: (value) => {
                    if (
                      selectedType.requiresDocument &&
                      !value &&
                      !selectedFile
                    ) {
                      return "Document is required";
                    }
                    return true;
                  },
                })}
              />

              {errors.document && (
                <p className="text-sm text-destructive">
                  {errors.document.message}
                </p>
              )}
            </div>
          )}

          <div className="flex gap-3 justify-end pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
              disabled={loading}
            >
              {loading ? "Submitting..." : "Submit Application"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

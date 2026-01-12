"use client";

import React, { useEffect, useState, useMemo } from "react";
import { leaveService } from "@/lib/api/leave";
import { LeaveApplication } from "@/types";
import { formatDate } from "@/utils/dateUtils";
import toast from "react-hot-toast";
import { getErrorMessage } from "@/utils/errorUtils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useUserNames } from "@/hooks/useUserNames";

export default function ColleaguesOnLeave() {
  const [colleagues, setColleagues] = useState<LeaveApplication[]>([]);
  const [loading, setLoading] = useState(true);

  // Memoize userIds to prevent creating new array on every render
  const userIds = useMemo(() => {
    return colleagues.map((colleague) => colleague.userId).filter(Boolean);
  }, [colleagues]);

  const { getUserName, loading: namesLoading } = useUserNames(userIds);

  useEffect(() => {
    loadColleagues();
  }, []);

  const loadColleagues = async () => {
    try {
      const response = await leaveService.getCurrentlyOnLeave();
      setColleagues(response.content);
    } catch (error: unknown) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="border-slate-200 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-slate-50 to-white border-b border-slate-200">
          <CardTitle>Colleagues on Leave</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-500">Loading...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-slate-200 shadow-lg">
      <CardHeader className="bg-gradient-to-r from-slate-50 to-white border-b border-slate-200">
        <CardTitle>Colleagues on Leave</CardTitle>
      </CardHeader>
      <CardContent>
        {colleagues.length === 0 ? (
          <p className="text-slate-500 text-center py-4">
            No colleagues currently on leave
          </p>
        ) : (
          <div className="space-y-3">
            {colleagues.map((colleague) => (
              <div
                key={colleague.id}
                className="border-b border-slate-200 pb-3 last:border-0"
              >
                <p className="font-medium text-slate-800">
                  {namesLoading ? "Loading..." : getUserName(colleague.userId)}
                </p>
                <p className="text-sm text-slate-600">
                  {formatDate(colleague.startDate)} -{" "}
                  {formatDate(colleague.endDate)}
                </p>
                <p className="text-xs text-slate-500">
                  {colleague.leaveTypeName ||
                    (colleague.leaveType
                      ? colleague.leaveType.replace(/_/g, " ").toLowerCase()
                      : "N/A")}
                </p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

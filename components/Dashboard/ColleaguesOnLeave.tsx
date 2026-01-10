"use client";

import React, { useEffect, useState } from "react";
import { leaveService } from "@/lib/api/leave";
import { LeaveApplication } from "@/types";
import { formatDate } from "@/utils/dateUtils";
import toast from "react-hot-toast";
import { getErrorMessage } from "@/utils/errorUtils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ColleaguesOnLeave() {
  const [colleagues, setColleagues] = useState<LeaveApplication[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadColleagues();
  }, []);

  const loadColleagues = async () => {
    try {
      const data = await leaveService.getColleaguesOnLeave();
      setColleagues(data);
    } catch (error: unknown) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Colleagues on Leave</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-[var(--color-muted-foreground)]">Loading...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Colleagues on Leave</CardTitle>
      </CardHeader>
      <CardContent>
        {colleagues.length === 0 ? (
          <p className="text-[var(--color-muted-foreground)]">
            No colleagues currently on leave
          </p>
        ) : (
          <div className="space-y-3">
            {colleagues.map((colleague) => (
              <div
                key={colleague.id}
                className="border-b border-[var(--color-border)] pb-3 last:border-0"
              >
                <p className="font-medium">{colleague.employeeName}</p>
                <p className="text-sm text-[var(--color-muted-foreground)]">
                  {formatDate(colleague.startDate)} -{" "}
                  {formatDate(colleague.endDate)}
                </p>
                <p className="text-xs text-[var(--color-muted-foreground)] capitalize">
                  {colleague.leaveType.replace(/_/g, " ").toLowerCase()}
                </p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

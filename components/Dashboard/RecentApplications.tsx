"use client";

import React from "react";
import Link from "next/link";
import { LeaveApplication, LeaveStatus } from "@/types";
import { formatDate } from "@/utils/dateUtils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface RecentApplicationsProps {
  applications: LeaveApplication[];
}

export default function RecentApplications({
  applications,
}: RecentApplicationsProps) {
  const getStatusVariant = (
    status: LeaveStatus
  ): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case LeaveStatus.APPROVED:
        return "default";
      case LeaveStatus.REJECTED:
        return "destructive";
      case LeaveStatus.REQUESTED:
      case LeaveStatus.PENDING:
        return "secondary";
      default:
        return "outline";
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Recent Applications</CardTitle>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/leave/my">View All</Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {applications.length === 0 ? (
          <p className="text-[var(--color-muted-foreground)] text-center py-4">
            No applications yet
          </p>
        ) : (
          <div className="space-y-4">
            {applications.slice(0, 5).map((app) => (
              <div
                key={app.id}
                className="border-b border-[var(--color-border)] pb-4 last:border-0"
              >
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <p className="font-medium">
                      {app.leaveTypeName ||
                        (app.leaveType
                          ? app.leaveType.replace(/_/g, " ").toLowerCase()
                          : "N/A")}
                    </p>
                    <p className="text-sm text-[var(--color-muted-foreground)]">
                      {formatDate(app.startDate)} - {formatDate(app.endDate)}
                    </p>
                    <p className="text-sm text-[var(--color-muted-foreground)]">
                      {app.numberOfDays || app.days || 0} days
                    </p>
                  </div>
                  <Badge variant={getStatusVariant(app.status)}>
                    {app.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

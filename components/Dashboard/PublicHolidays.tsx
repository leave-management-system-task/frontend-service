"use client";

import React, { useEffect, useState } from "react";
import { leaveService } from "@/lib/api/leave";
import { PublicHoliday } from "@/types";
import { formatDate } from "@/utils/dateUtils";
import toast from "react-hot-toast";
import { getErrorMessage } from "@/utils/errorUtils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function PublicHolidays() {
  const [holidays, setHolidays] = useState<PublicHoliday[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHolidays();
  }, []);

  const loadHolidays = async () => {
    try {
      const response = await leaveService.getUpcomingPublicHolidays({
        size: 5,
      });
      setHolidays(response.content);
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
          <CardTitle>Upcoming Holidays</CardTitle>
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
        <CardTitle>Upcoming Holidays</CardTitle>
      </CardHeader>
      <CardContent>
        {holidays.length === 0 ? (
          <p className="text-[var(--color-muted-foreground)]">
            No upcoming holidays
          </p>
        ) : (
          <div className="space-y-3">
            {holidays.map((holiday) => (
              <div
                key={holiday.id}
                className="border-b border-[var(--color-border)] pb-3 last:border-0"
              >
                <p className="font-medium">{holiday.name}</p>
                <p className="text-sm text-[var(--color-muted-foreground)]">
                  {formatDate(holiday.date)}
                </p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

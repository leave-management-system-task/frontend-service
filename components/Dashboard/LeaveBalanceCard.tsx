"use client";

import React from "react";
import { LeaveBalance } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface LeaveBalanceCardProps {
  balance: LeaveBalance;
}

export default function LeaveBalanceCard({ balance }: LeaveBalanceCardProps) {
  const percentage = (balance.availableDays / balance.totalDays) * 100;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg capitalize">
          {balance.leaveType.replace(/_/g, " ").toLowerCase()}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-[var(--color-muted-foreground)]">
              Available
            </span>
            <span className="font-semibold">{balance.availableDays} days</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-[var(--color-muted-foreground)]">Used</span>
            <span>{balance.usedDays} days</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-[var(--color-muted-foreground)]">Total</span>
            <span>{balance.totalDays} days</span>
          </div>
          {balance.carryoverDays > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-[var(--color-muted-foreground)]">
                Carryover
              </span>
              <span className="text-[var(--color-primary)] font-medium">
                {balance.carryoverDays} days
              </span>
            </div>
          )}
          {balance.expiresAt && (
            <div className="text-xs text-[var(--color-muted-foreground)] mt-2">
              Expires: {new Date(balance.expiresAt).toLocaleDateString()}
            </div>
          )}
        </div>
        <div className="space-y-1">
          <div className="w-full bg-[var(--color-secondary)] rounded-full h-2">
            <div
              className="bg-[var(--color-primary)] h-2 rounded-full transition-all"
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

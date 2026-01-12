"use client";

import React from "react";
import { LeaveBalance } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface LeaveBalanceCardProps {
  balance: LeaveBalance;
}

export default function LeaveBalanceCard({ balance }: LeaveBalanceCardProps) {
  const totalDays = balance.totalAllocated || balance.totalDays || 0;
  const availableDays = balance.availableDays || 0;
  const percentage = totalDays > 0 ? (availableDays / totalDays) * 100 : 0;
  const carryoverDays = balance.carriedOverDays || balance.carryoverDays || 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">
          {balance.leaveTypeName || (balance.leaveType ? balance.leaveType.replace(/_/g, " ").toLowerCase() : "N/A")}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-[var(--color-muted-foreground)]">
              Available
            </span>
            <span className="font-semibold">{availableDays} days</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-[var(--color-muted-foreground)]">Used</span>
            <span>{balance.usedDays || 0} days</span>
          </div>
          {balance.pendingDays > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-[var(--color-muted-foreground)]">Pending</span>
              <span className="text-yellow-600">{balance.pendingDays} days</span>
            </div>
          )}
          <div className="flex justify-between text-sm">
            <span className="text-[var(--color-muted-foreground)]">Total</span>
            <span>{totalDays} days</span>
          </div>
          {carryoverDays > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-[var(--color-muted-foreground)]">
                Carryover
              </span>
              <span className="text-[var(--color-primary)] font-medium">
                {carryoverDays} days
              </span>
            </div>
          )}
          {balance.accruedDays > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-[var(--color-muted-foreground)]">
                Accrued
              </span>
              <span className="text-green-600">{balance.accruedDays} days</span>
            </div>
          )}
        </div>
        <div className="space-y-1">
          <div className="w-full bg-[var(--color-secondary)] rounded-full h-2">
            <div
              className="bg-[var(--color-primary)] h-2 rounded-full transition-all"
              style={{ width: `${Math.min(percentage, 100)}%` }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

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
    <Card className="border-slate-200 shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden">
      <div className="h-2 bg-gradient-to-r from-orange-500 via-orange-400 to-orange-500"></div>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold text-slate-800">
          {balance.leaveTypeName ||
            (balance.leaveType
              ? balance.leaveType.replace(/_/g, " ").toLowerCase()
              : "N/A")}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-slate-600 font-medium text-sm">
              Available
            </span>
            <span className="font-bold text-xl text-orange-600">
              {availableDays}
            </span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
            <div
              className="bg-gradient-to-r from-orange-500 to-orange-600 h-3 rounded-full transition-all duration-500 shadow-sm"
              style={{ width: `${Math.min(percentage, 100)}%` }}
            />
          </div>
          <p className="text-xs text-slate-500">
            {percentage.toFixed(1)}% remaining
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100">
          <div className="bg-slate-50 rounded-lg p-3">
            <span className="text-slate-600 text-xs font-medium block mb-1">
              Total
            </span>
            <span className="font-bold text-lg text-slate-800">
              {totalDays}
            </span>
            <span className="text-xs text-slate-500 ml-1">days</span>
          </div>
          <div className="bg-slate-50 rounded-lg p-3">
            <span className="text-slate-600 text-xs font-medium block mb-1">
              Used
            </span>
            <span className="font-bold text-lg text-slate-800">
              {balance.usedDays || 0}
            </span>
            <span className="text-xs text-slate-500 ml-1">days</span>
          </div>
        </div>
        {(balance.pendingDays > 0 ||
          carryoverDays > 0 ||
          balance.accruedDays > 0) && (
          <div className="space-y-2 pt-2 border-t border-slate-100">
            {balance.pendingDays > 0 && (
              <div className="flex justify-between items-center bg-yellow-50 rounded-lg p-2">
                <span className="text-slate-600 text-sm font-medium">
                  Pending
                </span>
                <span className="font-semibold text-yellow-700">
                  {balance.pendingDays} days
                </span>
              </div>
            )}
            {carryoverDays > 0 && (
              <div className="flex justify-between items-center bg-orange-50 rounded-lg p-2">
                <span className="text-slate-600 text-sm font-medium">
                  Carryover
                </span>
                <span className="font-semibold text-orange-700">
                  {carryoverDays} days
                </span>
              </div>
            )}
            {balance.accruedDays > 0 && (
              <div className="flex justify-between items-center bg-green-50 rounded-lg p-2">
                <span className="text-slate-600 text-sm font-medium">
                  Accrued
                </span>
                <span className="font-semibold text-green-700">
                  {balance.accruedDays} days
                </span>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

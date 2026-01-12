"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Layout from "@/components/Layout/Layout";
import LeaveBalanceCard from "@/components/Dashboard/LeaveBalanceCard";
import RecentApplications from "@/components/Dashboard/RecentApplications";
import ColleaguesOnLeave from "@/components/Dashboard/ColleaguesOnLeave";
import PublicHolidays from "@/components/Dashboard/PublicHolidays";
import { leaveService } from "@/lib/api/leave";
import { LeaveBalance, LeaveApplication } from "@/types";
import toast from "react-hot-toast";
import Link from "next/link";
import { getErrorMessage } from "@/utils/errorUtils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [leaveBalances, setLeaveBalances] = useState<LeaveBalance[]>([]);
  const [recentApplications, setRecentApplications] = useState<
    LeaveApplication[]
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    try {
      const [balancesResponse, applicationsResponse] = await Promise.all([
        leaveService.getMyLeaveBalances({ size: 100 }),
        leaveService.getMyLeaveRequests({ size: 10 }),
      ]);
      setLeaveBalances(balancesResponse.content);
      setRecentApplications(
        applicationsResponse.content.sort(
          (a, b) =>
            new Date(b.createdAt || b.submittedAt || "").getTime() -
            new Date(a.createdAt || a.submittedAt || "").getTime()
        )
      );
    } catch (error: unknown) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
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

  if (!user) {
    return null;
  }

  const isAdmin = user.role === "ADMIN";
  const isManager = user.role === "MANAGER";
  const isStaff = user.role === "STAFF";

  return (
    <Layout>
      <div className="space-y-8">
        {/* Welcome Section */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-orange-500 via-orange-600 to-orange-700 p-8 text-white shadow-xl">
          <div className="relative z-10">
            <h1 className="text-4xl font-bold mb-2">
              Welcome back, {user.firstName}! 👋
            </h1>
            <p className="text-orange-100 text-lg">
              {isAdmin
                ? "Manage leave requests and system settings"
                : isManager
                  ? "Review leave requests and manage your team"
                  : "Track your leave balance and manage your requests"}
            </p>
          </div>
          <div className="absolute top-0 right-0 -mt-4 -mr-4 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 -mb-4 -ml-4 w-48 h-48 bg-white/10 rounded-full blur-3xl"></div>
        </div>

        {/* Leave Balances - Only show for Staff and Managers */}
        {!isAdmin && leaveBalances.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-slate-800 mb-4">
              Your Leave Balances
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {leaveBalances.map((balance) => (
                <LeaveBalanceCard
                  key={balance.id || balance.leaveTypeId}
                  balance={balance}
                />
              ))}
            </div>
          </div>
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Applications - Only show for Staff and Managers */}
          {!isAdmin && <RecentApplications applications={recentApplications} />}

          {/* Quick Actions */}
          <Card className="border-slate-200 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-slate-50 to-white border-b border-slate-200">
              <CardTitle className="text-xl font-semibold text-slate-800">
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 pt-6">
              {!isAdmin && (
                <Button
                  asChild
                  variant="outline"
                  className="w-full border-slate-300 hover:bg-slate-50"
                >
                  <Link href="/leave/my">View My Applications</Link>
                </Button>
              )}
              {(isManager || isAdmin) && (
                <Button
                  asChild
                  variant="default"
                  className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-md"
                >
                  <Link href="/leave/approvals">Pending Approvals</Link>
                </Button>
              )}
              {isAdmin && (
                <>
                  <Button
                    asChild
                    variant="default"
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-md"
                  >
                    <Link href="/admin">Admin Panel</Link>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    className="w-full border-slate-300 hover:bg-slate-50"
                  >
                    <Link href="/admin/public-holidays">
                      Manage Public Holidays
                    </Link>
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Additional Sections - Only show for Staff and Managers */}
        {!isAdmin && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ColleaguesOnLeave />
            <PublicHolidays />
          </div>
        )}
      </div>
    </Layout>
  );
}

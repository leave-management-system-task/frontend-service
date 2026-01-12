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

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-2 text-gray-600">Welcome back, {user.firstName}!</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {leaveBalances.map((balance) => (
            <LeaveBalanceCard key={balance.id || balance.leaveTypeId} balance={balance} />
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RecentApplications applications={recentApplications} />

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button asChild className="w-full">
                <Link href="/leave/apply">Apply for Leave</Link>
              </Button>
              <Button asChild variant="outline" className="w-full">
                <Link href="/leave/my">View My Applications</Link>
              </Button>
              {(user.role === "MANAGER" || user.role === "ADMIN") && (
                <Button
                  asChild
                  variant="default"
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  <Link href="/leave/approvals">Pending Approvals</Link>
                </Button>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ColleaguesOnLeave />
          <PublicHolidays />
        </div>
      </div>
    </Layout>
  );
}

"use client";

import React, { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Layout from "@/components/Layout/Layout";
import LeaveTypeManager from "@/components/Admin/LeaveTypeManager";
import LeaveBalanceAdjustment from "@/components/Admin/LeaveBalanceAdjustment";
import ReportGenerator from "@/components/Admin/ReportGenerator";
import { UserRole } from "@/types";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function AdminPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    } else if (user && user.role !== UserRole.ADMIN) {
      router.push("/dashboard");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user || user.role !== UserRole.ADMIN) {
    return null;
  }

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header Section */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800 via-slate-700 to-slate-800 p-8 text-white shadow-xl">
          <div className="relative z-10">
            <h1 className="text-4xl font-bold mb-2">Admin Panel</h1>
            <p className="text-slate-200 text-lg">
              Manage leave types, balances, public holidays, and generate
              reports
            </p>
          </div>
          <div className="absolute top-0 right-0 -mt-4 -mr-4 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 -mb-4 -ml-4 w-48 h-48 bg-white/10 rounded-full blur-3xl"></div>
        </div>

        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="flex flex-wrap gap-4">
            <Button
              asChild
              className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-md"
            >
              <Link href="/admin/public-holidays">Manage Public Holidays</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="border-slate-300 hover:bg-slate-50"
            >
              <Link href="/leave/approvals">View Pending Approvals</Link>
            </Button>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="lg:col-span-2">
              <LeaveTypeManager />
            </div>
            <LeaveBalanceAdjustment />
            <div id="reports">
              <ReportGenerator />
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

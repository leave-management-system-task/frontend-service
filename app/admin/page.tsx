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
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Panel</h1>
          <p className="mt-2 text-gray-600">
            Manage leave types, balances, and generate reports
          </p>
        </div>

        <div className="space-y-6">
          <div className="flex gap-4">
            <Button asChild variant="outline">
              <Link href="/admin/public-holidays">Manage Public Holidays</Link>
            </Button>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="lg:col-span-2">
              <LeaveTypeManager />
            </div>
            <LeaveBalanceAdjustment />
            <ReportGenerator />
          </div>
        </div>
      </div>
    </Layout>
  );
}

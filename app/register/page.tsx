"use client";

import React from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import RegisterForm from "@/components/Auth/RegisterForm";
import Link from "next/link";

export default function RegisterPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
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

  if (user) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-orange-50/30 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-orange-500 bg-clip-text text-transparent">
            Create Account
          </h1>
          <p className="mt-2 text-center text-sm text-slate-600">
            Join the Leave Management System
          </p>
        </div>
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-slate-200">
          <RegisterForm />
        </div>
        <p className="text-center text-sm text-slate-600">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-semibold text-orange-600 hover:text-orange-700 transition-colors"
          >
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
}

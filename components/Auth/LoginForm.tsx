"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { AxiosError } from "axios";
import { ApiErrorResponse } from "@/utils/errorUtils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface LoginFormData {
  email: string;
  password: string;
  twoFactorCode?: string;
}

export default function LoginForm() {
  const { login } = useAuth();
  const router = useRouter();
  const [requiresTwoFactor, setRequiresTwoFactor] = useState(false);
  const [loading, setLoading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>();

  const onSubmit = async (data: LoginFormData) => {
    setLoading(true);
    try {
      await login(data.email, data.password, data.twoFactorCode);
      toast.success("Login successful!");
      router.push("/dashboard");
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        const response = error.response?.data as
          | (ApiErrorResponse & { requiresTwoFactor?: boolean })
          | undefined;
        if (response?.requiresTwoFactor) {
          setRequiresTwoFactor(true);
          toast.error("Please enter your 2FA code");
        } else {
          toast.error(response?.message || "Login failed");
        }
      } else {
        toast.error("Login failed");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl text-center">Login</CardTitle>
        <CardDescription className="text-center">
          Enter your credentials to access your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              {...register("email", { required: "Email is required" })}
              placeholder="name@example.com"
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              {...register("password", { required: "Password is required" })}
              placeholder="Enter your password"
            />
            {errors.password && (
              <p className="text-sm text-destructive">
                {errors.password.message}
              </p>
            )}
          </div>

          {requiresTwoFactor && (
            <div className="space-y-2">
              <Label htmlFor="twoFactorCode">
                Two-Factor Authentication Code
              </Label>
              <Input
                id="twoFactorCode"
                type="text"
                {...register("twoFactorCode", {
                  required: "2FA code is required",
                })}
                placeholder="Enter 6-digit code"
                maxLength={6}
              />
              {errors.twoFactorCode && (
                <p className="text-sm text-destructive">
                  {errors.twoFactorCode.message}
                </p>
              )}
            </div>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

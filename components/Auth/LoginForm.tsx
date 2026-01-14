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
import TwoFactorVerificationModal from "./TwoFactorVerificationModal";
import { Eye, EyeOff } from "lucide-react";

interface LoginFormData {
  email: string;
  password: string;
}

export default function LoginForm() {
  const { login, verifyTwoFactorAfterLogin, pending2FA } = useAuth();
  const router = useRouter();
  const [show2FAModal, setShow2FAModal] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>();

  const onSubmit = async (data: LoginFormData) => {
    setLoading(true);
    try {
      const result = await login(data.email, data.password);

      if (result.requiresTwoFactor) {
        // Show 2FA modal instead of inline field
        setUserEmail(result.userEmail || data.email);
        setShow2FAModal(true);
        toast.success("Please verify your 2FA code to complete login");
      } else {
        // Login successful, redirect
        toast.success("Login successful!");
        router.push("/dashboard");
      }
    } catch (error: unknown) {
      // Handle Axios errors
      if (error instanceof AxiosError) {
        const response = error.response?.data as
          | (ApiErrorResponse & { requiresTwoFactor?: boolean })
          | undefined;
        if (response?.requiresTwoFactor) {
          setUserEmail(data.email);
          setShow2FAModal(true);
          toast.error("Please enter your 2FA code");
        } else {
          toast.error(response?.message || "Login failed");
        }
      } else if (error instanceof Error) {
        toast.error(error.message || "Login failed");
      } else {
        toast.error("Login failed");
      }
    } finally {
      setLoading(false);
    }
  };

  const handle2FAVerified = async () => {
    setShow2FAModal(false);
    toast.success("Login successful!");
    router.push("/dashboard");
  };

  const handle2FACancel = () => {
    setShow2FAModal(false);
    // Optionally logout or clear state
    toast.error("2FA verification cancelled");
  };

  return (
    <>
      <div className="space-y-6">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-slate-800">Login</h2>
          <p className="text-sm text-slate-600 mt-1">
            Enter your credentials to access your account
          </p>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">
              Email <span className="text-destructive">*</span>
            </Label>
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
            <Label htmlFor="password">
              Password <span className="text-destructive">*</span>
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                {...register("password", { required: "Password is required" })}
                placeholder="Enter your password"
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 focus:outline-none"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="text-sm text-destructive">
                {errors.password.message}
              </p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-md"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </Button>
        </form>
      </div>

      <TwoFactorVerificationModal
        open={show2FAModal || pending2FA}
        onVerified={handle2FAVerified}
        onCancel={handle2FACancel}
        userEmail={userEmail}
      />
    </>
  );
}

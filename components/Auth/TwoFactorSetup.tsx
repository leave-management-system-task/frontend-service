"use client";

import React, { useState, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";
import { authService } from "@/lib/api/auth";
import toast from "react-hot-toast";
import { getErrorMessage } from "@/utils/errorUtils";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function TwoFactorSetup() {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");
  const [secret, setSecret] = useState<string>("");
  const [verificationCode, setVerificationCode] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    checkTwoFactorStatus();
  }, []);

  const checkTwoFactorStatus = async () => {
    try {
      const user = await authService.getCurrentUser();
      setEnabled(user.twoFactorEnabled);
    } catch (error) {
      console.error("Failed to check 2FA status:", error);
    }
  };

  const handleEnable = async () => {
    setLoading(true);
    try {
      const response = await authService.enableTwoFactor();
      if (response.qrCodeUrl) {
        setQrCodeUrl(response.qrCodeUrl);
      }
      if (response.secret) {
        setSecret(response.secret);
      }
      toast.success(
        "2FA enabled! Scan the QR code with your authenticator app."
      );
    } catch (error: unknown) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      toast.error("Please enter a valid 6-digit code");
      return;
    }

    setVerifying(true);
    try {
      const response =
        await authService.verifyAndEnableTwoFactor(verificationCode);
      if (response.enabled) {
        setEnabled(true);
        setQrCodeUrl("");
        setSecret("");
        setVerificationCode("");
        toast.success(response.message || "2FA enabled successfully!");
        // Refresh user data to get updated 2FA status
        await checkTwoFactorStatus();
      } else {
        toast.error("Verification failed. Please try again.");
      }
    } catch (error: unknown) {
      toast.error(getErrorMessage(error));
    } finally {
      setVerifying(false);
    }
  };

  const handleDisable = async () => {
    if (
      !confirm(
        "Are you sure you want to disable 2FA? This will reduce your account security."
      )
    ) {
      return;
    }

    setLoading(true);
    try {
      await authService.disableTwoFactor();
      setEnabled(false);
      setQrCodeUrl("");
      setSecret("");
      setVerificationCode("");
      toast.success("2FA disabled successfully");
    } catch (error: unknown) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  if (enabled && !qrCodeUrl) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Two-Factor Authentication</CardTitle>
          <CardDescription>
            2FA is currently enabled on your account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            variant="destructive"
            onClick={handleDisable}
            disabled={loading}
          >
            {loading ? "Disabling..." : "Disable 2FA"}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Two-Factor Authentication</CardTitle>
        <CardDescription>
          Add an extra layer of security to your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!qrCodeUrl ? (
          <div className="space-y-4">
            <p className="text-[var(--color-muted-foreground)]">
              Enable two-factor authentication to add an extra layer of security
              to your account.
            </p>
            <Button onClick={handleEnable} disabled={loading}>
              {loading ? "Enabling..." : "Enable 2FA"}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-[var(--color-muted-foreground)]">
              Scan this QR code with your Google Authenticator app or any
              compatible authenticator app:
            </p>
            <div className="flex justify-center">
              <QRCodeSVG value={qrCodeUrl} size={200} />
            </div>
            {secret && (
              <div className="bg-[var(--color-muted)] p-4 rounded-md">
                <p className="text-sm text-[var(--color-muted-foreground)] mb-1">
                  Manual entry code:
                </p>
                <p className="font-mono text-sm">{secret}</p>
              </div>
            )}
            <p className="text-sm text-[var(--color-muted-foreground)]">
              After scanning, enter the 6-digit code from your authenticator app
              to complete setup.
            </p>
            <div className="space-y-2">
              <Label htmlFor="verificationCode">Verification Code</Label>
              <Input
                id="verificationCode"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                value={verificationCode}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "");
                  setVerificationCode(value);
                }}
                placeholder="000000"
                className="text-center text-lg tracking-widest"
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleVerify}
                disabled={verifying || verificationCode.length !== 6}
                className="flex-1"
              >
                {verifying ? "Verifying..." : "Verify & Complete Setup"}
              </Button>
              <Button
                variant="destructive"
                onClick={handleDisable}
                disabled={verifying}
              >
                Cancel Setup
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

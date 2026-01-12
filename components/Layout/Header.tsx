"use client";

import React from "react";
import { useAuth } from "@/context/AuthContext";
import { Menu, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  onMenuClick: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  return (
    <header className="sticky top-0 z-30 w-full border-b border-slate-200/80 bg-white/80 backdrop-blur-md supports-[backdrop-filter]:bg-white/60 shadow-sm">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={onMenuClick}
              className="lg:hidden text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            >
              <Menu className="h-5 w-5" />
            </Button>
            <div className="hidden lg:block">
              <h2 className="text-lg font-semibold text-slate-800">
                {user.role === "ADMIN"
                  ? "Administration"
                  : user.role === "MANAGER"
                    ? "Management"
                    : "Leave Management"}
              </h2>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="icon"
              className="text-slate-600 hover:text-slate-900 hover:bg-slate-100 relative"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-orange-500 rounded-full"></span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}

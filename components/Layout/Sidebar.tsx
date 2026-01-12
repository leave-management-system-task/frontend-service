"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { UserRole } from "@/types";
import {
  LayoutDashboard,
  FileText,
  Calendar,
  CheckCircle2,
  Settings,
  CalendarDays,
  BarChart3,
  Building2,
  LogOut,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

export default function Sidebar({ isOpen, onToggle }: SidebarProps) {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  interface NavItem {
    name: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
    roles: UserRole[];
    scrollTo?: string;
  }

  // Navigation items for Staff (employees)
  const staffNavigation: NavItem[] = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
      roles: [UserRole.STAFF, UserRole.MANAGER],
    },
    {
      name: "My Leave Requests",
      href: "/leave/my",
      icon: FileText,
      roles: [UserRole.STAFF, UserRole.MANAGER],
    },
    {
      name: "Leave Approvals",
      href: "/leave/approvals",
      icon: CheckCircle2,
      roles: [UserRole.MANAGER],
    },
    {
      name: "Settings",
      href: "/settings",
      icon: Settings,
      roles: [UserRole.STAFF, UserRole.MANAGER],
    },
  ];

  // Navigation items for Admin (not workers)
  const adminNavigation: NavItem[] = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
      roles: [UserRole.ADMIN],
    },
    {
      name: "Leave Approvals",
      href: "/leave/approvals",
      icon: CheckCircle2,
      roles: [UserRole.ADMIN],
    },
    {
      name: "Admin Panel",
      href: "/admin",
      icon: Building2,
      roles: [UserRole.ADMIN],
    },
    {
      name: "Public Holidays",
      href: "/admin/public-holidays",
      icon: CalendarDays,
      roles: [UserRole.ADMIN],
    },
    {
      name: "Reports",
      href: "/admin",
      icon: BarChart3,
      roles: [UserRole.ADMIN],
      scrollTo: "reports",
    },
    {
      name: "Settings",
      href: "/settings",
      icon: Settings,
      roles: [UserRole.ADMIN],
    },
  ];

  const navigation =
    user?.role === UserRole.ADMIN ? adminNavigation : staffNavigation;

  const visibleNav = navigation.filter(
    (item) => user && item.roles.includes(user.role)
  );

  const isActive = (href: string, item: NavItem) => {
    // Special handling for dashboard
    if (href === "/dashboard") {
      return pathname === "/dashboard";
    }

    // Special handling for admin panel vs reports
    // Both have href="/admin" but Reports has scrollTo
    if (href === "/admin") {
      if (item.scrollTo) {
        // Reports link - never highlight as active (it's just a scroll action)
        return false;
      } else {
        // Admin Panel link - active if on /admin
        return pathname === "/admin";
      }
    }

    // For other links, check exact match first
    if (pathname === href) {
      return true;
    }

    // For nested paths, use startsWith
    return pathname.startsWith(href + "/");
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-50 h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white transition-transform duration-300 ease-in-out lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full",
          "w-64 border-r border-slate-700/50 shadow-2xl"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-700/50">
            <Link href="/dashboard" className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg">
                <Calendar className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-orange-400 to-orange-300 bg-clip-text text-transparent">
                  LMS
                </h1>
                <p className="text-xs text-slate-400">Leave Management</p>
              </div>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggle}
              className="lg:hidden text-slate-300 hover:text-white hover:bg-slate-700/50"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4 space-y-1">
            {visibleNav.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href, item);
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => {
                    if (item.scrollTo) {
                      const element = document.getElementById(item.scrollTo);
                      if (element) {
                        element.scrollIntoView({ behavior: "smooth" });
                      }
                    }
                    if (window.innerWidth < 1024) {
                      onToggle();
                    }
                  }}
                  className={cn(
                    "flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 group",
                    active
                      ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/30"
                      : "text-slate-300 hover:bg-slate-700/50 hover:text-white"
                  )}
                >
                  <Icon
                    className={cn(
                      "h-5 w-5 transition-transform group-hover:scale-110",
                      active ? "text-white" : "text-slate-400"
                    )}
                  />
                  <span className="font-medium">{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* User section */}
          <div className="p-4 border-t border-slate-700/50">
            <div className="flex items-center space-x-3 px-4 py-3 rounded-lg bg-slate-800/50">
              {user?.avatar ? (
                <Image
                  src={user.avatar}
                  alt={`${user.firstName} ${user.lastName}`}
                  width={40}
                  height={40}
                  className="rounded-full ring-2 ring-orange-500/50"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white font-semibold ring-2 ring-orange-500/50">
                  {user?.firstName[0]}
                  {user?.lastName[0]}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-slate-400 truncate">
                  {user?.role === UserRole.ADMIN
                    ? "Administrator"
                    : user?.role === UserRole.MANAGER
                      ? "Manager"
                      : "Employee"}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              onClick={logout}
              className="w-full mt-3 text-slate-300 hover:text-white hover:bg-red-600/20 hover:border-red-500/50 border border-slate-700/50"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </aside>
    </>
  );
}

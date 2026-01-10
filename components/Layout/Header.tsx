"use client";

import React from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { UserRole } from "@/types";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

export default function Header() {
  const { user, logout } = useAuth();

  const navigation = [
    {
      name: "Dashboard",
      href: "/dashboard",
      roles: [UserRole.STAFF, UserRole.MANAGER, UserRole.ADMIN],
    },
    {
      name: "My Leave",
      href: "/leave/my",
      roles: [UserRole.STAFF, UserRole.MANAGER, UserRole.ADMIN],
    },
    {
      name: "Apply Leave",
      href: "/leave/apply",
      roles: [UserRole.STAFF, UserRole.MANAGER],
    },
    {
      name: "Approvals",
      href: "/leave/approvals",
      roles: [UserRole.MANAGER, UserRole.ADMIN],
    },
    { name: "Admin", href: "/admin", roles: [UserRole.ADMIN] },
    {
      name: "Settings",
      href: "/settings",
      roles: [UserRole.STAFF, UserRole.MANAGER, UserRole.ADMIN],
    },
  ];

  const visibleNav = navigation.filter(
    (item) => user && item.roles.includes(user.role)
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[var(--color-border)] bg-[var(--color-background)]/95 backdrop-blur supports-[backdrop-filter]:bg-[var(--color-background)]/60">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link href="/dashboard" className="flex items-center">
              <span className="text-xl font-bold text-[var(--color-primary)]">
                LMS
              </span>
            </Link>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-4">
              {visibleNav.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="inline-flex items-center px-3 py-2 text-sm font-medium transition-colors hover:text-[var(--color-primary)]"
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
          <div className="flex items-center space-x-4">
            {user && (
              <>
                <div className="flex items-center space-x-2">
                  {user.avatar ? (
                    <Image
                      src={user.avatar}
                      alt={`${user.firstName} ${user.lastName}`}
                      width={32}
                      height={32}
                      className="rounded-full"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-[var(--color-primary)] flex items-center justify-center text-[var(--color-primary-foreground)] text-sm font-medium">
                      {user.firstName[0]}
                      {user.lastName[0]}
                    </div>
                  )}
                  <span className="text-sm hidden sm:inline-block">
                    {user.firstName} {user.lastName}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={logout}
                  className="gap-2"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:inline">Logout</span>
                </Button>
              </>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
}

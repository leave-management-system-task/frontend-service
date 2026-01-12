"use client";

import React, { useState } from "react";
import { usePathname } from "next/navigation";
import Header from "./Header";
import Sidebar from "./Sidebar";
import { useAuth } from "@/context/AuthContext";

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Don't show sidebar on login/register pages
  const showSidebar = user && !["/login", "/register"].includes(pathname);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      {showSidebar && (
        <Sidebar
          isOpen={sidebarOpen}
          onToggle={() => setSidebarOpen(!sidebarOpen)}
        />
      )}
      <div className={showSidebar ? "lg:pl-64" : ""}>
        {showSidebar && (
          <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        )}
        <main className="min-h-screen">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

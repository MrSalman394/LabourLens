"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BrandMark } from "@/components/brand-mark";
import { ThemeToggle } from "@/components/theme-toggle";
import { EmployerProfileView } from "@/components/profile/employer-profile-view";
import { ApiClient } from "@/lib/api";
import {
  LogOut,
  Building2,
  ShieldAlert,
  Loader2,
  Briefcase,
} from "lucide-react";

export default function EmployerDashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function initUser() {
      try {
        const currentUser = await ApiClient.getMe();
        if (currentUser) {
          setUser(currentUser);
        } else {
          const cached = ApiClient.getCurrentUser();
          if (cached) setUser(cached);
        }
      } catch {
        // Handled by Next.js middleware
      } finally {
        setLoading(false);
      }
    }
    initUser();
  }, []);

  const handleLogout = async () => {
    try {
      await ApiClient.logout();
      router.push("/login");
    } catch {
      router.push("/login");
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f8faf8]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-800" />
          <p className="text-xs text-slate-500 font-medium">Loading Employer Portal...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8faf8] text-slate-900 flex flex-col justify-between">
      {/* Top Navigation */}
      <div>
        <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
          <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-4">
              <Link href="/" aria-label="LabourLens Home">
                <BrandMark />
              </Link>
              <span className="hidden items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-emerald-800 border border-emerald-200 sm:inline-flex">
                <Building2 className="h-3.5 w-3.5" /> Employer Portal
              </span>
            </div>

            <div className="flex items-center gap-3">
              <ThemeToggle />
              <div className="hidden text-right text-xs sm:block">
                <p className="font-semibold text-slate-900">{user?.displayName || user?.email || "Employer"}</p>
                <p className="text-slate-500 font-medium">{user?.email || "Verified Organization"}</p>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-rose-600 transition shadow-sm"
              >
                <LogOut className="h-3.5 w-3.5" /> Sign out
              </button>
            </div>
          </div>
        </header>

        {/* Employer Profile & Talent Management Hub */}
        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <EmployerProfileView />
        </main>
      </div>

      {/* Persistent Safety Disclaimer */}
      <footer className="mt-12 border-t border-slate-200 bg-white py-6">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <div className="mx-auto flex max-w-2xl items-center justify-center gap-2 text-xs text-slate-500">
            <ShieldAlert className="h-4 w-4 flex-shrink-0 text-amber-600" />
            <span>
              <strong>Safety Notice:</strong> LabourLens conducts identity and document verification to enhance transparency.
              However, verification does NOT guarantee personal safety or service outcome. Always exercise independent judgment.
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}

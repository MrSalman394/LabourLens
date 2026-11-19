"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { BrandMark } from "@/components/brand-mark";
import { ThemeToggle } from "@/components/theme-toggle";
import { WorkerProfileView } from "@/components/profile/worker-profile-view";
import { EmployerProfileView } from "@/components/profile/employer-profile-view";
import { ApiClient } from "@/lib/api";
import {
  ShieldAlert,
  LogOut,
  User,
  ArrowRight,
  Lock,
  Loader2,
  CheckCircle2,
} from "lucide-react";

export default function RoleDashboardPage({ params }: { params: { role: string } }) {
  const { role } = params;
  const [user, setUser] = useState<any>(null);
  const [tokenExists, setTokenExists] = useState<boolean>(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginCnic, setLoginCnic] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("labourlens_token") : null;
    const storedUser = ApiClient.getCurrentUser();
    if (token) {
      setTokenExists(true);
      setUser(storedUser);
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoggingIn(true);
      setAuthError(null);
      const res = await ApiClient.login(loginCnic.replace(/[\s-]/g, ""), loginPassword);
      ApiClient.setTokens(res.accessToken, res.refreshToken);
      ApiClient.setCurrentUser(res.user);
      setUser(res.user);
      setTokenExists(true);
    } catch (err: any) {
      setAuthError(err.message || "Invalid credentials");
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleQuickDemoLogin = async (demoRole: "worker" | "employer") => {
    try {
      setIsLoggingIn(true);
      setAuthError(null);
      const timestamp = Date.now();
      const demoEmail = `demo.${demoRole}.${timestamp}@labourlens.pk`;
      const demoCnic = `${String(timestamp).slice(-10).padStart(10, "0")}${Math.floor(Math.random() * 1000).toString().padStart(3, "0")}`;
      const demoPassword = "StrongPassword123!";

      let res: any;
      if (demoRole === "worker") {
        res = await ApiClient.registerWorker({
          cnic: demoCnic,
          email: demoEmail,
          password: demoPassword,
          confirmPassword: demoPassword,
          displayName: "Rashid Ali",
          phone: "+923001234567",
          gender: "MALE",
          experienceMonths: 48,
          preferredEngagementType: "DAILY",
          bio: "Senior industrial electrician and wiring specialist based in Islamabad.",
        });
      } else {
        res = await ApiClient.registerEmployer({
          cnic: demoCnic,
          email: demoEmail,
          password: demoPassword,
          confirmPassword: demoPassword,
          displayName: "Apex Builders Pvt Ltd",
          employerType: "CONTRACTOR",
          phone: "+923009876543",
          ntnTaxNumber: "1234567-8",
          description: "General engineering contractor for commercial building projects.",
        });
      }

      ApiClient.setTokens(res.accessToken, res.refreshToken);
      ApiClient.setCurrentUser(res.user);
      setUser(res.user);
      setTokenExists(true);
    } catch (err: any) {
      setAuthError(err.message || "Demo registration failed. Please ensure the backend is running on port 4000.");
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = () => {
    ApiClient.clearTokens();
    setUser(null);
    setTokenExists(false);
  };

  if (role !== "worker" && role !== "employer" && role !== "admin") {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center px-5 text-center">
        <h1 className="text-2xl font-bold text-slate-900">Dashboard not found</h1>
        <p className="mt-2 text-sm text-slate-500">The requested role dashboard does not exist.</p>
        <Link href="/" className="mt-4 text-sm font-semibold text-emerald-800">
          Return home ↗
        </Link>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8faf8] text-slate-900">
      {/* Top Navigation */}
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <Link href="/" aria-label="LabourLens Home">
              <BrandMark />
            </Link>
            <span className="hidden rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-emerald-800 border border-emerald-200 sm:inline-block">
              {role.toUpperCase()} PORTAL
            </span>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            {tokenExists ? (
              <>
                <div className="hidden text-right text-xs sm:block">
                  <p className="font-semibold text-slate-900">{user?.displayName || user?.email || "User"}</p>
                  <p className="text-slate-500">{role.toUpperCase()}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                >
                  <LogOut className="h-3.5 w-3.5" /> Sign out
                </button>
              </>
            ) : (
              <Link
                href="/sign-in"
                className="rounded-xl bg-emerald-800 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-emerald-900 transition"
              >
                Sign in
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {!tokenExists ? (
          <div className="mx-auto max-w-md rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-800">
              <Lock className="h-6 w-6" />
            </div>
            <h2 className="mt-4 text-xl font-bold tracking-tight text-slate-900">
              {role === "worker" ? "Worker Profile Access" : "Employer Profile Access"}
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Sign in to manage your {role} profile, availability, trade skills, and PostGIS location.
            </p>

            {authError && (
              <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800">
                {authError}
              </div>
            )}

            <form onSubmit={handleLogin} className="mt-5 space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700">CNIC Number</label>
                <input
                  type="text"
                  required
                  inputMode="numeric"
                  maxLength={15}
                  placeholder="XXXXX-XXXXXXX-X"
                  value={loginCnic}
                  onChange={e => setLoginCnic(formatCnic(e.target.value))}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm outline-none focus:border-emerald-700"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">Password</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={loginPassword}
                  onChange={e => setLoginPassword(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm outline-none focus:border-emerald-700"
                />
              </div>

              <button
                type="submit"
                disabled={isLoggingIn}
                className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-800 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-emerald-900 transition disabled:opacity-50"
              >
                {isLoggingIn ? <Loader2 className="h-4 w-4 animate-spin" /> : "Sign in to Dashboard"}
              </button>
            </form>

            <div className="mt-6 border-t border-slate-100 pt-5">
              <p className="text-center text-xs font-semibold text-slate-500">Or use instant demo profile:</p>
              <button
                type="button"
                onClick={() => handleQuickDemoLogin(role === "worker" ? "worker" : "employer")}
                disabled={isLoggingIn}
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 py-2.5 text-xs font-semibold text-emerald-800 hover:bg-emerald-100 transition disabled:opacity-50"
              >
                <CheckCircle2 className="h-4 w-4" /> Quick Launch Demo {role.toUpperCase()}
              </button>
            </div>
          </div>
        ) : role === "worker" ? (
          <WorkerProfileView />
        ) : role === "employer" ? (
          <EmployerProfileView />
        ) : (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900">Admin Dashboard</h2>
            <p className="mt-1 text-sm text-slate-500">
              Platform administration, governance, and audit log oversight module.
            </p>
          </div>
        )}
      </main>

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

function formatCnic(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 13);
  if (digits.length <= 5) return digits;
  if (digits.length <= 12) return `${digits.slice(0, 5)}-${digits.slice(5)}`;
  return `${digits.slice(0, 5)}-${digits.slice(5, 12)}-${digits.slice(12)}`;
}

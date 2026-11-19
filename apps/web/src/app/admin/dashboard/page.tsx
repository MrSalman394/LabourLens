"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BrandMark } from "@/components/brand-mark";
import { ThemeToggle } from "@/components/theme-toggle";
import { ApiClient } from "@/lib/api";
import {
  ShieldCheck,
  ShieldAlert,
  Users,
  Building2,
  Wrench,
  KeyRound,
  LogOut,
  Loader2,
  Activity,
  Lock,
  Terminal,
  Clock,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

export default function AdminDashboardPage() {
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
        // Handled by middleware
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
          <p className="text-xs text-slate-500 font-medium">Authenticating Admin Session...</p>
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
              <span className="items-center gap-1.5 rounded-full bg-rose-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-rose-800 border border-rose-200 inline-flex">
                <ShieldCheck className="h-3.5 w-3.5 text-rose-700" /> Admin Console
              </span>
            </div>

            <div className="flex items-center gap-3">
              <ThemeToggle />
              <div className="hidden text-right text-xs sm:block">
                <p className="font-semibold text-slate-900">{user?.displayName || "System Administrator"}</p>
                <p className="text-slate-500 font-medium">{user?.email || "admin@labourlens.pk"}</p>
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

        {/* Admin Overview & Metrics Hub */}
        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
          {/* Header Banner */}
          <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-700">
                  Security & Platform Governance
                </span>
                <h1 className="mt-3 text-2xl font-bold tracking-tight text-slate-900">
                  Platform Administration Dashboard
                </h1>
                <p className="mt-1 text-xs text-slate-500">
                  Full-stack authentication telemetry, role-based access control (RBAC), and security oversight.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 rounded-2xl bg-emerald-50 border border-emerald-200 px-3.5 py-2 text-xs font-semibold text-emerald-800">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
                  </span>
                  Argon2id & JWT Auth Online
                </div>
              </div>
            </div>
          </div>

          {/* Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">Total Workers</span>
                <div className="rounded-xl bg-emerald-50 p-2 text-emerald-800">
                  <Wrench className="h-4 w-4" />
                </div>
              </div>
              <p className="mt-3 text-2xl font-bold text-slate-900">Active</p>
              <p className="mt-1 text-[11px] text-slate-500">PostGIS geocoded & categorized</p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">Total Employers</span>
                <div className="rounded-xl bg-blue-50 p-2 text-blue-800">
                  <Building2 className="h-4 w-4" />
                </div>
              </div>
              <p className="mt-3 text-2xl font-bold text-slate-900">Active</p>
              <p className="mt-1 text-[11px] text-slate-500">Household & commercial accounts</p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">Auth Sessions</span>
                <div className="rounded-xl bg-purple-50 p-2 text-purple-800">
                  <KeyRound className="h-4 w-4" />
                </div>
              </div>
              <p className="mt-3 text-2xl font-bold text-slate-900">Rotated</p>
              <p className="mt-1 text-[11px] text-slate-500">Single-use SHA-256 tokens</p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">Security Architecture</span>
                <div className="rounded-xl bg-amber-50 p-2 text-amber-800">
                  <ShieldCheck className="h-4 w-4" />
                </div>
              </div>
              <p className="mt-3 text-2xl font-bold text-slate-900">Enforced</p>
              <p className="mt-1 text-[11px] text-slate-500">httpOnly Cookies + RBAC</p>
            </div>
          </div>

          {/* Security Protocols & RBAC Architecture */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-2">
                <Lock className="h-5 w-5 text-emerald-800" />
                <h2 className="text-base font-bold text-slate-900">Production Authentication Architecture</h2>
              </div>
              <p className="mt-1 text-xs text-slate-500">
                Core security measures applied across LabourLens infrastructure:
              </p>

              <div className="mt-5 space-y-3.5 text-xs text-slate-600">
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-emerald-600 mt-0.5" />
                  <div>
                    <strong className="text-slate-900">Argon2id Password Hashing:</strong> Passwords hashed using OWASP memory-hard parameters (64MB memory, 3 iterations, 4 parallelism). Plaintext passwords never logged or retained.
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-emerald-600 mt-0.5" />
                  <div>
                    <strong className="text-slate-900">Strict Cookie Storage:</strong> Tokens are never stored in localStorage. Tokens are delivered via httpOnly, SameSite=Lax cookies to prevent XSS credential theft.
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-emerald-600 mt-0.5" />
                  <div>
                    <strong className="text-slate-900">Refresh Token Rotation:</strong> Every token refresh issues a new SHA-256 hashed refresh token and revokes the predecessor. Token reuse automatically revokes the entire session lineage.
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-emerald-600 mt-0.5" />
                  <div>
                    <strong className="text-slate-900">Next.js Edge Middleware RBAC:</strong> Edge guards strictly enforce route boundaries between <code>/worker/*</code>, <code>/employer/*</code>, and <code>/admin/*</code>.
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-2">
                <Terminal className="h-5 w-5 text-slate-800" />
                <h2 className="text-base font-bold text-slate-900">Admin Account Governance & CLI</h2>
              </div>
              <p className="mt-1 text-xs text-slate-500">
                Administrative security rules and provisioning commands:
              </p>

              <div className="mt-4 rounded-xl bg-slate-900 p-4 text-xs font-mono text-emerald-400">
                <p className="text-slate-400"># Provisioning an administrator account securely:</p>
                <p className="mt-1 text-slate-200">cd apps/api</p>
                <p className="text-slate-200">npm run seed:admin</p>
                <p className="mt-2 text-slate-400"># Output:</p>
                <p className="text-emerald-400">✓ Admin account verified/created: admin@labourlens.pk</p>
                <p className="text-emerald-400">✓ Role assigned: ADMIN</p>
              </div>

              <div className="mt-4 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
                <AlertTriangle className="h-4 w-4 flex-shrink-0 text-amber-700 mt-0.5" />
                <span>
                  <strong>Strict Governance:</strong> Public users cannot register as administrators through web endpoints. The <code>UserRole.ADMIN</code> role can only be granted via the secure server-side provisioning script.
                </span>
              </div>
            </div>
          </div>
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

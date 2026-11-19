"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { BrandMark } from "@/components/brand-mark";
import { ThemeToggle } from "@/components/theme-toggle";
import { ApiClient } from "@/lib/api";
import {
  Lock,
  Fingerprint,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  ShieldCheck,
  ShieldAlert,
  ArrowRight,
} from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectParam = searchParams.get("redirect");

  const [cnic, setCnic] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);

      const normalizedCnic = cnic.replace(/[\s-]/g, "");
      if (!/^\d{13}$/.test(normalizedCnic)) {
        setError("Enter a valid CNIC with exactly 13 digits.");
        return;
      }
      const res = await ApiClient.login(normalizedCnic, password, rememberMe);
      const roles: string[] = res.user?.roles || [];

      // Determine redirect path
      if (redirectParam && redirectParam.startsWith("/") && !redirectParam.startsWith("//")) {
        // Enforce role boundary on redirect target
        if (redirectParam.startsWith("/admin") && !roles.includes("ADMIN")) {
          // Prevent non-admin redirect to admin
          if (roles.includes("EMPLOYER")) router.push("/employer/dashboard");
          else router.push("/worker/dashboard");
          return;
        }
        if (redirectParam.startsWith("/employer") && !roles.includes("EMPLOYER") && !roles.includes("ADMIN")) {
          router.push("/worker/dashboard");
          return;
        }
        if (redirectParam.startsWith("/worker") && !roles.includes("WORKER") && !roles.includes("ADMIN")) {
          router.push("/employer/dashboard");
          return;
        }
        router.push(redirectParam);
        return;
      }

      // Default role-based routing
      if (roles.includes("ADMIN")) {
        router.push("/admin/dashboard");
      } else if (roles.includes("EMPLOYER")) {
        router.push("/employer/dashboard");
      } else if (roles.includes("WORKER")) {
        router.push("/worker/dashboard");
      } else {
        router.push("/");
      }
    } catch (err: any) {
      setError(err.message || "Invalid CNIC or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="mb-8 flex items-center justify-between">
        <Link href="/" aria-label="LabourLens Home"><BrandMark /></Link>
        <ThemeToggle />
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm sm:p-9">
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-800 border border-emerald-200">
            Secure Sign In
          </span>
          <span className="flex items-center gap-1 text-[11px] font-medium text-slate-500">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
            Argon2id Encrypted
          </span>
        </div>

        <h1 className="mt-4 text-2xl font-bold tracking-tight text-slate-900">
          Welcome to LabourLens
        </h1>
        <p className="mt-1 text-xs text-slate-500">
          Sign in to access your worker profile, employer dashboard, or administrative tools.
        </p>

        {error && (
          <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800">
            <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-700">CNIC Number (Required)</label>
            <div className="relative mt-1">
              <Fingerprint className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
              <input
                type="text"
                required
                autoComplete="username"
                inputMode="numeric"
                maxLength={15}
                placeholder="XXXXX-XXXXXXX-X"
                value={cnic}
                onChange={(e) => setCnic(formatCnic(e.target.value))}
                aria-describedby="cnic-hint"
                className="w-full rounded-xl border border-slate-200 pl-10 pr-3.5 py-2.5 text-sm outline-none transition focus:border-emerald-700 focus:ring-1 focus:ring-emerald-700"
              />
            </div>
            <p id="cnic-hint" className="mt-1 text-[11px] text-slate-500">Use your 13 digit CNIC number.</p>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-700">Password</label>
              <Link
                href="/forgot-password"
                className="text-xs font-semibold text-emerald-800 hover:underline"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative mt-1">
              <Lock className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
              <input
                type={showPassword ? "text" : "password"}
                required
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-slate-200 pl-10 pr-10 py-2.5 text-sm outline-none transition focus:border-emerald-700 focus:ring-1 focus:ring-emerald-700"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 focus:outline-none"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-600">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-emerald-800 focus:ring-emerald-700"
              />
              <span>Remember me for 7 days</span>
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-800 py-3 text-sm font-semibold text-white shadow-sm hover:bg-emerald-900 transition disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Signing In...
              </>
            ) : (
              <>
                Sign In to LabourLens <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-slate-500">
          Do not have an account yet?{" "}
          <Link className="font-semibold text-emerald-800 hover:underline" href="/register">
            Register as Worker or Employer
          </Link>
        </p>
      </div>

      <div className="mt-6 flex items-start gap-2 text-center justify-center text-[11px] text-slate-400">
        <ShieldAlert className="h-4 w-4 flex-shrink-0 text-slate-400" />
        <span>
          Safety Notice: LabourLens authenticates identities with cryptographic security.
        </span>
      </div>
    </div>
  );
}

function formatCnic(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 13);
  if (digits.length <= 5) return digits;
  if (digits.length <= 12) return `${digits.slice(0, 5)}-${digits.slice(5)}`;
  return `${digits.slice(0, 5)}-${digits.slice(5, 12)}-${digits.slice(12)}`;
}

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-5 py-12 bg-[#f8faf8]">
      <Suspense
        fallback={
          <div className="flex items-center justify-center p-12">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-800" />
          </div>
        }
      >
        <LoginForm />
      </Suspense>
    </main>
  );
}

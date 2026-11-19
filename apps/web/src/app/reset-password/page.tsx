"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { BrandMark } from "@/components/brand-mark";
import { ApiClient } from "@/lib/api";
import {
  Lock,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  ShieldAlert,
} from "lucide-react";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Password Strength Evaluation
  const hasMinLength = newPassword.length >= 8;
  const hasUpperCase = /[A-Z]/.test(newPassword);
  const hasLowerCase = /[a-z]/.test(newPassword);
  const hasNumber = /[0-9]/.test(newPassword);
  const hasSpecial = /[^A-Za-z0-9]/.test(newPassword);
  const passwordsMatch = newPassword.length > 0 && newPassword === confirmPassword;
  const isPasswordValid = hasMinLength && hasUpperCase && hasLowerCase && hasNumber && hasSpecial;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      setError("Password reset token is missing from URL. Please use the exact link sent to your email.");
      return;
    }

    if (!isPasswordValid) {
      setError("Please ensure your password meets all complexity requirements.");
      return;
    }

    if (!passwordsMatch) {
      setError("Passwords do not match. Please re-enter.");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      await ApiClient.resetPassword({
        token,
        newPassword,
        confirmPassword,
      });

      setSuccess(true);
    } catch (err: any) {
      setError(err.message || "Failed to reset password. The link may have expired or been used already.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <Link href="/" className="inline-block mb-8" aria-label="LabourLens Home">
        <BrandMark />
      </Link>

      <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm sm:p-9">
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-800 border border-emerald-200">
            Password Reset
          </span>
          <span className="flex items-center gap-1 text-[11px] font-medium text-slate-500">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
            Argon2id Hashed
          </span>
        </div>

        <h1 className="mt-4 text-2xl font-bold tracking-tight text-slate-900">
          Create New Password
        </h1>
        <p className="mt-1 text-xs text-slate-500">
          Set a secure new password for your LabourLens account.
        </p>

        {!token && (
          <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
            <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5 text-amber-700" />
            <span>
              No reset token detected in the link. Please check your recovery email and copy the full URL.
            </span>
          </div>
        )}

        {error && (
          <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800">
            <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {success ? (
          <div className="mt-6 space-y-4">
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-5 text-emerald-900">
              <div className="flex items-center gap-2 font-semibold text-sm">
                <CheckCircle2 className="h-5 w-5 text-emerald-700" />
                <span>Password Reset Successful</span>
              </div>
              <p className="mt-2 text-xs text-emerald-800 leading-relaxed">
                Your password has been securely updated and all prior active sessions have been revoked.
                You can now log in with your new credentials.
              </p>
            </div>

            <button
              type="button"
              onClick={() => router.push("/login")}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-800 py-3 text-sm font-semibold text-white shadow-sm hover:bg-emerald-900 transition"
            >
              Sign In Now <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-700">New Password</label>
              <div className="relative mt-1">
                <Lock className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="new-password"
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 pl-10 pr-10 py-2.5 text-sm outline-none transition focus:border-emerald-700 focus:ring-1 focus:ring-emerald-700"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 focus:outline-none"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              {/* Password Checklist */}
              {newPassword.length > 0 && (
                <div className="mt-2.5 rounded-xl border border-slate-100 bg-slate-50 p-2.5 text-[11px] space-y-1">
                  <div className={`flex items-center gap-1.5 ${hasMinLength ? "text-emerald-700 font-medium" : "text-slate-400"}`}>
                    <CheckCircle2 className={`h-3.5 w-3.5 ${hasMinLength ? "text-emerald-600" : "text-slate-300"}`} />
                    <span>Minimum 8 characters</span>
                  </div>
                  <div className={`flex items-center gap-1.5 ${hasUpperCase && hasLowerCase ? "text-emerald-700 font-medium" : "text-slate-400"}`}>
                    <CheckCircle2 className={`h-3.5 w-3.5 ${hasUpperCase && hasLowerCase ? "text-emerald-600" : "text-slate-300"}`} />
                    <span>Both uppercase and lowercase letters</span>
                  </div>
                  <div className={`flex items-center gap-1.5 ${hasNumber && hasSpecial ? "text-emerald-700 font-medium" : "text-slate-400"}`}>
                    <CheckCircle2 className={`h-3.5 w-3.5 ${hasNumber && hasSpecial ? "text-emerald-600" : "text-slate-300"}`} />
                    <span>At least one number and one symbol (!@#$%^&*)</span>
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700">Confirm New Password</label>
              <div className="relative mt-1">
                <Lock className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  autoComplete="new-password"
                  placeholder="Re-enter new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 pl-10 pr-10 py-2.5 text-sm outline-none transition focus:border-emerald-700 focus:ring-1 focus:ring-emerald-700"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 focus:outline-none"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {confirmPassword.length > 0 && !passwordsMatch && (
                <p className="mt-1 text-[11px] text-rose-600 font-medium">Passwords do not match</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || !token}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-800 py-3 text-sm font-semibold text-white shadow-sm hover:bg-emerald-900 transition disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Updating Password...
                </>
              ) : (
                "Update Password"
              )}
            </button>
          </form>
        )}

        <p className="mt-6 text-center text-xs text-slate-500">
          Remember your password?{" "}
          <Link className="font-semibold text-emerald-800 hover:underline" href="/login">
            Return to Sign In
          </Link>
        </p>
      </div>

      <div className="mt-6 flex items-start gap-2 text-center justify-center text-[11px] text-slate-400">
        <ShieldAlert className="h-4 w-4 flex-shrink-0 text-slate-400" />
        <span>
          Safety Notice: Password reset invalidates active refresh tokens across all sessions.
        </span>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-12 bg-[#f8faf8]">
      <Suspense
        fallback={
          <div className="flex items-center justify-center p-12">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-800" />
          </div>
        }
      >
        <ResetPasswordForm />
      </Suspense>
    </main>
  );
}

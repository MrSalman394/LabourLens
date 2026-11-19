"use client";

import React, { useState } from "react";
import Link from "next/link";
import { BrandMark } from "@/components/brand-mark";
import { ThemeToggle } from "@/components/theme-toggle";
import { ApiClient } from "@/lib/api";
import {
  Mail,
  Loader2,
  AlertCircle,
  CheckCircle2,
  ArrowLeft,
  ShieldCheck,
  ShieldAlert,
} from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      await ApiClient.forgotPassword(email);
      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || "Failed to process password recovery request");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-12 bg-[#f8faf8]">
      <div className="w-full max-w-md">
        <div className="mb-8 flex items-center justify-between">
          <Link href="/" aria-label="LabourLens Home"><BrandMark /></Link>
          <ThemeToggle />
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm sm:p-9">
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-800 border border-emerald-200">
              Account Recovery
            </span>
            <span className="flex items-center gap-1 text-[11px] font-medium text-slate-500">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
              15-Min Expiring Token
            </span>
          </div>

          <h1 className="mt-4 text-2xl font-bold tracking-tight text-slate-900">
            Forgot Password
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            Enter your registered email address to receive secure password recovery instructions.
          </p>

          {submitted ? (
            <div className="mt-6 space-y-4">
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-5 text-emerald-900">
                <div className="flex items-center gap-2 font-semibold text-sm">
                  <CheckCircle2 className="h-5 w-5 text-emerald-700" />
                  <span>Request Processed</span>
                </div>
                <p className="mt-2 text-xs text-emerald-800 leading-relaxed">
                  If an account associated with <strong>{email}</strong> exists in LabourLens, a single-use
                  recovery token has been generated. The reset link remains valid for 15 minutes.
                </p>
              </div>

              <p className="text-xs text-slate-500 leading-relaxed">
                Check your spam or junk folder if you do not receive the email within a couple of minutes.
              </p>

              <div className="pt-2">
                <Link
                  href="/login"
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                >
                  <ArrowLeft className="h-4 w-4" /> Back to Sign In
                </Link>
              </div>
            </div>
          ) : (
            <>
              {error && (
                <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800">
                  <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700">Registered Email Address</label>
                  <div className="relative mt-1">
                    <Mail className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                    <input
                      type="email"
                      required
                      autoComplete="email"
                      placeholder="you@labourlens.pk"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 pl-10 pr-3.5 py-2.5 text-sm outline-none transition focus:border-emerald-700 focus:ring-1 focus:ring-emerald-700"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-800 py-3 text-sm font-semibold text-white shadow-sm hover:bg-emerald-900 transition disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Generating Reset Token...
                    </>
                  ) : (
                    "Send Password Reset Link"
                  )}
                </button>
              </form>

              <div className="mt-6 border-t border-slate-100 pt-5 text-center">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-emerald-800 transition"
                >
                  <ArrowLeft className="h-3.5 w-3.5" /> Return to Login
                </Link>
              </div>
            </>
          )}
        </div>

        <div className="mt-6 flex items-start gap-2 text-center justify-center text-[11px] text-slate-400">
          <ShieldAlert className="h-4 w-4 flex-shrink-0 text-slate-400" />
          <span>
            Anti-Enumeration Protected: LabourLens never reveals whether an email is registered.
          </span>
        </div>
      </div>
    </main>
  );
}

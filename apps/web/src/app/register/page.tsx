"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BrandMark } from "@/components/brand-mark";
import { ApiClient } from "@/lib/api";
import {
  Wrench,
  Building2,
  Loader2,
  AlertCircle,
  ShieldAlert,
  ShieldCheck,
  Eye,
  EyeOff,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [role, setRole] = useState<"WORKER" | "EMPLOYER">("WORKER");

  useEffect(() => {
    const requestedRole = new URLSearchParams(window.location.search).get("role");
    if (requestedRole === "worker") setRole("WORKER");
    if (requestedRole === "employer") setRole("EMPLOYER");
  }, []);

  // Common Fields
  const [email, setEmail] = useState("");
  const [cnic, setCnic] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [phone, setPhone] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Worker-specific Fields
  const [experienceMonths, setExperienceMonths] = useState<number>(24);
  const [preferredEngagementType, setPreferredEngagementType] = useState<string>("DAILY");

  // Employer-specific Fields
  const [employerType, setEmployerType] = useState<string>("INDIVIDUAL_HOUSEHOLD");
  const [companyName, setCompanyName] = useState("");

  // Submission States
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Password Strength Evaluation
  const hasMinLength = password.length >= 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[@$!%*?&#^~_-]/.test(password);
  const passwordsMatch = password.length > 0 && password === confirmPassword;
  const isPasswordValid = hasMinLength && hasUpperCase && hasLowerCase && hasNumber && hasSpecial;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isPasswordValid) {
      setError("Please ensure your password meets all complexity requirements.");
      return;
    }

    const normalizedCnic = cnic.replace(/[\s-]/g, "");
    if (!/^\d{13}$/.test(normalizedCnic)) {
      setError("Enter a valid CNIC with exactly 13 digits.");
      return;
    }

    if (!passwordsMatch) {
      setError("Passwords do not match. Please re-enter.");
      return;
    }

    if (!acceptTerms) {
      setError("You must accept the terms of service and safety notice to register.");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      if (role === "WORKER") {
        await ApiClient.registerWorker({
          cnic: normalizedCnic,
          email,
          password,
          confirmPassword,
          displayName,
          phone: phone || undefined,
          experienceMonths,
          preferredEngagementType,
          acceptTerms,
        });
        router.push("/worker/dashboard");
      } else {
        await ApiClient.registerEmployer({
          cnic: normalizedCnic,
          email,
          password,
          confirmPassword,
          displayName,
          employerType,
          phone: phone || undefined,
          companyName: companyName || undefined,
          acceptTerms,
        });
        router.push("/employer/dashboard");
      }
    } catch (err: any) {
      setError(err.message || "Registration failed. Please check your information and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-12 bg-[#f8faf8]">
      <div className="w-full max-w-lg">
        <Link href="/" className="inline-block mb-8" aria-label="LabourLens Home">
          <BrandMark />
        </Link>

        <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm sm:p-9">
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-800 border border-emerald-200">
              Account Registration
            </span>
            <span className="flex items-center gap-1 text-[11px] font-medium text-slate-500">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
              Argon2id Secure
            </span>
          </div>

          <h1 className="mt-4 text-2xl font-bold tracking-tight text-slate-900">
            Join LabourLens Pakistan
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            Select your account type to begin trade matching, workforce management, or skilled labor hiring.
          </p>

          {/* Role Selection Tabs */}
          <div className="mt-6 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setRole("WORKER")}
              className={`flex flex-col items-center gap-2 rounded-2xl border p-4 text-center transition ${
                role === "WORKER"
                  ? "border-emerald-700 bg-emerald-50/50 text-emerald-900 shadow-sm"
                  : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
              }`}
            >
              <div
                className={`rounded-xl p-2.5 ${
                  role === "WORKER" ? "bg-emerald-800 text-white" : "bg-slate-100 text-slate-600"
                }`}
              >
                <Wrench className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-bold">I am a Worker</p>
                <p className="mt-0.5 text-[10px] text-slate-500">Electrician, Plumber, Mason, etc.</p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setRole("EMPLOYER")}
              className={`flex flex-col items-center gap-2 rounded-2xl border p-4 text-center transition ${
                role === "EMPLOYER"
                  ? "border-emerald-700 bg-emerald-50/50 text-emerald-900 shadow-sm"
                  : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
              }`}
            >
              <div
                className={`rounded-xl p-2.5 ${
                  role === "EMPLOYER" ? "bg-emerald-800 text-white" : "bg-slate-100 text-slate-600"
                }`}
              >
                <Building2 className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-bold">I am an Employer</p>
                <p className="mt-0.5 text-[10px] text-slate-500">Household, Contractor, Business</p>
              </div>
            </button>
          </div>

          {error && (
            <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800">
              <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-700">
                {role === "WORKER" ? "Full Name (Legal or Trade Name)" : "Representative Name"}
              </label>
              <input
                type="text"
                required
                placeholder={role === "WORKER" ? "Muhammad Tariq" : "Ahmad Raza"}
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none transition focus:border-emerald-700 focus:ring-1 focus:ring-emerald-700"
              />
            </div>

            {role === "EMPLOYER" && (
              <>
                <div>
                  <label className="text-xs font-semibold text-slate-700">Employer Category</label>
                  <select
                    value={employerType}
                    onChange={(e) => setEmployerType(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none transition focus:border-emerald-700 bg-white"
                  >
                    <option value="INDIVIDUAL_HOUSEHOLD">Individual / Household</option>
                    <option value="SMALL_BUSINESS">Small Business / Workshop</option>
                    <option value="CONTRACTOR">General Contractor / Builder</option>
                    <option value="ENTERPRISE">Industrial Enterprise</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700">
                    Company / Organization Name (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Apex Engineering Pvt Ltd"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none transition focus:border-emerald-700 focus:ring-1 focus:ring-emerald-700"
                  />
                </div>
              </>
            )}

            <div>
              <label className="text-xs font-semibold text-slate-700">CNIC Number (Required)</label>
              <input
                type="text"
                required
                autoComplete="off"
                inputMode="numeric"
                maxLength={15}
                placeholder="XXXXX-XXXXXXX-X"
                value={cnic}
                onChange={(e) => setCnic(formatCnic(e.target.value))}
                aria-describedby="register-cnic-hint"
                className="mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none transition focus:border-emerald-700 focus:ring-1 focus:ring-emerald-700"
              />
              <p id="register-cnic-hint" className="mt-1 text-[11px] text-slate-500">Your CNIC is used to sign in and is not shown on public profiles.</p>
            </div>

            {role === "WORKER" && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700">Prior Experience</label>
                  <select
                    value={experienceMonths}
                    onChange={(e) => setExperienceMonths(Number(e.target.value))}
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none transition focus:border-emerald-700 bg-white"
                  >
                    <option value={6}>Under 1 Year</option>
                    <option value={24}>2 Years</option>
                    <option value={48}>4 Years</option>
                    <option value={84}>7+ Years</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700">Engagement Type</label>
                  <select
                    value={preferredEngagementType}
                    onChange={(e) => setPreferredEngagementType(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none transition focus:border-emerald-700 bg-white"
                  >
                    <option value="DAILY">Daily Wage</option>
                    <option value="HOURLY">Hourly</option>
                    <option value="CONTRACT">Contract / Project</option>
                    <option value="FULL_TIME">Full Time</option>
                  </select>
                </div>
              </div>
            )}

            <div>
              <label className="text-xs font-semibold text-slate-700">Email Address</label>
              <input
                type="email"
                required
                autoComplete="email"
                placeholder="you@example.pk"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none transition focus:border-emerald-700 focus:ring-1 focus:ring-emerald-700"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700">Mobile Phone (+92 format, optional)</label>
              <input
                type="tel"
                placeholder="+923001234567"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none transition focus:border-emerald-700 focus:ring-1 focus:ring-emerald-700"
              />
            </div>

            {/* Password Fields */}
            <div>
              <label className="text-xs font-semibold text-slate-700">Password</label>
              <div className="relative mt-1">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="new-password"
                  placeholder="Create a strong password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 pl-3.5 pr-10 py-2.5 text-sm outline-none transition focus:border-emerald-700 focus:ring-1 focus:ring-emerald-700"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 focus:outline-none"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              {/* Password Requirement Checklist */}
              {password.length > 0 && (
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
              <label className="text-xs font-semibold text-slate-700">Confirm Password</label>
              <div className="relative mt-1">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  autoComplete="new-password"
                  placeholder="Re-enter your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 pl-3.5 pr-10 py-2.5 text-sm outline-none transition focus:border-emerald-700 focus:ring-1 focus:ring-emerald-700"
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

            {/* Terms and Safety Notice Checkbox */}
            <div className="pt-2">
              <label className="flex items-start gap-2.5 cursor-pointer text-xs text-slate-600">
                <input
                  type="checkbox"
                  required
                  checked={acceptTerms}
                  onChange={(e) => setAcceptTerms(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-slate-300 text-emerald-800 focus:ring-emerald-700"
                />
                <span>
                  I agree to the LabourLens Terms of Service and acknowledge the safety disclaimer.
                  Verification documents enhance platform integrity but do not replace independent judgment.
                </span>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-800 py-3 text-sm font-semibold text-white shadow-sm hover:bg-emerald-900 transition disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Registering...
                </>
              ) : (
                <>
                  Register as {role === "WORKER" ? "Worker" : "Employer"} <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-slate-500">
            Already registered on LabourLens?{" "}
            <Link className="font-semibold text-emerald-800 hover:underline" href="/login">
              Sign in to your account
            </Link>
          </p>
        </div>

        <div className="mt-6 flex items-start gap-2 text-center justify-center text-[11px] text-slate-400">
          <ShieldAlert className="h-4 w-4 flex-shrink-0 text-slate-400" />
          <span>
            Identity & Safety: Administrator accounts cannot be created publicly and are provisioned via secure infrastructure CLI.
          </span>
        </div>
      </div>
    </main>
  );
}

function formatCnic(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 13);
  if (digits.length <= 5) return digits;
  if (digits.length <= 12) return `${digits.slice(0, 5)}-${digits.slice(5)}`;
  return `${digits.slice(0, 5)}-${digits.slice(5, 12)}-${digits.slice(12)}`;
}

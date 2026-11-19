"use client";

import React from "react";
import { CheckCircle2, AlertCircle, Sparkles, ShieldAlert } from "lucide-react";

interface ProfileCompletionProps {
  completion: {
    percentage: number;
    suggestions: string[];
    isProfileComplete: boolean;
    breakdown?: Record<string, { weight: number; completed: boolean; label: string }>;
  } | null;
  role: "worker" | "employer";
}

export function ProfileCompletionCard({ completion, role }: ProfileCompletionProps) {
  if (!completion) return null;

  const pct = completion.percentage || 0;
  const colorClass =
    pct >= 75
      ? "bg-emerald-600 text-emerald-700"
      : pct >= 40
      ? "bg-amber-500 text-amber-700"
      : "bg-rose-500 text-rose-700";

  const progressBgClass =
    pct >= 75 ? "bg-emerald-500" : pct >= 40 ? "bg-amber-500" : "bg-rose-500";

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-emerald-700" />
            <h3 className="font-semibold text-slate-900">Profile Completion</h3>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            {role === "worker"
              ? "Complete profiles appear higher in employer searches and receive up to 3x more job inquiries."
              : "Detailed employer profiles attract experienced, verified workers faster."}
          </p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="text-2xl font-bold tracking-tight text-slate-900">{pct}%</span>
          <span
            className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
              pct >= 75
                ? "bg-emerald-50 text-emerald-700"
                : pct >= 40
                ? "bg-amber-50 text-amber-700"
                : "bg-rose-50 text-rose-700"
            }`}
          >
            {pct >= 75 ? "Strong Profile" : pct >= 40 ? "Intermediate" : "Needs Attention"}
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mt-4 h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
        <div
          className={`h-full transition-all duration-500 ${progressBgClass}`}
          style={{ width: `${pct}%` }}
        />
      </div>

      {/* Actionable Suggestions */}
      {completion.suggestions && completion.suggestions.length > 0 && (
        <div className="mt-5 rounded-xl bg-slate-50 p-4">
          <h4 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-600">
            <AlertCircle className="h-3.5 w-3.5 text-amber-600" /> Suggested Improvements
          </h4>
          <ul className="mt-2.5 space-y-1.5">
            {completion.suggestions.slice(0, 4).map((sug, idx) => (
              <li key={idx} className="flex items-start gap-2 text-xs text-slate-700">
                <span className="mt-0.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-amber-500" />
                <span>{sug}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Safety & Credibility Notice */}
      <div className="mt-4 flex items-start gap-2 border-t border-slate-100 pt-3 text-[11px] leading-relaxed text-slate-500">
        <ShieldAlert className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-slate-400" />
        <span>
          <strong>Notice:</strong> Profile completion indicates information fullness only. It is{" "}
          <em>not</em> a security verification tier or safety guarantee.
        </span>
      </div>
    </div>
  );
}

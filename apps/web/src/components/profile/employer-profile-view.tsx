"use client";

import React, { useState, useEffect } from "react";
import { ApiClient } from "@/lib/api";
import { ProfileCompletionCard } from "./profile-completion-card";
import {
  Building2,
  Briefcase,
  Sliders,
  MapPin,
  Check,
  AlertCircle,
  Loader2,
  Users,
  ShieldCheck,
} from "lucide-react";

const PAKISTAN_CITIES = [
  { name: "Islamabad", province: "Islamabad Capital Territory", lat: 33.6844, lng: 73.0479 },
  { name: "Lahore", province: "Punjab", lat: 31.5204, lng: 74.3436 },
  { name: "Karachi", province: "Sindh", lat: 24.8607, lng: 67.0011 },
  { name: "Rawalpindi", province: "Punjab", lat: 33.5651, lng: 73.0169 },
  { name: "Peshawar", province: "Khyber Pakhtunkhwa", lat: 34.0151, lng: 71.5249 },
  { name: "Quetta", province: "Balochistan", lat: 30.1798, lng: 66.975 },
  { name: "Multan", province: "Punjab", lat: 30.1575, lng: 71.5249 },
  { name: "Faisalabad", province: "Punjab", lat: 31.4504, lng: 73.135 },
];

export function EmployerProfileView() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [data, setData] = useState<any>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"overview" | "business" | "preferences" | "location">("overview");
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [businessForm, setBusinessForm] = useState({
    displayName: "",
    businessName: "",
    employerType: "INDIVIDUAL_HOUSEHOLD",
    description: "",
    ntnTaxNumber: "",
    profilePictureUrl: "",
  });

  const [preferencesForm, setPreferencesForm] = useState({
    preferredCategoryIds: [] as string[],
    preferredEngagementTypes: ["DAILY", "PROJECT"],
    minExperienceMonths: 12,
    preferredLanguages: ["ur-PK"],
    budgetMaxMinor: 0,
  });

  const [addressForm, setAddressForm] = useState({
    streetAddress: "",
    locality: "",
    city: "Islamabad",
    province: "Islamabad Capital Territory",
    latitude: 33.6844,
    longitude: 73.0479,
  });

  const loadProfile = async () => {
    try {
      setLoading(true);
      const [empRes, catsRes] = await Promise.all([
        ApiClient.getEmployerProfile(),
        ApiClient.getCategories(),
      ]);
      setData(empRes);
      setCategories(catsRes);

      const p = empRes.profile;
      setBusinessForm({
        displayName: p.displayName || "",
        businessName: p.businessName || "",
        employerType: p.employerType || "INDIVIDUAL_HOUSEHOLD",
        description: p.description || "",
        ntnTaxNumber: p.ntnTaxNumber || "",
        profilePictureUrl: p.profilePictureUrl || "",
      });

      const prefs = p.hiringPreferences || {};
      setPreferencesForm({
        preferredCategoryIds: prefs.preferredCategoryIds || [],
        preferredEngagementTypes: prefs.preferredEngagementTypes || ["DAILY", "PROJECT"],
        minExperienceMonths: prefs.minExperienceMonths || 12,
        preferredLanguages: prefs.preferredLanguages || ["ur-PK"],
        budgetMaxMinor: prefs.budgetMaxMinor || 0,
      });

      if (empRes.address) {
        setAddressForm({
          streetAddress: empRes.address.streetAddress || "",
          locality: empRes.address.locality || "",
          city: empRes.address.city || "Islamabad",
          province: empRes.address.province || "Islamabad Capital Territory",
          latitude: empRes.address.latitude || 33.6844,
          longitude: empRes.address.longitude || 73.0479,
        });
      }
    } catch (err: any) {
      setStatusMessage({ type: "error", text: err.message || "Failed to load employer profile." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleSaveBusiness = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setStatusMessage(null);
      const res = await ApiClient.updateEmployerProfile(businessForm);
      setData(res);
      setStatusMessage({ type: "success", text: "Business profile details updated successfully!" });
    } catch (err: any) {
      setStatusMessage({ type: "error", text: err.message });
    } finally {
      setSaving(false);
    }
  };

  const handleSavePreferences = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setStatusMessage(null);
      const res = await ApiClient.updateEmployerPreferences({
        ...preferencesForm,
        minExperienceMonths: Number(preferencesForm.minExperienceMonths),
        budgetMaxMinor: Number(preferencesForm.budgetMaxMinor) || null,
      });
      setData(res);
      setStatusMessage({ type: "success", text: "Hiring preferences updated successfully!" });
    } catch (err: any) {
      setStatusMessage({ type: "error", text: err.message });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setStatusMessage(null);
      const res = await ApiClient.updateEmployerAddress({
        ...addressForm,
        latitude: Number(addressForm.latitude),
        longitude: Number(addressForm.longitude),
      });
      setData(res);
      setStatusMessage({ type: "success", text: "Employer location and PostGIS coordinates saved!" });
    } catch (err: any) {
      setStatusMessage({ type: "error", text: err.message });
    } finally {
      setSaving(false);
    }
  };

  const handleCityPreset = (city: typeof PAKISTAN_CITIES[0]) => {
    setAddressForm(prev => ({
      ...prev,
      city: city.name,
      province: city.province,
      latitude: city.lat,
      longitude: city.lng,
    }));
  };

  const toggleCategoryPreference = (categoryId: string) => {
    setPreferencesForm(prev => {
      const exists = prev.preferredCategoryIds.includes(categoryId);
      return {
        ...prev,
        preferredCategoryIds: exists
          ? prev.preferredCategoryIds.filter(id => id !== categoryId)
          : [...prev.preferredCategoryIds, categoryId],
      };
    });
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-700" />
          <p className="text-sm font-medium text-slate-600">Loading employer profile...</p>
        </div>
      </div>
    );
  }

  const profile = data?.profile;
  const stats = data?.stats;
  const completion = data?.completion;

  return (
    <div className="space-y-6">
      {/* Status Alert */}
      {statusMessage && (
        <div
          className={`flex items-center gap-2 rounded-xl p-4 text-sm ${
            statusMessage.type === "success"
              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
              : "bg-rose-50 text-rose-800 border border-rose-200"
          }`}
        >
          {statusMessage.type === "success" ? <Check className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Completion Indicator */}
      <ProfileCompletionCard completion={completion} role="employer" />

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-2">
        {[
          { id: "overview", label: "Overview", icon: Building2 },
          { id: "business", label: "Business Information", icon: Briefcase },
          { id: "preferences", label: "Hiring Preferences", icon: Sliders },
          { id: "location", label: "Location Settings", icon: MapPin },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition ${
                isActive
                  ? "bg-emerald-800 text-white shadow-sm"
                  : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === "overview" && (
        <div className="grid gap-6 md:grid-cols-3">
          {/* Main Card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:col-span-2">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-2xl font-bold text-emerald-800 border border-emerald-200">
                {profile?.displayName ? profile.displayName.charAt(0) : "E"}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-slate-900">{profile?.displayName}</h2>
                  {profile?.isVerified && (
                    <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 border border-emerald-200">
                      <ShieldCheck className="h-3 w-3" /> Verified
                    </span>
                  )}
                </div>
                {profile?.businessName && (
                  <p className="mt-1 text-sm font-semibold text-emerald-800">{profile.businessName}</p>
                )}
                <p className="mt-0.5 text-xs text-slate-500">
                  {profile?.employerType} •{" "}
                  {data?.address ? `${data.address.locality}, ${data.address.city}` : "Location not set"}
                </p>
              </div>
            </div>

            <div className="mt-6 border-t border-slate-100 pt-5">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">About Employer</h4>
              <p className="mt-2 text-sm leading-relaxed text-slate-700">
                {profile?.description || "No description provided yet. Add details about your organization or household."}
              </p>
            </div>

            <div className="mt-6 grid grid-cols-3 gap-4 rounded-xl bg-slate-50 p-4">
              <div>
                <span className="text-[11px] text-slate-500">Total Jobs</span>
                <p className="text-lg font-bold text-slate-900">{stats?.totalJobPostings || 0}</p>
              </div>
              <div>
                <span className="text-[11px] text-slate-500">Active Openings</span>
                <p className="text-lg font-bold text-emerald-700">{stats?.activeJobPostings || 0}</p>
              </div>
              <div>
                <span className="text-[11px] text-slate-500">Total Hires</span>
                <p className="text-lg font-bold text-slate-900">{stats?.totalHires || 0}</p>
              </div>
            </div>
          </div>

          {/* Preferences Summary */}
          <div className="space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="font-semibold text-slate-900">Preferred Trades</h3>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {profile?.hiringPreferences?.preferredCategoryIds?.length > 0 ? (
                  profile.hiringPreferences.preferredCategoryIds.map((catId: string) => {
                    const cat = categories.find(c => c.id === catId);
                    return (
                      <span
                        key={catId}
                        className="rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-800"
                      >
                        {cat ? cat.nameEn : "Trade Category"}
                      </span>
                    );
                  })
                ) : (
                  <p className="text-xs text-slate-400">No category preferences set yet.</p>
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="font-semibold text-slate-900">Verification Status</h3>
              <p className="mt-1 text-xs text-slate-600">
                {profile?.isVerified
                  ? "Identity verified. Enhanced trust badge active."
                  : "Verification pending. Submit company/CNIC documentation for verified status."}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: BUSINESS INFORMATION */}
      {activeTab === "business" && (
        <form onSubmit={handleSaveBusiness} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900">Employer & Business Information</h3>
          <p className="text-xs text-slate-500">Configure your public-facing employer profile.</p>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-xs font-semibold text-slate-700">Contact / Representative Name</label>
              <input
                type="text"
                required
                value={businessForm.displayName}
                onChange={e => setBusinessForm({ ...businessForm, displayName: e.target.value })}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-emerald-700"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700">Business / Company Name</label>
              <input
                type="text"
                placeholder="Optional for private households"
                value={businessForm.businessName}
                onChange={e => setBusinessForm({ ...businessForm, businessName: e.target.value })}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-emerald-700"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700">Employer Type</label>
              <select
                value={businessForm.employerType}
                onChange={e => setBusinessForm({ ...businessForm, employerType: e.target.value })}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-emerald-700"
              >
                <option value="INDIVIDUAL_HOUSEHOLD">Individual Household</option>
                <option value="CONTRACTOR">Contractor / Builder</option>
                <option value="ENTERPRISE">Enterprise Company</option>
                <option value="AGENCY">Staffing Agency</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700">NTN Tax Number</label>
              <input
                type="text"
                placeholder="e.g. 1234567-8"
                value={businessForm.ntnTaxNumber}
                onChange={e => setBusinessForm({ ...businessForm, ntnTaxNumber: e.target.value })}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-emerald-700"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-xs font-semibold text-slate-700">Company / Household Description</label>
              <textarea
                rows={4}
                value={businessForm.description}
                onChange={e => setBusinessForm({ ...businessForm, description: e.target.value })}
                placeholder="Describe your organization, typical projects, work environment, and worker requirements..."
                className="mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-emerald-700"
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-800 px-5 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-emerald-900 transition disabled:opacity-50"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
              Save Business Information
            </button>
          </div>
        </form>
      )}

      {/* TAB 3: HIRING PREFERENCES */}
      {activeTab === "preferences" && (
        <form onSubmit={handleSavePreferences} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900">Hiring Preferences</h3>
          <p className="text-xs text-slate-500">Define your default candidate requirements for automatic recommendations.</p>

          <div className="mt-6 space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-700">Preferred Trade Categories</label>
              <div className="mt-2 flex flex-wrap gap-2">
                {categories.map(c => {
                  const selected = preferencesForm.preferredCategoryIds.includes(c.id);
                  return (
                    <button
                      type="button"
                      key={c.id}
                      onClick={() => toggleCategoryPreference(c.id)}
                      className={`rounded-xl px-3 py-1.5 text-xs font-medium transition ${
                        selected
                          ? "bg-emerald-800 text-white shadow-sm"
                          : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                      }`}
                    >
                      {c.nameEn}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-xs font-semibold text-slate-700">Minimum Required Experience (Months)</label>
                <input
                  type="number"
                  min={0}
                  value={preferencesForm.minExperienceMonths}
                  onChange={e => setPreferencesForm({ ...preferencesForm, minExperienceMonths: Number(e.target.value) })}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-emerald-700"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">Maximum Wage Budget (PKR, optional)</label>
                <input
                  type="number"
                  value={preferencesForm.budgetMaxMinor}
                  onChange={e => setPreferencesForm({ ...preferencesForm, budgetMaxMinor: Number(e.target.value) })}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-emerald-700"
                />
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-800 px-5 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-emerald-900 transition disabled:opacity-50"
            >
              <Check className="h-4 w-4" /> Save Preferences
            </button>
          </div>
        </form>
      )}

      {/* TAB 4: LOCATION SETTINGS */}
      {activeTab === "location" && (
        <form onSubmit={handleSaveAddress} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900">Location Settings (PostGIS Geography)</h3>
          <p className="text-xs text-slate-500">
            Set your primary office or job site location. PostGIS geometry enables proximity filtering for local trade workers.
          </p>

          <div className="mt-4">
            <span className="text-xs font-semibold text-slate-700">Quick Pakistan City Presets:</span>
            <div className="mt-2 flex flex-wrap gap-2">
              {PAKISTAN_CITIES.map(c => (
                <button
                  type="button"
                  key={c.name}
                  onClick={() => handleCityPreset(c)}
                  className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-emerald-50 hover:text-emerald-800 transition"
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-xs font-semibold text-slate-700">City</label>
              <input
                type="text"
                required
                value={addressForm.city}
                onChange={e => setAddressForm({ ...addressForm, city: e.target.value })}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm outline-none focus:border-emerald-700"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700">Locality / Sector</label>
              <input
                type="text"
                required
                placeholder="e.g. Blue Area or Clifton"
                value={addressForm.locality}
                onChange={e => setAddressForm({ ...addressForm, locality: e.target.value })}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm outline-none focus:border-emerald-700"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700">Latitude</label>
              <input
                type="number"
                step="0.0001"
                required
                value={addressForm.latitude}
                onChange={e => setAddressForm({ ...addressForm, latitude: Number(e.target.value) })}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm outline-none focus:border-emerald-700"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700">Longitude</label>
              <input
                type="number"
                step="0.0001"
                required
                value={addressForm.longitude}
                onChange={e => setAddressForm({ ...addressForm, longitude: Number(e.target.value) })}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm outline-none focus:border-emerald-700"
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-800 px-5 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-emerald-900 transition"
            >
              <Check className="h-4 w-4" /> Save Employer Location
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

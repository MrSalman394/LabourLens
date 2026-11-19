"use client";

import React, { useState, useEffect } from "react";
import { ApiClient } from "@/lib/api";
import { ProfileCompletionCard } from "./profile-completion-card";
import {
  User,
  Wrench,
  Briefcase,
  Calendar,
  MapPin,
  Image as ImageIcon,
  Award,
  Clock,
  Plus,
  Trash2,
  Check,
  AlertCircle,
  Loader2,
  ExternalLink,
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

export function WorkerProfileView() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [data, setData] = useState<any>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<
    "overview" | "personal" | "skills" | "experience" | "availability" | "location" | "portfolio"
  >("overview");
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Form states
  const [personalForm, setPersonalForm] = useState({
    displayName: "",
    headline: "",
    bio: "",
    gender: "MALE",
    dateOfBirth: "",
    profilePictureUrl: "",
    languages: ["ur-PK"],
    primaryCategoryId: "",
    expectedWageDailyMinor: 0,
    expectedWageHourlyMinor: 0,
    preferredEngagementType: "DAILY",
  });

  const [addressForm, setAddressForm] = useState({
    streetAddress: "",
    locality: "",
    city: "Islamabad",
    province: "Islamabad Capital Territory",
    latitude: 33.6844,
    longitude: 73.0479,
  });

  const [selectedSkillId, setSelectedSkillId] = useState("");
  const [skillProficiency, setSkillProficiency] = useState(3);
  const [skillMonths, setSkillMonths] = useState(24);

  const [newExp, setNewExp] = useState({
    roleTitle: "",
    employerName: "",
    city: "Islamabad",
    startedOn: "2022-01-01",
    endedOn: "",
    isCurrent: false,
    description: "",
  });

  const [newQual, setNewQual] = useState({
    title: "",
    issuer: "NAVTTC Pakistan",
    qualificationType: "VOCATIONAL_CERTIFICATE",
    issuedOn: "2021-06-01",
  });

  const [newPortfolio, setNewPortfolio] = useState({
    title: "",
    description: "",
    completedDate: "",
  });

  const loadProfile = async () => {
    try {
      setLoading(true);
      const [profileRes, catsRes] = await Promise.all([
        ApiClient.getWorkerProfile(),
        ApiClient.getCategories(),
      ]);
      setData(profileRes);
      setCategories(catsRes);

      const p = profileRes.profile;
      setPersonalForm({
        displayName: p.displayName || "",
        headline: p.headline || "",
        bio: p.bio || "",
        gender: p.gender || "MALE",
        dateOfBirth: p.dateOfBirth ? p.dateOfBirth.split("T")[0] : "",
        profilePictureUrl: p.profilePictureUrl || "",
        languages: p.languages || ["ur-PK"],
        primaryCategoryId: p.primaryCategoryId || "",
        expectedWageDailyMinor: p.expectedWageDailyMinor || 0,
        expectedWageHourlyMinor: p.expectedWageHourlyMinor || 0,
        preferredEngagementType: p.preferredEngagementType || "DAILY",
      });

      if (profileRes.address) {
        setAddressForm({
          streetAddress: profileRes.address.streetAddress || "",
          locality: profileRes.address.locality || "",
          city: profileRes.address.city || "Islamabad",
          province: profileRes.address.province || "Islamabad Capital Territory",
          latitude: profileRes.address.latitude || 33.6844,
          longitude: profileRes.address.longitude || 73.0479,
        });
      }
    } catch (err: any) {
      setStatusMessage({ type: "error", text: err.message || "Failed to load worker profile." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleSavePersonal = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setStatusMessage(null);
      const res = await ApiClient.updateWorkerProfile({
        ...personalForm,
        expectedWageDailyMinor: Number(personalForm.expectedWageDailyMinor) || null,
        expectedWageHourlyMinor: Number(personalForm.expectedWageHourlyMinor) || null,
      });
      setData(res);
      setStatusMessage({ type: "success", text: "Personal information saved successfully!" });
    } catch (err: any) {
      setStatusMessage({ type: "error", text: err.message });
    } finally {
      setSaving(false);
    }
  };

  const handleAddSkill = async () => {
    if (!selectedSkillId) return;
    try {
      setSaving(true);
      const currentSkills = data?.profile?.skills || [];
      const updatedList = [
        ...currentSkills
          .filter((s: any) => s.skillId !== selectedSkillId)
          .map((s: any) => ({
            skillId: s.skillId,
            proficiencyLevel: s.proficiencyLevel,
            experienceMonths: s.experienceMonths,
          })),
        {
          skillId: selectedSkillId,
          proficiencyLevel: Number(skillProficiency),
          experienceMonths: Number(skillMonths),
        },
      ];
      const res = await ApiClient.updateWorkerSkills(updatedList);
      setData(res);
      setStatusMessage({ type: "success", text: "Skill added to your profile!" });
    } catch (err: any) {
      setStatusMessage({ type: "error", text: err.message });
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveSkill = async (skillId: string) => {
    try {
      setSaving(true);
      const currentSkills = data?.profile?.skills || [];
      const updatedList = currentSkills
        .filter((s: any) => s.skillId !== skillId)
        .map((s: any) => ({
          skillId: s.skillId,
          proficiencyLevel: s.proficiencyLevel,
          experienceMonths: s.experienceMonths,
        }));
      const res = await ApiClient.updateWorkerSkills(updatedList);
      setData(res);
      setStatusMessage({ type: "success", text: "Skill removed." });
    } catch (err: any) {
      setStatusMessage({ type: "error", text: err.message });
    } finally {
      setSaving(false);
    }
  };

  const handleAddExperience = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExp.roleTitle || !newExp.startedOn) return;
    try {
      setSaving(true);
      await ApiClient.addWorkerExperience(newExp);
      await loadProfile();
      setNewExp({
        roleTitle: "",
        employerName: "",
        city: "Islamabad",
        startedOn: "2022-01-01",
        endedOn: "",
        isCurrent: false,
        description: "",
      });
      setStatusMessage({ type: "success", text: "Experience record added successfully!" });
    } catch (err: any) {
      setStatusMessage({ type: "error", text: err.message });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteExperience = async (id: string) => {
    try {
      setSaving(true);
      await ApiClient.deleteWorkerExperience(id);
      await loadProfile();
      setStatusMessage({ type: "success", text: "Experience record removed." });
    } catch (err: any) {
      setStatusMessage({ type: "error", text: err.message });
    } finally {
      setSaving(false);
    }
  };

  const handleAddQualification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQual.title) return;
    try {
      setSaving(true);
      await ApiClient.addWorkerQualification(newQual);
      await loadProfile();
      setNewQual({
        title: "",
        issuer: "NAVTTC Pakistan",
        qualificationType: "VOCATIONAL_CERTIFICATE",
        issuedOn: "2021-06-01",
      });
      setStatusMessage({ type: "success", text: "Certification / Qualification added!" });
    } catch (err: any) {
      setStatusMessage({ type: "error", text: err.message });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteQualification = async (id: string) => {
    try {
      setSaving(true);
      await ApiClient.deleteWorkerQualification(id);
      await loadProfile();
      setStatusMessage({ type: "success", text: "Qualification removed." });
    } catch (err: any) {
      setStatusMessage({ type: "error", text: err.message });
    } finally {
      setSaving(false);
    }
  };

  const handleAddPortfolio = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPortfolio.title) return;
    try {
      setSaving(true);
      const currentItems = data?.profile?.portfolioItems || [];
      const updated = [...currentItems, newPortfolio];
      const res = await ApiClient.updateWorkerPortfolio(updated);
      setData(res);
      setNewPortfolio({ title: "", description: "", completedDate: "" });
      setStatusMessage({ type: "success", text: "Portfolio project added!" });
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
      const res = await ApiClient.updateWorkerAddress({
        ...addressForm,
        latitude: Number(addressForm.latitude),
        longitude: Number(addressForm.longitude),
      });
      setData(res);
      setStatusMessage({ type: "success", text: "Address and PostGIS coordinates saved!" });
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

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-700" />
          <p className="text-sm font-medium text-slate-600">Loading worker profile...</p>
        </div>
      </div>
    );
  }

  const profile = data?.profile;
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
      <ProfileCompletionCard completion={completion} role="worker" />

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-2">
        {[
          { id: "overview", label: "Overview", icon: User },
          { id: "personal", label: "Personal & Bio", icon: User },
          { id: "skills", label: "Skills Management", icon: Wrench },
          { id: "experience", label: "Work Experience", icon: Briefcase },
          { id: "availability", label: "Availability", icon: Calendar },
          { id: "location", label: "Location (PostGIS)", icon: MapPin },
          { id: "portfolio", label: "Portfolio & Certs", icon: Award },
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
                {profile?.displayName ? profile.displayName.charAt(0) : "W"}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-slate-900">{profile?.displayName}</h2>
                  <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-semibold text-slate-700">
                    {profile?.verificationLevel || "UNVERIFIED"}
                  </span>
                </div>
                <p className="mt-1 text-sm font-medium text-emerald-800">
                  {profile?.headline || "No professional headline set"}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  {data?.address ? `${data.address.locality}, ${data.address.city}` : "Location not specified"}
                </p>
              </div>
            </div>

            <div className="mt-6 border-t border-slate-100 pt-5">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">About Me</h4>
              <p className="mt-2 text-sm leading-relaxed text-slate-700">
                {profile?.bio || "No biography provided yet. Add your bio to stand out."}
              </p>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4 rounded-xl bg-slate-50 p-4 sm:grid-cols-4">
              <div>
                <span className="text-[11px] text-slate-500">Daily Rate</span>
                <p className="text-sm font-bold text-slate-900">
                  {profile?.expectedWageDailyMinor ? `PKR ${profile.expectedWageDailyMinor}` : "Not set"}
                </p>
              </div>
              <div>
                <span className="text-[11px] text-slate-500">Hourly Rate</span>
                <p className="text-sm font-bold text-slate-900">
                  {profile?.expectedWageHourlyMinor ? `PKR ${profile.expectedWageHourlyMinor}/hr` : "Not set"}
                </p>
              </div>
              <div>
                <span className="text-[11px] text-slate-500">Engagement</span>
                <p className="text-sm font-bold text-slate-900">{profile?.preferredEngagementType || "ANY"}</p>
              </div>
              <div>
                <span className="text-[11px] text-slate-500">Availability</span>
                <p className="text-sm font-bold text-emerald-700">{profile?.availabilityStatus || "AVAILABLE"}</p>
              </div>
            </div>
          </div>

          {/* Quick Stats & Badges */}
          <div className="space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="font-semibold text-slate-900">Skills ({profile?.skills?.length || 0})</h3>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {profile?.skills && profile.skills.length > 0 ? (
                  profile.skills.map((s: any) => (
                    <span
                      key={s.skillId}
                      className="rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-800"
                    >
                      {s.skill.nameEn} ({s.experienceMonths}m)
                    </span>
                  ))
                ) : (
                  <p className="text-xs text-slate-400">No skills added yet.</p>
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="font-semibold text-slate-900">Experience & Projects</h3>
              <p className="mt-1 text-xs text-slate-500">
                {profile?.experiences?.length || 0} work history records, {profile?.qualifications?.length || 0} credentials.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PERSONAL & BIO */}
      {activeTab === "personal" && (
        <form onSubmit={handleSavePersonal} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900">Personal & Professional Information</h3>
          <p className="text-xs text-slate-500">Keep your details up to date for better job matching.</p>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-xs font-semibold text-slate-700">Full Name</label>
              <input
                type="text"
                required
                value={personalForm.displayName}
                onChange={e => setPersonalForm({ ...personalForm, displayName: e.target.value })}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-emerald-700"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700">Professional Headline</label>
              <input
                type="text"
                placeholder="e.g. Master Industrial Electrician"
                value={personalForm.headline}
                onChange={e => setPersonalForm({ ...personalForm, headline: e.target.value })}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-emerald-700"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-xs font-semibold text-slate-700">Biography / Work Experience Summary</label>
              <textarea
                rows={4}
                value={personalForm.bio}
                onChange={e => setPersonalForm({ ...personalForm, bio: e.target.value })}
                placeholder="Describe your primary trade, skills, certifications, and years of experience..."
                className="mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-emerald-700"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700">Primary Trade Category</label>
              <select
                value={personalForm.primaryCategoryId}
                onChange={e => setPersonalForm({ ...personalForm, primaryCategoryId: e.target.value })}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-emerald-700"
              >
                <option value="">-- Select Category --</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.nameEn} ({c.nameUr})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700">Date of Birth</label>
              <input
                type="date"
                value={personalForm.dateOfBirth}
                onChange={e => setPersonalForm({ ...personalForm, dateOfBirth: e.target.value })}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-emerald-700"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700">Expected Daily Wage (PKR)</label>
              <input
                type="number"
                value={personalForm.expectedWageDailyMinor}
                onChange={e => setPersonalForm({ ...personalForm, expectedWageDailyMinor: Number(e.target.value) })}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-emerald-700"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700">Expected Hourly Wage (PKR)</label>
              <input
                type="number"
                value={personalForm.expectedWageHourlyMinor}
                onChange={e => setPersonalForm({ ...personalForm, expectedWageHourlyMinor: Number(e.target.value) })}
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
              Save Personal Info
            </button>
          </div>
        </form>
      )}

      {/* TAB 3: SKILLS MANAGEMENT */}
      {activeTab === "skills" && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900">Add New Trade Skill</h3>
            <p className="text-xs text-slate-500">Select skills verified by your experience and trade practice.</p>

            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              <div>
                <label className="text-xs font-semibold text-slate-700">Skill</label>
                <select
                  value={selectedSkillId}
                  onChange={e => setSelectedSkillId(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-emerald-700"
                >
                  <option value="">-- Select Skill --</option>
                  {categories.flatMap(c => c.skills || []).map((s: any) => (
                    <option key={s.id} value={s.id}>
                      {s.nameEn} ({s.nameUr})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">Proficiency Level (1-5)</label>
                <select
                  value={skillProficiency}
                  onChange={e => setSkillProficiency(Number(e.target.value))}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-emerald-700"
                >
                  <option value={1}>1 - Beginner</option>
                  <option value={2}>2 - Junior</option>
                  <option value={3}>3 - Intermediate</option>
                  <option value={4}>4 - Advanced</option>
                  <option value={5}>5 - Expert Master</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">Experience (Months)</label>
                <input
                  type="number"
                  min={1}
                  max={600}
                  value={skillMonths}
                  onChange={e => setSkillMonths(Number(e.target.value))}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-emerald-700"
                />
              </div>
            </div>

            <div className="mt-4 flex justify-end">
              <button
                type="button"
                onClick={handleAddSkill}
                disabled={saving || !selectedSkillId}
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-800 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-emerald-900 transition disabled:opacity-50"
              >
                <Plus className="h-4 w-4" /> Add Skill
              </button>
            </div>
          </div>

          {/* Current Skills List */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="font-semibold text-slate-900">Your Current Skills ({profile?.skills?.length || 0})</h3>
            <div className="mt-4 space-y-2">
              {profile?.skills && profile.skills.length > 0 ? (
                profile.skills.map((s: any) => (
                  <div
                    key={s.skillId}
                    className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 p-3"
                  >
                    <div>
                      <p className="text-sm font-bold text-slate-800">{s.skill.nameEn}</p>
                      <p className="text-xs text-slate-500">
                        Level {s.proficiencyLevel}/5 • {s.experienceMonths} months experience
                      </p>
                    </div>
                    <button
                      onClick={() => handleRemoveSkill(s.skillId)}
                      className="rounded-lg p-2 text-rose-600 hover:bg-rose-50 transition"
                      title="Remove skill"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400">No skills added yet.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: WORK EXPERIENCE */}
      {activeTab === "experience" && (
        <div className="space-y-6">
          <form onSubmit={handleAddExperience} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900">Add Work Experience</h3>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-xs font-semibold text-slate-700">Role Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Lead Electrician"
                  value={newExp.roleTitle}
                  onChange={e => setNewExp({ ...newExp, roleTitle: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm outline-none focus:border-emerald-700"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">Employer / Contractor Name</label>
                <input
                  type="text"
                  placeholder="e.g. Descon or Private Household"
                  value={newExp.employerName}
                  onChange={e => setNewExp({ ...newExp, employerName: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm outline-none focus:border-emerald-700"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">City</label>
                <input
                  type="text"
                  value={newExp.city}
                  onChange={e => setNewExp({ ...newExp, city: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm outline-none focus:border-emerald-700"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">Started On</label>
                <input
                  type="date"
                  required
                  value={newExp.startedOn}
                  onChange={e => setNewExp({ ...newExp, startedOn: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm outline-none focus:border-emerald-700"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs font-semibold text-slate-700">Responsibilities</label>
                <textarea
                  rows={2}
                  value={newExp.description}
                  onChange={e => setNewExp({ ...newExp, description: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm outline-none focus:border-emerald-700"
                />
              </div>
            </div>

            <div className="mt-4 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-800 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-emerald-900 transition"
              >
                <Plus className="h-4 w-4" /> Save Experience
              </button>
            </div>
          </form>

          {/* Past Experience List */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="font-semibold text-slate-900">Work History</h3>
            <div className="mt-4 space-y-3">
              {profile?.experiences && profile.experiences.length > 0 ? (
                profile.experiences.map((exp: any) => (
                  <div
                    key={exp.id}
                    className="flex items-start justify-between rounded-xl border border-slate-100 bg-slate-50 p-4"
                  >
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{exp.roleTitle}</h4>
                      <p className="text-xs text-slate-600">
                        {exp.employerName || "Independent"} • {exp.city || "Pakistan"}
                      </p>
                      <p className="mt-1 text-[11px] text-slate-400">
                        {exp.startedOn?.split("T")[0]} to {exp.endedOn ? exp.endedOn.split("T")[0] : "Present"}
                      </p>
                      {exp.description && <p className="mt-2 text-xs text-slate-700">{exp.description}</p>}
                    </div>
                    <button
                      onClick={() => handleDeleteExperience(exp.id)}
                      className="rounded-lg p-2 text-rose-600 hover:bg-rose-50 transition"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400">No previous experience recorded.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: AVAILABILITY */}
      {activeTab === "availability" && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900">Availability & Work Schedule</h3>
          <p className="text-xs text-slate-500">Let employers know when you are open for assignments.</p>

          <div className="mt-6 flex flex-wrap gap-3">
            {["AVAILABLE", "BUSY", "UNAVAILABLE"].map(status => (
              <button
                key={status}
                type="button"
                onClick={async () => {
                  try {
                    const res = await ApiClient.updateWorkerAvailability({
                      availabilityStatus: status,
                      isAvailable: status === "AVAILABLE",
                    });
                    setData(res);
                  } catch (err: any) {
                    setStatusMessage({ type: "error", text: err.message });
                  }
                }}
                className={`rounded-xl px-5 py-3 text-xs font-bold transition ${
                  profile?.availabilityStatus === status
                    ? "bg-emerald-800 text-white shadow"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* TAB 6: LOCATION (POSTGIS) */}
      {activeTab === "location" && (
        <form onSubmit={handleSaveAddress} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900">Location Settings (PostGIS Geography)</h3>
          <p className="text-xs text-slate-500">
            Coordinates are stored securely as PostGIS points for proximity matching without exposing your private street address.
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
              <label className="text-xs font-semibold text-slate-700">Locality / Area</label>
              <input
                type="text"
                required
                placeholder="e.g. F-10/2 or Gulberg III"
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
              <Check className="h-4 w-4" /> Save PostGIS Location
            </button>
          </div>
        </form>
      )}

      {/* TAB 7: PORTFOLIO & CERTIFICATIONS */}
      {activeTab === "portfolio" && (
        <div className="space-y-6">
          {/* Add Certification */}
          <form onSubmit={handleAddQualification} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900">Add Vocational Certification</h3>
            <p className="text-xs text-slate-500">Document your diplomas from NAVTTC, TEVTA, or recognized training bodies.</p>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-xs font-semibold text-slate-700">Certificate Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. National Vocational Certificate Level 3 Electrical"
                  value={newQual.title}
                  onChange={e => setNewQual({ ...newQual, title: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm outline-none focus:border-emerald-700"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">Issuing Authority</label>
                <input
                  type="text"
                  value={newQual.issuer}
                  onChange={e => setNewQual({ ...newQual, issuer: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm outline-none focus:border-emerald-700"
                />
              </div>
            </div>

            <div className="mt-4 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-800 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-emerald-900 transition"
              >
                <Plus className="h-4 w-4" /> Save Certification
              </button>
            </div>
          </form>

          {/* Add Portfolio Item */}
          <form onSubmit={handleAddPortfolio} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900">Add Portfolio Project</h3>
            <p className="text-xs text-slate-500">Highlight past completed projects or installations.</p>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="text-xs font-semibold text-slate-700">Project Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 5kW Solar Inverter Installation"
                  value={newPortfolio.title}
                  onChange={e => setNewPortfolio({ ...newPortfolio, title: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm outline-none focus:border-emerald-700"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs font-semibold text-slate-700">Description</label>
                <textarea
                  rows={2}
                  value={newPortfolio.description}
                  onChange={e => setNewPortfolio({ ...newPortfolio, description: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm outline-none focus:border-emerald-700"
                />
              </div>
            </div>

            <div className="mt-4 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-800 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-emerald-900 transition"
              >
                <Plus className="h-4 w-4" /> Add to Portfolio
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

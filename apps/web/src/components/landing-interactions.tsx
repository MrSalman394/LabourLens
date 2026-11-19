"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Briefcase, Building2, ChevronDown, MapPin, Search, SlidersHorizontal, UserRound } from "lucide-react";

const fallbackCategories = ["House Cleaning", "Cooking", "Electrician", "Plumbing", "Driving", "Caregiving", "AC Repair", "Construction", "Carpentry"];
const cities = ["Islamabad", "Rawalpindi", "Lahore", "Karachi", "Peshawar", "Faisalabad", "Multan", "Quetta"];
type CategoryRecord = { nameEn?: string; name?: string };

export function LandingSearch() {
  const [mode, setMode] = useState<"workers" | "jobs">("workers");
  const [categories, setCategories] = useState<string[]>(fallbackCategories);
  const [submitted, setSubmitted] = useState(false);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [city, setCity] = useState("");
  const [area, setArea] = useState("");
  const [budget, setBudget] = useState("");
  const [employment, setEmployment] = useState("");
  const [availability, setAvailability] = useState("");
  const [experience, setExperience] = useState("");

  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
    fetch(`${apiUrl}/taxonomy/categories`)
      .then((response) => response.ok ? response.json() : [])
      .then((records: CategoryRecord[]) => {
        const names = records.map((record) => record.nameEn || record.name).filter((name): name is string => Boolean(name));
        if (names.length) setCategories(names);
      })
      .catch(() => undefined);
  }, []);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(true);
  };

  const role = mode === "workers" ? "employer" : "worker";
  const audience = mode === "workers" ? "employer account" : "worker account";
  const emptyState = mode === "workers"
    ? "Public worker search isn’t connected yet. Create an employer account to get started; these filters aren’t saved."
    : "Public job search isn’t connected yet. Create a worker account to get started; these filters aren’t saved.";

  return <div className="search-shell">
    <div className="flex flex-col gap-4 border-b border-slate-100 pb-5 md:flex-row md:items-center md:justify-between">
      <div className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-primary"><Search className="h-5 w-5" /></span><div><h2 className="font-semibold text-navy">Find the right fit</h2><p className="mt-0.5 text-xs text-muted">Choose a side of the marketplace to get started.</p></div></div>
      <div className="search-mode-switch" role="group" aria-label="Choose search mode">
        <button type="button" aria-pressed={mode === "workers"} onClick={() => { setMode("workers"); setSubmitted(false); }} className={mode === "workers" ? "search-mode-active" : ""}><Building2 className="h-4 w-4" />Find workers</button>
        <button type="button" aria-pressed={mode === "jobs"} onClick={() => { setMode("jobs"); setSubmitted(false); }} className={mode === "jobs" ? "search-mode-active" : ""}><UserRound className="h-4 w-4" />Find jobs</button>
      </div>
    </div>

    <div className="mt-4 flex items-center gap-2 rounded-xl border border-amber-100 bg-amber-50/70 px-3 py-2 text-[10px] leading-4 text-amber-900"><span className="h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />Preview search · live {mode === "workers" ? "worker profiles" : "job listings"} are not publicly searchable yet.</div>
    <form onSubmit={handleSubmit} className="mt-5">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <label className="search-field lg:col-span-2"><span>{mode === "workers" ? "Skill or profession" : "Job title or skill"}</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={mode === "workers" ? "e.g. electrician, home cook" : "e.g. maintenance technician"} /></label>
        <label className="search-field"><span>Category</span><span className="select-wrap"><select value={category} onChange={(event) => setCategory(event.target.value)}><option value="">Any category</option>{categories.map((item) => <option key={item}>{item}</option>)}</select><ChevronDown aria-hidden="true" /></span></label>
        <label className="search-field"><span>{mode === "workers" ? "City" : "Preferred city"}</span><span className="select-wrap"><select value={city} onChange={(event) => setCity(event.target.value)}><option value="">Any city</option>{cities.map((item) => <option key={item}>{item}</option>)}</select><ChevronDown aria-hidden="true" /></span></label>
        <label className="search-field"><span>Area</span><input value={area} onChange={(event) => setArea(event.target.value)} placeholder="e.g. Gulberg" /></label>
        <label className="search-field"><span>{mode === "workers" ? "Budget" : "Expected salary"}</span><span className="select-wrap"><select value={budget} onChange={(event) => setBudget(event.target.value)}><option value="">Flexible</option><option>Under PKR 25,000 / month</option><option>PKR 25,000–50,000 / month</option><option>PKR 50,000–100,000 / month</option><option>Discuss per project</option></select><ChevronDown aria-hidden="true" /></span></label>
        <label className="search-field"><span>Employment type</span><span className="select-wrap"><select value={employment} onChange={(event) => setEmployment(event.target.value)}><option value="">Any type</option><option>Daily wage</option><option>Hourly</option><option>Monthly</option><option>Full-time</option><option>Part-time</option><option>Temporary</option><option>Contract / project</option></select><ChevronDown aria-hidden="true" /></span></label>
        {mode === "workers" ? <>
          <label className="search-field"><span>Availability</span><span className="select-wrap"><select value={availability} onChange={(event) => setAvailability(event.target.value)}><option value="">Any availability</option><option>Available now</option><option>Weekdays</option><option>Weekends</option><option>Flexible</option></select><ChevronDown aria-hidden="true" /></span></label>
          <label className="search-field"><span>Experience</span><span className="select-wrap"><select value={experience} onChange={(event) => setExperience(event.target.value)}><option value="">Any experience</option><option>Under 1 year</option><option>1–3 years</option><option>3–5 years</option><option>5+ years</option></select><ChevronDown aria-hidden="true" /></span></label>
        </> : <label className="search-field"><span>Work schedule</span><span className="select-wrap"><select value={availability} onChange={(event) => setAvailability(event.target.value)}><option value="">Any schedule</option><option>Day shift</option><option>Evening</option><option>Weekdays</option><option>Weekends</option><option>Flexible</option></select><ChevronDown aria-hidden="true" /></span></label>}
      </div>
      <button type="submit" className="primary-button mt-4 min-h-11 w-full justify-center sm:w-auto"><SlidersHorizontal aria-hidden="true" className="h-4 w-4" />{mode === "workers" ? "Find workers" : "Find jobs"}<ArrowRight aria-hidden="true" className="h-4 w-4" /></button>
    </form>
    <div className="mt-4 flex flex-wrap items-center gap-2 text-xs"><span className="mr-1 font-medium text-slate-500">Popular:</span>{["House cleaning", "Electrician", "Driver", "Caregiver"].map((term) => <button key={term} type="button" onClick={() => { setQuery(term); setSubmitted(false); }} className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-primary">{term}</button>)}</div>
    {submitted && <div role="status" className="mt-5 flex flex-col gap-3 rounded-2xl border border-blue-100 bg-blue-50/70 p-4 sm:flex-row sm:items-center sm:justify-between"><div className="flex gap-3"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" /><p className="text-sm leading-6 text-slate-700">{emptyState}</p></div><Link href={`/register?role=${role}`} className="inline-flex shrink-0 items-center gap-2 text-sm font-semibold text-primary hover:text-blue-800">Create {audience} <ArrowRight className="h-4 w-4" /></Link></div>}
  </div>;
}

const faqs = [
  ["What is LabourLens?", "LabourLens is a two-sided employment marketplace for connecting employers with domestic workers and skilled professionals through structured profiles and explainable recommendations."],
  ["How do employers hire workers?", "The intended marketplace lets employers discover profiles, publish a job, review applications, compare candidates, and contact suitable workers. Public search and hiring requests are still being integrated."],
  ["How do workers apply?", "Workers can register and manage a professional profile in the current app. Public job discovery and applications are part of the marketplace direction and are not yet connected here."],
  ["Can workers send price offers?", "Price offers and counter-offers are shown as a demonstration concept. The live negotiation flow is not available yet."],
  ["Can employers negotiate?", "The product is designed for both sides to discuss work and terms. This page does not submit offers or confirm agreements."],
  ["How does AI matching work?", "The planned matching experience compares requirements with skills, experience, location, availability, and budget. Demonstration scores are illustrative, not live recommendations or guarantees."],
  ["How does evidence status work?", "Profiles should distinguish self-reported information, evidence submitted, administrator-reviewed evidence, and details that are not available. Submitted evidence does not mean it has been independently verified."],
  ["Which cities are supported?", "LabourLens is designed for Pakistan. Cities listed here are examples; they do not indicate live worker or job availability."],
  ["Is LabourLens free?", "Pricing has not been announced. Create an account to explore the current platform and review any terms presented during sign-up."],
  ["Does LabourLens process payments?", "No integrated payment processing is included in this experience. Employers and workers should discuss payment arrangements directly and confirm terms before work begins."],
];

export function LandingFaq() {
  return <div className="divide-y divide-slate-200 rounded-3xl border border-slate-200 bg-white px-5 sm:px-8">{faqs.map(([question, answer]) => <details key={question} className="faq-row group py-5"><summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-left text-sm font-semibold text-navy marker:hidden">{question}<ChevronDown aria-hidden="true" className="h-4 w-4 shrink-0 text-slate-400 transition-transform group-open:rotate-180" /></summary><p className="max-w-3xl pt-3 pr-8 text-sm leading-6 text-muted">{answer}</p></details>)}</div>;
}

export function BackToTop() {
  return <a href="#home" className="footer-top-link" aria-label="Back to top">Back to top <ArrowRight aria-hidden="true" className="h-4 w-4 -rotate-90" /></a>;
}

export function DemoPill({ children = "Demo content" }: { children?: string }) {
  return <span className="demo-pill"><Briefcase aria-hidden="true" className="h-3 w-3" />{children}</span>;
}

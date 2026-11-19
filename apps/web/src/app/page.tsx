import Image from "next/image";
import Link from "next/link";
import {
  ArrowDown, ArrowRight, ArrowUpRight, Banknote, BriefcaseBusiness,
  Bell, Building2, CalendarDays, Check, CheckCircle2, CircleHelp,
  ClipboardCheck, Clock3, Compass, FileCheck2, Handshake, HeartHandshake, House, Languages,
  MapPin, MessageCircle, Navigation, Search, ShieldCheck, Sparkles, Star,
  ShieldAlert, Truck, UserRound, Users, Wallet, Wrench, Zap,
} from "lucide-react";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { ScrollRevealObserver } from "@/components/scroll-reveal-observer";
import { LandingFaq, LandingSearch } from "@/components/landing-interactions";

const categoryGroups = [
  { icon: House, title: "Domestic services", description: "Reliable help for everyday life at home.", skills: ["Cook", "Cleaner", "Housekeeper", "Babysitter", "Caregiver", "Gardener", "Laundry assistant"] },
  { icon: Wrench, title: "Skilled trades", description: "Experienced hands for repairs and specialist work.", skills: ["Electrician", "Plumber", "Carpenter", "Painter", "Mason", "Welder", "AC technician", "Solar technician"] },
  { icon: Truck, title: "Transport & delivery", description: "People to keep journeys and goods moving.", skills: ["Personal driver", "Commercial driver", "Delivery rider", "Logistics worker"] },
  { icon: Zap, title: "Technical services", description: "Practical technical and maintenance expertise.", skills: ["Computer technician", "IT support", "Mechanical technician", "Electrical technician", "Construction technician"] },
  { icon: BriefcaseBusiness, title: "Other services", description: "A broad range of essential services and skills.", skills: ["Tailor", "Security personnel", "Office assistant", "General labourer"] },
];

const workers = [
  { name: "Ayesha K.", profession: "Home cook", city: "Lahore", area: "Gulberg", experience: "5 years", price: "PKR 38–45k / month", availability: "Schedule to discuss", match: "86%", image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=520&q=80", skills: ["Pakistani cuisine", "Meal planning", "Weekdays"], evidence: "Skills self-reported" },
  { name: "Bilal R.", profession: "Electrician", city: "Islamabad", area: "G-11", experience: "7 years", price: "Offers from PKR 2,000 / visit", availability: "Availability to confirm", match: "82%", image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=520&q=80", skills: ["Wiring", "Maintenance", "Solar basics"], evidence: "Experience evidence submitted" },
  { name: "Sana M.", profession: "Care assistant", city: "Rawalpindi", area: "Satellite Town", experience: "4 years", price: "PKR 32–40k / month", availability: "Part-time preferred", match: "78%", image: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=520&q=80", skills: ["Elder care", "Meal support", "Companionship"], evidence: "Profile information demo" },
];

const sampleJobs = [
  { title: "Electrical maintenance for a small office", employer: "Sample employer", city: "Islamabad · Blue Area", skills: ["Electrical", "Maintenance"], budget: "PKR 2,500 / visit", type: "Project-based", hours: "One-day visit", openings: "1 worker", posted: "Sample listing" },
  { title: "Weekday home cooking", employer: "Sample household", city: "Lahore · DHA", skills: ["Cooking", "Meal prep"], budget: "PKR 40–48k / month", type: "Monthly", hours: "Monday–Friday", openings: "1 worker", posted: "Sample listing" },
  { title: "General helpers for a renovation", employer: "Sample contractor", city: "Rawalpindi · Bahria", skills: ["Construction", "Teamwork"], budget: "PKR 2,200 / day", type: "Daily wage", hours: "Day shift", openings: "3 workers", posted: "Sample listing" },
];

const cities = ["Islamabad", "Rawalpindi", "Lahore", "Karachi", "Peshawar", "Wah Cantt", "Taxila", "Faisalabad", "Multan", "Quetta"];

const platformFeatures = [
  [Compass, "Location-based discovery", "Explore opportunities and professionals by city and area."],
  [Clock3, "Availability", "Share schedules and discuss when the work can happen."],
  [Handshake, "Direct hiring requests", "Employers can invite suitable workers to discuss a role."],
  [FileCheck2, "Applications", "Workers can express interest in opportunities that fit their skills."],
  [Wallet, "Price offers", "Make expectations visible and discuss terms before confirming work."],
  [Sparkles, "Explainable recommendations", "See the factors that contribute to a suggested match."],
  [Star, "Saved profiles & jobs", "Keep useful opportunities and profiles easy to revisit."],
  [ClipboardCheck, "Application tracking", "Follow application and hiring conversations from a dashboard."],
  [MessageCircle, "In-app messaging", "Clarify job details and expectations directly with the other party."],
  [CheckCircle2, "Hiring confirmation", "Record the agreed arrangement when both sides are ready."],
  [Users, "Multi-worker projects", "Organize teams for events, maintenance, and construction projects."],
  [Languages, "Urdu and English", "A multilingual experience designed for local communities."],
  [Bell, "Smart notifications", "Stay aware of requests, applications, and important updates."],
  [ShieldAlert, "Complaint management", "A structured path for raising concerns and seeking support."],
  [ClipboardCheck, "Profile management", "Keep professional skills and work preferences up to date."],
  [BriefcaseBusiness, "Role-based dashboards", "Manage employer and worker activity in dedicated workspaces."],
] as const;

function SectionHeading({ label, title, text, centered = false }: { label: string; title: string; text?: string; centered?: boolean }) {
  return <div className={centered ? "section-heading mx-auto max-w-3xl text-center" : "section-heading max-w-2xl"}>
    <p className="section-eyebrow">{label}</p><h2 className="section-title">{title}</h2>{text && <p className="section-copy">{text}</p>}
  </div>;
}

function DemoLabel({ children = "Demonstration" }: { children?: string }) {
  return <span className="demo-label"><span className="h-1.5 w-1.5 rounded-full bg-amber-500" />{children}</span>;
}

export default function HomePage() {
  return <>
    <SiteHeader />
    <ScrollRevealObserver />
    <main>
      <section id="home" className="hero-marketplace relative overflow-hidden">
        <div aria-hidden="true" className="hero-grid absolute inset-0 opacity-50" />
        <div aria-hidden="true" className="premium-orb premium-orb-blue absolute -right-32 top-14 h-[28rem] w-[28rem] rounded-full" />
        <div aria-hidden="true" className="premium-orb premium-orb-green absolute -left-36 bottom-0 h-80 w-80 rounded-full" />
        <div className="relative mx-auto grid max-w-[1440px] items-center gap-12 px-5 pb-16 pt-12 sm:px-8 sm:pb-20 sm:pt-16 lg:grid-cols-[1.05fr_.95fr] lg:gap-10 lg:px-10 lg:pb-24 lg:pt-20">
          <div className="hero-copy scroll-reveal-left">
            <div className="hero-kicker"><span className="hero-kicker-icon"><Sparkles className="h-4 w-4" /></span> A two-sided marketplace for better work</div>
            <h1 className="mt-6 max-w-3xl text-[43px] font-semibold leading-[1.04] tracking-[-.055em] text-navy sm:text-6xl lg:text-[68px]">The right worker.<br /><span className="hero-title-highlight">The right job.</span><br />One intelligent platform.</h1>
            <p className="mt-6 max-w-xl text-base leading-7 text-slate-600 sm:text-lg sm:leading-8">Discover skilled professionals, find meaningful employment, and connect directly through explainable AI-powered matching.</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/register?role=employer" className="primary-button min-h-13 justify-center px-6">I want to hire <ArrowUpRight aria-hidden="true" className="h-4 w-4" /></Link>
              <Link href="/register?role=worker" className="secondary-button min-h-13 justify-center px-6">I want to work <ArrowUpRight aria-hidden="true" className="h-4 w-4" /></Link>
            </div>
            <a href="#how-it-works" className="hero-how-link mt-5 inline-flex items-center gap-2 text-sm font-semibold text-primary">Explore how it works <ArrowDown aria-hidden="true" className="h-4 w-4" /></a>
            <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-slate-200/80 pt-5 text-xs text-slate-500">
              <span className="inline-flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-emerald-600" /> Evidence shown with context</span>
              <span className="inline-flex items-center gap-2"><MapPin className="h-4 w-4 text-primary" /> Built for Pakistan</span>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-[590px] scroll-reveal-right lg:ml-auto">
            <DemoLabel>Marketplace preview · fictional profiles</DemoLabel>
            <div className="market-dashboard mt-3">
              <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 sm:px-6">
                <div><p className="text-sm font-semibold text-navy">Your hiring workspace</p><p className="mt-1 text-xs text-slate-500">A look at a possible match</p></div>
                <span className="dashboard-live"><span /> DEMO</span>
              </div>
              <div className="grid gap-4 p-4 sm:p-5 md:grid-cols-[1.08fr_.92fr]">
                <div className="worker-preview-card">
                  <div className="flex items-start gap-3">
                    <div className="hero-profile-photo"><Image src={workers[0].image} alt="Stock portrait for fictional demo profile Ayesha K." fill sizes="64px" className="object-cover" /></div>
                    <div className="min-w-0 flex-1"><p className="text-[10px] font-semibold uppercase tracking-[.12em] text-slate-400">Sample worker</p><h2 className="mt-1 truncate text-sm font-semibold text-navy">Ayesha K.</h2><p className="mt-1 text-xs text-slate-500">Home cook · 5 years’ experience</p></div>
                    <div className="match-donut"><span>86<small>%</small></span></div>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-1.5"><span className="skill-chip">Pakistani cuisine</span><span className="skill-chip">Meal planning</span><span className="skill-chip">Weekdays</span></div>
                  <div className="mt-4 grid grid-cols-2 gap-2 text-xs"><div className="detail-tile"><MapPin className="h-3.5 w-3.5 text-primary" /> Lahore · Gulberg</div><div className="detail-tile"><Wallet className="h-3.5 w-3.5 text-emerald-600" /> PKR 38–45k</div><div className="detail-tile"><Clock3 className="h-3.5 w-3.5 text-primary" /> Schedule to discuss</div><div className="detail-tile"><FileCheck2 className="h-3.5 w-3.5 text-amber-600" /> Self-reported skills</div></div>
                  <div className="mt-4 rounded-xl bg-blue-50/80 p-3"><p className="flex items-center gap-1.5 text-[11px] font-semibold text-primary"><Sparkles className="h-3.5 w-3.5" /> Why this may fit</p><p className="mt-1 text-[11px] leading-5 text-slate-600">Skills and location align with the sample requirement. Availability and supporting evidence should be discussed.</p></div>
                </div>
                <div className="flex flex-col gap-3">
                  <div className="rounded-2xl border border-slate-200 bg-white p-4">
                    <div className="flex items-center justify-between"><p className="text-xs font-semibold text-navy">Open opportunity</p><span className="rounded-full bg-slate-100 px-2 py-1 text-[9px] font-semibold text-slate-500">SAMPLE</span></div>
                    <h3 className="mt-3 text-sm font-semibold text-slate-800">Weekday home cook</h3><p className="mt-1 text-xs text-slate-500">Sample household · Lahore</p>
                    <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3"><span className="text-[11px] text-slate-500">Monthly budget</span><span className="text-xs font-semibold text-navy">PKR 40–48k</span></div>
                  </div>
                  <div className="offer-notification"><span className="offer-icon"><Handshake className="h-4 w-4" /></span><div><p className="text-[10px] font-semibold uppercase tracking-wide text-emerald-700">Hiring request · demo</p><p className="mt-1 text-xs font-semibold text-navy">A new offer is ready to review</p><p className="mt-1 text-[10px] text-slate-500">Illustrative marketplace interaction</p></div><span className="ml-auto h-2 w-2 rounded-full bg-emerald-500" /></div>
                  <div className="rounded-2xl bg-navy p-4 text-white">
                    <div className="flex items-center gap-2"><span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 text-blue-200"><Sparkles className="h-4 w-4" /></span><div><p className="text-xs font-semibold">AI match explanation</p><p className="text-[10px] text-white/55">Illustrative score · not a guarantee</p></div></div>
                    <div className="mt-4 space-y-2.5">{[["Skills", "Strong"], ["Experience", "Relevant"], ["Location", "Nearby"], ["Budget", "In range"]].map(([name, value]) => <div key={name} className="flex items-center justify-between text-[10px]"><span className="text-white/65">{name}</span><span className="inline-flex items-center gap-1 text-emerald-300"><Check className="h-3 w-3" />{value}</span></div>)}</div>
                  </div>
                </div>
              </div>
              <p className="px-5 pb-4 text-[10px] leading-4 text-slate-400">All names, images, offers and scores shown here are demonstration content.</p>
            </div>
            <div className="negotiation-float"><span className="negotiation-avatar"><Banknote className="h-4 w-4" /></span><div><p className="text-[10px] font-semibold text-navy">Counter-offer · demo</p><p className="mt-0.5 text-[10px] text-slate-500">PKR 2,300 proposed on a PKR 2,500 job</p></div></div>
          </div>
        </div>
      </section>

      <section className="capability-strip border-y border-slate-200 bg-white">
        <div className="mx-auto grid max-w-[1440px] gap-px px-5 py-5 sm:grid-cols-2 sm:px-8 lg:grid-cols-4 lg:px-10">
          {[[Users, "Two-sided marketplace", "Employers and workers both initiate"], [Sparkles, "AI-assisted discovery", "Relevant recommendations with reasons"], [MapPin, "Local-first", "Designed around Pakistan’s cities"], [FileCheck2, "Evidence-aware", "Clear labels, no false certainty"]].map(([Icon, title, copy]) => <div key={title as string} className="strip-item flex items-center gap-3 px-2 py-3 sm:px-4"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slatebg text-primary"><Icon className="h-5 w-5" /></span><div><p className="text-xs font-semibold text-navy">{title as string}</p><p className="mt-1 text-[10px] leading-4 text-slate-500">{copy as string}</p></div></div>)}
        </div>
      </section>

      <section id="discovery" className="section-pad bg-slatebg">
        <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-10">
          <div className="mb-8 scroll-reveal-left"><SectionHeading label="Start with what you need" title="One marketplace. Two ways to find a fit." text="Employers can look for the right person. Workers can look for the right opportunity." /></div>
          <div className="scroll-reveal-up"><LandingSearch /></div>
        </div>
      </section>

      <section id="categories" className="section-pad bg-white">
        <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-10">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div className="scroll-reveal-left"><SectionHeading label="Explore the marketplace" title="Skills for every kind of work." text="From everyday home support to specialist technical services, start with the work that matters to you." /></div><Link href="/register" className="text-link scroll-reveal-right">Explore all skills <ArrowRight className="h-4 w-4" /></Link></div>
          <div className="mt-9 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">{categoryGroups.map((group, index) => { const Icon = group.icon; return <article key={group.title} style={{ transitionDelay: `${index * 70}ms` }} className="category-group-card scroll-reveal-up">
            <div className="flex items-start justify-between"><span className="category-icon"><Icon className="h-5 w-5" /></span><span className="text-xs font-semibold text-slate-300">0{index + 1}</span></div>
            <h3 className="mt-5 text-base font-semibold text-navy">{group.title}</h3><p className="mt-2 min-h-10 text-xs leading-5 text-slate-500">{group.description}</p>
            <div className="mt-4 flex flex-wrap gap-1.5">{group.skills.map((skill) => <span key={skill} className="category-skill">{skill}</span>)}</div>
            <Link href="/register" className="mt-5 inline-flex items-center gap-1 text-xs font-semibold text-primary">Explore category <ArrowRight className="h-3.5 w-3.5" /></Link>
          </article>; })}</div>
        </div>
      </section>

      <section id="workers" className="section-pad bg-[#f5f8fc]">
        <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-10">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div className="scroll-reveal-left"><SectionHeading label="Direct hiring" title="Find your worker. Send a direct request." text="Explore sample professional profiles and see how skills, experience, location, offers, and evidence could be compared." /></div><DemoLabel>Fictional sample profiles</DemoLabel></div>
          <div className="mt-9 grid gap-5 lg:grid-cols-3">{workers.map((worker, index) => <article key={worker.name} style={{ transitionDelay: `${index * 90}ms` }} className="worker-card scroll-reveal-up">
            <div className="relative h-48 overflow-hidden bg-gradient-to-br from-blue-100 via-slate-100 to-emerald-50"><Image src={worker.image} alt={`Stock portrait for fictional demonstration profile ${worker.name}`} fill sizes="(max-width: 1024px) 100vw, 33vw" className="object-cover object-center transition-transform duration-500 hover:scale-[1.04]" /><span className="absolute left-3 top-3 rounded-full border border-white/70 bg-white/90 px-2.5 py-1 text-[10px] font-semibold text-slate-600">DEMO PROFILE</span><span className="absolute right-3 top-3 rounded-full bg-navy/90 px-2.5 py-1 text-[10px] font-semibold text-white">{worker.match} illustrative match</span></div>
            <div className="p-5"><div className="flex items-start justify-between gap-3"><div><h3 className="text-base font-semibold text-navy">{worker.name}</h3><p className="mt-1 text-sm text-primary">{worker.profession}</p></div><span className="rounded-xl bg-slatebg px-2.5 py-1.5 text-[10px] font-medium text-slate-500">{worker.experience}</span></div>
              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-xs text-slate-500"><span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5 text-slate-400" />{worker.city} · {worker.area}</span><span className="inline-flex items-center gap-1"><Clock3 className="h-3.5 w-3.5 text-slate-400" />{worker.availability}</span></div>
              <div className="mt-4 flex flex-wrap gap-1.5">{worker.skills.map((skill) => <span key={skill} className="skill-chip">{skill}</span>)}</div>
              <div className="mt-4 flex items-center justify-between border-y border-slate-100 py-3"><span className="text-[11px] text-slate-500">Expected price</span><span className="text-xs font-semibold text-navy">{worker.price}</span></div>
              <p className="mt-3 flex items-center gap-2 text-[11px] text-slate-500"><FileCheck2 className="h-3.5 w-3.5 text-emerald-600" />{worker.evidence}</p>
              <Link href="/register?role=employer" className="secondary-button mt-4 w-full justify-center">Create account to explore <ArrowUpRight className="h-4 w-4" /></Link>
            </div>
          </article>)}</div>
          <p className="mt-5 text-center text-xs text-slate-500">Portraits are stock images. Names, profiles, availability, prices, and scores are fictional examples.</p>
        </div>
      </section>

      <section id="jobs" className="section-pad bg-white">
        <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-10">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div className="scroll-reveal-left"><SectionHeading label="Open opportunity marketplace" title="Discover work that fits your skills." text="Workers can apply to suitable jobs and share the terms they are looking for. These cards demonstrate the intended experience; they are not live listings." /></div><DemoLabel>Sample opportunities · not live</DemoLabel></div>
          <div className="mt-8 flex flex-wrap gap-2">{["All examples", "Domestic", "Skilled trades", "Transport", "Project work"].map((filter, index) => <span key={filter} className={`rounded-full px-3.5 py-2 text-xs font-medium ${index === 0 ? "bg-navy text-white" : "border border-slate-200 bg-white text-slate-500"}`}>{filter}</span>)}</div>
          <div className="mt-5 grid gap-4 lg:grid-cols-3">{sampleJobs.map((job, index) => <article key={job.title} style={{ transitionDelay: `${index * 90}ms` }} className="job-card scroll-reveal-up">
            <div className="flex items-start justify-between gap-3"><span className="job-icon"><BriefcaseBusiness className="h-5 w-5" /></span><span className="demo-label">Sample job</span></div>
            <h3 className="mt-5 text-base font-semibold leading-6 text-navy">{job.title}</h3><p className="mt-1 text-xs text-slate-500">{job.employer}</p>
            <div className="mt-4 grid grid-cols-2 gap-2 text-xs"><span className="job-detail"><MapPin className="h-3.5 w-3.5" />{job.city}</span><span className="job-detail"><Wallet className="h-3.5 w-3.5" />{job.budget}</span><span className="job-detail"><CalendarDays className="h-3.5 w-3.5" />{job.type}</span><span className="job-detail"><Users className="h-3.5 w-3.5" />{job.openings}</span></div>
            <div className="mt-4 flex flex-wrap gap-1.5">{job.skills.map((skill) => <span key={skill} className="skill-chip">{skill}</span>)}</div>
            <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-[10px] text-slate-400"><span>{job.hours}</span><span>{job.posted}</span></div>
            <Link href="/register?role=worker" className="primary-button mt-4 w-full justify-center">Create worker profile <ArrowRight className="h-4 w-4" /></Link>
          </article>)}</div>
        </div>
      </section>

      <section id="matching" className="section-pad ai-section relative overflow-hidden bg-navy text-white">
        <div aria-hidden="true" className="ai-background-orb absolute -right-28 top-8 h-96 w-96 rounded-full" />
        <div className="relative mx-auto grid max-w-[1440px] items-center gap-12 px-5 sm:px-8 lg:grid-cols-[.85fr_1.15fr] lg:px-10">
          <div className="scroll-reveal-left"><p className="section-eyebrow section-eyebrow-light">Explainable AI</p><h2 className="mt-4 text-3xl font-semibold leading-tight tracking-[-.04em] sm:text-5xl">More relevant connections. Recommendations with reasons.</h2><p className="mt-5 max-w-xl text-sm leading-7 text-blue-100/70">LabourLens is designed to compare what workers offer with what employers need, in both directions. AI can assist decisions; it cannot guarantee suitability or a successful hire.</p>
            <div className="mt-7 grid gap-3 sm:grid-cols-2"><div className="ai-direction-card"><span><Building2 className="h-4 w-4" /></span><div><p>Employer → worker</p><small>Requirements meet worker profiles</small></div></div><div className="ai-direction-card"><span><UserRound className="h-4 w-4" /></span><div><p>Worker → opportunity</p><small>Profiles meet suitable job briefs</small></div></div></div>
          </div>
          <div className="ai-match-card scroll-reveal-right">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4"><div className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-400/15 text-blue-200"><Sparkles className="h-5 w-5" /></span><div><p className="text-sm font-semibold">Match explanation</p><p className="mt-1 text-[10px] text-white/45">Illustrative score · demo only</p></div></div><span className="rounded-full border border-amber-200/20 bg-amber-300/10 px-3 py-1.5 text-[10px] font-semibold text-amber-200">NOT A LIVE RESULT</span></div>
            <div className="mt-5 grid gap-5 sm:grid-cols-[.85fr_1.15fr]">
              <div className="rounded-2xl bg-white/[.06] p-4"><p className="text-[10px] font-semibold uppercase tracking-wider text-white/45">Sample job</p><h3 className="mt-2 text-sm font-semibold">Residential electrician</h3><p className="mt-1 text-xs text-white/55">Lahore · project visit</p><div className="mt-4 flex flex-wrap gap-1.5"><span className="dark-chip">Wiring</span><span className="dark-chip">Safety</span><span className="dark-chip">Repairs</span></div><div className="mt-4 border-t border-white/10 pt-3 text-xs"><span className="text-white/45">Budget</span><strong className="float-right font-semibold">PKR 2,500</strong></div></div>
              <div><div className="flex items-center gap-3"><div className="small-photo"><Image src={workers[1].image} alt="Stock portrait for fictional sample candidate Bilal R." fill sizes="48px" className="object-cover" /></div><div><p className="text-sm font-semibold">Bilal R. <span className="ml-1 rounded bg-white/10 px-1.5 py-0.5 text-[9px] font-medium text-white/60">SAMPLE</span></p><p className="mt-1 text-xs text-white/50">Electrician · Lahore</p></div><div className="ml-auto text-right"><strong className="text-xl font-semibold text-emerald-300">82%</strong><p className="text-[9px] text-white/40">demo score</p></div></div>
                <div className="mt-5 space-y-3">{[["Skills", "3 of 4 align", 78], ["Experience", "Relevant", 82], ["Location", "Compatible", 72], ["Budget", "Discuss offer", 58]].map(([label, status, width]) => <div key={label as string}><div className="mb-1.5 flex justify-between text-[10px]"><span className="text-white/60">{label as string}</span><span className="text-white/80">{status as string}</span></div><div className="h-1.5 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-gradient-to-r from-blue-400 to-emerald-300" style={{ width: `${width}%` }} /></div></div>)}</div>
              </div>
            </div>
            <div className="mt-5 flex gap-2.5 rounded-xl border border-white/10 bg-white/[.04] p-3"><CircleHelp className="mt-0.5 h-4 w-4 shrink-0 text-blue-200" /><p className="text-[11px] leading-5 text-white/65">Suggested because electrical skills and project experience align. Confirm schedule, location details, price, and supporting evidence before deciding.</p></div>
          </div>
        </div>
      </section>

      <section id="negotiation" className="section-pad bg-slatebg">
        <div className="mx-auto grid max-w-[1440px] items-center gap-12 px-5 sm:px-8 lg:grid-cols-[.9fr_1.1fr] lg:px-10">
          <div className="scroll-reveal-left"><p className="section-eyebrow">A fair conversation</p><h2 className="section-title">Work on terms that suit both sides.</h2><p className="section-copy">Employers can share a budget. Workers can respond with an offer. Both sides can discuss the work and agree on terms before confirming a hire.</p><p className="mt-5 text-xs leading-5 text-slate-500">The offer flow below is a demonstration concept, not a live negotiation or payment feature.</p><Link href="/register?role=employer" className="primary-button mt-6">Start a hiring conversation <ArrowRight className="h-4 w-4" /></Link></div>
          <div className="negotiation-board scroll-reveal-right"><div className="flex items-center justify-between border-b border-slate-100 pb-4"><div><p className="text-sm font-semibold text-navy">Electrician · one-day job</p><p className="mt-1 text-xs text-slate-500">Sample offer board</p></div><DemoLabel>Demo interaction</DemoLabel></div>
            <div className="budget-callout mt-4"><div><span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Employer budget</span><p className="mt-1 text-xl font-semibold text-navy">PKR 2,500</p></div><span className="budget-icon"><Banknote className="h-5 w-5" /></span></div>
            <div className="mt-4 space-y-2.5">{[{ name: "Worker A", offer: "PKR 2,300", note: "Proposed price", status: "Offer sent", tone: "blue" }, { name: "Worker B", offer: "PKR 2,800", note: "Counter-offer", status: "Discuss terms", tone: "amber" }, { name: "Worker C", offer: "PKR 2,500", note: "Matches budget", status: "Example accepted", tone: "green" }].map((offer) => <div key={offer.name} className="offer-row"><span className={`offer-person offer-person-${offer.tone}`}><UserRound className="h-4 w-4" /></span><div className="min-w-0 flex-1"><p className="text-xs font-semibold text-navy">{offer.name} <span className="ml-1 font-normal text-slate-400">· {offer.note}</span></p><p className="mt-1 text-sm font-semibold text-slate-700">{offer.offer}</p></div><span className={`offer-status offer-status-${offer.tone}`}>{offer.status}</span></div>)}</div>
            <div className="mt-4 flex items-start gap-2 rounded-xl bg-slatebg p-3 text-[11px] leading-5 text-slate-500"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />No payment processing is represented here. Agree payment arrangements directly and confirm work only when both sides are comfortable.</div>
          </div>
        </div>
      </section>

      <section id="compare" className="section-pad bg-white">
        <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-10">
          <div className="scroll-reveal-left"><SectionHeading label="Compare with context" title="See the differences that matter." text="A comparison should show trade-offs and unknowns, not rank people as if one score tells the whole story." /></div>
          <div className="comparison-card mt-8 scroll-reveal-up"><div className="comparison-header"><div><p className="text-sm font-semibold text-navy">Candidate comparison</p><p className="mt-1 text-xs text-slate-500">Fictional profiles · illustrative values</p></div><DemoLabel>DEMO</DemoLabel></div>
            <div className="overflow-x-auto"><table className="comparison-table"><thead><tr><th>Consideration</th><th><span className="comparison-person"><span className="comparison-avatar avatar-blue">FA</span>Farah A.</span></th><th><span className="comparison-person"><span className="comparison-avatar avatar-green">BR</span>Bilal R.</span></th><th><span className="comparison-person"><span className="comparison-avatar avatar-violet">SM</span>Sana M.</span></th></tr></thead><tbody>
              {[["Profession", "Electrician", "Electrician", "Maintenance tech"], ["Relevant skills", "Wiring · Safety", "Repair · Solar", "Maintenance · Tools"], ["Experience", "4 years", "7 years", "5 years"], ["Location", "Lahore", "Islamabad", "Rawalpindi"], ["Expected price", "PKR 2,300 / visit", "Offer from PKR 2,000", "Discuss per project"], ["Availability", "To confirm", "To confirm", "Weekends preferred"], ["Evidence status", "Self-reported skills", "Experience evidence submitted", "Not available"], ["Illustrative compatibility", "84% demo", "82% demo", "76% demo"]].map(([label, ...values]) => <tr key={label}><th scope="row">{label}</th>{values.map((value, index) => <td key={index}>{value}</td>)}</tr>)}
            </tbody></table></div><p className="px-5 pb-5 text-[11px] leading-5 text-slate-400">Evidence labels and match values are fictional examples. Submitted evidence has not been reviewed in this demonstration.</p></div>
        </div>
      </section>

      <section id="how-it-works" className="section-pad bg-[#f5f8fc]">
        <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-10"><div className="scroll-reveal-up"><SectionHeading centered label="Both sides move work forward" title="A marketplace built around action." text="Hiring and job seeking meet in one place. Either side can start the conversation." /></div>
          <div className="mt-10 grid gap-5 lg:grid-cols-2">
            <article className="workflow-card scroll-reveal-left"><div className="workflow-title"><span className="workflow-icon bg-blue-50 text-primary"><Building2 className="h-5 w-5" /></span><div><h3>For employers</h3><p>Find directly or publish a job.</p></div><Link href="/register?role=employer" aria-label="Register as an employer"><ArrowUpRight className="h-5 w-5" /></Link></div><ol className="workflow-list">{["Search workers by skill and location", "Publish a job with clear requirements", "Receive and review applications", "Explore AI recommendations", "Compare candidate profiles", "Send direct hiring requests", "Discuss scope, schedule, and price", "Confirm the arrangement together"].map((step, index) => <li key={step}><span>{String(index + 1).padStart(2, "0")}</span>{step}</li>)}</ol><Link href="/register?role=employer" className="secondary-button mt-5 w-full justify-center">I want to hire <ArrowRight className="h-4 w-4" /></Link></article>
            <article className="workflow-card scroll-reveal-right"><div className="workflow-title"><span className="workflow-icon bg-emerald-50 text-emerald-600"><UserRound className="h-5 w-5" /></span><div><h3>For workers</h3><p>Show your skills and find work.</p></div><Link href="/register?role=worker" aria-label="Register as a worker"><ArrowUpRight className="h-5 w-5" /></Link></div><ol className="workflow-list">{["Create a professional profile", "Set skills and availability", "Discover available jobs", "Review AI recommendations", "Apply for suitable opportunities", "Share your expected price", "Discuss terms with employers", "Accept a suitable hiring request"].map((step, index) => <li key={step}><span>{String(index + 1).padStart(2, "0")}</span>{step}</li>)}</ol><Link href="/register?role=worker" className="secondary-button mt-5 w-full justify-center">I want to work <ArrowRight className="h-4 w-4" /></Link></article>
          </div>
          <p className="mt-5 text-center text-xs text-slate-500">Some marketplace actions shown above are planned experiences and are not yet connected to live public search.</p>
        </div>
      </section>

      <section id="teams" className="section-pad bg-white">
        <div className="mx-auto grid max-w-[1440px] items-center gap-10 px-5 sm:px-8 lg:grid-cols-2 lg:px-10">
          <div className="scroll-reveal-left"><span className="section-icon-badge"><Users className="h-5 w-5" /></span><p className="section-eyebrow mt-5">Hiring for a bigger job?</p><h2 className="section-title">Bring the right people together.</h2><p className="section-copy">Some projects need more than one person. LabourLens is designed to help employers organize requirements for cleaning teams, events, construction, and maintenance work.</p><Link href="/register?role=employer" className="primary-button mt-6">Create an employer account <ArrowRight className="h-4 w-4" /></Link></div>
          <div className="team-board scroll-reveal-right"><DemoLabel>Illustrative project board</DemoLabel><div className="mt-4 rounded-2xl border border-slate-200 bg-white p-5"><div className="flex items-start justify-between gap-4"><div><p className="text-xs font-medium text-slate-500">Sample project</p><h3 className="mt-1 text-base font-semibold text-navy">Community hall renovation</h3><p className="mt-1 text-xs text-slate-500">Rawalpindi · project-based</p></div><span className="rounded-xl bg-blue-50 px-3 py-2 text-center"><strong className="block text-lg text-primary">4</strong><small className="text-[9px] text-slate-500">workers needed</small></span></div><div className="mt-5 space-y-2">{[["Electrician", "1 role", "blue"], ["Painter", "2 roles", "green"], ["General labourer", "1 role", "violet"]].map(([role, amount, tone]) => <div key={role} className="team-role-row"><span className={`team-role-dot team-role-${tone}`} /><span className="flex-1 text-xs font-medium text-slate-700">{role}</span><span className="text-[10px] text-slate-400">{amount}</span><span className="text-[10px] font-semibold text-slate-500">Shortlist preview</span></div>)}</div><div className="mt-4 flex items-center gap-2 rounded-xl bg-amber-50 p-3 text-[10px] leading-4 text-amber-800"><InfoIcon /> Team selection is a product concept; no worker availability is implied.</div></div></div>
        </div>
      </section>

      <section id="trust" className="section-pad bg-slatebg">
        <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-10"><div className="scroll-reveal-left"><SectionHeading label="Trust starts with transparency" title="Know what matches. Know what needs a conversation." text="A useful recommendation makes its reasoning visible and leaves room for human judgment." /></div>
          <div className="mt-8 grid gap-4 md:grid-cols-3">{[[CheckCircle2, "Matched requirements", "Understand where skills, experience, location, schedule, and budget appear to align.", "text-emerald-600", "bg-emerald-50"], [CircleHelp, "Information to discuss", "See requirements that are missing, uncertain, or worth confirming before hiring.", "text-amber-600", "bg-amber-50"], [FileCheck2, "Evidence status", "Distinguish submitted evidence from self-reported details and information not available.", "text-primary", "bg-blue-50"]].map(([Icon, title, copy, color, bg]) => <article key={title as string} className="trust-feature scroll-reveal-up"><span className={`flex h-11 w-11 items-center justify-center rounded-xl ${bg as string} ${color as string}`}><Icon className="h-5 w-5" /></span><h3 className="mt-5 text-base font-semibold text-navy">{title as string}</h3><p className="mt-2 text-sm leading-6 text-slate-500">{copy as string}</p></article>)}</div>
          <div className="evidence-legend mt-5"><div><span className="evidence-dot bg-blue-500" /><p><strong>Evidence submitted</strong><small>A document or record was provided; review status may differ.</small></p></div><div><span className="evidence-dot bg-emerald-500" /><p><strong>Reviewed evidence</strong><small>Use only when an administrator has reviewed the submission.</small></p></div><div><span className="evidence-dot bg-violet-500" /><p><strong>Self-reported</strong><small>Information entered by the profile owner.</small></p></div><div><span className="evidence-dot bg-slate-400" /><p><strong>Not available</strong><small>No supporting information is currently shown.</small></p></div></div>
          <p className="mx-auto mt-5 max-w-4xl text-center text-xs leading-5 text-slate-500">LabourLens can support informed decisions, but it does not guarantee identity authenticity, personal safety, work quality, or employment outcomes. Review information and use your own judgment.</p>
        </div>
      </section>

      <section id="features" className="section-pad bg-white">
        <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-10"><div className="scroll-reveal-up"><SectionHeading centered label="A connected employment experience" title="Tools for both sides of work." text="A shared marketplace can support discovery, communication, and clearer hiring conversations." /></div>
          <div className="mt-9 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{platformFeatures.map(([Icon, title, copy], index) => <article key={title} style={{ transitionDelay: `${(index % 4) * 55}ms` }} className="feature-card scroll-reveal-up"><span className="feature-icon"><Icon className="h-5 w-5" /></span><h3 className="mt-4 text-sm font-semibold text-navy">{title}</h3><p className="mt-2 text-xs leading-5 text-slate-500">{copy}</p></article>)}</div>
          <p className="mt-5 text-center text-xs text-slate-400">Messaging, negotiation, hiring confirmation, and related marketplace tools shown here describe the product direction. Availability depends on backend integration.</p>
        </div>
      </section>

      <section id="cities" className="section-pad bg-[#f5f8fc]">
        <div className="mx-auto grid max-w-[1440px] items-center gap-10 px-5 sm:px-8 lg:grid-cols-[.85fr_1.15fr] lg:px-10">
          <div className="scroll-reveal-left"><p className="section-eyebrow">Local work, wider opportunity</p><h2 className="section-title">Start with your city.</h2><p className="section-copy">Explore the places LabourLens is designed to serve, from major cities to growing local communities.</p><div className="mt-6 flex flex-wrap gap-2">{cities.map((city) => <span key={city} className="city-chip"><MapPin className="h-3 w-3 text-primary" />{city}</span>)}</div><p className="mt-4 text-[11px] text-slate-400">City list is illustrative; no live worker counts or availability are claimed.</p></div>
          <div className="map-preview scroll-reveal-right"><div className="map-grid" /><svg aria-hidden="true" viewBox="0 0 600 330" className="map-lines"><path d="M52 255 151 211l46-63 67 13 62-84 71 30 45-55 88 34M151 211l47 40 83-22 72 39 81-43 96 41M197 148l9-102 62 15 58 16m0 0 68-19 51 49" /></svg>{[["Islamabad", 59, 29], ["Rawalpindi", 62, 37], ["Lahore", 77, 53], ["Peshawar", 40, 43], ["Karachi", 28, 83], ["Multan", 62, 67], ["Faisalabad", 70, 61], ["Quetta", 32, 66]].map(([city, x, y]) => <span key={city as string} className="map-city" style={{ left: `${x}%`, top: `${y}%` }}><i />{city as string}</span>)}<div className="map-caption"><Navigation className="h-4 w-4 text-primary" /><span><strong>Location discovery preview</strong><small>Illustrative map · no live availability</small></span></div></div>
        </div>
      </section>

      <section id="about" className="section-pad bg-white">
        <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-10"><div className="scroll-reveal-left"><SectionHeading label="For every side of the marketplace" title="Better ways to get work done." text="LabourLens brings employers and workers into one place, with tools designed to make expectations and recommendations easier to understand." /></div>
          <div className="mt-8 grid gap-5 lg:grid-cols-2"><article className="benefit-panel employer-panel scroll-reveal-left"><div className="flex items-center gap-3"><span className="benefit-icon"><Building2 className="h-5 w-5" /></span><div><h3>For employers</h3><p>Find a fit and move the conversation forward.</p></div></div><ul>{["Discover relevant workers and skills", "Compare candidates with clear context", "Share the work, location, and budget", "Invite a worker or publish an opportunity", "Discuss terms before confirming a hire"].map((item) => <li key={item}><Check className="h-4 w-4 text-primary" />{item}</li>)}</ul><Link href="/register?role=employer" className="primary-button mt-5">Start hiring <ArrowRight className="h-4 w-4" /></Link></article>
            <article className="benefit-panel worker-panel scroll-reveal-right"><div className="flex items-center gap-3"><span className="benefit-icon"><UserRound className="h-5 w-5" /></span><div><h3>For workers</h3><p>Show your strengths and discover opportunities.</p></div></div><ul>{["Build a professional profile", "Showcase skills and work experience", "Set availability and expected terms", "Find work that fits your preferences", "Apply and connect with employers"].map((item) => <li key={item}><Check className="h-4 w-4 text-emerald-600" />{item}</li>)}</ul><Link href="/register?role=worker" className="secondary-button mt-5">Find employment <ArrowRight className="h-4 w-4" /></Link></article></div>
        </div>
      </section>

      <section id="community" className="section-pad bg-slatebg">
        <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-10"><div className="community-panel scroll-reveal-up"><div className="community-art"><div className="community-orbit orbit-one" /><div className="community-orbit orbit-two" /><span className="community-icon"><HeartHandshake className="h-7 w-7" /></span><span className="community-mini mini-one"><House className="h-4 w-4" /></span><span className="community-mini mini-two"><Wrench className="h-4 w-4" /></span><span className="community-mini mini-three"><BriefcaseBusiness className="h-4 w-4" /></span></div><div className="community-copy"><DemoLabel>Community stories coming soon</DemoLabel><h2 className="mt-4 text-2xl font-semibold tracking-tight text-navy sm:text-3xl">Built around real work and real conversations.</h2><p className="mt-3 max-w-xl text-sm leading-6 text-slate-500">We’ll share employer and worker experiences here when the community has real stories to tell. No invented reviews, ratings, or endorsements.</p><div className="mt-5 flex flex-wrap gap-2"><span className="story-tag">Employers</span><span className="story-tag">Skilled professionals</span><span className="story-tag">Domestic workers</span></div></div></div></div>
      </section>

      <section id="faq" className="section-pad bg-white"><div className="mx-auto grid max-w-[1440px] gap-8 px-5 sm:px-8 lg:grid-cols-[.7fr_1.3fr] lg:px-10"><div className="scroll-reveal-left"><p className="section-eyebrow">Helpful answers</p><h2 className="section-title">Questions, made clear.</h2><p className="section-copy">Learn how the marketplace is designed and which parts are currently available.</p><Link href="/register" className="text-link mt-5">Join LabourLens <ArrowRight className="h-4 w-4" /></Link></div><div className="scroll-reveal-right"><LandingFaq /></div></div></section>

      <section className="section-pad-bottom bg-white px-5 sm:px-8 lg:px-10"><div className="final-cta mx-auto max-w-[1440px] scroll-reveal-up"><div className="final-cta-glow" /><span className="final-cta-icon"><Sparkles className="h-5 w-5" /></span><p className="mt-5 text-xs font-semibold uppercase tracking-[.16em] text-blue-100/70">LabourLens · Find work. Hire skills. Connect intelligently.</p><h2 className="mx-auto mt-3 max-w-3xl text-3xl font-semibold leading-tight tracking-[-.04em] text-white sm:text-5xl">Opportunities for workers. Better connections for employers.</h2><p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-blue-100/70">Whether you’re looking for reliable professionals or searching for your next opportunity, LabourLens helps make more informed connections.</p><div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row"><Link href="/register?role=employer" className="final-cta-primary">Start hiring <ArrowUpRight className="h-4 w-4" /></Link><Link href="/register?role=worker" className="final-cta-secondary">Find employment <ArrowUpRight className="h-4 w-4" /></Link></div><p className="mt-5 text-[10px] text-white/45">Registration is available. Public search, offers, and applications are still being integrated.</p></div></section>
    </main>
    <SiteFooter />
  </>;
}

function InfoIcon() { return <CircleHelp aria-hidden="true" className="h-4 w-4 shrink-0" />; }

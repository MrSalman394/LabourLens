import Link from "next/link";
import { BrandMark } from "@/components/brand-mark";
import { BackToTop } from "@/components/landing-interactions";

const groups: Array<{ title: string; links: [string, string][]; upcoming?: string[] }> = [
  { title: "Platform", links: [["Home", "#home"], ["Find workers", "#discovery"], ["Find jobs", "#jobs"], ["Categories", "#categories"], ["How it works", "#how-it-works"]] },
  { title: "For employers", links: [["Start hiring", "/register?role=employer"], ["Explore workers", "#workers"], ["Employer dashboard", "/employer/dashboard"]] },
  { title: "For workers", links: [["Create a profile", "/register?role=worker"], ["Explore opportunities", "#jobs"], ["Worker dashboard", "/worker/dashboard"]] },
  { title: "Company", links: [["About LabourLens", "#about"], ["Frequently asked questions", "#faq"], ["Sign in", "/login"]], upcoming: ["Contact", "Privacy policy", "Terms & conditions", "Help & support"] },
];

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="mx-auto max-w-[1440px] px-5 pb-6 pt-14 sm:px-8 lg:px-10 lg:pt-16">
        <div className="grid gap-10 border-b border-white/10 pb-12 md:grid-cols-[1.4fr_2fr] lg:gap-20">
          <div className="max-w-sm">
            <Link href="#home" aria-label="LabourLens home"><BrandMark light variant="premium" /></Link>
            <p className="mt-5 text-sm leading-7 text-slate-300/75">A clearer way to connect employers with domestic workers and skilled professionals through transparent, explainable matching.</p>
            <span className="mt-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[11px] text-slate-300"><span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> Designed in Pakistan, ready to grow</span>
            <p className="mt-4 text-[11px] text-slate-400">Social channels coming soon</p>
          </div>
          <div className="grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-4">
            {groups.map((group) => <div key={group.title}><h2 className="text-xs font-semibold uppercase tracking-[.14em] text-white">{group.title}</h2><ul className="mt-4 space-y-3">{group.links.map(([label, href]) => <li key={label}><Link href={href} className="text-sm text-slate-300/70 transition hover:text-white">{label}</Link></li>)}{group.upcoming?.map((label) => <li key={label} className="text-sm text-slate-500">{label} <span className="text-[9px]">· soon</span></li>)}</ul></div>)}
          </div>
        </div>
        <div className="flex flex-col gap-4 pt-5 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 LabourLens. Built for better work.</p>
          <p className="max-w-xl leading-5 sm:text-center">Recommendations support informed decisions. They do not guarantee identity, safety, or employment outcomes.</p>
          <BackToTop />
        </div>
      </div>
    </footer>
  );
}

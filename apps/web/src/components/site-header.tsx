"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { BrandMark } from "@/components/brand-mark";

const navigation = [
  { label: "Home", href: "#home", id: "home" },
  { label: "Find Workers", href: "#discovery", id: "discovery" },
  { label: "Find Jobs", href: "#jobs", id: "jobs" },
  { label: "Categories", href: "#categories", id: "categories" },
  { label: "How it works", href: "#how-it-works", id: "how-it-works" },
  { label: "About", href: "#about", id: "about" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeId, setActiveId] = useState("home");
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let ticking = false;
    const updateScroll = () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(() => {
        const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
        setProgress(maxScroll > 0 ? window.scrollY / maxScroll : 0);
        setScrolled(window.scrollY > 12);
        ticking = false;
      });
    };
    updateScroll();
    window.addEventListener("scroll", updateScroll, { passive: true });

    const sections = navigation.map(({ id }) => document.getElementById(id)).filter((section): section is HTMLElement => Boolean(section));
    const observer = new IntersectionObserver((entries) => {
      const current = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (current) setActiveId(current.target.id);
    }, { rootMargin: "-20% 0px -65% 0px", threshold: [0, 0.15, 0.4] });
    sections.forEach((section) => observer.observe(section));

    return () => {
      window.removeEventListener("scroll", updateScroll);
      observer.disconnect();
    };
  }, []);

  useEffect(() => setMenuOpen(false), [pathname]);

  const closeMenu = () => setMenuOpen(false);
  const navLinkClass = (id: string) => `nav-link ${activeId === id ? "nav-link-active" : ""}`;

  return (
    <header className={`site-header sticky top-0 z-50 ${scrolled ? "site-header-scrolled" : ""}`}>
      <div className="scroll-progress" aria-hidden="true" style={{ transform: `scaleX(${progress})` }} />
      <div className="mx-auto flex h-[76px] max-w-[1440px] items-center justify-between gap-5 px-4 sm:px-7 lg:px-10">
        <Link href="#home" aria-label="LabourLens home" onClick={closeMenu} className="shrink-0"><BrandMark variant="premium" /></Link>

        <nav aria-label="Main navigation" className="hidden items-center gap-1 xl:flex">
          {navigation.map((item) => <a key={item.id} href={item.href} className={navLinkClass(item.id)}>{item.label}</a>)}
        </nav>

        <div className="hidden shrink-0 items-center gap-2 md:flex">
          <Link href="/login" className="header-login">Login</Link>
          <Link href="/register" className="header-create">Create account</Link>
          <Link href="/register?role=employer" className="header-start">Get started <ArrowUpRight aria-hidden="true" className="h-4 w-4" /></Link>
        </div>

        <button type="button" className="mobile-menu-button xl:hidden" aria-label={menuOpen ? "Close navigation" : "Open navigation"} aria-expanded={menuOpen} onClick={() => setMenuOpen((open) => !open)}>
          {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {menuOpen && <div className="mobile-menu xl:hidden">
        <nav aria-label="Mobile navigation" className="mx-auto max-w-[1440px] px-4 pb-5 pt-2 sm:px-7">
          {navigation.map((item) => <a key={item.id} href={item.href} onClick={closeMenu} className={navLinkClass(item.id)}>{item.label}</a>)}
          <div className="mt-3 grid grid-cols-2 gap-2 border-t border-slate-100 pt-4">
            <Link href="/login" className="header-mobile-secondary">Login</Link>
            <Link href="/register" className="header-mobile-secondary">Create account</Link>
            <Link href="/register?role=employer" className="header-start col-span-2 justify-center">Get started <ArrowUpRight aria-hidden="true" className="h-4 w-4" /></Link>
          </div>
        </nav>
      </div>}
    </header>
  );
}

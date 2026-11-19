import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LabourLens | Find Work. Hire Skills. Connect Intelligently.",
  description: "Discover skilled professionals, find meaningful employment, and connect through explainable AI-powered matching in Pakistan.",
  icons: {
    icon: "/labourlens-icon.svg",
    shortcut: "/labourlens-icon.svg",
  },
};

const themeBootstrap = `(() => { try { const saved = localStorage.getItem("labourlens-theme"); const preferred = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"; document.documentElement.dataset.theme = saved === "dark" || saved === "light" ? saved : preferred; } catch { document.documentElement.dataset.theme = "light"; } })();`;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBootstrap }} />
      </head>
      <body>{children}</body>
    </html>
  );
}

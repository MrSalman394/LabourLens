import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LabourLens | Find Work. Hire Skills. Connect Intelligently.",
  description: "Discover skilled professionals, find meaningful employment, and connect through explainable AI-powered matching in Pakistan.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}

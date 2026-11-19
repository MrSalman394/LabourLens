import { useId } from "react";

type BrandMarkProps = {
  light?: boolean;
  variant?: "default" | "premium";
};

export function BrandMark({ light = false }: BrandMarkProps) {
  const gradientId = useId().replace(/:/g, "");
  return (
    <span className="inline-flex items-center gap-2.5" aria-label="LabourLens">
      <svg
        aria-hidden="true"
        className="h-10 w-10 shrink-0 drop-shadow-sm"
        viewBox="0 0 40 40"
        fill="none"
      >
        <defs>
          <linearGradient id={`${gradientId}-mark`} x1="4" y1="3" x2="36" y2="37" gradientUnits="userSpaceOnUse">
            <stop stopColor="#101C35" />
            <stop offset="1" stopColor="#2563EB" />
          </linearGradient>
          <linearGradient id={`${gradientId}-lens`} x1="10" y1="9" x2="27" y2="27" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FFFFFF" />
            <stop offset="1" stopColor="#BFDBFE" />
          </linearGradient>
        </defs>
        <rect x="1" y="1" width="38" height="38" rx="13" fill={`url(#${gradientId}-mark)`} />
        <circle cx="17.25" cy="17.25" r="9.15" stroke={`url(#${gradientId}-lens)`} strokeWidth="2.2" />
        <circle cx="17.25" cy="14.65" r="2.25" fill="#34D399" />
        <path d="M12.65 22.2c.72-2.4 2.25-3.65 4.6-3.65 2.35 0 3.9 1.25 4.62 3.65" stroke="white" strokeWidth="1.9" strokeLinecap="round" />
        <path d="m23.9 23.9 6.45 6.45" stroke="white" strokeWidth="3.1" strokeLinecap="round" />
        <circle cx="29.9" cy="10.5" r="1.3" fill="#6EE7B7" />
      </svg>
      <span className={`text-[19px] font-bold leading-none tracking-[-0.045em] ${light ? "text-white" : "text-[#101C35]"}`}>
        Labour<span className={light ? "text-blue-300" : "text-[#2563EB]"}>Lens</span>
      </span>
    </span>
  );
}

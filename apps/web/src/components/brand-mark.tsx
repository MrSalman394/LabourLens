export function BrandMark({ light = false, variant = "default" }: { light?: boolean; variant?: "default" | "premium" }) {
  const markClass = variant === "premium" ? "bg-primary text-white shadow-sm" : "bg-leaf text-forest";
  const wordClass = light ? "text-white" : variant === "premium" ? "text-navy" : "text-ink";
  return (
    <span className={`inline-flex items-center gap-2.5 font-semibold tracking-[-0.04em] ${wordClass}`}>
      <span aria-hidden="true" className={`flex h-9 w-9 items-center justify-center rounded-xl ${markClass}`}>
        <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 18V6l8 8 8-8v12" /><path d="M8 18v-4" /><circle cx="19" cy="5" r="1.5" fill="currentColor" stroke="none" />
        </svg>
      </span>
      <span className="text-[19px]">Labour<span className={variant === "premium" ? "text-primary" : ""}>Lens</span></span>
    </span>
  );
}

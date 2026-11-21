import React from "react";
import { Check } from "lucide-react";

interface VerifiedStampProps {
  label?: string;
  className?: string;
}

export function VerifiedStamp({
  label = "Verified",
  className = "",
}: VerifiedStampProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-[4px] border border-forest text-forest bg-forest/5 text-[11px] font-bold tracking-wider uppercase ${className}`}
    >
      <Check className="w-3 h-3 stroke-[2.5]" aria-hidden="true" />
      <span>{label}</span>
    </span>
  );
}


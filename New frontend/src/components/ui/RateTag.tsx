import React from "react";

interface RateTagProps {
  ratePerMin: string; // e.g. "₦5/min" or "$0.05/min"
  unlockPrice?: string; // e.g. "₦200 unlock"
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function RateTag({
  ratePerMin,
  unlockPrice,
  size = "md",
  className = "",
}: RateTagProps) {
  const isLarge = size === "lg";
  const isSmall = size === "sm";

  return (
    <div className={`inline-flex flex-col ${className}`}>
      <div className="flex items-baseline gap-1.5">
        <span
          className={`font-mono font-bold tabular-nums text-ink ${
            isLarge ? "text-2xl" : isSmall ? "text-xs" : "text-base"
          }`}
        >
          {ratePerMin}
        </span>
        {unlockPrice && (
          <span className="text-[11px] text-muted font-medium tabular-nums">
            • {unlockPrice}
          </span>
        )}
      </div>
    </div>
  );
}


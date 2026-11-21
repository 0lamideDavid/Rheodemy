"use client";

import { useEffect, useState } from "react";
import { motion, useSpring, useTransform } from "framer-motion";

interface AnimatedCounterProps {
  value: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}

export function AnimatedCounter({
  value,
  decimals = 4,
  prefix = "",
  suffix = "",
  className = "",
}: AnimatedCounterProps) {
  const spring = useSpring(value, {
    mass: 0.8,
    stiffness: 75,
    damping: 15,
  });

  const display = useTransform(spring, (current) => {
    return `${prefix}${current.toFixed(decimals)}${suffix}`;
  });

  const [renderedText, setRenderedText] = useState(
    `${prefix}${value.toFixed(decimals)}${suffix}`
  );

  useEffect(() => {
    spring.set(value);
  }, [value, spring]);

  useEffect(() => {
    const unsubscribe = display.on("change", (latest) => {
      setRenderedText(latest);
    });
    return () => unsubscribe();
  }, [display]);

  return <span className={className}>{renderedText}</span>;
}


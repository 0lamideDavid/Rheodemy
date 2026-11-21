"use client";

import { motion } from "framer-motion";
import React from "react";

interface BlurTextProps {
  text: string;
  delay?: number;
  className?: string;
  animateBy?: "words" | "letters";
  direction?: "top" | "bottom";
}

export function BlurText({
  text,
  delay = 50,
  className = "",
  animateBy = "words",
  direction = "top",
}: BlurTextProps) {
  const elements = animateBy === "words" ? text.split(" ") : text.split("");

  return (
    <span className={`inline-flex flex-wrap ${className}`}>
      {elements.map((element, i) => (
        <motion.span
          key={i}
          initial={{
            filter: "blur(12px)",
            opacity: 0,
            y: direction === "top" ? -18 : 18,
          }}
          animate={{
            filter: "blur(0px)",
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.55,
            delay: (i * delay) / 1000,
            ease: [0.25, 0.4, 0.25, 1],
          }}
          className="inline-block mr-[0.25em] last:mr-0 will-change-[filter,transform,opacity]"
        >
          {element === " " ? "\u00A0" : element}
        </motion.span>
      ))}
    </span>
  );
}


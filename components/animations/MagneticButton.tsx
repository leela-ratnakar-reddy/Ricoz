"use client";

import React, { useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

interface MagneticButtonProps {
  children: React.ReactNode;
  className?: string;
  pullFactor?: number;
}

export const MagneticButton: React.FC<MagneticButtonProps> = ({
  children,
  className = "",
  pullFactor = 0.25,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const shouldReduceMotion = useReducedMotion();

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current || shouldReduceMotion) return;
    const { clientX, clientY } = e;
    const { left, top, width, height } = ref.current.getBoundingClientRect();
    const middleX = clientX - (left + width / 2);
    const middleY = clientY - (top + height / 2);
    setPosition({ x: middleX * pullFactor, y: middleY * pullFactor });
  };

  const handleMouseLeave = () => {
    setPosition({ x: 0, y: 0 });
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      animate={{ x: position.x, y: position.y }}
      transition={{ type: "spring", stiffness: 220, damping: 18, mass: 0.1 }}
      className={`inline-block ${className}`}
    >
      {children}
    </motion.div>
  );
};

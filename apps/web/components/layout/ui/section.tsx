"use client";

import { ReactNode } from "react";
import { motion } from "framer-motion";

export default function Section({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 8,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        duration: 0.2,
      }}
    >
      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-muted">{title}</h2>
        {children}
      </div>
    </motion.div>
  );
}


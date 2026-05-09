"use client";
import { ReactNode } from "react";
import clsx from "clsx";
import { motion } from "framer-motion";

export default function Card({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
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
      <div
        className={clsx(
          "bg-card border border-border backdrop-blur-md rounded-xl p-5 transition-all hover:scale-[1.01] hover:border-border",
          className
        )}
      >
        {children}
      </div>
    </motion.div>
  );
}


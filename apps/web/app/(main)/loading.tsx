"use client";

import { motion } from "framer-motion";

export default function Loading() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.15 }}
      className="space-y-6"
    >
      <div className="h-8 w-44 bg-border rounded" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="h-24 bg-surface border border-border rounded-xl" />
        <div className="h-24 bg-surface border border-border rounded-xl" />
        <div className="h-24 bg-surface border border-border rounded-xl" />
      </div>
      <div className="h-64 bg-surface border border-border rounded-xl" />
    </motion.div>
  );
}


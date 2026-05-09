"use client";

import { motion } from "framer-motion";

export default function Loading() {
  return (
    <div className="min-h-screen bg-card text-text-main flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="w-full max-w-md bg-surface border border-border rounded-xl p-6 space-y-3"
      >
        <div className="h-5 w-40 bg-border rounded" />
        <div className="h-4 w-full bg-border rounded" />
        <div className="h-4 w-5/6 bg-border rounded" />
      </motion.div>
    </div>
  );
}


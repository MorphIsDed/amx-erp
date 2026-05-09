"use client";
import { StatCard as Card } from "@/components/ui/stat-card";
import { motion } from "framer-motion";

export default function AnalyticsPage() {
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
      <div className="space-y-6 w-full max-w-6xl mx-auto">
        <h1 className="text-2xl font-semibold">Analytics</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card title="Revenue" value="₹120K" />
          <Card title="Users" value="3200" />
          <Card title="Growth" value="+12%" />
        </div>
        <div className="bg-card border border-border p-6 rounded-xl">
          Charts will appear here
        </div>
      </div>
    </motion.div>
  );
}


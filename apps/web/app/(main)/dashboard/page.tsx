"use client";

import Card from "@/components/ui/stat-card";
import { motion } from "framer-motion";

export default function DashboardPage() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <div>
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="text-sm text-gray-400">
          Overview of system metrics
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card label="Revenue" value="₹2.4M" />
        <Card label="Employees" value="1,240" />
        <Card label="Orders" value="320" />
      </div>

      <div className="bg-[#111827] border border-gray-800 p-6 rounded-xl">
        <h2 className="mb-3 font-semibold">Overview</h2>
        <p className="text-gray-400">
          Your ERP dashboard is now fully operational.
        </p>
      </div>
    </motion.div>
  );
}
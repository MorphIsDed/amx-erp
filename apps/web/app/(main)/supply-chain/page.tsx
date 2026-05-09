"use client";
import { StatCard as Card } from "@/components/ui/stat-card";
import { motion } from "framer-motion";

export default function SupplyChainPage() {
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
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold">Supply Chain</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card title="Total Items" value="320" />
          <Card title="Low Stock" value="12" />
          <Card title="Out of Stock" value="4" />
        </div>
        <div className="bg-card border border-border p-4 rounded-xl">
          Inventory dashboard ready
        </div>
      </div>
    </motion.div>
  );
}


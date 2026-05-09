"use client";

import { StatCard } from "@/components/ui/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";

export default function DashboardPage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-8 w-full max-w-5xl mx-auto"
    >
      {/* PAGE HEADER */}
      <div>
        <h1 className="text-2xl font-semibold text-text-main tracking-tight">Dashboard</h1>
        <p className="text-sm text-text-muted mt-1">
          Overview of system metrics and performance.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Revenue" value="₹2.4M" />
        <StatCard title="Employees" value="1,240" />
        <StatCard title="Orders" value="320" />
      </div>

      <Card>
        <CardHeader className="border-b border-border pb-4">
          <CardTitle className="text-base">Overview</CardTitle>
          <p className="text-sm text-text-muted mt-1">
            System status and recent activity.
          </p>
        </CardHeader>
        <CardContent className="pt-6">
          <p className="text-sm text-text-muted">
            Your ERP dashboard is now fully operational.
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
}



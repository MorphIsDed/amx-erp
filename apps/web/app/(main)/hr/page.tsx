"use client";
import { useState } from "react";
import { StatCard as Card } from "@/components/ui/stat-card";
import Button from "@/components/ui/button";
import { motion } from "framer-motion";

export default function HRPage() {
  const [tab, setTab] = useState("employees");

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
          <div>
            <h1 className="text-2xl font-semibold">HR</h1>
            <p className="text-muted text-sm">
              Manage employees and attendance
            </p>
          </div>
          <div className="flex gap-4 border-b border-border pb-2">
            {["employees", "attendance", "leaves"].map((t) => (
              <Button
                key={t}
                onClick={() => setTab(t)}
                className={`pb-1 ${
                  tab === t
                    ? "border-b-2 border-border text-muted"
                    : "text-muted"
                }`}
              >
                {t}
              </Button>
            ))}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card title="Employees" value="1200" />
            <Card title="Present" value="1100" />
            <Card title="On Leave" value="100" />
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            HR content UI ready
          </div>
        </div>
    </motion.div>
  );
}


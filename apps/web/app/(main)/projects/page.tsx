"use client";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Inbox } from "lucide-react";

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } };
const item = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const } } };

const columns = [
  { name: "Todo", color: "from-info/40 to-info/10", count: 0 },
  { name: "In Progress", color: "from-warning/40 to-warning/10", count: 0 },
  { name: "Done", color: "from-success/40 to-success/10", count: 0 },
];

export default function ProjectsPage() {
  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-8 max-w-7xl mx-auto">
      <motion.div variants={item}>
        <h1 className="text-3xl font-bold tracking-tight">
          <span className="text-gradient-primary">Projects</span>
        </h1>
        <p className="text-text-muted mt-2 text-sm">Track tasks and deliverables across your teams.</p>
      </motion.div>

      <motion.div variants={container} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {columns.map((col) => (
          <motion.div key={col.name} variants={item}>
            <Card variant="default" className="overflow-hidden">
              {/* Top gradient accent */}
              <div className={cn("h-[3px] bg-gradient-to-r", col.color)} />
              <div className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-semibold text-text-main text-sm">{col.name}</h2>
                  <span className="text-[10px] font-bold text-text-faint bg-surface px-2 py-0.5 rounded-full">{col.count}</span>
                </div>
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <div className="animate-float">
                    <Inbox className="w-10 h-10 text-text-faint opacity-20 mb-3" />
                  </div>
                  <p className="text-xs text-text-faint">No tasks yet</p>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
}

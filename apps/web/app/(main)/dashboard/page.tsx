"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import {
  TrendingUp,
  Users,
  ShoppingBag,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ActivityTimeline } from "@/components/dashboard/activity-timeline";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const },
  },
};

export default function DashboardPage() {
  const hours = new Date().getHours();
  const greeting =
    hours < 12 ? "Good morning" : hours < 18 ? "Good afternoon" : "Good evening";

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-8 max-w-7xl mx-auto"
    >
      {/* HEADER */}
      <motion.div
        variants={item}
        className="flex flex-col md:flex-row md:items-end justify-between gap-4"
      >
        <div>
          <p className="text-sm text-text-faint mb-1">{greeting}</p>
          <h1 className="text-3xl font-bold tracking-tight">
            <span className="text-gradient-primary">Executive</span>{" "}
            <span className="text-text-main">Overview</span>
          </h1>
          <p className="text-text-muted mt-2 text-sm">
            Here is what is happening with your enterprise today.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-xl bg-card/60 border border-border/30 text-sm font-medium text-text-muted backdrop-blur-sm">
            {new Date().toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </div>
        </div>
      </motion.div>

      {/* STATS GRID */}
      <motion.div
        variants={container}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5"
      >
        <StatWidget
          title="Total Revenue"
          value="₹24.8M"
          change="+12.5%"
          trend="up"
          icon={TrendingUp}
          accentFrom="from-primary"
          accentTo="to-cyan"
        />
        <StatWidget
          title="Active Employees"
          value="1,240"
          change="+4"
          trend="up"
          icon={Users}
          accentFrom="from-info"
          accentTo="to-accent"
        />
        <StatWidget
          title="Open Orders"
          value="312"
          change="-8.2%"
          trend="down"
          icon={ShoppingBag}
          accentFrom="from-warning"
          accentTo="to-rose"
        />
        <StatWidget
          title="System Health"
          value="99.9%"
          change="Optimal"
          trend="neutral"
          icon={Activity}
          accentFrom="from-primary"
          accentTo="to-success"
        />
      </motion.div>

      {/* CHARTS / MAIN CONTENT */}
      <motion.div
        variants={item}
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
      >
        <Card variant="glass" className="lg:col-span-2 overflow-hidden">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              <CardTitle>Performance Insights</CardTitle>
            </div>
            <p className="text-xs text-text-faint mt-1">
              Real-time enterprise metrics
            </p>
          </CardHeader>
          <CardContent className="h-[400px] flex items-end justify-between px-6 pb-8 border-t border-border/20">
            {/* Mini bar chart visualization */}
            {[35, 55, 42, 70, 58, 85, 65, 78, 50, 90, 72, 95].map(
              (h, i) => (
                <div
                  key={i}
                  className="flex flex-col items-center gap-2 group w-full max-w-[28px]"
                >
                  <div className="w-full h-[300px] flex items-end">
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${h}%` }}
                      transition={{
                        duration: 0.8,
                        delay: i * 0.06,
                        ease: [0.16, 1, 0.3, 1],
                      }}
                      className="w-full rounded-t-md bg-gradient-to-t from-primary/60 to-primary/20 group-hover:from-primary group-hover:to-primary/40 transition-all duration-300 relative"
                    >
                      <div className="absolute top-0 left-0 right-0 h-px bg-primary shadow-[0_0_8px_rgba(52,211,153,0.5)] opacity-0 group-hover:opacity-100 transition-opacity" />
                    </motion.div>
                  </div>
                  <span className="text-[10px] text-text-faint font-mono">
                    M{i + 1}
                  </span>
                </div>
              )
            )}
          </CardContent>
        </Card>

        <Card variant="default" className="overflow-hidden">
          <CardHeader className="border-b border-border/20">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-primary" />
              <CardTitle>Enterprise Pulse</CardTitle>
            </div>
            <p className="text-xs text-text-faint mt-1">
              Real-time audit and activity feed
            </p>
          </CardHeader>
          <CardContent className="px-5 py-4">
            <ActivityTimeline />
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}

function StatWidget({
  title,
  value,
  change,
  trend,
  icon: Icon,
  accentFrom,
  accentTo,
}: any) {
  return (
    <motion.div variants={item}>
      <Card
        variant="default"
        className="group hover:-translate-y-0.5 transition-all duration-300 overflow-hidden relative"
      >
        {/* Bottom gradient accent */}
        <div
          className={cn(
            "absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r opacity-30 group-hover:opacity-70 transition-opacity",
            accentFrom,
            accentTo
          )}
        />

        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="p-2.5 rounded-xl bg-surface/80 border border-border/30 group-hover:border-primary/20 transition-all duration-300 group-hover:shadow-[0_0_20px_-5px_rgba(52,211,153,0.15)]">
              <Icon className="w-5 h-5 text-text-muted group-hover:text-primary transition-colors duration-300" />
            </div>
            <div
              className={cn(
                "flex items-center text-xs font-semibold px-2.5 py-1 rounded-full",
                trend === "up"
                  ? "text-success bg-success/10"
                  : trend === "down"
                    ? "text-danger bg-danger/10"
                    : "text-text-muted bg-surface"
              )}
            >
              {trend === "up" && (
                <ArrowUpRight className="w-3 h-3 mr-0.5" />
              )}
              {trend === "down" && (
                <ArrowDownRight className="w-3 h-3 mr-0.5" />
              )}
              {change}
            </div>
          </div>
          <div className="mt-4">
            <p className="text-xs font-semibold text-text-muted uppercase tracking-wider">
              {title}
            </p>
            <h2 className="text-2xl font-bold text-text-main mt-1 tracking-tight">
              {value}
            </h2>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

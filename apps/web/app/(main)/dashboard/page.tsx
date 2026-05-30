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
  Briefcase,
  Layers,
  Clock,
  ListTodo,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ActivityTimeline } from "@/components/dashboard/activity-timeline";
import { useEffect, useState } from "react";
import { API_ENDPOINTS } from "@/lib/api-config";
import Link from "next/link";

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
  const [data, setData] = useState<any>(null);
  const [projectsData, setProjectsData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOverview = async () => {
      try {
        const [overviewRes, projectsRes] = await Promise.all([
          fetch(API_ENDPOINTS.DASHBOARD_OVERVIEW, {
            headers: { Authorization: `Bearer ${localStorage.getItem("token") || ""}` },
          }),
          fetch("http://localhost:3001/api/analytics/projects", {
            headers: { Authorization: `Bearer ${localStorage.getItem("token") || ""}` },
          }),
        ]);

        if (overviewRes.ok) {
          const overviewJson = await overviewRes.json();
          setData(overviewJson);
        }

        if (projectsRes.ok) {
          const projectsJson = await projectsRes.json();
          setProjectsData(projectsJson.data);
        }
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchOverview();
  }, []);

  const hours = new Date().getHours();
  const greeting =
    hours < 12 ? "Good morning" : hours < 18 ? "Good afternoon" : "Good evening";

  if (loading) return <div className="p-12 text-center text-text-faint font-medium">Synchronizing Enterprise Data...</div>;

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-8 max-w-7xl mx-auto pb-12"
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
          value={`₹${(data?.stats?.totalRevenue / 1000000).toFixed(1)}M`}
          change={`+${data?.stats?.growth}%`}
          trend="up"
          icon={TrendingUp}
          accentFrom="from-primary"
          accentTo="to-cyan"
        />
        <StatWidget
          title="Active Employees"
          value={data?.stats?.headcount?.toLocaleString()}
          change="+0"
          trend="neutral"
          icon={Users}
          accentFrom="from-info"
          accentTo="to-accent"
        />
        <StatWidget
          title="Active Projects"
          value={data?.stats?.activeProjects?.toLocaleString() || "0"}
          change="Operational"
          trend="neutral"
          icon={Briefcase}
          accentFrom="from-primary"
          accentTo="to-success"
        />
        <StatWidget
          title="Inventory Items"
          value={data?.stats?.activeSourcing?.toLocaleString()}
          change="+0"
          trend="neutral"
          icon={ShoppingBag}
          accentFrom="from-warning"
          accentTo="to-rose"
        />
      </motion.div>

      {/* CHARTS / MAIN CONTENT */}
      <motion.div
        variants={item}
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
      >
        <Card variant="glass" className="lg:col-span-2 overflow-hidden border-border/20 shadow-md">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              <CardTitle>Performance Insights</CardTitle>
            </div>
            <p className="text-xs text-text-faint mt-1">
              Monthly revenue distribution
            </p>
          </CardHeader>
          <CardContent className="h-[400px] flex items-end justify-between px-6 pb-8 border-t border-border/20 bg-card/5">
            {/* Real monthly revenue trend */}
            {data?.revenueTrend?.map(
              (item: any, i: number) => {
                const maxVal = Math.max(...data.revenueTrend.map((t: any) => t.amount), 1);
                const height = (item.amount / maxVal) * 100;
                return (
                  <div
                    key={i}
                    className="flex flex-col items-center gap-2 group w-full max-w-[28px]"
                  >
                    <div className="w-full h-[300px] flex items-end">
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${Math.max(5, height)}%` }}
                        transition={{
                          duration: 0.8,
                          delay: i * 0.06,
                          ease: [0.16, 1, 0.3, 1],
                        }}
                        className="w-full rounded-t-md bg-gradient-to-t from-primary/60 to-primary/20 group-hover:from-primary group-hover:to-primary/40 transition-all duration-300 relative"
                      >
                        <div className="absolute top-0 left-0 right-0 h-px bg-primary shadow-[0_0_8px_rgba(52,211,153,0.5)] opacity-0 group-hover:opacity-100 transition-opacity" />
                        {item.amount > 0 && (
                          <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-card border border-border p-1 rounded text-[8px] opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
                            ₹{(item.amount / 1000).toFixed(1)}k
                          </div>
                        )}
                      </motion.div>
                    </div>
                    <span className="text-[10px] text-text-faint font-mono">
                      {item.month}
                    </span>
                  </div>
                );
              }
            )}
          </CardContent>
        </Card>

        <Card variant="default" className="overflow-hidden border border-border/20 shadow-md">
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

      {/* PROJECTS LIVE INSIGHTS SECTION */}
      {projectsData && (
        <motion.div
          variants={item}
          className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8"
        >
          {/* Projects Roadmap Health Card */}
          <Card variant="glass" className="lg:col-span-2 border border-border/20 shadow-md p-6 space-y-6">
            <div className="flex justify-between items-center border-b border-border/10 pb-3">
              <div className="flex items-center gap-2">
                <Layers className="w-4.5 h-4.5 text-primary" />
                <h3 className="text-sm font-bold text-text-main uppercase tracking-wider">Project Portfolio Metrics</h3>
              </div>
              <span className="text-[10px] font-bold text-text-faint font-mono bg-surface border border-border/20 px-2.5 py-0.5 rounded-full">
                Live Roadmap
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-surface/30 p-4 border border-border/15 rounded-xl text-center space-y-1">
                <p className="text-[10px] font-bold text-text-faint uppercase tracking-wider">Overdue Tasks</p>
                <div className="flex justify-center items-center gap-1.5 text-danger font-mono font-bold text-lg">
                  <Clock className="w-4 h-4 text-danger animate-pulse" />
                  {projectsData.overdueTasks || "0"}
                </div>
              </div>

              <div className="bg-surface/30 p-4 border border-border/15 rounded-xl text-center space-y-1">
                <p className="text-[10px] font-bold text-text-faint uppercase tracking-wider">Upcoming Milestones</p>
                <div className="flex justify-center items-center gap-1.5 text-info font-mono font-bold text-lg">
                  <ListTodo className="w-4 h-4 text-info" />
                  {projectsData.upcomingMilestones || "0"}
                </div>
              </div>

              <div className="bg-surface/30 p-4 border border-border/15 rounded-xl text-center space-y-1">
                <p className="text-[10px] font-bold text-text-faint uppercase tracking-wider">Completed Projects</p>
                <div className="flex justify-center items-center gap-1.5 text-success font-mono font-bold text-lg">
                  <CheckCircle2 className="w-4 h-4 text-success" />
                  {projectsData.completedProjects || "0"}
                </div>
              </div>
            </div>

            {/* Distribution metrics */}
            <div className="pt-2">
              <h4 className="text-[11px] font-bold text-text-muted uppercase tracking-wider mb-3">Portfolio Status Distribution</h4>
              <div className="grid grid-cols-5 gap-3 font-mono text-[10px] text-center font-bold">
                <div className="p-2 border border-border/10 rounded-lg bg-surface/20">
                  <span className="text-primary block text-xs">{projectsData.distribution?.active || 0}</span>
                  <span className="text-text-faint font-sans font-semibold">Active</span>
                </div>
                <div className="p-2 border border-border/10 rounded-lg bg-surface/20">
                  <span className="text-success block text-xs">{projectsData.distribution?.completed || 0}</span>
                  <span className="text-text-faint font-sans font-semibold">Completed</span>
                </div>
                <div className="p-2 border border-border/10 rounded-lg bg-surface/20">
                  <span className="text-warning block text-xs">{projectsData.distribution?.onHold || 0}</span>
                  <span className="text-text-faint font-sans font-semibold">On Hold</span>
                </div>
                <div className="p-2 border border-border/10 rounded-lg bg-surface/20">
                  <span className="text-text-muted block text-xs">{projectsData.distribution?.draft || 0}</span>
                  <span className="text-text-faint font-sans font-semibold">Draft</span>
                </div>
                <div className="p-2 border border-border/10 rounded-lg bg-surface/20">
                  <span className="text-danger block text-xs">{projectsData.distribution?.cancelled || 0}</span>
                  <span className="text-text-faint font-sans font-semibold">Cancelled</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Mini Portfolio summary */}
          <Card variant="default" className="border border-border/20 shadow-md p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 border-b border-border/10 pb-3 mb-4">
                <Sparkles className="w-4.5 h-4.5 text-primary" />
                <h3 className="text-sm font-bold text-text-main uppercase tracking-wider">Workspace Summary</h3>
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-text-muted">Active Sprints</span>
                  <span className="font-bold text-text-main font-mono">{projectsData.activeProjects || "0"} Active</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-text-muted">Total Accounts</span>
                  <span className="font-bold text-text-main font-mono">{projectsData.totalProjects || "0"} Projects</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-text-muted">Task Slippage</span>
                  <span className={cn(
                    "font-bold font-mono",
                    projectsData.overdueTasks > 0 ? "text-danger" : "text-success"
                  )}>
                    {projectsData.overdueTasks > 0 ? "Critical" : "Optimal"}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-8 bg-surface/30 p-4 border border-border/15 rounded-2xl">
              <p className="text-[10px] text-text-faint leading-relaxed font-sans">
                Review effort allocation and budget variances by drilling down into individual projects from the operational <Link href="/projects" className="text-primary hover:underline font-bold">Projects tab</Link>.
              </p>
            </div>
          </Card>
        </motion.div>
      )}
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

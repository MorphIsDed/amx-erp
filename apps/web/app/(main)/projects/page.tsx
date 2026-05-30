"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ApiClient } from "@/services/api-client";
import { Card, CardContent } from "@/components/ui/card";
import Button from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { 
  Briefcase, 
  Plus, 
  Search, 
  Trash2, 
  CalendarDays, 
  DollarSign, 
  TrendingUp, 
  PieChart,
  Layers,
  ChevronRight,
  Clock
} from "lucide-react";
import { cn } from "@/lib/utils";

// Framer Motion presets
const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } };
const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] as const } } };

interface Project {
  id: string;
  projectCode: string;
  name: string;
  description?: string;
  status: "DRAFT" | "ACTIVE" | "ON_HOLD" | "COMPLETED" | "CANCELLED";
  startDate: string;
  endDate: string;
  plannedBudget: number;
  actualBudget: number;
  createdAt: string;
  _count?: {
    tasks: number;
    milestones: number;
    members: number;
  };
}

export default function ProjectsPage() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [successToast, setSuccessToast] = useState("");
  const [isPending, startTransition] = useTransition();

  const [form, setForm] = useState({
    projectCode: "",
    name: "",
    description: "",
    plannedBudget: 0,
    startDate: "",
    endDate: "",
    status: "DRAFT" as const,
  });

  // Queries
  const { data: projectsRes, isLoading } = useQuery({
    queryKey: ["projects", statusFilter, searchTerm, sortBy, sortOrder],
    queryFn: async () => {
      let queryStr = `sortBy=${sortBy}&sortOrder=${sortOrder}`;
      if (statusFilter !== "all") queryStr += `&status=${statusFilter}`;
      if (searchTerm) queryStr += `&search=${encodeURIComponent(searchTerm)}`;
      return ApiClient.get<{ data: Project[] }>(`/projects?${queryStr}`);
    }
  });

  const projects = projectsRes?.data || [];

  // Mutations
  const createMutation = useMutation({
    mutationFn: (newProj: typeof form) => ApiClient.post<Project>("/projects", newProj),
    onSuccess: (res: any) => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      setSuccessToast(`Project "${res.data.name}" successfully created!`);
      setTimeout(() => setSuccessToast(""), 4000);
      setIsModalOpen(false);
      setForm({
        projectCode: "",
        name: "",
        description: "",
        plannedBudget: 0,
        startDate: "",
        endDate: "",
        status: "DRAFT",
      });
    },
    onError: (err: any) => {
      alert(err.message || "Failed to create project");
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => ApiClient.delete(`/projects/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      setSuccessToast("Project successfully archived.");
      setTimeout(() => setSuccessToast(""), 4000);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.projectCode || !form.name || !form.startDate || !form.endDate || form.plannedBudget <= 0) {
      alert("Please fill all required fields");
      return;
    }
    createMutation.mutate(form);
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (confirm("Are you sure you want to archive this project?")) {
      deleteMutation.mutate(id);
    }
  };

  // KPI calculations
  const totalCount = projects.length;
  const activeCount = projects.filter(p => p.status === "ACTIVE").length;
  const totalPlannedBudget = projects.reduce((sum, p) => sum + p.plannedBudget, 0);
  const totalActualBudget = projects.reduce((sum, p) => sum + p.actualBudget, 0);

  const formatCurrency = (val: number) => `$${val.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-8 max-w-7xl mx-auto pb-12">
      
      {/* ─── HEADER ─── */}
      <motion.div variants={item} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-text-main">
            Project <span className="text-gradient-primary">Portfolio</span>
          </h1>
          <p className="text-text-muted mt-2 text-sm">
            Track resource utilization, milestone progress, and budget variances across corporate accounts.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={() => setIsModalOpen(true)} className="shadow-lg shadow-primary/10">
            <Plus className="w-4 h-4 mr-2" />
            New Project
          </Button>
        </div>
      </motion.div>

      {/* ─── TOASTS ─── */}
      <AnimatePresence>
        {successToast && (
          <motion.div 
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="p-4 bg-primary/[0.08] border border-primary/30 rounded-2xl flex items-center gap-3 text-sm text-primary font-medium shadow-xl backdrop-blur-md"
          >
            <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-slate-950 font-bold">✓</div>
            <div className="flex-1">{successToast}</div>
            <button onClick={() => setSuccessToast("")} className="text-primary hover:opacity-85 text-xs font-semibold">Dismiss</button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── SUMMARY KPI CARDS ─── */}
      <motion.div variants={container} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <MiniStat cardTitle="Active Projects" cardVal={activeCount.toString()} cardIcon={Briefcase} cardColor="text-primary" cardGrad="from-primary/20 to-primary/5" />
        <MiniStat cardTitle="Total Portfolio" cardVal={totalCount.toString()} cardIcon={Layers} cardColor="text-info" cardGrad="from-info/20 to-info/5" />
        <MiniStat cardTitle="Total Allocations" cardVal={formatCurrency(totalPlannedBudget)} cardIcon={DollarSign} cardColor="text-success" cardGrad="from-success/20 to-success/5" />
        <MiniStat cardTitle="Total Actual Spent" cardVal={formatCurrency(totalActualBudget)} cardIcon={TrendingUp} cardColor={totalActualBudget > totalPlannedBudget ? "text-danger" : "text-cyan"} cardGrad="from-cyan/20 to-cyan/5" />
      </motion.div>

      {/* ─── FILTERS ─── */}
      <motion.div variants={item} className="flex flex-col md:flex-row md:items-center justify-between p-5 bg-card/40 border border-border/20 rounded-2xl gap-4 backdrop-blur-sm">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-faint" />
          <input 
            type="text"
            placeholder="Search by code, title, description..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-surface/50 border border-border/30 rounded-xl pl-10 pr-4 py-2.5 text-xs text-text-main outline-none focus:border-primary/50 transition-all placeholder:text-text-faint" 
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-card border border-border/30 rounded-xl px-3 py-2.5 text-xs text-text-main focus:border-primary/50 outline-none cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="DRAFT">Draft</option>
            <option value="ACTIVE">Active</option>
            <option value="ON_HOLD">On Hold</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-card border border-border/30 rounded-xl px-3 py-2.5 text-xs text-text-main focus:border-primary/50 outline-none cursor-pointer"
          >
            <option value="createdAt">Date Created</option>
            <option value="name">Project Name</option>
            <option value="plannedBudget">Planned Budget</option>
            <option value="startDate">Start Date</option>
          </select>

          <button
            onClick={() => setSortOrder(prev => prev === "asc" ? "desc" : "asc")}
            className="px-3 py-2.5 border border-border/30 rounded-xl text-xs font-semibold hover:bg-card/50 text-text-muted transition-colors cursor-pointer"
          >
            {sortOrder.toUpperCase()}
          </button>
        </div>
      </motion.div>

      {/* ─── GRID LIST ─── */}
      {isLoading ? (
        <div className="text-center py-20 text-text-muted text-xs">Loading project portfolio...</div>
      ) : projects.length === 0 ? (
        <div className="text-center py-20 bg-card/10 border border-dashed border-border/20 rounded-2xl text-text-faint text-xs">
          No projects found. Use the "New Project" button to create one.
        </div>
      ) : (
        <motion.div variants={container} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((proj) => {
            const planned = proj.plannedBudget;
            const actual = proj.actualBudget;
            const isOverrun = actual > planned;
            const budgetPercent = planned > 0 ? (actual / planned) * 100 : 0;
            const formattedStart = new Date(proj.startDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
            const formattedEnd = new Date(proj.endDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

            return (
              <motion.div key={proj.id} variants={item}>
                <Link href={`/projects/${proj.id}`}>
                  <Card variant="glass" className="h-full flex flex-col justify-between overflow-hidden hover:border-primary/30 hover:-translate-y-0.5 transition-all duration-300 relative group cursor-pointer border border-border/20 shadow-md">
                    
                    {/* Top Accent Gradient Bar */}
                    <div className={cn(
                      "h-[3px] bg-gradient-to-r",
                      proj.status === "ACTIVE" ? "from-primary to-cyan" :
                      proj.status === "COMPLETED" ? "from-success to-emerald-400" :
                      proj.status === "ON_HOLD" ? "from-warning to-orange-400" :
                      proj.status === "CANCELLED" ? "from-danger to-rose-400" :
                      "from-text-muted/60 to-text-faint/30"
                    )} />

                    <div className="p-5 flex-1 flex flex-col justify-between">
                      <div>
                        {/* Header Details */}
                        <div className="flex justify-between items-start gap-2 mb-3">
                          <span className="text-[10px] font-bold font-mono tracking-wider text-text-faint bg-surface border border-border/30 px-2 py-0.5 rounded-full">
                            {proj.projectCode}
                          </span>
                          <span className={cn(
                            "px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wider uppercase",
                            proj.status === "ACTIVE" ? "bg-primary/10 text-primary" :
                            proj.status === "COMPLETED" ? "bg-success/10 text-success" :
                            proj.status === "ON_HOLD" ? "bg-warning/10 text-warning" :
                            proj.status === "CANCELLED" ? "bg-danger/10 text-danger" :
                            "bg-surface text-text-muted"
                          )}>
                            {proj.status}
                          </span>
                        </div>

                        {/* Title and Description */}
                        <h3 className="text-base font-bold text-text-main group-hover:text-primary transition-colors line-clamp-1 mb-2.5">
                          {proj.name}
                        </h3>
                        <p className="text-xs text-text-muted line-clamp-2 mb-5 min-h-[2rem]">
                          {proj.description || "No project overview description provided."}
                        </p>
                      </div>

                      <div className="space-y-4">
                        {/* Duration */}
                        <div className="flex items-center gap-2 text-text-faint text-[10px]">
                          <CalendarDays className="w-3.5 h-3.5" />
                          <span>{formattedStart} – {formattedEnd}</span>
                        </div>

                        {/* Counts (Tasks/Milestones/Members) */}
                        <div className="flex justify-between items-center text-[10px] font-semibold text-text-muted bg-surface/30 px-3 py-1.5 rounded-lg border border-border/10">
                          <span className="flex items-center gap-1">
                            <Layers className="w-3 h-3 text-text-faint" />
                            {proj._count?.tasks || 0} Tasks
                          </span>
                          <span className="w-[1px] h-3 bg-border/20" />
                          <span>{proj._count?.milestones || 0} Milestones</span>
                          <span className="w-[1px] h-3 bg-border/20" />
                          <span>{proj._count?.members || 0} Members</span>
                        </div>

                        {/* Budget Status */}
                        <div className="space-y-1.5 pt-2">
                          <div className="flex justify-between text-[10px] font-bold">
                            <span className="text-text-muted">Budget Spent</span>
                            <span className={cn(isOverrun ? "text-danger" : "text-text-main")}>
                              {formatCurrency(actual)} / {formatCurrency(planned)}
                            </span>
                          </div>
                          
                          {/* Premium Progress Bar */}
                          <div className="h-1.5 bg-surface/50 rounded-full overflow-hidden border border-border/10">
                            <div 
                              className={cn(
                                "h-full rounded-full transition-all duration-500",
                                isOverrun ? "bg-gradient-to-r from-danger to-rose-500" : "bg-gradient-to-r from-success to-emerald-400"
                              )} 
                              style={{ width: `${Math.min(100, budgetPercent)}%` }} 
                            />
                          </div>

                          {/* Budget alert text */}
                          {isOverrun && (
                            <p className="text-[9px] text-danger font-semibold flex items-center gap-1 animate-pulse">
                              ⚠️ Budget overrun: {budgetPercent.toFixed(0)}% consumed
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Card Footer Actions */}
                    <div className="border-t border-border/15 p-4 bg-card/10 flex justify-between items-center text-[11px] group-hover:bg-card/20 transition-colors">
                      <span className="text-text-faint font-mono">Created {new Date(proj.createdAt).toLocaleDateString()}</span>
                      
                      <div className="flex items-center gap-2.5">
                        <button
                          onClick={(e) => handleDelete(e, proj.id)}
                          title="Archive Project"
                          className="text-text-faint hover:text-danger hover:bg-danger/10 p-1.5 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                        <ChevronRight className="w-4 h-4 text-text-faint group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                      </div>
                    </div>

                  </Card>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      {/* ─── CREATE PROJECT MODAL ─── */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title="Initialize New Project"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5 col-span-1">
              <label className="text-xs font-semibold text-text-muted">Project Code *</label>
              <input
                type="text"
                required
                placeholder="e.g. PJ-102"
                value={form.projectCode}
                onChange={(e) => setForm({...form, projectCode: e.target.value.toUpperCase()})}
                className="w-full bg-surface/50 border border-border/40 rounded-xl px-3 py-2 text-xs text-text-main focus:border-primary/50 outline-none transition-all"
              />
            </div>
            <div className="space-y-1.5 col-span-2">
              <label className="text-xs font-semibold text-text-muted">Project Title *</label>
              <input
                type="text"
                required
                placeholder="e.g. Enterprise Cloud Suite Upgrade"
                value={form.name}
                onChange={(e) => setForm({...form, name: e.target.value})}
                className="w-full bg-surface/50 border border-border/40 rounded-xl px-3 py-2 text-xs text-text-main focus:border-primary/50 outline-none transition-all"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-text-muted">Description / Goals Overview</label>
            <textarea
              placeholder="Detail project specifications, objectives, and deliverables..."
              value={form.description}
              rows={3}
              onChange={(e) => setForm({...form, description: e.target.value})}
              className="w-full bg-surface/50 border border-border/40 rounded-xl px-3 py-2 text-xs text-text-main focus:border-primary/50 outline-none transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-text-muted">Planned Allocation Budget *</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-faint" />
                <input
                  type="number"
                  required
                  placeholder="250000"
                  value={form.plannedBudget || ""}
                  onChange={(e) => setForm({...form, plannedBudget: Number(e.target.value)})}
                  className="w-full bg-surface/50 border border-border/40 rounded-xl pl-8 pr-3 py-2 text-xs text-text-main focus:border-primary/50 outline-none transition-all"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-text-muted">Initial Portfolio Status</label>
              <select
                value={form.status}
                onChange={(e) => setForm({...form, status: e.target.value as any})}
                className="w-full bg-surface/50 border border-border/40 rounded-xl px-3 py-2 text-xs text-text-main focus:border-primary/50 outline-none cursor-pointer"
              >
                <option value="DRAFT">Draft Setup</option>
                <option value="ACTIVE">Active Operation</option>
                <option value="ON_HOLD">On Hold</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-text-muted">Operational Start Date *</label>
              <input
                type="date"
                required
                value={form.startDate}
                onChange={(e) => setForm({...form, startDate: e.target.value})}
                className="w-full bg-surface/50 border border-border/40 rounded-xl px-3 py-2 text-xs text-text-main focus:border-primary/50 outline-none transition-all cursor-pointer"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-text-muted">Operational End Date *</label>
              <input
                type="date"
                required
                value={form.endDate}
                onChange={(e) => setForm({...form, endDate: e.target.value})}
                className="w-full bg-surface/50 border border-border/40 rounded-xl px-3 py-2 text-xs text-text-main focus:border-primary/50 outline-none transition-all cursor-pointer"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 pt-3 border-t border-border/10 justify-end">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? "Configuring ledger..." : "Confirm & Launch Project"}
            </Button>
          </div>
        </form>
      </Modal>

    </motion.div>
  );
}

function MiniStat({ cardTitle, cardVal, cardIcon: Icon, cardColor, cardGrad }: any) {
  return (
    <motion.div variants={item}>
      <Card variant="default" className="group hover:-translate-y-0.5 transition-all duration-300 overflow-hidden relative border border-border/20 shadow-md">
        <div className={cn("absolute left-0 top-0 bottom-0 w-[3px] rounded-r-full bg-gradient-to-b opacity-40 group-hover:opacity-80 transition-opacity", cardGrad)} />
        <div className="flex items-center gap-4 p-5">
          <div className={cn("p-2.5 rounded-xl bg-surface/80 border border-border/30", cardColor)}>
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-text-muted uppercase tracking-wider">{cardTitle}</p>
            <p className="text-2xl font-bold text-text-main mt-0.5 font-mono">{cardVal}</p>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

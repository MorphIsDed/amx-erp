"use client";

import { useState, useTransition } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ApiClient } from "@/services/api-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Button from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { 
  ArrowLeft,
  Briefcase,
  Layers,
  CalendarDays,
  DollarSign,
  TrendingUp,
  Users,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Plus,
  Trash2,
  Edit2,
  MoveRight,
  Settings,
  ShieldAlert,
  ListTodo
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } };
const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] as const } } };

// Enums and Interfaces
type ProjectStatus = "DRAFT" | "ACTIVE" | "ON_HOLD" | "COMPLETED" | "CANCELLED";
type MilestoneStatus = "PENDING" | "IN_PROGRESS" | "COMPLETED" | "DELAYED";
type TaskPriority = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
type TaskStatus = "TODO" | "IN_PROGRESS" | "REVIEW" | "DONE" | "BLOCKED";

interface Employee {
  id: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface Milestone {
  id: string;
  name: string;
  description?: string;
  dueDate: string;
  completedAt?: string;
  status: MilestoneStatus;
}

interface Task {
  id: string;
  title: string;
  description?: string;
  priority: TaskPriority;
  status: TaskStatus;
  estimatedHours: number;
  actualHours: number;
  dueDate: string;
  assignedEmployeeId?: string;
  assignedEmployee?: Employee;
  milestoneId?: string;
}

interface ProjectMember {
  projectId: string;
  employeeId: string;
  allocationPercentage: number;
  employee: Employee;
}

interface Project {
  id: string;
  projectCode: string;
  name: string;
  description?: string;
  status: ProjectStatus;
  startDate: string;
  endDate: string;
  plannedBudget: number;
  actualBudget: number;
  milestones: Milestone[];
  tasks: Task[];
  members: ProjectMember[];
}

export default function ProjectDetailsPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<"overview" | "tasks" | "milestones" | "team">("overview");

  // Success Toast state
  const [toastMessage, setToastMessage] = useState("");

  // Modals States
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isMilestoneModalOpen, setIsMilestoneModalOpen] = useState(false);
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const [isEditProjectModalOpen, setIsEditProjectModalOpen] = useState(false);

  // Form states
  const [taskForm, setTaskForm] = useState({
    title: "",
    description: "",
    priority: "MEDIUM" as TaskPriority,
    status: "TODO" as TaskStatus,
    estimatedHours: 0,
    actualHours: 0,
    dueDate: "",
    assignedEmployeeId: "",
    milestoneId: "",
  });

  const [milestoneForm, setMilestoneForm] = useState({
    name: "",
    description: "",
    dueDate: "",
    status: "PENDING" as MilestoneStatus,
  });

  const [teamForm, setTeamForm] = useState({
    employeeId: "",
    allocationPercentage: 50,
  });

  const [projectForm, setProjectForm] = useState({
    name: "",
    description: "",
    plannedBudget: 0,
    actualBudget: 0,
    status: "ACTIVE" as ProjectStatus,
  });

  // Queries
  const { data: projectRes, isLoading: isProjectLoading } = useQuery({
    queryKey: ["project", id],
    queryFn: () => ApiClient.get<{ data: Project }>(`/projects/${id}`),
    enabled: !!id,
  });

  const project = projectRes?.data;

  // Active employees for dropdown selectors
  const { data: employeesRes } = useQuery({
    queryKey: ["employees"],
    queryFn: () => ApiClient.get<{ data: Employee[] }>("/hr/employees"),
  });
  const employees = employeesRes?.data || [];

  // Mutations
  const updateProjectMutation = useMutation({
    mutationFn: (data: typeof projectForm) => ApiClient.put<Project>(`/projects/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project", id] });
      setIsEditProjectModalOpen(false);
      showToast("Project configurations updated successfully.");
    }
  });

  const createTaskMutation = useMutation({
    mutationFn: (data: any) => ApiClient.post<Task>("/tasks", { ...data, projectId: id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project", id] });
      setIsTaskModalOpen(false);
      setTaskForm({
        title: "",
        description: "",
        priority: "MEDIUM",
        status: "TODO",
        estimatedHours: 0,
        actualHours: 0,
        dueDate: "",
        assignedEmployeeId: "",
        milestoneId: "",
      });
      showToast("Task created and assigned successfully.");
    },
    onError: (err: any) => alert(err.message || "Failed to create task")
  });

  const updateTaskStatusMutation = useMutation({
    mutationFn: ({ taskId, status }: { taskId: string; status: TaskStatus }) =>
      ApiClient.put<Task>(`/tasks/${taskId}`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project", id] });
      showToast("Task status updated.");
    }
  });

  const deleteTaskMutation = useMutation({
    mutationFn: (taskId: string) => ApiClient.delete(`/tasks/${taskId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project", id] });
      showToast("Task successfully removed.");
    }
  });

  const createMilestoneMutation = useMutation({
    mutationFn: (data: any) => ApiClient.post<Milestone>("/milestones", { ...data, projectId: id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project", id] });
      setIsMilestoneModalOpen(false);
      setMilestoneForm({ name: "", description: "", dueDate: "", status: "PENDING" });
      showToast("Project milestone created.");
    },
    onError: (err: any) => alert(err.message || "Failed to create milestone")
  });

  const updateMilestoneStatusMutation = useMutation({
    mutationFn: ({ milestoneId, status }: { milestoneId: string; status: MilestoneStatus }) =>
      ApiClient.put<Milestone>(`/milestones/${milestoneId}`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project", id] });
      showToast("Milestone updated.");
    }
  });

  const deleteMilestoneMutation = useMutation({
    mutationFn: (milestoneId: string) => ApiClient.delete(`/milestones/${milestoneId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project", id] });
      showToast("Milestone removed.");
    }
  });

  const allocateMemberMutation = useMutation({
    mutationFn: (data: typeof teamForm) => ApiClient.post<any>(`/projects/${id}/resources`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project", id] });
      setIsTeamModalOpen(false);
      setTeamForm({ employeeId: "", allocationPercentage: 50 });
      showToast("Resource successfully allocated.");
    },
    onError: (err: any) => {
      alert(err.message || "Failed to allocate resource. Ensure employee is not overallocated (>100%)");
    }
  });

  const removeMemberMutation = useMutation({
    mutationFn: (employeeId: string) => ApiClient.delete(`/projects/${id}/resources/${employeeId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project", id] });
      showToast("Resource de-allocated from project.");
    }
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 4500);
  };

  if (isProjectLoading) {
    return <div className="text-center py-20 text-xs text-text-muted">Loading project workspace details...</div>;
  }

  if (!project) {
    return (
      <div className="text-center py-20">
        <p className="text-danger font-bold">Failed to load project details.</p>
        <Button onClick={() => router.push("/projects")} className="mt-4">
          Back to Projects List
        </Button>
      </div>
    );
  }

  const handleEditProjectClick = () => {
    setProjectForm({
      name: project.name,
      description: project.description || "",
      plannedBudget: project.plannedBudget,
      actualBudget: project.actualBudget,
      status: project.status,
    });
    setIsEditProjectModalOpen(true);
  };

  const handleEditProjectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProjectMutation.mutate(projectForm);
  };

  // Metrics derived from project data
  const totalTasks = project.tasks.length;
  const completedTasks = project.tasks.filter((t) => t.status === "DONE").length;
  const progressPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const totalMilestones = project.milestones.length;
  const completedMilestones = project.milestones.filter((m) => m.status === "COMPLETED").length;
  const milestoneProgressPercentage = totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0;

  const budgetUsedPercent = project.plannedBudget > 0 ? (project.actualBudget / project.plannedBudget) * 100 : 0;
  const isBudgetOverrun = project.actualBudget > project.plannedBudget;

  const formatCurrency = (val: number) => `$${val.toLocaleString("en-US")}`;

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-8 max-w-7xl mx-auto pb-12">
      
      {/* ─── HEADER WITH BACK BUTTON ─── */}
      <motion.div variants={item} className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/15 pb-6">
        <div className="space-y-2">
          <Link href="/projects" className="inline-flex items-center text-xs font-bold text-text-faint hover:text-primary transition-colors gap-1.5 uppercase tracking-wider mb-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Projects Portfolio
          </Link>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-text-main">
              {project.name}
            </h1>
            <span className="text-[10px] font-bold font-mono tracking-wider text-text-faint bg-surface border border-border/30 px-2 py-0.5 rounded-full">
              {project.projectCode}
            </span>
            <span className={cn(
              "px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider",
              project.status === "ACTIVE" ? "bg-primary/15 text-primary" :
              project.status === "COMPLETED" ? "bg-success/15 text-success" :
              project.status === "ON_HOLD" ? "bg-warning/15 text-warning" :
              "bg-surface text-text-muted"
            )}>
              {project.status}
            </span>
          </div>
          <p className="text-xs text-text-muted max-w-3xl leading-relaxed">
            {project.description || "No project overview description provided."}
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <Button variant="outline" onClick={handleEditProjectClick}>
            <Settings className="w-4 h-4 mr-2" />
            Configure Project
          </Button>
        </div>
      </motion.div>

      {/* ─── TOAST NOTIFICATION ─── */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div 
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="p-4 bg-primary/[0.08] border border-primary/30 rounded-2xl flex items-center gap-3 text-sm text-primary font-medium shadow-xl backdrop-blur-md"
          >
            <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-slate-950 font-bold">✓</div>
            <div className="flex-1">{toastMessage}</div>
            <button onClick={() => setToastMessage("")} className="text-primary hover:opacity-85 text-xs font-semibold">Dismiss</button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── HEALTH METRICS ROW ─── */}
      <motion.div variants={container} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Task Progress */}
        <Card variant="default" className="border border-border/20 shadow-md">
          <div className="p-5 flex items-center gap-4">
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary border border-primary/20 shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-text-muted uppercase tracking-wider">Task Progress</p>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-bold font-mono">{progressPercentage}%</span>
                <span className="text-[10px] text-text-faint font-semibold">({completedTasks}/{totalTasks} Done)</span>
              </div>
              <div className="h-1 bg-surface/50 rounded-full overflow-hidden mt-2">
                <div className="h-full bg-primary rounded-full transition-all duration-300" style={{ width: `${progressPercentage}%` }} />
              </div>
            </div>
          </div>
        </Card>

        {/* Milestone Progress */}
        <Card variant="default" className="border border-border/20 shadow-md">
          <div className="p-5 flex items-center gap-4">
            <div className="p-2.5 rounded-xl bg-info/10 text-info border border-info/20 shrink-0">
              <Layers className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-text-muted uppercase tracking-wider">Milestones</p>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-bold font-mono">{milestoneProgressPercentage}%</span>
                <span className="text-[10px] text-text-faint font-semibold">({completedMilestones}/{totalMilestones} Completed)</span>
              </div>
              <div className="h-1 bg-surface/50 rounded-full overflow-hidden mt-2">
                <div className="h-full bg-info rounded-full transition-all duration-300" style={{ width: `${milestoneProgressPercentage}%` }} />
              </div>
            </div>
          </div>
        </Card>

        {/* Planned Budget */}
        <Card variant="default" className="border border-border/20 shadow-md">
          <div className="p-5 flex items-center gap-4">
            <div className="p-2.5 rounded-xl bg-success/10 text-success border border-success/20 shrink-0">
              <DollarSign className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-text-muted uppercase tracking-wider">Planned Budget</p>
              <p className="text-2xl font-bold text-text-main mt-0.5 font-mono">{formatCurrency(project.plannedBudget)}</p>
              <p className="text-[10px] text-text-faint mt-1.5 font-mono">Limit target allocation</p>
            </div>
          </div>
        </Card>

        {/* Actual Budget Spent */}
        <Card variant="default" className={cn("border border-border/20 shadow-md relative overflow-hidden")}>
          <div className="p-5 flex items-center gap-4">
            <div className={cn("p-2.5 rounded-xl border shrink-0", isBudgetOverrun ? "bg-danger/10 text-danger border-danger/20" : "bg-cyan/10 text-cyan border-cyan/20")}>
              {isBudgetOverrun ? <AlertTriangle className="w-5 h-5" /> : <TrendingUp className="w-5 h-5" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-text-muted uppercase tracking-wider">Actual Spent</p>
              <p className="text-2xl font-bold text-text-main mt-0.5 font-mono">{formatCurrency(project.actualBudget)}</p>
              <div className="h-1 bg-surface/50 rounded-full overflow-hidden mt-2">
                <div className={cn("h-full rounded-full transition-all duration-300", isBudgetOverrun ? "bg-danger" : "bg-cyan")} style={{ width: `${Math.min(100, budgetUsedPercent)}%` }} />
              </div>
            </div>
          </div>
        </Card>

      </motion.div>

      {/* ─── TAB SELECTION LEDGER ─── */}
      <motion.div variants={item}>
        <div className="flex items-center gap-1.5 p-1 bg-card/40 border border-border/20 rounded-xl w-fit backdrop-blur-sm shadow-sm">
          {(["overview", "tasks", "milestones", "team"] as const).map((tab) => (
            <button 
              key={tab} 
              onClick={() => setActiveTab(tab)} 
              className={cn(
                "relative px-5 py-2 text-xs font-bold rounded-lg transition-all capitalize cursor-pointer", 
                activeTab === tab ? "text-text-main font-bold" : "text-text-faint hover:text-text-muted"
              )}
            >
              {activeTab === tab && (
                <motion.div 
                  layoutId="active-details-tab" 
                  className="absolute inset-0 bg-card border border-border/40 rounded-lg shadow-sm" 
                  transition={{ type: "spring", stiffness: 350, damping: 30 }} 
                />
              )}
              <span className="relative z-10">{tab}</span>
            </button>
          ))}
        </div>
      </motion.div>

      {/* ─── DETAILS TABS INNER VIEWS ─── */}
      <motion.div variants={item}>
        <AnimatePresence mode="wait">
          
          {/* OVERVIEW TAB */}
          {activeTab === "overview" && (
            <motion.div 
              key="overview-tab"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-6"
            >
              {/* Project Goals / Information */}
              <Card variant="glass" className="lg:col-span-2 border-border/20 p-6 space-y-6">
                <div>
                  <h3 className="text-sm font-bold text-text-main uppercase tracking-wider mb-2">Specifications & Targets</h3>
                  <div className="grid grid-cols-2 gap-6 bg-surface/30 border border-border/15 p-4 rounded-xl font-mono text-xs">
                    <div>
                      <p className="text-text-faint mb-1 uppercase font-bold">Planned Start Date</p>
                      <p className="text-text-main font-semibold flex items-center gap-1.5">
                        <CalendarDays className="w-3.5 h-3.5 text-text-faint" />
                        {new Date(project.startDate).toDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-text-faint mb-1 uppercase font-bold">Projected Deadline</p>
                      <p className="text-text-main font-semibold flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-text-faint" />
                        {new Date(project.endDate).toDateString()}
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-text-main uppercase tracking-wider mb-3">Project Description</h3>
                  <div className="text-xs text-text-muted leading-relaxed bg-surface/10 p-4 border border-border/10 rounded-xl space-y-2">
                    <p>{project.description || "No project overview description provided."}</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-text-main uppercase tracking-wider mb-3">Milestone Progress Timeline</h3>
                  <div className="space-y-4">
                    {project.milestones.slice(0, 3).map((m) => (
                      <div key={m.id} className="flex items-center justify-between border-b border-border/10 pb-2.5 last:border-0 last:pb-0">
                        <div className="flex items-center gap-2">
                          <div className={cn(
                            "w-2.5 h-2.5 rounded-full shrink-0",
                            m.status === "COMPLETED" ? "bg-success" :
                            m.status === "DELAYED" ? "bg-danger animate-pulse" :
                            "bg-warning"
                          )} />
                          <div>
                            <p className="text-xs font-semibold text-text-main">{m.name}</p>
                            <p className="text-[10px] text-text-faint font-mono">Due: {new Date(m.dueDate).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <span className={cn(
                          "px-2 py-0.5 rounded-full text-[8px] font-bold uppercase font-mono border",
                          m.status === "COMPLETED" ? "bg-success/5 border-success/20 text-success" :
                          m.status === "DELAYED" ? "bg-danger/5 border-danger/20 text-danger" :
                          "bg-warning/5 border-warning/20 text-warning"
                        )}>
                          {m.status}
                        </span>
                      </div>
                    ))}
                    {project.milestones.length === 0 && (
                      <p className="text-xs text-text-faint text-center py-2">No milestones defined yet.</p>
                    )}
                  </div>
                </div>
              </Card>

              {/* Budget Variance Tracker */}
              <Card variant="glass" className="border-border/20 p-6 flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-bold text-text-main uppercase tracking-wider mb-4 flex items-center gap-1.5">
                    <DollarSign className="w-4 h-4 text-text-faint" />
                    Budget Tracking Ledger
                  </h3>

                  <div className="space-y-4 font-mono text-xs">
                    <div className="flex justify-between border-b border-border/10 pb-2.5">
                      <span className="text-text-muted">Planned Allocation</span>
                      <span className="text-text-main font-bold">{formatCurrency(project.plannedBudget)}</span>
                    </div>

                    <div className="flex justify-between border-b border-border/10 pb-2.5">
                      <span className="text-text-muted">Actual Capital Spent</span>
                      <span className="text-text-main font-bold">{formatCurrency(project.actualBudget)}</span>
                    </div>

                    <div className="flex justify-between border-b border-border/10 pb-2.5">
                      <span className="text-text-muted">Financial Variance</span>
                      <span className={cn(
                        "font-bold font-mono",
                        project.plannedBudget - project.actualBudget >= 0 ? "text-success" : "text-danger font-bold"
                      )}>
                        {project.plannedBudget - project.actualBudget >= 0 ? "+" : ""}
                        {formatCurrency(project.plannedBudget - project.actualBudget)}
                      </span>
                    </div>

                    <div className="flex justify-between pt-1">
                      <span className="text-text-muted">Capital Utilization</span>
                      <span className={cn("font-bold font-mono", isBudgetOverrun ? "text-danger" : "text-primary")}>
                        {budgetUsedPercent.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-8 bg-surface/30 p-4 border border-border/15 rounded-2xl flex items-start gap-3">
                  <div className="p-1.5 rounded-lg bg-surface text-text-muted shrink-0 border border-border/20">
                    <ShieldAlert className="w-4 h-4 text-text-faint" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-text-main uppercase tracking-wider">Ledger Notes</h5>
                    <p className="text-[10px] text-text-faint mt-1 leading-relaxed leading-relaxed leading-relaxed font-sans">
                      Any actual budget overrun generates automatic real-time alerts dispatched to tenant administrators and operations managers via email and in-app feeds.
                    </p>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}

          {/* TASKS KANBAN BOARD TAB */}
          {activeTab === "tasks" && (
            <motion.div 
              key="tasks-tab"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="space-y-6"
            >
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-sm font-bold text-text-main uppercase tracking-wider">Project Kanban Board</h3>
                  <p className="text-[11px] text-text-faint mt-0.5">Drag-and-drop or quickly re-assign task operational status.</p>
                </div>
                <Button onClick={() => setIsTaskModalOpen(true)} size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Task
                </Button>
              </div>

              {/* Kanban Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 overflow-x-auto pb-4">
                {(["TODO", "IN_PROGRESS", "REVIEW", "BLOCKED", "DONE"] as TaskStatus[]).map((colStatus) => {
                  const colTasks = project.tasks.filter((t) => t.status === colStatus);
                  return (
                    <div 
                      key={colStatus} 
                      className="bg-card/30 border border-border/15 rounded-2xl p-4 min-w-[200px] flex flex-col h-[550px] overflow-y-auto"
                    >
                      {/* Column Header */}
                      <div className="flex items-center justify-between mb-4 border-b border-border/10 pb-2">
                        <span className={cn(
                          "text-xs font-bold uppercase tracking-wider",
                          colStatus === "TODO" ? "text-text-muted" :
                          colStatus === "IN_PROGRESS" ? "text-primary" :
                          colStatus === "REVIEW" ? "text-info" :
                          colStatus === "BLOCKED" ? "text-danger animate-pulse" :
                          "text-success"
                        )}>
                          {colStatus.replace("_", " ")}
                        </span>
                        <span className="text-[10px] font-bold text-text-faint bg-surface border border-border/20 px-2 py-0.5 rounded-full font-mono">
                          {colTasks.length}
                        </span>
                      </div>

                      {/* Column Tasks */}
                      <div className="space-y-3 flex-1 overflow-y-auto scrollbar-hide">
                        {colTasks.map((task) => (
                          <div 
                            key={task.id}
                            className="bg-card hover:bg-card/80 border border-border/25 rounded-xl p-3.5 shadow-sm hover:border-primary/20 transition-all duration-200 group relative"
                          >
                            <div className="flex justify-between items-start gap-1 mb-2">
                              <span className={cn(
                                "text-[8px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider font-mono",
                                task.priority === "CRITICAL" ? "bg-danger/10 text-danger border border-danger/15" :
                                task.priority === "HIGH" ? "bg-warning/10 text-warning" :
                                task.priority === "MEDIUM" ? "bg-info/10 text-info" :
                                "bg-surface text-text-faint"
                              )}>
                                {task.priority}
                              </span>
                              
                              {/* Quick status progress control */}
                              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button 
                                  onClick={() => deleteTaskMutation.mutate(task.id)}
                                  className="text-text-faint hover:text-danger p-0.5 rounded transition-colors"
                                  title="Delete Task"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                                <select
                                  value={task.status}
                                  onChange={(e) => updateTaskStatusMutation.mutate({ taskId: task.id, status: e.target.value as TaskStatus })}
                                  className="bg-surface border border-border/30 rounded text-[9px] font-bold text-text-muted p-0.5 outline-none cursor-pointer"
                                  title="Quick Move"
                                >
                                  <option value="TODO">Todo</option>
                                  <option value="IN_PROGRESS">In Dev</option>
                                  <option value="REVIEW">Review</option>
                                  <option value="BLOCKED">Blocked</option>
                                  <option value="DONE">Done</option>
                                </select>
                              </div>
                            </div>

                            <h4 className="text-xs font-bold text-text-main mb-1.5 group-hover:text-primary transition-colors line-clamp-1">
                              {task.title}
                            </h4>
                            <p className="text-[10px] text-text-muted line-clamp-2 mb-3">
                              {task.description || "No specs description."}
                            </p>

                            <div className="border-t border-border/10 pt-2.5 mt-2.5 flex justify-between items-center text-[9px] font-mono">
                              <span className="text-text-faint flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {new Date(task.dueDate).toLocaleDateString()}
                              </span>

                              {/* Assignee Avatar */}
                              <div 
                                className="w-5 h-5 rounded-full bg-gradient-to-br from-accent to-pink-500 text-white flex items-center justify-center font-bold text-[8px] tracking-tighter"
                                title={task.assignedEmployee ? `${task.assignedEmployee.firstName} ${task.assignedEmployee.lastName}` : "Unassigned"}
                              >
                                {task.assignedEmployee ? `${task.assignedEmployee.firstName[0]}${task.assignedEmployee.lastName[0]}`.toUpperCase() : "?"}
                              </div>
                            </div>
                          </div>
                        ))}
                        {colTasks.length === 0 && (
                          <div className="flex flex-col items-center justify-center py-10 text-center border border-dashed border-border/15 rounded-xl">
                            <ListTodo className="w-6 h-6 text-text-faint opacity-15 mb-2" />
                            <span className="text-[9px] text-text-faint font-semibold">No tasks</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* MILESTONES TAB */}
          {activeTab === "milestones" && (
            <motion.div 
              key="milestones-tab"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="space-y-6"
            >
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-sm font-bold text-text-main uppercase tracking-wider">Milestone Tracker</h3>
                  <p className="text-[11px] text-text-faint mt-0.5">Control critical path deliverables and deadlines.</p>
                </div>
                <Button onClick={() => setIsMilestoneModalOpen(true)} size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Milestone
                </Button>
              </div>

              {/* Milestone list cards */}
              <div className="grid grid-cols-1 gap-4">
                {project.milestones.map((m) => {
                  const formattedDue = new Date(m.dueDate).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
                  return (
                    <Card 
                      key={m.id}
                      variant="glass" 
                      className="p-5 flex flex-col sm:flex-row sm:items-center justify-between border-border/30 relative overflow-hidden"
                    >
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2">
                          <span className={cn(
                            "px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border",
                            m.status === "COMPLETED" ? "bg-success/10 border-success/20 text-success" :
                            m.status === "DELAYED" ? "bg-danger/10 border-danger/20 text-danger animate-pulse" :
                            "bg-warning/10 border-warning/20 text-warning"
                          )}>
                            {m.status}
                          </span>
                          <span className="text-[10px] text-text-faint font-mono">ID: {m.id.slice(0, 8)}</span>
                        </div>
                        <h4 className="text-sm font-bold text-text-main flex items-center gap-2">
                          {m.name}
                        </h4>
                        <p className="text-xs text-text-muted max-w-xl">
                          {m.description || "No specific details provided for this milestone."}
                        </p>
                      </div>

                      <div className="text-left sm:text-right mt-4 sm:mt-0 flex flex-col justify-between sm:items-end gap-3 shrink-0">
                        <div className="font-mono text-xs">
                          <p className="text-text-faint uppercase font-bold">Due Deadline</p>
                          <p className="text-text-main font-semibold mt-0.5 flex items-center gap-1.5 sm:justify-end">
                            <CalendarDays className="w-3.5 h-3.5 text-text-faint" />
                            {formattedDue}
                          </p>
                        </div>

                        <div className="flex gap-2">
                          <select
                            value={m.status}
                            onChange={(e) => updateMilestoneStatusMutation.mutate({ milestoneId: m.id, status: e.target.value as MilestoneStatus })}
                            className="bg-surface border border-border/30 rounded-xl px-2.5 py-1.5 text-[10px] font-bold text-text-muted outline-none cursor-pointer focus:border-primary/50"
                          >
                            <option value="PENDING">Pending</option>
                            <option value="IN_PROGRESS">In Progress</option>
                            <option value="COMPLETED">Completed</option>
                            <option value="DELAYED">Delayed</option>
                          </select>
                          <button
                            onClick={() => { if (confirm("Remove this milestone?")) deleteMilestoneMutation.mutate(m.id); }}
                            className="p-2 border border-border/30 rounded-xl text-text-faint hover:text-danger hover:bg-danger/10 transition-all cursor-pointer"
                            title="Remove"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </Card>
                  );
                })}

                {project.milestones.length === 0 && (
                  <div className="text-center py-10 bg-card/10 border border-dashed border-border/20 rounded-2xl text-text-faint text-xs">
                    No project milestones added. Setup your roadmap now!
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* TEAM RESOURCE ALLOCATION TAB */}
          {activeTab === "team" && (
            <motion.div 
              key="team-tab"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="space-y-6"
            >
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-sm font-bold text-text-main uppercase tracking-wider">Project Allocation Ledger</h3>
                  <p className="text-[11px] text-text-faint mt-0.5">Control employee utilization percentage limits.</p>
                </div>
                <Button onClick={() => setIsTeamModalOpen(true)} size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Allocate Resource
                </Button>
              </div>

              {/* Members grid cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {project.members.map((m) => {
                  const emp = m.employee;
                  const initials = `${emp.firstName[0]}${emp.lastName[0]}`.toUpperCase();
                  return (
                    <Card 
                      key={m.employeeId}
                      variant="glass" 
                      className="p-5 flex flex-col justify-between border-border/30 hover:border-primary/20 transition-all duration-300 relative group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/30 to-cyan/20 border border-primary/30 flex items-center justify-center text-primary font-bold text-xs tracking-wider shadow-sm">
                          {initials}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="text-sm font-bold text-text-main truncate">{emp.firstName} {emp.lastName}</h4>
                          <p className="text-[10px] text-text-faint truncate font-mono">{emp.email}</p>
                        </div>
                      </div>

                      <div className="mt-5 pt-4 border-t border-border/10 flex items-center justify-between text-xs">
                        <div>
                          <span className="text-text-muted">Allocated Effort:</span>
                          <p className="text-sm font-bold font-mono text-primary mt-0.5">
                            {m.allocationPercentage}%
                          </p>
                        </div>
                        <button
                          onClick={() => { if (confirm("De-allocate this employee from the project?")) removeMemberMutation.mutate(m.employeeId); }}
                          className="text-text-faint hover:text-danger hover:bg-danger/10 p-1.5 rounded-lg transition-all cursor-pointer opacity-0 group-hover:opacity-100"
                          title="De-allocate Resource"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </Card>
                  );
                })}

                {project.members.length === 0 && (
                  <div className="text-center py-10 bg-card/10 border border-dashed border-border/20 rounded-2xl text-text-faint text-xs col-span-full">
                    No team members allocated to this project workspace.
                  </div>
                )}
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </motion.div>

      {/* ─── ADD TASK MODAL ─── */}
      <Modal isOpen={isTaskModalOpen} onClose={() => setIsTaskModalOpen(false)} title="Create Task Workspace">
        <form onSubmit={(e) => { e.preventDefault(); createTaskMutation.mutate(taskForm); }} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-text-muted">Task Title *</label>
            <input
              type="text"
              required
              placeholder="e.g. Integrate Payment Gateway API"
              value={taskForm.title}
              onChange={(e) => setTaskForm({...taskForm, title: e.target.value})}
              className="w-full bg-surface/50 border border-border/40 rounded-xl px-3 py-2 text-xs text-text-main focus:border-primary/50 outline-none transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-text-muted">Specs Details Description</label>
            <textarea
              placeholder="Specs parameters, functional expectations, or prerequisites..."
              value={taskForm.description}
              rows={3}
              onChange={(e) => setTaskForm({...taskForm, description: e.target.value})}
              className="w-full bg-surface/50 border border-border/40 rounded-xl px-3 py-2 text-xs text-text-main focus:border-primary/50 outline-none transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-text-muted">Priority Level</label>
              <select
                value={taskForm.priority}
                onChange={(e) => setTaskForm({...taskForm, priority: e.target.value as TaskPriority})}
                className="w-full bg-surface/50 border border-border/40 rounded-xl px-3 py-2 text-xs text-text-main focus:border-primary/50 outline-none cursor-pointer"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="CRITICAL">Critical</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-text-muted">Task Status Column</label>
              <select
                value={taskForm.status}
                onChange={(e) => setTaskForm({...taskForm, status: e.target.value as TaskStatus})}
                className="w-full bg-surface/50 border border-border/40 rounded-xl px-3 py-2 text-xs text-text-main focus:border-primary/50 outline-none cursor-pointer"
              >
                <option value="TODO">Todo Column</option>
                <option value="IN_PROGRESS">In Progress Column</option>
                <option value="REVIEW">Review Column</option>
                <option value="BLOCKED">Blocked Column</option>
                <option value="DONE">Done Column</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-text-muted">Estimated Hours</label>
              <input
                type="number"
                placeholder="12"
                value={taskForm.estimatedHours || ""}
                onChange={(e) => setTaskForm({...taskForm, estimatedHours: Number(e.target.value)})}
                className="w-full bg-surface/50 border border-border/40 rounded-xl px-3 py-2 text-xs text-text-main focus:border-primary/50 outline-none transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-text-muted">Due Deadline *</label>
              <input
                type="date"
                required
                value={taskForm.dueDate}
                onChange={(e) => setTaskForm({...taskForm, dueDate: e.target.value})}
                className="w-full bg-surface/50 border border-border/40 rounded-xl px-3 py-2 text-xs text-text-main focus:border-primary/50 outline-none transition-all cursor-pointer"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-text-muted">Assignee Workforce *</label>
              <select
                required
                value={taskForm.assignedEmployeeId}
                onChange={(e) => setTaskForm({...taskForm, assignedEmployeeId: e.target.value})}
                className="w-full bg-surface/50 border border-border/40 rounded-xl px-3 py-2 text-xs text-text-main focus:border-primary/50 outline-none cursor-pointer"
              >
                <option value="">Select Assignee Employee</option>
                {project.members.map((m) => (
                  <option key={m.employeeId} value={m.employeeId}>
                    {m.employee.firstName} {m.employee.lastName}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-text-muted">Target Milestone</label>
              <select
                value={taskForm.milestoneId}
                onChange={(e) => setTaskForm({...taskForm, milestoneId: e.target.value})}
                className="w-full bg-surface/50 border border-border/40 rounded-xl px-3 py-2 text-xs text-text-main focus:border-primary/50 outline-none cursor-pointer"
              >
                <option value="">Select Associated Milestone</option>
                {project.milestones.map((m) => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-3 border-t border-border/10 justify-end">
            <Button type="button" variant="outline" onClick={() => setIsTaskModalOpen(false)}>Cancel</Button>
            <Button type="submit">Deploy Task</Button>
          </div>
        </form>
      </Modal>

      {/* ─── ADD MILESTONE MODAL ─── */}
      <Modal isOpen={isMilestoneModalOpen} onClose={() => setIsMilestoneModalOpen(false)} title="Create Milestone">
        <form onSubmit={(e) => { e.preventDefault(); createMilestoneMutation.mutate(milestoneForm); }} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-text-muted">Milestone Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Beta Version Build Release"
              value={milestoneForm.name}
              onChange={(e) => setMilestoneForm({...milestoneForm, name: e.target.value})}
              className="w-full bg-surface/50 border border-border/40 rounded-xl px-3 py-2 text-xs text-text-main focus:border-primary/50 outline-none transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-text-muted">Milestone Objectives Description</label>
            <textarea
              placeholder="Detail target roadmap outcomes, criteria or dependencies..."
              value={milestoneForm.description}
              rows={3}
              onChange={(e) => setMilestoneForm({...milestoneForm, description: e.target.value})}
              className="w-full bg-surface/50 border border-border/40 rounded-xl px-3 py-2 text-xs text-text-main focus:border-primary/50 outline-none transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-text-muted">Target Due Date *</label>
              <input
                type="date"
                required
                value={milestoneForm.dueDate}
                onChange={(e) => setMilestoneForm({...milestoneForm, dueDate: e.target.value})}
                className="w-full bg-surface/50 border border-border/40 rounded-xl px-3 py-2 text-xs text-text-main focus:border-primary/50 outline-none transition-all cursor-pointer"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-text-muted">Initial Milestone Status</label>
              <select
                value={milestoneForm.status}
                onChange={(e) => setMilestoneForm({...milestoneForm, status: e.target.value as MilestoneStatus})}
                className="w-full bg-surface/50 border border-border/40 rounded-xl px-3 py-2 text-xs text-text-main focus:border-primary/50 outline-none cursor-pointer"
              >
                <option value="PENDING">Pending (Upcoming)</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="DELAYED">Delayed Alert</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-3 border-t border-border/10 justify-end">
            <Button type="button" variant="outline" onClick={() => setIsMilestoneModalOpen(false)}>Cancel</Button>
            <Button type="submit">Establish Milestone</Button>
          </div>
        </form>
      </Modal>

      {/* ─── ALLOCATE TEAM RESOURCE MODAL ─── */}
      <Modal isOpen={isTeamModalOpen} onClose={() => setIsTeamModalOpen(false)} title="Allocate Team Resource">
        <form onSubmit={(e) => { e.preventDefault(); allocateMemberMutation.mutate(teamForm); }} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-text-muted">Select Employee *</label>
            <select
              required
              value={teamForm.employeeId}
              onChange={(e) => setTeamForm({...teamForm, employeeId: e.target.value})}
              className="w-full bg-surface/50 border border-border/40 rounded-xl px-3 py-2 text-xs text-text-main focus:border-primary/50 outline-none cursor-pointer"
            >
              <option value="">Select Employee to Allocate</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.firstName} {emp.lastName} ({emp.employeeId})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between text-xs font-semibold text-text-muted">
              <span>Target Effort Allocation</span>
              <span className="text-primary font-mono">{teamForm.allocationPercentage}%</span>
            </div>
            <input
              type="range"
              min={10}
              max={100}
              step={5}
              value={teamForm.allocationPercentage}
              onChange={(e) => setTeamForm({...teamForm, allocationPercentage: Number(e.target.value)})}
              className="w-full h-1.5 bg-surface/50 border border-border/40 rounded-lg appearance-none cursor-pointer accent-primary"
            />
            <p className="text-[10px] text-text-faint leading-relaxed font-sans mt-1">
              Ensure this allocation percentage added to the employee&apos;s existing memberships across other active projects does not exceed the total effort limit of 100%.
            </p>
          </div>

          <div className="flex items-center gap-3 pt-3 border-t border-border/10 justify-end">
            <Button type="button" variant="outline" onClick={() => setIsTeamModalOpen(false)}>Cancel</Button>
            <Button type="submit">Allocate Member</Button>
          </div>
        </form>
      </Modal>

      {/* ─── EDIT PROJECT CONFIG MODAL ─── */}
      <Modal isOpen={isEditProjectModalOpen} onClose={() => setIsEditProjectModalOpen(false)} title="Configure Project specifications">
        <form onSubmit={handleEditProjectSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-text-muted">Project Title</label>
            <input
              type="text"
              required
              placeholder="Enter Project Title"
              value={projectForm.name}
              onChange={(e) => setProjectForm({...projectForm, name: e.target.value})}
              className="w-full bg-surface/50 border border-border/40 rounded-xl px-3 py-2 text-xs text-text-main focus:border-primary/50 outline-none transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-text-muted">Goals specifications description</label>
            <textarea
              placeholder="Goals Specs..."
              value={projectForm.description}
              rows={3}
              onChange={(e) => setProjectForm({...projectForm, description: e.target.value})}
              className="w-full bg-surface/50 border border-border/40 rounded-xl px-3 py-2 text-xs text-text-main focus:border-primary/50 outline-none transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-text-muted">Planned Capital Budget</label>
              <input
                type="number"
                required
                value={projectForm.plannedBudget}
                onChange={(e) => setProjectForm({...projectForm, plannedBudget: Number(e.target.value)})}
                className="w-full bg-surface/50 border border-border/40 rounded-xl px-3 py-2 text-xs text-text-main focus:border-primary/50 outline-none transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-text-muted">Actual spent ledger balance</label>
              <input
                type="number"
                required
                value={projectForm.actualBudget}
                onChange={(e) => setProjectForm({...projectForm, actualBudget: Number(e.target.value)})}
                className="w-full bg-surface/50 border border-border/40 rounded-xl px-3 py-2 text-xs text-text-main focus:border-primary/50 outline-none transition-all"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-text-muted">Operational State</label>
            <select
              value={projectForm.status}
              onChange={(e) => setProjectForm({...projectForm, status: e.target.value as ProjectStatus})}
              className="w-full bg-surface/50 border border-border/40 rounded-xl px-3 py-2 text-xs text-text-main focus:border-primary/50 outline-none cursor-pointer"
            >
              <option value="DRAFT">Draft</option>
              <option value="ACTIVE">Active</option>
              <option value="ON_HOLD">On Hold</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>

          <div className="flex items-center gap-3 pt-3 border-t border-border/10 justify-end">
            <Button type="button" variant="outline" onClick={() => setIsEditProjectModalOpen(false)}>Cancel</Button>
            <Button type="submit">Save Configurations</Button>
          </div>
        </form>
      </Modal>

    </motion.div>
  );
}

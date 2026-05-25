"use client";

import { useEffect, useState, useTransition } from "react";
import { Employee } from "@/types/employee";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Button from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Users, 
  UserCheck, 
  UserMinus, 
  Plus, 
  Search, 
  Filter, 
  Trash2, 
  Mail, 
  Briefcase, 
  CalendarDays,
  X,
  CreditCard,
  Download
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Modal } from "@/components/ui/modal";
import { exportToCsv } from "@/lib/export-utils";
import { createEmployee, deleteEmployee as deleteEmployeeAction } from "@/app/actions";

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } };
const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] } } };
const tabs = ["employees", "payroll", "departments"];

interface MockPayrollRun {
  id: string;
  periodStart: string;
  periodEnd: string;
  status: "Draft" | "Processed" | "Paid";
  payslips: number;
  totalAmount: number;
}

export default function HRPage({ initialEmployees }: { initialEmployees: Employee[] }) {
  const [tab, setTab] = useState("employees");
  const [employees, setEmployees] = useState<Employee[]>(initialEmployees);
  const [isPending, startTransition] = useTransition();
  
  // Table search & filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [deptFilter, setDeptFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Onboard modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newEmp, setNewEmp] = useState({
    name: "",
    email: "",
    role: "",
    department: "Engineering",
    status: "Active" as "Active" | "On Leave",
  });

  const [successToast, setSuccessToast] = useState("");

  // Statistics counters
  const totalStaff = employees.length;
  const activeStaff = employees.filter(e => e.status === "Active").length;
  const leaveStaff = employees.filter(e => e.status === "On Leave").length;

  // Filtered employees list
  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = 
      emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.role.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDept = deptFilter === "all" || emp.department === deptFilter;
    const matchesStatus = statusFilter === "all" || emp.status === statusFilter;

    return matchesSearch && matchesDept && matchesStatus;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage) || 1;
  const paginatedEmployees = filteredEmployees.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  // Onboard Form submission (Optimistic update)
  const handleOnboardSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmp.name || !newEmp.email || !newEmp.role) return;

    startTransition(async () => {
      const optimisticEmp = {
        id: `optimistic_${Date.now()}`,
        name: newEmp.name,
        email: newEmp.email,
        role: newEmp.role,
        department: newEmp.department,
        status: newEmp.status,
        createdAt: new Date().toISOString(),
      } as Employee;
      
      setEmployees(prev => [optimisticEmp, ...prev]);
      
      await createEmployee({
        name: newEmp.name,
        email: newEmp.email,
        role: newEmp.role,
        department: newEmp.department,
        status: newEmp.status,
      });

      setSuccessToast(`Employee "${newEmp.name}" successfully onboarded into ${newEmp.department}!`);
      setTimeout(() => setSuccessToast(""), 4000);
    });

    setIsModalOpen(false);
    setNewEmp({
      name: "",
      email: "",
      role: "",
      department: "Engineering",
      status: "Active",
    });
    setCurrentPage(1); // Jump to first page to see onboarded user
  };

  const handleDeleteEmployee = (id: string) => {
    startTransition(async () => {
      setEmployees(prev => prev.filter(e => e.id !== id));
      await deleteEmployeeAction(id);
    });
  };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-8 max-w-7xl mx-auto pb-12">
      
      {/* HEADER */}
      <motion.div variants={item} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            <span className="text-gradient-primary">Human</span>{" "}
            <span className="text-text-main">Resources</span>
          </h1>
          <p className="text-text-muted mt-2 text-sm">
            Workforce directories, departmental distribution, and live payroll operations.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => exportToCsv("hr_directory", filteredEmployees)}>
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
          <Button onClick={() => setIsModalOpen(true)} className="shadow-lg shadow-primary/10">
            <Plus className="w-4 h-4 mr-2" />
            Onboard Employee
          </Button>
        </div>
      </motion.div>

      {/* FEEDBACK TOAST */}
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

      {/* HR MINI METRICS */}
      <motion.div variants={container} className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <MiniStat title="Total Headcount" value={totalStaff.toString()} icon={Users} color="text-info" gradient="from-info/20 to-info/5" />
        <MiniStat title="Active Employees" value={activeStaff.toString()} icon={UserCheck} color="text-success" gradient="from-success/20 to-success/5" />
        <MiniStat title="On Leave" value={leaveStaff.toString()} icon={UserMinus} color="text-warning" gradient="from-warning/20 to-warning/5" />
      </motion.div>

      {/* TABS SELECTOR */}
      <motion.div variants={item}>
        <div className="flex items-center gap-1 p-1 bg-card/40 border border-border/20 rounded-xl w-fit backdrop-blur-sm">
          {tabs.map((t) => (
            <button 
              key={t} 
              onClick={() => setTab(t)} 
              className={cn(
                "relative px-5 py-2 text-xs font-bold rounded-lg transition-all capitalize cursor-pointer", 
                tab === t ? "text-text-main" : "text-text-faint hover:text-text-muted"
              )}
            >
              {tab === t && (
                <motion.div 
                  layoutId="hr-tab" 
                  className="absolute inset-0 bg-card border border-border/40 rounded-lg shadow-sm" 
                  transition={{ type: "spring", stiffness: 350, damping: 30 }} 
                />
              )}
              <span className="relative z-10">{t}</span>
            </button>
          ))}
        </div>
      </motion.div>

      {/* RENDER ACTIVE TAB */}
      <motion.div variants={item}>
        {tab === "employees" && (
          <Card variant="glass" className="border-border/20 shadow-lg overflow-hidden">
            {/* Filters panel */}
            <div className="flex flex-col md:flex-row md:items-center justify-between p-6 gap-4 border-b border-border/20 bg-card/10">
              
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-faint" />
                <input 
                  type="text"
                  placeholder="Search employees by name, role, email..." 
                  value={searchTerm}
                  onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                  className="w-full bg-surface/50 border border-border/30 rounded-xl pl-10 pr-4 py-2.5 text-xs text-text-main outline-none focus:border-primary/50 transition-all" 
                />
              </div>

              <div className="flex items-center gap-3">
                <select
                  value={deptFilter}
                  onChange={(e) => { setDeptFilter(e.target.value); setCurrentPage(1); }}
                  className="bg-card border border-border/30 rounded-xl px-3 py-2 text-xs text-text-main focus:border-primary/50 outline-none cursor-pointer"
                >
                  <option value="all">All Departments</option>
                  <option value="Engineering">Engineering</option>
                  <option value="Finance">Finance</option>
                  <option value="HR">HR</option>
                  <option value="Product">Product</option>
                  <option value="Sales">Sales</option>
                  <option value="Operations">Operations</option>
                </select>

                <select
                  value={statusFilter}
                  onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                  className="bg-card border border-border/30 rounded-xl px-3 py-2 text-xs text-text-main focus:border-primary/50 outline-none cursor-pointer"
                >
                  <option value="all">All Statuses</option>
                  <option value="Active">Active</option>
                  <option value="On Leave">On Leave</option>
                </select>
              </div>

            </div>

            {/* Table */}
            <CardContent className="p-0 overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-border/15 bg-card/40 text-text-faint font-semibold uppercase tracking-wider">
                    <th className="px-6 py-4">Employee</th>
                    <th className="px-6 py-4">Work Email</th>
                    <th className="px-6 py-4">Department</th>
                    <th className="px-6 py-4">Current Role</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/10">
                  <AnimatePresence mode="popLayout">
                    {paginatedEmployees.map((emp) => {
                      const initials = emp.name.split(" ").map(n => n[0]).join("");
                      return (
                        <motion.tr 
                          key={emp.id} 
                          layout
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="hover:bg-card/30 transition-colors group"
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/20 to-accent/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-[10px]">
                                {initials}
                              </div>
                              <span className="font-semibold text-text-main text-sm">{emp.name}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-text-muted font-mono">{emp.email}</td>
                          <td className="px-6 py-4 text-text-muted">{emp.department}</td>
                          <td className="px-6 py-4 text-text-muted">{emp.role}</td>
                          <td className="px-6 py-4">
                            <span className={cn(
                              "px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider", 
                              emp.status === "Active" ? "bg-success/10 text-success" : "bg-warning/10 text-warning"
                            )}>
                              {emp.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button 
                              onClick={() => handleDeleteEmployee(emp.id)}
                              title="Delete Record"
                              className="text-text-faint hover:text-danger hover:bg-danger/10 p-1.5 rounded-lg transition-all cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </motion.tr>
                      );
                    })}
                  </AnimatePresence>

                  {filteredEmployees.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-6 py-10 text-center text-text-faint font-medium">
                        No employees found matching the filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>

              {/* PAGINATION */}
              <div className="p-4 border-t border-border/15 flex items-center justify-between gap-4 text-text-muted">
                <span className="text-[11px] font-medium">
                  Showing {Math.min(filteredEmployees.length, (currentPage - 1) * itemsPerPage + 1)}-{Math.min(filteredEmployees.length, currentPage * itemsPerPage)} of {filteredEmployees.length} workforce entries
                </span>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    disabled={currentPage === 1}
                    onClick={() => handlePageChange(currentPage - 1)}
                    className="px-2.5 py-1 text-[11px]"
                  >
                    Previous
                  </Button>
                  <div className="flex items-center gap-1 font-mono text-xs font-bold text-text-main px-2">
                    <span>{currentPage}</span>
                    <span className="text-text-faint">/</span>
                    <span className="text-text-faint">{totalPages}</span>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    disabled={currentPage === totalPages}
                    onClick={() => handlePageChange(currentPage + 1)}
                    className="px-2.5 py-1 text-[11px]"
                  >
                    Next
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {tab === "payroll" && <PayrollSection />}
        
        {tab === "departments" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {["Engineering", "Finance", "HR", "Product", "Sales", "Operations"].map((dept) => {
              const staffCount = employees.filter(e => e.department === dept).length;
              return (
                <Card key={dept} variant="glass" className="p-5 flex flex-col justify-between border-border/30 hover:border-primary/20 transition-all duration-300">
                  <div>
                    <h4 className="text-base font-bold text-text-main">{dept}</h4>
                    <p className="text-xs text-text-faint mt-1">Acme Enterprise Core Division</p>
                  </div>
                  <div className="mt-6 flex items-center justify-between border-t border-border/10 pt-4">
                    <span className="text-xs text-text-muted">Staff Size:</span>
                    <span className="text-sm font-bold text-primary font-mono">{staffCount} members</span>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </motion.div>

      {/* ONBOARD EMPLOYEE DIALOG MODAL */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title="Onboard New Workforce Member"
      >
        <form onSubmit={handleOnboardSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-text-muted">Full Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Rahul Deshmukh"
              value={newEmp.name}
              onChange={(e) => setNewEmp({...newEmp, name: e.target.value})}
              className="w-full bg-surface/50 border border-border/40 rounded-xl px-3 py-2 text-xs text-text-main placeholder:text-text-faint/60 focus:border-primary/50 outline-none transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-text-muted">Work Email</label>
            <input
              type="email"
              required
              placeholder="rahul.deshmukh@acme.com"
              value={newEmp.email}
              onChange={(e) => setNewEmp({...newEmp, email: e.target.value})}
              className="w-full bg-surface/50 border border-border/40 rounded-xl px-3 py-2 text-xs text-text-main placeholder:text-text-faint/60 focus:border-primary/50 outline-none transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-text-muted">Designation / Role</label>
            <input
              type="text"
              required
              placeholder="e.g. Lead QA Engineer"
              value={newEmp.role}
              onChange={(e) => setNewEmp({...newEmp, role: e.target.value})}
              className="w-full bg-surface/50 border border-border/40 rounded-xl px-3 py-2 text-xs text-text-main placeholder:text-text-faint/60 focus:border-primary/50 outline-none transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-text-muted">Department</label>
              <select
                value={newEmp.department}
                onChange={(e) => setNewEmp({...newEmp, department: e.target.value})}
                className="w-full bg-surface/50 border border-border/40 rounded-xl px-3 py-2 text-xs text-text-main focus:border-primary/50 outline-none cursor-pointer"
              >
                <option value="Engineering">Engineering</option>
                <option value="Finance">Finance</option>
                <option value="HR">HR</option>
                <option value="Product">Product</option>
                <option value="Sales">Sales</option>
                <option value="Operations">Operations</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-text-muted">Initial Status</label>
              <select
                value={newEmp.status}
                onChange={(e) => setNewEmp({...newEmp, status: e.target.value as any})}
                className="w-full bg-surface/50 border border-border/40 rounded-xl px-3 py-2 text-xs text-text-main focus:border-primary/50 outline-none cursor-pointer"
              >
                <option value="Active">Active Duty</option>
                <option value="On Leave">On Leave</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-3 border-t border-border/10 justify-end">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">
              Complete Onboarding
            </Button>
          </div>
        </form>
      </Modal>

    </motion.div>
  );
}

function PayrollSection() {
  const [runs, setRuns] = useState<MockPayrollRun[]>([
    { id: "pr_1", periodStart: "2026-04-01", periodEnd: "2026-04-30", status: "Paid", payslips: 8, totalAmount: 2450000 },
    { id: "pr_2", periodStart: "2026-05-01", periodEnd: "2026-05-31", status: "Draft", payslips: 8, totalAmount: 2450000 },
  ]);
  const [processing, setProcessing] = useState<string | null>(null);

  const initiatePayroll = () => {
    const nextStart = "2026-06-01";
    const nextEnd = "2026-06-30";
    
    const newRun: MockPayrollRun = {
      id: `pr_${Date.now()}`,
      periodStart: nextStart,
      periodEnd: nextEnd,
      status: "Draft",
      payslips: 8,
      totalAmount: 2450000,
    };

    setRuns([newRun, ...runs]);
  };

  const processPayroll = (id: string) => {
    setProcessing(id);
    
    // Simulate process optimistic state update with real delayed feedback
    setTimeout(() => {
      setRuns(prev => prev.map(r => r.id === id ? { ...r, status: "Paid" } : r));
      setProcessing(null);
    }, 1500);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-bold text-text-main">Payroll Cycles</h3>
          <p className="text-xs text-text-faint mt-0.5">Approve, run, and track payroll ledger accounts.</p>
        </div>
        <Button onClick={initiatePayroll} size="sm">
          <Plus className="w-4 h-4 mr-2" />
          New Payroll Cycle
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {runs.map((run) => (
          <Card key={run.id} variant="glass" className="p-5 flex flex-col sm:flex-row sm:items-center justify-between border-border/30 relative overflow-hidden">
            {run.status === "Paid" && (
              <div className="absolute top-0 right-0 w-24 h-24 bg-success/5 rounded-full blur-2xl pointer-events-none" />
            )}
            
            <div className="space-y-2">
              <div className="flex items-center gap-2.5">
                <span className={cn(
                  "px-2 py-0.5 rounded-full text-[9px] font-bold uppercase",
                  run.status === "Paid" ? "bg-success/15 text-success" : "bg-warning/15 text-warning animate-pulse"
                )}>
                  {run.status}
                </span>
                <span className="text-xs text-text-faint font-mono">ID: {run.id}</span>
              </div>
              <p className="text-sm font-bold text-text-main flex items-center gap-2">
                <CalendarDays className="w-4 h-4 text-text-faint" />
                Payroll Cycle: {new Date(run.periodStart).toLocaleDateString()} - {new Date(run.periodEnd).toLocaleDateString()}
              </p>
              <p className="text-xs text-text-faint font-mono">
                {run.payslips} active salaries calculated in ledger accounts
              </p>
            </div>

            <div className="text-left sm:text-right mt-4 sm:mt-0 flex flex-col justify-between sm:items-end">
              <div>
                <p className="text-xs text-text-faint uppercase font-bold tracking-wider">Estimated Payout</p>
                <p className="text-xl font-bold text-text-main font-mono mt-0.5">₹{run.totalAmount.toLocaleString()}</p>
              </div>
              {run.status === "Draft" && (
                <Button 
                  onClick={() => processPayroll(run.id)}
                  disabled={processing !== null}
                  className="mt-3 py-1.5 text-[10px] uppercase font-bold"
                  size="sm"
                >
                  {processing === run.id ? "Clearing treasury..." : "Process & Clear Payout"}
                </Button>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function MiniStat({ title, value, icon: Icon, color, gradient }: any) {
  return (
    <motion.div variants={item}>
      <Card variant="default" className="group hover:-translate-y-0.5 transition-all duration-300 overflow-hidden relative">
        <div className={cn("absolute left-0 top-0 bottom-0 w-[3px] rounded-r-full bg-gradient-to-b opacity-40 group-hover:opacity-80 transition-opacity", gradient)} />
        <div className="flex items-center gap-4 p-5">
          <div className={cn("p-2.5 rounded-xl bg-surface/80 border border-border/30", color)}>
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-text-muted uppercase tracking-wider">{title}</p>
            <p className="text-2xl font-bold text-text-main mt-0.5 font-mono">{value}</p>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

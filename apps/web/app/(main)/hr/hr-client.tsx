"use client";

import { useState } from "react";
import { Employee, getEmployeeFullName, EmployeeStatus } from "@/types/employee";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Button from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Users, 
  UserCheck, 
  UserMinus, 
  Plus, 
  Search, 
  Trash2, 
  CalendarDays,
  Download,
  Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Modal } from "@/components/ui/modal";
import { exportToCsv } from "@/lib/export-utils";
import { useList, useCreate, useDelete } from "@/hooks/use-crud";
import { ApiClient } from "@/services/api-client";

const container: any = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } };
const item: any = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } } };
const tabs = ["employees", "payroll", "departments"];

interface PayrollRun {
  id: string;
  periodStart: string;
  periodEnd: string;
  status: "DRAFT" | "PROCESSING" | "COMPLETED" | "CANCELLED";
  totalAmount: number;
  payslips?: any[];
}

export default function HRClient() {
  const [tab, setTab] = useState("employees");
  
  // Real employee data fetching
  const { data: employeesRes, isLoading: isEmployeesLoading, isError: isEmployeesError, refetch: refetchEmployees } = useList<Employee>('hr/employees');
  const employees = employeesRes?.data || [];

  // Real departments fetching (REST endpoint we added)
  const { data: departmentsRes } = useList<{ id: string; name: string }>('hr/employees/departments');
  const departments = departmentsRes?.data || [];

  // Mutations
  const createEmployeeMutation = useCreate<Employee>('hr/employees');
  const deleteEmployeeMutation = useDelete('hr/employees');

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
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    departmentId: "",
    status: "ACTIVE" as EmployeeStatus,
  });

  const [successToast, setSuccessToast] = useState("");

  // Statistics counters
  const totalStaff = employees.length;
  const activeStaff = employees.filter(e => e.status === "ACTIVE").length;
  const leaveStaff = employees.filter(e => e.status === "ON_LEAVE").length;

  // Filtered employees list
  const filteredEmployees = employees.filter(emp => {
    const fullName = getEmployeeFullName(emp).toLowerCase();
    const matchesSearch = 
      fullName.includes(searchTerm.toLowerCase()) ||
      emp.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.employeeId.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDept = deptFilter === "all" || emp.departmentId === deptFilter;
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

  // Onboard Form submission
  const handleOnboardSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmp.firstName || !newEmp.lastName || !newEmp.email || !newEmp.departmentId) return;

    // Generate unique employee ID
    const randomNum = Math.floor(100 + Math.random() * 900);
    const employeeId = `EMP${randomNum}`;

    try {
      await createEmployeeMutation.mutateAsync({
        employeeId,
        firstName: newEmp.firstName,
        lastName: newEmp.lastName,
        email: newEmp.email,
        phone: newEmp.phone || null,
        status: newEmp.status,
        departmentId: newEmp.departmentId,
        hireDate: new Date(),
      });

      const selectedDeptName = departments.find(d => d.id === newEmp.departmentId)?.name || 'Department';
      setSuccessToast(`Employee "${newEmp.firstName} ${newEmp.lastName}" successfully onboarded into ${selectedDeptName}!`);
      setTimeout(() => setSuccessToast(""), 4000);
      setIsModalOpen(false);
      setNewEmp({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        departmentId: "",
        status: "ACTIVE",
      });
      setCurrentPage(1);
    } catch (err: any) {
      console.error("Failed to onboard employee:", err);
    }
  };

  const handleDeleteEmployee = async (id: string) => {
    if (confirm("Are you sure you want to delete this employee record?")) {
      try {
        await deleteEmployeeMutation.mutateAsync(id);
      } catch (err) {
        console.error("Failed to delete employee:", err);
      }
    }
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
        <MiniStat title="Total Headcount" value={isEmployeesLoading ? "..." : totalStaff.toString()} icon={Users} color="text-info" gradient="from-info/20 to-info/5" />
        <MiniStat title="Active Employees" value={isEmployeesLoading ? "..." : activeStaff.toString()} icon={UserCheck} color="text-success" gradient="from-success/20 to-success/5" />
        <MiniStat title="On Leave" value={isEmployeesLoading ? "..." : leaveStaff.toString()} icon={UserMinus} color="text-warning" gradient="from-warning/20 to-warning/5" />
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
                  placeholder="Search employees by name, SKU ID, email..." 
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
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>{dept.name}</option>
                  ))}
                </select>

                <select
                  value={statusFilter}
                  onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                  className="bg-card border border-border/30 rounded-xl px-3 py-2 text-xs text-text-main focus:border-primary/50 outline-none cursor-pointer"
                >
                  <option value="all">All Statuses</option>
                  <option value="ACTIVE">Active Duty</option>
                  <option value="ON_LEAVE">On Leave</option>
                  <option value="INACTIVE">Inactive</option>
                  <option value="TERMINATED">Terminated</option>
                </select>
              </div>

            </div>

            {/* Table */}
            <CardContent className="p-0 overflow-x-auto">
              {isEmployeesLoading ? (
                <div className="p-12 text-center text-text-faint flex flex-col items-center justify-center gap-2">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  <span>Retrieving workforce directory...</span>
                </div>
              ) : isEmployeesError ? (
                <div className="p-12 text-center text-danger font-medium">
                  Failed to load employees. Please check your network connection.
                </div>
              ) : (
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-border/15 bg-card/40 text-text-faint font-semibold uppercase tracking-wider">
                      <th className="px-6 py-4">Employee</th>
                      <th className="px-6 py-4">ID</th>
                      <th className="px-6 py-4">Work Email</th>
                      <th className="px-6 py-4">Department</th>
                      <th className="px-6 py-4">Base Salary</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/10">
                    <AnimatePresence mode="popLayout">
                      {paginatedEmployees.map((emp) => {
                        const fullName = getEmployeeFullName(emp);
                        const initials = fullName.split(" ").map(n => n[0]).join("");
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
                                <span className="font-semibold text-text-main text-sm">{fullName}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-text-muted font-mono">{emp.employeeId}</td>
                            <td className="px-6 py-4 text-text-muted font-mono">{emp.email}</td>
                            <td className="px-6 py-4 text-text-muted">{emp.department?.name || "Unassigned"}</td>
                            <td className="px-6 py-4 text-text-muted font-mono">₹{emp.baseSalary.toLocaleString()}</td>
                            <td className="px-6 py-4">
                              <span className={cn(
                                "px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider", 
                                emp.status === "ACTIVE" ? "bg-success/10 text-success" : 
                                emp.status === "ON_LEAVE" ? "bg-warning/10 text-warning" : "bg-card text-text-faint"
                              )}>
                                {emp.status.replace("_", " ")}
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
                        <td colSpan={7} className="px-6 py-10 text-center text-text-faint font-medium">
                          No employees found matching the filters.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}

              {/* PAGINATION */}
              {!isEmployeesLoading && !isEmployeesError && (
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
              )}
            </CardContent>
          </Card>
        )}

        {tab === "payroll" && <PayrollSection />}
        
        {tab === "departments" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {departments.map((dept) => {
              const staffCount = employees.filter(e => e.departmentId === dept.id).length;
              return (
                <Card key={dept.id} variant="glass" className="p-5 flex flex-col justify-between border-border/30 hover:border-primary/20 transition-all duration-300">
                  <div>
                    <h4 className="text-base font-bold text-text-main">{dept.name}</h4>
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
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-text-muted">First Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Rahul"
                value={newEmp.firstName}
                onChange={(e) => setNewEmp({...newEmp, firstName: e.target.value})}
                className="w-full bg-surface/50 border border-border/40 rounded-xl px-3 py-2 text-xs text-text-main placeholder:text-text-faint/60 focus:border-primary/50 outline-none transition-all"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-text-muted">Last Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Deshmukh"
                value={newEmp.lastName}
                onChange={(e) => setNewEmp({...newEmp, lastName: e.target.value})}
                className="w-full bg-surface/50 border border-border/40 rounded-xl px-3 py-2 text-xs text-text-main placeholder:text-text-faint/60 focus:border-primary/50 outline-none transition-all"
              />
            </div>
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
            <label className="text-xs font-semibold text-text-muted">Phone Number (Optional)</label>
            <input
              type="text"
              placeholder="+919876543210"
              value={newEmp.phone}
              onChange={(e) => setNewEmp({...newEmp, phone: e.target.value})}
              className="w-full bg-surface/50 border border-border/40 rounded-xl px-3 py-2 text-xs text-text-main placeholder:text-text-faint/60 focus:border-primary/50 outline-none transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-text-muted">Department</label>
              <select
                required
                value={newEmp.departmentId}
                onChange={(e) => setNewEmp({...newEmp, departmentId: e.target.value})}
                className="w-full bg-surface/50 border border-border/40 rounded-xl px-3 py-2 text-xs text-text-main focus:border-primary/50 outline-none cursor-pointer"
              >
                <option value="" disabled>Select Department</option>
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.id}>{dept.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-text-muted">Initial Status</label>
              <select
                value={newEmp.status}
                onChange={(e) => setNewEmp({...newEmp, status: e.target.value as EmployeeStatus})}
                className="w-full bg-surface/50 border border-border/40 rounded-xl px-3 py-2 text-xs text-text-main focus:border-primary/50 outline-none cursor-pointer"
              >
                <option value="ACTIVE">Active Duty</option>
                <option value="ON_LEAVE">On Leave</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-3 border-t border-border/10 justify-end">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createEmployeeMutation.isPending}>
              {createEmployeeMutation.isPending ? "Onboarding..." : "Complete Onboarding"}
            </Button>
          </div>
        </form>
      </Modal>

    </motion.div>
  );
}

function PayrollSection() {
  const { data: runsRes, isLoading, refetch } = useList<PayrollRun>('hr/payroll/runs');
  const runs = runsRes?.data || [];
  
  const createRunMutation = useCreate<PayrollRun>('hr/payroll/run');
  const [processing, setProcessing] = useState<string | null>(null);

  const initiatePayroll = async () => {
    // Automatically set start/end date for current month
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth(); // 0-indexed

    const periodStart = new Date(year, month, 1).toISOString();
    const periodEnd = new Date(year, month + 1, 0).toISOString();

    try {
      await createRunMutation.mutateAsync({
        periodStart,
        periodEnd,
      });
      refetch();
    } catch (err) {
      console.error("Failed to initiate payroll run:", err);
    }
  };

  const processPayroll = async (id: string) => {
    setProcessing(id);
    try {
      await ApiClient.put(`/hr/payroll/runs/${id}/process`, {});
      refetch();
    } catch (err) {
      console.error("Failed to process payroll:", err);
    } finally {
      setProcessing(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-bold text-text-main">Payroll Cycles</h3>
          <p className="text-xs text-text-faint mt-0.5">Approve, run, and track payroll ledger accounts.</p>
        </div>
        <Button onClick={initiatePayroll} size="sm" disabled={createRunMutation.isPending}>
          <Plus className="w-4 h-4 mr-2" />
          New Payroll Cycle
        </Button>
      </div>

      {isLoading ? (
        <div className="p-12 text-center text-text-faint flex flex-col items-center justify-center gap-2">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <span>Retrieving payroll ledger cycles...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {runs.map((run) => (
            <Card key={run.id} variant="glass" className="p-5 flex flex-col sm:flex-row sm:items-center justify-between border-border/30 relative overflow-hidden">
              {run.status === "COMPLETED" && (
                <div className="absolute top-0 right-0 w-24 h-24 bg-success/5 rounded-full blur-2xl pointer-events-none" />
              )}
              
              <div className="space-y-2">
                <div className="flex items-center gap-2.5">
                  <span className={cn(
                    "px-2 py-0.5 rounded-full text-[9px] font-bold uppercase",
                    run.status === "COMPLETED" ? "bg-success/15 text-success" : 
                    run.status === "PROCESSING" ? "bg-info/15 text-info animate-pulse" : "bg-warning/15 text-warning"
                  )}>
                    {run.status === "COMPLETED" ? "Paid" : run.status.toLowerCase()}
                  </span>
                  <span className="text-xs text-text-faint font-mono">ID: {run.id.slice(0, 8)}...</span>
                </div>
                <p className="text-sm font-bold text-text-main flex items-center gap-2">
                  <CalendarDays className="w-4 h-4 text-text-faint" />
                  Payroll Cycle: {new Date(run.periodStart).toLocaleDateString()} - {new Date(run.periodEnd).toLocaleDateString()}
                </p>
                <p className="text-xs text-text-faint font-mono">
                  {run.payslips?.length || 0} active salaries calculated in ledger accounts
                </p>
              </div>

              <div className="text-left sm:text-right mt-4 sm:mt-0 flex flex-col justify-between sm:items-end">
                <div>
                  <p className="text-xs text-text-faint uppercase font-bold tracking-wider">Estimated Payout</p>
                  <p className="text-xl font-bold text-text-main font-mono mt-0.5">₹{run.totalAmount.toLocaleString()}</p>
                </div>
                {run.status === "DRAFT" && (
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
          {runs.length === 0 && (
            <div className="p-8 text-center text-text-faint border border-dashed border-border/20 rounded-2xl">
              No payroll cycles initiated. Click &quot;New Payroll Cycle&quot; to begin.
            </div>
          )}
        </div>
      )}
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

"use client";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Button from "@/components/ui/button";
import { motion } from "framer-motion";
import { Users, UserCheck, UserMinus, Plus, Search, Filter, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { API_ENDPOINTS } from "@/lib/api-config";

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const } } };
const tabs = ["employees", "departments", "payroll", "attendance"];

export default function HRPage() {
  const [tab, setTab] = useState("employees");
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const res = await fetch(API_ENDPOINTS.HR_EMPLOYEES, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        if (!res.ok) throw new Error("Failed to fetch employees");
        const data = await res.json();
        setEmployees(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchEmployees();
  }, []);

  if (loading) return <div className="p-8 text-center text-text-faint">Accessing Workforce Records...</div>;
  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-8 max-w-7xl mx-auto">
      <motion.div variants={item} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight"><span className="text-gradient-primary">Human</span>{" "}<span className="text-text-main">Resources</span></h1>
          <p className="text-text-muted mt-2 text-sm">Manage your workforce, payroll, and performance.</p>
        </div>
        <Button className="w-fit"><Plus className="w-4 h-4 mr-2" />Onboard Employee</Button>
      </motion.div>

      <motion.div variants={container} className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <MiniStat title="Total Staff" value="1,240" icon={Users} color="text-info" gradient="from-info/20 to-info/5" />
        <MiniStat title="On Duty" value="1,182" icon={UserCheck} color="text-success" gradient="from-success/20 to-success/5" />
        <MiniStat title="On Leave" value="58" icon={UserMinus} color="text-warning" gradient="from-warning/20 to-warning/5" />
      </motion.div>

      <motion.div variants={item}>
        <div className="flex items-center gap-1 p-1 bg-card/40 border border-border/20 rounded-xl w-fit backdrop-blur-sm">
          {tabs.map((t) => (
            <button key={t} onClick={() => setTab(t)} className={cn("relative px-4 py-2 text-sm font-medium rounded-lg transition-all capitalize", tab === t ? "text-text-main" : "text-text-faint hover:text-text-muted")}>
              {tab === t && <motion.div layoutId="hr-tab" className="absolute inset-0 bg-card border border-border/40 rounded-lg shadow-sm" transition={{ type: "spring", stiffness: 350, damping: 30 }} />}
              <span className="relative z-10">{t}</span>
            </button>
          ))}
        </div>
      </motion.div>

      <motion.div variants={item}>
        {tab === "employees" && (
          <Card variant="default" className="overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-6 gap-4 border-b border-border/20">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-faint" />
                <input placeholder="Search employees..." className="w-full bg-surface/60 border border-border/30 rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10 transition-all placeholder:text-text-faint" />
              </div>
              <div className="flex items-center gap-3">
                <Button variant="outline" size="sm"><Filter className="w-4 h-4 mr-2" />Filters</Button>
                <Button variant="outline" size="sm">Export</Button>
              </div>
            </div>
            <CardContent className="p-0 overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead><tr className="border-b border-border/20">
                  <th className="px-6 py-4 text-[11px] font-semibold text-text-faint uppercase tracking-wider">Employee</th>
                  <th className="px-6 py-4 text-[11px] font-semibold text-text-faint uppercase tracking-wider">Department</th>
                  <th className="px-6 py-4 text-[11px] font-semibold text-text-faint uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-[11px] font-semibold text-text-faint uppercase tracking-wider">Joining Date</th>
                  <th className="px-6 py-4"></th>
                </tr></thead>
                <tbody className="divide-y divide-border/15">
                  {employees.map((emp, i) => (
                    <motion.tr key={emp.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + i * 0.06, duration: 0.4, ease: [0.16, 1, 0.3, 1] }} className="hover:bg-primary/[0.02] transition-colors group">
                      <td className="px-6 py-4"><div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary/20 to-accent/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-xs">{emp.firstName[0]}{emp.lastName[0]}</div>
                        <div><p className="text-sm font-semibold text-text-main">{emp.firstName} {emp.lastName}</p><p className="text-xs text-text-faint">{emp.employeeId}</p></div>
                      </div></td>
                      <td className="px-6 py-4 text-sm text-text-muted">{emp.department?.name || "Unassigned"}</td>
                      <td className="px-6 py-4"><span className={cn("px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider", emp.status === "ACTIVE" ? "bg-success/10 text-success" : "bg-warning/10 text-warning")}>{emp.status}</span></td>
                      <td className="px-6 py-4 text-xs text-text-faint font-mono">{new Date(emp.hireDate).toLocaleDateString()}</td>
                      <td className="px-6 py-4 text-right"><button className="text-text-faint hover:text-text-main transition-colors p-1 rounded-lg hover:bg-card"><MoreHorizontal className="w-5 h-5" /></button></td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        )}
        {tab === "payroll" && <PayrollTab />}
      </motion.div>
    </motion.div>
  );
}

function PayrollTab() {
  const [runs, setRuns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRuns = async () => {
    try {
      const res = await fetch(API_ENDPOINTS.HR_PAYROLL_RUNS, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      const data = await res.json();
      setRuns(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRuns();
  }, []);

  const initiatePayroll = async () => {
    try {
      const start = new Date();
      start.setDate(1);
      const end = new Date();
      end.setMonth(end.getMonth() + 1);
      end.setDate(0);

      const res = await fetch(API_ENDPOINTS.HR_PAYROLL_RUNS, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          periodStart: start.toISOString(),
          periodEnd: end.toISOString()
        })
      });
      if (res.ok) fetchRuns();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="p-8 text-center text-text-faint">Loading Payroll Cycles...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-bold text-text-main">Payroll Cycles</h3>
        <Button onClick={initiatePayroll} size="sm"><Plus className="w-4 h-4 mr-2" />New Payroll Run</Button>
      </div>
      <div className="grid grid-cols-1 gap-4">
        {runs.map((run) => (
          <Card key={run.id} variant="glass" className="p-5 flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-text-main">Payroll Period: {new Date(run.periodStart).toLocaleDateString()} - {new Date(run.periodEnd).toLocaleDateString()}</p>
              <p className="text-xs text-text-faint mt-1">Status: <span className="text-primary font-bold uppercase">{run.status}</span> | {run._count.payslips} Payslips</p>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-text-main">₹{run.totalAmount.toLocaleString()}</p>
              <Button variant="outline" size="sm" className="mt-2 h-8 text-[10px] font-bold uppercase">View Details</Button>
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
          <div className={cn("p-2.5 rounded-xl bg-surface/80 border border-border/30", color)}><Icon className="w-5 h-5" /></div>
          <div><p className="text-xs font-semibold text-text-muted uppercase tracking-wider">{title}</p><p className="text-xl font-bold text-text-main mt-0.5">{value}</p></div>
        </div>
      </Card>
    </motion.div>
  );
}

"use client";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Button from "@/components/ui/button";
import { motion } from "framer-motion";
import { 
  Users, 
  UserCheck, 
  UserMinus, 
  Plus, 
  Search,
  Filter,
  MoreHorizontal
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function HRPage() {
  const [tab, setTab] = useState("employees");

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-text-main tracking-tight">Human Resources</h1>
          <p className="text-text-muted mt-1">Manage your workforce, payroll, and performance.</p>
        </div>
        <Button className="w-fit">
          <Plus className="w-4 h-4 mr-2" />
          Onboard Employee
        </Button>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MiniStat title="Total Staff" value="1,240" icon={Users} color="text-blue-500" />
        <MiniStat title="On Duty" value="1,182" icon={UserCheck} color="text-emerald-500" />
        <MiniStat title="On Leave" value="58" icon={UserMinus} color="text-amber-500" />
      </div>

      {/* TABS */}
      <div className="flex items-center gap-1 p-1 bg-surface border border-border rounded-xl w-fit">
        {["employees", "departments", "payroll", "attendance"].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "px-4 py-2 text-sm font-medium rounded-lg transition-all capitalize",
              tab === t ? "bg-card text-primary shadow-sm" : "text-text-muted hover:text-text-main"
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {/* TABLE AREA */}
      <Card variant="default" className="overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-6 gap-4 border-b border-border bg-card/50">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input 
              placeholder="Search employees..." 
              className="w-full bg-surface border border-border rounded-lg pl-10 pr-4 py-2 text-sm outline-none focus:border-primary/50 transition-all"
            />
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </Button>
            <Button variant="outline" size="sm">
              Export
            </Button>
          </div>
        </div>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface/50 border-b border-border">
                <th className="px-6 py-4 text-xs font-semibold text-text-muted uppercase tracking-wider">Employee</th>
                <th className="px-6 py-4 text-xs font-semibold text-text-muted uppercase tracking-wider">Department</th>
                <th className="px-6 py-4 text-xs font-semibold text-text-muted uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-semibold text-text-muted uppercase tracking-wider">Joining Date</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {[
                { name: "Arjun Sharma", role: "Sr. Engineer", dept: "Technology", status: "Active", date: "Jan 12, 2024" },
                { name: "Priya Patel", role: "Product Manager", dept: "Product", status: "Active", date: "Mar 05, 2024" },
                { name: "Rahul Verma", role: "HR Specialist", dept: "HR", status: "On Leave", date: "May 20, 2023" },
                { name: "Ananya Iyer", role: "UX Designer", dept: "Design", status: "Active", date: "Oct 15, 2024" },
              ].map((emp, i) => (
                <tr key={i} className="hover:bg-surface/30 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                        {emp.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-text-main">{emp.name}</p>
                        <p className="text-xs text-text-muted">{emp.role}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-text-main">{emp.dept}</td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider",
                      emp.status === "Active" ? "bg-emerald-500/10 text-emerald-500" : "bg-amber-500/10 text-amber-500"
                    )}>
                      {emp.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-text-muted">{emp.date}</td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-text-muted hover:text-text-main transition-colors">
                      <MoreHorizontal className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}

function MiniStat({ title, value, icon: Icon, color }: any) {
  return (
    <Card variant="glass" className="flex items-center gap-4 p-4 border-l-4 border-l-primary/50">
      <div className={cn("p-2 rounded-lg bg-surface", color)}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-xs font-medium text-text-muted">{title}</p>
        <p className="text-xl font-bold text-text-main">{value}</p>
      </div>
    </Card>
  );
}

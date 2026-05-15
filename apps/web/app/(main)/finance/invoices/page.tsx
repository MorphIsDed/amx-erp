"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Plus, 
  Search, 
  Filter, 
  Download, 
  MoreHorizontal,
  FileText,
  CheckCircle2,
  Clock,
  AlertCircle
} from "lucide-react";
import { cn } from "@/lib/utils";

const invoices = [
  { id: "INV-2024-001", client: "Acme Corp", amount: "₹45,000", status: "Paid", date: "May 10, 2024" },
  { id: "INV-2024-002", client: "Global Tech", amount: "₹120,500", status: "Sent", date: "May 12, 2024" },
  { id: "INV-2024-003", client: "SoftBank", amount: "₹82,000", status: "Overdue", date: "May 05, 2024" },
  { id: "INV-2024-004", client: "TCS", amount: "₹15,200", status: "Draft", date: "May 14, 2024" },
  { id: "INV-2024-005", client: "Reliance", amount: "₹210,000", status: "Paid", date: "May 01, 2024" },
];

export default function InvoicesPage() {
  const [filter, setFilter] = useState("all");

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-text-main tracking-tight">Invoices</h1>
          <p className="text-text-muted mt-1">Manage billing and track payments.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Create Invoice
          </Button>
        </div>
      </div>

      {/* FILTER BAR */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-surface border border-border p-2 rounded-xl">
        <div className="flex items-center gap-1">
          {["all", "sent", "paid", "overdue", "draft"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "px-4 py-1.5 text-xs font-bold rounded-lg transition-all capitalize",
                filter === f ? "bg-card text-primary shadow-sm" : "text-text-muted hover:text-text-main"
              )}
            >
              {f}
            </button>
          ))}
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input 
            placeholder="Search invoices..." 
            className="w-full bg-card border border-border rounded-lg pl-10 pr-4 py-1.5 text-sm outline-none focus:border-primary/50"
          />
        </div>
      </div>

      {/* INVOICE LIST */}
      <Card variant="default" className="overflow-hidden">
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface/50 border-b border-border">
                <th className="px-6 py-4 text-[10px] font-bold text-text-muted uppercase tracking-widest">Invoice</th>
                <th className="px-6 py-4 text-[10px] font-bold text-text-muted uppercase tracking-widest">Client</th>
                <th className="px-6 py-4 text-[10px] font-bold text-text-muted uppercase tracking-widest">Amount</th>
                <th className="px-6 py-4 text-[10px] font-bold text-text-muted uppercase tracking-widest">Due Date</th>
                <th className="px-6 py-4 text-[10px] font-bold text-text-muted uppercase tracking-widest">Status</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-surface/30 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-surface border border-border flex items-center justify-center text-text-muted group-hover:text-primary transition-colors">
                        <FileText className="w-4 h-4" />
                      </div>
                      <span className="text-sm font-bold text-text-main">{inv.id}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-medium text-text-main">{inv.client}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-bold text-text-main">{inv.amount}</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-text-muted">{inv.date}</td>
                  <td className="px-6 py-4">
                    <StatusBadge status={inv.status} />
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-2 rounded-lg hover:bg-surface text-text-muted hover:text-text-main transition-colors">
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

function StatusBadge({ status }: { status: string }) {
  const styles: any = {
    Paid: "bg-emerald-500/10 text-emerald-500",
    Sent: "bg-blue-500/10 text-blue-500",
    Overdue: "bg-danger/10 text-danger",
    Draft: "bg-text-muted/10 text-text-muted",
  };

  const icons: any = {
    Paid: <CheckCircle2 className="w-3 h-3 mr-1.5" />,
    Sent: <Clock className="w-3 h-3 mr-1.5" />,
    Overdue: <AlertCircle className="w-3 h-3 mr-1.5" />,
    Draft: <FileText className="w-3 h-3 mr-1.5" />,
  };

  return (
    <div className={cn(
      "inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider",
      styles[status]
    )}>
      {icons[status]}
      {status}
    </div>
  );
}

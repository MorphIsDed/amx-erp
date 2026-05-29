"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { useList } from "@/hooks/use-crud";
import { Invoice } from "@repo/db";
import { 
  Plus, 
  Search, 
  Download, 
  MoreHorizontal,
  FileText,
  CheckCircle2,
  Clock,
  AlertCircle
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function InvoicesPage() {
  const [filter, setFilter] = useState("all");
  
  // Use generic React Query hook for invoices
  const { data: response, isLoading } = useList<Invoice>("finance/invoices");
  const invoices = response?.data || [];

  const filteredInvoices = invoices.filter(inv => {
    if (filter === "all") return true;
    return inv.status.toLowerCase() === filter.toLowerCase();
  });

  const columns = [
    {
      key: 'invoiceNumber',
      header: 'Invoice',
      cell: (item: Invoice) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-surface border border-border flex items-center justify-center text-text-muted">
            <FileText className="w-4 h-4" />
          </div>
          <span className="text-sm font-bold text-text-main">{item.invoiceNumber}</span>
        </div>
      ),
    },
    {
      key: 'clientName',
      header: 'Client',
      cell: (item: Invoice) => (
        <span className="text-sm font-medium text-text-main">{item.clientName}</span>
      ),
    },
    {
      key: 'totalAmount',
      header: 'Amount',
      cell: (item: Invoice) => (
        <span className="text-sm font-bold text-text-main">{item.currency} {item.totalAmount.toFixed(2)}</span>
      ),
    },
    {
      key: 'dueDate',
      header: 'Due Date',
      cell: (item: Invoice) => (
        <span className="text-sm text-text-muted">{new Date(item.dueDate).toLocaleDateString()}</span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      cell: (item: Invoice) => <StatusBadge status={item.status} />,
    },
    {
      key: 'actions',
      header: '',
      align: 'right' as const,
      cell: () => (
        <button className="p-2 rounded-lg hover:bg-surface text-text-muted hover:text-text-main transition-colors">
          <MoreHorizontal className="w-5 h-5" />
        </button>
      ),
    },
  ];

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
          {["all", "draft", "sent", "paid", "partially_paid", "overdue", "cancelled"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "px-4 py-1.5 text-xs font-bold rounded-lg transition-all capitalize",
                filter === f ? "bg-card text-primary shadow-sm" : "text-text-muted hover:text-text-main"
              )}
            >
              {f.replace('_', ' ')}
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
      <DataTable 
        data={filteredInvoices} 
        columns={columns} 
        isLoading={isLoading} 
        emptyTitle="No invoices found"
        emptyDescription="Get started by creating your first invoice."
        emptyActionLabel="Create Invoice"
      />
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: any = {
    PAID: "bg-emerald-500/10 text-emerald-500",
    SENT: "bg-blue-500/10 text-blue-500",
    OVERDUE: "bg-danger/10 text-danger",
    DRAFT: "bg-text-muted/10 text-text-muted",
    PARTIALLY_PAID: "bg-yellow-500/10 text-yellow-500",
    CANCELLED: "bg-gray-500/10 text-gray-500",
  };

  const icons: any = {
    PAID: <CheckCircle2 className="w-3 h-3 mr-1.5" />,
    SENT: <Clock className="w-3 h-3 mr-1.5" />,
    OVERDUE: <AlertCircle className="w-3 h-3 mr-1.5" />,
    DRAFT: <FileText className="w-3 h-3 mr-1.5" />,
    PARTIALLY_PAID: <CheckCircle2 className="w-3 h-3 mr-1.5" />,
    CANCELLED: <AlertCircle className="w-3 h-3 mr-1.5" />,
  };

  return (
    <div className={cn(
      "inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider",
      styles[status] || styles.DRAFT
    )}>
      {icons[status] || icons.DRAFT}
      {status}
    </div>
  );
}

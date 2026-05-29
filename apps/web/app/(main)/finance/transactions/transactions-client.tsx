"use client";

import { useState } from "react";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { useList, useCreate } from "@/hooks/use-crud";
import { Transaction } from "@repo/db";
import { Plus, Download, Search, Filter } from "lucide-react";
import { cn } from "@/lib/utils";

export default function TransactionsClient() {
  const [filter, setFilter] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    description: "",
    amount: "",
    type: "INCOME" as any,
    category: "General",
    date: new Date().toISOString().split("T")[0],
  });

  const { data: response, isLoading } = useList<Transaction>("finance/transactions");
  const transactions = response?.data || [];

  const createMutation = useCreate<Transaction>("finance/transactions");

  const filteredTransactions = transactions.filter(t => {
    if (filter === "all") return true;
    return t.type.toLowerCase() === filter.toLowerCase();
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.description || !formData.amount) return;

    await createMutation.mutateAsync({
      description: formData.description,
      amount: parseFloat(formData.amount),
      type: formData.type,
      category: formData.category,
      date: new Date(formData.date).toISOString(),
    });

    setIsModalOpen(false);
    setFormData({
      description: "",
      amount: "",
      type: "INCOME",
      category: "General",
      date: new Date().toISOString().split("T")[0],
    });
  };

  const columns = [
    {
      key: 'type',
      header: 'Type',
      cell: (item: Transaction) => (
        <span className={cn(
          "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase",
          item.type === "INCOME" ? "bg-emerald-500/10 text-emerald-500" :
          item.type === "EXPENSE" ? "bg-rose-500/10 text-rose-500" :
          "bg-blue-500/10 text-blue-500"
        )}>
          {item.type}
        </span>
      ),
    },
    { key: 'description', header: 'Description' },
    { key: 'category', header: 'Category' },
    {
      key: 'date',
      header: 'Date',
      cell: (item: Transaction) => new Date(item.date).toLocaleDateString(),
    },
    {
      key: 'amount',
      header: 'Amount',
      align: 'right' as const,
      cell: (item: Transaction) => (
        <span className={cn(
          "font-bold",
          item.type === "INCOME" ? "text-emerald-500" : item.type === "EXPENSE" ? "text-rose-500" : "text-text-main"
        )}>
          {item.type === "EXPENSE" ? "-" : "+"}₹{item.amount.toFixed(2)}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-text-main tracking-tight">Transactions</h1>
          <p className="text-text-muted mt-1">Manage all cash flows and ledger entries.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
          <Button onClick={() => setIsModalOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Transaction
          </Button>
        </div>
      </div>

      {/* FILTERS */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-surface border border-border p-2 rounded-xl">
        <div className="flex items-center gap-1">
          {["all", "income", "expense", "transfer"].map((f) => (
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
      </div>

      {/* TABLE */}
      <DataTable 
        data={filteredTransactions} 
        columns={columns} 
        isLoading={isLoading} 
        emptyTitle="No transactions found"
        emptyDescription="Get started by recording your first transaction."
        emptyActionLabel="Add Transaction"
        onEmptyAction={() => setIsModalOpen(true)}
      />

      {/* MODAL */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Record Transaction">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-text-muted">Description</label>
            <input
              type="text"
              required
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-primary/50"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-text-muted">Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({...formData, type: e.target.value as any})}
                className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-primary/50"
              >
                <option value="INCOME">Income</option>
                <option value="EXPENSE">Expense</option>
                <option value="TRANSFER">Transfer</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-text-muted">Category</label>
              <input
                type="text"
                required
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
                className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-primary/50"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-text-muted">Amount</label>
              <input
                type="number"
                required
                value={formData.amount}
                onChange={(e) => setFormData({...formData, amount: e.target.value})}
                className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-primary/50"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-text-muted">Date</label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={(e) => setFormData({...formData, date: e.target.value})}
                className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-primary/50"
              />
            </div>
          </div>
          <div className="flex justify-end pt-4">
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? "Saving..." : "Save Transaction"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

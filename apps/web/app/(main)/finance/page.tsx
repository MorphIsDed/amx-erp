"use client";
import { useState } from "react";
import { useFinanceStore } from "@/lib/store";
import { Modal } from "@/components/ui/modal";
import { StatCard as Card } from "@/components/ui/stat-card";
import { Transaction } from "@/types/transaction";
import { motion } from "framer-motion";
import Button from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type FinanceTransaction = Transaction & { category: string };

export default function FinancePage() {
  const {
    transactions,
    addTransaction,
    deleteTransaction,
    updateTransaction,
  } = useFinanceStore() as unknown as {
    transactions: FinanceTransaction[];
    addTransaction: (tx: FinanceTransaction) => void;
    deleteTransaction: (id: string) => void;
    updateTransaction: (tx: FinanceTransaction) => void;
  };

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | "Paid" | "Pending">("All");

  const [isOpen, setIsOpen] = useState(false);
  const [editTx, setEditTx] = useState<FinanceTransaction | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const [form, setForm] = useState({
    type: "",
    category: "",
    amount: "",
    status: "Pending" as "Paid" | "Pending",
  });

  const filtered = transactions.filter((t) => {
    const matchSearch = t.type.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "All" || t.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const revenue = transactions
    .filter((t) => t.category === "Income")
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const expenses = transactions
    .filter((t) => t.category === "Expense")
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const balance = revenue - expenses;

  const handleSubmit = () => {
    const type = form.type.trim();
    const category = form.category.trim();
    const amountNumber = Number(form.amount);

    if (!type || !category) {
      setFormError("Type and category are required.");
      return;
    }
    if (!Number.isFinite(amountNumber) || amountNumber <= 0) {
      setFormError("Enter a valid amount greater than 0.");
      return;
    }

    if (editTx) {
      updateTransaction({ ...editTx, ...form, type, category, amount: String(amountNumber) });
    } else {
      addTransaction({
        id: Date.now().toString(),
        ...form,
        type,
        category,
        amount: String(amountNumber),
      } as FinanceTransaction);
    }

    setForm({ type: "", category: "", amount: "", status: "Pending" });
    setEditTx(null);
    setIsOpen(false);
    setFormError(null);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 w-full max-w-6xl mx-auto"
    >
      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-semibold">Finance</h1>
        <p className="text-sm text-muted">
          Manage transactions and financial reports
        </p>
      </div>
      {/* KPI */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card title="Revenue" value={`₹${revenue}`} />
        <Card title="Expenses" value={`₹${expenses}`} />
        <Card title="Balance" value={`₹${balance}`} />
      </div>
      {/* FILTER BAR */}
      <div className="flex flex-col sm:flex-row gap-4 sm:items-center">
        <Input
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-card border border-border px-3 py-2 rounded-lg sm:max-w-xs"
        />

        <select
          value={statusFilter}
          onChange={(e) =>
            setStatusFilter(e.target.value as "All" | "Paid" | "Pending")
          }
          className="bg-card border border-border px-3 py-2 rounded-lg sm:w-40"
        >
          <option>All</option>
          <option>Paid</option>
          <option>Pending</option>
        </select>

        <Button
          onClick={() => setIsOpen(true)}
          className="sm:ml-auto bg-card hover:bg-card px-4 py-2 rounded-lg text-text-main w-full sm:w-auto"
        >
          Add Transaction
        </Button>
      </div>
      {/* TABLE */}
      <div className="bg-card border border-border rounded-xl overflow-hidden overflow-x-auto">
        <table className="w-full text-sm min-w-[720px]">
          <thead className="bg-surface text-muted">
            <tr>
              <th className="p-3 text-left">Type</th>
              <th>Category</th>
              <th>Amount</th>
              <th>Status</th>
              <th className="text-right pr-4">Actions</th>
            </tr>
          </thead>

          <tbody>
            {filtered.map((tx) => (
              <tr
                key={tx.id}
                className="border-t border-border hover:bg-card transition"
              >
                <td className="p-3">{tx.type}</td>
                <td>{tx.category}</td>
                <td>₹{tx.amount}</td>
                <td>{tx.status}</td>

                <td className="text-right pr-4 space-x-3">
                  <Button
                    onClick={() => {
                      setEditTx(tx);
                      setForm({
                        type: tx.type,
                        category: tx.category,
                        amount: String(tx.amount),
                        status: tx.status as "Paid" | "Pending",
                      });
                      setIsOpen(true);
                    }}
                    className="text-muted"
                  >
                    Edit
                  </Button>

                  <Button
                    onClick={() => deleteTransaction(tx.id)}
                    className="text-danger"
                  >
                    Delete
                  </Button>
                </td>
              </tr>
            ))}

            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center p-4 text-muted">
                  No transactions found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {/* MODAL */}
      <Modal
        isOpen={isOpen}
        onClose={() => {
          setIsOpen(false);
          setFormError(null);
        }}
        title={editTx ? "Edit Transaction" : "Add Transaction"}
      >
        <div className="space-y-3">
          {formError && <p className="text-sm text-danger">{formError}</p>}
          <Input
            placeholder="Type"
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value })}
            className="w-full bg-card border border-border p-2 rounded"
          />

          <select
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            className="w-full bg-card border border-border p-2 rounded"
          >
            <option value="">Category</option>
            <option value="Income">Income</option>
            <option value="Expense">Expense</option>
          </select>

          <Input
            placeholder="Amount"
            value={form.amount}
            onChange={(e) => setForm({ ...form, amount: e.target.value })}
            className="w-full bg-card border border-border p-2 rounded"
          />

          <Button
            onClick={handleSubmit}
            className="bg-card w-full py-2 rounded text-text-main"
            disabled={!form.type.trim() || !form.category.trim() || !form.amount.trim()}
          >
            Save
          </Button>
        </div>
      </Modal>
    </motion.div>
  );
}


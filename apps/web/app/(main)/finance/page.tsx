"use client";

import { useState } from "react";
import { useFinanceStore } from "@/lib/store";
import Modal from "@/components/ui/modal";
import Card from "@/components/ui/stat-card";
import { Transaction } from "@/types/transaction";
import { motion } from "framer-motion";

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
    if (editTx) {
      updateTransaction({ ...editTx, ...form });
    } else {
      addTransaction({
        id: Date.now().toString(),
        ...form,
      } as FinanceTransaction);
    }

    setForm({ type: "", category: "", amount: "", status: "Pending" });
    setEditTx(null);
    setIsOpen(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-semibold">Finance</h1>
        <p className="text-sm text-[var(--muted)]">
          Manage transactions and financial reports
        </p>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-3 gap-4">
        <Card label="Revenue" value={`₹${revenue}`} />
        <Card label="Expenses" value={`₹${expenses}`} />
        <Card label="Balance" value={`₹${balance}`} />
      </div>

      {/* FILTER BAR */}
      <div className="flex gap-4 items-center">
        <input
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-[#0f172a] border border-[var(--border)] px-3 py-2 rounded-lg"
        />

        <select
          value={statusFilter}
          onChange={(e) =>
            setStatusFilter(e.target.value as "All" | "Paid" | "Pending")
          }
          className="bg-[#0f172a] border border-[var(--border)] px-3 py-2 rounded-lg"
        >
          <option>All</option>
          <option>Paid</option>
          <option>Pending</option>
        </select>

        <button
          onClick={() => setIsOpen(true)}
          className="ml-auto bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-lg text-white"
        >
          Add Transaction
        </button>
      </div>

      {/* TABLE */}
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-[#0f172a] text-gray-300">
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
                className="border-t border-[var(--border)] hover:bg-white/5 transition"
              >
                <td className="p-3">{tx.type}</td>
                <td>{tx.category}</td>
                <td>₹{tx.amount}</td>
                <td>{tx.status}</td>

                <td className="text-right pr-4 space-x-3">
                  <button
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
                    className="text-blue-400"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => deleteTransaction(tx.id)}
                    className="text-red-400"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}

            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center p-4 text-gray-400">
                  No transactions found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL */}
      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <h2 className="mb-4 font-semibold">
          {editTx ? "Edit Transaction" : "Add Transaction"}
        </h2>

        <div className="space-y-3">
          <input
            placeholder="Type"
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value })}
            className="w-full bg-[#0f172a] border border-[var(--border)] p-2 rounded"
          />

          <select
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            className="w-full bg-[#0f172a] border border-[var(--border)] p-2 rounded"
          >
            <option value="">Category</option>
            <option value="Income">Income</option>
            <option value="Expense">Expense</option>
          </select>

          <input
            placeholder="Amount"
            value={form.amount}
            onChange={(e) => setForm({ ...form, amount: e.target.value })}
            className="w-full bg-[#0f172a] border border-[var(--border)] p-2 rounded"
          />

          <button
            onClick={handleSubmit}
            className="bg-blue-500 w-full py-2 rounded text-white"
          >
            Save
          </button>
        </div>
      </Modal>
    </motion.div>
  );
}
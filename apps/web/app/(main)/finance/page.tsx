"use client";

import { useState } from "react";
import { useFinanceStore } from "@/lib/store";
import Modal from "@/components/ui/modal";
import { Transaction } from "@/types/transaction";

export default function FinancePage() {
  const { transactions, addTransaction, deleteTransaction, updateTransaction } =
    useFinanceStore();

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"All" | "Paid" | "Pending">("All");

  const [isOpen, setIsOpen] = useState(false);
  const [editTx, setEditTx] = useState<Transaction | null>(null);

  const [form, setForm] = useState({
    type: "",
    amount: "",
    status: "Pending" as "Paid" | "Pending",
  });

  const filtered = transactions.filter((t) => {
    const matchSearch = t.type.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "All" || t.status === filter;
    return matchSearch && matchFilter;
  });

  const handleSubmit = () => {
    if (editTx) {
      updateTransaction({ ...editTx, ...form });
    } else {
      addTransaction({
        id: Date.now().toString(),
        ...form,
      });
    }

    setForm({ type: "", amount: "", status: "Pending" });
    setEditTx(null);
    setIsOpen(false);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Finance</h1>

      {/* SEARCH + FILTER + BUTTON */}
      <div className="flex gap-4 items-center">
        <input
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border p-2 rounded"
        />

        <select
          value={filter}
          onChange={(e) =>
            setFilter(e.target.value as "All" | "Paid" | "Pending")
          }
          className="border p-2 rounded"
        >
          <option>All</option>
          <option>Paid</option>
          <option>Pending</option>
        </select>

        <button
          onClick={() => setIsOpen(true)}
          className="bg-blue-500 px-4 py-2 text-white rounded"
        >
          Add Transaction
        </button>
      </div>

      {/* TABLE */}
      <table className="w-full border">
        <thead>
          <tr className="bg-gray-200 text-black">
            <th className="p-2">Type</th>
            <th>Amount</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {filtered.map((tx) => (
            <tr key={tx.id} className="border-t">
              <td className="p-2">{tx.type}</td>
              <td>{tx.amount}</td>
              <td>{tx.status}</td>
              <td className="space-x-2">
                <button
                  onClick={() => {
                    setEditTx(tx);
                    setForm({
                      type: tx.type,
                      amount: tx.amount,
                      status: tx.status,
                    });
                    setIsOpen(true);
                  }}
                  className="text-blue-500"
                >
                  Edit
                </button>

                <button
                  onClick={() => deleteTransaction(tx.id)}
                  className="text-red-500"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

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
            className="w-full border p-2"
          />

          <input
            placeholder="Amount"
            value={form.amount}
            onChange={(e) => setForm({ ...form, amount: e.target.value })}
            className="w-full border p-2"
          />

          <select
            value={form.status}
            onChange={(e) =>
              setForm({
                ...form,
                status: e.target.value as "Paid" | "Pending",
              })
            }
            className="w-full border p-2"
          >
            <option value="Paid">Paid</option>
            <option value="Pending">Pending</option>
          </select>

          <button
            onClick={handleSubmit}
            className="bg-blue-500 text-white px-4 py-2 rounded w-full"
          >
            Save
          </button>
        </div>
      </Modal>
    </div>
  );
}
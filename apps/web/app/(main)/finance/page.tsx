"use client";

import { useState } from "react";

const data = [
  { id: 1, type: "Invoice", amount: "₹5000", status: "Paid" },
  { id: 2, type: "Expense", amount: "₹2000", status: "Pending" },
];

export default function FinancePage() {
  const [search, setSearch] = useState("");

  const filtered = data.filter((d) =>
    d.type.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Finance</h1>

      <div className="flex gap-4">
        <input
          placeholder="Search transaction..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border p-2 rounded"
        />

        <button className="bg-blue-500 px-4 py-2 text-white rounded">
          Add Transaction
        </button>
      </div>

      <table className="w-full border">
        <thead>
          <tr className="bg-gray-200 text-black">
            <th>Type</th>
            <th>Amount</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {filtered.map((item) => (
            <tr key={item.id} className="border-t">
              <td>{item.type}</td>
              <td>{item.amount}</td>
              <td>{item.status}</td>
              <td className="space-x-2">
                <button className="text-blue-500">Edit</button>
                <button className="text-red-500">Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
"use client";

import { useState } from "react";
import { useInventoryStore } from "@/lib/store";
import Modal from "@/components/ui/modal";

export default function SupplyChainPage() {
  const { items, addItem, deleteItem } = useInventoryStore();

  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    stock: 0,
    status: "Available" as "Available" | "Low" | "Out",
  });

  const handleSubmit = () => {
    addItem({
      id: Date.now().toString(),
      ...form,
    });

    setForm({ name: "", stock: 0, status: "Available" });
    setIsOpen(false);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Inventory</h1>

      <button
        onClick={() => setIsOpen(true)}
        className="bg-blue-500 px-4 py-2 text-white rounded"
      >
        Add Item
      </button>

      <table className="w-full border">
        <thead>
          <tr className="bg-gray-200 text-black">
            <th>Name</th>
            <th>Stock</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {items.map((i) => (
            <tr key={i.id} className="border-t">
              <td>{i.name}</td>
              <td>{i.stock}</td>
              <td>{i.status}</td>
              <td>
                <button
                  onClick={() => deleteItem(i.id)}
                  className="text-red-500"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <h2 className="mb-4">Add Item</h2>

        <input
          placeholder="Name"
          className="w-full border p-2 mb-2"
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />

        <input
          type="number"
          placeholder="Stock"
          className="w-full border p-2 mb-2"
          onChange={(e) =>
            setForm({ ...form, stock: Number(e.target.value) })
          }
        />

        <select
          className="w-full border p-2 mb-2"
          onChange={(e) =>
            setForm({
              ...form,
              status: e.target.value as "Available" | "Low" | "Out",
            })
          }
        >
          <option>Available</option>
          <option>Low</option>
          <option>Out</option>
        </select>

        <button
          onClick={handleSubmit}
          className="bg-blue-500 text-white w-full p-2 rounded"
        >
          Save
        </button>
      </Modal>
    </div>
  );
}
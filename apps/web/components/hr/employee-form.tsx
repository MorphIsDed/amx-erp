"use client";

import { useState } from "react";
import { useEmployeeStore } from "@/lib/store";

export default function EmployeeForm() {
  const addEmployee = useEmployeeStore((state) => state.addEmployee);

  const [form, setForm] = useState({
    name: "",
    email: "",
    department: "",
    role: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    addEmployee({
      id: Date.now().toString(),
      ...form,
    });

    setForm({
      name: "",
      email: "",
      department: "",
      role: "",
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3 border p-4 rounded">
      <h2 className="font-semibold">Add Employee</h2>

      <input
        placeholder="Name"
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
        className="w-full p-2 border rounded"
      />

      <input
        placeholder="Email"
        value={form.email}
        onChange={(e) => setForm({ ...form, email: e.target.value })}
        className="w-full p-2 border rounded"
      />

      <input
        placeholder="Department"
        value={form.department}
        onChange={(e) => setForm({ ...form, department: e.target.value })}
        className="w-full p-2 border rounded"
      />

      <input
        placeholder="Role"
        value={form.role}
        onChange={(e) => setForm({ ...form, role: e.target.value })}
        className="w-full p-2 border rounded"
      />

      <button
        type="submit"
        className="bg-blue-500 px-4 py-2 rounded text-white"
      >
        Add Employee
      </button>
    </form>
  );
}
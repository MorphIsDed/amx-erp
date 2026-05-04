"use client";

import { useState } from "react";
import { useEmployeeStore } from "@/lib/store";
import Modal from "@/components/ui/modal";
import Table from "@/components/ui/table";
import { Employee } from "@/types/employee"

export default function HRPage() {
  const { employees, addEmployee, deleteEmployee, updateEmployee } =
    useEmployeeStore();

  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [editEmployee, setEditEmployee] = useState<Employee | null>(null);

  const [form, setForm] = useState({
    name: "",
    email: "",
    department: "",
    role: "",
  });

  const filtered = employees.filter((e) =>
    e.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleSubmit = () => {
    if (editEmployee) {
      updateEmployee({ ...editEmployee, ...form });
    } else {
      addEmployee({
        id: Date.now().toString(),
        ...form,
      });
    }

    setForm({ name: "", email: "", department: "", role: "" });
    setEditEmployee(null);
    setIsOpen(false);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">HR Management</h1>

      {/* SEARCH + BUTTON */}
      <div className="flex gap-4">
        <input
          placeholder="Search employee..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-white/5 border border-white/10 px-3 py-2 rounded-lg text-sm outline-none focus:border-blue-500 w-64"
        />

        <button
          onClick={() => setIsOpen(true)}
          className="bg-blue-500 px-4 py-2 text-white rounded"
        >
          Add Employee
        </button>
      </div>

      {/* TABLE */}
      <Table headers={["Name", "Email", "Department", "Role", "Actions"]}>
        {filtered.map((emp) => (
          <tr key={emp.id} className="border-t">
            <td className="p-2">{emp.name}</td>
            <td className="p-2">{emp.email}</td>
            <td className="p-2">{emp.department}</td>
            <td className="p-2">{emp.role}</td>
            <td className="p-2 space-x-2">
              <button
                onClick={() => {
                  setEditEmployee(emp);
                  setForm({
                    name: emp.name,
                    email: emp.email,
                    department: emp.department,
                    role: emp.role,
                  });
                  setIsOpen(true);
                }}
                className="text-blue-500 hover:text-blue-400"
              >
                Edit
              </button>

              <button
                onClick={() => deleteEmployee(emp.id)}
                className="text-red-500 hover:text-red-400"
              >
                Delete
              </button>
            </td>
          </tr>
        ))}
        {filtered.length === 0 && (
          <tr>
            <td colSpan={5} className="p-4 text-center text-gray-400">
              No employees found
            </td>
          </tr>
        )}
      </Table>

      {/* MODAL */}
      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <h2 className="mb-4 font-semibold">
          {editEmployee ? "Edit Employee" : "Add Employee"}
        </h2>

        <div className="space-y-3">
          <input
            placeholder="Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full border p-2 rounded"
          />

          <input
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full border p-2 rounded"
          />

          <input
            placeholder="Department"
            value={form.department}
            onChange={(e) =>
              setForm({ ...form, department: e.target.value })
            }
            className="w-full border p-2 rounded"
          />

          <input
            placeholder="Role"
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
            className="w-full border p-2 rounded"
          />

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
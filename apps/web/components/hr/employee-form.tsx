"use client";
import { useState } from "react";
import { useEmployeeStore } from "@/lib/store";
import Button from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";

export default function EmployeeForm() {
  const addEmployee = useEmployeeStore((state) => state.addEmployee);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: "",
    email: "",
    department: "",
    role: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const name = form.name.trim();
    const email = form.email.trim();

    if (!name || !email) {
      setError("Name and email are required.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Enter a valid email address.");
      return;
    }

    addEmployee({
      id: Date.now().toString(),
      ...form,
      name,
      email,
    });

    setForm({
      name: "",
      email: "",
      department: "",
      role: "",
    });
    setError(null);
  };

  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 8,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        duration: 0.2,
      }}
    >
      <form onSubmit={handleSubmit} className="space-y-3 border border-border bg-card p-4 rounded-lg">
        <h2 className="font-semibold">Add Employee</h2>
        {error && <p className="text-sm text-danger">{error}</p>}
        <Input
          placeholder="Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="w-full"
        />
        <Input
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className="w-full"
        />
        <Input
          placeholder="Department"
          value={form.department}
          onChange={(e) => setForm({ ...form, department: e.target.value })}
          className="w-full"
        />
        <Input
          placeholder="Role"
          value={form.role}
          onChange={(e) => setForm({ ...form, role: e.target.value })}
          className="w-full"
        />
        <Button
          type="submit"
          className="bg-card px-4 py-2 rounded text-text-main"
          disabled={!form.name.trim() || !form.email.trim()}
        >
          Add Employee
        </Button>
      </form>
    </motion.div>
  );
}


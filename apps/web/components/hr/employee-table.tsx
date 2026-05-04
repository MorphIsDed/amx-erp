"use client";

import { useEmployeeStore } from "@/lib/store";

export default function EmployeeTable() {
  const employees = useEmployeeStore((state) => state.employees);

  return (
    <table className="w-full border mt-4">
      <thead>
        <tr className="bg-gray-200 text-black">
          <th className="p-2 text-left">Name</th>
          <th className="p-2 text-left">Email</th>
          <th className="p-2 text-left">Department</th>
          <th className="p-2 text-left">Role</th>
        </tr>
      </thead>

      <tbody>
        {employees.map((emp) => (
          <tr key={emp.id} className="border-t">
            <td className="p-2">{emp.name}</td>
            <td className="p-2">{emp.email}</td>
            <td className="p-2">{emp.department}</td>
            <td className="p-2">{emp.role}</td>
          </tr>
        ))}

        {employees.length === 0 && (
          <tr>
            <td colSpan={4} className="p-4 text-center">
              No employees added
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
}
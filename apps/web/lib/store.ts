import { create } from "zustand";
import { Employee } from "@/types/employee";

interface EmployeeState {
  employees: Employee[];
  addEmployee: (employee: Employee) => void;
  deleteEmployee: (id: string) => void;
  updateEmployee: (employee: Employee) => void;
}

export const useEmployeeStore = create<EmployeeState>((set) => ({
  employees: [],

  addEmployee: (employee) =>
    set((state) => ({
      employees: [...state.employees, employee],
    })),

  deleteEmployee: (id) =>
    set((state) => ({
      employees: state.employees.filter((e) => e.id !== id),
    })),

  updateEmployee: (employee) =>
    set((state) => ({
      employees: state.employees.map((e) =>
        e.id === employee.id ? employee : e
      ),
    })),
}));
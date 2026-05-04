import { create } from "zustand";
import { Employee } from "@/types/employee";
import { Transaction } from "@/types/transaction";
import { InventoryItem } from "@/types/inventory";
import { Task } from "@/types/task";

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

interface FinanceState {
  transactions: Transaction[];
  addTransaction: (t: Transaction) => void;
  deleteTransaction: (id: string) => void;
  updateTransaction: (t: Transaction) => void;
}

export const useFinanceStore = create<FinanceState>((set) => ({
  transactions: [],

  addTransaction: (t) =>
    set((state) => ({
      transactions: [...state.transactions, t],
    })),

  deleteTransaction: (id) =>
    set((state) => ({
      transactions: state.transactions.filter((t) => t.id !== id),
    })),

  updateTransaction: (t) =>
    set((state) => ({
      transactions: state.transactions.map((x) =>
        x.id === t.id ? t : x
      ),
    })),
}));

interface InventoryState {
  items: InventoryItem[];
  addItem: (item: InventoryItem) => void;
  deleteItem: (id: string) => void;
}

export const useInventoryStore = create<InventoryState>((set) => ({
  items: [],

  addItem: (item) =>
    set((state) => ({ items: [...state.items, item] })),

  deleteItem: (id) =>
    set((state) => ({
      items: state.items.filter((i) => i.id !== id),
    })),
}));

interface ProjectState {
  tasks: Task[];
  addTask: (t: Task) => void;
}

export const useProjectStore = create<ProjectState>((set) => ({
  tasks: [],
  addTask: (t) =>
    set((state) => ({ tasks: [...state.tasks, t] })),
}));
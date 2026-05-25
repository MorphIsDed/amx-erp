import { create } from "zustand";
import { Employee } from "@/types/employee";
import { Transaction } from "@/types/transaction";
import { InventoryItem } from "@/types/inventory";
import { Task } from "@/types/task";

// Define a richer interface for Transaction to support details in our Finance UI
export interface RichTransaction extends Transaction {
  description: string;
  category: "Income" | "Expense" | "Payroll" | "Vendor";
  date: string;
  reference: string;
}

// ─── HR & EMPLOYEE STORE ───
interface EmployeeState {
  employees: Employee[];
  addEmployee: (employee: Employee) => void;
  deleteEmployee: (id: string) => void;
  updateEmployee: (employee: Employee) => void;
}

const defaultEmployees: Employee[] = [
  { id: "emp_1", name: "Ananya Sharma", department: "Engineering", role: "Principal Architect", email: "ananya.sharma@acme.com", status: "Active" },
  { id: "emp_2", name: "Rohan Verma", department: "Finance", role: "Treasury Lead", email: "rohan.verma@acme.com", status: "Active" },
  { id: "emp_3", name: "Priya Nair", department: "HR", role: "Talent Acquisition Manager", email: "priya.nair@acme.com", status: "Active" },
  { id: "emp_4", name: "Aditya Roy", department: "Engineering", role: "Fullstack Developer", email: "aditya.roy@acme.com", status: "Active" },
  { id: "emp_5", name: "Kirti Deshmukh", department: "Product", role: "Group Product Manager", email: "kirti.d@acme.com", status: "Active" },
  { id: "emp_6", name: "Vikram Malhotra", department: "Sales", role: "Enterprise Account Director", email: "vikram.m@acme.com", status: "On Leave" },
  { id: "emp_7", name: "Siddharth Sen", department: "Operations", role: "Logistics Specialist", email: "sid.sen@acme.com", status: "Active" },
  { id: "emp_8", name: "Meera Joshi", department: "HR", role: "HR Operations Associate", email: "meera.j@acme.com", status: "Active" },
];

export const useEmployeeStore = create<EmployeeState>((set) => ({
  employees: defaultEmployees,

  addEmployee: (employee) =>
    set((state) => ({
      employees: [employee, ...state.employees],
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

// ─── FINANCE STORE ───
interface FinanceState {
  transactions: RichTransaction[];
  addTransaction: (t: RichTransaction) => void;
  deleteTransaction: (id: string) => void;
  updateTransaction: (t: RichTransaction) => void;
}

const defaultTransactions: RichTransaction[] = [
  { id: "tx_1", type: "Invoice #1042", amount: "₹450,000", status: "Paid", description: "Global Tech Inc - Consulting Services", category: "Income", date: "2026-05-20", reference: "REF-908234" },
  { id: "tx_2", type: "Invoice #1043", amount: "₹820,000", status: "Pending", description: "SoftBank Group - Annual Software License", category: "Income", date: "2026-05-25", reference: "REF-772183" },
  { id: "tx_3", type: "Invoice #1044", amount: "₹120,000", status: "Pending", description: "TCS Solutions - Cloud Integration Support", category: "Income", date: "2026-06-02", reference: "REF-881903" },
  { id: "tx_4", type: "Vendor Payout", amount: "₹340,000", status: "Paid", description: "AWS Hosting - Cloud Infrastructure Payout", category: "Expense", date: "2026-05-18", reference: "REF-449102" },
  { id: "tx_5", type: "Payroll Q2-M1", amount: "₹2,450,000", status: "Paid", description: "Bulk Monthly Employee Payroll Run", category: "Payroll", date: "2026-05-01", reference: "REF-891002" },
  { id: "tx_6", type: "Invoice #1045", amount: "₹1,200,000", status: "Paid", description: "Reliance Ind - Platform Subscriptions", category: "Income", date: "2026-05-10", reference: "REF-992384" },
  { id: "tx_7", type: "Procurement Order", amount: "₹180,000", status: "Pending", description: "Logitech Ltd - Office Sourcing & Hardware", category: "Vendor", date: "2026-05-22", reference: "REF-110293" },
];

export const useFinanceStore = create<FinanceState>((set) => ({
  transactions: defaultTransactions,

  addTransaction: (t) =>
    set((state) => ({
      transactions: [t, ...state.transactions],
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

// ─── INVENTORY STORE ───
export interface RichInventoryItem extends InventoryItem {
  sku: string;
  category: "Electronics" | "Office" | "Furniture" | "Networking";
  price: number;
  warehouse: "Mumbai Hub" | "Bengaluru Facility" | "Delhi Depot";
  lastUpdated: string;
}

interface InventoryState {
  items: RichInventoryItem[];
  addItem: (item: RichInventoryItem) => void;
  deleteItem: (id: string) => void;
  updateItem: (item: RichInventoryItem) => void;
}

const defaultInventory: RichInventoryItem[] = [
  { id: "inv_1", name: "Enterprise Server Rack 42U", sku: "SKU-SR-42U", category: "Networking", price: 145000, stock: 12, warehouse: "Mumbai Hub", lastUpdated: "2026-05-24" },
  { id: "inv_2", name: "Apple MacBook Pro 16\" M3", sku: "SKU-MBP-16M3", category: "Electronics", price: 249000, stock: 45, warehouse: "Bengaluru Facility", lastUpdated: "2026-05-25" },
  { id: "inv_3", name: "Ergonomic Mesh Chair V2", sku: "SKU-CH-ERGO", category: "Furniture", price: 18500, stock: 85, warehouse: "Delhi Depot", lastUpdated: "2026-05-21" },
  { id: "inv_4", name: "Dell UltraSharp 32\" 4K", sku: "SKU-MN-DELL32", category: "Electronics", price: 78000, stock: 30, warehouse: "Bengaluru Facility", lastUpdated: "2026-05-23" },
  { id: "inv_5", name: "Cisco Catalyst Switch 9300", sku: "SKU-SW-CS93", category: "Networking", price: 320000, stock: 8, warehouse: "Mumbai Hub", lastUpdated: "2026-05-25" },
  { id: "inv_6", name: "Adjustable Standing Desk", sku: "SKU-DK-STND", category: "Furniture", price: 42000, stock: 22, warehouse: "Delhi Depot", lastUpdated: "2026-05-19" },
];

export const useInventoryStore = create<InventoryState>((set) => ({
  items: defaultInventory,

  addItem: (item) =>
    set((state) => ({ items: [item, ...state.items] })),

  deleteItem: (id) =>
    set((state) => ({
      items: state.items.filter((i) => i.id !== id),
    })),

  updateItem: (item) =>
    set((state) => ({
      items: state.items.map((x) =>
        x.id === item.id ? item : x
      ),
    })),
}));

// ─── PROJECT STORE ───
interface ProjectState {
  tasks: Task[];
  addTask: (t: Task) => void;
  updateTask: (t: Task) => void;
}

export const useProjectStore = create<ProjectState>((set) => ({
  tasks: [],

  addTask: (t) =>
    set((state) => ({ tasks: [...state.tasks, t] })),

  updateTask: (t) =>
    set((state) => ({
      tasks: state.tasks.map((x) =>
        x.id === t.id ? t : x
      ),
    })),
}));
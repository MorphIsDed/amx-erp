"use server";

import { revalidatePath } from "next/cache";

// --- EMPLOYEES ---
export async function getEmployees(): Promise<any[]> {
  return [];
}

export async function createEmployee(data: any): Promise<any> {
  revalidatePath("/hr");
  return { id: "1", ...data };
}

export async function updateEmployeeStatus(id: string, status: string): Promise<any> {
  revalidatePath("/hr");
  return { id, status };
}

export async function deleteEmployee(id: string) {
  revalidatePath("/hr");
}

// --- FINANCE ---
export async function getTransactions(): Promise<any[]> {
  return [];
}

export async function createTransaction(data: any): Promise<any> {
  revalidatePath("/finance");
  return { id: "1", ...data };
}

export async function updateTransactionStatus(id: string, status: string): Promise<any> {
  revalidatePath("/finance");
  return { id, status };
}

// --- INVENTORY ---
export async function getInventory(): Promise<any[]> {
  return [];
}

export async function createInventoryItem(data: any): Promise<any> {
  revalidatePath("/supply-chain/inventory");
  return { id: "1", ...data };
}

export async function updateInventoryStock(id: string, stock: number): Promise<any> {
  revalidatePath("/supply-chain/inventory");
  return { id, stock };
}

// --- PURCHASE ORDERS ---
export async function getPurchaseOrders(): Promise<any[]> {
  return [];
}

export async function createPurchaseOrder(data: any): Promise<any> {
  revalidatePath("/supply-chain/purchase-orders");
  return { id: "1", ...data };
}

export async function updatePurchaseOrderStatus(id: string, status: string): Promise<any> {
  revalidatePath("/supply-chain/purchase-orders");
  return { id, status };
}

export async function approvePurchaseOrder(id: string) {
  return updatePurchaseOrderStatus(id, "ORDERED");
}

export async function receivePurchaseOrder(id: string) {
  return updatePurchaseOrderStatus(id, "RECEIVED");
}


"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// --- EMPLOYEES ---
export async function getEmployees() {
  return await prisma.employee.findMany({ orderBy: { createdAt: "desc" } });
}

export async function createEmployee(data: { name: string; department: string; role: string; email: string; status: string }) {
  const employee = await prisma.employee.create({ data });
  revalidatePath("/hr");
  return employee;
}

export async function updateEmployeeStatus(id: string, status: string) {
  const employee = await prisma.employee.update({ where: { id }, data: { status } });
  revalidatePath("/hr");
  return employee;
}

export async function deleteEmployee(id: string) {
  await prisma.employee.delete({ where: { id } });
  revalidatePath("/hr");
}

// --- FINANCE ---
export async function getTransactions() {
  return await prisma.transaction.findMany({ orderBy: { date: "desc" } });
}

export async function createTransaction(data: { type: string; amount: string; status: string; description: string; category: string; date: string; reference: string }) {
  const tx = await prisma.transaction.create({ data });
  revalidatePath("/finance");
  return tx;
}

export async function updateTransactionStatus(id: string, status: string) {
  const tx = await prisma.transaction.update({ where: { id }, data: { status } });
  revalidatePath("/finance");
  return tx;
}

// --- INVENTORY ---
export async function getInventory() {
  return await prisma.inventoryItem.findMany({ orderBy: { name: "asc" } });
}

export async function createInventoryItem(data: { name: string; sku: string; category: string; price: number; stock: number; warehouse: string; lastUpdated: string }) {
  const item = await prisma.inventoryItem.create({ data });
  revalidatePath("/supply-chain/inventory");
  return item;
}

export async function updateInventoryStock(id: string, stock: number) {
  const item = await prisma.inventoryItem.update({ where: { id }, data: { stock, lastUpdated: new Date().toISOString().split("T")[0] } });
  revalidatePath("/supply-chain/inventory");
  return item;
}

// --- PURCHASE ORDERS ---
export async function getPurchaseOrders() {
  return await prisma.purchaseOrder.findMany({ orderBy: { createdAt: "desc" } });
}

export async function createPurchaseOrder(data: { poNumber: string; vendorName: string; warehouseName: string; itemName: string; quantity: number; totalAmount: number; status: string }) {
  const po = await prisma.purchaseOrder.create({ 
    data: {
      ...data,
      createdAt: new Date().toISOString().split("T")[0],
    }
  });
  revalidatePath("/supply-chain/purchase-orders");
  return po;
}

export async function updatePurchaseOrderStatus(id: string, status: string) {
  const po = await prisma.purchaseOrder.update({ where: { id }, data: { status } });
  revalidatePath("/supply-chain/purchase-orders");
  return po;
}

import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import "dotenv/config";

const adapter = new PrismaLibSql({ url: "file:./dev.db" });
const prisma = new PrismaClient({ adapter });

const defaultEmployees = [
  { name: "Ananya Sharma", department: "Engineering", role: "Principal Architect", email: "ananya.sharma@acme.com", status: "Active" },
  { name: "Rohan Verma", department: "Finance", role: "Treasury Lead", email: "rohan.verma@acme.com", status: "Active" },
  { name: "Priya Nair", department: "HR", role: "Talent Acquisition Manager", email: "priya.nair@acme.com", status: "Active" },
  { name: "Aditya Roy", department: "Engineering", role: "Fullstack Developer", email: "aditya.roy@acme.com", status: "Active" },
  { name: "Kirti Deshmukh", department: "Product", role: "Group Product Manager", email: "kirti.d@acme.com", status: "Active" },
  { name: "Vikram Malhotra", department: "Sales", role: "Enterprise Account Director", email: "vikram.m@acme.com", status: "On Leave" },
  { name: "Siddharth Sen", department: "Operations", role: "Logistics Specialist", email: "sid.sen@acme.com", status: "Active" },
  { name: "Meera Joshi", department: "HR", role: "HR Operations Associate", email: "meera.j@acme.com", status: "Active" },
];

const defaultTransactions = [
  { type: "Invoice #1042", amount: "450000", status: "Paid", description: "Global Tech Inc - Consulting Services", category: "Income", date: "2026-05-20", reference: "REF-908234" },
  { type: "Invoice #1043", amount: "820000", status: "Pending", description: "SoftBank Group - Annual Software License", category: "Income", date: "2026-05-25", reference: "REF-772183" },
  { type: "Invoice #1044", amount: "120000", status: "Pending", description: "TCS Solutions - Cloud Integration Support", category: "Income", date: "2026-06-02", reference: "REF-881903" },
  { type: "Vendor Payout", amount: "340000", status: "Paid", description: "AWS Hosting - Cloud Infrastructure Payout", category: "Expense", date: "2026-05-18", reference: "REF-449102" },
  { type: "Payroll Q2-M1", amount: "2450000", status: "Paid", description: "Bulk Monthly Employee Payroll Run", category: "Payroll", date: "2026-05-01", reference: "REF-891002" },
  { type: "Invoice #1045", amount: "1200000", status: "Paid", description: "Reliance Ind - Platform Subscriptions", category: "Income", date: "2026-05-10", reference: "REF-992384" },
  { type: "Procurement Order", amount: "180000", status: "Pending", description: "Logitech Ltd - Office Sourcing & Hardware", category: "Vendor", date: "2026-05-22", reference: "REF-110293" },
];

const defaultInventory = [
  { name: "Enterprise Server Rack 42U", sku: "SKU-SR-42U", category: "Networking", price: 145000, stock: 12, warehouse: "Mumbai Hub", lastUpdated: "2026-05-24" },
  { name: "Apple MacBook Pro 16\" M3", sku: "SKU-MBP-16M3", category: "Electronics", price: 249000, stock: 45, warehouse: "Bengaluru Facility", lastUpdated: "2026-05-25" },
  { name: "Ergonomic Mesh Chair V2", sku: "SKU-CH-ERGO", category: "Furniture", price: 18500, stock: 85, warehouse: "Delhi Depot", lastUpdated: "2026-05-21" },
  { name: "Dell UltraSharp 32\" 4K", sku: "SKU-MN-DELL32", category: "Electronics", price: 78000, stock: 30, warehouse: "Bengaluru Facility", lastUpdated: "2026-05-23" },
  { name: "Cisco Catalyst Switch 9300", sku: "SKU-SW-CS93", category: "Networking", price: 320000, stock: 8, warehouse: "Mumbai Hub", lastUpdated: "2026-05-25" },
  { name: "Adjustable Standing Desk", sku: "SKU-DK-STND", category: "Furniture", price: 42000, stock: 22, warehouse: "Delhi Depot", lastUpdated: "2026-05-19" },
];

const defaultPurchaseOrders = [
  { poNumber: "PO-2026-001", vendorName: "Logitech Logistics", warehouseName: "Mumbai Hub", itemName: "Ergonomic Chairs V2", quantity: 80, totalAmount: 148000, status: "RECEIVED", createdAt: "2026-05-10" },
  { poNumber: "PO-2026-002", vendorName: "Apple Distribution", warehouseName: "Bengaluru Facility", itemName: "MacBook Pro 16 M3", quantity: 15, totalAmount: 3735000, status: "ORDERED", createdAt: "2026-05-18" },
  { poNumber: "PO-2026-003", vendorName: "Dell Commercial", warehouseName: "Bengaluru Facility", itemName: "Dell UltraSharp Monitors", quantity: 20, totalAmount: 1560000, status: "PENDING_APPROVAL", createdAt: "2026-05-22" },
  { poNumber: "PO-2026-004", vendorName: "Cisco Enterprise", warehouseName: "Mumbai Hub", itemName: "Catalyst Switches 9300", quantity: 5, totalAmount: 1600000, status: "ORDERED", createdAt: "2026-05-24" },
  { poNumber: "PO-2026-005", vendorName: "Server Tech Corp", warehouseName: "Delhi Depot", itemName: "Enterprise Server Racks", quantity: 3, totalAmount: 435000, status: "DRAFT", createdAt: "2026-05-25" },
];

async function main() {
  console.log(`Start seeding ...`);
  
  for (const e of defaultEmployees) {
    const employee = await prisma.employee.create({ data: e });
    console.log(`Created employee with id: ${employee.id}`);
  }

  for (const t of defaultTransactions) {
    const transaction = await prisma.transaction.create({ data: t });
    console.log(`Created transaction with id: ${transaction.id}`);
  }

  for (const i of defaultInventory) {
    const inventory = await prisma.inventoryItem.create({ data: i });
    console.log(`Created inventory item with sku: ${inventory.sku}`);
  }

  for (const po of defaultPurchaseOrders) {
    const order = await prisma.purchaseOrder.create({ data: po });
    console.log(`Created PO with number: ${order.poNumber}`);
  }
  
  console.log(`Seeding finished.`);
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })

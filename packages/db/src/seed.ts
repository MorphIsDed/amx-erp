import { PrismaClient, Role, StockMovementType, PurchaseOrderStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash('admin123', 10);

  // 1. Create Tenant
  const tenant = await prisma.tenant.upsert({
    where: { domain: 'amx-erp' },
    update: {},
    create: {
      name: 'AMX Enterprise Solutions',
      domain: 'amx-erp',
    },
  });

  // 2. Create Mock Users
  const mockUsers = [
    { email: 'admin@acme.com', name: 'Global Admin', role: Role.ADMIN },
    { email: 'finance@acme.com', name: 'Finance Manager', role: Role.FINANCE },
    { email: 'hr@acme.com', name: 'HR Manager', role: Role.HR },
    { email: 'inventory@acme.com', name: 'Inventory Lead', role: Role.MANAGER },
    { email: 'guest@acme.com', name: 'Executive Guest', role: Role.EMPLOYEE },
    { email: 'admin@amx-erp.com', name: 'Admin User', role: Role.ADMIN }, // keep existing
  ];

  for (const u of mockUsers) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: {
        email: u.email,
        password,
        name: u.name,
        role: u.role,
        tenantId: tenant.id,
      },
    });
  }

  // 3. Create Warehouses
  const warehouseMumbai = await prisma.warehouse.create({
    data: {
      name: 'Main Hub — Mumbai',
      location: 'Navi Mumbai',
      isDefault: true,
      tenantId: tenant.id,
    },
  });

  const warehouseDelhi = await prisma.warehouse.create({
    data: {
      name: 'North Depot — Delhi',
      location: 'Gurugram',
      tenantId: tenant.id,
    },
  });

  // 4. Create Vendor
  const vendor = await prisma.vendor.create({
    data: {
      name: 'TechLogistics Ltd',
      code: 'VEND-001',
      email: 'sales@techlogistics.com',
      tenantId: tenant.id,
    },
  });

  // 5. Create Products
  const products = [
    { sku: 'LOG-MX3', name: 'Logitech MX Master 3', category: 'Peripherals', unit: 'pcs', price: 8500 },
    { sku: 'MAC-M3P', name: 'MacBook Pro M3 14"', category: 'Laptops', unit: 'pcs', price: 185000 },
    { sku: 'DEL-U27', name: 'Dell UltraSharp 27"', category: 'Monitors', unit: 'pcs', price: 42000 },
    { sku: 'KEY-K2V', name: 'Keychron K2 V2', category: 'Peripherals', unit: 'pcs', price: 9500 },
  ];

  for (const p of products) {
    const product = await prisma.product.create({
      data: {
        ...p,
        tenantId: tenant.id,
        vendorId: vendor.id,
      },
    });

    // Initial Stock Movement (Receipt)
    await prisma.stockMovement.create({
      data: {
        productId: product.id,
        warehouseId: warehouseMumbai.id,
        type: StockMovementType.IN,
        quantity: Math.floor(Math.random() * 100) + 10,
        reason: 'Initial Inventory Setup',
        tenantId: tenant.id,
      },
    });
  }

  console.log('Seed completed successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

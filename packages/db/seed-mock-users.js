const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash('password123', 10);

  // Find or create tenant
  let tenant = await prisma.tenant.findUnique({ where: { domain: 'amx-erp' } });
  if (!tenant) {
    tenant = await prisma.tenant.create({
      data: {
        name: 'AMX Enterprise Solutions',
        domain: 'amx-erp',
      },
    });
  }

  const mockUsers = [
    { email: 'admin@acme.com', name: 'Global Admin', role: 'ADMIN' },
    { email: 'finance@acme.com', name: 'Finance Manager', role: 'FINANCE' },
    { email: 'hr@acme.com', name: 'HR Manager', role: 'HR' },
    { email: 'inventory@acme.com', name: 'Inventory Lead', role: 'MANAGER' },
    { email: 'guest@acme.com', name: 'Executive Guest', role: 'EMPLOYEE' },
  ];

  for (const u of mockUsers) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: {
        password,
        role: u.role,
        tenantId: tenant.id
      },
      create: {
        email: u.email,
        password,
        name: u.name,
        role: u.role,
        tenantId: tenant.id,
      },
    });
    console.log(`Upserted user ${u.email}`);
  }

  console.log('Mock users seeded successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

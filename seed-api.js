const baseUrl = 'http://localhost:3001';

async function seed() {
  console.log("Starting seed via API...");

  try {
    // 1. Register Tenant and Admin
    const tenantRes = await fetch(`${baseUrl}/tenants/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        companyName: 'Acme Corp',
        companyDomain: 'acme',
        adminName: 'Global Admin',
        adminEmail: 'admin@acme.com',
        adminPassword: 'password123'
      })
    });

    let tenantData;
    if (!tenantRes.ok) {
      if (tenantRes.status === 409) {
        console.log("Tenant or admin might already exist. We need to login to get tenantId...");
        const loginRes = await fetch(`${baseUrl}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: 'admin@acme.com', password: 'password123' })
        });
        if (loginRes.ok) {
          const loginData = await loginRes.json();
          const parsedToken = JSON.parse(Buffer.from(loginData.access_token.split('.')[1], 'base64').toString());
          tenantData = { id: loginData.user?.tenantId || parsedToken.tenantId };
          console.log("Got existing tenantId: " + tenantData.id);
        } else {
          const err = await loginRes.text();
          throw new Error("Failed to login existing admin: " + err);
        }
      } else {
        const err = await tenantRes.text();
        throw new Error("Failed to register tenant: " + err);
      }
    } else {
      const resData = await tenantRes.json();
      tenantData = resData; // resData might be the tenant itself or { tenant }
      if (!tenantData.id && tenantData.tenant) tenantData = tenantData.tenant;
      console.log("Tenant registered! ID: " + tenantData.id);
    }

    const tenantId = tenantData.id;
    if (!tenantId) throw new Error("Could not find tenantId in response");

    // 2. Register other mock users
    const mockUsers = [
      { email: 'finance@acme.com', name: 'Finance Manager', role: 'FINANCE', password: 'password123' },
      { email: 'hr@acme.com', name: 'HR Manager', role: 'HR', password: 'password123' },
      { email: 'inventory@acme.com', name: 'Inventory Lead', role: 'MANAGER', password: 'password123' },
      { email: 'guest@acme.com', name: 'Executive Guest', role: 'EMPLOYEE', password: 'password123' },
    ];

    for (const u of mockUsers) {
      const registerRes = await fetch(`${baseUrl}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: u.name,
          email: u.email,
          password: u.password,
          tenantId: tenantId,
          role: u.role
        })
      });

      if (!registerRes.ok) {
        if (registerRes.status === 409) {
          console.log(`User ${u.email} already exists. Skipping.`);
        } else {
          const err = await registerRes.text();
          console.error(`Failed to register ${u.email}:`, err);
        }
      } else {
        console.log(`Registered user ${u.email} successfully.`);
      }
    }

    console.log("Mock users seeded successfully.");
  } catch (err) {
    console.error(err);
  }
}

seed();

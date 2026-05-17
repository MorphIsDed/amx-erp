export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export const API_ENDPOINTS = {
  NOTIFICATIONS: `${API_BASE_URL}/notifications`,
  NOTIFICATIONS_UNREAD: `${API_BASE_URL}/notifications/unread-count`,
  NOTIFICATIONS_STREAM: (token: string) => `${API_BASE_URL}/notifications/stream?token=${token}`,
  NOTIFICATIONS_READ: (id: string) => `${API_BASE_URL}/notifications/${id}/read`,
  ACTIVITY: `${API_BASE_URL}/activity`,
  ACTIVITY_STREAM: (token: string) => `${API_BASE_URL}/activity/stream?token=${token}`,
  REGISTER: `${API_BASE_URL}/tenants/register`,
  PRODUCTS: `${API_BASE_URL}/inventory/products`,
  PRODUCT_STOCK: (id: string) => `${API_BASE_URL}/inventory/products/${id}/stock`,
  INVENTORY_STREAM: (token: string) => `${API_BASE_URL}/inventory/products/stream?token=${token}`,
  WAREHOUSES: `${API_BASE_URL}/inventory/warehouses`,
  PURCHASE_ORDERS: `${API_BASE_URL}/inventory/purchase-orders`,
  PURCHASE_ORDER_STATUS: (id: string) => `${API_BASE_URL}/inventory/purchase-orders/${id}/status`,
  HR_EMPLOYEES: `${API_BASE_URL}/hr/employees`,
  HR_PAYROLL_RUNS: `${API_BASE_URL}/hr/payroll/runs`,
  HR_PAYROLL_PROCESS: (id: string) => `${API_BASE_URL}/hr/payroll/runs/${id}/process`,
  DASHBOARD_OVERVIEW: `${API_BASE_URL}/analytics/dashboard/overview`,
};

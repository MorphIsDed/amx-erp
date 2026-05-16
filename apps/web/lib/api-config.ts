export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export const API_ENDPOINTS = {
  NOTIFICATIONS: `${API_BASE_URL}/notifications`,
  NOTIFICATIONS_UNREAD: `${API_BASE_URL}/notifications/unread-count`,
  NOTIFICATIONS_STREAM: (token: string) => `${API_BASE_URL}/notifications/stream?token=${token}`,
  NOTIFICATIONS_READ: (id: string) => `${API_BASE_URL}/notifications/${id}/read`,
  ACTIVITY: `${API_BASE_URL}/activity`,
  REGISTER: `${API_BASE_URL}/tenants/register`,
  PRODUCTS: `${API_BASE_URL}/inventory/products`,
  PRODUCT_STOCK: (id: string) => `${API_BASE_URL}/inventory/products/${id}/stock`,
  WAREHOUSES: `${API_BASE_URL}/inventory/warehouses`,
};

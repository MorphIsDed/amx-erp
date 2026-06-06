export type PurchaseOrderStatus = 
  | 'DRAFT' 
  | 'PENDING_APPROVAL' 
  | 'APPROVED' 
  | 'ORDERED' 
  | 'RECEIVED' 
  | 'PARTIALLY_RECEIVED' 
  | 'CANCELLED';

export interface PurchaseOrderItem {
  id: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  productId: string;
  product?: {
    id: string;
    sku: string;
    name: string;
    price: number;
  };
  purchaseOrderId: string;
  createdAt: string;
  updatedAt: string;
}

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  status: PurchaseOrderStatus;
  orderDate: string | Date;
  expectedDate?: string | Date | null;
  totalAmount: number;
  notes?: string | null;
  tenantId: string;
  vendorId: string;
  vendor?: {
    id: string;
    name: string;
    code: string;
    email: string;
  };
  warehouseId: string;
  warehouse?: {
    id: string;
    name: string;
    location?: string | null;
  };
  items: PurchaseOrderItem[];
  createdAt: string;
  updatedAt: string;
}

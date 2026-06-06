export interface Product {
  id: string;
  sku: string;
  name: string;
  description?: string | null;
  category?: string | null;
  unit: string;
  price: number;
  vendorId?: string | null;
  vendor?: {
    id: string;
    name: string;
    code: string;
    email: string;
  } | null;
  reorderLevel: number;
  createdAt: string;
  updatedAt: string;
}

export type StockMovementType = 'IN' | 'OUT' | 'ADJUSTMENT' | 'TRANSFER';

export interface StockMovement {
  id: string;
  type: StockMovementType;
  quantity: number;
  reference?: string | null;
  reason?: string | null;
  productId: string;
  product?: Product;
  warehouseId: string;
  warehouse?: {
    id: string;
    name: string;
    location?: string | null;
  };
  userId?: string | null;
  createdAt: string;
}

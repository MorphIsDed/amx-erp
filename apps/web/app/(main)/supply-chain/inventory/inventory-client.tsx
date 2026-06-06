"use client";

import { useState } from "react";
import { Product, StockMovement } from "@/types/product";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Button from "@/components/ui/button";
import { 
  Plus, 
  Search, 
  Download, 
  Package, 
  AlertTriangle, 
  Warehouse, 
  Boxes, 
  TrendingUp,
  Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Modal } from "@/components/ui/modal";
import { motion, AnimatePresence } from "framer-motion";
import { exportToCsv } from "@/lib/export-utils";
import { useList, useCreate } from "@/hooks/use-crud";
import { ApiClient } from "@/services/api-client";

const container: any = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } };
const item: any = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } } };

export default function InventoryClient() {
  // Real inventory data fetching
  const { data: productsRes, isLoading: isProductsLoading, isError, refetch } = useList<Product>('inventory/products');
  const products = productsRes?.data || [];

  // Real warehouses fetching
  const { data: warehousesRes, isLoading: isWarehousesLoading } = useList<{ id: string; name: string; location?: string }>('inventory/warehouses');
  const warehouses = warehousesRes?.data || [];

  // Mutations
  const createProductMutation = useCreate<Product>('inventory/products');

  // Table search & filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [warehouseFilter, setWarehouseFilter] = useState("all");
  const [stockStatusFilter, setStockStatusFilter] = useState("all");

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Selected item for stock adjustment
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [adjustmentValue, setAdjustmentValue] = useState("");
  const [adjustingWarehouseId, setAdjustingWarehouseId] = useState("");
  const [isAdjusting, setIsAdjusting] = useState(false);
  
  // Add new product modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: "",
    sku: "",
    category: "Electronics",
    price: "",
    stock: "10",
    warehouseId: "",
  });

  const [successToast, setSuccessToast] = useState("");

  // Dynamically map categories from products
  const categories = Array.from(new Set(products.map(p => p.category).filter((c): c is string => !!c)));

  // Extract vendors dynamically from product list
  const vendors = Array.from(
    new Map(
      products
        .filter(p => p.vendor)
        .map(p => [p.vendor!.id, p.vendor!.name])
    ).entries()
  ).map(([id, name]) => ({ id, name }));

  // Statistics counters
  const totalValuation = products.reduce((sum, p) => sum + (p.price * (p as any).stock), 0);
  const activeSKUs = products.length;
  const lowStockCount = products.filter(p => (p as any).stock > 0 && (p as any).stock <= 25).length;
  const outOfStockCount = products.filter(p => (p as any).stock === 0).length;

  // Filter products list
  const filteredProducts = products.filter(p => {
    const matchesSearch = 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = categoryFilter === "all" || p.category === categoryFilter;
    const matchesWarehouse = warehouseFilter === "all" || (p as any).warehouseId === warehouseFilter;
    
    let matchesStatus = true;
    const stock = (p as any).stock || 0;
    if (stockStatusFilter === "inStock") matchesStatus = stock > 25;
    else if (stockStatusFilter === "lowStock") matchesStatus = stock > 0 && stock <= 25;
    else if (stockStatusFilter === "outOfStock") matchesStatus = stock === 0;

    return matchesSearch && matchesCategory && matchesWarehouse && matchesStatus;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage) || 1;
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  // Adjust stock level handler
  const handleStockAdjustment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct || !adjustmentValue || !adjustingWarehouseId) return;

    const targetStock = parseInt(adjustmentValue);
    if (isNaN(targetStock) || targetStock < 0) return;

    const currentStock = (selectedProduct as any).stock || 0;
    const diff = targetStock - currentStock;
    if (diff === 0) {
      setIsAdjustModalOpen(false);
      return;
    }

    setIsAdjusting(true);
    const movementType = diff > 0 ? 'IN' : 'OUT';
    const quantity = Math.abs(diff);

    try {
      await ApiClient.post('/inventory/movements', {
        productId: selectedProduct.id,
        warehouseId: adjustingWarehouseId,
        type: movementType,
        quantity,
        reason: 'Stock level manually adjusted in UI dashboard',
      });

      setSuccessToast(`Stock level for "${selectedProduct.name}" updated successfully.`);
      setTimeout(() => setSuccessToast(""), 4000);
      refetch();
      setIsAdjustModalOpen(false);
      setSelectedProduct(null);
      setAdjustmentValue("");
    } catch (err) {
      console.error("Failed to adjust stock:", err);
    } finally {
      setIsAdjusting(false);
    }
  };

  // Onboard new product
  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProduct.name || !newProduct.sku || !newProduct.price || !newProduct.warehouseId) return;

    const warehouseId = newProduct.warehouseId;
    const initialQty = parseInt(newProduct.stock) || 0;

    try {
      // Step 1: Create product
      const created = await createProductMutation.mutateAsync({
        name: newProduct.name,
        sku: newProduct.sku,
        category: newProduct.category,
        price: parseFloat(newProduct.price) || 0,
        unit: 'pcs',
        vendorId: vendors[0]?.id || null, // Default to first vendor if available
      });

      // Step 2: Record initial stock movement if opening stock > 0
      if (initialQty > 0) {
        await ApiClient.post('/inventory/movements', {
          productId: created.data.id,
          warehouseId,
          type: 'IN',
          quantity: initialQty,
          reason: 'Initial opening stock receipt',
        });
      }

      setSuccessToast(`Product "${newProduct.name}" successfully added to catalog.`);
      setTimeout(() => setSuccessToast(""), 4000);
      refetch();
      setIsAddModalOpen(false);
      setNewProduct({
        name: "",
        sku: "",
        category: "Electronics",
        price: "",
        stock: "10",
        warehouseId: "",
      });
      setCurrentPage(1);
    } catch (err) {
      console.error("Failed to onboard product:", err);
    }
  };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-8 max-w-7xl mx-auto pb-12">
      
      {/* HEADER */}
      <motion.div variants={item} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            <span className="text-gradient-primary">Inventory</span>{" "}
            <span className="text-text-main">Master</span>
          </h1>
          <p className="text-text-muted mt-2 text-sm">
            Live catalog tracking, warehousing operations, and SKU level stock controls.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => exportToCsv("inventory_ledger", filteredProducts)}>
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
          <Button onClick={() => setIsAddModalOpen(true)} className="shadow-lg shadow-primary/10">
            <Plus className="w-4 h-4 mr-2" />
            Add Product
          </Button>
        </div>
      </motion.div>

      {/* FEEDBACK TOAST */}
      <AnimatePresence>
        {successToast && (
          <motion.div 
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="p-4 bg-primary/[0.08] border border-primary/30 rounded-2xl flex items-center gap-3 text-sm text-primary font-medium shadow-xl backdrop-blur-md"
          >
            <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-slate-950 font-bold">✓</div>
            <div className="flex-1">{successToast}</div>
            <button onClick={() => setSuccessToast("")} className="text-primary hover:opacity-85 text-xs font-semibold">Dismiss</button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* METRICS ROW */}
      <motion.div variants={container} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <MiniStatCard title="Stock Valuation" value={isProductsLoading ? "..." : `₹${(totalValuation / 1000000).toFixed(2)}M`} icon={TrendingUp} color="text-primary" gradient="from-primary/20 to-primary/5" />
        <MiniStatCard title="Active SKUs" value={isProductsLoading ? "..." : activeSKUs.toString()} icon={Boxes} color="text-info" gradient="from-info/20 to-info/5" />
        <MiniStatCard title="Low Stock Items" value={isProductsLoading ? "..." : lowStockCount.toString()} icon={AlertTriangle} color="text-warning" gradient="from-warning/20 to-warning/5" />
        <MiniStatCard title="Out of Stock" value={isProductsLoading ? "..." : outOfStockCount.toString()} icon={Warehouse} color="text-rose" gradient="from-danger/20 to-danger/5" />
      </motion.div>

      {/* FILTERS PANEL */}
      <motion.div variants={item}>
        <Card variant="glass" className="border-border/30 shadow-md">
          <CardContent className="p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            
            {/* Search Input */}
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-faint" />
              <input
                type="text"
                placeholder="Search products by name or SKU code..."
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                className="w-full bg-surface/50 border border-border/30 rounded-xl pl-10 pr-4 py-2.5 text-xs text-text-main outline-none focus:border-primary/50 transition-all"
              />
            </div>

            {/* Select fields */}
            <div className="flex flex-wrap items-center gap-3">
              <select
                value={categoryFilter}
                onChange={(e) => { setCategoryFilter(e.target.value); setCurrentPage(1); }}
                className="bg-card border border-border/30 rounded-xl px-3 py-2 text-xs text-text-main focus:border-primary/50 outline-none cursor-pointer"
              >
                <option value="all">All Categories</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>

              <select
                value={warehouseFilter}
                onChange={(e) => { setWarehouseFilter(e.target.value); setCurrentPage(1); }}
                className="bg-card border border-border/30 rounded-xl px-3 py-2 text-xs text-text-main focus:border-primary/50 outline-none cursor-pointer"
              >
                <option value="all">All Warehouses</option>
                {warehouses.map(w => (
                  <option key={w.id} value={w.id}>{w.name}</option>
                ))}
              </select>

              <select
                value={stockStatusFilter}
                onChange={(e) => { setStockStatusFilter(e.target.value); setCurrentPage(1); }}
                className="bg-card border border-border/30 rounded-xl px-3 py-2 text-xs text-text-main focus:border-primary/50 outline-none cursor-pointer"
              >
                <option value="all">All Stock Statuses</option>
                <option value="inStock">In Stock (&gt;25 units)</option>
                <option value="lowStock">Low Stock (1-25 units)</option>
                <option value="outOfStock">Out of Stock (0 units)</option>
              </select>
            </div>

          </CardContent>
        </Card>
      </motion.div>

      {/* PRODUCTS TABLE */}
      <motion.div variants={item}>
        <Card variant="glass" className="border-border/20 shadow-lg overflow-hidden">
          <CardHeader className="border-b border-border/20 bg-card/10">
            <CardTitle>Inventory Ledger</CardTitle>
            <p className="text-xs text-text-faint mt-1">Primary warehouse ledger listing available quantities and active catalog prices.</p>
          </CardHeader>
          <CardContent className="p-0">
            {isProductsLoading ? (
              <div className="p-12 text-center text-text-faint flex flex-col items-center justify-center gap-2">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <span>Retrieving inventory ledger catalog...</span>
              </div>
            ) : isError ? (
              <div className="p-12 text-center text-danger font-medium">
                Failed to load products. Please check your database state.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-border/15 bg-card/40 text-text-faint font-semibold uppercase tracking-wider">
                      <th className="px-6 py-4">SKU</th>
                      <th className="px-6 py-4">Product Name</th>
                      <th className="px-6 py-4">Category</th>
                      <th className="px-6 py-4">Location</th>
                      <th className="px-6 py-4">Valuation Price</th>
                      <th className="px-6 py-4">Stock Level</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/10">
                    <AnimatePresence mode="popLayout">
                      {paginatedProducts.map((p) => {
                        const stock = (p as any).stock || 0;
                        const isLow = stock > 0 && stock <= 25;
                        const isOut = stock === 0;
                        const warehouseName = warehouses.find(w => w.id === (p as any).warehouseId)?.name || "Main Hub — Mumbai";
                        return (
                          <motion.tr 
                            key={p.id}
                            layout
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="hover:bg-card/30 transition-colors group"
                          >
                            <td className="px-6 py-4">
                              <span className="text-xs font-mono font-bold text-primary px-2.5 py-1 bg-primary/5 rounded border border-primary/10">
                                {p.sku}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded bg-surface border border-border/30 flex items-center justify-center text-text-muted group-hover:text-primary transition-colors">
                                  <Package className="w-4 h-4" />
                                </div>
                                <span className="text-sm font-semibold text-text-main">{p.name}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-text-muted">{p.category || "Unassigned"}</td>
                            <td className="px-6 py-4 text-text-muted">
                              <div className="flex items-center gap-1.5">
                                <Warehouse className="w-3.5 h-3.5 text-text-faint" />
                                {warehouseName}
                              </div>
                            </td>
                            <td className="px-6 py-4 text-text-muted font-mono">₹{p.price.toLocaleString("en-IN")}</td>
                            <td className="px-6 py-4">
                              <div className="flex flex-col max-w-[120px]">
                                <span className="text-xs font-bold text-text-main font-mono">{stock} units</span>
                                <div className="w-24 h-1 bg-border/20 rounded-full mt-1 overflow-hidden">
                                  <div 
                                    className={cn(
                                      "h-full rounded-full",
                                      isOut ? "bg-danger" : isLow ? "bg-warning" : "bg-primary"
                                    )} 
                                    style={{ width: `${Math.min(100, (stock / 150) * 100)}%` }}
                                  />
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  onClick={() => { 
                                    setSelectedProduct(p); 
                                    setAdjustmentValue(stock.toString()); 
                                    setAdjustingWarehouseId((p as any).warehouseId || warehouses[0]?.id || "");
                                    setIsAdjustModalOpen(true); 
                                  }}
                                  className="text-[10px] uppercase font-bold py-1 h-7 cursor-pointer"
                                >
                                  Adjust Stock
                                </Button>
                              </div>
                            </td>
                          </motion.tr>
                        );
                      })}
                    </AnimatePresence>

                    {filteredProducts.length === 0 && (
                      <tr>
                        <td colSpan={7} className="px-6 py-10 text-center text-text-faint font-medium">
                          No product inventories found matching the current selections.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* PAGINATION PANEL */}
            {!isProductsLoading && !isError && (
              <div className="p-4 border-t border-border/15 flex items-center justify-between gap-4 text-text-muted">
                <span className="text-[11px] font-medium">
                  Showing {Math.min(filteredProducts.length, (currentPage - 1) * itemsPerPage + 1)}-{Math.min(filteredProducts.length, currentPage * itemsPerPage)} of {filteredProducts.length} SKU codes
                </span>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    disabled={currentPage === 1}
                    onClick={() => handlePageChange(currentPage - 1)}
                    className="px-2.5 py-1 text-[11px]"
                  >
                    Previous
                  </Button>
                  <div className="flex items-center gap-1 font-mono text-xs font-bold text-text-main px-2">
                    <span>{currentPage}</span>
                    <span className="text-text-faint">/</span>
                    <span className="text-text-faint">{totalPages}</span>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    disabled={currentPage === totalPages}
                    onClick={() => handlePageChange(currentPage + 1)}
                    className="px-2.5 py-1 text-[11px]"
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}

          </CardContent>
        </Card>
      </motion.div>

      {/* ADJUST STOCK LEVEL MODAL */}
      <Modal
        isOpen={isAdjustModalOpen}
        onClose={() => { setIsAdjustModalOpen(false); setSelectedProduct(null); }}
        title={`Adjust Stock: ${selectedProduct?.name}`}
      >
        {selectedProduct && (
          <form onSubmit={handleStockAdjustment} className="space-y-4">
            <div className="p-3 bg-surface/50 border border-border/20 rounded-xl flex justify-between text-xs text-text-muted">
              <span>Current Level: <strong>{(selectedProduct as any).stock || 0} units</strong></span>
              <span>Default Location: <strong>{warehouses.find(w => w.id === (selectedProduct as any).warehouseId)?.name || "Mumbai Hub"}</strong></span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-text-muted">Adjustment Location</label>
                <select
                  required
                  value={adjustingWarehouseId}
                  onChange={(e) => setAdjustingWarehouseId(e.target.value)}
                  className="w-full bg-surface/50 border border-border/40 rounded-xl px-3 py-2 text-xs text-text-main focus:border-primary/50 outline-none cursor-pointer"
                >
                  <option value="" disabled>Select Warehouse</option>
                  {warehouses.map(w => (
                    <option key={w.id} value={w.id}>{w.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-text-muted">Target Quantity</label>
                <input
                  type="number"
                  required
                  min="0"
                  value={adjustmentValue}
                  onChange={(e) => setAdjustmentValue(e.target.value)}
                  placeholder="e.g. 150"
                  className="w-full bg-surface/50 border border-border/40 rounded-xl px-3 py-2 text-xs text-text-main placeholder:text-text-faint/60 focus:border-primary/50 outline-none transition-all"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 pt-3 border-t border-border/10 justify-end">
              <Button type="button" variant="outline" onClick={() => { setIsAdjustModalOpen(false); setSelectedProduct(null); }}>
                Cancel
              </Button>
              <Button type="submit" disabled={isAdjusting}>
                {isAdjusting ? "Adjusting..." : "Apply Stock Level"}
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {/* ADD NEW PRODUCT MODAL */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Catalog SKU"
      >
        <form onSubmit={handleAddProduct} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-text-muted">Product Title</label>
            <input
              type="text"
              required
              placeholder="e.g. Enterprise Router Switch Gigabit"
              value={newProduct.name}
              onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
              className="w-full bg-surface/50 border border-border/40 rounded-xl px-3 py-2 text-xs text-text-main placeholder:text-text-faint/60 focus:border-primary/50 outline-none transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-text-muted">SKU Reference</label>
              <input
                type="text"
                required
                placeholder="SKU-NW-GS90"
                value={newProduct.sku}
                onChange={(e) => setNewProduct({...newProduct, sku: e.target.value})}
                className="w-full bg-surface/50 border border-border/40 rounded-xl px-3 py-2 text-xs text-text-main placeholder:text-text-faint/60 focus:border-primary/50 outline-none transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-text-muted">Product Category</label>
              <select
                value={newProduct.category}
                onChange={(e) => setNewProduct({...newProduct, category: e.target.value as any})}
                className="w-full bg-surface/50 border border-border/40 rounded-xl px-3 py-2 text-xs text-text-main focus:border-primary/50 outline-none cursor-pointer"
              >
                <option value="Electronics">Electronics</option>
                <option value="Office">Office</option>
                <option value="Furniture">Furniture</option>
                <option value="Networking">Networking</option>
                <option value="Peripherals">Peripherals</option>
                <option value="Laptops">Laptops</option>
                <option value="Monitors">Monitors</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-text-muted">Price (INR)</label>
              <input
                type="number"
                required
                placeholder="24500"
                value={newProduct.price}
                onChange={(e) => setNewProduct({...newProduct, price: e.target.value})}
                className="w-full bg-surface/50 border border-border/40 rounded-xl px-3 py-2 text-xs text-text-main placeholder:text-text-faint/60 focus:border-primary/50 outline-none transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-text-muted">Opening Stock</label>
              <input
                type="number"
                required
                placeholder="25"
                value={newProduct.stock}
                onChange={(e) => setNewProduct({...newProduct, stock: e.target.value})}
                className="w-full bg-surface/50 border border-border/40 rounded-xl px-3 py-2 text-xs text-text-main placeholder:text-text-faint/60 focus:border-primary/50 outline-none transition-all"
              />
            </div>

            <div className="space-y-1.5 col-span-1">
              <label className="text-xs font-semibold text-text-muted">Target Warehouse</label>
              <select
                required
                value={newProduct.warehouseId}
                onChange={(e) => setNewProduct({...newProduct, warehouseId: e.target.value})}
                className="w-full bg-surface/50 border border-border/40 rounded-xl px-3 py-2 text-xs text-text-main focus:border-primary/50 outline-none cursor-pointer"
              >
                <option value="" disabled>Select Location</option>
                {warehouses.map(w => (
                  <option key={w.id} value={w.id}>{w.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-3 border-t border-border/10 justify-end">
            <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createProductMutation.isPending}>
              {createProductMutation.isPending ? "Adding SKU..." : "Onboard SKU"}
            </Button>
          </div>
        </form>
      </Modal>

    </motion.div>
  );
}

function MiniStatCard({ title, value, icon: Icon, color, gradient }: any) {
  return (
    <motion.div variants={item}>
      <Card variant="default" className="group hover:-translate-y-0.5 transition-all duration-300 overflow-hidden relative">
        <div className={cn("absolute left-0 top-0 bottom-0 w-[3px] rounded-r-full bg-gradient-to-b opacity-40 group-hover:opacity-80 transition-opacity", gradient)} />
        <div className="flex items-center gap-4 p-5">
          <div className={cn("p-2.5 rounded-xl bg-surface/80 border border-border/30", color)}>
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-text-muted uppercase tracking-wider">{title}</p>
            <p className="text-2xl font-bold text-text-main mt-0.5 font-mono">{value}</p>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

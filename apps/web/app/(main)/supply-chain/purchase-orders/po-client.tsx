"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PurchaseOrder, PurchaseOrderStatus } from "@/types/purchase-order";
import { Product } from "@/types/product";
import { 
  Plus, 
  Search, 
  Download, 
  FileText, 
  Truck, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  PackageCheck, 
  Building, 
  TrendingUp,
  LayoutGrid,
  List,
  Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Modal } from "@/components/ui/modal";
import { POKanbanBoard } from "@/components/dashboard/po-kanban";
import { useList, useCreate, usePatch } from "@/hooks/use-crud";
import { ApiClient } from "@/services/api-client";
import { exportToCsv } from "@/lib/export-utils";

const container: any = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } };
const item: any = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } } };

export default function POClient() {
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"table" | "kanban">("table");

  // Real purchase orders data fetching
  const { data: posRes, isLoading, isError, refetch } = useList<PurchaseOrder>('inventory/purchase-orders');
  const orders = posRes?.data || [];

  // Real products fetching (for creation select dropdown)
  const { data: productsRes } = useList<Product>('inventory/products');
  const products = productsRes?.data || [];

  // Real warehouses fetching
  const { data: warehousesRes } = useList<{ id: string; name: string }>('inventory/warehouses');
  const warehouses = warehousesRes?.data || [];

  // Mutations
  const createPOMutation = useCreate<PurchaseOrder>('inventory/purchase-orders');
  const patchStatusMutation = usePatch('inventory/purchase-orders');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // New PO Modal form states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newPO, setNewPO] = useState({
    productId: "",
    warehouseId: "",
    quantity: "",
    unitPrice: "",
    status: "DRAFT" as PurchaseOrderStatus,
  });

  const [successToast, setSuccessToast] = useState("");
  const [errorToast, setErrorToast] = useState("");

  // Extract vendors dynamically from product list
  const vendors = Array.from(
    new Map(
      products
        .filter(p => p.vendor)
        .map(p => [p.vendor!.id, p.vendor])
    ).values()
  );

  // Calculation KPI stats
  const totalProcuredAmount = orders
    .filter(o => o.status === "RECEIVED" || o.status === "ORDERED")
    .reduce((sum, o) => sum + o.totalAmount, 0);

  const activeOrdersCount = orders.filter(o => o.status === "ORDERED").length;
  const pendingApprovalsCount = orders.filter(o => o.status === "PENDING_APPROVAL").length;
  const draftCount = orders.filter(o => o.status === "DRAFT").length;

  // Filter logic
  const filteredOrders = orders.filter(o => {
    const poNumber = o.poNumber.toLowerCase();
    const vendorName = (o.vendor?.name || "").toLowerCase();
    const firstItemName = (o.items?.[0]?.product?.name || "").toLowerCase();

    const matchesSearch = 
      poNumber.includes(searchTerm.toLowerCase()) ||
      vendorName.includes(searchTerm.toLowerCase()) ||
      firstItemName.includes(searchTerm.toLowerCase());

    const matchesStatus = filter === "all" || o.status.toLowerCase().replace('_', ' ') === filter;

    return matchesSearch && matchesStatus;
  });

  // Pagination calculation
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage) || 1;
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  // Receive PO shipment
  const handleReceive = async (id: string) => {
    try {
      await patchStatusMutation.mutateAsync({
        id,
        data: { status: "RECEIVED" }
      });
      setSuccessToast(`Purchase Order marked as RECEIVED. Items added to warehouse inventory.`);
      setTimeout(() => setSuccessToast(""), 4000);
      refetch();
    } catch (err: any) {
      setErrorToast(err.message || "Failed to receive Purchase Order.");
      setTimeout(() => setErrorToast(""), 4000);
    }
  };

  // Approve PO
  const handleApprove = async (id: string) => {
    // Under state machine PENDING_APPROVAL transitions to APPROVED or ORDERED
    try {
      await patchStatusMutation.mutateAsync({
        id,
        data: { status: "ORDERED" }
      });
      setSuccessToast(`Purchase Order approved & marked as ORDERED. Dispatched to vendor.`);
      setTimeout(() => setSuccessToast(""), 4000);
      refetch();
    } catch (err: any) {
      setErrorToast(err.message || "Failed to approve Purchase Order.");
      setTimeout(() => setErrorToast(""), 4000);
    }
  };

  // Submit PO for approval (DRAFT -> PENDING_APPROVAL)
  const handleSubmitApproval = async (id: string) => {
    try {
      await patchStatusMutation.mutateAsync({
        id,
        data: { status: "PENDING_APPROVAL" }
      });
      setSuccessToast(`Purchase Order submitted for managerial approval.`);
      setTimeout(() => setSuccessToast(""), 4000);
      refetch();
    } catch (err: any) {
      setErrorToast(err.message || "Failed to submit Purchase Order.");
      setTimeout(() => setErrorToast(""), 4000);
    }
  };

  // Create new PO submit
  const handleCreatePOSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPO.productId || !newPO.warehouseId || !newPO.quantity || !newPO.unitPrice) return;

    const qty = parseInt(newPO.quantity) || 1;
    const price = parseFloat(newPO.unitPrice) || 0;
    const total = qty * price;

    // Find the vendor associated with this product
    const selectedProd = products.find(p => p.id === newPO.productId);
    const vendorId = selectedProd?.vendorId;
    if (!vendorId) {
      setErrorToast("Selected product has no associated Vendor! Add vendor first.");
      setTimeout(() => setErrorToast(""), 4000);
      return;
    }

    // Generate clean PO Number
    const poNumber = `PO-${Date.now().toString().slice(-6)}`;

    try {
      await createPOMutation.mutateAsync({
        poNumber,
        vendorId,
        warehouseId: newPO.warehouseId,
        status: newPO.status,
        orderDate: new Date(),
        totalAmount: total,
        items: [
          {
            productId: newPO.productId,
            quantity: qty,
            unitPrice: price,
          }
        ]
      } as any);

      setSuccessToast(`Purchase Order "${poNumber}" created successfully!`);
      setTimeout(() => setSuccessToast(""), 4000);
      refetch();
      setIsModalOpen(false);
      setNewPO({
        productId: "",
        warehouseId: "",
        quantity: "",
        unitPrice: "",
        status: "DRAFT",
      });
      setCurrentPage(1);
    } catch (err: any) {
      setErrorToast(err.message || "Failed to create Purchase Order.");
      setTimeout(() => setErrorToast(""), 4000);
    }
  };

  // Kanban update handler: Intercepts Kanban Board state changes
  const handleSetKanbanOrders = async (updater: any) => {
    if (typeof updater === 'function') {
      const updatedOrders = updater(orders);
      const changed = updatedOrders.find((newO: any) => {
        const oldO = orders.find(o => o.id === newO.id);
        return oldO && oldO.status !== newO.status;
      });

      if (changed) {
        try {
          await patchStatusMutation.mutateAsync({
            id: changed.id,
            data: { status: changed.status }
          });
          setSuccessToast(`Purchase Order status updated to ${changed.status}.`);
          setTimeout(() => setSuccessToast(""), 4000);
          refetch();
        } catch (err: any) {
          setErrorToast(err.message || "Workflow validation error: invalid transition!");
          setTimeout(() => setErrorToast(""), 5000);
          refetch(); // Reload original status to snap drag item back
        }
      }
    }
  };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-8 max-w-7xl mx-auto pb-12">
      
      {/* HEADER */}
      <motion.div variants={item} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            <span className="text-gradient-primary">Purchase</span>{" "}
            <span className="text-text-main">Orders</span>
          </h1>
          <p className="text-text-muted mt-2 text-sm">
            Manage corporate procurement cycles, vendor channels, and receiving logistics.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={() => setIsModalOpen(true)} className="shadow-lg shadow-primary/10">
            <Plus className="w-4 h-4 mr-2" />
            Create Purchase Order
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
        {errorToast && (
          <motion.div 
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="p-4 bg-danger/10 border border-danger/30 rounded-2xl flex items-center gap-3 text-sm text-danger font-medium shadow-xl backdrop-blur-md"
          >
            <div className="w-6 h-6 rounded-full bg-danger flex items-center justify-center text-white font-bold">!</div>
            <div className="flex-1">{errorToast}</div>
            <button onClick={() => setErrorToast("")} className="text-danger hover:opacity-85 text-xs font-semibold">Dismiss</button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* PROCUREMENT KPI CARDS */}
      <motion.div variants={container} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <MiniStat title="Procured Valuation" value={isLoading ? "..." : `₹${(totalProcuredAmount / 1000000).toFixed(2)}M`} icon={TrendingUp} color="text-primary" gradient="from-primary/20 to-primary/5" />
        <MiniStat title="Active Shipments" value={isLoading ? "..." : activeOrdersCount.toString()} icon={Truck} color="text-info" gradient="from-info/20 to-info/5" />
        <MiniStat title="Awaiting Approvals" value={isLoading ? "..." : pendingApprovalsCount.toString()} icon={Clock} color="text-warning" gradient="from-warning/20 to-warning/5" />
        <MiniStat title="Draft Status" value={isLoading ? "..." : draftCount.toString()} icon={FileText} color="text-accent" gradient="from-accent/20 to-accent/5" />
      </motion.div>

      {/* DATA FILTERING & SEARCH */}
      <motion.div variants={item}>
        <Card variant="glass" className="border-border/30 shadow-md">
          <CardContent className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
            
            <div className="flex items-center gap-1 overflow-x-auto py-1 scrollbar-hide">
              {["all", "draft", "pending approval", "approved", "ordered", "received", "cancelled"].map((f) => (
                <button
                  key={f}
                  onClick={() => { setFilter(f); setCurrentPage(1); }}
                  className={cn(
                    "px-4 py-1.5 text-xs font-bold rounded-lg transition-all capitalize whitespace-nowrap cursor-pointer",
                    filter === f ? "bg-card text-primary border border-border/40 shadow-sm" : "text-text-muted hover:text-text-main"
                  )}
                >
                  {f}
                </button>
              ))}
            </div>

            <div className="relative w-full md:w-64">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-faint" />
              <input 
                type="text"
                placeholder="Search PO#, vendor or item..." 
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                className="w-full bg-surface/50 border border-border/30 rounded-xl pl-10 pr-4 py-2 text-xs text-text-main outline-none focus:border-primary/50 transition-all"
              />
            </div>

            <div className="flex items-center gap-1 p-1 bg-surface/50 border border-border/30 rounded-lg">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setViewMode("table")}
                className={cn("px-3 h-8", viewMode === "table" ? "bg-card shadow-sm" : "text-text-muted")}
              >
                <List className="w-4 h-4 mr-1.5" />
                Table
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setViewMode("kanban")}
                className={cn("px-3 h-8", viewMode === "kanban" ? "bg-card shadow-sm" : "text-text-muted")}
              >
                <LayoutGrid className="w-4 h-4 mr-1.5" />
                Board
              </Button>
            </div>

          </CardContent>
        </Card>
      </motion.div>

      {/* ORDERS LEDGER OR KANBAN */}
      <motion.div variants={item}>
        {isLoading ? (
          <div className="p-12 text-center text-text-faint flex flex-col items-center justify-center gap-2 bg-card/20 border border-border/10 rounded-2xl">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <span>Retrieving corporate purchase orders...</span>
          </div>
        ) : isError ? (
          <div className="p-12 text-center text-danger font-medium">
            Failed to load purchase orders. Check backend logs.
          </div>
        ) : viewMode === "kanban" ? (
          <POKanbanBoard orders={orders as any} setOrders={handleSetKanbanOrders as any} />
        ) : (
          <Card variant="glass" className="border-border/20 shadow-lg overflow-hidden">
            <CardHeader className="border-b border-border/20 bg-card/10">
              <CardTitle>Procurement Ledger</CardTitle>
              <p className="text-xs text-text-faint mt-1">Audit log of corporate purchase orders placed, shipments dispatched, and warehousing delivery entries.</p>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-border/15 bg-card/40 text-text-faint font-semibold uppercase tracking-wider">
                      <th className="px-6 py-4">PO Number</th>
                      <th className="px-6 py-4">Vendor Partner</th>
                      <th className="px-6 py-4">Item Procurement</th>
                      <th className="px-6 py-4 font-mono text-center">Qty</th>
                      <th className="px-6 py-4">Target Location</th>
                      <th className="px-6 py-4">Est Payout</th>
                      <th className="px-6 py-4">Procurement Status</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/10">
                    <AnimatePresence mode="popLayout">
                      {paginatedOrders.map((po) => {
                        const vendorName = po.vendor?.name || "Unassigned Vendor";
                        const warehouseName = po.warehouse?.name || "Mumbai Hub";
                        const firstItem = po.items?.[0];
                        const itemName = firstItem?.product?.name || po.notes || "Procurement Goods";
                        const quantity = firstItem?.quantity || 1;

                        return (
                          <motion.tr 
                            key={po.id}
                            layout
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="hover:bg-card/30 transition-colors group"
                          >
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded bg-surface border border-border/30 flex items-center justify-center text-text-muted group-hover:text-primary transition-colors">
                                  <FileText className="w-4 h-4" />
                                </div>
                                <span className="text-sm font-bold text-text-main font-mono">{po.poNumber}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm font-semibold text-text-main">{vendorName}</td>
                            <td className="px-6 py-4 text-text-muted">{itemName}</td>
                            <td className="px-6 py-4 font-mono text-center text-text-muted font-bold">{quantity}</td>
                            <td className="px-6 py-4 text-text-muted">
                              <div className="flex items-center gap-1.5">
                                <Building className="w-3.5 h-3.5 text-text-faint" />
                                {warehouseName}
                              </div>
                            </td>
                            <td className="px-6 py-4 font-bold text-text-main font-mono">₹{po.totalAmount.toLocaleString("en-IN")}</td>
                            <td className="px-6 py-4">
                              <POStatusBadge status={po.status} />
                            </td>
                            <td className="px-6 py-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                {po.status === "DRAFT" && (
                                  <Button 
                                    onClick={() => handleSubmitApproval(po.id)}
                                    size="sm" 
                                    className="py-1 h-7 text-[10px] font-bold uppercase cursor-pointer bg-primary/20 hover:bg-primary/30 text-primary border border-primary/20"
                                  >
                                    Submit
                                  </Button>
                                )}
                                {po.status === "PENDING_APPROVAL" && (
                                  <Button 
                                    onClick={() => handleApprove(po.id)}
                                    size="sm" 
                                    className="py-1 h-7 text-[10px] font-bold uppercase cursor-pointer"
                                  >
                                    Approve PO
                                  </Button>
                                )}
                                {(po.status === "ORDERED" || po.status === "APPROVED") && (
                                  <Button 
                                    onClick={() => handleReceive(po.id)}
                                    size="sm" 
                                    variant="outline" 
                                    className="py-1 h-7 text-[10px] font-bold uppercase border-success/30 hover:bg-success/5 text-success hover:text-success cursor-pointer"
                                  >
                                    <PackageCheck className="w-3 h-3 mr-1" />
                                    Receive
                                  </Button>
                                )}
                              </div>
                            </td>
                          </motion.tr>
                        );
                      })}
                    </AnimatePresence>

                    {filteredOrders.length === 0 && (
                      <tr>
                        <td colSpan={8} className="px-6 py-10 text-center text-text-faint font-medium">
                          No purchase orders matching the filter options were found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* TABLE PAGINATION */}
              {!isLoading && !isError && (
                <div className="p-4 border-t border-border/15 flex items-center justify-between gap-4 text-text-muted">
                  <span className="text-[11px] font-medium">
                    Showing {Math.min(filteredOrders.length, (currentPage - 1) * itemsPerPage + 1)}-{Math.min(filteredOrders.length, currentPage * itemsPerPage)} of {filteredOrders.length} records
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
        )}
      </motion.div>

      {/* CREATE PURCHASE ORDER DIALOG */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title="Issue Corporate Purchase Order"
      >
        <form onSubmit={handleCreatePOSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-text-muted">Procure Item (SKU Product)</label>
              <select
                required
                value={newPO.productId}
                onChange={(e) => {
                  const prod = products.find(p => p.id === e.target.value);
                  setNewPO({
                    ...newPO, 
                    productId: e.target.value,
                    unitPrice: prod ? prod.price.toString() : ""
                  });
                }}
                className="w-full bg-surface/50 border border-border/40 rounded-xl px-3 py-2 text-xs text-text-main focus:border-primary/50 outline-none cursor-pointer"
              >
                <option value="" disabled>Select Catalog Product</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-text-muted">Target Warehouse Location</label>
              <select
                required
                value={newPO.warehouseId}
                onChange={(e) => setNewPO({...newPO, warehouseId: e.target.value})}
                className="w-full bg-surface/50 border border-border/40 rounded-xl px-3 py-2 text-xs text-text-main focus:border-primary/50 outline-none cursor-pointer"
              >
                <option value="" disabled>Select Warehouse</option>
                {warehouses.map(w => (
                  <option key={w.id} value={w.id}>{w.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-text-muted">Procure Qty</label>
              <input
                type="number"
                required
                min="1"
                placeholder="20"
                value={newPO.quantity}
                onChange={(e) => setNewPO({...newPO, quantity: e.target.value})}
                className="w-full bg-surface/50 border border-border/40 rounded-xl px-3 py-2 text-xs text-text-main placeholder:text-text-faint/60 focus:border-primary/50 outline-none transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-text-muted">Unit Price (INR)</label>
              <input
                type="number"
                required
                min="1"
                placeholder="78000"
                value={newPO.unitPrice}
                onChange={(e) => setNewPO({...newPO, unitPrice: e.target.value})}
                className="w-full bg-surface/50 border border-border/40 rounded-xl px-3 py-2 text-xs text-text-main placeholder:text-text-faint/60 focus:border-primary/50 outline-none transition-all"
              />
            </div>

            <div className="space-y-1.5 col-span-1">
              <label className="text-xs font-semibold text-text-muted">Initial PO Status</label>
              <select
                value={newPO.status}
                onChange={(e) => setNewPO({...newPO, status: e.target.value as PurchaseOrderStatus})}
                className="w-full bg-surface/50 border border-border/40 rounded-xl px-3 py-2 text-xs text-text-main focus:border-primary/50 outline-none cursor-pointer"
              >
                <option value="DRAFT">DRAFT</option>
                <option value="PENDING_APPROVAL">PENDING APPROVAL</option>
                <option value="ORDERED">ORDERED</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-3 border-t border-border/10 justify-end">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createPOMutation.isPending}>
              {createPOMutation.isPending ? "Creating PO..." : "Post Procurement Order"}
            </Button>
          </div>
        </form>
      </Modal>

    </motion.div>
  );
}

function POStatusBadge({ status }: { status: string }) {
  const s = status.toUpperCase();
  const styles: any = {
    RECEIVED: "bg-emerald-500/10 text-emerald-500",
    ORDERED: "bg-blue-500/10 text-blue-500",
    APPROVED: "bg-indigo-500/10 text-indigo-500",
    PENDING_APPROVAL: "bg-amber-500/10 text-amber-500",
    DRAFT: "bg-neutral/15 text-text-faint",
    CANCELLED: "bg-danger/10 text-danger",
  };

  const icons: any = {
    RECEIVED: <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />,
    ORDERED: <Truck className="w-3.5 h-3.5 mr-1.5" />,
    APPROVED: <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />,
    PENDING_APPROVAL: <Clock className="w-3.5 h-3.5 mr-1.5" />,
    DRAFT: <FileText className="w-3.5 h-3.5 mr-1.5" />,
    CANCELLED: <AlertCircle className="w-3.5 h-3.5 mr-1.5" />,
  };

  const label = status.replace('_', ' ');

  return (
    <div className={cn(
      "inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider",
      styles[s] || styles.DRAFT
    )}>
      {icons[s] || icons.DRAFT}
      {label}
    </div>
  );
}

function MiniStat({ title, value, icon: Icon, color, gradient }: any) {
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

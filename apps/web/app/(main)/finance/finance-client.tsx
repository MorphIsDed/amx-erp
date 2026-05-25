"use client";

import { useState, useTransition } from "react";
import { RichTransaction } from "@/lib/store";
import { createTransaction } from "@/app/actions";
import { motion, AnimatePresence } from "framer-motion";
import { 
  TrendingUp, 
  DollarSign, 
  Plus, 
  ArrowUpRight, 
  FileText, 
  Clock, 
  Search, 
  Filter, 
  AlertCircle, 
  X,
  CreditCard,
  Building,
  Download
} from "lucide-react";
import { cn } from "@/lib/utils";
import Button from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Modal } from "@/components/ui/modal";
import { exportToCsv } from "@/lib/export-utils";

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } };
const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] } } };

export default function FinanceClient({ initialTransactions }: { initialTransactions: any[] }) {
  const [transactions, setTransactions] = useState<any[]>(initialTransactions);
  const [isPending, startTransition] = useTransition();
  
  // State for Table Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // State for Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // State for Add Dialog
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    description: "",
    category: "Income" as "Income" | "Expense" | "Payroll" | "Vendor",
    amount: "",
    status: "Pending" as "Paid" | "Pending",
    date: new Date().toISOString().split("T")[0],
  });
  
  // Success toast/alert feedback
  const [successToast, setSuccessToast] = useState("");

  // Calculate dynamic metrics from store
  const parseAmount = (amtStr: string) => {
    return parseFloat(amtStr.replace(/[₹,]/g, "")) || 0;
  };

  const formatCurrency = (val: number) => {
    return "₹" + val.toLocaleString("en-IN");
  };

  const totalRevenue = transactions
    .filter(t => t.category === "Income" && t.status === "Paid")
    .reduce((sum, t) => sum + parseAmount(t.amount), 0);

  const outstanding = transactions
    .filter(t => t.status === "Pending")
    .reduce((sum, t) => sum + parseAmount(t.amount), 0);

  const cashInHand = transactions
    .reduce((sum, t) => {
      const amt = parseAmount(t.amount);
      if (t.status === "Paid") {
        return t.category === "Income" ? sum + amt : sum - amt;
      }
      return sum;
    }, 25000000); // 25M base cash

  const taxLiability = totalRevenue * 0.18; // 18% GST estimate

  // Filtered transactions list
  const filteredTransactions = transactions.filter(t => {
    const matchesSearch = 
      t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t.reference && t.reference.toLowerCase().includes(searchTerm.toLowerCase()));
      
    const matchesCategory = categoryFilter === "all" || t.category === categoryFilter;
    const matchesStatus = statusFilter === "all" || t.status === statusFilter;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage) || 1;
  const paginatedTransactions = filteredTransactions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  // Form submission with Optimistic Update
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.description || !formData.amount) return;

    // Parse values to build the transaction object
    const rawAmt = parseFloat(formData.amount);
    const amtFormatted = "₹" + rawAmt.toLocaleString("en-IN");

    startTransition(async () => {
      const newTx = {
        id: `optimistic_${Date.now()}`,
        type: formData.category === "Income" ? "Invoice Run" : "Vendor Payout",
        amount: amtFormatted,
        status: formData.status,
        description: formData.description,
        category: formData.category,
        date: formData.date,
        reference: `REF-${Math.floor(100000 + Math.random() * 900000)}`,
      };

      setTransactions(prev => [newTx, ...prev]);

      await createTransaction({
        type: newTx.type,
        amount: newTx.amount,
        status: newTx.status,
        description: newTx.description,
        category: newTx.category,
        date: newTx.date,
        reference: newTx.reference,
      });

      setSuccessToast(`Transaction "${formData.description}" created successfully!`);
      setTimeout(() => setSuccessToast(""), 4000);
    });

    setIsModalOpen(false);
    setFormData({
      description: "",
      category: "Income",
      amount: "",
      status: "Pending",
      date: new Date().toISOString().split("T")[0],
    });
    setCurrentPage(1);
  };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-8 max-w-7xl mx-auto pb-12">
      
      {/* HEADER & ACTIONS */}
      <motion.div variants={item} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            <span className="text-gradient-primary">Financial</span>{" "}
            <span className="text-text-main">Control</span>
          </h1>
          <p className="text-text-muted mt-2 text-sm">
            Treasury oversight, active invoicing, and state-locked transactions ledger.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => exportToCsv("finance_ledger", filteredTransactions)}>
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
          <Button onClick={() => setIsModalOpen(true)} className="shadow-lg shadow-primary/10">
            <Plus className="w-4 h-4 mr-2" />
            Add Transaction
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

      {/* LIVE METRICS WIDGETS */}
      <motion.div variants={container} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <FinanceStat title="Total Revenue" value={formatCurrency(totalRevenue)} change="+18%" trend="up" icon={TrendingUp} gradient="from-primary to-cyan" />
        <FinanceStat title="Outstanding" value={formatCurrency(outstanding)} change="Pending Invoices" trend="neutral" icon={Clock} gradient="from-warning to-rose" />
        <FinanceStat title="Cash in Hand" value={formatCurrency(cashInHand)} change="Live Treasury" trend="up" icon={DollarSign} gradient="from-success to-primary" />
        <FinanceStat title="Estimated Tax" value={formatCurrency(taxLiability)} change="18% GST Bound" trend="neutral" icon={FileText} gradient="from-accent to-info" />
      </motion.div>

      {/* DATA FILTER BAR */}
      <motion.div variants={item}>
        <Card variant="glass" className="border-border/30 shadow-md">
          <CardContent className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
            
            {/* SEARCH */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-faint" />
              <input
                type="text"
                placeholder="Search ledger by description, invoice #, reference..."
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                className="w-full bg-surface/50 border border-border/30 rounded-xl pl-10 pr-4 py-2.5 text-xs text-text-main placeholder:text-text-faint/60 focus:border-primary/50 outline-none transition-all"
              />
            </div>

            {/* CATEGORY & STATUS FILTERS */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <Filter className="w-3.5 h-3.5 text-text-faint" />
                <span className="text-xs text-text-muted font-medium">Category:</span>
              </div>
              <select
                value={categoryFilter}
                onChange={(e) => { setCategoryFilter(e.target.value); setCurrentPage(1); }}
                className="bg-card border border-border/30 rounded-xl px-3 py-2 text-xs text-text-main focus:border-primary/50 outline-none cursor-pointer"
              >
                <option value="all">All Categories</option>
                <option value="Income">Income</option>
                <option value="Expense">Expense</option>
                <option value="Payroll">Payroll</option>
                <option value="Vendor">Vendor</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                className="bg-card border border-border/30 rounded-xl px-3 py-2 text-xs text-text-main focus:border-primary/50 outline-none cursor-pointer"
              >
                <option value="all">All Statuses</option>
                <option value="Paid">Paid</option>
                <option value="Pending">Pending</option>
              </select>
            </div>

          </CardContent>
        </Card>
      </motion.div>

      {/* LEDGER TABLE */}
      <motion.div variants={item}>
        <Card variant="glass" className="border-border/20 shadow-lg overflow-hidden">
          <CardHeader className="border-b border-border/20">
            <CardTitle>Transactions Ledger</CardTitle>
            <p className="text-xs text-text-faint mt-1">Audit log of all income, expenditures, and accounts receivables.</p>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-border/15 bg-card/40 text-text-faint font-semibold uppercase tracking-wider">
                    <th className="px-6 py-4">Transaction / Type</th>
                    <th className="px-6 py-4">Description</th>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4">Reference</th>
                    <th className="px-6 py-4">Category</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/10">
                  <AnimatePresence mode="popLayout">
                    {paginatedTransactions.map((tx) => (
                      <motion.tr 
                        key={tx.id}
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="hover:bg-card/30 transition-colors group"
                      >
                        <td className="px-6 py-4 font-bold text-text-main">
                          <div className="flex items-center gap-2">
                            <span className={cn(
                              "w-1.5 h-1.5 rounded-full",
                              tx.category === "Income" ? "bg-primary" : "bg-rose"
                            )} />
                            {tx.type}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-text-muted">{tx.description}</td>
                        <td className="px-6 py-4 text-text-faint font-mono">{tx.date}</td>
                        <td className="px-6 py-4 text-text-faint font-mono">{tx.reference}</td>
                        <td className="px-6 py-4">
                          <span className={cn(
                            "px-2 py-0.5 rounded-full text-[10px] font-bold",
                            tx.category === "Income" ? "bg-primary/10 text-primary" :
                            tx.category === "Expense" ? "bg-danger/10 text-danger" :
                            tx.category === "Payroll" ? "bg-warning/10 text-warning" : "bg-accent/10 text-accent"
                          )}>
                            {tx.category}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={cn(
                            "px-2 py-0.5 rounded-full text-[10px] font-bold",
                            tx.status === "Paid" ? "bg-success/10 text-success" : "bg-neutral/15 text-text-faint"
                          )}>
                            {tx.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right font-bold text-text-main font-mono text-sm">
                          {tx.amount}
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>

                  {filteredTransactions.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-6 py-10 text-center text-text-faint font-medium">
                        No transactions found matching the selected filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* TABLE PAGINATION */}
            <div className="p-4 border-t border-border/15 flex items-center justify-between gap-4 text-text-muted">
              <span className="text-[11px] font-medium">
                Showing {Math.min(filteredTransactions.length, (currentPage - 1) * itemsPerPage + 1)}-{Math.min(filteredTransactions.length, currentPage * itemsPerPage)} of {filteredTransactions.length} ledger entries
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

          </CardContent>
        </Card>
      </motion.div>

      {/* DIALOG FORM MODAL */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title="Record New Transaction"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-text-muted">Ledger Description</label>
            <input
              type="text"
              required
              placeholder="e.g. Server hosting subscription payment"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="w-full bg-surface/50 border border-border/40 rounded-xl px-3 py-2 text-xs text-text-main placeholder:text-text-faint/60 focus:border-primary/50 outline-none transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-text-muted">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value as any})}
                className="w-full bg-surface/50 border border-border/40 rounded-xl px-3 py-2 text-xs text-text-main focus:border-primary/50 outline-none cursor-pointer"
              >
                <option value="Income">Income (Invoice)</option>
                <option value="Expense">Expense</option>
                <option value="Payroll">Payroll</option>
                <option value="Vendor">Vendor Payout</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-text-muted">Ledger Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value as any})}
                className="w-full bg-surface/50 border border-border/40 rounded-xl px-3 py-2 text-xs text-text-main focus:border-primary/50 outline-none cursor-pointer"
              >
                <option value="Pending">Pending Audit</option>
                <option value="Paid">Cleared / Paid</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-text-muted">Amount (INR)</label>
              <input
                type="number"
                required
                min="1"
                placeholder="e.g. 245000"
                value={formData.amount}
                onChange={(e) => setFormData({...formData, amount: e.target.value})}
                className="w-full bg-surface/50 border border-border/40 rounded-xl px-3 py-2 text-xs text-text-main placeholder:text-text-faint/60 focus:border-primary/50 outline-none transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-text-muted">Ledger Date</label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={(e) => setFormData({...formData, date: e.target.value})}
                className="w-full bg-surface/50 border border-border/40 rounded-xl px-3 py-2 text-xs text-text-main focus:border-primary/50 outline-none transition-all"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 pt-3 border-t border-border/10 justify-end">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">
              Post Transaction
            </Button>
          </div>
        </form>
      </Modal>

    </motion.div>
  );
}

function FinanceStat({ title, value, change, trend, icon: Icon, gradient }: any) {
  return (
    <motion.div variants={item}>
      <Card variant="default" className="relative overflow-hidden group hover:-translate-y-0.5 transition-all duration-300">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-bold text-text-faint uppercase tracking-wider">{title}</p>
            <div className="p-1.5 rounded-lg bg-surface/80 border border-border/30 text-text-muted group-hover:text-primary transition-colors">
              <Icon className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4 flex items-end justify-between">
            <h2 className="text-2xl font-bold text-text-main tracking-tight font-mono">{value}</h2>
            <div className={cn(
              "text-[10px] font-bold px-2 py-0.5 rounded-full", 
              trend === "up" ? "bg-success/10 text-success" : 
              trend === "down" ? "bg-danger/10 text-danger" : 
              "bg-surface text-text-faint"
            )}>
              {change}
            </div>
          </div>
        </CardContent>
        <div className={cn("absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r opacity-30 group-hover:opacity-70 transition-opacity", gradient)} />
      </Card>
    </motion.div>
  );
}

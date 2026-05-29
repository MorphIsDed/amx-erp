"use client";

import { Card, CardContent } from "@/components/ui/card";
import { useList } from "@/hooks/use-crud";
import { Invoice, Transaction } from "@repo/db";
import { TrendingUp, DollarSign, Clock, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

export default function FinanceDashboard() {
  const { data: invoicesRes } = useList<Invoice>("finance/invoices");
  const { data: transactionsRes } = useList<Transaction>("finance/transactions");
  
  const invoices = invoicesRes?.data || [];
  const transactions = transactionsRes?.data || [];

  const totalRevenue = invoices
    .filter(inv => inv.status === 'PAID')
    .reduce((sum, inv) => sum + inv.totalAmount, 0);

  const outstanding = invoices
    .filter(inv => inv.status === 'SENT' || inv.status === 'OVERDUE')
    .reduce((sum, inv) => sum + (inv.totalAmount - inv.amountPaid), 0);

  const cashInHand = transactions.reduce((sum, tx) => {
    if (tx.type === 'INCOME') return sum + tx.amount;
    if (tx.type === 'EXPENSE') return sum - tx.amount;
    return sum;
  }, 0);

  const formatCurrency = (val: number) => `₹${val.toLocaleString("en-IN")}`;

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Finance Dashboard</h1>
        <p className="text-text-muted mt-2 text-sm">
          Overview of your financial performance.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <FinanceStat 
          title="Total Revenue" 
          value={formatCurrency(totalRevenue)} 
          change="Paid Invoices" 
          trend="up" 
          icon={TrendingUp} 
          gradient="from-primary to-cyan-500" 
        />
        <FinanceStat 
          title="Outstanding" 
          value={formatCurrency(outstanding)} 
          change="Unpaid Invoices" 
          trend="neutral" 
          icon={Clock} 
          gradient="from-warning to-orange-500" 
        />
        <FinanceStat 
          title="Cash Flow" 
          value={formatCurrency(cashInHand)} 
          change="Net Transactions" 
          trend={cashInHand >= 0 ? "up" : "down"} 
          icon={DollarSign} 
          gradient="from-success to-emerald-500" 
        />
        <FinanceStat 
          title="Draft Invoices" 
          value={invoices.filter(i => i.status === 'DRAFT').length.toString()} 
          change="Pending Review" 
          trend="neutral" 
          icon={FileText} 
          gradient="from-accent to-blue-500" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mt-8">
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-bold mb-4">Recent Transactions</h3>
            <div className="space-y-4">
              {transactions.slice(0, 5).map(tx => (
                <div key={tx.id} className="flex justify-between items-center border-b pb-2 last:border-0">
                  <div>
                    <p className="font-medium text-sm">{tx.description}</p>
                    <p className="text-xs text-text-muted">{new Date(tx.date).toLocaleDateString()}</p>
                  </div>
                  <span className={cn("font-bold text-sm", tx.type === 'INCOME' ? 'text-emerald-500' : tx.type === 'EXPENSE' ? 'text-rose-500' : 'text-blue-500')}>
                    {tx.type === 'EXPENSE' ? '-' : '+'}₹{tx.amount.toFixed(2)}
                  </span>
                </div>
              ))}
              {transactions.length === 0 && <p className="text-sm text-text-muted text-center py-4">No recent transactions.</p>}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-bold mb-4">Recent Invoices</h3>
            <div className="space-y-4">
              {invoices.slice(0, 5).map(inv => (
                <div key={inv.id} className="flex justify-between items-center border-b pb-2 last:border-0">
                  <div>
                    <p className="font-medium text-sm">{inv.clientName}</p>
                    <p className="text-xs text-text-muted">{inv.invoiceNumber}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-sm">₹{inv.totalAmount.toFixed(2)}</p>
                    <p className="text-[10px] uppercase text-text-muted">{inv.status}</p>
                  </div>
                </div>
              ))}
              {invoices.length === 0 && <p className="text-sm text-text-muted text-center py-4">No recent invoices.</p>}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function FinanceStat({ title, value, change, trend, icon: Icon, gradient }: any) {
  return (
    <Card className="relative overflow-hidden group hover:-translate-y-0.5 transition-all duration-300">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <p className="text-[11px] font-bold text-text-muted uppercase tracking-wider">{title}</p>
          <div className="p-1.5 rounded-lg bg-surface/80 border border-border/30 text-text-muted">
            <Icon className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-4 flex items-end justify-between">
          <h2 className="text-2xl font-bold tracking-tight font-mono">{value}</h2>
          <div className={cn(
            "text-[10px] font-bold px-2 py-0.5 rounded-full", 
            trend === "up" ? "bg-emerald-500/10 text-emerald-500" : 
            trend === "down" ? "bg-rose-500/10 text-rose-500" : 
            "bg-surface text-text-muted"
          )}>
            {change}
          </div>
        </div>
      </CardContent>
      <div className={cn("absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r opacity-30", gradient)} />
    </Card>
  );
}

"use client";

import React from "react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { FileText, Truck, Clock, AlertCircle, CheckCircle2 } from "lucide-react";

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  vendorName: string;
  warehouseName: string;
  itemName: string;
  quantity: number;
  totalAmount: number;
  status: "DRAFT" | "PENDING_APPROVAL" | "ORDERED" | "RECEIVED" | "CANCELLED";
  createdAt: string;
}

const COLUMNS: { id: PurchaseOrder["status"], title: string }[] = [
  { id: "DRAFT", title: "Draft" },
  { id: "PENDING_APPROVAL", title: "Pending Approval" },
  { id: "ORDERED", title: "Ordered / In Transit" },
  { id: "RECEIVED", title: "Received" },
];

export function POKanbanBoard({
  orders,
  setOrders,
}: {
  orders: PurchaseOrder[];
  setOrders: React.Dispatch<React.SetStateAction<PurchaseOrder[]>>;
}) {
  const onDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const newStatus = destination.droppableId as PurchaseOrder["status"];
    
    setOrders((prev) => 
      prev.map((o) => 
        o.id === draggableId ? { ...o, status: newStatus } : o
      )
    );
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="flex gap-4 overflow-x-auto pb-4 items-start">
        {COLUMNS.map((col) => {
          const columnOrders = orders.filter((o) => o.status === col.id);
          return (
            <div key={col.id} className="min-w-[280px] flex-1 bg-surface/30 rounded-xl border border-border/20 p-4 flex flex-col max-h-[70vh]">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-text-main text-sm uppercase tracking-wider">{col.title}</h3>
                <span className="text-xs font-mono bg-card px-2 py-0.5 rounded-full border border-border/20">
                  {columnOrders.length}
                </span>
              </div>
              <Droppable droppableId={col.id}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={cn(
                      "flex-1 overflow-y-auto space-y-3 min-h-[150px] transition-colors rounded-lg p-1",
                      snapshot.isDraggingOver ? "bg-primary/5" : ""
                    )}
                  >
                    {columnOrders.map((po, index) => (
                      <Draggable key={po.id} draggableId={po.id} index={index}>
                        {(provided, snapshot) => (
                          <Card
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            variant="glass"
                            className={cn(
                              "p-3 border-border/30 cursor-grab active:cursor-grabbing hover:border-primary/30 transition-all",
                              snapshot.isDragging ? "shadow-2xl ring-2 ring-primary/50" : ""
                            )}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs font-bold text-text-main font-mono">{po.poNumber}</span>
                              <StatusIcon status={po.status} />
                            </div>
                            <p className="text-sm font-semibold text-text-main mb-1 line-clamp-1">{po.itemName}</p>
                            <p className="text-xs text-text-muted mb-3">{po.vendorName}</p>
                            <div className="flex items-center justify-between border-t border-border/10 pt-2">
                              <span className="text-[10px] text-text-faint">{po.quantity} units</span>
                              <span className="text-xs font-bold font-mono text-primary">₹{po.totalAmount.toLocaleString()}</span>
                            </div>
                          </Card>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          );
        })}
      </div>
    </DragDropContext>
  );
}

function StatusIcon({ status }: { status: string }) {
  if (status === "RECEIVED") return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
  if (status === "ORDERED") return <Truck className="w-4 h-4 text-blue-500" />;
  if (status === "PENDING_APPROVAL") return <Clock className="w-4 h-4 text-amber-500" />;
  if (status === "CANCELLED") return <AlertCircle className="w-4 h-4 text-danger" />;
  return <FileText className="w-4 h-4 text-text-faint" />;
}

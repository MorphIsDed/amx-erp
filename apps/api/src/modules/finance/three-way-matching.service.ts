import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export enum MatchStatus {
  MATCHED = 'MATCHED',
  PARTIALLY_MATCHED = 'PARTIALLY_MATCHED',
  MISMATCH = 'MISMATCH',
}

@Injectable()
export class ThreeWayMatchingService {
  constructor(private readonly prisma: PrismaService) {}

  async performThreeWayMatch(
    tenantId: string,
    invoiceId: string,
    poId: string,
  ): Promise<any> {
    // 1. Fetch Invoice
    const invoice = await this.prisma.invoice.findFirst({
      where: { id: invoiceId, tenantId },
      include: { items: true },
    });
    if (!invoice) {
      throw new NotFoundException(`Invoice with ID ${invoiceId} not found`);
    }

    // 2. Fetch Purchase Order
    const po = await this.prisma.purchaseOrder.findFirst({
      where: { id: poId, tenantId },
      include: { items: { include: { product: true } }, vendor: true },
    });
    if (!po) {
      throw new NotFoundException(`Purchase Order with ID ${poId} not found`);
    }

    // 3. Fetch Goods Receipts (StockMovements of type IN referencing the PO number)
    const goodsReceipts = await this.prisma.stockMovement.findMany({
      where: {
        tenantId,
        reference: po.poNumber,
        type: 'IN',
      },
    });

    const discrepancies: string[] = [];
    let status = MatchStatus.MATCHED;

    // --- Validation 1: PO Vendor vs Invoice Client/Vendor name ---
    const poVendorName = po.vendor.name.toLowerCase().trim();
    const invoiceClientName = invoice.clientName.toLowerCase().trim();
    if (
      !invoiceClientName.includes(poVendorName) &&
      !poVendorName.includes(invoiceClientName)
    ) {
      discrepancies.push(
        `Vendor Mismatch: PO Vendor is "${po.vendor.name}", but Invoice Client is "${invoice.clientName}"`,
      );
      status = MatchStatus.MISMATCH;
    }

    // --- Validation 2: PO Total Amount vs Invoice Total Amount ---
    const amountDifference = Math.abs(po.totalAmount - invoice.totalAmount);
    if (amountDifference > 0.01) {
      discrepancies.push(
        `Amount Mismatch: PO Total is ${po.totalAmount}, but Invoice Total is ${invoice.totalAmount} (Diff: ${amountDifference})`,
      );
      status = MatchStatus.MISMATCH;
    }

    // --- Validation 3: Quantities and Items (3-way check) ---
    const grQtyMap = new Map<string, number>();
    goodsReceipts.forEach((gr) => {
      const current = grQtyMap.get(gr.productId) || 0;
      grQtyMap.set(gr.productId, current + gr.quantity);
    });

    // Check invoice items against PO items and GR quantities
    invoice.items.forEach((invItem) => {
      // Find matching product in PO items by name/description
      const poItem = po.items.find(
        (item) =>
          invItem.description
            .toLowerCase()
            .includes(item.product.name.toLowerCase()) ||
          item.product.name
            .toLowerCase()
            .includes(invItem.description.toLowerCase()),
      );

      if (!poItem) {
        discrepancies.push(
          `Unexpected Item: Billed item "${invItem.description}" not found in Purchase Order`,
        );
        status = MatchStatus.MISMATCH;
        return;
      }

      // Check unit price match
      const priceDiff = Math.abs(poItem.unitPrice - invItem.unitPrice);
      if (priceDiff > 0.01) {
        discrepancies.push(
          `Price Mismatch on "${invItem.description}": PO Unit Price is ${poItem.unitPrice}, but Invoice Unit Price is ${invItem.unitPrice}`,
        );
        status = MatchStatus.MISMATCH;
      }

      // Get received qty from stock movements
      const receivedQty = grQtyMap.get(poItem.productId) || 0;

      // Check quantity match (Invoice Qty vs PO Qty vs Received Qty)
      if (invItem.quantity > poItem.quantity) {
        discrepancies.push(
          `Excess Quantity Billed on "${invItem.description}": Invoiced ${invItem.quantity}, but PO only authorized ${poItem.quantity}`,
        );
        status = MatchStatus.MISMATCH;
      }

      if (invItem.quantity > receivedQty) {
        discrepancies.push(
          `Unreceived Goods Billed on "${invItem.description}": Invoiced ${invItem.quantity}, but only ${receivedQty} has been received via Goods Receipt`,
        );
        if (status !== MatchStatus.MISMATCH) {
          status = MatchStatus.PARTIALLY_MATCHED;
        }
      } else if (receivedQty < poItem.quantity) {
        discrepancies.push(
          `Partial Receipt on "${invItem.description}": Ordered ${poItem.quantity}, but only received ${receivedQty} so far`,
        );
        if (status !== MatchStatus.MISMATCH) {
          status = MatchStatus.PARTIALLY_MATCHED;
        }
      }
    });

    // Automatic approval lock if mismatched
    const isApproved = status === MatchStatus.MATCHED;

    return {
      invoiceId,
      invoiceNumber: invoice.invoiceNumber,
      poId,
      poNumber: po.poNumber,
      status,
      discrepancies,
      isApproved,
      verifiedAt: new Date().toISOString(),
    };
  }
}

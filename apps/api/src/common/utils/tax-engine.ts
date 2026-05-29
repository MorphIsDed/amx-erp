export interface TaxResult {
  subTotal: number;
  cgst: number;
  sgst: number;
  igst: number;
  totalTax: number;
  totalAmount: number;
  rate: number;
}

export class TaxEngine {
  /**
   * Calculates GST for a given subtotal.
   * By default, it assumes Intra-state (CGST + SGST) at 18% total.
   * @param subTotal The amount before tax
   * @param rate The total GST rate (default 18)
   * @param isInterState Whether it's Inter-state (IGST) or Intra-state (CGST+SGST)
   */
  static calculateGST(
    subTotal: number,
    rate: number = 18,
    isInterState: boolean = false,
  ): TaxResult {
    const totalTax = (subTotal * rate) / 100;

    let cgst = 0;
    let sgst = 0;
    let igst = 0;

    if (isInterState) {
      igst = totalTax;
    } else {
      cgst = totalTax / 2;
      sgst = totalTax / 2;
    }

    return {
      subTotal,
      cgst,
      sgst,
      igst,
      totalTax,
      totalAmount: subTotal + totalTax,
      rate,
    };
  }
}

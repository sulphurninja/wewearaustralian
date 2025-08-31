export type BrandAggregate = {
  vendor: string; currency: string; orders: number; units: number;
  gross: number; refunds: number; shipping: number; fees: number;
};

export function aggregateOrders(orders: any[]): BrandAggregate[] {
  const byV = new Map<string, { currency: string; orders: Set<string>; units: number; gross: number; refunds: number; shipping: number; fees: number }>();

  for (const o of orders) {
    const orderId = o.name;
    const currency = o.currencyCode;
    const shippingAmt = (o.shippingLines?.edges ?? []).reduce((s: number, e: any) => s + Number(e.node.priceSet.shopMoney.amount), 0);
    const touched = new Set<string>();

    for (const { node: li } of (o.lineItems?.edges ?? [])) {
      const v = li.vendor || 'Unknown';
      const g = Number(li.discountedTotalSet?.shopMoney?.amount ?? 0);
      const b = byV.get(v) ?? { currency, orders: new Set<string>(), units: 0, gross: 0, refunds: 0, shipping: 0, fees: 0 };
      b.units += Number(li.quantity); b.gross += g; byV.set(v, b); touched.add(v);
    }

    for (const { node: rf } of (o.refunds?.edges ?? [])) {
      for (const { node: rli } of (rf.refundLineItems?.edges ?? [])) {
        const v = rli.lineItem?.vendor || 'Unknown';
        const r = Number(rli.subtotalSet?.shopMoney?.amount ?? 0);
        const b = byV.get(v) ?? { currency, orders: new Set<string>(), units: 0, gross: 0, refunds: 0, shipping: 0, fees: 0 };
        b.refunds += r; byV.set(v, b);
      }
    }

    const grossSum = Array.from(touched).reduce((s, v) => s + (byV.get(v)!.gross), 0);
    for (const v of touched) {
      const b = byV.get(v)!; const w = grossSum ? (b.gross / grossSum) : 0;
      b.shipping += shippingAmt * w;
      b.orders.add(orderId);
      // fees remain 0 for now
    }
  }

  return Array.from(byV.entries()).map(([vendor, row]) => ({
    vendor, currency: row.currency, orders: row.orders.size, units: row.units,
    gross: row.gross, refunds: row.refunds, shipping: row.shipping, fees: 0
  }));
}

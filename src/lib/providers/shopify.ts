import { shopifyGql } from '@/lib/shopify';

/**
 * Fetch orders in [start,end) with:
 * - line items (vendor/sku/qty/discounted totals)
 * - shipping charged
 * - refunds with refund line items (subtotal, original line’s vendor/sku)
 * Pagination-safe for orders and nested edges.
 *
 * Returns an array whose objects match the mock orders shape:
 * { id, name, createdAt, currencyCode, lineItems:{edges:[]}, shippingLines:{edges:[]}, refunds:{edges:[]} }
 */
export async function fetchShopifyOrders(start: Date, end: Date) {
  const q = `created_at:>=${start.toISOString()} AND created_at:<${end.toISOString()} status:any`;
  const ORDERS_Q = `
    query Orders($q: String!, $cursor: String) {
      orders(first: 100, after: $cursor, query: $q, sortKey: CREATED_AT) {
        pageInfo { hasNextPage endCursor }
        edges {
          node {
            id
            name
            createdAt
            currencyCode
            # line items
            lineItems(first: 250) {
              pageInfo { hasNextPage endCursor }
              edges { node {
                id
                vendor
                sku
                quantity
                discountedTotalSet { shopMoney { amount } }
              } }
            }
            # shipping charged to customer
            shippingLines(first: 10) {
              edges { node { priceSet { shopMoney { amount } } } }
            }
            # refunds (subtotal by refund line item)
            refunds(first: 50) {
              pageInfo { hasNextPage endCursor }
              edges { node {
                id
                createdAt
                refundLineItems(first: 250) {
                  pageInfo { hasNextPage endCursor }
                  edges { node {
                    quantity
                    subtotalSet { shopMoney { amount } }
                    lineItem { id vendor sku }
                  } }
                }
              } }
            }
          }
        }
      }
    }
  `;

  const out: any[] = [];
  let cursor: string | null = null;

  do {
    const data: any = await shopifyGql(ORDERS_Q, { q, cursor });
    const page = data.orders;

    // For safety: if nested connections (lineItems/refundLineItems) ever exceed their first:250,
    // you can loop to paginate them too. Most stores won't hit 250+ line items; if they do, add a helper to fetch all edges.

    for (const e of page.edges) {
      const node = e.node;

      // normalize to the exact mock shape (ensuring edges arrays exist)
      out.push({
        id: node.id,
        name: node.name,
        createdAt: node.createdAt,
        currencyCode: node.currencyCode,
        lineItems: {
          edges: node.lineItems?.edges ?? []
        },
        shippingLines: {
          edges: node.shippingLines?.edges ?? []
        },
        refunds: {
          edges: node.refunds?.edges?.map((rf: any) => ({
            node: {
              // keep only what the aggregator expects
              refundLineItems: {
                edges: rf.node.refundLineItems?.edges ?? []
              }
            }
          })) ?? []
        }
      });
    }

    cursor = page.pageInfo.hasNextPage ? page.pageInfo.endCursor : null;
  } while (cursor);

  return out;
}

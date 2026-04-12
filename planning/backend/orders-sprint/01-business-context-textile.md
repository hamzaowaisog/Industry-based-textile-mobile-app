# Orders — business context (textile)

## What an “order” is in HamzaTex

For a textile trading or distribution business, an **order** is a **commitment to sell** specific goods (SKUs / fabrics / units) to a **customer** at agreed prices. The system records:

- **Who** the buyer is (`Client` with customer type).
- **What** is sold (`OrderLine`: product, quantity, unit price).
- **When** the sale is recognized for operations (`OrderDate`).
- **How** payment is expected (`PaymentType`: cash vs credit).
- **Where** the order sits in fulfillment (`OrderStatus`).

Staff in the field or at the counter create and update orders; accountants and managers rely on the same data for stock accuracy and financial reports.

## Lifecycle (conceptual)

| Status | Business meaning |
|--------|-------------------|
| **Pending** | Quote or confirmed intent; no fulfillment yet (exact rules are policy—see ledger doc). |
| **InProgressed** | Picking, packing, or production aligned to this order. |
| **Delivered** | Goods left the business toward the customer; revenue and stock impact are aligned here in the target model (see [04-ledger-posting-rules.md](./04-ledger-posting-rules.md)). |
| **Cancelled** | Order will not complete; stock and any posted ledger entries must be reversed consistently. |

Partial deliveries (multiple shipments per order) are **not** modeled as separate sub-entities yet; future work could add shipment lines or split orders.

## Cash vs credit

- **Cash:** Payment is expected at sale or delivery; less open receivable exposure in the ledger if you post accordingly.
- **Credit:** Amount remains owed by the customer until **Payments** (separate epic) clear it. The order still defines **line totals**; receivables and cash receipt are tracked through `transactions` / payments when those features are fully wired.

`PaymentType` on the order is a **header attribute** shared with purchases; it informs posting rules (mode/category) in [04-ledger-posting-rules.md](./04-ledger-posting-rules.md).

## Relationship to inventory

Every fulfilled sale **reduces stock** for the products on the lines. The backend centralizes quantity and weighted-average **price** logic in `StockMovementsService`—order code must not duplicate that math.

## Relationship to reporting

Monthly P&L and client balances are driven from **`transactions`** (see [03-reporting-and-views-alignment.md](./03-reporting-and-views-alignment.md)), not from `orders` alone. Orders must **post** to the ledger at defined points so reports stay truthful.

## Who owns the data

Orders do not store `UserId`; ownership is inferred via **`Client.UserId`** (the staff member who owns the customer record). Admins typically see all customers/orders; staff see orders for their clients. Product access for stock checks follows existing **product–user** rules.

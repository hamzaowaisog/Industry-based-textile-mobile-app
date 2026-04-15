# Data Models — Backend (HamzaTex.Api)

**Part:** backend
**ORM:** Entity Framework Core 9
**Database:** MySQL 8.x (Pomelo.EntityFrameworkCore.MySql)
**Identity:** ASP.NET Identity (`ApplicationUser : IdentityUser<int>`)
**Last updated:** 2026-04-16

---

## Identity & Users

| Entity | Key Fields | Notes |
|---|---|---|
| `ApplicationUser` | `Id`, `Name`, `RoleId`, `IsActive`, `CreatedAt` | Extends `IdentityUser<int>` |
| `UserRole` | `Id`, `Name` | Custom role table (Admin=1, Staff=2) |
| `RefreshToken` | `Token`, `UserId`, `ExpiresAt`, `RevokedAt`, `ReplacedByToken` | `IsActive` / `IsExpired` computed |

---

## Clients

| Entity | Key Fields | Notes |
|---|---|---|
| `Client` | `Id`, `Name`, `ClientTypeId`, `UserId`, `Phone`, `Address`, `CreditLimit`, `OpeningBalance`, `IsActive` | `ClientTypeId=2` = Supplier |
| `ClientType` | `Id`, `Name` | Customer (1), Supplier (2) — seeded |

---

## Products & Inventory

| Entity | Key Fields | Notes |
|---|---|---|
| `Product` | `Id`, `Name`, `Sku`, `Unit`, `DefaultCost`, `DefaultPrice`, `Quantity`, `AverageCost`, `AveragePrice`, `CostChangeCount`, `PriceChangeCount`, `TotalQuantityPurchased`, `TotalQuantitySold`, `ReorderLevel`, `IsActive` | Weighted average cost/price auto-maintained |
| `StockMovement` | `Id`, `ProductId`, `MovementTypeId`, `MovementSourceId`, `Qty`, `UnitCost`, `UnitPrice`, `AverageCostAtMovement`, `AveragePriceAtMovement`, `MovementDate` | Snapshot averages at creation time |
| `ProductUser` | `ProductId`, `UserId`, `Date` | Join table — scopes stock movements to users |
| `MovementType` | `Id`, `Name` | In (1), Out (2), Adjustment (3) — seeded |
| `MovementSource` | `Id`, `Name` | Purchase (1), Sale (2), Manual (3) — seeded |

---

## Orders (Sales)

| Entity | Key Fields | Notes |
|---|---|---|
| `Order` | `Id`, `ClientId`, `StatusId`, `PaymentTypeId`, `OrderDate`, `Notes`, `CreatedAt` | |
| `OrderLine` | `Id`, `OrderId`, `ProductId`, `Qty decimal(14,2)`, `UnitPrice decimal(14,4)` | |
| `OrderStatus` | `Id`, `Name` | Pending(1), InProgressed(2), Delivered(3), Cancelled(4) — seeded |

---

## Purchases (Procurement)

| Entity | Key Fields | Notes |
|---|---|---|
| `Purchase` | `Id`, `SupplierId`, `StatusId`, `PaymentTypeId`, `PurchaseDate`, `Notes`, `CreatedAt` | `SupplierId` FK → `Client` where `ClientTypeId=2` |
| `PurchaseLine` | `Id`, `PurchaseId`, `ProductId`, `Qty decimal(14,2)`, `UnitCost decimal(14,4)` | |
| `PurchaseStatus` | `Id`, `Name` | Pending(1), InProgressed(2), Delivered(3), Cancelled(4) — seeded |

---

## Payments

| Entity | Key Fields | Notes |
|---|---|---|
| `Payment` | `Id`, `PartyClientId`, `PaymentDirectionId`, `TransModeId`, `Amount`, `PaymentDate`, `Notes`, `UserId`, `IsReversed`, `ReversedByPaymentId`, `OriginalPaymentId`, `TransactionId`, `CreatedAt` | Self-referencing reversal chain |
| `PaymentAllocation` | `Id`, `PaymentId`, `OrderId?`, `PurchaseId?`, `AllocatedAmount decimal(14,4)` | `OrderId` and `PurchaseId` mutually exclusive |
| `PaymentDirection` | `Id`, `Name` | Received(1), Paid(2), Adjustment(3) — seeded |
| `PaymentType` | `Id`, `Name` | Cash(1), Credit(2) — seeded |

---

## Financials

| Entity | Key Fields | Notes |
|---|---|---|
| `Transaction` | `Id`, `ClientId?`, `ProductId?`, `UserId`, `OrderId?`, `PurchaseId?`, `TransTypeId`, `TransModeId`, `TransCategoryId`, `Amount`, `TransDate`, `Notes`, `CreatedAt` | Payment transactions have `ClientId=NULL` |
| `Expense` | `Id`, `ExpenseTypeId`, `Amount`, `TransModeId`, `UserId`, `TransCategoryId`, `TransactionId?`, `ExpenseDate`, `Notes`, `CreatedAt` | |
| `TransType` | `Id`, `Name` | Debit(1), Credit(2) — seeded |
| `TransMode` | `Id`, `Name` | Cash(1), Bank(2), Credit(3) — seeded |
| `TransCategory` | `Id`, `Name` | Sales(1), Purchases(2), Office Expenses(3), Home Expenses(4), Cash In(5), Cash Out(6), Bank In(7), Bank Out(8) — seeded |
| `ExpenseType` | `Id`, `Name` | Office Expenses(1), Home Expenses(2) — seeded |

---

## Reporting Views (read-only)

| View | Entity | Key Columns | Description |
|---|---|---|---|
| `v_monthly_profit_loss` | `VMonthlyProfitLoss` | `Month`, `TotalSales`, `TotalPurchases`, `TotalExpenses`, `GrossProfit`, `NetProfit` | Filters `trans_category_id IN (1,2,3,4)` |
| `v_client_balance` | `VClientBalance` | `ClientId`, `Name`, `Balance` | Customers: order totals − received payments. Suppliers: purchase totals − paid payments. Excludes reversed payments. |
| `v_monthly_credit_debit` | `VMonthlyCreditDebit` | `Month`, `TotalCredit`, `TotalDebit`, `Balance` | Cash movements only — filters `trans_category_id IN (5,6,7,8)` |

---

## Ledger Posting Rules

| Event | TransCategoryId | TransTypeId | ClientId | Amount |
|---|---|---|---|---|
| Order Delivered | 1 (Sales) | 2 (Credit) | ClientId | +total |
| Order Cancelled | 1 (Sales) | 1 (Debit) | ClientId | −total |
| Purchase Delivered | 2 (Purchases) | 1 (Debit) | ClientId | +total |
| Purchase Cancelled | 2 (Purchases) | 2 (Credit) | ClientId | −total |
| Payment Received | 5 (Cash In) | 2 (Credit) | NULL | +amount |
| Payment Paid | 6 (Cash Out) | 1 (Debit) | NULL | +amount |

---

## Migrations Applied (in order)

| Migration | Change |
|---|---|
| `InitialMigrations` | Core schema |
| `AddedUserAsaForeignKeyInClient` | Client → User FK |
| `AddedExpensesForeingKeys` | Expense FKs |
| `AddViews` | Initial views |
| `removeLoginTable` | Removed legacy Login table |
| `UpdatedUserTable` | User fields update |
| `RefreshTokenTable` | Refresh token entity |
| `MakeRevokedAtNullable` | RefreshToken.RevokedAt nullable |
| `AddCreatedByIpToRefreshToken` | IP tracking on tokens |
| `AddedDefaultValueForEmailConfirmation` | Auto-confirm admin-created accounts |
| `ProductUserTableCreated` | ProductUser join table |
| `DroppingUserTable` | Removed redundant table |
| `RemovalOfUserId1fromTables` | FK cleanup |
| `ProductQuantityAdded` | Product.Quantity column |
| `ChangedQuantityColumnType` | Quantity → decimal |
| `AddTotalQuantityInProductTable` | TotalQuantitySold |
| `AddTotalQuantityPurchasedColumnAdded` | TotalQuantityPurchased |
| `UpdateMonthlyProfitLossView` | P&L view update |
| `UpdateMonthlyCreditDebit` | Credit/debit view |
| `AddOrderIdPurchaseIdToTransaction` | Transaction → Order/Purchase FKs |
| `AddPurchaseStatusAndStatusId` | PurchaseStatus table + Purchase.StatusId |
| `FixProfitLossViewCategoryMatching` | P&L view uses id-based category filter |
| `ChangeQtyToDecimalOnOrderAndPurchaseLines` | Qty → decimal(14,2) |
| `ChangeUnitCostAndPriceToDecimal14x4OnLines` | unit_price/unit_cost → decimal(14,4) |
| `AddPaymentAllocationTable` | PaymentAllocation entity |
| `AddFieldsToPayment` | Payment reversal chain + UserId + TransactionId |
| `UpdateVClientBalanceView` | v_client_balance redesigned to use payments table |
| `FixMonthlyCreditDebitView` | v_monthly_credit_debit filtered to cash movements only (categories 5–8) |

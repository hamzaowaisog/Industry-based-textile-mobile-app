# PDF API Guide

This guide explains how to add PDF export endpoints to your entities. All currency values default to **PKR (Pakistani Rupee)**.

---

## Quick Reference

### 1. Add Column Config (if not exists)

Edit `Models/PdfConfig.cs` and add your entity config to `EntityPdfConfigs`:

```csharp
public static readonly PdfColumnConfig[] YourEntity = [
    PdfColumnConfig.Create("PropertyName", "Display Header"),
    PdfColumnConfig.Create("Amount", "Amount (PKR)", PdfColumnFormat.Currency),  // PKR
    PdfColumnConfig.Create("Date", "Date", PdfColumnFormat.Date),
    PdfColumnConfig.Create("IsActive", "Active", PdfColumnFormat.Boolean),
];
```

### 2. Add Controller Endpoint

```csharp
[HttpGet("pdf")]
[Authorize(Policy = "YourPolicy")]
[ProducesResponseType(StatusCodes.Status200OK)]
public async Task<IActionResult> GetAllYourEntityPdf()
{
    var response = await _yourService.GetAllAsync();  // or GetByUserIdAsync(userId)
    if (!response.Success)
        return BadRequest(response.Message);

    var items = response.Data ?? new List<YourDto>();
    var pdfBytes = _pdfService.CreatePdf("Title", "Description", items, EntityPdfConfigs.YourEntity);
    return File(pdfBytes, "application/pdf", "your-entity.pdf");
}
```

### 3. Inject IPdfService

Add to constructor:

```csharp
private readonly IPdfService _pdfService;

public YourController(IYourService service, IPdfService pdfService)
{
    _yourService = service;
    _pdfService = pdfService;
}
```

---

## PdfColumnFormat Options

| Format   | Use For                    | Example Output        |
|----------|----------------------------|------------------------|
| `Text`   | Strings, numbers, IDs      | "ABC", "123"           |
| `Currency` | Money (PKR)              | Rs. 1,234.56           |
| `Date`   | DateTime, DateOnly         | 06 Feb 2025            |
| `Boolean` | Yes/No flags             | Yes, No                |

---

## PdfOptions Reference

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `BusinessName` | string | "Hamza Tex" | Header company name |
| `BusinessTagline` | string | "Your trusted partner..." | Header tagline |
| `SummaryProperty` | string | "" | Property to sum (e.g. "Amount") |
| `SummaryLabel` | string | "Total" | Label for summary row |
| `SummaryMultiplierProperty` | string? | null | For `Qty × Price` = total value |
| `CurrencyCulture` | string | "en-PK" | Currency format (PKR) |

---

## Endpoint Templates

### Template A: Simple List (no summary)

```csharp
[HttpGet("pdf")]
[ProducesResponseType(StatusCodes.Status200OK)]
public async Task<IActionResult> GetAllXxxPdf()
{
    var response = await _service.GetAllAsync();
    if (!response.Success) return BadRequest(response.Message);

    var items = response.Data ?? new List<XxxDto>();
    var pdfBytes = _pdfService.CreatePdf("Title", "Description", items, EntityPdfConfigs.Xxx);
    return File(pdfBytes, "application/pdf", "xxx.pdf");
}
```

**Use for:** ClientType, UserRole, or any entity without a sum.

---

### Template B: With Simple Sum (e.g. total amount)

```csharp
[HttpGet("pdf")]
[ProducesResponseType(StatusCodes.Status200OK)]
public async Task<IActionResult> GetAllXxxPdf()
{
    var response = await _service.GetAllAsync();
    if (!response.Success) return BadRequest(response.Message);

    var items = response.Data ?? new List<XxxDto>();
    var pdfBytes = _pdfService.CreatePdf("Title", "Description", items, EntityPdfConfigs.Xxx,
        new PdfOptions { SummaryProperty = "Amount", SummaryLabel = "Total Amount (PKR)" });
    return File(pdfBytes, "application/pdf", "xxx.pdf");
}
```

**Use for:** Client (OpeningBalance), Expense, Transaction, Payment.

---

### Template C: With Qty × Price Sum (Product style)

```csharp
[HttpGet("pdf")]
[ProducesResponseType(StatusCodes.Status200OK)]
public async Task<IActionResult> GetAllXxxPdf()
{
    var response = await _service.GetAllAsync();
    if (!response.Success) return BadRequest(response.Message);

    var items = response.Data ?? new List<XxxDto>();
    var pdfBytes = _pdfService.CreatePdf("Title", "Description", items, EntityPdfConfigs.Xxx,
        new PdfOptions
        {
            SummaryProperty = "UnitPrice",
            SummaryMultiplierProperty = "Quantity",
            SummaryLabel = "Total Value (Qty × Price)"
        });
    return File(pdfBytes, "application/pdf", "xxx.pdf");
}
```

**Use for:** OrderLine, PurchaseLine, or any entity with Qty and Price.

---

### Template D: User-Scoped (requires userId)

```csharp
[HttpGet("pdf")]
[Authorize(Policy = "Authenticated")]
[ProducesResponseType(StatusCodes.Status200OK)]
public async Task<IActionResult> GetAllXxxPdf()
{
    var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
    if (userIdClaim is null || !int.TryParse(userIdClaim.Value, out var userId))
        return Unauthorized("User identifier is missing or invalid in the token.");

    var response = await _service.GetAllByUserIdAsync(userId);
    if (!response.Success) return BadRequest(response.Message);

    var items = response.Data ?? new List<XxxDto>();
    var pdfBytes = _pdfService.CreatePdf("Title", "Description", items, EntityPdfConfigs.Xxx);
    return File(pdfBytes, "application/pdf", "xxx.pdf");
}
```

**Use for:** Product, Client (user's clients).

---

## Entity Configs to Add

Add these to `Models/PdfConfig.cs` when you create APIs for these entities:

### Order

```csharp
public static readonly PdfColumnConfig[] Order = [
    PdfColumnConfig.Create("Id", "ID"),
    PdfColumnConfig.Create("ClientId", "Client ID"),
    PdfColumnConfig.Create("StatusId", "Status"),
    PdfColumnConfig.Create("PaymentTypeId", "Payment Type"),
    PdfColumnConfig.Create("OrderDate", "Date", PdfColumnFormat.Date),
    PdfColumnConfig.Create("Notes", "Notes"),
];
```

### OrderLine (with Qty × Price)

```csharp
public static readonly PdfColumnConfig[] OrderLine = [
    PdfColumnConfig.Create("OrderId", "Order ID"),
    PdfColumnConfig.Create("ProductId", "Product ID"),
    PdfColumnConfig.Create("Qty", "Quantity"),
    PdfColumnConfig.Create("UnitPrice", "Unit Price (PKR)", PdfColumnFormat.Currency),
];
// PdfOptions: SummaryProperty = "UnitPrice", SummaryMultiplierProperty = "Qty"
```

### Expense

```csharp
public static readonly PdfColumnConfig[] Expense = [
    PdfColumnConfig.Create("ExpenseTypeId", "Type"),
    PdfColumnConfig.Create("Amount", "Amount (PKR)", PdfColumnFormat.Currency),
    PdfColumnConfig.Create("ExpenseDate", "Date", PdfColumnFormat.Date),
    PdfColumnConfig.Create("Notes", "Notes"),
];
// PdfOptions: SummaryProperty = "Amount", SummaryLabel = "Total Expenses"
```

### Transaction

```csharp
public static readonly PdfColumnConfig[] Transaction = [
    PdfColumnConfig.Create("ClientId", "Client ID"),
    PdfColumnConfig.Create("Amount", "Amount (PKR)", PdfColumnFormat.Currency),
    PdfColumnConfig.Create("TransDate", "Date", PdfColumnFormat.Date),
    PdfColumnConfig.Create("TransTypeId", "Type"),
    PdfColumnConfig.Create("Notes", "Notes"),
];
// PdfOptions: SummaryProperty = "Amount"
```

### Purchase

```csharp
public static readonly PdfColumnConfig[] Purchase = [
    PdfColumnConfig.Create("SupplierId", "Supplier ID"),
    PdfColumnConfig.Create("PaymentTypeId", "Payment Type"),
    PdfColumnConfig.Create("PurchaseDate", "Date", PdfColumnFormat.Date),
    PdfColumnConfig.Create("Notes", "Notes"),
];
```

### PurchaseLine

```csharp
public static readonly PdfColumnConfig[] PurchaseLine = [
    PdfColumnConfig.Create("PurchaseId", "Purchase ID"),
    PdfColumnConfig.Create("ProductId", "Product ID"),
    PdfColumnConfig.Create("Qty", "Quantity"),
    PdfColumnConfig.Create("UnitCost", "Unit Cost (PKR)", PdfColumnFormat.Currency),
];
// PdfOptions: SummaryProperty = "UnitCost", SummaryMultiplierProperty = "Qty"
```

### Payment

```csharp
public static readonly PdfColumnConfig[] Payment = [
    PdfColumnConfig.Create("PartyClientId", "Client ID"),
    PdfColumnConfig.Create("Amount", "Amount (PKR)", PdfColumnFormat.Currency),
    PdfColumnConfig.Create("PaymentDate", "Date", PdfColumnFormat.Date),
    PdfColumnConfig.Create("PaymentDirectionId", "Direction"),
    PdfColumnConfig.Create("Notes", "Notes"),
];
// PdfOptions: SummaryProperty = "Amount"
```

### ExpenseType / TransType / TransCategory (lookup tables)

```csharp
public static readonly PdfColumnConfig[] ExpenseType = [
    PdfColumnConfig.Create("Id", "ID"),
    PdfColumnConfig.Create("Name", "Name"),
];
```

---

## Existing PDF Endpoints

| Endpoint | Entity | Auth | Summary |
|----------|--------|------|---------|
| `GET /api/Product/pdf` | Product | Authenticated | Qty × Price |
| `GET /api/Client/pdf` | Client | Authenticated | Opening Balance |
| `GET /api/ClientType/pdf` | ClientType | AdminOnly | — |
| `GET /api/UserRole/pdf` | UserRole | AdminOnly | — |
| `GET /api/Users/pdf` | User | AdminOrStaff | — |

---

## Custom Columns (one-off)

For a one-off report without adding to `EntityPdfConfigs`:

```csharp
var customColumns = new[]
{
    PdfColumnConfig.Create("Name", "Name"),
    PdfColumnConfig.Create("Amount", "Amount (PKR)", PdfColumnFormat.Currency),
};
var pdfBytes = _pdfService.CreatePdf("Custom Report", "Description", data, customColumns);
```

---

## Include Only Some Columns (Filter)

Use `EntityPdfConfigs.Filter()` to include a subset of columns. Order is preserved.

```csharp
// Only Name, SKU, and Price (in that order)
var columns = EntityPdfConfigs.Filter(EntityPdfConfigs.Product, "Name", "Sku", "DefaultPrice");
var pdfBytes = _pdfService.CreatePdf("Products", "Simplified list", products, columns);
```

```csharp
// Only a few client columns
var columns = EntityPdfConfigs.Filter(EntityPdfConfigs.Client, "Name", "Phone", "OpeningBalance");
var pdfBytes = _pdfService.CreatePdf("Clients", "Contact list", clients, columns);
```

---

## Checklist for New Entity

- [ ] Add DTO if not exists
- [ ] Add `EntityPdfConfigs.YourEntity` in `PdfConfig.cs`
- [ ] Add `IPdfService` to controller constructor
- [ ] Add `[HttpGet("pdf")]` endpoint using the right template (A, B, C, or D)
- [ ] Set `SummaryProperty` / `SummaryMultiplierProperty` if needed
- [ ] Use `PdfColumnFormat.Currency` for all PKR amounts

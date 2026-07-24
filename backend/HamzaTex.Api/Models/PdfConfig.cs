using System.Linq;

namespace HamzaTex.Api.Models;

/// <summary>
/// Defines how a column should be displayed in a PDF report
/// </summary>
public class PdfColumnConfig
{
    /// <summary>Property name for reflection (must match DTO property)</summary>
    public string PropertyName { get; set; } = string.Empty;

    /// <summary>Display name shown in the table header</summary>
    public string DisplayName { get; set; } = string.Empty;

    /// <summary>How to format the value (Text, Currency, Date, Boolean, Percentage)</summary>
    public PdfColumnFormat Format { get; set; } = PdfColumnFormat.Text;

    /// <summary>Relative column width in the table (1 = default). Give wide text columns
    /// (Name, Address, Notes) a higher weight and narrow columns (Type, Active, Date) a lower one
    /// so headers/values don't truncate on A4 portrait.</summary>
    public float Weight { get; set; } = 1f;

    /// <summary>Fixed column width in millimetres. When set, the column is sized exactly — ideal
    /// for short, predictable values (Type, Status, Phone, Date) so they fit on one line with no
    /// wasted space. When null, the column shares the remaining width proportionally to
    /// <see cref="Weight"/> and long text wraps within it.</summary>
    public float? FixedWidthMm { get; set; }

    public static PdfColumnConfig Create(string propertyName, string displayName, PdfColumnFormat format = PdfColumnFormat.Text, float weight = 1f, float? fixedWidthMm = null)
        => new() { PropertyName = propertyName, DisplayName = displayName, Format = format, Weight = weight, FixedWidthMm = fixedWidthMm };
}

public enum PdfColumnFormat
{
    Text,
    Currency,
    Date,
    Boolean,
    Percentage
}

/// <summary>
/// Predefined PDF configurations for each entity type
/// </summary>
public static class EntityPdfConfigs
{
    public static readonly PdfColumnConfig[] Product = [
        PdfColumnConfig.Create("Name", "Product Name", weight: 1.8f),
        PdfColumnConfig.Create("Sku", "SKU", fixedWidthMm: 26),
        PdfColumnConfig.Create("UnitName", "Unit", fixedWidthMm: 16),
        PdfColumnConfig.Create("DefaultCost", "Cost/meter (PKR)", PdfColumnFormat.Currency, fixedWidthMm: 26),
        PdfColumnConfig.Create("DefaultPrice", "Price/meter (PKR)", PdfColumnFormat.Currency, fixedWidthMm: 26),
        PdfColumnConfig.Create("Quantity", "Quantity (meters)", fixedWidthMm: 20),
        PdfColumnConfig.Create("ReorderLevel", "Reorder Level", fixedWidthMm: 20),
    ];

    public static readonly PdfColumnConfig[] Client = [
        PdfColumnConfig.Create("Name", "Client Name", weight: 1.8f),
        PdfColumnConfig.Create("ClientTypeName", "Type", fixedWidthMm: 22),
        PdfColumnConfig.Create("Phone", "Phone", fixedWidthMm: 30),
        PdfColumnConfig.Create("Address", "Address", weight: 2.5f),
        PdfColumnConfig.Create("CreditLimit", "Credit Limit (PKR)", PdfColumnFormat.Currency, fixedWidthMm: 26),
        PdfColumnConfig.Create("OpeningBalance", "Opening Balance (PKR)", PdfColumnFormat.Currency, fixedWidthMm: 26),
    ];

    public static readonly PdfColumnConfig[] ClientType = [
        PdfColumnConfig.Create("Name", "Name"),
    ];

    public static readonly PdfColumnConfig[] UserRole = [
        PdfColumnConfig.Create("Name", "Role Name"),
    ];

    public static readonly PdfColumnConfig[] User = [
        PdfColumnConfig.Create("Name", "Name", weight: 1.4f),
        PdfColumnConfig.Create("Email", "Email", weight: 1.8f),
        PdfColumnConfig.Create("UserName", "Username", weight: 1.3f),
        PdfColumnConfig.Create("PhoneNumber", "Phone", fixedWidthMm: 30),
        PdfColumnConfig.Create("CreatedAt", "Created", PdfColumnFormat.Date, fixedWidthMm: 24),
    ];

    public static readonly PdfColumnConfig[] Order = [
        PdfColumnConfig.Create("ClientName", "Client", weight: 1.8f),
        PdfColumnConfig.Create("BillNo", "Bill No", fixedWidthMm: 26),
        PdfColumnConfig.Create("StatusName", "Status", fixedWidthMm: 22),
        PdfColumnConfig.Create("PaymentTypeName", "Payment Type", fixedWidthMm: 26),
        PdfColumnConfig.Create("OrderDate", "Order Date", PdfColumnFormat.Date, fixedWidthMm: 24),
        PdfColumnConfig.Create("OrderDateHijriDisplay", "Hijri Date", weight: 1.2f),
        PdfColumnConfig.Create("Total", "Total (PKR)", PdfColumnFormat.Currency, fixedWidthMm: 26),
        PdfColumnConfig.Create("Notes", "Notes", weight: 1.8f),
    ];

    public static readonly PdfColumnConfig[] Purchase = [
        PdfColumnConfig.Create("SupplierName", "Supplier", weight: 1.8f),
        PdfColumnConfig.Create("BillNo", "Bill No", fixedWidthMm: 26),
        PdfColumnConfig.Create("StatusName", "Status", fixedWidthMm: 22),
        PdfColumnConfig.Create("PaymentTypeName", "Payment Type", fixedWidthMm: 26),
        PdfColumnConfig.Create("PurchaseDate", "Purchase Date", PdfColumnFormat.Date, fixedWidthMm: 24),
        PdfColumnConfig.Create("PurchaseDateHijriDisplay", "Hijri Date", weight: 1.2f),
        PdfColumnConfig.Create("Total", "Total (PKR)", PdfColumnFormat.Currency, fixedWidthMm: 26),
        PdfColumnConfig.Create("Notes", "Notes", weight: 1.8f),
    ];

    public static readonly PdfColumnConfig[] Payment = [
        PdfColumnConfig.Create("PartyClientName", "Client", weight: 1.7f),
        PdfColumnConfig.Create("PaymentDirectionName", "Direction", fixedWidthMm: 24),
        PdfColumnConfig.Create("TransModeName", "Mode", fixedWidthMm: 22),
        PdfColumnConfig.Create("Amount", "Amount (PKR)", PdfColumnFormat.Currency, fixedWidthMm: 26),
        PdfColumnConfig.Create("PaymentDate", "Date", PdfColumnFormat.Date, fixedWidthMm: 24),
        PdfColumnConfig.Create("PaymentDateHijriDisplay", "Hijri Date", weight: 1.2f),
        PdfColumnConfig.Create("RecordedByName", "Recorded By", weight: 1.3f),
        PdfColumnConfig.Create("IsReversed", "Reversed", PdfColumnFormat.Boolean, fixedWidthMm: 22),
    ];

    public static readonly PdfColumnConfig[] StockMovement = [
        PdfColumnConfig.Create("ProductName", "Product", weight: 1.9f),
        PdfColumnConfig.Create("MovementTypeName", "Type", weight: 0.85f),
        PdfColumnConfig.Create("MovementSourceName", "Source", weight: 0.9f),
        PdfColumnConfig.Create("Qty", "Quantity", weight: 0.8f),
        PdfColumnConfig.Create("UnitName", "Unit", weight: 0.7f),
        PdfColumnConfig.Create("UnitCost", "Unit Cost (PKR)", PdfColumnFormat.Currency, 1.05f),
        PdfColumnConfig.Create("UnitPrice", "Unit Price (PKR)", PdfColumnFormat.Currency, 1.05f),
        PdfColumnConfig.Create("AverageCostAtMovement", "Avg Cost (PKR)", PdfColumnFormat.Currency, 1.05f),
        PdfColumnConfig.Create("AveragePriceAtMovement", "Avg Price (PKR)", PdfColumnFormat.Currency, 1.05f),
        PdfColumnConfig.Create("MovementDate", "Date", PdfColumnFormat.Date, 1f),
    ];

    public static readonly PdfColumnConfig[] Expense = [
        PdfColumnConfig.Create("ExpenseTypeName", "Type", weight: 0.9f),
        PdfColumnConfig.Create("Amount", "Amount (PKR)", PdfColumnFormat.Currency, 1.15f),
        PdfColumnConfig.Create("TransModeName", "Mode", weight: 0.85f),
        PdfColumnConfig.Create("TransCategoryName", "Category", weight: 1.1f),
        PdfColumnConfig.Create("ExpenseDate", "Date", PdfColumnFormat.Date, 1f),
        PdfColumnConfig.Create("ExpenseDateHijriDisplay", "Hijri Date", weight: 1.2f),
        PdfColumnConfig.Create("RecordedByName", "Recorded By", weight: 1.2f),
        PdfColumnConfig.Create("Notes", "Notes", weight: 1.8f),
    ];

    public static readonly PdfColumnConfig[] ExpenseType = [
        PdfColumnConfig.Create("Name", "Type Name"),
    ];

    public static readonly PdfColumnConfig[] Transaction = [
        PdfColumnConfig.Create("Source", "Source", fixedWidthMm: 22),
        PdfColumnConfig.Create("TransCategoryName", "Category", weight: 1.2f),
        PdfColumnConfig.Create("TransTypeName", "Type", fixedWidthMm: 20),
        PdfColumnConfig.Create("TransModeName", "Mode", fixedWidthMm: 22),
        PdfColumnConfig.Create("Amount", "Amount (PKR)", PdfColumnFormat.Currency, fixedWidthMm: 26),
        PdfColumnConfig.Create("TransDate", "Date", PdfColumnFormat.Date, fixedWidthMm: 24),
        PdfColumnConfig.Create("ClientName", "Client", weight: 1.6f),
    ];

    public static readonly PdfColumnConfig[] ProfitLoss = [
        PdfColumnConfig.Create("Month", "Month"),
        PdfColumnConfig.Create("TotalSales", "Sales (PKR)", PdfColumnFormat.Currency),
        PdfColumnConfig.Create("TotalPurchases", "Purchases (PKR)", PdfColumnFormat.Currency),
        PdfColumnConfig.Create("TotalExpenses", "Expenses (PKR)", PdfColumnFormat.Currency),
        PdfColumnConfig.Create("GrossProfit", "Gross Profit (PKR)", PdfColumnFormat.Currency),
        PdfColumnConfig.Create("NetProfit", "Net Profit (PKR)", PdfColumnFormat.Currency),
    ];

    public static readonly PdfColumnConfig[] ClientBalance = [
        PdfColumnConfig.Create("Name", "Client Name"),
        PdfColumnConfig.Create("Balance", "Balance (PKR)", PdfColumnFormat.Currency),
    ];

    public static readonly PdfColumnConfig[] CreditDebit = [
        PdfColumnConfig.Create("Month", "Month"),
        PdfColumnConfig.Create("TotalCredit", "Credit (PKR)", PdfColumnFormat.Currency),
        PdfColumnConfig.Create("TotalDebit", "Debit (PKR)", PdfColumnFormat.Currency),
        PdfColumnConfig.Create("Balance", "Balance (PKR)", PdfColumnFormat.Currency),
    ];

    public static readonly PdfColumnConfig[] SummaryTotals = [
        PdfColumnConfig.Create("TotalSalesAmount", "Total Sales (PKR)", PdfColumnFormat.Currency),
        PdfColumnConfig.Create("TotalPurchasesAmount", "Total Purchases (PKR)", PdfColumnFormat.Currency),
        PdfColumnConfig.Create("TotalExpensesAmount", "Total Expenses (PKR)", PdfColumnFormat.Currency),
        PdfColumnConfig.Create("TotalOrderCount", "Total Orders"),
        PdfColumnConfig.Create("TotalPurchaseCount", "Total Purchases"),
        PdfColumnConfig.Create("TotalClientsCount", "Total Clients"),
    ];

    public static readonly PdfColumnConfig[] ClientDetail = [
        PdfColumnConfig.Create("ClientName", "Client"),
        PdfColumnConfig.Create("ClientTypeName", "Type"),
        PdfColumnConfig.Create("TotalOrderCount", "Orders"),
        PdfColumnConfig.Create("TotalOrderAmount", "Order Total (PKR)", PdfColumnFormat.Currency),
        PdfColumnConfig.Create("TotalPurchaseCount", "Purchases"),
        PdfColumnConfig.Create("TotalPurchaseAmount", "Purchase Total (PKR)", PdfColumnFormat.Currency),
        PdfColumnConfig.Create("Balance", "Balance (PKR)", PdfColumnFormat.Currency),
    ];

    public static readonly PdfColumnConfig[] Invoice =
    [
        PdfColumnConfig.Create("InvoiceNumber", nameof(InvoiceDto.InvoiceNumber)),
        PdfColumnConfig.Create("Client",        nameof(InvoiceDto.ClientName)),
        PdfColumnConfig.Create("Direction",     nameof(InvoiceDto.Direction)),
        PdfColumnConfig.Create("Status",        nameof(InvoiceDto.StatusName)),
        PdfColumnConfig.Create("Total",         nameof(InvoiceDto.TotalAmount)),
        PdfColumnConfig.Create("Paid",          nameof(InvoiceDto.AmountPaid)),
        PdfColumnConfig.Create("Outstanding",   nameof(InvoiceDto.Outstanding)),
        PdfColumnConfig.Create("Issue Date",    nameof(InvoiceDto.IssueDate)),
        PdfColumnConfig.Create("Hijri Date",    nameof(InvoiceDto.IssueDateHijriDisplay)),
    ];

    /// <summary>
    /// Returns only the columns matching the given property names. Use to include a subset of columns in PDF.
    /// </summary>
    /// <param name="columns">Source column config (e.g. EntityPdfConfigs.Product)</param>
    /// <param name="propertyNames">Property names to include. Order is preserved.</param>
    /// <example>
    /// var cols = EntityPdfConfigs.Filter(EntityPdfConfigs.Product, "Name", "Sku", "DefaultPrice");
    /// </example>
    public static PdfColumnConfig[] Filter(PdfColumnConfig[] columns, params string[] propertyNames)
    {
        var lookup = columns.ToDictionary(c => c.PropertyName, c => c, StringComparer.OrdinalIgnoreCase);
        return propertyNames
            .Where(lookup.ContainsKey)
            .Select(name => lookup[name])
            .ToArray();
    }
}

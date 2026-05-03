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

    public static PdfColumnConfig Create(string propertyName, string displayName, PdfColumnFormat format = PdfColumnFormat.Text)
        => new() { PropertyName = propertyName, DisplayName = displayName, Format = format };
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
        PdfColumnConfig.Create("Name", "Product Name"),
        PdfColumnConfig.Create("Sku", "SKU"),
        PdfColumnConfig.Create("Unit", "Unit"),
        PdfColumnConfig.Create("DefaultCost", "Cost/meter (PKR)", PdfColumnFormat.Currency),
        PdfColumnConfig.Create("DefaultPrice", "Price/meter (PKR)", PdfColumnFormat.Currency),
        PdfColumnConfig.Create("Quantity", "Quantity (meters)"),
        PdfColumnConfig.Create("ReorderLevel", "Reorder Level"),
        PdfColumnConfig.Create("IsActive", "Active", PdfColumnFormat.Boolean),
    ];

    public static readonly PdfColumnConfig[] Client = [
        PdfColumnConfig.Create("Name", "Client Name"),
        PdfColumnConfig.Create("ClientTypeId", "Type ID"),
        PdfColumnConfig.Create("Phone", "Phone"),
        PdfColumnConfig.Create("Address", "Address"),
        PdfColumnConfig.Create("CreditLimit", "Credit Limit (PKR)", PdfColumnFormat.Currency),
        PdfColumnConfig.Create("OpeningBalance", "Opening Balance (PKR)", PdfColumnFormat.Currency),
        PdfColumnConfig.Create("IsActive", "Active", PdfColumnFormat.Boolean),
        PdfColumnConfig.Create("CreatedAt", "Created", PdfColumnFormat.Date),
    ];

    public static readonly PdfColumnConfig[] ClientType = [
        PdfColumnConfig.Create("Name", "Name"),
    ];

    public static readonly PdfColumnConfig[] UserRole = [
        PdfColumnConfig.Create("Name", "Role Name"),
    ];

    public static readonly PdfColumnConfig[] User = [
        PdfColumnConfig.Create("Name", "Name"),
        PdfColumnConfig.Create("Email", "Email"),
        PdfColumnConfig.Create("UserName", "Username"),
        PdfColumnConfig.Create("PhoneNumber", "Phone"),
        PdfColumnConfig.Create("IsActive", "Active", PdfColumnFormat.Boolean),
        PdfColumnConfig.Create("CreatedAt", "Created", PdfColumnFormat.Date),
    ];

    public static readonly PdfColumnConfig[] Order = [
        PdfColumnConfig.Create("ClientName", "Client"),
        PdfColumnConfig.Create("StatusName", "Status"),
        PdfColumnConfig.Create("PaymentTypeName", "Payment Type"),
        PdfColumnConfig.Create("OrderDate", "Order Date", PdfColumnFormat.Date),
        PdfColumnConfig.Create("Total", "Total (PKR)", PdfColumnFormat.Currency),
        PdfColumnConfig.Create("Notes", "Notes"),
        PdfColumnConfig.Create("CreatedAt", "Created", PdfColumnFormat.Date),
    ];

    public static readonly PdfColumnConfig[] Purchase = [
        PdfColumnConfig.Create("SupplierName", "Supplier"),
        PdfColumnConfig.Create("StatusName", "Status"),
        PdfColumnConfig.Create("PaymentTypeName", "Payment Type"),
        PdfColumnConfig.Create("PurchaseDate", "Purchase Date", PdfColumnFormat.Date),
        PdfColumnConfig.Create("Total", "Total (PKR)", PdfColumnFormat.Currency),
        PdfColumnConfig.Create("Notes", "Notes"),
        PdfColumnConfig.Create("CreatedAt", "Created", PdfColumnFormat.Date),
    ];

    public static readonly PdfColumnConfig[] Payment = [
        PdfColumnConfig.Create("PartyClientName", "Client"),
        PdfColumnConfig.Create("PaymentDirectionName", "Direction"),
        PdfColumnConfig.Create("TransModeName", "Mode"),
        PdfColumnConfig.Create("Amount", "Amount (PKR)", PdfColumnFormat.Currency),
        PdfColumnConfig.Create("PaymentDate", "Date", PdfColumnFormat.Date),
        PdfColumnConfig.Create("RecordedByName", "Recorded By"),
        PdfColumnConfig.Create("IsReversed", "Reversed"),
        PdfColumnConfig.Create("Notes", "Notes"),
    ];

    public static readonly PdfColumnConfig[] StockMovement = [
        PdfColumnConfig.Create("ProductName", "Product"),
        PdfColumnConfig.Create("MovementTypeName", "Type"),
        PdfColumnConfig.Create("MovementSourceName", "Source"),
        PdfColumnConfig.Create("Qty", "Quantity"),
        PdfColumnConfig.Create("UnitCost", "Unit Cost (PKR)", PdfColumnFormat.Currency),
        PdfColumnConfig.Create("UnitPrice", "Unit Price (PKR)", PdfColumnFormat.Currency),
        PdfColumnConfig.Create("AverageCostAtMovement", "Avg Cost Snapshot (PKR)", PdfColumnFormat.Currency),
        PdfColumnConfig.Create("AveragePriceAtMovement", "Avg Price Snapshot (PKR)", PdfColumnFormat.Currency),
        PdfColumnConfig.Create("MovementDate", "Date", PdfColumnFormat.Date),
    ];

    public static readonly PdfColumnConfig[] Expense = [
        PdfColumnConfig.Create("ExpenseTypeName", "Type"),
        PdfColumnConfig.Create("Amount", "Amount (PKR)", PdfColumnFormat.Currency),
        PdfColumnConfig.Create("TransModeName", "Mode"),
        PdfColumnConfig.Create("TransCategoryName", "Category"),
        PdfColumnConfig.Create("ExpenseDate", "Date", PdfColumnFormat.Date),
        PdfColumnConfig.Create("RecordedByName", "Recorded By"),
        PdfColumnConfig.Create("Notes", "Notes"),
    ];

    public static readonly PdfColumnConfig[] ExpenseType = [
        PdfColumnConfig.Create("Name", "Type Name"),
    ];

    public static readonly PdfColumnConfig[] Transaction = [
        PdfColumnConfig.Create("Source", "Source"),
        PdfColumnConfig.Create("TransCategoryName", "Category"),
        PdfColumnConfig.Create("TransTypeName", "Type"),
        PdfColumnConfig.Create("TransModeName", "Mode"),
        PdfColumnConfig.Create("Amount", "Amount (PKR)", PdfColumnFormat.Currency),
        PdfColumnConfig.Create("TransDate", "Date", PdfColumnFormat.Date),
        PdfColumnConfig.Create("ClientName", "Client"),
        PdfColumnConfig.Create("Notes", "Notes"),
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

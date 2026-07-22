namespace HamzaTex.Api.Models;

/// <summary>Flat invoice row used in paginated list, filtered, and by-client responses.</summary>
public class InvoiceDto
{
    public int Id { get; set; }
    public string InvoiceNumber { get; set; } = string.Empty;
    public int? OrderId { get; set; }
    public int? PurchaseId { get; set; }
    public int ClientId { get; set; }
    public string ClientName { get; set; } = string.Empty;
    public string ClientTypeName { get; set; } = string.Empty; // "Customer" | "Supplier"
    public string Direction { get; set; } = string.Empty; // "Receivable" | "Payable"
    public string Type { get; set; } = string.Empty; // "Order" | "Purchase" | "Standalone"
    public int InvoiceStatusId { get; set; }
    public string StatusName { get; set; } = string.Empty;
    public DateOnly? IssueDate { get; set; }
    public string? IssueDateHijri { get; set; }
    public string? IssueDateHijriDisplay { get; set; }
    public DateOnly? DueDate { get; set; }
    public string? DueDateHijri { get; set; }
    public string? DueDateHijriDisplay { get; set; }
    public decimal TotalAmount { get; set; }
    public decimal AmountPaid { get; set; }
    public decimal Outstanding { get; set; }
    public string? Notes { get; set; }
    public DateOnly CreatedAt { get; set; }
}

/// <summary>Full invoice detail including lines and linked transactions.</summary>
public class InvoiceDetailDto : InvoiceDto
{
    public List<InvoiceLineDto> Lines { get; set; } = [];
    public List<InvoiceTransactionSummary> LinkedTransactions { get; set; } = [];
}

public class InvoiceLineDto
{
    public int Id { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public decimal Qty { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal LineTotal { get; set; }
}

public class InvoiceTransactionSummary
{
    public int TransactionId { get; set; }
    public DateOnly TransDate { get; set; }
    public string CategoryName { get; set; } = string.Empty;
    public string TypeName { get; set; } = string.Empty;
    public decimal Amount { get; set; }
}

/// <summary>Aggregate receivable/payable totals and total count across the full (non-paginated) invoice set, excluding cancelled invoices from the amount totals.</summary>
public class InvoiceSummaryDto
{
    public decimal TotalReceivable { get; set; }
    public decimal TotalPayable { get; set; }
    public int TotalCount { get; set; }
}

/// <summary>Client invoice summary: aggregate stats + per-invoice list.</summary>
public class InvoiceByClientDto
{
    public int ClientId { get; set; }
    public string ClientName { get; set; } = string.Empty;
    public string ClientTypeName { get; set; } = string.Empty; // "Customer" | "Supplier"
    public string Direction { get; set; } = string.Empty; // "Receivable" | "Payable"
    public decimal TotalInvoiced { get; set; }
    public decimal TotalPaid { get; set; }
    public decimal TotalReceivable { get; set; } // Customer: amount they still owe us
    public decimal TotalPayable { get; set; }    // Supplier: amount we still owe them
    public List<InvoiceDto> Invoices { get; set; } = [];
}

/// <summary>Input DTO for creating a standalone invoice.</summary>
public class CreateInvoiceDto
{
    public int? OrderId { get; set; }
    public int? PurchaseId { get; set; }
    public int ClientId { get; set; }
    public DateOnly? DueDate { get; set; }
    public string? DueDateHijri { get; set; }
    public decimal TotalAmount { get; set; }
    public string? Notes { get; set; }
    public List<CreateInvoiceLineDto> Lines { get; set; } = [];
}

public class CreateInvoiceLineDto
{
    public string ProductName { get; set; } = string.Empty;
    public decimal Qty { get; set; }
    public decimal UnitPrice { get; set; }
}

/// <summary>Input DTO for updating an invoice.</summary>
public class UpdateInvoiceDto
{
    public int? InvoiceStatusId { get; set; }
    public DateOnly? DueDate { get; set; }
    public string? Notes { get; set; }
    public decimal? TotalAmount { get; set; }
    public List<CreateInvoiceLineDto>? Lines { get; set; }
}

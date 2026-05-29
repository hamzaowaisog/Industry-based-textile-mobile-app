namespace HamzaTex.Api.Models;

// ─── Per-entity push DTOs ────────────────────────────────────────────────────

public class SyncClientDto
{
    public string? LocalId { get; set; }
    public int? ServerId { get; set; }
    public int Version { get; set; }
    public bool ForceOverwrite { get; set; }
    public string Name { get; set; } = string.Empty;
    public int? ClientTypeId { get; set; }
    public int? UserId { get; set; }
    public string? Phone { get; set; }
    public string? Address { get; set; }
    public decimal? CreditLimit { get; set; }
    public decimal? OpeningBalance { get; set; }
    public string? Notes { get; set; }
    public bool IsActive { get; set; } = true;
    public DateOnly? CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}

public class SyncOrderDto
{
    public string? LocalId { get; set; }
    public int? ServerId { get; set; }
    public int Version { get; set; }
    public bool ForceOverwrite { get; set; }
    public int? ClientId { get; set; }
    public int? StatusId { get; set; }
    public int? PaymentTypeId { get; set; }
    public DateOnly OrderDate { get; set; }
    public string? Notes { get; set; }
    public DateOnly? CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public List<SyncOrderLineDto> OrderLines { get; set; } = [];
}

public class SyncOrderLineDto
{
    public int? ProductId { get; set; }
    public decimal Qty { get; set; }
    public decimal UnitPrice { get; set; }
    public DateTime? UpdatedAt { get; set; }
}

public class SyncPurchaseDto
{
    public string? LocalId { get; set; }
    public int? ServerId { get; set; }
    public int Version { get; set; }
    public bool ForceOverwrite { get; set; }
    public int? SupplierId { get; set; }
    public int? StatusId { get; set; }
    public int? PaymentTypeId { get; set; }
    public DateOnly PurchaseDate { get; set; }
    public string? Notes { get; set; }
    public DateOnly? CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public List<SyncPurchaseLineDto> PurchaseLines { get; set; } = [];
}

public class SyncPurchaseLineDto
{
    public int? ProductId { get; set; }
    public decimal Qty { get; set; }
    public decimal UnitCost { get; set; }
    public DateTime? UpdatedAt { get; set; }
}

public class SyncPaymentDto
{
    public string? LocalId { get; set; }
    public int? ServerId { get; set; }
    public int Version { get; set; }
    public bool ForceOverwrite { get; set; }
    public int? PartyClientId { get; set; }
    public int? PaymentDirectionId { get; set; }
    public int? TransModeId { get; set; }
    public decimal Amount { get; set; }
    public DateOnly PaymentDate { get; set; }
    public string? Notes { get; set; }
    public DateOnly? CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}

public class SyncExpenseDto
{
    public string? LocalId { get; set; }
    public int? ServerId { get; set; }
    public int Version { get; set; }
    public bool ForceOverwrite { get; set; }
    public int? ExpenseTypeId { get; set; }
    public decimal Amount { get; set; }
    public int? TransModeId { get; set; }
    public int? TransCategoryId { get; set; }
    public DateOnly ExpenseDate { get; set; }
    public string? Notes { get; set; }
    public DateOnly? CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}

public class SyncStockMovementDto
{
    public string? LocalId { get; set; }
    public int? ServerId { get; set; }
    public int Version { get; set; }
    public bool ForceOverwrite { get; set; }
    public int? ProductId { get; set; }
    public int? MovementTypeId { get; set; }
    public int? MovementSourceId { get; set; }
    public decimal? Qty { get; set; }
    public decimal? UnitCost { get; set; }
    public decimal? UnitPrice { get; set; }
    public DateOnly MovementDate { get; set; }
    public DateTime? UpdatedAt { get; set; }
}

// ─── Full-pull read DTOs ─────────────────────────────────────────────────────

public class SyncProductDto
{
    public string? LocalId { get; set; }
    public int? ServerId { get; set; }
    public int Version { get; set; }
    public bool ForceOverwrite { get; set; }
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Sku { get; set; } = string.Empty;
    public string Unit { get; set; } = string.Empty;
    public decimal? DefaultCost { get; set; }
    public decimal? DefaultPrice { get; set; }
    public decimal? Quantity { get; set; }
    public decimal? AverageCost { get; set; }
    public decimal? AveragePrice { get; set; }
    public int? CostChangeCount { get; set; }
    public int? PriceChangeCount { get; set; }
    public decimal? TotalQuantityPurchased { get; set; }
    public decimal? TotalQuantitySold { get; set; }
    public int? ReorderLevel { get; set; }
    public bool? IsActive { get; set; }
    public DateOnly? CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}

public class SyncTransactionDto
{
    public string? LocalId { get; set; }
    public int? ServerId { get; set; }
    public int Version { get; set; }
    public bool ForceOverwrite { get; set; }
    public int Id { get; set; }
    public int? ClientId { get; set; }
    public int? UserId { get; set; }
    public int? OrderId { get; set; }
    public int? PurchaseId { get; set; }
    public int? TransTypeId { get; set; }
    public int? TransModeId { get; set; }
    public int? TransCategoryId { get; set; }
    public decimal Amount { get; set; }
    public DateOnly TransDate { get; set; }
    public string? Notes { get; set; }
    public DateOnly? CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}

public class SyncInvoiceDto
{
    public string? LocalId { get; set; }
    public int? ServerId { get; set; }
    public int Version { get; set; }
    public bool ForceOverwrite { get; set; }
    public int Id { get; set; }
    public string InvoiceNumber { get; set; } = string.Empty;
    public int? OrderId { get; set; }
    public int? PurchaseId { get; set; }
    public int? ClientId { get; set; }
    public int InvoiceStatusId { get; set; }
    public DateOnly? IssueDate { get; set; }
    public DateOnly? DueDate { get; set; }
    public decimal TotalAmount { get; set; }
    public string? Notes { get; set; }
    public DateOnly CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public List<SyncInvoiceLineDto> InvoiceLines { get; set; } = [];
}

public class SyncInvoiceLineDto
{
    public string ProductName { get; set; } = string.Empty;
    public decimal Qty { get; set; }
    public decimal UnitPrice { get; set; }
    public DateTime? UpdatedAt { get; set; }
}

// ─── Push request / response ─────────────────────────────────────────────────

public class SyncPushDto
{
    public List<SyncClientDto> Clients { get; set; } = [];
    public List<SyncProductDto> Products { get; set; } = [];
    public List<SyncOrderDto> Orders { get; set; } = [];
    public List<SyncPurchaseDto> Purchases { get; set; } = [];
    public List<SyncPaymentDto> Payments { get; set; } = [];
    public List<SyncExpenseDto> Expenses { get; set; } = [];
    public List<SyncStockMovementDto> StockMovements { get; set; } = [];
    public List<SyncTransactionDto> Transactions { get; set; } = [];
    public List<SyncInvoiceDto> Invoices { get; set; } = [];
}

public class SyncItemResultDto
{
    public string? LocalId { get; set; }
    public int? ServerId { get; set; }
    public string Status { get; set; } = string.Empty;
    public int? ServerVersion { get; set; }
    public string? ServerData { get; set; }
    public List<string> Errors { get; set; } = [];
}

public class SyncPushResultDto
{
    public List<SyncItemResultDto> Results { get; set; } = [];
    public int AcceptedCount { get; set; }
    public int RejectedCount { get; set; }
    public DateTime ServerTime { get; set; }
}

// ─── Full-pull response ───────────────────────────────────────────────────────

public class SyncFullPullResponseDto
{
    // Data entities
    public List<SyncClientDto> Clients { get; set; } = [];
    public List<SyncProductDto> Products { get; set; } = [];
    public List<SyncOrderDto> Orders { get; set; } = [];
    public List<SyncPurchaseDto> Purchases { get; set; } = [];
    public List<SyncPaymentDto> Payments { get; set; } = [];
    public List<SyncExpenseDto> Expenses { get; set; } = [];
    public List<SyncStockMovementDto> StockMovements { get; set; } = [];
    public List<SyncTransactionDto> Transactions { get; set; } = [];
    public List<SyncInvoiceDto> Invoices { get; set; } = [];

    // Lookup tables (pull-only, always included)
    public List<SyncLookupDto> UserRoles { get; set; } = [];
    public List<SyncLookupDto> ClientTypes { get; set; } = [];
    public List<SyncLookupDto> OrderStatuses { get; set; } = [];
    public List<SyncLookupDto> PurchaseStatuses { get; set; } = [];
    public List<SyncLookupDto> PaymentTypes { get; set; } = [];
    public List<SyncLookupDto> PaymentDirections { get; set; } = [];
    public List<SyncLookupDto> TransTypes { get; set; } = [];
    public List<SyncLookupDto> TransModes { get; set; } = [];
    public List<SyncLookupDto> TransCategories { get; set; } = [];
    public List<SyncLookupDto> ExpenseTypes { get; set; } = [];
    public List<SyncLookupDto> MovementTypes { get; set; } = [];
    public List<SyncLookupDto> MovementSources { get; set; } = [];
    public List<SyncLookupDto> InvoiceStatuses { get; set; } = [];

    // Reporting views (pull-only, always included)
    public List<SyncClientBalanceDto> ClientBalances { get; set; } = [];
    public List<SyncMonthlyProfitLossDto> MonthlyProfitLoss { get; set; } = [];
    public List<SyncMonthlyCreditDebitDto> MonthlyCreditDebit { get; set; } = [];

    public DateTime ServerTime { get; set; }
}

// ─── Lookup DTO (shared shape for all 13 lookup tables) ─────────────────────

public class SyncLookupDto
{
    public int Id { get; set; }
    public string? Name { get; set; }
}

// ─── View DTOs ───────────────────────────────────────────────────────────────

public class SyncClientBalanceDto
{
    public int? ClientId { get; set; }
    public string? Name { get; set; }
    public decimal? Balance { get; set; }
}

public class SyncMonthlyProfitLossDto
{
    public int Id { get; set; }
    public DateTime? Month { get; set; }
    public decimal? TotalSales { get; set; }
    public decimal? TotalPurchases { get; set; }
    public decimal? TotalExpenses { get; set; }
    public decimal? GrossProfit { get; set; }
    public decimal? NetProfit { get; set; }
}

public class SyncMonthlyCreditDebitDto
{
    public int Id { get; set; }
    public DateTime? Month { get; set; }
    public decimal? TotalCredit { get; set; }
    public decimal? TotalDebit { get; set; }
    public decimal? Balance { get; set; }
}

// ─── Delta-pull request ───────────────────────────────────────────────────────

public class SyncDeltaPullRequestDto
{
    public DateTime Since { get; set; }
}

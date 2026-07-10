namespace HamzaTex.Api.Models;

public class TransactionDto
{
    public int Id { get; set; }

    public int? ClientId { get; set; }
    public string? ClientName { get; set; }

    public int? ProductId { get; set; }
    public string? ProductName { get; set; }

    public int? UserId { get; set; }
    public string? UserName { get; set; }

    public int? OrderId { get; set; }
    public int? PurchaseId { get; set; }

    public int? TransTypeId { get; set; }
    public string? TransTypeName { get; set; }

    public int? TransModeId { get; set; }
    public string? TransModeName { get; set; }

    public int? TransCategoryId { get; set; }
    public string? TransCategoryName { get; set; }

    public decimal Amount { get; set; }
    public DateOnly TransDate { get; set; }
    public string? Notes { get; set; }
    public DateOnly? CreatedAt { get; set; }

    /// <summary>Derived: "Order #N" | "Purchase #N" | "Expense" | "Payment" | "Manual"</summary>
    public string Source { get; set; } = string.Empty;

    /// <summary>True only for manually-created entries — controls edit/delete eligibility on the frontend.</summary>
    public bool IsManual { get; set; }
}

public class CreateTransactionDto
{
    public decimal Amount { get; set; }
    public int TransCategoryId { get; set; }
    public DateOnly TransDate { get; set; }
    public string? Notes { get; set; }
    public int? ClientId { get; set; }
    public int? TransTypeId { get; set; }
    public int? TransModeId { get; set; }
}

public class TransactionSummaryDto
{
    public decimal TotalCredit { get; set; }
    public decimal TotalDebit { get; set; }
}

public class UpdateTransactionDto
{
    public decimal Amount { get; set; }
    public int TransCategoryId { get; set; }
    public DateOnly TransDate { get; set; }
    public string? Notes { get; set; }
    public int? ClientId { get; set; }
    public int? TransTypeId { get; set; }
    public int? TransModeId { get; set; }
}

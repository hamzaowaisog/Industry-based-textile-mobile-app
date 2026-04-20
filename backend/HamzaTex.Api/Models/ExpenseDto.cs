namespace HamzaTex.Api.Models;

public class ExpenseDto
{
    public int Id { get; set; }
    public int? ExpenseTypeId { get; set; }
    public string? ExpenseTypeName { get; set; }
    public decimal Amount { get; set; }
    public int? TransModeId { get; set; }
    public string? TransModeName { get; set; }
    public int? UserId { get; set; }
    public string? RecordedByName { get; set; }
    public int? TransCategoryId { get; set; }
    public string? TransCategoryName { get; set; }
    public int? TransactionId { get; set; }
    public DateOnly ExpenseDate { get; set; }
    public string? Notes { get; set; }
    public DateTime? CreatedAt { get; set; }
}

public class CreateExpenseDto
{
    public int ExpenseTypeId { get; set; }
    public decimal Amount { get; set; }
    public int TransModeId { get; set; }
    /// <summary>Optional. If omitted, TransCategoryId is auto-derived from ExpenseTypeId (Office=1→Cat3, Home=2→Cat4). Required for custom expense types.</summary>
    public int? TransCategoryId { get; set; }
    public DateOnly ExpenseDate { get; set; }
    public string? Notes { get; set; }
}

public class UpdateExpenseDto
{
    public decimal Amount { get; set; }
    public int TransModeId { get; set; }
    public DateOnly? ExpenseDate { get; set; }
    public string? Notes { get; set; }
}

public class ExpenseTypeDto
{
    public int Id { get; set; }
    public string? Name { get; set; }
    public DateTime? CreatedAt { get; set; }
}

public class CreateExpenseTypeDto
{
    public string Name { get; set; } = string.Empty;
}

public class UpdateExpenseTypeDto
{
    public string Name { get; set; } = string.Empty;
}

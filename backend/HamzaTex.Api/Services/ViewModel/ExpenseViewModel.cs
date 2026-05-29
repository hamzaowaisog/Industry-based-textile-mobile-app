namespace HamzaTex.Api.Services.ViewModel;

public class ExpenseCreateViewModel
{
    public int ExpenseTypeId { get; set; }
    public decimal Amount { get; set; }
    public int TransModeId { get; set; }
    /// <summary>Optional. Auto-derived from ExpenseTypeId for seeded types (Office→3, Home→4). Required for custom expense types with no built-in mapping.</summary>
    public int? TransCategoryId { get; set; }
    /// <summary>Omit or set null to use today's UTC date.</summary>
    public DateOnly? ExpenseDate { get; set; }
    public string? Notes { get; set; }
}

public class ExpenseUpdateViewModel
{
    public decimal Amount { get; set; }
    public int TransModeId { get; set; }
    /// <summary>Omit or set null to leave the existing date unchanged.</summary>
    public DateOnly? ExpenseDate { get; set; }
    public string? Notes { get; set; }
}

public class ExpenseTypeCreateViewModel
{
    public string Name { get; set; } = string.Empty;
}

public class ExpenseTypeUpdateViewModel
{
    public string Name { get; set; } = string.Empty;
}

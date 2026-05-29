namespace HamzaTex.Api.Services.ViewModel;

public class TransactionCreateViewModel
{
    public decimal Amount { get; set; }
    public int TransCategoryId { get; set; }
    public DateOnly TransDate { get; set; }
    public string? Notes { get; set; }
    public int? ClientId { get; set; }
    /// <summary>Defaults to 1 (Debit) if omitted.</summary>
    public int? TransTypeId { get; set; }
    /// <summary>Defaults to 1 (Cash) if omitted.</summary>
    public int? TransModeId { get; set; }
}

public class TransactionUpdateViewModel
{
    public decimal Amount { get; set; }
    public int TransCategoryId { get; set; }
    /// <summary>Required. Replaces the existing transaction date.</summary>
    public DateOnly TransDate { get; set; }
    public string? Notes { get; set; }
    public int? ClientId { get; set; }
    /// <summary>Defaults to 1 (Debit) if omitted.</summary>
    public int? TransTypeId { get; set; }
    /// <summary>Defaults to 1 (Cash) if omitted.</summary>
    public int? TransModeId { get; set; }
}

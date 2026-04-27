namespace HamzaTex.Api.Services.ViewModel;

public class TransactionCreateViewModel
{
    public decimal Amount { get; set; }
    public int TransCategoryId { get; set; }
    public DateOnly TransDate { get; set; }
    public string? Notes { get; set; }
    public int? ClientId { get; set; }
    public int? TransTypeId { get; set; }
    public int? TransModeId { get; set; }
}

public class TransactionUpdateViewModel
{
    public decimal Amount { get; set; }
    public int TransCategoryId { get; set; }
    public DateOnly TransDate { get; set; }
    public string? Notes { get; set; }
    public int? ClientId { get; set; }
    public int? TransTypeId { get; set; }
    public int? TransModeId { get; set; }
}

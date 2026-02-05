namespace HamzaTex.Api.Services.ViewModel;

public class ProductCreateViewModel
{
    public string Name { get; set; } = string.Empty;
    public string Sku { get; set; } = string.Empty;
    public string Unit { get; set; } = string.Empty;
    public decimal? DefaultCost { get; set; }
    public decimal? DefaultPrice { get; set; }
    public int? ReorderLevel { get; set; }
    public bool? IsActive { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

public class ProductUpdateViewModel
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Sku { get; set; } = string.Empty;
    public string Unit { get; set; } = string.Empty;
    public decimal? DefaultCost { get; set; }
    public decimal? DefaultPrice { get; set; }
    public int? ReorderLevel { get; set; }
    public bool? IsActive { get; set; }
}
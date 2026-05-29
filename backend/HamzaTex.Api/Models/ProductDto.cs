namespace HamzaTex.Api.Models;

public class ProductDto 
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Sku { get; set; } = string.Empty;
    public string Unit { get; set; } = string.Empty;
    public decimal? DefaultCost { get; set; }
    public decimal? DefaultPrice { get; set; }
    public decimal? Quantity { get; set; }
    public decimal? AverageCost { get; set; }
    public decimal? AveragePrice { get; set; }
    public int CostChangeCount { get; set; }
    public int PriceChangeCount { get; set; }
    public decimal? TotalQuantityPurchased { get; set; }
    public decimal? TotalQuantitySold { get; set; }
    public int? ReorderLevel { get; set; }
    public bool? IsActive { get; set; }
    public DateOnly? CreatedAt { get; set; }
}

public class CreateProductDto
{
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
}

public class UpdateProductByIdDto
{
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
}
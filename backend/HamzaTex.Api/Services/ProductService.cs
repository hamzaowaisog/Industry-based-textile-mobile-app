using HamzaTex.Api.Data;
using HamzaTex.Api.Entities;
using HamzaTex.Api.Helpers;
using HamzaTex.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace HamzaTex.Api.Services;

/// <summary>Product catalogue management. All methods are scoped to userId via the ProductUser join table.</summary>
public interface IProductService
{
    /// <summary>Create a product, link it to the user, and record an initial stock movement for the opening quantity.</summary>
    Task<Response<ProductDto>> CreateWithUserIdAsync(CreateProductDto model, int userId);
    /// <summary>Get a product by ID scoped to the given user.</summary>
    Task<Response<ProductDto>> GetByIdAsync(int id, int userId);
    /// <summary>Get all products for the given user.</summary>
    Task<Response<List<ProductDto>>> GetAllAsync(int userId);
    /// <summary>Update product details. Does not adjust stock — use StockMovementsService for inventory changes.</summary>
    Task<Response<ProductDto>> UpdateByIdAsync(int id, UpdateProductByIdDto model, int userId);
    /// <summary>Delete a product by ID.</summary>
    Task<Response> DeleteByIdAsync(int id, int userId);
    /// <summary>Get paginated products for the given user.</summary>
    Task<Response<PagedList<ProductDto>>> GetAllPaginatedAsync(int page, int pageSize, int userId);
}

public class ProductService : IProductService
{
    private readonly ApplicationDbContext _dbContext;

    // Mirrors OrderStatus seed IDs used by OrderService's reservation check — keep in sync.
    private const int OrderStatusDelivered = 3;
    private const int OrderStatusCancelled = 4;

    public ProductService(ApplicationDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    /// <summary>Sums OrderLine.Qty per product across all non-Delivered, non-Cancelled orders, for the given product IDs.</summary>
    private async Task<Dictionary<int, decimal>> GetCommittedQuantitiesAsync(IEnumerable<int> productIds)
    {
        var ids = productIds.Distinct().ToList();
        if (ids.Count == 0) return new Dictionary<int, decimal>();

        return await _dbContext.OrderLines
            .Where(ol => ol.ProductId != null && ids.Contains(ol.ProductId.Value)
                && ol.Order.StatusId != OrderStatusDelivered && ol.Order.StatusId != OrderStatusCancelled)
            .GroupBy(ol => ol.ProductId!.Value)
            .Select(g => new { ProductId = g.Key, Qty = g.Sum(ol => ol.Qty) })
            .ToDictionaryAsync(x => x.ProductId, x => x.Qty);
    }

   public async Task<Response<ProductDto>> CreateWithUserIdAsync(CreateProductDto model, int userId)
    {
        await using var transaction = await _dbContext.Database.BeginTransactionAsync();
        try 
        {
            var entity = ToEntity(model);
            if (entity is null)
            {
                await transaction.RollbackAsync();
                return Response<ProductDto>.ErrorResponse("Validation failed", "Product is required.");
            }

            var existingProductSku = await _dbContext.Products
                                     .AsNoTracking()
                                     .FirstOrDefaultAsync(p => p.Sku == entity.Sku 
                                     && p.ProductUsers.Any(pu => pu.UserId == userId));
                                     
            if (existingProductSku != null)
            {
                await transaction.RollbackAsync();
                return Response<ProductDto>.ErrorResponse("Duplication error", "This SKU is already in use by another user or this user already has this product.");
            }

            await _dbContext.Products.AddAsync(entity);
            await _dbContext.SaveChangesAsync();

            var existingProductUser = await _dbContext.ProductUsers
                .AsNoTracking()
                .FirstOrDefaultAsync(pu => pu.ProductId == entity.Id && pu.UserId == userId);
            
            if (existingProductUser != null)
            {
                await transaction.RollbackAsync();
                return Response<ProductDto>.ErrorResponse("Duplication error", "This user already has this product.");
            }

            var productUserEntity = ToEntity(new CreateProductUserDto
            {
                ProductId = entity.Id,
                UserId = userId
            });
            
            await _dbContext.ProductUsers.AddAsync(productUserEntity);

            await _dbContext.SaveChangesAsync();


            var initialStockMovement = new StockMovement
            {
                ProductId = entity.Id,
                MovementSourceId = 1,
                MovementTypeId = 1,
                Qty = entity.Quantity,
                UnitCost = entity.DefaultCost,
                UnitPrice = entity.DefaultPrice,
                AverageCostAtMovement = entity.DefaultCost,
                AveragePriceAtMovement = null,
                MovementDate = DateOnly.FromDateTime(DateTime.UtcNow)
            };
            await _dbContext.StockMovements.AddAsync(initialStockMovement);
            await _dbContext.SaveChangesAsync();

            await transaction.CommitAsync();
            return Response<ProductDto>.SuccessResponse(ToDto(entity, committed: 0), "Product created successfully.");
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
            return Response<ProductDto>.ErrorResponse("Internal server error", ex.Message);
        }
    }

   public async Task<Response<ProductDto>> GetByIdAsync(int id, int userId)
   {
        var product = await _dbContext.Products
                      .Include(p => p.ProductUsers)
                      .FirstOrDefaultAsync(
                        p => p.Id == id && 
                        p.ProductUsers.Any(pu => pu.UserId == userId));

        if (product is null)
        {
            return Response<ProductDto>.ErrorResponse("Not found", "Product not found.");
        }

        var committed = await GetCommittedQuantitiesAsync(new[] { product.Id });
        return Response<ProductDto>.SuccessResponse(ToDto(product, committed.GetValueOrDefault(product.Id, 0)), "Product fetched successfully.");


   }

   public async Task<Response<List<ProductDto>>> GetAllAsync(int userId)
   {
        var products = await _dbContext.Products
                       .Include(p => p.ProductUsers)
                       .Where(p => p.ProductUsers.Any(pu => pu.UserId == userId))
                       .ToListAsync();

        if (products is null)
        {
            return Response<List<ProductDto>>.ErrorResponse("Not found", "No products found.");
        }

        var committed = await GetCommittedQuantitiesAsync(products.Select(p => p.Id));
        var productDtos = products.Select(product => ToDto(product, committed.GetValueOrDefault(product.Id, 0))).ToList();
        return Response<List<ProductDto>>.SuccessResponse(productDtos, "Products fetched successfully.");
   }

   public async Task<Response<ProductDto>> UpdateByIdAsync(int id , UpdateProductByIdDto model , int userId)
   {
        var product = await _dbContext.Products
                     .Include(p => p.ProductUsers)
                     .FirstOrDefaultAsync(
                        p => p.Id == id &&
                        p.ProductUsers.Any(pu => pu.UserId == userId));
        
        if (product is null)
        {
            return Response<ProductDto>.ErrorResponse("Not found", "Product not found.");
        }

        product.Name = model.Name.Trim();
        if (!string.IsNullOrWhiteSpace(model.Sku))
        {
            product.Sku = model.Sku.Trim();
        }
        product.Unit = model.Unit.Trim();
        if (model.Quantity.HasValue) product.Quantity = model.Quantity;
        product.ReorderLevel = model.ReorderLevel;
        if (model.IsActive.HasValue) product.IsActive = model.IsActive;

        var previousDefaultCost = product.DefaultCost;
        var previousDefaultPrice = product.DefaultPrice;
        var defaultCostChanged = model.DefaultCost != previousDefaultCost;
        var defaultPriceChanged = model.DefaultPrice != previousDefaultPrice;

        product.DefaultCost = model.DefaultCost;
        product.DefaultPrice = model.DefaultPrice;

        if (model.AverageCost.HasValue) product.AverageCost = model.AverageCost;
        if (model.AveragePrice.HasValue) product.AveragePrice = model.AveragePrice;
        if (model.CostChangeCount.HasValue) product.CostChangeCount = model.CostChangeCount.Value;
        if (model.PriceChangeCount.HasValue) product.PriceChangeCount = model.PriceChangeCount.Value;
        if (model.TotalQuantitySold.HasValue) product.TotalQuantitySold = model.TotalQuantitySold.Value;
        if (model.TotalQuantityPurchased.HasValue) product.TotalQuantityPurchased = model.TotalQuantityPurchased.Value;

        // Opening stock only: one movement, no sales yet — default cost/price edits should
        // realign weighted averages and the initial movement snapshot (same as at creation).
        var noSalesYet = (product.TotalQuantitySold ?? 0) == 0;
        if (noSalesYet && (defaultCostChanged || defaultPriceChanged))
        {
            var movementCount = await _dbContext.StockMovements.CountAsync(sm => sm.ProductId == id);
            if (movementCount == 1)
            {
                var openingMovement = await _dbContext.StockMovements
                    .FirstAsync(sm => sm.ProductId == id);

                if (defaultCostChanged)
                {
                    product.AverageCost = model.DefaultCost;
                    openingMovement.UnitCost = model.DefaultCost;
                    openingMovement.AverageCostAtMovement = model.DefaultCost;
                }

                if (defaultPriceChanged)
                {
                    product.AveragePrice = model.DefaultPrice;
                    openingMovement.UnitPrice = model.DefaultPrice;
                }
            }
        }

        await _dbContext.SaveChangesAsync();
        var committed = await GetCommittedQuantitiesAsync(new[] { product.Id });
        return Response<ProductDto>.SuccessResponse(ToDto(product, committed.GetValueOrDefault(product.Id, 0)), "Product updated successfully.");
   }

   public async Task<Response> DeleteByIdAsync(int id, int userId)
   {
        var product = await _dbContext.Products
                     .Include(p => p.ProductUsers)
                     .FirstOrDefaultAsync(
                        p => p.Id == id &&
                        p.ProductUsers.Any(pu => pu.UserId == userId));
        
        if (product is null)
        {
            return Response.ErrorResponse("Not found", "Product not found.");
        }

        _dbContext.Products.Remove(product);
        await _dbContext.SaveChangesAsync();
        return Response.SuccessResponse("Product deleted successfully.");
   }

   public async Task<Response<PagedList<ProductDto>>> GetAllPaginatedAsync (int page, int pageSize, int userId)
   {
        var query = _dbContext.Products
                    .Include(p => p.ProductUsers)
                    .Where(p => p.ProductUsers.Any(pu => pu.UserId == userId));

        var paged = await PagedList<Product>.CreateAsync(query, page, pageSize);

        var committed = await GetCommittedQuantitiesAsync(paged.Items.Select(p => p.Id));
        var items = paged.Items.Select(p => ToDto(p, committed.GetValueOrDefault(p.Id, 0))).ToList();

        var pagedList = new PagedList<ProductDto>(items, paged.Page, paged.PageSize, paged.TotalCount);
        return Response<PagedList<ProductDto>>.SuccessResponse(pagedList, "Products fetched successfully.");
   }
    private static ProductDto ToDto(Product entity, decimal committed) =>
    new()
    {
        Id = entity.Id,
        Name = entity.Name,
        Sku = entity.Sku,
        Unit = entity.Unit,
        DefaultCost = entity.DefaultCost,
        DefaultPrice = entity.DefaultPrice,
        Quantity = entity.Quantity,
        AvailableQuantity = (entity.Quantity ?? 0) - committed,
        AverageCost = entity.AverageCost,
        AveragePrice = entity.AveragePrice,
        CostChangeCount = entity.CostChangeCount,
        PriceChangeCount = entity.PriceChangeCount,
        TotalQuantityPurchased = entity.TotalQuantityPurchased,
        TotalQuantitySold = entity.TotalQuantitySold,
        ReorderLevel = entity.ReorderLevel,
        IsActive = entity.IsActive,
        CreatedAt = entity.CreatedAt
    };

    private static Product ToEntity(CreateProductDto model) =>
    new()
    {
        Name = model.Name.Trim(),
        Sku = model.Sku.Trim(),
        Unit = model.Unit.Trim(),
        DefaultCost = model.DefaultCost,
        DefaultPrice = model.DefaultPrice,
        Quantity = model.Quantity,
        AverageCost = model.AverageCost,
        AveragePrice = model.AveragePrice,
        CostChangeCount = model.CostChangeCount ?? 0,
        PriceChangeCount = model.PriceChangeCount ?? 0,
        TotalQuantityPurchased = model.TotalQuantityPurchased,
        TotalQuantitySold = model.TotalQuantitySold,
        ReorderLevel = model.ReorderLevel,
        IsActive = model.IsActive ?? true,
        CreatedAt = DateOnly.FromDateTime(DateTime.UtcNow)
    };

    private static ProductUser ToEntity(CreateProductUserDto model) =>
    new()
    {
        ProductId = model.ProductId,
        UserId = model.UserId,
        Date = DateOnly.FromDateTime(DateTime.UtcNow)
    };
}
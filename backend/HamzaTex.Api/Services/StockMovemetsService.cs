using HamzaTex.Api.Data;
using HamzaTex.Api.Entities;
using HamzaTex.Api.Helpers;
using HamzaTex.Api.Models;

namespace HamzaTex.Api.Services;

public interface IStockMovementsService
{
    Task<Response<StockMovementsDto>> CreateAsync(CreateStockMovementsDto model, int userId);
}

public class StockMovementsService: IStockMovementsService
{
    private readonly ApplicationDbContext _dbContext;
    private readonly IProductService _productService;

    public StockMovementsService(ApplicationDbContext dbContext, IProductService productService)
    {
        _dbContext = dbContext;
        _productService = productService;
    }

    public async Task<Response<StockMovementsDto>> CreateAsync(CreateStockMovementsDto model, int userId)
    {
        await using var transaction = await _dbContext.Database.BeginTransactionAsync();
        try
        {
            if (model.MovementType != 1 && model.MovementType != 2)
            {
                await transaction.RollbackAsync();
                return Response<StockMovementsDto>.ErrorResponse("Invalid movement type", 
                    "Movement type must be 1 (Purchase) or 2 (Sale)");
            }

            var product = await _productService.GetByIdAsync(model.ProductId, userId);
            if (product is null || product.Data is null)
            {
                await transaction.RollbackAsync();
                return Response<StockMovementsDto>.ErrorResponse("Product not found");
            }

            var productData = product.Data;

            var unitCost = (model.UnitCost is null || model.UnitCost == 0)
                ? (productData.DefaultCost ?? 0)
                : model.UnitCost.Value;
            var unitPrice = (model.UnitPrice is null || model.UnitPrice == 0)
                ? (productData.DefaultPrice ?? 0)
                : model.UnitPrice.Value;

            decimal? snapshotAvgCost = null;
            decimal? snapshotAvgPrice = null;

            if (model.MovementType == 2)
            {
                var currentQty = productData.Quantity ?? 0;
                if (model.Qty > currentQty)
                {
                    await transaction.RollbackAsync();
                    return Response<StockMovementsDto>.ErrorResponse("Insufficient stock",
                        $"Available: {currentQty} {productData.Unit}, Requested: {model.Qty} {productData.Unit}");
                }

                productData.Quantity = currentQty - model.Qty;

                var totalSoldBefore = productData.TotalQuantitySold ?? 0;
                var totalSoldNow = totalSoldBefore + model.Qty;
                productData.TotalQuantitySold = totalSoldNow;

                snapshotAvgCost = productData.AverageCost ?? productData.DefaultCost ?? 0;

                var prevAvgPrice = productData.AveragePrice ?? productData.DefaultPrice ?? 0;

                var newAvgPrice = totalSoldNow > 0
                    ? (totalSoldBefore * prevAvgPrice + model.Qty * unitPrice) / totalSoldNow
                    : unitPrice;

                productData.AveragePrice = newAvgPrice;
                productData.PriceChangeCount = productData.PriceChangeCount + 1;

                snapshotAvgPrice = newAvgPrice;
            }
            else if (model.MovementType == 1)
            {
                var oldQty = productData.Quantity ?? 0;
                var newQty = oldQty + model.Qty;
                productData.Quantity = newQty;

                var totalPurchasedBefore = productData.TotalQuantityPurchased ?? 0;
                var totalPurchasedNow = totalPurchasedBefore + model.Qty;
                productData.TotalQuantityPurchased = totalPurchasedNow;


                var prevAvgCost = productData.AverageCost ?? productData.DefaultCost ?? 0;

                var newAvgCost = newQty > 0
                    ? (oldQty * prevAvgCost + model.Qty * unitCost) / newQty
                    : unitCost;

                productData.AverageCost = newAvgCost;
                productData.CostChangeCount = productData.CostChangeCount + 1;

                snapshotAvgCost = newAvgCost;
                snapshotAvgPrice = productData.AveragePrice ?? productData.DefaultPrice ?? 0;
            }

            var updateDto = new UpdateProductByIdDto
            {
                Name = productData.Name,
                Sku = productData.Sku,
                Unit = productData.Unit,
                DefaultCost = productData.DefaultCost,
                DefaultPrice = productData.DefaultPrice,
                Quantity = productData.Quantity,
                ReorderLevel = productData.ReorderLevel,
                IsActive = productData.IsActive,
                AverageCost = productData.AverageCost,
                AveragePrice = productData.AveragePrice,
                CostChangeCount = productData.CostChangeCount,
                PriceChangeCount = productData.PriceChangeCount,
                TotalQuantityPurchased = productData.TotalQuantityPurchased,
                TotalQuantitySold = productData.TotalQuantitySold,
            };

            var updateResult = await _productService.UpdateByIdAsync(model.ProductId, updateDto, userId);
            if (!updateResult.Success)
            {
                await transaction.RollbackAsync();
                return Response<StockMovementsDto>.ErrorResponse("Failed to update product", updateResult.Message);
            }

            var entity = ToEntity(model , unitCost, unitPrice, snapshotAvgCost, snapshotAvgPrice);


            await _dbContext.StockMovements.AddAsync(entity);
            await _dbContext.SaveChangesAsync();
            await transaction.CommitAsync();

            return Response<StockMovementsDto>.SuccessResponse(
                ToDto(entity),
                $"Stock movement created successfully. {(model.MovementType == 1 ? "Purchase" : "Sale")} recorded.");
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
            return Response<StockMovementsDto>.ErrorResponse("Internal server error", ex.Message);
        }
    }

    private StockMovementsDto ToDto(StockMovement entity)
    {
        return new StockMovementsDto
        {
            Id = entity.Id,
            ProductId = entity.ProductId ?? 0,
            MovementType = entity.MovementTypeId ?? 0,
            MovementSource = entity.MovementSourceId ?? 0,
            Qty = entity.Qty ?? 0,
            UnitCost = entity.UnitCost,
            UnitPrice = entity.UnitPrice,
            AverageCostAtMovement = entity.AverageCostAtMovement,
            AveragePriceAtMovement = entity.AveragePriceAtMovement,
            MovementDate = entity.MovementDate
        };
    }

    private static StockMovement ToEntity(CreateStockMovementsDto model, decimal unitCost, decimal unitPrice, decimal? snapshotAvgCost, decimal? snapshotAvgPrice)
    {
        return new StockMovement
        {
            ProductId = model.ProductId,
            MovementSourceId = model.MovementSource,
            MovementTypeId = model.MovementType,
            Qty = model.Qty,
            UnitCost = unitCost,
            UnitPrice = unitPrice,
            AverageCostAtMovement = snapshotAvgCost,
            AveragePriceAtMovement = snapshotAvgPrice,
            MovementDate = model.MovementDate
        };
    }
}
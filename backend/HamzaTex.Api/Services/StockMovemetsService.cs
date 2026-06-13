using HamzaTex.Api.Data;
using HamzaTex.Api.Entities;
using HamzaTex.Api.Helpers;
using HamzaTex.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace HamzaTex.Api.Services;

/// <summary>
/// Stock movement recording and query. MovementSource drives MovementType automatically:
/// Purchase (1) → In (1), Sale (2) → Out (2), Manual (3) → caller supplies MovementType.
/// All product quantity and weighted average recalculation lives here — never duplicate this logic in other services.
/// </summary>
public interface IStockMovementsService
{
    /// <summary>Record a stock movement. Recalculates product Quantity, AverageCost, and AveragePrice automatically.</summary>
    Task<Response<StockMovementsDto>> CreateAsync(CreateStockMovementsDto model, int userId);
    /// <summary>Get a single stock movement by ID, scoped to the user's products.</summary>
    Task<Response<StockMovementsDto>> GetByIdAsync(int id, int userId);
    /// <summary>Get all stock movements for the user's products, ordered by date descending.</summary>
    Task<Response<List<StockMovementsDto>>> GetAllAsync(int userId);
    /// <summary>Get paginated stock movements for the user's products.</summary>
    Task<Response<PagedList<StockMovementsDto>>> GetAllPaginatedAsync(int page, int pageSize, int userId);
    /// <summary>Filter stock movements by product, type, source, and/or date range.</summary>
    Task<Response<List<StockMovementsDto>>> GetFilteredAsync(
        int? productId,
        int? movementTypeId,
        int? movementSourceId,
        DateOnly? dateFrom,
        DateOnly? dateTo,
        int userId);
    /// <summary>Update a movement record and replay all movements for the product to keep stock qty and weighted averages consistent.</summary>
    Task<Response<StockMovementsDto>> UpdateByIdAsync(int id, UpdateStockMovementsDto model, int userId);
    /// <summary>Delete a stock movement by ID. Does not reverse product stats — create a compensating Manual movement if needed.</summary>
    Task<Response> DeleteByIdAsync(int id, int userId);
}

public class StockMovementsService : IStockMovementsService
{
    private readonly ApplicationDbContext _dbContext;
    private readonly IProductService _productService;
    private readonly INotificationService _notification;

    public StockMovementsService(ApplicationDbContext dbContext, IProductService productService, INotificationService notification)
    {
        _dbContext = dbContext;
        _productService = productService;
        _notification = notification;
    }

    public async Task<Response<StockMovementsDto>> CreateAsync(CreateStockMovementsDto model, int userId)
    {
        // If a transaction is already active (e.g. called from OrderService), participate in it.
        // Otherwise own the transaction ourselves.
        var ownTransaction = _dbContext.Database.CurrentTransaction == null;
        await using var transaction = ownTransaction
            ? await _dbContext.Database.BeginTransactionAsync()
            : null;
        try
        {
            // ── Derive MovementType from MovementSource ───────────────────────
            // Purchase (1) → always In (1); Sale (2) → always Out (2)
            // Manual (3) → caller must supply MovementType explicitly
            int resolvedMovementType;
            switch (model.MovementSource)
            {
                case 1: // Purchase
                    resolvedMovementType = 1; // In
                    break;
                case 2: // Sale
                    resolvedMovementType = 2; // Out
                    break;
                case 3: // Manual
                    if (model.MovementType is null)
                    {
                        if (ownTransaction) await transaction!.RollbackAsync();
                        return Response<StockMovementsDto>.ErrorResponse("Validation failed",
                            "MovementType is required for Manual movements. Use 1 (In), 2 (Out), or 3 (Adjustment).");
                    }
                    resolvedMovementType = model.MovementType.Value;
                    break;
                default:
                    if (ownTransaction) await transaction!.RollbackAsync();
                    return Response<StockMovementsDto>.ErrorResponse("Invalid movement source",
                        "MovementSource must be 1 (Purchase), 2 (Sale), or 3 (Manual).");
            }

            var product = await _productService.GetByIdAsync(model.ProductId, userId);
            if (product is null || product.Data is null)
            {
                if (ownTransaction) await transaction!.RollbackAsync();
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

            if (resolvedMovementType == 2) // Out — decreases stock
            {
                var currentQty = productData.Quantity ?? 0;
                if (model.Qty > currentQty)
                {
                    if (ownTransaction) await transaction!.RollbackAsync();
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
            else if (resolvedMovementType == 1) // In — increases stock and recalculates weighted avg cost
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
            // resolvedMovementType == 3 (Adjustment) — recorded for audit, no automatic qty change

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
                if (ownTransaction) await transaction!.RollbackAsync();
                return Response<StockMovementsDto>.ErrorResponse("Failed to update product", updateResult.Message);
            }

            var entity = ToEntity(model, resolvedMovementType, unitCost, unitPrice, snapshotAvgCost, snapshotAvgPrice);
            await _dbContext.StockMovements.AddAsync(entity);
            await _dbContext.SaveChangesAsync();
            if (ownTransaction) await transaction!.CommitAsync();

            // Low stock alert — only for Out movements after commit
            if (resolvedMovementType == 2 && productData.ReorderLevel.HasValue && productData.ReorderLevel > 0)
            {
                var newQty = productData.Quantity ?? 0;
                if (newQty <= productData.ReorderLevel.Value)
                {
                    try { await _notification.CreateAsync(new CreateNotificationDto
                    {
                        UserId = userId,
                        Type = "low_stock",
                        Title = "Low Stock Alert",
                        Body = $"{productData.Name ?? "Product"} is below reorder level ({newQty} remaining)",
                        EntityId = model.ProductId
                    }); } catch { }
                }
            }

            // Reload with navigation properties so names are populated in the response
            var saved = await _dbContext.StockMovements
                .Include(sm => sm.Product)
                .Include(sm => sm.MovementType)
                .Include(sm => sm.MovementSource)
                .FirstAsync(sm => sm.Id == entity.Id);

            var sourceLabel = model.MovementSource == 1 ? "Purchase" : model.MovementSource == 2 ? "Sale" : "Manual";
            var typeLabel   = resolvedMovementType == 1 ? "In" : resolvedMovementType == 2 ? "Out" : "Adjustment";
            return Response<StockMovementsDto>.SuccessResponse(
                ToDto(saved),
                $"Stock movement recorded: {sourceLabel} → {typeLabel}.");
        }
        catch (Exception ex)
        {
            if (ownTransaction && transaction != null) await transaction.RollbackAsync();
            return Response<StockMovementsDto>.ErrorResponse("Internal server error", ex.Message);
        }
    }

    public async Task<Response<StockMovementsDto>> GetByIdAsync(int id, int userId)
    {
        var movement = await _dbContext.StockMovements
            .Include(sm => sm.Product)
            .Include(sm => sm.MovementType)
            .Include(sm => sm.MovementSource)
            .FirstOrDefaultAsync(sm =>
                sm.Id == id &&
                sm.Product != null &&
                sm.Product.ProductUsers.Any(pu => pu.UserId == userId));

        if (movement is null)
            return Response<StockMovementsDto>.ErrorResponse("Not found", "Stock movement not found.");

        return Response<StockMovementsDto>.SuccessResponse(ToDto(movement), "Stock movement fetched successfully.");
    }

    public async Task<Response<List<StockMovementsDto>>> GetAllAsync(int userId)
    {
        var movements = await _dbContext.StockMovements
            .Include(sm => sm.Product)
            .Include(sm => sm.MovementType)
            .Include(sm => sm.MovementSource)
            .Where(sm => sm.Product != null && sm.Product.ProductUsers.Any(pu => pu.UserId == userId))
            .OrderByDescending(sm => sm.MovementDate)
            .ToListAsync();

        var dtos = movements.Select(ToDto).ToList();
        return Response<List<StockMovementsDto>>.SuccessResponse(dtos, "Stock movements fetched successfully.");
    }

    public async Task<Response<PagedList<StockMovementsDto>>> GetAllPaginatedAsync(int page, int pageSize, int userId)
    {
        var query = _dbContext.StockMovements
            .Include(sm => sm.Product)
            .Include(sm => sm.MovementType)
            .Include(sm => sm.MovementSource)
            .Where(sm => sm.Product != null && sm.Product.ProductUsers.Any(pu => pu.UserId == userId))
            .OrderByDescending(sm => sm.MovementDate)
            .Select(sm => ToDto(sm));

        var pagedList = await PagedList<StockMovementsDto>.CreateAsync(query, page, pageSize);
        return Response<PagedList<StockMovementsDto>>.SuccessResponse(pagedList, "Stock movements fetched successfully.");
    }

    public async Task<Response<List<StockMovementsDto>>> GetFilteredAsync(
        int? productId,
        int? movementTypeId,
        int? movementSourceId,
        DateOnly? dateFrom,
        DateOnly? dateTo,
        int userId)
    {
        var query = _dbContext.StockMovements
            .Include(sm => sm.Product)
            .Include(sm => sm.MovementType)
            .Include(sm => sm.MovementSource)
            .Where(sm => sm.Product != null && sm.Product.ProductUsers.Any(pu => pu.UserId == userId))
            .AsQueryable();

        if (productId.HasValue)
            query = query.Where(sm => sm.ProductId == productId.Value);

        if (movementTypeId.HasValue)
            query = query.Where(sm => sm.MovementTypeId == movementTypeId.Value);

        if (movementSourceId.HasValue)
            query = query.Where(sm => sm.MovementSourceId == movementSourceId.Value);

        if (dateFrom.HasValue)
            query = query.Where(sm => sm.MovementDate >= dateFrom.Value);

        if (dateTo.HasValue)
            query = query.Where(sm => sm.MovementDate <= dateTo.Value);

        var movements = await query
            .OrderByDescending(sm => sm.MovementDate)
            .ToListAsync();

        var dtos = movements.Select(ToDto).ToList();
        return Response<List<StockMovementsDto>>.SuccessResponse(dtos, "Filtered stock movements fetched successfully.");
    }

    public async Task<Response<StockMovementsDto>> UpdateByIdAsync(int id, UpdateStockMovementsDto model, int userId)
    {
        await using var transaction = await _dbContext.Database.BeginTransactionAsync();
        try
        {
            // Derive MovementType from MovementSource (same rule as Create)
            int resolvedMovementType;
            switch (model.MovementSource)
            {
                case 1: resolvedMovementType = 1; break; // Purchase → In
                case 2: resolvedMovementType = 2; break; // Sale → Out
                case 3:
                    if (model.MovementType is null)
                        return Response<StockMovementsDto>.ErrorResponse("Validation failed",
                            "MovementType is required for Manual movements. Use 1 (In), 2 (Out), or 3 (Adjustment).");
                    resolvedMovementType = model.MovementType.Value;
                    break;
                default:
                    return Response<StockMovementsDto>.ErrorResponse("Invalid movement source",
                        "MovementSource must be 1 (Purchase), 2 (Sale), or 3 (Manual).");
            }

            var movement = await _dbContext.StockMovements
                .Include(sm => sm.Product).ThenInclude(p => p!.ProductUsers)
                .Include(sm => sm.MovementType)
                .Include(sm => sm.MovementSource)
                .FirstOrDefaultAsync(sm =>
                    sm.Id == id &&
                    sm.Product != null &&
                    sm.Product.ProductUsers.Any(pu => pu.UserId == userId));

            if (movement is null)
                return Response<StockMovementsDto>.ErrorResponse("Not found", "Stock movement not found.");

            var effectiveMovementDate = model.MovementDate ?? movement.MovementDate;
            var productId = movement.ProductId!.Value;

            // ── Full replay: fetch all movements for this product fresh (no tracking)
            // so the replay is independent of EF Core tracking state.
            var allMovements = await _dbContext.StockMovements
                .AsNoTracking()
                .Where(sm => sm.ProductId == productId)
                .OrderBy(sm => sm.MovementDate)
                .ThenBy(sm => sm.Id)
                .ToListAsync();

            // Inject the new values for the movement being edited into the replay set,
            // then re-sort in case MovementDate changed.
            var idx = allMovements.FindIndex(sm => sm.Id == id);
            if (idx >= 0)
            {
                allMovements[idx].MovementTypeId   = resolvedMovementType;
                allMovements[idx].MovementSourceId = model.MovementSource;
                allMovements[idx].Qty              = model.Qty;
                allMovements[idx].UnitCost         = model.UnitCost;
                allMovements[idx].UnitPrice        = model.UnitPrice;
                allMovements[idx].MovementDate     = effectiveMovementDate;
                allMovements = [.. allMovements.OrderBy(sm => sm.MovementDate).ThenBy(sm => sm.Id)];
            }

            // Apply the edits to the tracked movement record
            movement.ProductId        = model.ProductId;
            movement.MovementSourceId = model.MovementSource;
            movement.MovementTypeId   = resolvedMovementType;
            movement.Qty              = model.Qty;
            movement.UnitCost         = model.UnitCost;
            movement.UnitPrice        = model.UnitPrice;
            movement.MovementDate     = effectiveMovementDate;

            decimal currentQty    = 0;
            decimal avgCost       = 0;
            decimal avgPrice      = 0;
            decimal totalPurchased = 0;
            decimal totalSold     = 0;
            int     costChanges   = 0;
            int     priceChanges  = 0;

            foreach (var sm in allMovements)
            {
                var qty      = sm.Qty ?? 0;
                var unitCost = sm.UnitCost ?? 0;
                var unitPrice = sm.UnitPrice ?? 0;

                if (sm.MovementTypeId == 1) // In
                {
                    var newQty = currentQty + qty;
                    avgCost = newQty > 0
                        ? (currentQty * avgCost + qty * unitCost) / newQty
                        : unitCost;
                    currentQty     = newQty;
                    totalPurchased += qty;
                    costChanges++;
                    sm.AverageCostAtMovement  = avgCost;
                    sm.AveragePriceAtMovement = avgPrice > 0 ? avgPrice : null;
                }
                else if (sm.MovementTypeId == 2) // Out
                {
                    var totalSoldBefore = totalSold;
                    totalSold  += qty;
                    avgPrice = totalSold > 0
                        ? (totalSoldBefore * avgPrice + qty * unitPrice) / totalSold
                        : unitPrice;
                    currentQty   -= qty;
                    priceChanges++;
                    sm.AverageCostAtMovement  = avgCost > 0 ? avgCost : null;
                    sm.AveragePriceAtMovement = avgPrice;
                }
                // Adjustment (3) — recorded for audit, no qty or average change
            }

            // Copy snapshot values from the replay copy back to the tracked movement
            var replayedMovement = allMovements.FirstOrDefault(sm => sm.Id == id);
            if (replayedMovement is not null)
            {
                movement.AverageCostAtMovement  = replayedMovement.AverageCostAtMovement;
                movement.AveragePriceAtMovement = replayedMovement.AveragePriceAtMovement;
            }

            // Update the product with replayed totals
            var product = await _dbContext.Products.FirstAsync(p => p.Id == productId);
            product.Quantity              = currentQty;
            product.AverageCost           = avgCost > 0 ? avgCost : null;
            product.AveragePrice          = avgPrice > 0 ? avgPrice : null;
            product.TotalQuantityPurchased = totalPurchased;
            product.TotalQuantitySold     = totalSold;
            product.CostChangeCount       = costChanges;
            product.PriceChangeCount      = priceChanges;

            await _dbContext.SaveChangesAsync();
            await transaction.CommitAsync();

            await _dbContext.Entry(movement).Reference(sm => sm.MovementType).LoadAsync();
            await _dbContext.Entry(movement).Reference(sm => sm.MovementSource).LoadAsync();
            await _dbContext.Entry(movement).Reference(sm => sm.Product).LoadAsync();

            return Response<StockMovementsDto>.SuccessResponse(ToDto(movement), "Stock movement updated and product stats recalculated.");
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
            return Response<StockMovementsDto>.ErrorResponse("Internal server error", ex.Message);
        }
    }

    public async Task<Response> DeleteByIdAsync(int id, int userId)
    {
        var movement = await _dbContext.StockMovements
            .Include(sm => sm.Product)
            .FirstOrDefaultAsync(sm =>
                sm.Id == id &&
                sm.Product != null &&
                sm.Product.ProductUsers.Any(pu => pu.UserId == userId));

        if (movement is null)
            return Response.ErrorResponse("Not found", "Stock movement not found.");

        _dbContext.StockMovements.Remove(movement);
        await _dbContext.SaveChangesAsync();
        return Response.SuccessResponse("Stock movement deleted successfully.");
    }

    // ── Mapping helpers ──────────────────────────────────────────────────────

    private static StockMovementsDto ToDto(StockMovement entity) => new()
    {
        Id = entity.Id,
        ProductId = entity.ProductId ?? 0,
        ProductName = entity.Product?.Name,
        MovementSource = entity.MovementSourceId ?? 0,
        MovementSourceName = entity.MovementSource?.Name,
        MovementType = entity.MovementTypeId ?? 0,
        MovementTypeName = entity.MovementType?.Name,
        Qty = entity.Qty ?? 0,
        UnitCost = entity.UnitCost,
        UnitPrice = entity.UnitPrice,
        AverageCostAtMovement = entity.AverageCostAtMovement,
        AveragePriceAtMovement = entity.AveragePriceAtMovement,
        MovementDate = entity.MovementDate
    };

    private static StockMovement ToEntity(
        CreateStockMovementsDto model,
        int resolvedMovementType,
        decimal unitCost,
        decimal unitPrice,
        decimal? snapshotAvgCost,
        decimal? snapshotAvgPrice) => new()
    {
        ProductId = model.ProductId,
        MovementSourceId = model.MovementSource,
        MovementTypeId = resolvedMovementType,
        Qty = model.Qty,
        UnitCost = unitCost,
        UnitPrice = unitPrice,
        AverageCostAtMovement = snapshotAvgCost,
        AveragePriceAtMovement = snapshotAvgPrice,
        MovementDate = model.MovementDate
    };
}

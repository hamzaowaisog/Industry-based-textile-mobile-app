using HamzaTex.Api.Data;
using HamzaTex.Api.Entities;
using HamzaTex.Api.Helpers;
using HamzaTex.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace HamzaTex.Api.Services;

/// <summary>
/// Purchase (procurement) management. Handles full lifecycle including stock and ledger effects
/// on status transitions (Delivered posts stock In + transaction, Cancelled reverses both).
/// </summary>
public interface IPurchaseService
{
    /// <summary>Create a new purchase with lines. Supplier must be a Client with ClientTypeId=2. Starts as Pending.</summary>
    Task<Response<PurchaseDto>> CreateAsync(CreatePurchaseDto model, int userId);
    /// <summary>Get a purchase by ID with lines.</summary>
    Task<Response<PurchaseDto>> GetByIdAsync(int id, int userId, bool isAdmin);
    /// <summary>Get all purchases. Admin only.</summary>
    Task<Response<List<PurchaseDto>>> GetAllAsync();
    /// <summary>Get all purchases for the authenticated user's supplier clients.</summary>
    Task<Response<List<PurchaseDto>>> GetAllByUserIdAsync(int userId);
    /// <summary>Get paginated purchases. Admin sees all.</summary>
    Task<Response<PagedList<PurchaseDto>>> GetAllPaginatedAsync(int page, int pageSize);
    /// <summary>Filter purchases by supplierId, statusId, and/or date range.</summary>
    Task<Response<List<PurchaseDto>>> GetFilteredAsync(int? supplierId, int? statusId, DateOnly? dateFrom, DateOnly? dateTo, int userId, bool isAdmin);
    /// <summary>Update purchase header and handle status transitions (Delivered → stock+ledger, Cancelled → reversal).</summary>
    Task<Response<PurchaseDto>> UpdateByIdAsync(int id, UpdatePurchaseDto model, int userId, bool isAdmin);
    /// <summary>Delete a purchase and its lines. Only allowed if purchase has not been Delivered.</summary>
    Task<Response> DeleteByIdAsync(int id);
}

public class PurchaseService : IPurchaseService
{
    private readonly ApplicationDbContext _dbContext;
    private readonly IStockMovementsService _stockMovementsService;
    private readonly IPaymentService _paymentService;
    private readonly IInvoiceService _invoiceService;

    // Seed IDs
    private const int StatusPending = 1;
    private const int StatusDelivered = 3;
    private const int StatusCancelled = 4;
    private const int ClientTypeSupplier = 2;
    private const int TransCategoryPurchases = 2;
    private const int TransTypeDebit = 1;
    private const int TransTypeCredit = 2;
    private const int TransModeCash = 1;
    private const int TransModeCredit = 3;
    private const int MovementSourcePurchase = 1;
    private const int MovementSourceManual = 3;
    private const int MovementTypeOut = 2;

    public PurchaseService(ApplicationDbContext dbContext, IStockMovementsService stockMovementsService, IPaymentService paymentService, IInvoiceService invoiceService)
    {
        _dbContext = dbContext;
        _stockMovementsService = stockMovementsService;
        _paymentService = paymentService;
        _invoiceService = invoiceService;
    }

    public async Task<Response<PurchaseDto>> CreateAsync(CreatePurchaseDto model, int userId)
    {
        var supplier = await _dbContext.Clients.FirstOrDefaultAsync(c => c.Id == model.SupplierId);
        if (supplier is null)
            return Response<PurchaseDto>.ErrorResponse("Not found", "Supplier not found.");
        if (supplier.ClientTypeId != ClientTypeSupplier)
            return Response<PurchaseDto>.ErrorResponse("Validation failed", "Purchases can only be created for Suppliers (ClientTypeId=2), not Customers.");

        var requestedProductIds = model.Lines.Select(l => l.ProductId).Distinct().ToList();
        var existingProductIds = await _dbContext.Products
            .Where(p => requestedProductIds.Contains(p.Id))
            .Select(p => p.Id)
            .ToListAsync();
        var missingProductId = requestedProductIds.FirstOrDefault(id => !existingProductIds.Contains(id));
        if (missingProductId != default)
            return Response<PurchaseDto>.ErrorResponse("Not found", $"Product with ID {missingProductId} does not exist.");

        var purchase = new Purchase
        {
            SupplierId = model.SupplierId,
            StatusId = StatusPending,
            PaymentTypeId = model.PaymentTypeId,
            PurchaseDate = model.PurchaseDate,
            Notes = model.Notes,
            CreatedAt = DateOnly.FromDateTime(DateTime.UtcNow)
        };

        foreach (var line in model.Lines)
        {
            purchase.PurchaseLines.Add(new PurchaseLine
            {
                ProductId = line.ProductId,
                Qty = line.Qty,
                UnitCost = line.UnitCost
            });
        }

        await _dbContext.Purchases.AddAsync(purchase);
        await _dbContext.SaveChangesAsync();

        await _invoiceService.CreateFromPurchaseAsync(purchase.Id, userId);

        var saved = await LoadPurchaseWithIncludes(purchase.Id);
        return Response<PurchaseDto>.SuccessResponse(ToDto(saved!), "Purchase created successfully.");
    }

    public async Task<Response<PurchaseDto>> GetByIdAsync(int id, int userId, bool isAdmin)
    {
        var purchase = await LoadPurchaseWithIncludes(id);
        if (purchase is null)
            return Response<PurchaseDto>.ErrorResponse("Not found", "Purchase not found.");

        if (!isAdmin && purchase.Supplier?.UserId != userId)
            return Response<PurchaseDto>.ErrorResponse("Not found", "Purchase not found.");

        return Response<PurchaseDto>.SuccessResponse(ToDto(purchase), "Purchase fetched successfully.");
    }

    public async Task<Response<List<PurchaseDto>>> GetAllAsync()
    {
        var purchases = await PurchaseQueryWithIncludes()
            .OrderBy(p => p.PurchaseDate)
            .ToListAsync();

        return Response<List<PurchaseDto>>.SuccessResponse(purchases.Select(p => ToDto(p)).ToList(), "Purchases fetched successfully.");
    }

    public async Task<Response<List<PurchaseDto>>> GetAllByUserIdAsync(int userId)
    {
        var purchases = await PurchaseQueryWithIncludes()
            .Where(p => p.Supplier != null && p.Supplier.UserId == userId)
            .OrderBy(p => p.PurchaseDate)
            .ToListAsync();

        return Response<List<PurchaseDto>>.SuccessResponse(purchases.Select(p => ToDto(p)).ToList(), "Purchases fetched successfully.");
    }

    public async Task<Response<PagedList<PurchaseDto>>> GetAllPaginatedAsync(int page, int pageSize)
    {
        var query = PurchaseQueryWithIncludes().OrderBy(p => p.PurchaseDate);
        var totalCount = await query.CountAsync();
        var items = await query.Skip((page - 1) * pageSize).Take(pageSize).ToListAsync();
        var pagedList = new PagedList<PurchaseDto>(items.Select(p => ToDto(p)).ToList(), page, pageSize, totalCount);
        return Response<PagedList<PurchaseDto>>.SuccessResponse(pagedList, "Purchases fetched successfully.");
    }

    public async Task<Response<List<PurchaseDto>>> GetFilteredAsync(
        int? supplierId, int? statusId, DateOnly? dateFrom, DateOnly? dateTo, int userId, bool isAdmin)
    {
        var query = PurchaseQueryWithIncludes();

        if (!isAdmin)
            query = query.Where(p => p.Supplier != null && p.Supplier.UserId == userId);

        if (supplierId.HasValue)
            query = query.Where(p => p.SupplierId == supplierId.Value);

        if (statusId.HasValue)
            query = query.Where(p => p.StatusId == statusId.Value);

        if (dateFrom.HasValue)
            query = query.Where(p => p.PurchaseDate >= dateFrom.Value);

        if (dateTo.HasValue)
            query = query.Where(p => p.PurchaseDate <= dateTo.Value);

        var purchases = await query.OrderBy(p => p.PurchaseDate).ToListAsync();
        return Response<List<PurchaseDto>>.SuccessResponse(purchases.Select(p => ToDto(p)).ToList(), "Filtered purchases fetched successfully.");
    }

    public async Task<Response<PurchaseDto>> UpdateByIdAsync(int id, UpdatePurchaseDto model, int userId, bool isAdmin)
    {
        var purchase = await _dbContext.Purchases
            .Include(p => p.PurchaseLines).ThenInclude(pl => pl.Product)
            .Include(p => p.Supplier)
            .Include(p => p.Status)
            .Include(p => p.PaymentType)
            .FirstOrDefaultAsync(p => p.Id == id);

        if (purchase is null)
            return Response<PurchaseDto>.ErrorResponse("Not found", "Purchase not found.");

        if (!isAdmin && purchase.Supplier?.UserId != userId)
            return Response<PurchaseDto>.ErrorResponse("Not found", "Purchase not found.");

        var previousStatusId = purchase.StatusId ?? 0;
        var newStatusId = model.StatusId;

        // Idempotent re-deliver: already delivered, just update header fields
        if (previousStatusId == StatusDelivered && newStatusId == StatusDelivered)
        {
            purchase.PaymentTypeId = model.PaymentTypeId;
            purchase.Notes = model.Notes;
            if (model.PurchaseDate.HasValue)
                purchase.PurchaseDate = model.PurchaseDate.Value;
            await _dbContext.SaveChangesAsync();
            var reloaded = await LoadPurchaseWithIncludes(id);
            return Response<PurchaseDto>.SuccessResponse(ToDto(reloaded!), "Purchase already delivered. Header fields updated.");
        }

        if (previousStatusId == StatusCancelled)
            return Response<PurchaseDto>.ErrorResponse("Validation failed", "Cannot update a cancelled purchase.");

        // ── Transition to Delivered: stock In + ledger posting ──
        if (newStatusId == StatusDelivered && previousStatusId != StatusDelivered)
            return await TransitionToDelivered(purchase, model, userId);

        // ── Transition to Cancelled ──
        if (newStatusId == StatusCancelled)
            return await TransitionToCancelled(purchase, previousStatusId, userId);

        // ── Normal update (Pending ↔ InProgressed, or field changes) ──
        purchase.StatusId = model.StatusId;
        purchase.PaymentTypeId = model.PaymentTypeId;
        purchase.Notes = model.Notes;
        if (model.PurchaseDate.HasValue)
            purchase.PurchaseDate = model.PurchaseDate.Value;
        await _dbContext.SaveChangesAsync();

        var updated = await LoadPurchaseWithIncludes(id);
        return Response<PurchaseDto>.SuccessResponse(ToDto(updated!), "Purchase updated successfully.");
    }

    public async Task<Response> DeleteByIdAsync(int id)
    {
        var purchase = await _dbContext.Purchases
            .Include(p => p.PurchaseLines)
            .FirstOrDefaultAsync(p => p.Id == id);

        if (purchase is null)
            return Response.ErrorResponse("Not found", "Purchase not found.");

        if (purchase.StatusId == StatusDelivered)
            return Response.ErrorResponse("Validation failed", "Cannot delete a delivered purchase. Cancel it instead.");

        var linkedTransactions = await _dbContext.Transactions
            .Where(t => t.PurchaseId == id)
            .ToListAsync();
        if (linkedTransactions.Count > 0)
            _dbContext.Transactions.RemoveRange(linkedTransactions);

        _dbContext.PurchaseLines.RemoveRange(purchase.PurchaseLines);
        _dbContext.Purchases.Remove(purchase);
        await _dbContext.SaveChangesAsync();

        return Response.SuccessResponse("Purchase deleted successfully.");
    }

    // ── Status transition: Delivered ─────────────────────────────────────────

    private async Task<Response<PurchaseDto>> TransitionToDelivered(Purchase purchase, UpdatePurchaseDto model, int userId)
    {
        await using var transaction = await _dbContext.Database.BeginTransactionAsync();
        try
        {
            // Idempotency guard: reject if transactions already posted for this purchase
            var alreadyPosted = await _dbContext.Transactions.AnyAsync(t => t.PurchaseId == purchase.Id);
            if (alreadyPosted)
            {
                await transaction.RollbackAsync();
                return Response<PurchaseDto>.ErrorResponse("Validation failed", "Ledger already posted for this purchase.");
            }

            // Update header
            purchase.StatusId = StatusDelivered;
            purchase.PaymentTypeId = model.PaymentTypeId;
            purchase.Notes = model.Notes;
            if (model.PurchaseDate.HasValue)
                purchase.PurchaseDate = model.PurchaseDate.Value;
            await _dbContext.SaveChangesAsync();

            // Stock In per line via IStockMovementsService
            foreach (var line in purchase.PurchaseLines)
            {
                if (line.ProductId is null) continue;

                var movResult = await _stockMovementsService.CreateAsync(new CreateStockMovementsDto
                {
                    ProductId = line.ProductId.Value,
                    MovementSource = MovementSourcePurchase,
                    Qty = line.Qty,
                    UnitCost = line.UnitCost,
                    MovementDate = purchase.PurchaseDate
                }, userId);

                if (!movResult.Success)
                {
                    await transaction.RollbackAsync();
                    return Response<PurchaseDto>.ErrorResponse(movResult.Message,
                        movResult.Errors ?? new List<string>());
                }
            }

            // Ledger posting: one header-level Transaction
            var purchaseTotal = purchase.PurchaseLines.Sum(l => l.Qty * l.UnitCost);
            var transMode = MapPaymentTypeToTransMode(purchase.PaymentTypeId ?? 1);

            var txn = new Transaction
            {
                ClientId = purchase.SupplierId,
                PurchaseId = purchase.Id,
                UserId = userId,
                TransTypeId = TransTypeDebit,
                TransModeId = transMode,
                TransCategoryId = TransCategoryPurchases,
                Amount = purchaseTotal,
                TransDate = purchase.PurchaseDate,
                Notes = $"Purchase — Purchase #{purchase.Id}",
                CreatedAt = DateOnly.FromDateTime(DateTime.UtcNow)
            };
            await _dbContext.Transactions.AddAsync(txn);
            await _dbContext.SaveChangesAsync();
            await transaction.CommitAsync();

            await _invoiceService.UpdateStatusOnDeliveryAsync(null, purchase.Id);

            // Auto-apply any unallocated advance payments against this newly delivered purchase
            await _paymentService.ApplyUnallocatedCreditAsync(purchase.SupplierId ?? 0, null, purchase.Id);

            var reloaded = await LoadPurchaseWithIncludes(purchase.Id);
            return Response<PurchaseDto>.SuccessResponse(ToDto(reloaded!), "Purchase delivered. Stock and ledger updated.");
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
            return Response<PurchaseDto>.ErrorResponse("Internal server error", ex.Message);
        }
    }

    // ── Status transition: Cancelled ─────────────────────────────────────────

    private async Task<Response<PurchaseDto>> TransitionToCancelled(Purchase purchase, int previousStatusId, int userId)
    {
        await using var transaction = await _dbContext.Database.BeginTransactionAsync();
        try
        {
            purchase.StatusId = StatusCancelled;
            await _dbContext.SaveChangesAsync();

            // If previously Delivered, reverse stock and ledger
            if (previousStatusId == StatusDelivered)
            {
                // Reverse stock: Manual Out per line (undo the In)
                foreach (var line in purchase.PurchaseLines)
                {
                    if (line.ProductId is null) continue;

                    var movResult = await _stockMovementsService.CreateAsync(new CreateStockMovementsDto
                    {
                        ProductId = line.ProductId.Value,
                        MovementSource = MovementSourceManual,
                        MovementType = MovementTypeOut,
                        Qty = line.Qty,
                        MovementDate = DateOnly.FromDateTime(DateTime.UtcNow)
                    }, userId);

                    if (!movResult.Success)
                    {
                        await transaction.RollbackAsync();
                        return Response<PurchaseDto>.ErrorResponse(movResult.Message,
                            movResult.Errors ?? new List<string>());
                    }
                }

                // Compensating ledger entry (opposite: Debit, negative amount)
                var purchaseTotal = purchase.PurchaseLines.Sum(l => l.Qty * l.UnitCost);
                var transMode = MapPaymentTypeToTransMode(purchase.PaymentTypeId ?? 1);

                var reversalTxn = new Transaction
                {
                    ClientId = purchase.SupplierId,
                    PurchaseId = purchase.Id,
                    UserId = userId,
                    TransTypeId = TransTypeCredit,
                    TransModeId = transMode,
                    TransCategoryId = TransCategoryPurchases,
                    Amount = -purchaseTotal,
                    TransDate = DateOnly.FromDateTime(DateTime.UtcNow),
                    Notes = $"Purchase reversal — Purchase #{purchase.Id} cancelled",
                    CreatedAt = DateOnly.FromDateTime(DateTime.UtcNow)
                };
                await _dbContext.Transactions.AddAsync(reversalTxn);
                await _dbContext.SaveChangesAsync();
            }

            await transaction.CommitAsync();

            await _invoiceService.CancelByOrderOrPurchaseAsync(null, purchase.Id);

            var reloaded = await LoadPurchaseWithIncludes(purchase.Id);
            var message = previousStatusId == StatusDelivered
                ? "Purchase cancelled. Stock and ledger reversed."
                : "Purchase cancelled.";
            return Response<PurchaseDto>.SuccessResponse(ToDto(reloaded!), message);
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
            return Response<PurchaseDto>.ErrorResponse("Internal server error", ex.Message);
        }
    }

    // ── Helpers ──────────────────────────────────────────────────────────────

    private static int MapPaymentTypeToTransMode(int paymentTypeId) =>
        paymentTypeId switch
        {
            1 => TransModeCash,
            2 => TransModeCredit,
            _ => TransModeCash
        };

    private IQueryable<Purchase> PurchaseQueryWithIncludes() =>
        _dbContext.Purchases
            .Include(p => p.Supplier)
            .Include(p => p.Status)
            .Include(p => p.PaymentType)
            .Include(p => p.PurchaseLines).ThenInclude(pl => pl.Product)
            .Include(p => p.PaymentAllocations).ThenInclude(a => a.Payment);

    private async Task<Purchase?> LoadPurchaseWithIncludes(int purchaseId) =>
        await PurchaseQueryWithIncludes().FirstOrDefaultAsync(p => p.Id == purchaseId);

    private static PurchaseDto ToDto(Purchase purchase)
    {
        var total = purchase.PurchaseLines.Sum(l => l.Qty * l.UnitCost);
        var amountPaid = purchase.PaymentAllocations
            .Where(a => a.Payment != null && !a.Payment.IsReversed)
            .Sum(a => a.AllocatedAmount);
        var outstanding = total - amountPaid;
        var paymentStatus = outstanding <= 0 ? "FullyPaid" : amountPaid > 0 ? "PartiallyPaid" : "Unpaid";
        return new()
        {
            Id = purchase.Id,
            SupplierId = purchase.SupplierId ?? 0,
            SupplierName = purchase.Supplier?.Name,
            StatusId = purchase.StatusId ?? 0,
            StatusName = purchase.Status?.Name,
            PaymentTypeId = purchase.PaymentTypeId ?? 0,
            PaymentTypeName = purchase.PaymentType?.Name,
            PurchaseDate = purchase.PurchaseDate,
            Notes = purchase.Notes,
            CreatedAt = purchase.CreatedAt,
            Total = total,
            AmountPaid = amountPaid,
            Payable = outstanding < 0 ? 0 : outstanding,
            PaymentStatus = paymentStatus,
            PurchaseLines = purchase.PurchaseLines.Select(l => new PurchaseLineDto
            {
                Id = l.Id,
                PurchaseId = l.PurchaseId,
                ProductId = l.ProductId ?? 0,
                ProductName = l.Product?.Name,
                Qty = l.Qty,
                UnitCost = l.UnitCost
            }).ToList()
        };
    }
}

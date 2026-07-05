using HamzaTex.Api.Data;
using HamzaTex.Api.Entities;
using HamzaTex.Api.Helpers;
using HamzaTex.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace HamzaTex.Api.Services;

/// <summary>
/// Purchase (procurement) management. Handles full lifecycle including stock and ledger effects
/// on status transitions (Received posts stock In + transaction, Cancelled reverses both).
/// </summary>
public interface IPurchaseService
{
    /// <summary>Create a new purchase with lines. Supplier must be a Client with ClientTypeId=2. Starts as Pending.</summary>
    Task<Response<PurchaseDto>> CreateAsync(CreatePurchaseDto model, int userId);
    /// <summary>Get a purchase by ID with lines.</summary>
    Task<Response<PurchaseDto>> GetByIdAsync(int id, int userId, bool isAdmin);
    /// <summary>Get all purchases (unpaginated). Admin sees all; non-admins see only their own. Used for PDF export.</summary>
    Task<Response<List<PurchaseDto>>> GetAllAsync(int userId, bool isAdmin);
    /// <summary>Get paginated purchases. Admin sees all; non-admins see only their own purchases.</summary>
    Task<Response<PagedList<PurchaseDto>>> GetAllPaginatedAsync(int page, int pageSize, int userId, bool isAdmin);
    /// <summary>Filter purchases by supplierId, statusId, and/or date range.</summary>
    Task<Response<List<PurchaseDto>>> GetFilteredAsync(int? supplierId, int? statusId, DateOnly? dateFrom, DateOnly? dateTo, int userId, bool isAdmin);
    /// <summary>Update purchase header and handle status transitions (Received → stock+ledger, Cancelled → reversal).</summary>
    Task<Response<PurchaseDto>> UpdateByIdAsync(int id, UpdatePurchaseDto model, int userId, bool isAdmin);
    /// <summary>Replace all lines on a Pending or InProgress purchase. Syncs the linked Draft invoice. Blocked for Received/Cancelled purchases.</summary>
    Task<Response<PurchaseDto>> UpdateLinesAsync(int id, UpdatePurchaseLinesDto model, int userId, bool isAdmin);
    /// <summary>Delete a purchase and its lines. Only allowed if purchase has not been Received.</summary>
    Task<Response> DeleteByIdAsync(int id);
}

public class PurchaseService : IPurchaseService
{
    private readonly ApplicationDbContext _dbContext;
    private readonly IStockMovementsService _stockMovementsService;
    private readonly IPaymentService _paymentService;
    private readonly IInvoiceService _invoiceService;
    private readonly INotificationService _notification;

    // Seed IDs
    private const int StatusPending = 1;
    private const int StatusReceived = 3;
    private const int StatusCancelled = 4;
    private const int InvoiceStatusDraft = 1;
    private const int ClientTypeSupplier = 2;
    private const int TransCategoryPurchases = 2;
    private const int TransTypeDebit = 1;
    private const int TransTypeCredit = 2;
    private const int TransModeCash = 1;
    private const int TransModeCredit = 3;
    private const int MovementSourcePurchase = 1;
    private const int MovementSourceManual = 3;
    private const int MovementTypeOut = 2;

    public PurchaseService(ApplicationDbContext dbContext, IStockMovementsService stockMovementsService, IPaymentService paymentService, IInvoiceService invoiceService, INotificationService notification)
    {
        _dbContext = dbContext;
        _stockMovementsService = stockMovementsService;
        _paymentService = paymentService;
        _invoiceService = invoiceService;
        _notification = notification;
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

        await using var transaction = await _dbContext.Database.BeginTransactionAsync();
        try
        {
            var purchase = new Purchase
            {
                SupplierId = model.SupplierId,
                UserId = userId,
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

            // Auto-create the linked Draft invoice INSIDE the transaction. The invoice
            // service shares this scoped DbContext, so its SaveChanges enlists here and a
            // failure rolls the purchase back too — otherwise a 500 mid-invoice leaves a
            // committed purchase and a client retry would duplicate it.
            await _invoiceService.CreateFromPurchaseAsync(purchase.Id, userId);

            await transaction.CommitAsync();

            var saved = await LoadPurchaseWithIncludes(purchase.Id);
            try { await _notification.CreateAsync(new CreateNotificationDto
            {
                UserId = userId,
                Type = "purchase_created",
                Title = "New Purchase",
                Body = $"Purchase #{purchase.Id} created from {supplier.Name ?? "Supplier"}",
                EntityId = purchase.Id
            }); } catch { }
            return Response<PurchaseDto>.SuccessResponse(ToDto(saved!), "Purchase created successfully.");
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
            return Response<PurchaseDto>.ErrorResponse("Internal server error", ex.Message);
        }
    }

    public async Task<Response<PurchaseDto>> GetByIdAsync(int id, int userId, bool isAdmin)
    {
        var purchase = await LoadPurchaseWithIncludes(id);
        if (purchase is null)
            return Response<PurchaseDto>.ErrorResponse("Not found", "Purchase not found.");

        if (!isAdmin && purchase.UserId != userId)
            return Response<PurchaseDto>.ErrorResponse("Not found", "Purchase not found.");

        return Response<PurchaseDto>.SuccessResponse(ToDto(purchase), "Purchase fetched successfully.");
    }

    public async Task<Response<List<PurchaseDto>>> GetAllAsync(int userId, bool isAdmin)
    {
        var query = PurchaseQueryWithIncludes().AsNoTracking();
        if (!isAdmin)
            query = query.Where(p => p.UserId == userId);

        var purchases = await query.OrderByDescending(p => p.PurchaseDate).ToListAsync();

        return Response<List<PurchaseDto>>.SuccessResponse(purchases.Select(p => ToDto(p)).ToList(), "Purchases fetched successfully.");
    }

    public async Task<Response<PagedList<PurchaseDto>>> GetAllPaginatedAsync(int page, int pageSize, int userId, bool isAdmin)
    {
        var query = PurchaseQueryWithIncludes().AsNoTracking();
        if (!isAdmin)
            query = query.Where(p => p.UserId == userId);

        query = query.OrderByDescending(p => p.PurchaseDate);
        var paged = await PagedList<Purchase>.CreateAsync(query, page, pageSize);
        var pagedList = new PagedList<PurchaseDto>(paged.Items.Select(p => ToDto(p)).ToList(), paged.Page, paged.PageSize, paged.TotalCount);
        return Response<PagedList<PurchaseDto>>.SuccessResponse(pagedList, "Purchases fetched successfully.");
    }

    public async Task<Response<List<PurchaseDto>>> GetFilteredAsync(
        int? supplierId, int? statusId, DateOnly? dateFrom, DateOnly? dateTo, int userId, bool isAdmin)
    {
        var query = PurchaseQueryWithIncludes().AsNoTracking();

        if (!isAdmin)
            query = query.Where(p => p.UserId == userId);

        if (supplierId.HasValue)
            query = query.Where(p => p.SupplierId == supplierId.Value);

        if (statusId.HasValue)
            query = query.Where(p => p.StatusId == statusId.Value);

        if (dateFrom.HasValue)
            query = query.Where(p => p.PurchaseDate >= dateFrom.Value);

        if (dateTo.HasValue)
            query = query.Where(p => p.PurchaseDate <= dateTo.Value);

        var purchases = await query.OrderByDescending(p => p.PurchaseDate).ToListAsync();
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

        if (!isAdmin && purchase.UserId != userId)
            return Response<PurchaseDto>.ErrorResponse("Not found", "Purchase not found.");

        var previousStatusId = purchase.StatusId ?? 0;
        var newStatusId = model.StatusId;

        // Idempotent re-receive: already received, just update header fields
        if (previousStatusId == StatusReceived && newStatusId == StatusReceived)
        {
            purchase.PaymentTypeId = model.PaymentTypeId;
            purchase.Notes = model.Notes;
            if (model.PurchaseDate.HasValue)
                purchase.PurchaseDate = model.PurchaseDate.Value;
            await _dbContext.SaveChangesAsync();
            var reloaded = await LoadPurchaseWithIncludes(id);
            return Response<PurchaseDto>.SuccessResponse(ToDto(reloaded!), "Purchase already received. Header fields updated.");
        }

        if (previousStatusId == StatusCancelled)
            return Response<PurchaseDto>.ErrorResponse("Validation failed", "Cannot update a cancelled purchase.");

        // ── Transition to Received: stock In + ledger posting ──
        if (newStatusId == StatusReceived && previousStatusId != StatusReceived)
            return await TransitionToReceived(purchase, model, userId);

        // ── Transition to Cancelled ──
        if (newStatusId == StatusCancelled)
            return await TransitionToCancelled(purchase, previousStatusId, userId);

        // ── Normal update (Pending ↔ InProgressed, or field changes) ──
        var oldStatusId = purchase.StatusId;
        purchase.StatusId = model.StatusId;
        purchase.PaymentTypeId = model.PaymentTypeId;
        purchase.Notes = model.Notes;
        if (model.PurchaseDate.HasValue)
            purchase.PurchaseDate = model.PurchaseDate.Value;
        await _dbContext.SaveChangesAsync();

        var updated = await LoadPurchaseWithIncludes(id);
        if (oldStatusId != model.StatusId)
        {
            var statusName = updated?.Status?.Name ?? model.StatusId.ToString();
            try { await _notification.CreateAsync(new CreateNotificationDto
            {
                UserId = userId,
                Type = "purchase_status_updated",
                Title = "Purchase Status Updated",
                Body = $"Purchase #{id} status changed to {statusName}",
                EntityId = id
            }); } catch { }
        }
        return Response<PurchaseDto>.SuccessResponse(ToDto(updated!), "Purchase updated successfully.");
    }

    public async Task<Response<PurchaseDto>> UpdateLinesAsync(int id, UpdatePurchaseLinesDto model, int userId, bool isAdmin)
    {
        var purchase = await _dbContext.Purchases
            .Include(p => p.PurchaseLines)
            .FirstOrDefaultAsync(p => p.Id == id);

        if (purchase is null)
            return Response<PurchaseDto>.ErrorResponse("Not found", "Purchase not found.");

        if (!isAdmin && purchase.UserId != userId)
            return Response<PurchaseDto>.ErrorResponse("Not found", "Purchase not found.");

        if (purchase.StatusId == StatusReceived || purchase.StatusId == StatusCancelled)
            return Response<PurchaseDto>.ErrorResponse("Validation failed", "Purchase lines can only be edited when the purchase is Pending or InProgress.");

        var requestedProductIds = model.Lines.Select(l => l.ProductId).Distinct().ToList();
        var existingProducts = await _dbContext.Products
            .Where(p => requestedProductIds.Contains(p.Id))
            .Select(p => new { p.Id, p.Name })
            .ToListAsync();

        var missingProductId = requestedProductIds.FirstOrDefault(pid => !existingProducts.Select(p => p.Id).Contains(pid));
        if (missingProductId != default)
            return Response<PurchaseDto>.ErrorResponse("Not found", $"Product with ID {missingProductId} does not exist.");

        await using var transaction = await _dbContext.Database.BeginTransactionAsync();
        try
        {
            _dbContext.PurchaseLines.RemoveRange(purchase.PurchaseLines);
            purchase.PurchaseLines.Clear();

            foreach (var line in model.Lines)
            {
                purchase.PurchaseLines.Add(new PurchaseLine
                {
                    ProductId = line.ProductId,
                    Qty       = line.Qty,
                    UnitCost  = line.UnitCost
                });
            }
            await _dbContext.SaveChangesAsync();

            var invoice = await _dbContext.Invoices
                .Include(i => i.InvoiceLines)
                .FirstOrDefaultAsync(i => i.PurchaseId == id);

            if (invoice is not null && invoice.InvoiceStatusId == InvoiceStatusDraft)
            {
                _dbContext.InvoiceLines.RemoveRange(invoice.InvoiceLines);

                var productNameMap = existingProducts.ToDictionary(p => p.Id, p => p.Name);

                foreach (var line in model.Lines)
                {
                    var productName = productNameMap.TryGetValue(line.ProductId, out var n)
                        ? n ?? $"Product #{line.ProductId}"
                        : $"Product #{line.ProductId}";

                    invoice.InvoiceLines.Add(new InvoiceLine
                    {
                        ProductName = productName,
                        Qty         = line.Qty,
                        UnitPrice   = line.UnitCost,
                        LineTotal   = line.Qty * line.UnitCost
                    });
                }

                invoice.TotalAmount = model.Lines.Sum(l => l.Qty * l.UnitCost);
                await _dbContext.SaveChangesAsync();
            }

            await transaction.CommitAsync();

            var reloaded = await LoadPurchaseWithIncludes(id);
            return Response<PurchaseDto>.SuccessResponse(ToDto(reloaded!), "Purchase lines updated successfully.");
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
            return Response<PurchaseDto>.ErrorResponse("Internal server error", ex.Message);
        }
    }

    public async Task<Response> DeleteByIdAsync(int id)
    {
        var purchase = await _dbContext.Purchases
            .Include(p => p.PurchaseLines)
            .FirstOrDefaultAsync(p => p.Id == id);

        if (purchase is null)
            return Response.ErrorResponse("Not found", "Purchase not found.");

        if (purchase.StatusId == StatusReceived)
            return Response.ErrorResponse("Validation failed", "Cannot delete a received purchase. Cancel it instead.");

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

    // ── Status transition: Received ─────────────────────────────────────────

    private async Task<Response<PurchaseDto>> TransitionToReceived(Purchase purchase, UpdatePurchaseDto model, int userId)
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
            purchase.StatusId = StatusReceived;
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

            // Auto-apply any unallocated advance payments against this newly received purchase
            await _paymentService.ApplyUnallocatedCreditAsync(purchase.SupplierId ?? 0, null, purchase.Id);

            var reloaded = await LoadPurchaseWithIncludes(purchase.Id);
            try { await _notification.CreateAsync(new CreateNotificationDto
            {
                UserId = userId,
                Type = "purchase_received",
                Title = "Purchase Received",
                Body = $"Purchase #{purchase.Id} from {purchase.Supplier?.Name ?? "Supplier"} received",
                EntityId = purchase.Id
            }); } catch { }
            return Response<PurchaseDto>.SuccessResponse(ToDto(reloaded!), "Purchase received. Stock and ledger updated.");
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

            // If previously Received, reverse stock and ledger
            if (previousStatusId == StatusReceived)
            {
                foreach (var line in purchase.PurchaseLines)
                {
                    if (line.ProductId is null) continue;
                    var product = await _dbContext.Products
                        .Include(p => p.Unit)
                        .FirstOrDefaultAsync(p => p.Id == line.ProductId.Value);
                    if (product is null)
                    {
                        await transaction.RollbackAsync();
                        return Response<PurchaseDto>.ErrorResponse("Not found", $"Product {line.ProductId} not found.");
                    }
                    if ((product.Quantity ?? 0) < line.Qty)
                    {
                        await transaction.RollbackAsync();
                        return Response<PurchaseDto>.ErrorResponse("Cannot cancel purchase",
                            $"Product '{product.Name}' has insufficient stock to reverse this purchase " +
                            $"(available: {product.Quantity ?? 0} {product.Unit?.Name}, required: {line.Qty} {product.Unit?.Name}). " +
                            "The received goods have already been fully consumed — record a manual adjustment instead.");
                    }
                }

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
                        UnitCost = line.UnitCost,
                        AverageDimensionOverride = StockAverageDimension.Cost,
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
            try { await _notification.CreateAsync(new CreateNotificationDto
            {
                UserId = userId,
                Type = "purchase_cancelled",
                Title = "Purchase Cancelled",
                Body = $"Purchase #{purchase.Id} has been cancelled",
                EntityId = purchase.Id
            }); } catch { }
            var message = previousStatusId == StatusReceived
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

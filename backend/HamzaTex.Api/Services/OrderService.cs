using HamzaTex.Api.Data;
using HamzaTex.Api.Entities;
using HamzaTex.Api.Helpers;
using HamzaTex.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace HamzaTex.Api.Services;

/// <summary>
/// Order (sales) management. Handles full lifecycle including stock and ledger effects
/// on status transitions (Delivered posts stock + transaction, Cancelled reverses both).
/// </summary>
public interface IOrderService
{
    /// <summary>Create a new order with lines. Client must be a Customer (ClientTypeId=1). Starts as Pending.</summary>
    Task<Response<OrderDto>> CreateAsync(CreateOrderDto model, int userId);
    /// <summary>Get an order by ID with lines. Scoped to the user's clients (staff) or all (admin).</summary>
    Task<Response<OrderDto>> GetByIdAsync(int id, int userId, bool isAdmin);
    /// <summary>Get all orders (unpaginated). Admin sees all; non-admins see only their own. Used for PDF export.</summary>
    Task<Response<List<OrderDto>>> GetAllAsync(int userId, bool isAdmin);
    /// <summary>Get paginated orders. Admin sees all; non-admins see only their own orders.</summary>
    Task<Response<PagedList<OrderDto>>> GetAllPaginatedAsync(int page, int pageSize, int userId, bool isAdmin);
    /// <summary>Filter orders by clientId, statusId, date range, and/or a free-text search matching BillNo or client name.</summary>
    Task<Response<List<OrderDto>>> GetFilteredAsync(int? clientId, int? statusId, DateOnly? dateFrom, DateOnly? dateTo, string? search, int userId, bool isAdmin);
    /// <summary>Update order header and handle status transitions (Delivered → stock+ledger, Cancelled → reversal).</summary>
    Task<Response<OrderDto>> UpdateByIdAsync(int id, UpdateOrderDto model, int userId, bool isAdmin);
    /// <summary>Replace all lines on a Pending or InProgress order. Syncs the linked Draft invoice. Blocked for Delivered/Cancelled orders.</summary>
    Task<Response<OrderDto>> UpdateLinesAsync(int id, UpdateOrderLinesDto model, int userId, bool isAdmin);
    /// <summary>Delete an order and its lines. Only allowed if order has not been Delivered.</summary>
    Task<Response> DeleteByIdAsync(int id);
}

public class OrderService : IOrderService
{
    private readonly ApplicationDbContext _dbContext;
    private readonly IStockMovementsService _stockMovementsService;
    private readonly IPaymentService _paymentService;
    private readonly IInvoiceService _invoiceService;
    private readonly INotificationService _notification;

  // Seed IDs
    private const int StatusPending = 1;
    private const int InvoiceStatusDraft = 1;
    private const int StatusDelivered = 3;
    private const int StatusCancelled = 4;
    private const int ClientTypeCustomer = 1;
    private const int TransCategorySales = 1;
    private const int TransTypeDebit = 1;
    private const int TransTypeCredit = 2;
    private const int TransModeCash = 1;
    private const int TransModeCredit = 3;
    private const int MovementSourceSale = 2;
    private const int MovementSourceManual = 3;
    private const int MovementTypeIn = 1;

    public OrderService(ApplicationDbContext dbContext, IStockMovementsService stockMovementsService, IPaymentService paymentService, IInvoiceService invoiceService, INotificationService notification)
    {
        _dbContext = dbContext;
        _stockMovementsService = stockMovementsService;
        _paymentService = paymentService;
        _invoiceService = invoiceService;
        _notification = notification;
    }

    public async Task<Response<OrderDto>> CreateAsync(CreateOrderDto model, int userId)
    {
        var client = await _dbContext.Clients.FirstOrDefaultAsync(c => c.Id == model.ClientId);
        if (client is null)
            return Response<OrderDto>.ErrorResponse("Not found", "Client not found.");
        if (client.ClientTypeId != ClientTypeCustomer)
            return Response<OrderDto>.ErrorResponse("Validation failed", "Orders can only be created for Customers (ClientTypeId=1), not Suppliers.");

        var requestedProductIds = model.Lines.Select(l => l.ProductId).Distinct().ToList();
        var existingProductIds = await _dbContext.Products
            .Where(p => requestedProductIds.Contains(p.Id))
            .Select(p => p.Id)
            .ToListAsync();
        var missingProductId = requestedProductIds.FirstOrDefault(id => !existingProductIds.Contains(id));
        if (missingProductId != default)
            return Response<OrderDto>.ErrorResponse("Not found", $"Product with ID {missingProductId} does not exist.");

        var stockError = await ValidateAvailableStockAsync(
            model.Lines.Select(l => (l.ProductId, l.Qty)));
        if (stockError is not null)
            return Response<OrderDto>.ErrorResponse("Insufficient stock", stockError);

        var hijriOffset = (await _dbContext.SystemSettings.AsNoTracking().FirstOrDefaultAsync())?.HijriOffsetDays ?? 0;
        var orderDateHijri = string.IsNullOrWhiteSpace(model.OrderDateHijri)
            ? HijriDateHelper.ToHijriString(model.OrderDate, hijriOffset)
            : model.OrderDateHijri;

        await using var transaction = await _dbContext.Database.BeginTransactionAsync();
        try
        {
            var order = new Order
            {
                ClientId = model.ClientId,
                UserId = userId,
                StatusId = StatusPending,
                PaymentTypeId = model.PaymentTypeId,
                OrderDate = model.OrderDate,
                OrderDateHijri = orderDateHijri,
                Notes = model.Notes,
                BillNo = model.BillNo,
                CreatedAt = DateOnly.FromDateTime(DateTime.UtcNow)
            };

            foreach (var line in model.Lines)
            {
                order.OrderLines.Add(new OrderLine
                {
                    ProductId = line.ProductId,
                    Qty = line.Qty,
                    UnitPrice = line.UnitPrice
                });
            }

            await _dbContext.Orders.AddAsync(order);
            await _dbContext.SaveChangesAsync();

            // Auto-create the linked Draft invoice INSIDE the transaction. The invoice
            // service shares this scoped DbContext, so its SaveChanges enlists here and a
            // failure rolls the order back too — otherwise a 500 mid-invoice leaves a
            // committed order and a client retry would duplicate it.
            await _invoiceService.CreateFromOrderAsync(order.Id, userId);

            await transaction.CommitAsync();

            // Reload with navigation properties
            var saved = await LoadOrderWithIncludes(order.Id);
            try { await _notification.CreateAsync(new CreateNotificationDto
            {
                UserId = userId,
                Type = "order_created",
                Title = "New Order",
                Body = $"Order #{order.Id} created for {client.Name ?? "Client"}",
                EntityId = order.Id
            }); } catch { }
            return Response<OrderDto>.SuccessResponse(ToDto(saved!), "Order created successfully.");
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
            return Response<OrderDto>.ErrorResponse("Internal server error", ex.Message);
        }
    }

    public async Task<Response<OrderDto>> GetByIdAsync(int id, int userId, bool isAdmin)
    {
        var order = await LoadOrderWithIncludes(id);
        if (order is null)
            return Response<OrderDto>.ErrorResponse("Not found", "Order not found.");

        if (!isAdmin && order.UserId != userId)
            return Response<OrderDto>.ErrorResponse("Not found", "Order not found.");

        return Response<OrderDto>.SuccessResponse(ToDto(order), "Order fetched successfully.");
    }

    public async Task<Response<List<OrderDto>>> GetAllAsync(int userId, bool isAdmin)
    {
        var query = OrderQueryWithIncludes().AsNoTracking();
        if (!isAdmin)
            query = query.Where(o => o.UserId == userId);

        var orders = await query.OrderByDescending(o => o.OrderDate).ToListAsync();

        return Response<List<OrderDto>>.SuccessResponse(orders.Select(o => ToDto(o)).ToList(), "Orders fetched successfully.");
    }

    public async Task<Response<PagedList<OrderDto>>> GetAllPaginatedAsync(int page, int pageSize, int userId, bool isAdmin)
    {
        var query = OrderQueryWithIncludes().AsNoTracking();
        if (!isAdmin)
            query = query.Where(o => o.UserId == userId);

        query = query.OrderByDescending(o => o.OrderDate);
        var paged = await PagedList<Order>.CreateAsync(query, page, pageSize);
        var pagedList = new PagedList<OrderDto>(paged.Items.Select(o => ToDto(o)).ToList(), paged.Page, paged.PageSize, paged.TotalCount);
        return Response<PagedList<OrderDto>>.SuccessResponse(pagedList, "Orders fetched successfully.");
    }

    public async Task<Response<List<OrderDto>>> GetFilteredAsync(
        int? clientId, int? statusId, DateOnly? dateFrom, DateOnly? dateTo, string? search, int userId, bool isAdmin)
    {
        var query = OrderQueryWithIncludes().AsNoTracking();

        if (!isAdmin)
            query = query.Where(o => o.UserId == userId);

        if (clientId.HasValue)
            query = query.Where(o => o.ClientId == clientId.Value);

        if (statusId.HasValue)
            query = query.Where(o => o.StatusId == statusId.Value);

        if (dateFrom.HasValue)
            query = query.Where(o => o.OrderDate >= dateFrom.Value);

        if (dateTo.HasValue)
            query = query.Where(o => o.OrderDate <= dateTo.Value);

        if (!string.IsNullOrWhiteSpace(search))
            query = query.Where(o =>
                (o.BillNo != null && o.BillNo.Contains(search)) ||
                (o.Client != null && o.Client.Name.Contains(search)));

        var orders = await query.OrderByDescending(o => o.OrderDate).ToListAsync();
        return Response<List<OrderDto>>.SuccessResponse(orders.Select(o => ToDto(o)).ToList(), "Filtered orders fetched successfully.");
    }

    public async Task<Response<OrderDto>> UpdateByIdAsync(int id, UpdateOrderDto model, int userId, bool isAdmin)
    {
        var order = await _dbContext.Orders
            .Include(o => o.OrderLines).ThenInclude(ol => ol.Product)
            .Include(o => o.Client)
            .Include(o => o.Status)
            .Include(o => o.PaymentType)
            .FirstOrDefaultAsync(o => o.Id == id);

        if (order is null)
            return Response<OrderDto>.ErrorResponse("Not found", "Order not found.");

        if (!isAdmin && order.UserId != userId)
            return Response<OrderDto>.ErrorResponse("Not found", "Order not found.");

        var previousStatusId = order.StatusId ?? 0;
        var newStatusId = model.StatusId;

        // Prevent re-delivering or re-cancelling
        if (previousStatusId == StatusDelivered && newStatusId == StatusDelivered)
        {
            // Idempotent: already delivered, just update other fields
            if (model.PaymentTypeId.HasValue) order.PaymentTypeId = model.PaymentTypeId.Value;
            order.Notes = model.Notes;
            ApplyBillNo(order, model.BillNo);
            if (model.OrderDate.HasValue)
                order.OrderDate = model.OrderDate.Value;
            await _dbContext.SaveChangesAsync();
            var reloaded = await LoadOrderWithIncludes(id);
            return Response<OrderDto>.SuccessResponse(ToDto(reloaded!), "Order already delivered. Header fields updated.");
        }

        if (previousStatusId == StatusCancelled)
            return Response<OrderDto>.ErrorResponse("Validation failed", "Cannot update a cancelled order.");

        // ── Transition to Delivered: stock out + ledger posting ──
        if (newStatusId == StatusDelivered && previousStatusId != StatusDelivered)
        {
            var result = await TransitionToDelivered(order, model, userId);
            if (!result.Success)
                return result;
            return result;
        }

        // ── Transition to Cancelled ──
        if (newStatusId == StatusCancelled)
        {
            var result = await TransitionToCancelled(order, previousStatusId, userId);
            if (!result.Success)
                return result;
            return result;
        }

        // ── Normal update (Pending ↔ InProgressed, or field changes) ──
        var oldStatusId = order.StatusId;
        order.StatusId = model.StatusId;
        if (model.PaymentTypeId.HasValue) order.PaymentTypeId = model.PaymentTypeId.Value;
        order.Notes = model.Notes;
        ApplyBillNo(order, model.BillNo);
        if (model.OrderDate.HasValue)
            order.OrderDate = model.OrderDate.Value;
        await _dbContext.SaveChangesAsync();

        var updated = await LoadOrderWithIncludes(id);
        if (oldStatusId != model.StatusId)
        {
            var statusName = updated?.Status?.Name ?? model.StatusId.ToString();
            try { await _notification.CreateAsync(new CreateNotificationDto
            {
                UserId = userId,
                Type = "order_status_updated",
                Title = "Order Status Updated",
                Body = $"Order #{id} status changed to {statusName}",
                EntityId = id
            }); } catch { }
        }
        return Response<OrderDto>.SuccessResponse(ToDto(updated!), "Order updated successfully.");
    }

    public async Task<Response<OrderDto>> UpdateLinesAsync(int id, UpdateOrderLinesDto model, int userId, bool isAdmin)
    {
        var order = await _dbContext.Orders
            .Include(o => o.OrderLines)
            .FirstOrDefaultAsync(o => o.Id == id);

        if (order is null)
            return Response<OrderDto>.ErrorResponse("Not found", "Order not found.");

        if (!isAdmin && order.UserId != userId)
            return Response<OrderDto>.ErrorResponse("Not found", "Order not found.");

        if (order.StatusId == StatusDelivered || order.StatusId == StatusCancelled)
            return Response<OrderDto>.ErrorResponse("Validation failed", "Order lines can only be edited when the order is Pending or InProgress.");

        var requestedProductIds = model.Lines.Select(l => l.ProductId).Distinct().ToList();
        var existingProducts = await _dbContext.Products
            .Where(p => requestedProductIds.Contains(p.Id))
            .Select(p => new { p.Id, p.Name })
            .ToListAsync();

        var missingProductId = requestedProductIds.FirstOrDefault(pid => !existingProducts.Select(p => p.Id).Contains(pid));
        if (missingProductId != default)
            return Response<OrderDto>.ErrorResponse("Not found", $"Product with ID {missingProductId} does not exist.");

        var stockError = await ValidateAvailableStockAsync(
            model.Lines.Select(l => (l.ProductId, l.Qty)), excludeOrderId: id);
        if (stockError is not null)
            return Response<OrderDto>.ErrorResponse("Insufficient stock", stockError);

        await using var transaction = await _dbContext.Database.BeginTransactionAsync();
        try
        {
            _dbContext.OrderLines.RemoveRange(order.OrderLines);
            order.OrderLines.Clear();

            foreach (var line in model.Lines)
            {
                order.OrderLines.Add(new OrderLine
                {
                    ProductId = line.ProductId,
                    Qty       = line.Qty,
                    UnitPrice = line.UnitPrice
                });
            }
            await _dbContext.SaveChangesAsync();

            var invoice = await _dbContext.Invoices
                .Include(i => i.InvoiceLines)
                .FirstOrDefaultAsync(i => i.OrderId == id);

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
                        UnitPrice   = line.UnitPrice,
                        LineTotal   = line.Qty * line.UnitPrice
                    });
                }

                invoice.TotalAmount = model.Lines.Sum(l => l.Qty * l.UnitPrice);
                await _dbContext.SaveChangesAsync();
            }

            await transaction.CommitAsync();

            var reloaded = await LoadOrderWithIncludes(id);
            return Response<OrderDto>.SuccessResponse(ToDto(reloaded!), "Order lines updated successfully.");
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
            return Response<OrderDto>.ErrorResponse("Internal server error", ex.Message);
        }
    }

    public async Task<Response> DeleteByIdAsync(int id)
    {
        var order = await _dbContext.Orders
            .Include(o => o.OrderLines)
            .FirstOrDefaultAsync(o => o.Id == id);

        if (order is null)
            return Response.ErrorResponse("Not found", "Order not found.");

        if (order.StatusId == StatusDelivered)
            return Response.ErrorResponse("Validation failed", "Cannot delete a delivered order. Cancel it instead.");

        _dbContext.OrderLines.RemoveRange(order.OrderLines);
        _dbContext.Orders.Remove(order);
        await _dbContext.SaveChangesAsync();

        return Response.SuccessResponse("Order deleted successfully.");
    }

    // ── Status transition: Delivered ─────────────────────────────────────────

    private async Task<Response<OrderDto>> TransitionToDelivered(Order order, UpdateOrderDto model, int userId)
    {
        await using var transaction = await _dbContext.Database.BeginTransactionAsync();
        try
        {
            // Update header
            order.StatusId = StatusDelivered;
            if (model.PaymentTypeId.HasValue) order.PaymentTypeId = model.PaymentTypeId.Value;
            order.Notes = model.Notes;
            ApplyBillNo(order, model.BillNo);
            if (model.OrderDate.HasValue)
                order.OrderDate = model.OrderDate.Value;
            await _dbContext.SaveChangesAsync();

            // Stock out per line via IStockMovementsService
            foreach (var line in order.OrderLines)
            {
                if (line.ProductId is null) continue;

                var movResult = await _stockMovementsService.CreateAsync(new CreateStockMovementsDto
                {
                    ProductId = line.ProductId.Value,
                    MovementSource = MovementSourceSale,
                    Qty = line.Qty,
                    UnitPrice = line.UnitPrice,
                    MovementDate = order.OrderDate,
                    SuppressNotification = true,
                }, userId);

                if (!movResult.Success)
                {
                    await transaction.RollbackAsync();
                    return Response<OrderDto>.ErrorResponse(movResult.Message,
                        movResult.Errors ?? new List<string>());
                }
            }

            // Ledger posting: one header-level Transaction
            var orderTotal = order.OrderLines.Sum(l => l.Qty * l.UnitPrice);
            var transMode = MapPaymentTypeToTransMode(order.PaymentTypeId ?? 1);

            var txn = new Transaction
            {
                ClientId = order.ClientId,
                OrderId = order.Id,
                UserId = userId,
                TransTypeId = TransTypeCredit,
                TransModeId = transMode,
                TransCategoryId = TransCategorySales,
                Amount = orderTotal,
                TransDate = order.OrderDate,
                TransDateHijri = order.OrderDateHijri,
                Notes = $"Sale — Order #{order.Id}",
                CreatedAt = DateOnly.FromDateTime(DateTime.UtcNow)
            };
            await _dbContext.Transactions.AddAsync(txn);
            await _dbContext.SaveChangesAsync();
            await transaction.CommitAsync();

            await _invoiceService.UpdateStatusOnDeliveryAsync(order.Id, null);

            // Auto-apply any unallocated advance payments against this newly delivered order
            await _paymentService.ApplyUnallocatedCreditAsync(order.ClientId ?? 0, order.Id, null);

            var reloaded = await LoadOrderWithIncludes(order.Id);
            try { await _notification.CreateAsync(new CreateNotificationDto
            {
                UserId = userId,
                Type = "order_delivered",
                Title = "Order Delivered",
                Body = $"Order #{order.Id} marked as delivered",
                EntityId = order.Id
            }); } catch { }
            return Response<OrderDto>.SuccessResponse(ToDto(reloaded!), "Order delivered. Stock and ledger updated.");
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
            return Response<OrderDto>.ErrorResponse("Internal server error", ex.Message);
        }
    }

    // ── Status transition: Cancelled ─────────────────────────────────────────

    private async Task<Response<OrderDto>> TransitionToCancelled(Order order, int previousStatusId, int userId)
    {
        await using var transaction = await _dbContext.Database.BeginTransactionAsync();
        try
        {
            order.StatusId = StatusCancelled;
            await _dbContext.SaveChangesAsync();

            if (previousStatusId == StatusDelivered)
            {
                foreach (var line in order.OrderLines)
                {
                    if (line.ProductId is null) continue;
                    var product = await _dbContext.Products.FindAsync(line.ProductId.Value);
                    if (product is null) continue;
                    if ((product.TotalQuantitySold ?? 0) < line.Qty)
                    {
                        await transaction.RollbackAsync();
                        return Response<OrderDto>.ErrorResponse("Cannot cancel order",
                            $"Product '{product.Name}' sold quantity ({product.TotalQuantitySold ?? 0}) is less than " +
                            $"this order's line quantity ({line.Qty}). Data may be inconsistent — please contact support.");
                    }
                }

                // Reverse stock: Manual In per line
                foreach (var line in order.OrderLines)
                {
                    if (line.ProductId is null) continue;

                    var movResult = await _stockMovementsService.CreateAsync(new CreateStockMovementsDto
                    {
                        ProductId = line.ProductId.Value,
                        MovementSource = MovementSourceManual,
                        MovementType = MovementTypeIn,
                        Qty = line.Qty,
                        UnitPrice = line.UnitPrice,
                        AverageDimensionOverride = StockAverageDimension.Price,
                        MovementDate = DateOnly.FromDateTime(DateTime.UtcNow),
                        SuppressNotification = true,
                    }, userId);

                    if (!movResult.Success)
                    {
                        await transaction.RollbackAsync();
                        return Response<OrderDto>.ErrorResponse(movResult.Message,
                            movResult.Errors ?? new List<string>());
                    }
                }

                // Compensating ledger entry (opposite: Credit, negative amount)
                var orderTotal = order.OrderLines.Sum(l => l.Qty * l.UnitPrice);
                var transMode = MapPaymentTypeToTransMode(order.PaymentTypeId ?? 1);
                var reversalDate = DateOnly.FromDateTime(DateTime.UtcNow);
                var reversalHijriOffset = (await _dbContext.SystemSettings.AsNoTracking().FirstOrDefaultAsync())?.HijriOffsetDays ?? 0;

                var reversalTxn = new Transaction
                {
                    ClientId = order.ClientId,
                    OrderId = order.Id,
                    UserId = userId,
                    TransTypeId = TransTypeDebit,
                    TransModeId = transMode,
                    TransCategoryId = TransCategorySales,
                    Amount = -orderTotal,
                    TransDate = reversalDate,
                    TransDateHijri = HijriDateHelper.ToHijriString(reversalDate, reversalHijriOffset),
                    Notes = $"Sale reversal — Order #{order.Id} cancelled",
                    CreatedAt = DateOnly.FromDateTime(DateTime.UtcNow)
                };
                await _dbContext.Transactions.AddAsync(reversalTxn);
                await _dbContext.SaveChangesAsync();
                var existingAllocations = await _dbContext.PaymentAllocations
                    .Where(a => a.OrderId == order.Id)
                    .ToListAsync();
                if (existingAllocations.Count > 0)
                {
                    _dbContext.PaymentAllocations.RemoveRange(existingAllocations);
                    await _dbContext.SaveChangesAsync();
                }
            }

            await transaction.CommitAsync();

            await _invoiceService.CancelByOrderOrPurchaseAsync(order.Id, null);

            var reloaded = await LoadOrderWithIncludes(order.Id);
            try { await _notification.CreateAsync(new CreateNotificationDto
            {
                UserId = userId,
                Type = "order_cancelled",
                Title = "Order Cancelled",
                Body = $"Order #{order.Id} has been cancelled",
                EntityId = order.Id
            }); } catch { }
            var message = previousStatusId == StatusDelivered
                ? "Order cancelled. Stock and ledger reversed."
                : "Order cancelled.";
            return Response<OrderDto>.SuccessResponse(ToDto(reloaded!), message);
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
            return Response<OrderDto>.ErrorResponse("Internal server error", ex.Message);
        }
    }

    // ── Helpers ──────────────────────────────────────────────────────────────

    /// <summary>
    /// Validates requested line quantities against available stock, where available =
    /// Product.Quantity minus quantity already committed to other non-Delivered, non-Cancelled
    /// orders for the same product. Catches overselling at order create/edit time instead of
    /// letting two pending orders both pass and conflict later at the Delivered transition.
    /// </summary>
    private async Task<string?> ValidateAvailableStockAsync(IEnumerable<(int ProductId, decimal Qty)> lines, int? excludeOrderId = null)
    {
        var requested = lines
            .GroupBy(l => l.ProductId)
            .ToDictionary(g => g.Key, g => g.Sum(l => l.Qty));
        var productIds = requested.Keys.ToList();

        var products = await _dbContext.Products
            .Where(p => productIds.Contains(p.Id))
            .Select(p => new { p.Id, Quantity = p.Quantity ?? 0, UnitName = p.Unit.Name ?? "units" })
            .ToDictionaryAsync(p => p.Id);

        var reservedQuery = _dbContext.OrderLines
            .Where(ol => ol.ProductId != null && productIds.Contains(ol.ProductId.Value)
                && ol.Order.StatusId != StatusDelivered && ol.Order.StatusId != StatusCancelled);

        if (excludeOrderId.HasValue)
            reservedQuery = reservedQuery.Where(ol => ol.OrderId != excludeOrderId.Value);

        var reserved = await reservedQuery
            .GroupBy(ol => ol.ProductId!.Value)
            .Select(g => new { ProductId = g.Key, Qty = g.Sum(ol => ol.Qty) })
            .ToDictionaryAsync(x => x.ProductId, x => x.Qty);

        foreach (var (productId, requestedQty) in requested)
        {
            var product = products[productId];
            var alreadyCommitted = reserved.GetValueOrDefault(productId, 0);
            var available = product.Quantity - alreadyCommitted;
            if (requestedQty > available)
                return $"Available: {available} {product.UnitName}, Requested: {requestedQty} {product.UnitName} (Product ID {productId}).";
        }
        return null;
    }

    private static int MapPaymentTypeToTransMode(int paymentTypeId) =>
        paymentTypeId switch
        {
            1 => TransModeCash,   // Cash → Cash
            2 => TransModeCredit, // Credit → Credit
            _ => TransModeCash
        };

    private IQueryable<Order> OrderQueryWithIncludes() =>
        _dbContext.Orders
            .Include(o => o.Client)
            .Include(o => o.Status)
            .Include(o => o.PaymentType)
            .Include(o => o.OrderLines).ThenInclude(ol => ol.Product)
            .Include(o => o.PaymentAllocations).ThenInclude(a => a.Payment)
            .AsSplitQuery(); 

    private async Task<Order?> LoadOrderWithIncludes(int orderId) =>
        await OrderQueryWithIncludes().FirstOrDefaultAsync(o => o.Id == orderId);

    private static OrderDto ToDto(Order order)
    {
        var total = order.OrderLines.Sum(l => l.Qty * l.UnitPrice);
        var amountPaid = order.PaymentAllocations
            .Where(a => a.Payment != null && !a.Payment.IsReversed)
            .Sum(a => a.AllocatedAmount);
        var outstanding = total - amountPaid;
        var paymentStatus = outstanding <= 0 ? "FullyPaid" : amountPaid > 0 ? "PartiallyPaid" : "Unpaid";
        return new()
        {
            Id = order.Id,
            ClientId = order.ClientId ?? 0,
            ClientName = order.Client?.Name,
            StatusId = order.StatusId ?? 0,
            StatusName = order.Status?.Name,
            PaymentTypeId = order.PaymentTypeId ?? 0,
            PaymentTypeName = order.PaymentType?.Name,
            OrderDate = order.OrderDate,
            OrderDateHijri = order.OrderDateHijri,
            OrderDateHijriDisplay = HijriDateHelper.FormatForDisplay(order.OrderDateHijri),
            Notes = order.Notes,
            BillNo = order.BillNo,
            CreatedAt = order.CreatedAt,
            Total = total,
            AmountReceived = amountPaid,
            Receivable = outstanding < 0 ? 0 : outstanding,
            PaymentStatus = paymentStatus,
            OrderLines = order.OrderLines.Select(l => new OrderLineDto
            {
                Id = l.Id,
                OrderId = l.OrderId,
                ProductId = l.ProductId ?? 0,
                ProductName = l.Product?.Name,
                Qty = l.Qty,
                UnitPrice = l.UnitPrice
            }).ToList()
        };
    }

    /// <summary>
    /// Status-only updates omit BillNo (null) and must not wipe the stored value.
    /// Edit sends a string (possibly empty) to set or clear it.
    /// </summary>
    private static void ApplyBillNo(Order order, string? billNo)
    {
        if (billNo is null) return;
        order.BillNo = string.IsNullOrWhiteSpace(billNo) ? null : billNo.Trim();
    }
}

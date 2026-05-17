using System.Text.Json;
using System.Text.Json.Serialization;
using HamzaTex.Api.Data;
using HamzaTex.Api.Entities;
using HamzaTex.Api.Helpers;
using HamzaTex.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace HamzaTex.Api.Services;

/// <summary>Handles offline sync push, delta-pull, and full-pull operations for mobile clients with version-based conflict detection.</summary>
public interface ISyncService
{
    /// <summary>Accept a batch of offline records from mobile; create new records or update existing ones with version-based conflict detection. Returns per-item results.</summary>
    Task<Response<SyncPushResultDto>> PushAsync(SyncPushDto model, int userId, bool isAdmin);

    /// <summary>Return all data scoped to the user (staff) or all data (admin) for a full local DB rebuild.</summary>
    Task<Response<SyncFullPullResponseDto>> FullPullAsync(int userId, bool isAdmin);

    /// <summary>Return records modified since the given timestamp, scoped to user. Used for incremental sync after initial full-pull.</summary>
    Task<Response<SyncFullPullResponseDto>> DeltaPullAsync(DateTime since, int userId, bool isAdmin);

    /// <summary>Return server UTC time so mobile can detect clock skew.</summary>
    Task<Response<DateTime>> PingAsync();
}

public class SyncService : ISyncService
{
    private readonly ApplicationDbContext _db;
    private readonly IClientService _clientService;
    private readonly IOrderService _orderService;
    private readonly IPurchaseService _purchaseService;
    private readonly IPaymentService _paymentService;
    private readonly IExpenseService _expenseService;
    private readonly IStockMovementsService _stockMovementsService;
    private readonly IProductService _productService;
    private readonly ITransactionService _transactionService;
    private readonly IInvoiceService _invoiceService;

    private static readonly JsonSerializerOptions _jsonOpts = new()
    {
        ReferenceHandler = ReferenceHandler.IgnoreCycles,
        DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull
    };

    public SyncService(
        ApplicationDbContext db,
        IClientService clientService,
        IOrderService orderService,
        IPurchaseService purchaseService,
        IPaymentService paymentService,
        IExpenseService expenseService,
        IStockMovementsService stockMovementsService,
        IProductService productService,
        ITransactionService transactionService,
        IInvoiceService invoiceService)
    {
        _db = db;
        _clientService = clientService;
        _orderService = orderService;
        _purchaseService = purchaseService;
        _paymentService = paymentService;
        _expenseService = expenseService;
        _stockMovementsService = stockMovementsService;
        _productService = productService;
        _transactionService = transactionService;
        _invoiceService = invoiceService;
    }

    // ─── Push ─────────────────────────────────────────────────────────────────

    public async Task<Response<SyncPushResultDto>> PushAsync(SyncPushDto model, int userId, bool isAdmin)
    {
        var results = new List<SyncItemResultDto>();

        foreach (var item in model.Clients)
            results.Add(await ProcessClientPush(item, userId, isAdmin));

        foreach (var item in model.Products)
            results.Add(await ProcessProductPush(item, userId, isAdmin));

        foreach (var item in model.Orders)
            results.Add(await ProcessOrderPush(item, userId, isAdmin));

        foreach (var item in model.Purchases)
            results.Add(await ProcessPurchasePush(item, userId, isAdmin));

        foreach (var item in model.Payments)
            results.Add(await ProcessPaymentPush(item, userId, isAdmin));

        foreach (var item in model.Expenses)
            results.Add(await ProcessExpensePush(item, userId, isAdmin));

        foreach (var item in model.StockMovements)
            results.Add(await ProcessStockMovementPush(item, userId, isAdmin));

        foreach (var item in model.Transactions)
            results.Add(await ProcessTransactionPush(item, userId, isAdmin));

        foreach (var item in model.Invoices)
            results.Add(await ProcessInvoicePush(item, userId, isAdmin));

        var pushResult = new SyncPushResultDto
        {
            Results = results,
            AcceptedCount = results.Count(r => r.Status is "created" or "updated" or "accepted"),
            RejectedCount = results.Count(r => r.Status is "rejected" or "conflict"),
            ServerTime = DateTime.UtcNow
        };

        return Response<SyncPushResultDto>.SuccessResponse(pushResult, "Sync push completed.");
    }

    // ─── Client Push ──────────────────────────────────────────────────────────

    private async Task<SyncItemResultDto> ProcessClientPush(SyncClientDto item, int userId, bool isAdmin)
    {
        if (item.ServerId is null)
        {
            var existing = await _db.Clients
                .Where(c => c.LocalId != null && c.LocalId == item.LocalId && c.UserId == userId)
                .FirstOrDefaultAsync();
            if (existing != null)
                return Accepted(item.LocalId, existing.Id);

            var dto = new CreateClientDto
            {
                Name = item.Name,
                ClientTypeId = item.ClientTypeId ?? 0,
                UserId = userId,
                Phone = item.Phone,
                Address = item.Address,
                CreditLimit = item.CreditLimit,
                OpeningBalance = item.OpeningBalance,
                Notes = item.Notes,
                IsActive = item.IsActive,
            };
            var result = await _clientService.CreateAsync(dto);
            if (result.Success && result.Data != null)
            {
                await _db.Clients.Where(c => c.Id == result.Data.Id)
                    .ExecuteUpdateAsync(s => s.SetProperty(c => c.LocalId, item.LocalId));
                return Created(item.LocalId, result.Data.Id);
            }
            return Rejected(item.LocalId, result.Message);
        }

        var server = await _db.Clients.FindAsync(item.ServerId.Value);
        if (server is null)
            return Rejected(item.LocalId, "Record deleted on server.");

        if (!item.ForceOverwrite && server.Version != item.Version)
            return Conflict(item.LocalId, server.Version, server);

        var updateDto = new UpdateClientByIdDto
        {
            Name = item.Name,
            ClientTypeId = item.ClientTypeId ?? server.ClientTypeId ?? 0,
            Phone = item.Phone,
            Address = item.Address,
            CreditLimit = item.CreditLimit,
            OpeningBalance = item.OpeningBalance,
            Notes = item.Notes,
            IsActive = item.IsActive,
        };
        var updateResult = await _clientService.UpdateByIdAsync(item.ServerId.Value, updateDto);
        if (updateResult.Success)
            return Updated(item.LocalId, item.ServerId.Value);
        return Rejected(item.LocalId, updateResult.Message);
    }

    // ─── Order Push ───────────────────────────────────────────────────────────

    private async Task<SyncItemResultDto> ProcessOrderPush(SyncOrderDto item, int userId, bool isAdmin)
    {
        if (item.ServerId is null)
        {
            var existing = await _db.Orders
                .Where(o => o.LocalId != null && o.LocalId == item.LocalId)
                .FirstOrDefaultAsync();
            if (existing != null)
                return Accepted(item.LocalId, existing.Id);

            if (!item.ClientId.HasValue || !item.PaymentTypeId.HasValue)
                return Rejected(item.LocalId, "ClientId and PaymentTypeId are required.");

            var dto = new CreateOrderDto
            {
                ClientId = item.ClientId.Value,
                PaymentTypeId = item.PaymentTypeId.Value,
                OrderDate = item.OrderDate,
                Notes = item.Notes,
                Lines = item.OrderLines.Select(l => new CreateOrderLineDto
                {
                    ProductId = l.ProductId ?? 0,
                    Qty = l.Qty,
                    UnitPrice = l.UnitPrice
                }).ToList()
            };
            var result = await _orderService.CreateAsync(dto, userId);
            if (result.Success && result.Data != null)
            {
                var newId = result.Data.Id;
                await _db.Orders.Where(o => o.Id == newId)
                    .ExecuteUpdateAsync(s => s.SetProperty(o => o.LocalId, item.LocalId));

                if (item.StatusId.HasValue && item.StatusId.Value != 1)
                {
                    var statusDto = new UpdateOrderDto
                    {
                        StatusId = item.StatusId.Value,
                        PaymentTypeId = item.PaymentTypeId.Value,
                        Notes = item.Notes,
                        OrderDate = item.OrderDate
                    };
                    await _orderService.UpdateByIdAsync(newId, statusDto, userId, isAdmin);
                }

                return Created(item.LocalId, newId);
            }
            return Rejected(item.LocalId, result.Message);
        }

        var server = await _db.Orders.FindAsync(item.ServerId.Value);
        if (server is null)
            return Rejected(item.LocalId, "Record deleted on server.");

        if (!item.ForceOverwrite && server.Version != item.Version)
            return Conflict(item.LocalId, server.Version, server);

        var updateDto = new UpdateOrderDto
        {
            StatusId = item.StatusId ?? server.StatusId ?? 1,
            PaymentTypeId = item.PaymentTypeId ?? server.PaymentTypeId ?? 1,
            Notes = item.Notes,
            OrderDate = item.OrderDate
        };
        var updateResult = await _orderService.UpdateByIdAsync(item.ServerId.Value, updateDto, userId, isAdmin);
        if (updateResult.Success)
            return Updated(item.LocalId, item.ServerId.Value);
        return Rejected(item.LocalId, updateResult.Message);
    }

    // ─── Purchase Push ────────────────────────────────────────────────────────

    private async Task<SyncItemResultDto> ProcessPurchasePush(SyncPurchaseDto item, int userId, bool isAdmin)
    {
        if (item.ServerId is null)
        {
            var existing = await _db.Purchases
                .Where(p => p.LocalId != null && p.LocalId == item.LocalId)
                .FirstOrDefaultAsync();
            if (existing != null)
                return Accepted(item.LocalId, existing.Id);

            if (!item.SupplierId.HasValue || !item.PaymentTypeId.HasValue)
                return Rejected(item.LocalId, "SupplierId and PaymentTypeId are required.");

            var dto = new CreatePurchaseDto
            {
                SupplierId = item.SupplierId.Value,
                PaymentTypeId = item.PaymentTypeId.Value,
                PurchaseDate = item.PurchaseDate,
                Notes = item.Notes,
                Lines = item.PurchaseLines.Select(l => new CreatePurchaseLineDto
                {
                    ProductId = l.ProductId ?? 0,
                    Qty = l.Qty,
                    UnitCost = l.UnitCost
                }).ToList()
            };
            var result = await _purchaseService.CreateAsync(dto, userId);
            if (result.Success && result.Data != null)
            {
                var newId = result.Data.Id;
                await _db.Purchases.Where(p => p.Id == newId)
                    .ExecuteUpdateAsync(s => s.SetProperty(p => p.LocalId, item.LocalId));

                if (item.StatusId.HasValue && item.StatusId.Value != 1)
                {
                    var statusDto = new UpdatePurchaseDto
                    {
                        StatusId = item.StatusId.Value,
                        PaymentTypeId = item.PaymentTypeId.Value,
                        PurchaseDate = item.PurchaseDate,
                        Notes = item.Notes
                    };
                    await _purchaseService.UpdateByIdAsync(newId, statusDto, userId, isAdmin);
                }

                return Created(item.LocalId, newId);
            }
            return Rejected(item.LocalId, result.Message);
        }

        var server = await _db.Purchases.FindAsync(item.ServerId.Value);
        if (server is null)
            return Rejected(item.LocalId, "Record deleted on server.");

        if (!item.ForceOverwrite && server.Version != item.Version)
            return Conflict(item.LocalId, server.Version, server);

        var updateDto = new UpdatePurchaseDto
        {
            StatusId = item.StatusId ?? server.StatusId ?? 1,
            PaymentTypeId = item.PaymentTypeId ?? server.PaymentTypeId ?? 1,
            PurchaseDate = item.PurchaseDate,
            Notes = item.Notes
        };
        var updateResult = await _purchaseService.UpdateByIdAsync(item.ServerId.Value, updateDto, userId, isAdmin);
        if (updateResult.Success)
            return Updated(item.LocalId, item.ServerId.Value);
        return Rejected(item.LocalId, updateResult.Message);
    }

    // ─── Payment Push ─────────────────────────────────────────────────────────

    private async Task<SyncItemResultDto> ProcessPaymentPush(SyncPaymentDto item, int userId, bool isAdmin)
    {
        if (item.ServerId is null)
        {
            var existing = await _db.Payments
                .Where(p => p.LocalId != null && p.LocalId == item.LocalId)
                .FirstOrDefaultAsync();
            if (existing != null)
                return Accepted(item.LocalId, existing.Id);

            if (!item.PartyClientId.HasValue || !item.PaymentDirectionId.HasValue || !item.TransModeId.HasValue)
                return Rejected(item.LocalId, "PartyClientId, PaymentDirectionId, and TransModeId are required.");

            var dto = new CreatePaymentDto
            {
                PartyClientId = item.PartyClientId.Value,
                PaymentDirectionId = item.PaymentDirectionId.Value,
                TransModeId = item.TransModeId.Value,
                Amount = item.Amount,
                PaymentDate = item.PaymentDate,
                Notes = item.Notes,
                Allocations = []
            };
            var result = await _paymentService.CreateAsync(dto, userId);
            if (result.Success && result.Data != null)
            {
                await _db.Payments.Where(p => p.Id == result.Data.Id)
                    .ExecuteUpdateAsync(s => s.SetProperty(p => p.LocalId, item.LocalId));
                return Created(item.LocalId, result.Data.Id);
            }
            return Rejected(item.LocalId, result.Message);
        }

        var server = await _db.Payments.FindAsync(item.ServerId.Value);
        if (server is null)
            return Rejected(item.LocalId, "Record deleted on server.");

        if (!item.ForceOverwrite && server.Version != item.Version)
            return Conflict(item.LocalId, server.Version, server);

        var updateDto = new UpdatePaymentDto
        {
            TransModeId = item.TransModeId ?? server.TransModeId ?? 1,
            PaymentDate = item.PaymentDate,
            Notes = item.Notes
        };
        var updateResult = await _paymentService.UpdateByIdAsync(item.ServerId.Value, updateDto);
        if (updateResult.Success)
            return Updated(item.LocalId, item.ServerId.Value);
        return Rejected(item.LocalId, updateResult.Message);
    }

    // ─── Expense Push ─────────────────────────────────────────────────────────

    private async Task<SyncItemResultDto> ProcessExpensePush(SyncExpenseDto item, int userId, bool isAdmin)
    {
        if (item.ServerId is null)
        {
            var existing = await _db.Expenses
                .Where(e => e.LocalId != null && e.LocalId == item.LocalId)
                .FirstOrDefaultAsync();
            if (existing != null)
                return Accepted(item.LocalId, existing.Id);

            if (!item.ExpenseTypeId.HasValue || !item.TransModeId.HasValue)
                return Rejected(item.LocalId, "ExpenseTypeId and TransModeId are required.");

            var dto = new CreateExpenseDto
            {
                ExpenseTypeId = item.ExpenseTypeId.Value,
                Amount = item.Amount,
                TransModeId = item.TransModeId.Value,
                TransCategoryId = item.TransCategoryId,
                ExpenseDate = item.ExpenseDate,
                Notes = item.Notes
            };
            var result = await _expenseService.CreateAsync(dto, userId);
            if (result.Success && result.Data != null)
            {
                await _db.Expenses.Where(e => e.Id == result.Data.Id)
                    .ExecuteUpdateAsync(s => s.SetProperty(e => e.LocalId, item.LocalId));
                return Created(item.LocalId, result.Data.Id);
            }
            return Rejected(item.LocalId, result.Message);
        }

        var server = await _db.Expenses.FindAsync(item.ServerId.Value);
        if (server is null)
            return Rejected(item.LocalId, "Record deleted on server.");

        if (!item.ForceOverwrite && server.Version != item.Version)
            return Conflict(item.LocalId, server.Version, server);

        var updateDto = new UpdateExpenseDto
        {
            Amount = item.Amount,
            TransModeId = item.TransModeId ?? server.TransModeId ?? 1,
            ExpenseDate = item.ExpenseDate,
            Notes = item.Notes
        };
        var updateResult = await _expenseService.UpdateByIdAsync(item.ServerId.Value, updateDto);
        if (updateResult.Success)
            return Updated(item.LocalId, item.ServerId.Value);
        return Rejected(item.LocalId, updateResult.Message);
    }

    // ─── StockMovement Push (append-only) ─────────────────────────────────────

    private async Task<SyncItemResultDto> ProcessStockMovementPush(SyncStockMovementDto item, int userId, bool isAdmin)
    {
        if (item.ServerId is not null)
            return Rejected(item.LocalId, "StockMovements cannot be updated, only created.");

        var existing = await _db.StockMovements
            .Where(sm => sm.LocalId != null && sm.LocalId == item.LocalId)
            .FirstOrDefaultAsync();
        if (existing != null)
            return Accepted(item.LocalId, existing.Id);

        if (!item.ProductId.HasValue || !item.MovementSourceId.HasValue)
            return Rejected(item.LocalId, "ProductId and MovementSourceId are required.");

        var dto = new CreateStockMovementsDto
        {
            ProductId = item.ProductId.Value,
            MovementSource = item.MovementSourceId.Value,
            MovementType = item.MovementTypeId,
            Qty = item.Qty ?? 0,
            UnitCost = item.UnitCost,
            UnitPrice = item.UnitPrice,
            MovementDate = item.MovementDate
        };
        var result = await _stockMovementsService.CreateAsync(dto, userId);
        if (result.Success && result.Data != null)
        {
            await _db.StockMovements.Where(sm => sm.Id == result.Data.Id)
                .ExecuteUpdateAsync(s => s.SetProperty(sm => sm.LocalId, item.LocalId));
            return Created(item.LocalId, result.Data.Id);
        }
        return Rejected(item.LocalId, result.Message);
    }

    // ─── Product Push ─────────────────────────────────────────────────────────

    private async Task<SyncItemResultDto> ProcessProductPush(SyncProductDto item, int userId, bool isAdmin)
    {
        if (item.ServerId is null)
        {
            var existing = await _db.Products
                .Where(p => p.LocalId != null && p.LocalId == item.LocalId)
                .FirstOrDefaultAsync();
            if (existing != null)
                return Accepted(item.LocalId, existing.Id);

            var dto = new CreateProductDto
            {
                Name = item.Name,
                Sku = item.Sku,
                Unit = item.Unit,
                DefaultCost = item.DefaultCost,
                DefaultPrice = item.DefaultPrice,
                Quantity = item.Quantity,
                AverageCost = item.AverageCost,
                AveragePrice = item.AveragePrice,
                CostChangeCount = item.CostChangeCount,
                PriceChangeCount = item.PriceChangeCount,
                TotalQuantityPurchased = item.TotalQuantityPurchased,
                TotalQuantitySold = item.TotalQuantitySold,
                ReorderLevel = item.ReorderLevel,
                IsActive = item.IsActive,
            };
            var result = await _productService.CreateWithUserIdAsync(dto, userId);
            if (result.Success && result.Data != null)
            {
                await _db.Products.Where(p => p.Id == result.Data.Id)
                    .ExecuteUpdateAsync(s => s.SetProperty(p => p.LocalId, item.LocalId));
                return Created(item.LocalId, result.Data.Id);
            }
            return Rejected(item.LocalId, result.Message);
        }

        var server = await _db.Products.FindAsync(item.ServerId.Value);
        if (server is null)
            return Rejected(item.LocalId, "Record deleted on server.");

        if (!item.ForceOverwrite && server.Version != item.Version)
            return Conflict(item.LocalId, server.Version, server);

        var updateDto = new UpdateProductByIdDto
        {
            Name = item.Name,
            Sku = item.Sku,
            Unit = item.Unit,
            DefaultCost = item.DefaultCost,
            DefaultPrice = item.DefaultPrice,
            Quantity = item.Quantity,
            AverageCost = item.AverageCost,
            AveragePrice = item.AveragePrice,
            CostChangeCount = item.CostChangeCount,
            PriceChangeCount = item.PriceChangeCount,
            TotalQuantityPurchased = item.TotalQuantityPurchased,
            TotalQuantitySold = item.TotalQuantitySold,
            ReorderLevel = item.ReorderLevel,
            IsActive = item.IsActive,
        };
        var updateResult = await _productService.UpdateByIdAsync(item.ServerId.Value, updateDto, userId);
        if (updateResult.Success)
            return Updated(item.LocalId, item.ServerId.Value);
        return Rejected(item.LocalId, updateResult.Message);
    }

    // ─── Transaction Push ─────────────────────────────────────────────────────

    private async Task<SyncItemResultDto> ProcessTransactionPush(SyncTransactionDto item, int userId, bool isAdmin)
    {
        if (item.ServerId is null)
        {
            var existing = await _db.Transactions
                .Where(t => t.LocalId != null && t.LocalId == item.LocalId)
                .FirstOrDefaultAsync();
            if (existing != null)
                return Accepted(item.LocalId, existing.Id);

            if (item.TransCategoryId <= 0)
                return Rejected(item.LocalId, "TransCategoryId is required.");

            var dto = new CreateTransactionDto
            {
                Amount = item.Amount,
                TransCategoryId = (item.TransCategoryId ?? 0) > 0 ? item.TransCategoryId!.Value : 1,
                TransDate = item.TransDate,
                Notes = item.Notes,
                ClientId = item.ClientId,
                TransTypeId = item.TransTypeId,
                TransModeId = item.TransModeId,
            };
            var result = await _transactionService.CreateAsync(dto, userId);
            if (result.Success && result.Data != null)
            {
                await _db.Transactions.Where(t => t.Id == result.Data.Id)
                    .ExecuteUpdateAsync(s => s.SetProperty(t => t.LocalId, item.LocalId));
                return Created(item.LocalId, result.Data.Id);
            }
            return Rejected(item.LocalId, result.Message);
        }

        var server = await _db.Transactions.FindAsync(item.ServerId.Value);
        if (server is null)
            return Rejected(item.LocalId, "Record deleted on server.");

        if (!item.ForceOverwrite && server.Version != item.Version)
            return Conflict(item.LocalId, server.Version, server);

        var updateDto = new UpdateTransactionDto
        {
            Amount = item.Amount,
            TransCategoryId = (item.TransCategoryId ?? 0) > 0 ? item.TransCategoryId!.Value : 1,
            TransDate = item.TransDate,
            Notes = item.Notes,
            ClientId = item.ClientId,
            TransTypeId = item.TransTypeId,
            TransModeId = item.TransModeId,
        };
        var updateResult = await _transactionService.UpdateByIdAsync(item.ServerId.Value, updateDto);
        if (updateResult.Success)
            return Updated(item.LocalId, item.ServerId.Value);
        return Rejected(item.LocalId, updateResult.Message);
    }

    // ─── Invoice Push ─────────────────────────────────────────────────────────

    private async Task<SyncItemResultDto> ProcessInvoicePush(SyncInvoiceDto item, int userId, bool isAdmin)
    {
        if (item.ServerId is null)
        {
            var existing = await _db.Invoices
                .Where(i => i.LocalId != null && i.LocalId == item.LocalId)
                .FirstOrDefaultAsync();
            if (existing != null)
                return Accepted(item.LocalId, existing.Id);

            if (!item.ClientId.HasValue)
                return Rejected(item.LocalId, "ClientId is required.");

            var dto = new CreateInvoiceDto
            {
                OrderId = item.OrderId,
                PurchaseId = item.PurchaseId,
                ClientId = item.ClientId.Value,
                DueDate = item.DueDate,
                TotalAmount = item.TotalAmount,
                Notes = item.Notes,
                Lines = item.InvoiceLines.Select(l => new CreateInvoiceLineDto
                {
                    ProductName = l.ProductName,
                    Qty = l.Qty,
                    UnitPrice = l.UnitPrice
                }).ToList()
            };
            var result = await _invoiceService.CreateAsync(dto, userId);
            if (result.Success && result.Data != null)
            {
                await _db.Invoices.Where(i => i.Id == result.Data.Id)
                    .ExecuteUpdateAsync(s => s.SetProperty(i => i.LocalId, item.LocalId));
                return Created(item.LocalId, result.Data.Id);
            }
            return Rejected(item.LocalId, result.Message);
        }

        var server = await _db.Invoices.FindAsync(item.ServerId.Value);
        if (server is null)
            return Rejected(item.LocalId, "Record deleted on server.");

        if (!item.ForceOverwrite && server.Version != item.Version)
            return Conflict(item.LocalId, server.Version, server);

        var updateDto = new UpdateInvoiceDto
        {
            InvoiceStatusId = item.InvoiceStatusId,
            DueDate = item.DueDate,
            Notes = item.Notes,
            TotalAmount = item.TotalAmount,
            Lines = item.InvoiceLines.Select(l => new CreateInvoiceLineDto
            {
                ProductName = l.ProductName,
                Qty = l.Qty,
                UnitPrice = l.UnitPrice
            }).ToList()
        };
        var updateResult = await _invoiceService.UpdateByIdAsync(item.ServerId.Value, updateDto);
        if (updateResult.Success)
            return Updated(item.LocalId, item.ServerId.Value);
        return Rejected(item.LocalId, updateResult.Message);
    }

    // ─── Full Pull ────────────────────────────────────────────────────────────

    public async Task<Response<SyncFullPullResponseDto>> FullPullAsync(int userId, bool isAdmin)
    {
        var clients = isAdmin
            ? await _db.Clients.AsNoTracking().ToListAsync()
            : await _db.Clients.AsNoTracking().Where(c => c.UserId == userId).ToListAsync();

        var products = isAdmin
            ? await _db.Products.AsNoTracking().ToListAsync()
            : await _db.Products.AsNoTracking()
                .Where(p => p.ProductUsers.Any(pu => pu.UserId == userId))
                .ToListAsync();

        var orders = isAdmin
            ? await _db.Orders.AsNoTracking().Include(o => o.OrderLines).ToListAsync()
            : await _db.Orders.AsNoTracking().Include(o => o.OrderLines)
                .Where(o => o.Client != null && o.Client.UserId == userId)
                .ToListAsync();

        var purchases = isAdmin
            ? await _db.Purchases.AsNoTracking().Include(p => p.PurchaseLines).ToListAsync()
            : await _db.Purchases.AsNoTracking().Include(p => p.PurchaseLines)
                .Where(p => p.Supplier != null && p.Supplier.UserId == userId)
                .ToListAsync();

        var payments = isAdmin
            ? await _db.Payments.AsNoTracking().ToListAsync()
            : await _db.Payments.AsNoTracking().Where(p => p.UserId == userId).ToListAsync();

        var expenses = isAdmin
            ? await _db.Expenses.AsNoTracking().ToListAsync()
            : await _db.Expenses.AsNoTracking().Where(e => e.UserId == userId).ToListAsync();

        var stockMovements = isAdmin
            ? await _db.StockMovements.AsNoTracking().ToListAsync()
            : await _db.StockMovements.AsNoTracking()
                .Where(sm => sm.Product != null && sm.Product.ProductUsers.Any(pu => pu.UserId == userId))
                .ToListAsync();

        var transactions = isAdmin
            ? await _db.Transactions.AsNoTracking().ToListAsync()
            : await _db.Transactions.AsNoTracking().Where(t => t.UserId == userId).ToListAsync();

        var invoices = isAdmin
            ? await _db.Invoices.AsNoTracking().Include(i => i.InvoiceLines).ToListAsync()
            : await _db.Invoices.AsNoTracking().Include(i => i.InvoiceLines).Where(i => i.CreatedByUserId == userId).ToListAsync();

        var lookups = await LoadLookupsAsync();
        var views = await LoadViewsAsync();

        var response = MapToPullResponse(clients, products, orders, purchases, payments, expenses, stockMovements, transactions, invoices, lookups, views);
        return Response<SyncFullPullResponseDto>.SuccessResponse(response, "Full pull completed.");
    }

    // ─── Delta Pull ───────────────────────────────────────────────────────────

    public async Task<Response<SyncFullPullResponseDto>> DeltaPullAsync(DateTime since, int userId, bool isAdmin)
    {
        var clients = isAdmin
            ? await _db.Clients.AsNoTracking().Where(c => c.UpdatedAt >= since).ToListAsync()
            : await _db.Clients.AsNoTracking().Where(c => c.UserId == userId && c.UpdatedAt >= since).ToListAsync();

        var products = isAdmin
            ? await _db.Products.AsNoTracking().Where(p => p.UpdatedAt >= since).ToListAsync()
            : await _db.Products.AsNoTracking()
                .Where(p => p.UpdatedAt >= since && p.ProductUsers.Any(pu => pu.UserId == userId))
                .ToListAsync();

        var orders = isAdmin
            ? await _db.Orders.AsNoTracking().Include(o => o.OrderLines).Where(o => o.UpdatedAt >= since).ToListAsync()
            : await _db.Orders.AsNoTracking().Include(o => o.OrderLines)
                .Where(o => o.UpdatedAt >= since && o.Client != null && o.Client.UserId == userId)
                .ToListAsync();

        var purchases = isAdmin
            ? await _db.Purchases.AsNoTracking().Include(p => p.PurchaseLines).Where(p => p.UpdatedAt >= since).ToListAsync()
            : await _db.Purchases.AsNoTracking().Include(p => p.PurchaseLines)
                .Where(p => p.UpdatedAt >= since && p.Supplier != null && p.Supplier.UserId == userId)
                .ToListAsync();

        var payments = isAdmin
            ? await _db.Payments.AsNoTracking().Where(p => p.UpdatedAt >= since).ToListAsync()
            : await _db.Payments.AsNoTracking().Where(p => p.UserId == userId && p.UpdatedAt >= since).ToListAsync();

        var expenses = isAdmin
            ? await _db.Expenses.AsNoTracking().Where(e => e.UpdatedAt >= since).ToListAsync()
            : await _db.Expenses.AsNoTracking().Where(e => e.UserId == userId && e.UpdatedAt >= since).ToListAsync();

        var stockMovements = isAdmin
            ? await _db.StockMovements.AsNoTracking().Where(sm => sm.UpdatedAt >= since).ToListAsync()
            : await _db.StockMovements.AsNoTracking()
                .Where(sm => sm.UpdatedAt >= since && sm.Product != null && sm.Product.ProductUsers.Any(pu => pu.UserId == userId))
                .ToListAsync();

        var transactions = isAdmin
            ? await _db.Transactions.AsNoTracking().Where(t => t.UpdatedAt >= since).ToListAsync()
            : await _db.Transactions.AsNoTracking().Where(t => t.UserId == userId && t.UpdatedAt >= since).ToListAsync();

        var invoices = isAdmin
            ? await _db.Invoices.AsNoTracking().Include(i => i.InvoiceLines).Where(i => i.UpdatedAt >= since).ToListAsync()
            : await _db.Invoices.AsNoTracking().Include(i => i.InvoiceLines).Where(i => i.CreatedByUserId == userId && i.UpdatedAt >= since).ToListAsync();

        var lookups = await LoadLookupsAsync();
        var views = await LoadViewsAsync();

        var response = MapToPullResponse(clients, products, orders, purchases, payments, expenses, stockMovements, transactions, invoices, lookups, views);
        return Response<SyncFullPullResponseDto>.SuccessResponse(response, "Delta pull completed.");
    }

    // ─── Ping ─────────────────────────────────────────────────────────────────

    public Task<Response<DateTime>> PingAsync()
        => Task.FromResult(Response<DateTime>.SuccessResponse(DateTime.UtcNow, "Pong."));

    // ─── Lookup / View Loaders ────────────────────────────────────────────────

    private record LookupSnapshot(
        List<SyncLookupDto> UserRoles,
        List<SyncLookupDto> ClientTypes,
        List<SyncLookupDto> OrderStatuses,
        List<SyncLookupDto> PurchaseStatuses,
        List<SyncLookupDto> PaymentTypes,
        List<SyncLookupDto> PaymentDirections,
        List<SyncLookupDto> TransTypes,
        List<SyncLookupDto> TransModes,
        List<SyncLookupDto> TransCategories,
        List<SyncLookupDto> ExpenseTypes,
        List<SyncLookupDto> MovementTypes,
        List<SyncLookupDto> MovementSources,
        List<SyncLookupDto> InvoiceStatuses);

    private record ViewSnapshot(
        List<SyncClientBalanceDto> ClientBalances,
        List<SyncMonthlyProfitLossDto> MonthlyProfitLoss,
        List<SyncMonthlyCreditDebitDto> MonthlyCreditDebit);

    private async Task<LookupSnapshot> LoadLookupsAsync()
    {
        var userRoles        = await _db.UserRoles.AsNoTracking().Select(x => new SyncLookupDto { Id = x.Id, Name = x.Name }).ToListAsync();
        var clientTypes      = await _db.ClientTypes.AsNoTracking().Select(x => new SyncLookupDto { Id = x.Id, Name = x.Name }).ToListAsync();
        var orderStatuses    = await _db.OrderStatuses.AsNoTracking().Select(x => new SyncLookupDto { Id = x.Id, Name = x.Name }).ToListAsync();
        var purchaseStatuses = await _db.PurchaseStatuses.AsNoTracking().Select(x => new SyncLookupDto { Id = x.Id, Name = x.Name }).ToListAsync();
        var paymentTypes     = await _db.PaymentTypes.AsNoTracking().Select(x => new SyncLookupDto { Id = x.Id, Name = x.Name }).ToListAsync();
        var paymentDirs      = await _db.PaymentDirections.AsNoTracking().Select(x => new SyncLookupDto { Id = x.Id, Name = x.Name }).ToListAsync();
        var transTypes       = await _db.TransTypes.AsNoTracking().Select(x => new SyncLookupDto { Id = x.Id, Name = x.Name }).ToListAsync();
        var transModes       = await _db.TransModes.AsNoTracking().Select(x => new SyncLookupDto { Id = x.Id, Name = x.Name }).ToListAsync();
        var transCategories  = await _db.TransCategories.AsNoTracking().Select(x => new SyncLookupDto { Id = x.Id, Name = x.Name }).ToListAsync();
        var expenseTypes     = await _db.ExpenseTypes.AsNoTracking().Select(x => new SyncLookupDto { Id = x.Id, Name = x.Name }).ToListAsync();
        var movementTypes    = await _db.MovementTypes.AsNoTracking().Select(x => new SyncLookupDto { Id = x.Id, Name = x.Name }).ToListAsync();
        var movementSources  = await _db.MovementSources.AsNoTracking().Select(x => new SyncLookupDto { Id = x.Id, Name = x.Name }).ToListAsync();
        var invoiceStatuses  = await _db.InvoiceStatuses.AsNoTracking().Select(x => new SyncLookupDto { Id = x.Id, Name = x.Name }).ToListAsync();

        return new LookupSnapshot(userRoles, clientTypes, orderStatuses, purchaseStatuses, paymentTypes, paymentDirs,
            transTypes, transModes, transCategories, expenseTypes, movementTypes, movementSources, invoiceStatuses);
    }

    private async Task<ViewSnapshot> LoadViewsAsync()
    {
        var clientBalances = await _db.VClientBalances.AsNoTracking()
            .Select(v => new SyncClientBalanceDto { ClientId = v.ClientId, Name = v.Name, Balance = v.Balance })
            .ToListAsync();

        var profitLoss = await _db.VMonthlyProfitLosses.AsNoTracking()
            .Select(v => new SyncMonthlyProfitLossDto
            {
                Id = v.Id,
                Month = v.Month,
                TotalSales = v.TotalSales,
                TotalPurchases = v.TotalPurchases,
                TotalExpenses = v.TotalExpenses,
                GrossProfit = v.GrossProfit,
                NetProfit = v.NetProfit
            }).ToListAsync();

        var creditDebit = await _db.VMonthlyCreditDebits.AsNoTracking()
            .Select(v => new SyncMonthlyCreditDebitDto
            {
                Id = v.Id,
                Month = v.Month,
                TotalCredit = v.TotalCredit,
                TotalDebit = v.TotalDebit,
                Balance = v.Balance
            }).ToListAsync();

        return new ViewSnapshot(clientBalances, profitLoss, creditDebit);
    }

    // ─── Shared Mapping ───────────────────────────────────────────────────────

    private static SyncFullPullResponseDto MapToPullResponse(
        List<Client> clients,
        List<Product> products,
        List<Order> orders,
        List<Purchase> purchases,
        List<Payment> payments,
        List<Expense> expenses,
        List<StockMovement> stockMovements,
        List<Transaction> transactions,
        List<Invoice> invoices,
        LookupSnapshot lookups,
        ViewSnapshot views)
    {
        return new SyncFullPullResponseDto
        {
            Clients = clients.Select(c => new SyncClientDto
            {
                LocalId = c.LocalId,
                Name = c.Name,
                ClientTypeId = c.ClientTypeId,
                UserId = c.UserId,
                Phone = c.Phone,
                Address = c.Address,
                CreditLimit = c.CreditLimit,
                OpeningBalance = c.OpeningBalance,
                Notes = c.Notes,
                IsActive = c.IsActive,
                CreatedAt = c.CreatedAt,
                UpdatedAt = c.UpdatedAt
            }).ToList(),

            Products = products.Select(p => new SyncProductDto
            {
                LocalId = p.LocalId,
                Id = p.Id,
                Name = p.Name,
                Sku = p.Sku,
                Unit = p.Unit,
                DefaultCost = p.DefaultCost,
                DefaultPrice = p.DefaultPrice,
                Quantity = p.Quantity,
                AverageCost = p.AverageCost,
                AveragePrice = p.AveragePrice,
                CostChangeCount = p.CostChangeCount,
                PriceChangeCount = p.PriceChangeCount,
                TotalQuantityPurchased = p.TotalQuantityPurchased,
                TotalQuantitySold = p.TotalQuantitySold,
                ReorderLevel = p.ReorderLevel,
                IsActive = p.IsActive,
                CreatedAt = p.CreatedAt,
                UpdatedAt = p.UpdatedAt
            }).ToList(),

            Orders = orders.Select(o => new SyncOrderDto
            {
                LocalId = o.LocalId,
                ClientId = o.ClientId,
                StatusId = o.StatusId,
                PaymentTypeId = o.PaymentTypeId,
                OrderDate = o.OrderDate,
                Notes = o.Notes,
                CreatedAt = o.CreatedAt,
                UpdatedAt = o.UpdatedAt,
                OrderLines = o.OrderLines.Select(l => new SyncOrderLineDto
                {
                    ProductId = l.ProductId,
                    Qty = l.Qty,
                    UnitPrice = l.UnitPrice,
                    UpdatedAt = l.UpdatedAt
                }).ToList()
            }).ToList(),

            Purchases = purchases.Select(p => new SyncPurchaseDto
            {
                LocalId = p.LocalId,
                SupplierId = p.SupplierId,
                StatusId = p.StatusId,
                PaymentTypeId = p.PaymentTypeId,
                PurchaseDate = p.PurchaseDate,
                Notes = p.Notes,
                CreatedAt = p.CreatedAt,
                UpdatedAt = p.UpdatedAt,
                PurchaseLines = p.PurchaseLines.Select(l => new SyncPurchaseLineDto
                {
                    ProductId = l.ProductId,
                    Qty = l.Qty,
                    UnitCost = l.UnitCost,
                    UpdatedAt = l.UpdatedAt
                }).ToList()
            }).ToList(),

            Payments = payments.Select(p => new SyncPaymentDto
            {
                LocalId = p.LocalId,
                PartyClientId = p.PartyClientId,
                PaymentDirectionId = p.PaymentDirectionId,
                TransModeId = p.TransModeId,
                Amount = p.Amount,
                PaymentDate = p.PaymentDate,
                Notes = p.Notes,
                CreatedAt = p.CreatedAt,
                UpdatedAt = p.UpdatedAt
            }).ToList(),

            Expenses = expenses.Select(e => new SyncExpenseDto
            {
                LocalId = e.LocalId,
                ExpenseTypeId = e.ExpenseTypeId,
                Amount = e.Amount,
                TransModeId = e.TransModeId,
                TransCategoryId = e.TransCategoryId,
                ExpenseDate = e.ExpenseDate,
                Notes = e.Notes,
                CreatedAt = e.CreatedAt,
                UpdatedAt = e.UpdatedAt
            }).ToList(),

            StockMovements = stockMovements.Select(sm => new SyncStockMovementDto
            {
                LocalId = sm.LocalId,
                ProductId = sm.ProductId,
                MovementTypeId = sm.MovementTypeId,
                MovementSourceId = sm.MovementSourceId,
                Qty = sm.Qty,
                UnitCost = sm.UnitCost,
                UnitPrice = sm.UnitPrice,
                MovementDate = sm.MovementDate,
                UpdatedAt = sm.UpdatedAt
            }).ToList(),

            Transactions = transactions.Select(t => new SyncTransactionDto
            {
                LocalId = t.LocalId,
                Id = t.Id,
                ClientId = t.ClientId,
                UserId = t.UserId,
                OrderId = t.OrderId,
                PurchaseId = t.PurchaseId,
                TransTypeId = t.TransTypeId,
                TransModeId = t.TransModeId,
                TransCategoryId = t.TransCategoryId,
                Amount = t.Amount,
                TransDate = t.TransDate,
                Notes = t.Notes,
                CreatedAt = t.CreatedAt,
                UpdatedAt = t.UpdatedAt
            }).ToList(),

            Invoices = invoices.Select(i => new SyncInvoiceDto
            {
                LocalId = i.LocalId,
                Id = i.Id,
                InvoiceNumber = i.InvoiceNumber,
                OrderId = i.OrderId,
                PurchaseId = i.PurchaseId,
                ClientId = i.ClientId,
                InvoiceStatusId = i.InvoiceStatusId,
                IssueDate = i.IssueDate,
                DueDate = i.DueDate,
                TotalAmount = i.TotalAmount,
                Notes = i.Notes,
                CreatedAt = i.CreatedAt,
                UpdatedAt = i.UpdatedAt,
                InvoiceLines = i.InvoiceLines.Select(l => new SyncInvoiceLineDto
                {
                    ProductName = l.ProductName,
                    Qty = l.Qty,
                    UnitPrice = l.UnitPrice,
                    UpdatedAt = l.UpdatedAt
                }).ToList()
            }).ToList(),

            // Lookup tables
            UserRoles        = lookups.UserRoles,
            ClientTypes      = lookups.ClientTypes,
            OrderStatuses    = lookups.OrderStatuses,
            PurchaseStatuses = lookups.PurchaseStatuses,
            PaymentTypes     = lookups.PaymentTypes,
            PaymentDirections = lookups.PaymentDirections,
            TransTypes       = lookups.TransTypes,
            TransModes       = lookups.TransModes,
            TransCategories  = lookups.TransCategories,
            ExpenseTypes     = lookups.ExpenseTypes,
            MovementTypes    = lookups.MovementTypes,
            MovementSources  = lookups.MovementSources,
            InvoiceStatuses  = lookups.InvoiceStatuses,

            // Reporting views
            ClientBalances    = views.ClientBalances,
            MonthlyProfitLoss = views.MonthlyProfitLoss,
            MonthlyCreditDebit = views.MonthlyCreditDebit,

            ServerTime = DateTime.UtcNow
        };
    }

    // ─── Result Helpers ───────────────────────────────────────────────────────

    private static SyncItemResultDto Created(string? localId, int serverId) => new()
    {
        LocalId = localId,
        ServerId = serverId,
        Status = "created"
    };

    private static SyncItemResultDto Updated(string? localId, int serverId) => new()
    {
        LocalId = localId,
        ServerId = serverId,
        Status = "updated"
    };

    private static SyncItemResultDto Accepted(string? localId, int serverId) => new()
    {
        LocalId = localId,
        ServerId = serverId,
        Status = "accepted"
    };

    private static SyncItemResultDto Rejected(string? localId, string? error) => new()
    {
        LocalId = localId,
        Status = "rejected",
        Errors = string.IsNullOrWhiteSpace(error) ? [] : [error]
    };

    private static SyncItemResultDto Conflict(string? localId, int serverVersion, object serverRecord) => new()
    {
        LocalId = localId,
        Status = "conflict",
        ServerVersion = serverVersion,
        ServerData = JsonSerializer.Serialize(serverRecord, _jsonOpts)
    };
}

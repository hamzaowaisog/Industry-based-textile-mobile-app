using HamzaTex.Api.Data;
using HamzaTex.Api.Entities;
using HamzaTex.Api.Helpers;
using HamzaTex.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace HamzaTex.Api.Services;

/// <summary>
/// Payment management. Handles supplier payments, customer receipts, multi-order FIFO allocation,
/// ledger posting, reversal flow, and unallocated credit tracking.
/// </summary>
public interface IPaymentService
{
    /// <summary>Create a payment. Allocates to orders/purchases (manual or auto-FIFO) and posts a Transaction to the ledger.</summary>
    Task<Response<PaymentDto>> CreateAsync(CreatePaymentDto model, int userId);
    /// <summary>Get payment by ID with allocations. Admin can access any payment; non-admins only their own.</summary>
    Task<Response<PaymentDto>> GetByIdAsync(int id, int userId, bool isAdmin);
    /// <summary>Get all payments paginated. Admin sees all; non-admins see only their own payments.</summary>
    Task<Response<PagedList<PaymentDto>>> GetAllPaginatedAsync(int page, int pageSize, bool includeReversed, int userId, bool isAdmin);
    /// <summary>Get aggregate received/paid totals and total count across the full (non-paginated) payment set, excluding reversed payments. Admin sees all; non-admins see only their own payments.</summary>
    Task<Response<PaymentSummaryDto>> GetSummaryAsync(bool includeReversed, int userId, bool isAdmin);
    /// <summary>Get all payments for a specific client. Admin sees all; non-admins see only their own.</summary>
    Task<Response<List<PaymentDto>>> GetAllByClientIdAsync(int clientId, int userId, bool isAdmin);
    /// <summary>Filter payments by clientId, directionId, modeId, date range, and reversed flag. Admin sees all matches; non-admins see only their own.</summary>
    Task<Response<List<PaymentDto>>> GetFilteredAsync(int? clientId, int? directionId, int? modeId, DateOnly? dateFrom, DateOnly? dateTo, bool includeReversed, int userId, bool isAdmin);
    /// <summary>Update payment notes, date, and mode only. Amount and client cannot be changed. Admin can update any payment; non-admins only their own.</summary>
    Task<Response<PaymentDto>> UpdateByIdAsync(int id, UpdatePaymentDto model, int userId, bool isAdmin);
    /// <summary>Reverse a payment (wrong amount). Creates a reversing Transaction + reversal Payment. Original is marked IsReversed=true.</summary>
    Task<Response<PaymentDto>> ReverseAsync(int id, string? notes, int adminUserId);
    /// <summary>Reverse a payment and re-create it for the correct client. Atomic operation.</summary>
    Task<Response<PaymentDto>> ReverseAndCorrectAsync(int id, ReverseAndCorrectPaymentDto model, int adminUserId);
    /// <summary>Get unallocated credit balance for a client. Admin sees the client's full balance; non-admins see only credit from payments they recorded.</summary>
    Task<Response<UnallocatedCreditDto>> GetUnallocatedCreditAsync(int clientId, int userId, bool isAdmin);
    /// <summary>Hard delete a payment and its allocations. Deletes the linked Transaction. Admin only.</summary>
    Task<Response> DeleteByIdAsync(int id);
    /// <summary>Auto-apply any unallocated credit for a client against a newly delivered order or purchase. Called internally when status transitions to Delivered.</summary>
    Task ApplyUnallocatedCreditAsync(int clientId, int? orderId, int? purchaseId);
}

public class PaymentService : IPaymentService
{
    private readonly ApplicationDbContext _db;
    private readonly IInvoiceService _invoiceService;
    private readonly INotificationService _notification;

    // Seeded direction IDs
    private const int DirectionReceived = 1;
    private const int DirectionPaid = 2;
    private const int DirectionAdjustment = 3;

    // Seeded TransMode IDs
    private const int ModeCash = 1;
    private const int ModeBank = 2;
    private const int ModeCredit = 3;

    // Seeded TransType IDs
    private const int TransTypeDebit = 1;
    private const int TransTypeCredit = 2;

    // Seeded TransCategory IDs
    private const int CatSales = 1;
    private const int CatPurchases = 2;
    private const int CatCashIn = 5;
    private const int CatCashOut = 6;
    private const int CatBankIn = 7;
    private const int CatBankOut = 8;

    // Seeded OrderStatus / PurchaseStatus IDs
    private const int StatusDelivered = 3;
    private const int StatusCancelled = 4;

    // Seeded ClientType IDs
    private const int ClientTypeCustomer = 1;
    private const int ClientTypeSupplier = 2;

    public PaymentService(ApplicationDbContext db, IInvoiceService invoiceService, INotificationService notification)
    {
        _db = db;
        _invoiceService = invoiceService;
        _notification = notification;
    }

    // ──────────────────────────────────────────────────────────────────────────
    // CREATE
    // ──────────────────────────────────────────────────────────────────────────

    public async Task<Response<PaymentDto>> CreateAsync(CreatePaymentDto model, int userId)
    {
        var client = await _db.Clients.FirstOrDefaultAsync(c => c.Id == model.PartyClientId);
        if (client is null)
            return Response<PaymentDto>.ErrorResponse("Not found", "Client not found.");

        // Direction-client type validation
        if (model.PaymentDirectionId == DirectionReceived && client.ClientTypeId != ClientTypeCustomer)
            return Response<PaymentDto>.ErrorResponse("Validation failed", "Received payments can only be recorded for Customers.");

        // Paid is allowed for both Suppliers (payment) and Customers (refund)
        if (model.PaymentDirectionId == DirectionPaid &&
            client.ClientTypeId != ClientTypeSupplier &&
            client.ClientTypeId != ClientTypeCustomer)
            return Response<PaymentDto>.ErrorResponse("Validation failed", "Invalid client type for this payment direction.");

        // Strip empty allocation items — treat 0 same as null (user may send [{orderId:0}] instead of [])
        var providedAllocations = (model.Allocations ?? [])
            .Where(a => (a.OrderId ?? 0) > 0 || (a.PurchaseId ?? 0) > 0)
            .ToList();

        // Build allocations (manual or FIFO)
        List<(int? OrderId, int? PurchaseId, decimal Amount)> allocations;
        if (providedAllocations.Count > 0)
        {
            model.Allocations = providedAllocations;
            var validationError = await ValidateManualAllocations(model);
            if (validationError is not null)
                return Response<PaymentDto>.ErrorResponse("Validation failed", validationError);

            allocations = model.Allocations
                .Select(a => (a.OrderId, a.PurchaseId, a.AllocatedAmount))
                .ToList();

            var remaining = model.Amount - allocations.Sum(a => a.Amount);
            if (remaining > 0)
            {
                var swept = await BuildFifoAllocations(model.PartyClientId, model.PaymentDirectionId, remaining, allocations);
                allocations.AddRange(swept);
            }
        }
        else
        {
            allocations = await BuildFifoAllocations(model.PartyClientId, model.PaymentDirectionId, model.Amount);
        }

        // Determine ledger posting values
        var (transCategoryId, transTypeId) = GetLedgerPosting(model.PaymentDirectionId, model.TransModeId);

        var hijriOffset = (await _db.SystemSettings.AsNoTracking().FirstOrDefaultAsync())?.HijriOffsetDays ?? 0;
        var paymentDateHijri = string.IsNullOrWhiteSpace(model.PaymentDateHijri)
            ? HijriDateHelper.ToHijriString(model.PaymentDate, hijriOffset)
            : model.PaymentDateHijri;

        using var txn = await _db.Database.BeginTransactionAsync();
        try
        {
            var payment = new Payment
            {
                PartyClientId = model.PartyClientId,
                PaymentDirectionId = model.PaymentDirectionId,
                TransModeId = model.TransModeId,
                Amount = model.Amount,
                PaymentDate = model.PaymentDate,
                PaymentDateHijri = paymentDateHijri,
                Notes = model.Notes,
                UserId = userId,
                IsReversed = false,
                CreatedAt = DateOnly.FromDateTime(DateTime.UtcNow)
            };
            _db.Payments.Add(payment);
            await _db.SaveChangesAsync();

            // Insert allocations
            var allocationEntities = new List<PaymentAllocation>();
            foreach (var (orderId, purchaseId, amount) in allocations)
            {
                var allocEntity = new PaymentAllocation
                {
                    PaymentId = payment.Id,
                    OrderId = orderId,
                    PurchaseId = purchaseId,
                    AllocatedAmount = amount,
                    CreatedAt = DateOnly.FromDateTime(DateTime.UtcNow)
                };
                _db.PaymentAllocations.Add(allocEntity);
                allocationEntities.Add(allocEntity);
            }

            // Stamp InvoiceId on each allocation
            foreach (var alloc in allocationEntities)
            {
                if (alloc.OrderId.HasValue)
                {
                    var inv = await _db.Invoices.FirstOrDefaultAsync(i => i.OrderId == alloc.OrderId);
                    if (inv is not null) alloc.InvoiceId = inv.Id;
                }
                else if (alloc.PurchaseId.HasValue)
                {
                    var inv = await _db.Invoices.FirstOrDefaultAsync(i => i.PurchaseId == alloc.PurchaseId);
                    if (inv is not null) alloc.InvoiceId = inv.Id;
                }
            }

            // Post Transaction to ledger
            // OrderId/PurchaseId set only for single-allocation payments; null when split across multiple
            var singleAlloc = allocations.Count == 1 ? allocations[0] : default;
            int? singleInvoiceId = allocationEntities.Count == 1 ? allocationEntities[0].InvoiceId : null;
            var transaction = new Transaction
            {
                ClientId = model.PartyClientId,
                UserId = userId,
                TransTypeId = transTypeId,
                TransModeId = model.TransModeId,
                TransCategoryId = transCategoryId,
                Amount = model.Amount,
                TransDate = model.PaymentDate,
                TransDateHijri = paymentDateHijri,
                OrderId = singleAlloc.OrderId,
                PurchaseId = singleAlloc.PurchaseId,
                InvoiceId = singleInvoiceId,
                Notes = $"Payment #{payment.Id}: {model.Notes}",
                CreatedAt = DateOnly.FromDateTime(DateTime.UtcNow)
            };
            _db.Transactions.Add(transaction);
            await _db.SaveChangesAsync();

            payment.TransactionId = transaction.Id;
            await _db.SaveChangesAsync();

            // Check if any invoices are now fully paid
            var affectedInvoiceIds = allocationEntities
                .Where(a => a.InvoiceId.HasValue)
                .Select(a => a.InvoiceId!.Value)
                .Distinct();

            foreach (var invoiceId in affectedInvoiceIds)
                await _invoiceService.TryMarkPaidAsync(invoiceId);

            await txn.CommitAsync();

            // Push notification
            var notifType = model.PaymentDirectionId == DirectionReceived ? "payment_received" : "payment_paid";
            var notifTitle = model.PaymentDirectionId == DirectionReceived ? "Payment Received" : "Payment Made";
            var notifBody = model.PaymentDirectionId == DirectionReceived
                ? $"{client.Name ?? "Client"} paid PKR {model.Amount:F2}"
                : $"PKR {model.Amount:F2} paid to {client.Name ?? "Client"}";
            try { await _notification.CreateAsync(new CreateNotificationDto
            {
                UserId = userId,
                Type = notifType,
                Title = notifTitle,
                Body = notifBody,
                EntityId = payment.Id
            }); } catch { }

            return await GetByIdInternalAsync(payment.Id);
        }
        catch
        {
            await txn.RollbackAsync();
            throw;
        }
    }

    // ──────────────────────────────────────────────────────────────────────────
    // GET
    // ──────────────────────────────────────────────────────────────────────────

    public async Task<Response<PaymentDto>> GetByIdAsync(int id, int userId, bool isAdmin)
    {
        var result = await GetByIdInternalAsync(id);
        if (!result.Success || result.Data is null)
            return result;

        if (!isAdmin && result.Data.UserId != userId)
            return Response<PaymentDto>.ErrorResponse("Not found", "Payment not found.");

        return result;
    }

    private async Task<Response<PaymentDto>> GetByIdInternalAsync(int id)
    {
        var payment = await _db.Payments
            .AsNoTracking()
            .Include(p => p.PartyClient)
            .Include(p => p.PaymentDirection)
            .Include(p => p.TransMode)
            .Include(p => p.User)
            .Include(p => p.Allocations)
            .FirstOrDefaultAsync(p => p.Id == id);

        if (payment is null)
            return Response<PaymentDto>.ErrorResponse("Not found", "Payment not found.");

        return Response<PaymentDto>.SuccessResponse(MapToDto(payment), "Payment retrieved.");
    }

    public async Task<Response<PagedList<PaymentDto>>> GetAllPaginatedAsync(int page, int pageSize, bool includeReversed, int userId, bool isAdmin)
    {
        var query = _db.Payments
            .AsNoTracking()
            .Include(p => p.PartyClient)
            .Include(p => p.PaymentDirection)
            .Include(p => p.TransMode)
            .Include(p => p.User)
            .Include(p => p.Allocations)
            .AsQueryable();

        if (!isAdmin)
            query = query.Where(p => p.UserId == userId);

        if (!includeReversed)
            query = query.Where(p => p.OriginalPaymentId == null);

        query = query.OrderByDescending(p => p.PaymentDate).ThenByDescending(p => p.Id);

        var paged = await PagedList<PaymentDto>.CreateAsync(
            query.Select(p => MapToDto(p)), page, pageSize);

        return Response<PagedList<PaymentDto>>.SuccessResponse(paged, "Payments retrieved.");
    }

    public async Task<Response<PaymentSummaryDto>> GetSummaryAsync(bool includeReversed, int userId, bool isAdmin)
    {
        var query = _db.Payments.AsNoTracking().Where(p => !p.IsReversed).AsQueryable();

        if (!isAdmin)
            query = query.Where(p => p.UserId == userId);

        if (!includeReversed)
            query = query.Where(p => p.OriginalPaymentId == null);

        var totalReceived = await query.Where(p => p.PaymentDirectionId == DirectionReceived).SumAsync(p => p.Amount);
        var totalPaid = await query.Where(p => p.PaymentDirectionId == DirectionPaid).SumAsync(p => p.Amount);
        var totalCount = await query.CountAsync();

        var summary = new PaymentSummaryDto { TotalReceived = totalReceived, TotalPaid = totalPaid, TotalCount = totalCount };
        return Response<PaymentSummaryDto>.SuccessResponse(summary, "Payment summary fetched.");
    }

    public async Task<Response<List<PaymentDto>>> GetAllByClientIdAsync(int clientId, int userId, bool isAdmin)
    {
        var query = _db.Payments
            .AsNoTracking()
            .Include(p => p.PartyClient)
            .Include(p => p.PaymentDirection)
            .Include(p => p.TransMode)
            .Include(p => p.User)
            .Include(p => p.Allocations)
            .Where(p => p.PartyClientId == clientId)
            .AsQueryable();

        if (!isAdmin)
            query = query.Where(p => p.UserId == userId);

        var payments = await query.OrderByDescending(p => p.PaymentDate).ToListAsync();

        return Response<List<PaymentDto>>.SuccessResponse(
            payments.Select(MapToDto).ToList(), "Payments retrieved.");
    }

    public async Task<Response<List<PaymentDto>>> GetFilteredAsync(
        int? clientId, int? directionId, int? modeId,
        DateOnly? dateFrom, DateOnly? dateTo, bool includeReversed, int userId, bool isAdmin)
    {
        var query = _db.Payments
            .AsNoTracking()
            .Include(p => p.PartyClient)
            .Include(p => p.PaymentDirection)
            .Include(p => p.TransMode)
            .Include(p => p.User)
            .Include(p => p.Allocations)
            .AsQueryable();

        if (!isAdmin)
            query = query.Where(p => p.UserId == userId);

        if (clientId.HasValue) query = query.Where(p => p.PartyClientId == clientId);
        if (directionId.HasValue) query = query.Where(p => p.PaymentDirectionId == directionId);
        if (modeId.HasValue) query = query.Where(p => p.TransModeId == modeId);
        if (dateFrom.HasValue) query = query.Where(p => p.PaymentDate >= dateFrom.Value);
        if (dateTo.HasValue) query = query.Where(p => p.PaymentDate <= dateTo.Value);
        if (!includeReversed) query = query.Where(p => p.OriginalPaymentId == null);

        var list = await query.OrderByDescending(p => p.PaymentDate).ToListAsync();
        return Response<List<PaymentDto>>.SuccessResponse(list.Select(MapToDto).ToList(), "Payments retrieved.");
    }

    // ──────────────────────────────────────────────────────────────────────────
    // UPDATE
    // ──────────────────────────────────────────────────────────────────────────

    public async Task<Response<PaymentDto>> UpdateByIdAsync(int id, UpdatePaymentDto model, int userId, bool isAdmin)
    {
        var payment = await _db.Payments.FindAsync(id);
        if (payment is null)
            return Response<PaymentDto>.ErrorResponse("Not found", "Payment not found.");
        if (!isAdmin && payment.UserId != userId)
            return Response<PaymentDto>.ErrorResponse("Not found", "Payment not found.");
        if (payment.IsReversed)
            return Response<PaymentDto>.ErrorResponse("Invalid operation", "Cannot update a reversed payment.");

        payment.TransModeId = model.TransModeId;
        if (model.PaymentDate.HasValue)
            payment.PaymentDate = model.PaymentDate.Value;
        payment.Notes = model.Notes;
        await _db.SaveChangesAsync();

        return await GetByIdInternalAsync(id);
    }

    // ──────────────────────────────────────────────────────────────────────────
    // REVERSAL
    // ──────────────────────────────────────────────────────────────────────────

    public async Task<Response<PaymentDto>> ReverseAsync(int id, string? notes, int adminUserId)
    {
        var original = await _db.Payments
            .Include(p => p.Allocations)
            .FirstOrDefaultAsync(p => p.Id == id);

        if (original is null)
            return Response<PaymentDto>.ErrorResponse("Not found", "Payment not found.");
        if (original.IsReversed)
            return Response<PaymentDto>.ErrorResponse("Invalid operation", "Payment has already been reversed.");
        if (original.OriginalPaymentId.HasValue)
            return Response<PaymentDto>.ErrorResponse("Invalid operation", "Cannot reverse a reversal payment.");

        var (transCategoryId, transTypeId) = GetLedgerPosting(original.PaymentDirectionId ?? 0, original.TransModeId ?? 0);
        int reversalTransTypeId = transTypeId == TransTypeCredit ? TransTypeDebit : TransTypeCredit;

        using var txn = await _db.Database.BeginTransactionAsync();
        try
        {
            // Reversing transaction (negates cash flow)
            var originalSingleAlloc = original.Allocations.Count == 1 ? original.Allocations.First() : null;
            var originalSingleInvoiceId = original.Allocations.Count == 1 ? original.Allocations.First().InvoiceId : null;
            var reversalAmount = (transCategoryId == CatSales || transCategoryId == CatPurchases)
                ? -original.Amount
                : original.Amount;
            var reversalDate = DateOnly.FromDateTime(DateTime.UtcNow);
            var reversalHijriOffset = (await _db.SystemSettings.AsNoTracking().FirstOrDefaultAsync())?.HijriOffsetDays ?? 0;

            var reversalTransaction = new Transaction
            {
                ClientId = original.PartyClientId,
                UserId = adminUserId,
                TransTypeId = reversalTransTypeId,
                TransModeId = original.TransModeId,
                TransCategoryId = transCategoryId,
                Amount = reversalAmount,
                TransDate = reversalDate,
                TransDateHijri = HijriDateHelper.ToHijriString(reversalDate, reversalHijriOffset),
                OrderId = originalSingleAlloc?.OrderId,
                PurchaseId = originalSingleAlloc?.PurchaseId,
                InvoiceId = originalSingleInvoiceId,
                Notes = $"REVERSAL of Payment #{original.Id}: {notes}",
                CreatedAt = DateOnly.FromDateTime(DateTime.UtcNow)
            };
            _db.Transactions.Add(reversalTransaction);
            await _db.SaveChangesAsync();

            // Reversal payment record
            var reversalPayment = new Payment
            {
                PartyClientId = original.PartyClientId,
                PaymentDirectionId = original.PaymentDirectionId,
                TransModeId = original.TransModeId,
                Amount = original.Amount,
                PaymentDate = DateOnly.FromDateTime(DateTime.UtcNow),
                Notes = $"REVERSAL of Payment #{original.Id}: {notes}",
                UserId = adminUserId,
                IsReversed = false,
                OriginalPaymentId = original.Id,
                TransactionId = reversalTransaction.Id,
                CreatedAt = DateOnly.FromDateTime(DateTime.UtcNow)
            };
            _db.Payments.Add(reversalPayment);
            await _db.SaveChangesAsync();

            // Remove original allocations
            _db.PaymentAllocations.RemoveRange(original.Allocations);

            // Mark original as reversed
            original.IsReversed = true;
            original.ReversedByPaymentId = reversalPayment.Id;
            await _db.SaveChangesAsync();

            await txn.CommitAsync();

            try { await _notification.CreateAsync(new CreateNotificationDto
            {
                UserId = adminUserId,
                Type = "payment_reversed",
                Title = "Payment Reversed",
                Body = $"Payment of PKR {original.Amount:F2} has been reversed",
                EntityId = reversalPayment.Id
            }); } catch { }

            return await GetByIdInternalAsync(reversalPayment.Id);
        }
        catch
        {
            await txn.RollbackAsync();
            throw;
        }
    }

    public async Task<Response<PaymentDto>> ReverseAndCorrectAsync(int id, ReverseAndCorrectPaymentDto model, int adminUserId)
    {
        var original = await _db.Payments.FirstOrDefaultAsync(p => p.Id == id);
        if (original is null)
            return Response<PaymentDto>.ErrorResponse("Not found", "Payment not found.");
        if (original.IsReversed)
            return Response<PaymentDto>.ErrorResponse("Invalid operation", "Payment has already been reversed.");
        if (original.OriginalPaymentId.HasValue)
            return Response<PaymentDto>.ErrorResponse("Invalid operation", "Cannot reverse a reversal payment.");

        var correctClient = await _db.Clients.FirstOrDefaultAsync(c => c.Id == model.CorrectClientId);
        if (correctClient is null)
            return Response<PaymentDto>.ErrorResponse("Not found", "Correct client not found.");

        // Validate direction-client type for the correct client
        if (original.PaymentDirectionId == DirectionReceived && correctClient.ClientTypeId != ClientTypeCustomer)
            return Response<PaymentDto>.ErrorResponse("Validation failed", "Received payments can only be assigned to Customers.");

        // Step 1: Reverse the original
        var reverseResult = await ReverseAsync(id, model.Notes ?? "Wrong client — corrected", adminUserId);
        if (!reverseResult.Success)
            return reverseResult;

        // Step 2: Create correction payment for correct client
        var correctionDto = new CreatePaymentDto
        {
            PartyClientId = model.CorrectClientId,
            PaymentDirectionId = original.PaymentDirectionId ?? DirectionAdjustment,
            TransModeId = original.TransModeId ?? ModeCash,
            Amount = original.Amount,
            PaymentDate = original.PaymentDate,
            PaymentDateHijri = original.PaymentDateHijri,
            Notes = $"CORRECTION for Payment #{original.Id}: {model.Notes}",
            Allocations = new List<AllocationItemDto>() // auto-FIFO on correct client
        };

        return await CreateAsync(correctionDto, adminUserId);
    }

    // ──────────────────────────────────────────────────────────────────────────
    // UNALLOCATED CREDIT
    // ──────────────────────────────────────────────────────────────────────────

    public async Task<Response<UnallocatedCreditDto>> GetUnallocatedCreditAsync(int clientId, int userId, bool isAdmin)
    {
        var client = await _db.Clients.FindAsync(clientId);
        if (client is null)
            return Response<UnallocatedCreditDto>.ErrorResponse("Not found", "Client not found.");

        var paidQuery = _db.Payments
            .Where(p => p.PartyClientId == clientId && !p.IsReversed && p.OriginalPaymentId == null)
            .AsQueryable();
        var allocatedQuery = _db.PaymentAllocations
            .Where(a => a.Payment.PartyClientId == clientId && !a.Payment.IsReversed && a.Payment.OriginalPaymentId == null)
            .AsQueryable();

        if (!isAdmin)
        {
            paidQuery = paidQuery.Where(p => p.UserId == userId);
            allocatedQuery = allocatedQuery.Where(a => a.Payment.UserId == userId);
        }

        var totalPaid = await paidQuery.SumAsync(p => (decimal?)p.Amount) ?? 0;
        var totalAllocated = await allocatedQuery.SumAsync(a => (decimal?)a.AllocatedAmount) ?? 0;

        return Response<UnallocatedCreditDto>.SuccessResponse(new UnallocatedCreditDto
        {
            ClientId = clientId,
            ClientName = client.Name,
            UnallocatedAmount = totalPaid - totalAllocated
        }, "Unallocated credit retrieved.");
    }

    // ──────────────────────────────────────────────────────────────────────────
    // DELETE
    // ──────────────────────────────────────────────────────────────────────────

    public async Task<Response> DeleteByIdAsync(int id)
    {
        var payment = await _db.Payments
            .Include(p => p.Allocations)
            .FirstOrDefaultAsync(p => p.Id == id);

        if (payment is null)
            return Response.ErrorResponse("Not found", "Payment not found.");

        using var txn = await _db.Database.BeginTransactionAsync();
        try
        {
            // Remove allocations
            _db.PaymentAllocations.RemoveRange(payment.Allocations);

            // Remove linked transaction if exists
            if (payment.TransactionId.HasValue)
            {
                var transaction = await _db.Transactions.FindAsync(payment.TransactionId.Value);
                if (transaction is not null)
                    _db.Transactions.Remove(transaction);
            }

            _db.Payments.Remove(payment);
            await _db.SaveChangesAsync();
            await txn.CommitAsync();

            return Response.SuccessResponse("Payment deleted.");
        }
        catch
        {
            await txn.RollbackAsync();
            throw;
        }
    }

    // ──────────────────────────────────────────────────────────────────────────
    // APPLY UNALLOCATED CREDIT (called on Order/Purchase Delivered)
    // ──────────────────────────────────────────────────────────────────────────

    public async Task ApplyUnallocatedCreditAsync(int clientId, int? orderId, int? purchaseId)
    {
        // Calculate outstanding balance on the newly delivered document
        decimal documentTotal = 0;
        if (orderId.HasValue)
        {
            var order = await _db.Orders.Include(o => o.OrderLines).FirstOrDefaultAsync(o => o.Id == orderId.Value);
            if (order is null) return;
            documentTotal = order.OrderLines.Sum(l => l.Qty * l.UnitPrice);
        }
        else if (purchaseId.HasValue)
        {
            var purchase = await _db.Purchases.Include(p => p.PurchaseLines).FirstOrDefaultAsync(p => p.Id == purchaseId.Value);
            if (purchase is null) return;
            documentTotal = purchase.PurchaseLines.Sum(l => l.Qty * l.UnitCost);
        }

        var alreadyAllocated = orderId.HasValue
            ? await _db.PaymentAllocations.Where(a => a.OrderId == orderId && !a.Payment.IsReversed && a.Payment.OriginalPaymentId == null).SumAsync(a => (decimal?)a.AllocatedAmount) ?? 0
            : await _db.PaymentAllocations.Where(a => a.PurchaseId == purchaseId && !a.Payment.IsReversed && a.Payment.OriginalPaymentId == null).SumAsync(a => (decimal?)a.AllocatedAmount) ?? 0;

        decimal outstanding = documentTotal - alreadyAllocated;
        if (outstanding <= 0) return;

        // Find payments for this client that still have unallocated amounts, oldest first
        var payments = await _db.Payments
            .Include(p => p.Allocations)
            .Where(p => p.PartyClientId == clientId && !p.IsReversed && p.OriginalPaymentId == null)
            .OrderBy(p => p.PaymentDate).ThenBy(p => p.Id)
            .ToListAsync();

        foreach (var payment in payments)
        {
            if (outstanding <= 0) break;

            var paymentAllocated = payment.Allocations.Sum(a => a.AllocatedAmount);
            var paymentRemaining = payment.Amount - paymentAllocated;
            if (paymentRemaining <= 0) continue;

            var toAllocate = Math.Min(paymentRemaining, outstanding);
            var autoAlloc = new PaymentAllocation
            {
                PaymentId = payment.Id,
                OrderId = orderId,
                PurchaseId = purchaseId,
                AllocatedAmount = toAllocate,
                CreatedAt = DateOnly.FromDateTime(DateTime.UtcNow)
            };

            // Stamp InvoiceId on auto-allocation
            if (orderId.HasValue)
            {
                var inv = await _db.Invoices.FirstOrDefaultAsync(i => i.OrderId == orderId);
                if (inv is not null) autoAlloc.InvoiceId = inv.Id;
            }
            else if (purchaseId.HasValue)
            {
                var inv = await _db.Invoices.FirstOrDefaultAsync(i => i.PurchaseId == purchaseId);
                if (inv is not null) autoAlloc.InvoiceId = inv.Id;
            }

            _db.PaymentAllocations.Add(autoAlloc);
            outstanding -= toAllocate;
        }

        if (_db.ChangeTracker.HasChanges())
            await _db.SaveChangesAsync();
    }

    // ──────────────────────────────────────────────────────────────────────────
    // PRIVATE HELPERS
    // ──────────────────────────────────────────────────────────────────────────

    private async Task<string?> ValidateManualAllocations(CreatePaymentDto model)
    {
        decimal totalAllocated = 0;
        foreach (var alloc in model.Allocations)
        {
            if (alloc.OrderId.HasValue && alloc.PurchaseId.HasValue)
                return "An allocation cannot have both OrderId and PurchaseId set.";
            if (!alloc.OrderId.HasValue && !alloc.PurchaseId.HasValue)
                return "Each allocation must have either an OrderId or a PurchaseId.";

            if (alloc.OrderId.HasValue)
            {
                var order = await _db.Orders
                    .Include(o => o.OrderLines)
                    .FirstOrDefaultAsync(o => o.Id == alloc.OrderId.Value);
                if (order is null) return $"Order #{alloc.OrderId} not found.";
                if (order.StatusId != StatusDelivered) return $"Order #{alloc.OrderId} is not yet delivered and cannot receive payment.";

                var orderTotal = order.OrderLines.Sum(l => l.Qty * l.UnitPrice);
                var alreadyAllocated = await _db.PaymentAllocations
                    .Where(a => a.OrderId == alloc.OrderId && !a.Payment.IsReversed && a.Payment.OriginalPaymentId == null)
                    .SumAsync(a => (decimal?)a.AllocatedAmount) ?? 0;
                var outstanding = orderTotal - alreadyAllocated;

                if (alloc.AllocatedAmount > outstanding)
                    return $"Allocation for Order #{alloc.OrderId} exceeds outstanding balance of {outstanding:F2}.";
            }

            if (alloc.PurchaseId.HasValue)
            {
                var purchase = await _db.Purchases
                    .Include(p => p.PurchaseLines)
                    .FirstOrDefaultAsync(p => p.Id == alloc.PurchaseId.Value);
                if (purchase is null) return $"Purchase #{alloc.PurchaseId} not found.";
                if (purchase.StatusId != StatusDelivered) return $"Purchase #{alloc.PurchaseId} is not yet delivered and cannot receive payment.";

                var purchaseTotal = purchase.PurchaseLines.Sum(l => l.Qty * l.UnitCost);
                var alreadyAllocated = await _db.PaymentAllocations
                    .Where(a => a.PurchaseId == alloc.PurchaseId && !a.Payment.IsReversed && a.Payment.OriginalPaymentId == null)
                    .SumAsync(a => (decimal?)a.AllocatedAmount) ?? 0;
                var outstanding = purchaseTotal - alreadyAllocated;

                if (alloc.AllocatedAmount > outstanding)
                    return $"Allocation for Purchase #{alloc.PurchaseId} exceeds outstanding balance of {outstanding:F2}.";
            }

            totalAllocated += alloc.AllocatedAmount;
        }

        if (totalAllocated > model.Amount)
            return $"Total allocated amount ({totalAllocated:F2}) exceeds payment amount ({model.Amount:F2}).";

        return null;
    }

    private async Task<List<(int? OrderId, int? PurchaseId, decimal Amount)>> BuildFifoAllocations(
        int clientId, int directionId, decimal paymentAmount,
        List<(int? OrderId, int? PurchaseId, decimal Amount)>? inFlightAllocations = null)
    {
        var result = new List<(int? OrderId, int? PurchaseId, decimal Amount)>();
        decimal remaining = paymentAmount;

        if (directionId == DirectionReceived)
        {
            // Customer payment — allocate to orders oldest first
            var orders = await _db.Orders
                .Include(o => o.OrderLines)
                .Where(o => o.ClientId == clientId && o.StatusId == StatusDelivered)
                .OrderBy(o => o.OrderDate).ThenBy(o => o.Id)
                .ToListAsync();

            foreach (var order in orders)
            {
                if (remaining <= 0) break;

                var orderTotal = order.OrderLines.Sum(l => l.Qty * l.UnitPrice);
                var alreadyAllocated = await _db.PaymentAllocations
                    .Where(a => a.OrderId == order.Id && !a.Payment.IsReversed && a.Payment.OriginalPaymentId == null)
                    .SumAsync(a => (decimal?)a.AllocatedAmount) ?? 0;
                var inFlight = inFlightAllocations?.Where(a => a.OrderId == order.Id).Sum(a => a.Amount) ?? 0;
                var outstanding = orderTotal - alreadyAllocated - inFlight;

                if (outstanding <= 0) continue;

                var toAllocate = Math.Min(remaining, outstanding);
                result.Add((order.Id, null, toAllocate));
                remaining -= toAllocate;
            }
        }
        else if (directionId == DirectionPaid)
        {
            // Supplier payment — allocate to purchases oldest first
            var purchases = await _db.Purchases
                .Include(p => p.PurchaseLines)
                .Where(p => p.SupplierId == clientId && p.StatusId == StatusDelivered)
                .OrderBy(p => p.PurchaseDate).ThenBy(p => p.Id)
                .ToListAsync();

            foreach (var purchase in purchases)
            {
                if (remaining <= 0) break;

                var purchaseTotal = purchase.PurchaseLines.Sum(l => l.Qty * l.UnitCost);
                var alreadyAllocated = await _db.PaymentAllocations
                    .Where(a => a.PurchaseId == purchase.Id && !a.Payment.IsReversed && a.Payment.OriginalPaymentId == null)
                    .SumAsync(a => (decimal?)a.AllocatedAmount) ?? 0;
                var inFlight = inFlightAllocations?.Where(a => a.PurchaseId == purchase.Id).Sum(a => a.Amount) ?? 0;
                var outstanding = purchaseTotal - alreadyAllocated - inFlight;

                if (outstanding <= 0) continue;

                var toAllocate = Math.Min(remaining, outstanding);
                result.Add((null, purchase.Id, toAllocate));
                remaining -= toAllocate;
            }
        }
        // Adjustment or no matching orders/purchases → no allocations (unallocated credit)

        return result;
    }

    private static (int transCategoryId, int transTypeId) GetLedgerPosting(int directionId, int modeId)
    {
        return (directionId, modeId) switch
        {
            (DirectionReceived, ModeCash)  => (CatCashIn, TransTypeCredit),
            (DirectionReceived, ModeBank)  => (CatBankIn, TransTypeCredit),
            (DirectionReceived, ModeCredit) => (CatSales, TransTypeCredit),
            (DirectionPaid, ModeCash)      => (CatCashOut, TransTypeDebit),
            (DirectionPaid, ModeBank)      => (CatBankOut, TransTypeDebit),
            (DirectionPaid, ModeCredit)    => (CatPurchases, TransTypeDebit),
            _                              => (CatCashIn, TransTypeCredit) // Adjustment default
        };
    }

    private static PaymentDto MapToDto(Payment p) => new()
    {
        Id = p.Id,
        PartyClientId = p.PartyClientId,
        PartyClientName = p.PartyClient?.Name,
        PaymentDirectionId = p.PaymentDirectionId,
        PaymentDirectionName = p.PaymentDirection?.Name,
        TransModeId = p.TransModeId,
        TransModeName = p.TransMode?.Name,
        Amount = p.Amount,
        PaymentDate = p.PaymentDate,
        PaymentDateHijri = p.PaymentDateHijri,
        PaymentDateHijriDisplay = HijriDateHelper.FormatForDisplay(p.PaymentDateHijri),
        Notes = p.Notes,
        CreatedAt = p.CreatedAt,
        UserId = p.UserId,
        RecordedByName = p.User?.Name,
        IsReversed = p.IsReversed,
        ReversedByPaymentId = p.ReversedByPaymentId,
        OriginalPaymentId = p.OriginalPaymentId,
        IsCashSettled = p.TransModeId != 3,
        Allocations = p.Allocations.Select(a => new PaymentAllocationDto
        {
            Id = a.Id,
            PaymentId = a.PaymentId,
            OrderId = a.OrderId,
            PurchaseId = a.PurchaseId,
            AllocatedAmount = a.AllocatedAmount
        }).ToList()
    };
}

using HamzaTex.Api.Data;
using HamzaTex.Api.Entities;
using HamzaTex.Api.Helpers;
using HamzaTex.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace HamzaTex.Api.Services;

// ─────────────────────────────────────────────────────────────────────────────
// Interface
// ─────────────────────────────────────────────────────────────────────────────

/// <summary>Ledger viewer and manual correction tool for the transactions table.</summary>
public interface ITransactionService
{
    /// <summary>Create a manual ledger entry. Auto-defaults TransTypeId=1 (Debit) and TransModeId=1 (Cash) if omitted.</summary>
    Task<Response<TransactionDto>> CreateAsync(CreateTransactionDto model, int userId);

    /// <summary>Get a transaction by ID. Staff can only access their own records.</summary>
    Task<Response<TransactionDto>> GetByIdAsync(int id, int userId, bool isAdmin);

    /// <summary>Get cash-movement transactions paginated (excludes accrual Sales/Purchases rows already represented by their matching Payment row). Admin sees all; non-admins see only their own transactions.</summary>
    Task<Response<PagedList<TransactionDto>>> GetAllPaginatedAsync(int page, int pageSize, int userId, bool isAdmin);

    /// <summary>Get all transactions for a client, including accrual Sales/Purchases rows (full ledger — used by the client detail screen, not the Transaction list). Staff: ownership check applied.</summary>
    Task<Response<List<TransactionDto>>> GetAllByClientIdAsync(int clientId, int userId, bool isAdmin);

    /// <summary>Filter transactions by any combination of typeId, categoryId, modeId, clientId, dateFrom, dateTo, including accrual Sales/Purchases rows (full ledger). Admin sees all matches; non-admins see only their own.</summary>
    Task<Response<List<TransactionDto>>> GetFilteredAsync(int? typeId, int? categoryId, int? modeId, int? clientId, DateOnly? dateFrom, DateOnly? dateTo, int userId, bool isAdmin);

    /// <summary>Get cash-movement transactions (non-paginated), same scope as <see cref="GetAllPaginatedAsync"/>. Admin sees all; non-admins see only their own. Used for PDF export, so the export mirrors the in-app list.</summary>
    Task<Response<List<TransactionDto>>> GetAllAsync(int userId, bool isAdmin);

    /// <summary>Get aggregate Credit/Debit cash-flow totals (Expenses + Cash/Bank In &amp; Out categories — excludes accrual Sales/Purchases postings, which would double-count the same amount at delivery and again at payment). Admin sees all; non-admins see only their own transactions.</summary>
    Task<Response<TransactionSummaryDto>> GetSummaryAsync(int userId, bool isAdmin);

    /// <summary>Update a manual transaction. Returns an error if the transaction was auto-posted.</summary>
    Task<Response<TransactionDto>> UpdateByIdAsync(int id, UpdateTransactionDto model);

    /// <summary>Delete a manual transaction. Returns an error if the transaction was auto-posted.</summary>
    Task<Response> DeleteByIdAsync(int id);
}

// ─────────────────────────────────────────────────────────────────────────────
// Implementation
// ─────────────────────────────────────────────────────────────────────────────

public class TransactionService : ITransactionService
{
    private static readonly int[] CashFlowCategories = { 3, 4, 5, 6, 7, 8 };
    private const int TransTypeDebit = 1;
    private const int TransTypeCredit = 2;

    private readonly ApplicationDbContext _db;

    public TransactionService(ApplicationDbContext db)
    {
        _db = db;
    }

    // ── Helpers ──────────────────────────────────────────────────────────────

    private static IQueryable<Transaction> WithIncludes(IQueryable<Transaction> q) =>
        q.Include(t => t.Expenses)
         .Include(t => t.Client)
         .Include(t => t.Product)
         .Include(t => t.User)
         .Include(t => t.TransType)
         .Include(t => t.TransMode)
         .Include(t => t.TransCategory)
         .Include(t => t.Order)
         .Include(t => t.Purchase);

    private static string DeriveSource(Transaction t)
    {
        if (t.OrderId.HasValue)    return $"Order #{t.OrderId}";
        if (t.PurchaseId.HasValue) return $"Purchase #{t.PurchaseId}";
        if (t.Expenses.Any())      return "Expense";
        if (t.TransCategoryId is 5 or 6) return "Payment";
        return "Manual";
    }

    private static bool DeriveIsManual(Transaction t) =>
        !t.OrderId.HasValue &&
        !t.PurchaseId.HasValue &&
        !t.Expenses.Any() &&
        t.TransCategoryId is not (5 or 6);

    /// <summary>
    /// A Payment transaction split across multiple delivered Orders/Purchases has null OrderId/PurchaseId
    /// on the Transaction row itself, so its bill numbers must be recovered from the linked Payment's allocations.
    /// Batches one query per page/list instead of per-row. Payment-driven rows always source both BillNos and
    /// UnallocatedAmount from the live Payment.Allocations so that a later cancel/delete which releases an
    /// allocation reflects immediately, even when the Transaction row still carries a stale OrderId/PurchaseId
    /// snapshot from a previously single-allocated payment.
    /// </summary>
    private sealed record PaymentTxContext(List<string> BillNos, decimal UnallocatedAmount);

    private async Task<Dictionary<int, PaymentTxContext>> BuildPaymentContextAsync(IEnumerable<Transaction> transactions)
    {
        var candidateIds = transactions
            .Where(t => t.TransCategoryId is 5 or 6)
            .Select(t => t.Id)
            .ToList();
        if (candidateIds.Count == 0) return new();

        var payments = await _db.Payments
            .AsNoTracking()
            .Where(p => p.TransactionId.HasValue && candidateIds.Contains(p.TransactionId.Value))
            .Include(p => p.Allocations).ThenInclude(a => a.Order)
            .Include(p => p.Allocations).ThenInclude(a => a.Purchase)
            .ToListAsync();

        return payments.ToDictionary(
            p => p.TransactionId!.Value,
            p => new PaymentTxContext(
                p.Allocations
                    .Select(a => a.Order?.BillNo ?? a.Purchase?.BillNo)
                    .Where(b => !string.IsNullOrWhiteSpace(b))
                    .Select(b => b!)
                    .Distinct()
                    .ToList(),
                p.Amount - p.Allocations.Sum(a => a.AllocatedAmount)));
    }

    private static TransactionDto ToDto(Transaction t, IReadOnlyDictionary<int, PaymentTxContext>? paymentContext = null)
    {
        List<string> billNos;
        decimal? unallocatedAmount = null;

        if (t.TransCategoryId is 5 or 6
            && paymentContext is not null
            && paymentContext.TryGetValue(t.Id, out var ctx))
        {
            billNos = ctx.BillNos;
            unallocatedAmount = ctx.UnallocatedAmount;
        }
        else if (!string.IsNullOrWhiteSpace(t.Order?.BillNo))
            billNos = [t.Order!.BillNo!];
        else if (!string.IsNullOrWhiteSpace(t.Purchase?.BillNo))
            billNos = [t.Purchase!.BillNo!];
        else
            billNos = [];

        return new()
        {
        Id              = t.Id,
        ClientId        = t.ClientId,
        ClientName      = t.Client?.Name,
        ProductId       = t.ProductId,
        ProductName     = t.Product?.Name,
        UserId          = t.UserId,
        UserName        = t.User?.Name,
        OrderId         = t.OrderId,
        PurchaseId      = t.PurchaseId,
        BillNo          = billNos.Count > 0 ? string.Join(", ", billNos) : null,
        BillNos         = billNos,
        UnallocatedAmount = unallocatedAmount,
        TransTypeId     = t.TransTypeId,
        TransTypeName   = t.TransType?.Name,
        TransModeId     = t.TransModeId,
        TransModeName   = t.TransMode?.Name,
        TransCategoryId   = t.TransCategoryId,
        TransCategoryName = t.TransCategory?.Name,
        Amount          = t.Amount,
        TransDate       = t.TransDate,
        TransDateHijri  = t.TransDateHijri,
        TransDateHijriDisplay = HijriDateHelper.FormatForDisplay(t.TransDateHijri),
        Notes           = t.Notes,
        CreatedAt       = t.CreatedAt,
        Source          = DeriveSource(t),
        IsManual        = DeriveIsManual(t),
        };
    }

    /// <summary>
    /// Returns a non-null error response if the transaction is auto-posted and must not be mutated.
    /// </summary>
    private static (bool IsLocked, string Reason) GetLockReason(Transaction t)
    {
        if (t.OrderId.HasValue)
            return (true, $"This transaction was posted by Order #{t.OrderId}. Edit the Order instead.");
        if (t.PurchaseId.HasValue)
            return (true, $"This transaction was posted by Purchase #{t.PurchaseId}. Edit the Purchase instead.");
        if (t.Expenses.Any())
            return (true, "This transaction was posted by an Expense. Edit the Expense instead.");
        if (t.TransCategoryId is 5 or 6)
            return (true, "This transaction was posted by a Payment. Use the Payment reversal flow instead.");
        if (t.TransCategoryId is 9)
            return (true, "This transaction was posted as a Client opening balance. Edit the Client's opening balance instead.");
        return (false, string.Empty);
    }

    // ── CRUD ─────────────────────────────────────────────────────────────────

    public async Task<Response<TransactionDto>> CreateAsync(CreateTransactionDto model, int userId)
    {
        var hijriOffset = (await _db.SystemSettings.AsNoTracking().FirstOrDefaultAsync())?.HijriOffsetDays ?? 0;
        var transDateHijri = string.IsNullOrWhiteSpace(model.TransDateHijri)
            ? HijriDateHelper.ToHijriString(model.TransDate, hijriOffset)
            : model.TransDateHijri;

        var entity = new Transaction
        {
            Amount          = model.Amount,
            TransCategoryId = model.TransCategoryId,
            TransDate       = model.TransDate,
            TransDateHijri  = transDateHijri,
            Notes           = model.Notes,
            ClientId        = model.ClientId,
            TransTypeId     = model.TransTypeId ?? 1,
            TransModeId     = model.TransModeId ?? 1,
            UserId          = userId,
            CreatedAt       = DateOnly.FromDateTime(DateTime.UtcNow)
        };

        _db.Transactions.Add(entity);
        await _db.SaveChangesAsync();

        var created = await WithIncludes(_db.Transactions.AsNoTracking())
            .FirstAsync(t => t.Id == entity.Id);

        var createdCtx = await BuildPaymentContextAsync([created]);
        return Response<TransactionDto>.SuccessResponse(ToDto(created, createdCtx), "Transaction created.");
    }

    public async Task<Response<TransactionDto>> GetByIdAsync(int id, int userId, bool isAdmin)
    {
        var entity = await WithIncludes(_db.Transactions.AsNoTracking())
            .FirstOrDefaultAsync(t => t.Id == id);

        if (entity is null || (!isAdmin && entity.UserId != userId))
            return Response<TransactionDto>.ErrorResponse("Not found", $"Transaction with ID '{id}' was not found.");

        var ctx = await BuildPaymentContextAsync([entity]);
        return Response<TransactionDto>.SuccessResponse(ToDto(entity, ctx), "Transaction fetched.");
    }

    public async Task<Response<PagedList<TransactionDto>>> GetAllPaginatedAsync(int page, int pageSize, int userId, bool isAdmin)
    {
        var query = WithIncludes(_db.Transactions.AsNoTracking())
            .Where(t => t.TransCategoryId.HasValue && CashFlowCategories.Contains(t.TransCategoryId.Value));
        if (!isAdmin)
            query = query.Where(t => t.UserId == userId);

        query = query.OrderByDescending(t => t.TransDate).ThenByDescending(t => t.Id);

        var paged = await PagedList<Transaction>.CreateAsync(query, page, pageSize);
        var ctx = await BuildPaymentContextAsync(paged.Items);
        var pagedList = new PagedList<TransactionDto>(paged.Items.Select(t => ToDto(t, ctx)).ToList(), paged.Page, paged.PageSize, paged.TotalCount);

        return Response<PagedList<TransactionDto>>.SuccessResponse(pagedList, "Transactions fetched.");
    }

    public async Task<Response<List<TransactionDto>>> GetAllAsync(int userId, bool isAdmin)
    {
        var query = WithIncludes(_db.Transactions.AsNoTracking())
            .Where(t => t.TransCategoryId.HasValue && CashFlowCategories.Contains(t.TransCategoryId.Value));
        if (!isAdmin)
            query = query.Where(t => t.UserId == userId);

        var list = await query
            .OrderByDescending(t => t.TransDate)
            .ThenByDescending(t => t.Id)
            .ToListAsync();

        var ctx = await BuildPaymentContextAsync(list);
        return Response<List<TransactionDto>>.SuccessResponse(
            list.Select(t => ToDto(t, ctx)).ToList(), "Transactions fetched.");
    }

    public async Task<Response<TransactionSummaryDto>> GetSummaryAsync(int userId, bool isAdmin)
    {
        var query = _db.Transactions.AsNoTracking()
            .Where(t => t.TransCategoryId.HasValue && CashFlowCategories.Contains(t.TransCategoryId.Value));
        if (!isAdmin)
            query = query.Where(t => t.UserId == userId);

        var totalCredit = await query.Where(t => t.TransTypeId == TransTypeCredit).SumAsync(t => t.Amount);
        var totalDebit = await query.Where(t => t.TransTypeId == TransTypeDebit).SumAsync(t => t.Amount);

        var summary = new TransactionSummaryDto { TotalCredit = totalCredit, TotalDebit = totalDebit };
        return Response<TransactionSummaryDto>.SuccessResponse(summary, "Transaction summary fetched.");
    }

    public async Task<Response<List<TransactionDto>>> GetAllByClientIdAsync(int clientId, int userId, bool isAdmin)
    {
        if (!isAdmin)
        {
            var client = await _db.Clients.AsNoTracking()
                .FirstOrDefaultAsync(c => c.Id == clientId);
            if (client is null || client.UserId != userId)
                return Response<List<TransactionDto>>.ErrorResponse(
                    "Not found", $"Client with ID '{clientId}' was not found.");
        }

        var list = await WithIncludes(_db.Transactions.AsNoTracking())
            .Where(t => t.ClientId == clientId)
            .OrderByDescending(t => t.TransDate)
            .ThenByDescending(t => t.Id)
            .ToListAsync();

        var ctx = await BuildPaymentContextAsync(list);
        return Response<List<TransactionDto>>.SuccessResponse(
            list.Select(t => ToDto(t, ctx)).ToList(), "Transactions fetched.");
    }

    public async Task<Response<List<TransactionDto>>> GetFilteredAsync(
        int? typeId, int? categoryId, int? modeId, int? clientId,
        DateOnly? dateFrom, DateOnly? dateTo, int userId, bool isAdmin)
    {
        var query = WithIncludes(_db.Transactions.AsNoTracking()).AsQueryable();
        if (!isAdmin)
            query = query.Where(t => t.UserId == userId);

        if (typeId.HasValue)     query = query.Where(t => t.TransTypeId     == typeId);
        if (categoryId.HasValue) query = query.Where(t => t.TransCategoryId == categoryId);
        if (modeId.HasValue)     query = query.Where(t => t.TransModeId     == modeId);
        if (clientId.HasValue)   query = query.Where(t => t.ClientId        == clientId);
        if (dateFrom.HasValue)   query = query.Where(t => t.TransDate       >= dateFrom);
        if (dateTo.HasValue)     query = query.Where(t => t.TransDate       <= dateTo);

        var list = await query
            .OrderByDescending(t => t.TransDate)
            .ThenByDescending(t => t.Id)
            .ToListAsync();

        var ctx = await BuildPaymentContextAsync(list);
        return Response<List<TransactionDto>>.SuccessResponse(
            list.Select(t => ToDto(t, ctx)).ToList(), "Transactions fetched.");
    }

    public async Task<Response<TransactionDto>> UpdateByIdAsync(int id, UpdateTransactionDto model)
    {
        var entity = await WithIncludes(_db.Transactions)
            .FirstOrDefaultAsync(t => t.Id == id);

        if (entity is null)
            return Response<TransactionDto>.ErrorResponse("Not found", $"Transaction with ID '{id}' was not found.");

        var (isLocked, reason) = GetLockReason(entity);
        if (isLocked)
            return Response<TransactionDto>.ErrorResponse(reason);

        entity.Amount          = model.Amount;
        entity.TransCategoryId = model.TransCategoryId;
        entity.TransDate       = model.TransDate;
        entity.Notes           = model.Notes;
        entity.ClientId        = model.ClientId;
        entity.TransTypeId     = model.TransTypeId ?? entity.TransTypeId;
        entity.TransModeId     = model.TransModeId ?? entity.TransModeId;

        await _db.SaveChangesAsync();

        var updated = await WithIncludes(_db.Transactions.AsNoTracking())
            .FirstAsync(t => t.Id == id);

        var ctx = await BuildPaymentContextAsync([updated]);
        return Response<TransactionDto>.SuccessResponse(ToDto(updated, ctx), "Transaction updated.");
    }

    public async Task<Response> DeleteByIdAsync(int id)
    {
        var entity = await WithIncludes(_db.Transactions)
            .FirstOrDefaultAsync(t => t.Id == id);

        if (entity is null)
            return Response.ErrorResponse("Not found", $"Transaction with ID '{id}' was not found.");

        var (isLocked, reason) = GetLockReason(entity);
        if (isLocked)
            return Response.ErrorResponse(reason);

        _db.Transactions.Remove(entity);
        await _db.SaveChangesAsync();

        return Response.SuccessResponse("Transaction deleted.");
    }
}

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

    /// <summary>Get all transactions paginated. Admin sees all; non-admins see only their own transactions.</summary>
    Task<Response<PagedList<TransactionDto>>> GetAllPaginatedAsync(int page, int pageSize, int userId, bool isAdmin);

    /// <summary>Get all transactions for a client. Staff: ownership check applied.</summary>
    Task<Response<List<TransactionDto>>> GetAllByClientIdAsync(int clientId, int userId, bool isAdmin);

    /// <summary>Filter transactions by any combination of typeId, categoryId, modeId, clientId, dateFrom, dateTo. Admin sees all matches; non-admins see only their own.</summary>
    Task<Response<List<TransactionDto>>> GetFilteredAsync(int? typeId, int? categoryId, int? modeId, int? clientId, DateOnly? dateFrom, DateOnly? dateTo, int userId, bool isAdmin);

    /// <summary>Get all transactions (non-paginated). Admin sees all; non-admins see only their own. Used for PDF export.</summary>
    Task<Response<List<TransactionDto>>> GetAllAsync(int userId, bool isAdmin);

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
         .Include(t => t.TransCategory);

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

    private static TransactionDto ToDto(Transaction t) => new()
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
        TransTypeId     = t.TransTypeId,
        TransTypeName   = t.TransType?.Name,
        TransModeId     = t.TransModeId,
        TransModeName   = t.TransMode?.Name,
        TransCategoryId   = t.TransCategoryId,
        TransCategoryName = t.TransCategory?.Name,
        Amount          = t.Amount,
        TransDate       = t.TransDate,
        Notes           = t.Notes,
        CreatedAt       = t.CreatedAt,
        Source          = DeriveSource(t),
        IsManual        = DeriveIsManual(t),
    };

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
        var entity = new Transaction
        {
            Amount          = model.Amount,
            TransCategoryId = model.TransCategoryId,
            TransDate       = model.TransDate,
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

        return Response<TransactionDto>.SuccessResponse(ToDto(created), "Transaction created.");
    }

    public async Task<Response<TransactionDto>> GetByIdAsync(int id, int userId, bool isAdmin)
    {
        var entity = await WithIncludes(_db.Transactions.AsNoTracking())
            .FirstOrDefaultAsync(t => t.Id == id);

        if (entity is null || (!isAdmin && entity.UserId != userId))
            return Response<TransactionDto>.ErrorResponse("Not found", $"Transaction with ID '{id}' was not found.");

        return Response<TransactionDto>.SuccessResponse(ToDto(entity), "Transaction fetched.");
    }

    public async Task<Response<PagedList<TransactionDto>>> GetAllPaginatedAsync(int page, int pageSize, int userId, bool isAdmin)
    {
        var query = WithIncludes(_db.Transactions.AsNoTracking()).AsQueryable();
        if (!isAdmin)
            query = query.Where(t => t.UserId == userId);

        query = query.OrderByDescending(t => t.TransDate).ThenByDescending(t => t.Id);

        var paged = await PagedList<Transaction>.CreateAsync(query, page, pageSize);
        var pagedList = new PagedList<TransactionDto>(paged.Items.Select(ToDto).ToList(), paged.Page, paged.PageSize, paged.TotalCount);

        return Response<PagedList<TransactionDto>>.SuccessResponse(pagedList, "Transactions fetched.");
    }

    public async Task<Response<List<TransactionDto>>> GetAllAsync(int userId, bool isAdmin)
    {
        var query = WithIncludes(_db.Transactions.AsNoTracking()).AsQueryable();
        if (!isAdmin)
            query = query.Where(t => t.UserId == userId);

        var list = await query
            .OrderByDescending(t => t.TransDate)
            .ThenByDescending(t => t.Id)
            .ToListAsync();

        return Response<List<TransactionDto>>.SuccessResponse(
            list.Select(ToDto).ToList(), "Transactions fetched.");
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

        return Response<List<TransactionDto>>.SuccessResponse(
            list.Select(ToDto).ToList(), "Transactions fetched.");
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

        return Response<List<TransactionDto>>.SuccessResponse(
            list.Select(ToDto).ToList(), "Transactions fetched.");
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
        // Null means "keep current value" — callers cannot explicitly clear these fields via PUT.
        entity.TransTypeId     = model.TransTypeId ?? entity.TransTypeId;
        entity.TransModeId     = model.TransModeId ?? entity.TransModeId;

        await _db.SaveChangesAsync();

        var updated = await WithIncludes(_db.Transactions.AsNoTracking())
            .FirstAsync(t => t.Id == id);

        return Response<TransactionDto>.SuccessResponse(ToDto(updated), "Transaction updated.");
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

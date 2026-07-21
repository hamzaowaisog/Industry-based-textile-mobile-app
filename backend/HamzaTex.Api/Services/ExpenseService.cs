using HamzaTex.Api.Data;
using HamzaTex.Api.Entities;
using HamzaTex.Api.Helpers;
using HamzaTex.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace HamzaTex.Api.Services;

// ─────────────────────────────────────────────────────────────────────────────
// ExpenseType Service
// ─────────────────────────────────────────────────────────────────────────────

/// <summary>CRUD operations for expense types (Office Expenses, Home Expenses, custom categories).</summary>
public interface IExpenseTypeService
{
    /// <summary>Create a new expense type. Name must be unique.</summary>
    Task<Response<ExpenseTypeDto>> CreateAsync(CreateExpenseTypeDto model);
    /// <summary>Get an expense type by ID.</summary>
    Task<Response<ExpenseTypeDto>> GetByIdAsync(int id);
    /// <summary>Get all expense types.</summary>
    Task<Response<List<ExpenseTypeDto>>> GetAllAsync();
    /// <summary>Update an expense type name by ID.</summary>
    Task<Response<ExpenseTypeDto>> UpdateByIdAsync(int id, UpdateExpenseTypeDto model);
    /// <summary>Delete an expense type by ID. Fails if in use or if it is a seeded type (ID 1 or 2).</summary>
    Task<Response> DeleteByIdAsync(int id);
}

public class ExpenseTypeService : IExpenseTypeService
{
    private readonly ApplicationDbContext _db;

    public ExpenseTypeService(ApplicationDbContext db)
    {
        _db = db;
    }

    public async Task<Response<ExpenseTypeDto>> CreateAsync(CreateExpenseTypeDto model)
    {
        var validationResult = await ValidateNameAsync(model.Name);
        if (validationResult is not null) return validationResult;

        var entity = new ExpenseType
        {
            Name = model.Name.Trim(),
            CreatedAt = DateOnly.FromDateTime(DateTime.UtcNow)
        };

        _db.ExpenseTypes.Add(entity);
        await _db.SaveChangesAsync();

        return Response<ExpenseTypeDto>.SuccessResponse(ToDto(entity), "Expense type created.");
    }

    public async Task<Response<ExpenseTypeDto>> GetByIdAsync(int id)
    {
        var entity = await _db.ExpenseTypes.FindAsync(id);
        if (entity is null)
            return Response<ExpenseTypeDto>.ErrorResponse("Not found", $"Expense type with ID '{id}' was not found.");

        return Response<ExpenseTypeDto>.SuccessResponse(ToDto(entity), "Expense type fetched.");
    }

    public async Task<Response<List<ExpenseTypeDto>>> GetAllAsync()
    {
        var types = await _db.ExpenseTypes
            .AsNoTracking()
            .OrderBy(t => t.Id)
            .Select(t => ToDto(t))
            .ToListAsync();

        return Response<List<ExpenseTypeDto>>.SuccessResponse(types, "Expense types fetched.");
    }

    public async Task<Response<ExpenseTypeDto>> UpdateByIdAsync(int id, UpdateExpenseTypeDto model)
    {
        var validationResult = await ValidateNameAsync(model.Name, excludeId: id);
        if (validationResult is not null) return validationResult;

        var entity = await _db.ExpenseTypes.FindAsync(id);
        if (entity is null)
            return Response<ExpenseTypeDto>.ErrorResponse("Not found", $"Expense type with ID '{id}' was not found.");

        entity.Name = model.Name.Trim();
        await _db.SaveChangesAsync();

        return Response<ExpenseTypeDto>.SuccessResponse(ToDto(entity), "Expense type updated.");
    }

    public async Task<Response> DeleteByIdAsync(int id)
    {
        if (id == 1 || id == 2)
            return Response.ErrorResponse("Invalid operation", "Cannot delete seeded expense types (Office Expenses and Home Expenses are required by the system).");

        var entity = await _db.ExpenseTypes.FindAsync(id);
        if (entity is null)
            return Response.ErrorResponse("Not found", $"Expense type with ID '{id}' was not found.");

        var inUse = await _db.Expenses.AnyAsync(e => e.ExpenseTypeId == id);
        if (inUse)
            return Response.ErrorResponse("Validation failed", "Cannot delete an expense type that has existing expenses.");

        _db.ExpenseTypes.Remove(entity);
        await _db.SaveChangesAsync();

        return Response.SuccessResponse("Expense type deleted.");
    }

    private async Task<Response<ExpenseTypeDto>?> ValidateNameAsync(string name, int? excludeId = null)
    {
        if (string.IsNullOrWhiteSpace(name))
            return Response<ExpenseTypeDto>.ErrorResponse("Validation failed", "Name is required.");

        var trimmed = name.Trim();

        if (trimmed.Length > 100)
            return Response<ExpenseTypeDto>.ErrorResponse("Validation failed", "Name must be 100 characters or fewer.");

        var query = _db.ExpenseTypes.AsNoTracking().Where(t => t.Name == trimmed);
        if (excludeId.HasValue) query = query.Where(t => t.Id != excludeId.Value);

        if (await query.AnyAsync())
            return Response<ExpenseTypeDto>.ErrorResponse("Validation failed", "An expense type with this name already exists.");

        return null;
    }

    private static ExpenseTypeDto ToDto(ExpenseType entity) => new()
    {
        Id = entity.Id,
        Name = entity.Name,
        CreatedAt = entity.CreatedAt
    };
}

// ─────────────────────────────────────────────────────────────────────────────
// Expense Service
// ─────────────────────────────────────────────────────────────────────────────

/// <summary>Expense CRUD with atomic ledger posting — every expense creates a corresponding Debit transaction.</summary>
public interface IExpenseService
{
    /// <summary>Create an expense and atomically post a Debit transaction to the ledger. TransCategoryId is auto-derived from ExpenseTypeId for seeded types; must be supplied explicitly for custom types.</summary>
    Task<Response<ExpenseDto>> CreateAsync(CreateExpenseDto model, int userId);
    /// <summary>Get expense by ID. Admin can access any expense; non-admins only their own.</summary>
    Task<Response<ExpenseDto>> GetByIdAsync(int id, int userId, bool isAdmin);
    /// <summary>Get all expenses paginated. Admin sees all; non-admins see only their own expenses.</summary>
    Task<Response<PagedList<ExpenseDto>>> GetAllPaginatedAsync(int page, int pageSize, int userId, bool isAdmin);
    /// <summary>Filter expenses by type, mode, and date range. Admin sees all matches; non-admins see only their own. Unpaginated — for PDF/export.</summary>
    Task<Response<List<ExpenseDto>>> GetFilteredAsync(int? expenseTypeId, int? modeId, DateOnly? dateFrom, DateOnly? dateTo, int userId, bool isAdmin);
    /// <summary>Update amount, mode, date, and notes. Admin can update any expense; non-admins only their own. Atomically updates the linked Transaction. TransCategoryId cannot be changed — delete and re-create to reclassify.</summary>
    Task<Response<ExpenseDto>> UpdateByIdAsync(int id, UpdateExpenseDto model, int userId, bool isAdmin);
    /// <summary>Hard delete an expense and its linked Transaction. Admin only.</summary>
    Task<Response> DeleteByIdAsync(int id);
}

public class ExpenseService : IExpenseService
{
    private readonly ApplicationDbContext _db;
    private readonly INotificationService _notification;

    private const int TransTypeDebit = 1;

    // Auto-derive TransCategoryId from seeded ExpenseTypeId values.
    // Office Expenses (1) → Office Expenses category (3)
    // Home Expenses (2) → Home Expenses category (4)
    private static readonly Dictionary<int, int> ExpenseTypeToCategoryMap = new()
    {
        { 1, 3 },
        { 2, 4 }
    };

    public ExpenseService(ApplicationDbContext db, INotificationService notification)
    {
        _db = db;
        _notification = notification;
    }

    public async Task<Response<ExpenseDto>> CreateAsync(CreateExpenseDto model, int userId)
    {
        // 1. Verify ExpenseTypeId exists
        var expenseType = await _db.ExpenseTypes.FindAsync(model.ExpenseTypeId);
        if (expenseType is null)
            return Response<ExpenseDto>.ErrorResponse("Not found", "Expense type not found.");

        // 2. Derive TransCategoryId
        int transCategoryId;
        if (model.TransCategoryId.HasValue)
        {
            var catExists = await _db.TransCategories.AnyAsync(c => c.Id == model.TransCategoryId.Value);
            if (!catExists)
                return Response<ExpenseDto>.ErrorResponse("Not found", "Transaction category not found.");
            transCategoryId = model.TransCategoryId.Value;
        }
        else if (ExpenseTypeToCategoryMap.TryGetValue(model.ExpenseTypeId, out var derived))
        {
            transCategoryId = derived;
        }
        else
        {
            return Response<ExpenseDto>.ErrorResponse("Validation failed",
                "This expense type has no default category mapping. Please provide TransCategoryId explicitly.");
        }

        var hijriOffset = (await _db.SystemSettings.AsNoTracking().FirstOrDefaultAsync())?.HijriOffsetDays ?? 0;
        var expenseDateHijri = string.IsNullOrWhiteSpace(model.ExpenseDateHijri)
            ? HijriDateHelper.ToHijriString(model.ExpenseDate, hijriOffset)
            : model.ExpenseDateHijri;

        using var txn = await _db.Database.BeginTransactionAsync();
        try
        {
            // 3. Create linked Transaction
            var transaction = new Transaction
            {
                ClientId = null,
                ProductId = null,
                UserId = userId,
                OrderId = null,
                PurchaseId = null,
                TransTypeId = TransTypeDebit,
                TransModeId = model.TransModeId,
                TransCategoryId = transCategoryId,
                Amount = model.Amount,
                TransDate = model.ExpenseDate,
                TransDateHijri = expenseDateHijri,
                Notes = $"Expense: {model.Notes}",
                CreatedAt = DateOnly.FromDateTime(DateTime.UtcNow)
            };
            _db.Transactions.Add(transaction);
            await _db.SaveChangesAsync();

            // 4. Create Expense linked to Transaction
            var expense = new Expense
            {
                ExpenseTypeId = model.ExpenseTypeId,
                Amount = model.Amount,
                TransModeId = model.TransModeId,
                UserId = userId,
                TransCategoryId = transCategoryId,
                TransactionId = transaction.Id,
                ExpenseDate = model.ExpenseDate,
                ExpenseDateHijri = expenseDateHijri,
                Notes = model.Notes,
                CreatedAt = DateOnly.FromDateTime(DateTime.UtcNow)
            };
            _db.Expenses.Add(expense);
            await _db.SaveChangesAsync();

            await txn.CommitAsync();

            try { await _notification.CreateAsync(new CreateNotificationDto
            {
                UserId = userId,
                Type = "expense_approved",
                Title = "Expense Recorded",
                Body = $"PKR {model.Amount:F2} expense recorded ({expenseType.Name ?? "Expense"})",
                EntityId = expense.Id
            }); } catch { }

            return await GetByIdAsync(expense.Id, userId, false);
        }
        catch
        {
            await txn.RollbackAsync();
            throw;
        }
    }

    public async Task<Response<ExpenseDto>> GetByIdAsync(int id, int userId, bool isAdmin)
    {
        var expense = await ExpenseQueryWithIncludes()
            .FirstOrDefaultAsync(e => e.Id == id);

        if (expense is null)
            return Response<ExpenseDto>.ErrorResponse("Not found", $"Expense with ID '{id}' was not found.");

        if (!isAdmin && expense.UserId != userId)
            return Response<ExpenseDto>.ErrorResponse("Not found", $"Expense with ID '{id}' was not found.");

        return Response<ExpenseDto>.SuccessResponse(MapToDto(expense), "Expense fetched.");
    }

    public async Task<Response<PagedList<ExpenseDto>>> GetAllPaginatedAsync(int page, int pageSize, int userId, bool isAdmin)
    {
        var query = ExpenseQueryWithIncludes();
        if (!isAdmin)
            query = query.Where(e => e.UserId == userId);

        var paged = await PagedList<ExpenseDto>.CreateAsync(
            query.Select(e => MapToDto(e)), page, pageSize);

        return Response<PagedList<ExpenseDto>>.SuccessResponse(paged, "Expenses fetched.");
    }

    public async Task<Response<List<ExpenseDto>>> GetFilteredAsync(
        int? expenseTypeId, int? modeId, DateOnly? dateFrom, DateOnly? dateTo, int userId, bool isAdmin)
    {
        var query = ExpenseQueryWithIncludes();
        if (!isAdmin)
            query = query.Where(e => e.UserId == userId);

        if (expenseTypeId.HasValue) query = query.Where(e => e.ExpenseTypeId == expenseTypeId.Value);
        if (modeId.HasValue)        query = query.Where(e => e.TransModeId == modeId.Value);
        if (dateFrom.HasValue)      query = query.Where(e => e.ExpenseDate >= dateFrom.Value);
        if (dateTo.HasValue)        query = query.Where(e => e.ExpenseDate <= dateTo.Value);

        var list = await query.Select(e => MapToDto(e)).ToListAsync();
        return Response<List<ExpenseDto>>.SuccessResponse(list, "Expenses fetched.");
    }

    public async Task<Response<ExpenseDto>> UpdateByIdAsync(int id, UpdateExpenseDto model, int userId, bool isAdmin)
    {
        var expense = await _db.Expenses.FindAsync(id);
        if (expense is null)
            return Response<ExpenseDto>.ErrorResponse("Not found", $"Expense with ID '{id}' was not found.");
        if (!isAdmin && expense.UserId != userId)
            return Response<ExpenseDto>.ErrorResponse("Not found", $"Expense with ID '{id}' was not found.");

        if (expense.TransactionId is null)
            return Response<ExpenseDto>.ErrorResponse("Data integrity error",
                "This expense has no linked transaction. Delete and re-create the expense.");

        var transaction = await _db.Transactions.FindAsync(expense.TransactionId.Value);
        if (transaction is null)
            return Response<ExpenseDto>.ErrorResponse("Data integrity error",
                "The linked transaction for this expense could not be found. Delete and re-create the expense.");

        using var txn = await _db.Database.BeginTransactionAsync();
        try
        {
            expense.Amount = model.Amount;
            expense.TransModeId = model.TransModeId;
            if (model.ExpenseDate.HasValue) expense.ExpenseDate = model.ExpenseDate.Value;
            expense.Notes = model.Notes;

            transaction.Amount = model.Amount;
            transaction.TransModeId = model.TransModeId;
            if (model.ExpenseDate.HasValue) transaction.TransDate = model.ExpenseDate.Value;
            transaction.Notes = $"Expense: {model.Notes}";

            await _db.SaveChangesAsync();
            await txn.CommitAsync();
            return await GetByIdAsync(id, userId, isAdmin);
        }
        catch
        {
            await txn.RollbackAsync();
            throw;
        }
    }

    public async Task<Response> DeleteByIdAsync(int id)
    {
        var expense = await _db.Expenses.FindAsync(id);
        if (expense is null)
            return Response.ErrorResponse("Not found", $"Expense with ID '{id}' was not found.");

        var transactionId = expense.TransactionId;

        using var txn = await _db.Database.BeginTransactionAsync();
        try
        {
            // Remove expense FIRST to drop the FK reference before deleting the transaction.
            // (expenses.transaction_id has OnDelete(Cascade) from Transaction side — deleting
            // Transaction would cascade-delete the Expense automatically, causing EF conflict.)
            _db.Expenses.Remove(expense);
            await _db.SaveChangesAsync();

            if (transactionId.HasValue)
            {
                var transaction = await _db.Transactions.FindAsync(transactionId.Value);
                if (transaction is not null)
                {
                    _db.Transactions.Remove(transaction);
                    await _db.SaveChangesAsync();
                }
            }

            await txn.CommitAsync();
            return Response.SuccessResponse("Expense deleted.");
        }
        catch
        {
            await txn.RollbackAsync();
            throw;
        }
    }

    private IQueryable<Expense> ExpenseQueryWithIncludes() =>
        _db.Expenses
            .Include(e => e.ExpenseType)
            .Include(e => e.TransMode)
            .Include(e => e.User)
            .Include(e => e.TransCategory)
            .OrderByDescending(e => e.ExpenseDate)
            .ThenByDescending(e => e.Id);

    private static ExpenseDto MapToDto(Expense e) => new()
    {
        Id = e.Id,
        ExpenseTypeId = e.ExpenseTypeId,
        ExpenseTypeName = e.ExpenseType?.Name,
        Amount = e.Amount,
        TransModeId = e.TransModeId,
        TransModeName = e.TransMode?.Name,
        UserId = e.UserId,
        RecordedByName = e.User?.Name,
        TransCategoryId = e.TransCategoryId,
        TransCategoryName = e.TransCategory?.Name,
        TransactionId = e.TransactionId,
        ExpenseDate = e.ExpenseDate,
        ExpenseDateHijri = e.ExpenseDateHijri,
        ExpenseDateHijriDisplay = HijriDateHelper.FormatForDisplay(e.ExpenseDateHijri),
        Notes = e.Notes,
        CreatedAt = e.CreatedAt
    };
}

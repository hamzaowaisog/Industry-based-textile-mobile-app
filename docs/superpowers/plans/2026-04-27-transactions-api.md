# Transactions API Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the full Transactions API — a ledger viewer and manual correction tool — following the existing service/controller pattern without touching any of the 4 services that already auto-post to the transactions table.

**Architecture:** Pure API layer. `TransactionService` reads/writes `_db.Transactions` directly. All 4 existing services (Order, Purchase, Payment, Expense) are untouched. Auto-posted transactions (from Order/Purchase/Expense/Payment) are locked for edit/delete — the service returns a descriptive error pointing to the source.

**Tech Stack:** ASP.NET Core 9, EF Core + Pomelo (MySQL 8), FluentValidation, JWT Bearer auth, IronPdf via `IPdfService`

---

## File Map

| Action | File | Purpose |
|---|---|---|
| Create | `Models/TransactionDto.cs` | DTOs: TransactionDto, CreateTransactionDto, UpdateTransactionDto |
| Create | `Services/ViewModel/TransactionViewModel.cs` | Input ViewModels for controller actions |
| Create | `Validation/TransactionValidation.cs` | FluentValidation rules |
| Create | `Services/TransactionService.cs` | ITransactionService interface + TransactionService implementation |
| Modify | `Program.cs` | Register `ITransactionService` as Scoped |
| Modify | `Models/PdfConfig.cs` | Add `Transaction` PDF column config to `EntityPdfConfigs` |
| Create | `Controllers/TransactionController.cs` | 9 endpoints: CRUD + filtered + me + by-client + pdf |

---

## Task 1: DTOs

**Files:**
- Create: `backend/HamzaTex.Api/Models/TransactionDto.cs`

- [ ] **Step 1: Create the file**

```csharp
namespace HamzaTex.Api.Models;

public class TransactionDto
{
    public int Id { get; set; }

    public int? ClientId { get; set; }
    public string? ClientName { get; set; }

    public int? ProductId { get; set; }
    public string? ProductName { get; set; }

    public int? UserId { get; set; }
    public string? UserName { get; set; }

    public int? OrderId { get; set; }
    public int? PurchaseId { get; set; }

    public int? TransTypeId { get; set; }
    public string? TransTypeName { get; set; }

    public int? TransModeId { get; set; }
    public string? TransModeName { get; set; }

    public int? TransCategoryId { get; set; }
    public string? TransCategoryName { get; set; }

    public decimal Amount { get; set; }
    public DateOnly TransDate { get; set; }
    public string? Notes { get; set; }
    public DateTime? CreatedAt { get; set; }

    /// <summary>Derived: "Order #N" | "Purchase #N" | "Expense" | "Payment" | "Manual"</summary>
    public string Source { get; set; } = string.Empty;

    /// <summary>True only for manually-created entries — controls edit/delete eligibility on the frontend.</summary>
    public bool IsManual { get; set; }
}

public class CreateTransactionDto
{
    public decimal Amount { get; set; }
    public int TransCategoryId { get; set; }
    public DateOnly TransDate { get; set; }
    public string? Notes { get; set; }
    public int? ClientId { get; set; }
    public int? TransTypeId { get; set; }
    public int? TransModeId { get; set; }
}

public class UpdateTransactionDto
{
    public decimal Amount { get; set; }
    public int TransCategoryId { get; set; }
    public DateOnly TransDate { get; set; }
    public string? Notes { get; set; }
    public int? ClientId { get; set; }
    public int? TransTypeId { get; set; }
    public int? TransModeId { get; set; }
}
```

- [ ] **Step 2: Build to confirm no errors**

```bash
cd backend/HamzaTex.Api && dotnet build
```
Expected: `Build succeeded.`

- [ ] **Step 3: Commit**

```bash
git add backend/HamzaTex.Api/Models/TransactionDto.cs
git commit -m "feat: add TransactionDto, CreateTransactionDto, UpdateTransactionDto"
```

---

## Task 2: ViewModels

**Files:**
- Create: `backend/HamzaTex.Api/Services/ViewModel/TransactionViewModel.cs`

- [ ] **Step 1: Create the file**

```csharp
namespace HamzaTex.Api.Services.ViewModel;

public class TransactionCreateViewModel
{
    public decimal Amount { get; set; }
    public int TransCategoryId { get; set; }
    public DateOnly TransDate { get; set; }
    public string? Notes { get; set; }
    public int? ClientId { get; set; }
    public int? TransTypeId { get; set; }
    public int? TransModeId { get; set; }
}

public class TransactionUpdateViewModel
{
    public decimal Amount { get; set; }
    public int TransCategoryId { get; set; }
    public DateOnly TransDate { get; set; }
    public string? Notes { get; set; }
    public int? ClientId { get; set; }
    public int? TransTypeId { get; set; }
    public int? TransModeId { get; set; }
}
```

- [ ] **Step 2: Build**

```bash
cd backend/HamzaTex.Api && dotnet build
```
Expected: `Build succeeded.`

- [ ] **Step 3: Commit**

```bash
git add backend/HamzaTex.Api/Services/ViewModel/TransactionViewModel.cs
git commit -m "feat: add TransactionCreateViewModel, TransactionUpdateViewModel"
```

---

## Task 3: Validation

**Files:**
- Create: `backend/HamzaTex.Api/Validation/TransactionValidation.cs`

- [ ] **Step 1: Create the file**

```csharp
using FluentValidation;
using HamzaTex.Api.Services.ViewModel;

namespace HamzaTex.Api.Validation;

public class TransactionCreateViewModelValidation : AbstractValidator<TransactionCreateViewModel>
{
    public TransactionCreateViewModelValidation()
    {
        RuleFor(x => x.Amount)
            .GreaterThan(0).WithMessage("Amount must be greater than 0.");

        RuleFor(x => x.TransCategoryId)
            .GreaterThan(0).WithMessage("TransCategoryId is required.");

        RuleFor(x => x.TransDate)
            .NotEmpty().WithMessage("TransDate is required.");
    }
}

public class TransactionUpdateViewModelValidation : AbstractValidator<TransactionUpdateViewModel>
{
    public TransactionUpdateViewModelValidation()
    {
        RuleFor(x => x.Amount)
            .GreaterThan(0).WithMessage("Amount must be greater than 0.");

        RuleFor(x => x.TransCategoryId)
            .GreaterThan(0).WithMessage("TransCategoryId is required.");

        RuleFor(x => x.TransDate)
            .NotEmpty().WithMessage("TransDate is required.");
    }
}
```

- [ ] **Step 2: Build**

```bash
cd backend/HamzaTex.Api && dotnet build
```
Expected: `Build succeeded.`

- [ ] **Step 3: Commit**

```bash
git add backend/HamzaTex.Api/Validation/TransactionValidation.cs
git commit -m "feat: add FluentValidation rules for TransactionCreateViewModel and TransactionUpdateViewModel"
```

---

## Task 4: Service Layer

**Files:**
- Create: `backend/HamzaTex.Api/Services/TransactionService.cs`

- [ ] **Step 1: Create the file**

```csharp
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

    /// <summary>Get all transactions paginated. Admin only.</summary>
    Task<Response<PagedList<TransactionDto>>> GetAllPaginatedAsync(int page, int pageSize);

    /// <summary>Get transactions for the current user (for /me endpoint).</summary>
    Task<Response<List<TransactionDto>>> GetAllByUserIdAsync(int userId);

    /// <summary>Get all transactions for a client. Staff: ownership check applied.</summary>
    Task<Response<List<TransactionDto>>> GetAllByClientIdAsync(int clientId, int userId, bool isAdmin);

    /// <summary>Filter transactions by any combination of typeId, categoryId, modeId, clientId, dateFrom, dateTo.</summary>
    Task<Response<List<TransactionDto>>> GetFilteredAsync(int? typeId, int? categoryId, int? modeId, int? clientId, DateOnly? dateFrom, DateOnly? dateTo);

    /// <summary>Get all transactions (non-paginated) for PDF export.</summary>
    Task<Response<List<TransactionDto>>> GetAllAsync();

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
            CreatedAt       = DateTime.UtcNow
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

    public async Task<Response<PagedList<TransactionDto>>> GetAllPaginatedAsync(int page, int pageSize)
    {
        var query = WithIncludes(_db.Transactions.AsNoTracking())
            .OrderByDescending(t => t.TransDate)
            .ThenByDescending(t => t.Id);

        var paged = await PagedList<TransactionDto>.CreateAsync(
            query.Select(t => ToDto(t)), page, pageSize);

        return Response<PagedList<TransactionDto>>.SuccessResponse(paged, "Transactions fetched.");
    }

    public async Task<Response<List<TransactionDto>>> GetAllByUserIdAsync(int userId)
    {
        var list = await WithIncludes(_db.Transactions.AsNoTracking())
            .Where(t => t.UserId == userId)
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
        DateOnly? dateFrom, DateOnly? dateTo)
    {
        var query = WithIncludes(_db.Transactions.AsNoTracking());

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

    public async Task<Response<List<TransactionDto>>> GetAllAsync()
    {
        var list = await WithIncludes(_db.Transactions.AsNoTracking())
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
```

- [ ] **Step 2: Build**

```bash
cd backend/HamzaTex.Api && dotnet build
```
Expected: `Build succeeded.`

- [ ] **Step 3: Commit**

```bash
git add backend/HamzaTex.Api/Services/TransactionService.cs
git commit -m "feat: add ITransactionService and TransactionService"
```

---

## Task 5: Register Service + PDF Config

**Files:**
- Modify: `backend/HamzaTex.Api/Program.cs`
- Modify: `backend/HamzaTex.Api/Models/PdfConfig.cs`

- [ ] **Step 1: Register in Program.cs**

Find the block where other services are registered (near `builder.Services.AddScoped<IExpenseService, ExpenseService>()`). Add:

```csharp
builder.Services.AddScoped<ITransactionService, TransactionService>();
```

- [ ] **Step 2: Add Transaction PDF config to PdfConfig.cs**

Open `Models/PdfConfig.cs`. Inside `EntityPdfConfigs`, add after the last existing config:

```csharp
public static readonly PdfColumnConfig[] Transaction = [
    PdfColumnConfig.Create("Id", "Transaction #"),
    PdfColumnConfig.Create("Source", "Source"),
    PdfColumnConfig.Create("TransCategoryName", "Category"),
    PdfColumnConfig.Create("TransTypeName", "Type"),
    PdfColumnConfig.Create("TransModeName", "Mode"),
    PdfColumnConfig.Create("Amount", "Amount (PKR)", PdfColumnFormat.Currency),
    PdfColumnConfig.Create("TransDate", "Date", PdfColumnFormat.Date),
    PdfColumnConfig.Create("ClientName", "Client"),
    PdfColumnConfig.Create("Notes", "Notes"),
];
```

- [ ] **Step 3: Build**

```bash
cd backend/HamzaTex.Api && dotnet build
```
Expected: `Build succeeded.`

- [ ] **Step 4: Commit**

```bash
git add backend/HamzaTex.Api/Program.cs backend/HamzaTex.Api/Models/PdfConfig.cs
git commit -m "feat: register ITransactionService and add Transaction PDF column config"
```

---

## Task 6: Controller

**Files:**
- Create: `backend/HamzaTex.Api/Controllers/TransactionController.cs`

- [ ] **Step 1: Create the file**

```csharp
using System.Security.Claims;
using HamzaTex.Api.Helpers;
using HamzaTex.Api.Models;
using HamzaTex.Api.Services;
using HamzaTex.Api.Services.ViewModel;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HamzaTex.Api.Controllers;

/// <summary>Ledger viewer and manual correction tool for the transactions table.</summary>
[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
public class TransactionController : BaseController
{
    private readonly ITransactionService _transactionService;
    private readonly IPdfService _pdfService;

    public TransactionController(ITransactionService transactionService, IPdfService pdfService)
    {
        _transactionService = transactionService;
        _pdfService = pdfService;
    }

    private int? GetUserId()
    {
        var claim = User.FindFirst(ClaimTypes.NameIdentifier);
        return claim is not null && int.TryParse(claim.Value, out var id) ? id : null;
    }

    private bool IsAdmin()
    {
        var roleId = User.FindFirst("RoleId")?.Value;
        return roleId == "1";
    }

    // ── Write ─────────────────────────────────────────────────────────────────

    /// <summary>Create a manual ledger entry. Defaults TransTypeId=1 (Debit) and TransModeId=1 (Cash) if omitted.</summary>
    [HttpPost]
    [Authorize(Policy = "AdminOnly")]
    [ProducesResponseType(typeof(Response<TransactionDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(Response), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Create([FromBody] TransactionCreateViewModel model)
    {
        if (!ModelState.IsValid)
            return ToValidationResponseFromModelState<TransactionDto>();

        var userId = GetUserId();
        if (userId is null) return Unauthorized();

        var dto = new CreateTransactionDto
        {
            Amount          = model.Amount,
            TransCategoryId = model.TransCategoryId,
            TransDate       = model.TransDate,
            Notes           = model.Notes,
            ClientId        = model.ClientId,
            TransTypeId     = model.TransTypeId,
            TransModeId     = model.TransModeId,
        };

        return ToActionResult(await _transactionService.CreateAsync(dto, userId.Value));
    }

    /// <summary>Update a manually-created transaction. Returns an error if the transaction was auto-posted by an Order, Purchase, Expense, or Payment.</summary>
    [HttpPut("{id:int}")]
    [Authorize(Policy = "AdminOnly")]
    [ProducesResponseType(typeof(Response<TransactionDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(Response), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(Response), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Update([FromRoute] int id, [FromBody] TransactionUpdateViewModel model)
    {
        if (!ModelState.IsValid)
            return ToValidationResponseFromModelState<TransactionDto>();

        var dto = new UpdateTransactionDto
        {
            Amount          = model.Amount,
            TransCategoryId = model.TransCategoryId,
            TransDate       = model.TransDate,
            Notes           = model.Notes,
            ClientId        = model.ClientId,
            TransTypeId     = model.TransTypeId,
            TransModeId     = model.TransModeId,
        };

        return ToActionResult(await _transactionService.UpdateByIdAsync(id, dto));
    }

    /// <summary>Delete a manually-created transaction. Returns an error if the transaction was auto-posted.</summary>
    [HttpDelete("{id:int}")]
    [Authorize(Policy = "AdminOnly")]
    [ProducesResponseType(typeof(Response), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(Response), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(Response), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete([FromRoute] int id)
    {
        return ToActionResult(await _transactionService.DeleteByIdAsync(id));
    }

    // ── Read ──────────────────────────────────────────────────────────────────

    /// <summary>Get all transactions paginated. Admin only.</summary>
    [HttpGet]
    [Authorize(Policy = "AdminOnly")]
    [ProducesResponseType(typeof(Response<PagedList<TransactionDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAll([FromQuery] int page = 1, [FromQuery] int pageSize = 20)
    {
        return ToActionResult(await _transactionService.GetAllPaginatedAsync(page, pageSize));
    }

    /// <summary>Get transactions for the currently logged-in user.</summary>
    [HttpGet("me")]
    [Authorize(Policy = "Authenticated")]
    [ProducesResponseType(typeof(Response<List<TransactionDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetMe()
    {
        var userId = GetUserId();
        if (userId is null) return Unauthorized();

        return ToActionResult(await _transactionService.GetAllByUserIdAsync(userId.Value));
    }

    /// <summary>Get a transaction by ID. Staff can only access their own records.</summary>
    [HttpGet("{id:int}")]
    [Authorize(Policy = "AdminOrStaff")]
    [ProducesResponseType(typeof(Response<TransactionDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(Response), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById([FromRoute] int id)
    {
        var userId = GetUserId();
        if (userId is null) return Unauthorized();

        return ToActionResult(await _transactionService.GetByIdAsync(id, userId.Value, IsAdmin()));
    }

    /// <summary>Get all transactions for a specific client. Staff: only if they own the client.</summary>
    [HttpGet("by-client/{clientId:int}")]
    [Authorize(Policy = "AdminOrStaff")]
    [ProducesResponseType(typeof(Response<List<TransactionDto>>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(Response), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetByClient([FromRoute] int clientId)
    {
        var userId = GetUserId();
        if (userId is null) return Unauthorized();

        return ToActionResult(await _transactionService.GetAllByClientIdAsync(clientId, userId.Value, IsAdmin()));
    }

    /// <summary>Filter transactions by typeId, categoryId, modeId, clientId, dateFrom, dateTo. Admin only.</summary>
    [HttpGet("filtered")]
    [Authorize(Policy = "AdminOnly")]
    [ProducesResponseType(typeof(Response<List<TransactionDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetFiltered(
        [FromQuery] int? typeId,
        [FromQuery] int? categoryId,
        [FromQuery] int? modeId,
        [FromQuery] int? clientId,
        [FromQuery] DateOnly? dateFrom,
        [FromQuery] DateOnly? dateTo)
    {
        return ToActionResult(await _transactionService.GetFilteredAsync(
            typeId, categoryId, modeId, clientId, dateFrom, dateTo));
    }

    /// <summary>Export all transactions as PDF. Admin only.</summary>
    [HttpGet("pdf")]
    [Authorize(Policy = "AdminOnly")]
    [ProducesResponseType(typeof(FileContentResult), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetPdf()
    {
        var result = await _transactionService.GetAllAsync();
        if (!result.Success || result.Data is null)
            return BadRequest(result.Message);

        var pdf = _pdfService.CreatePdf(
            "Transactions", "Full ledger. All amounts in PKR.", result.Data, EntityPdfConfigs.Transaction);
        return File(pdf, "application/pdf", "transactions.pdf");
    }
}
```

- [ ] **Step 2: Build**

```bash
cd backend/HamzaTex.Api && dotnet build
```
Expected: `Build succeeded.`

- [ ] **Step 3: Commit**

```bash
git add backend/HamzaTex.Api/Controllers/TransactionController.cs
git commit -m "feat: add TransactionController with full CRUD, filtered, me, by-client, and pdf endpoints"
```

---

## Task 7: Smoke Test via Swagger

- [ ] **Step 1: Run the API**

```bash
cd backend/HamzaTex.Api && dotnet run
```

Open `http://localhost:5000/swagger`

- [ ] **Step 2: Login as Admin**

`POST /api/Auth/login` → copy the `accessToken`

- [ ] **Step 3: Test manual create**

`POST /api/Transaction` with:
```json
{
  "amount": 5000,
  "transCategoryId": 3,
  "transDate": "2026-04-27",
  "notes": "Office supplies adjustment"
}
```
Expected: `200 OK` with `IsManual: true`, `Source: "Manual"`, `TransTypeName: "Debit"`, `TransModeName: "Cash"`

- [ ] **Step 4: Test get all paginated**

`GET /api/Transaction?page=1&pageSize=20`  
Expected: `200 OK` with `Items` array. Existing auto-posted rows will have `IsManual: false` and a non-"Manual" Source.

- [ ] **Step 5: Test /me endpoint**

`GET /api/Transaction/me`  
Expected: Only transactions where `UserId` matches the logged-in admin.

- [ ] **Step 6: Test filtered**

`GET /api/Transaction/filtered?categoryId=1`  
Expected: Only Sales transactions (TransCategoryId=1).

- [ ] **Step 7: Test update on auto-posted transaction**

Pick an auto-posted transaction ID (Source != "Manual"). `PUT /api/Transaction/{id}` with valid body.  
Expected: `400` with message like `"This transaction was posted by Order #N. Edit the Order instead."`

- [ ] **Step 8: Test update on manual transaction**

`PUT /api/Transaction/{id}` using the ID from Step 3.  
Expected: `200 OK` with updated values.

- [ ] **Step 9: Test delete on auto-posted transaction**

`DELETE /api/Transaction/{auto-posted-id}`  
Expected: `400` with lock reason message.

- [ ] **Step 10: Test delete on manual transaction**

`DELETE /api/Transaction/{manual-id}`  
Expected: `200 OK` with `"Transaction deleted."`

- [ ] **Step 11: Test PDF**

`GET /api/Transaction/pdf`  
Expected: PDF file downloads with all transactions.

- [ ] **Step 12: Login as Staff and test /me**

`GET /api/Transaction/me` with staff token  
Expected: Only staff's own transactions.

- [ ] **Step 13: Test staff accessing full list (should fail)**

`GET /api/Transaction` with staff token  
Expected: `403 Forbidden`

- [ ] **Step 14: Final commit**

```bash
git add .
git commit -m "feat: Transactions API complete — ledger viewer with manual correction support"
```

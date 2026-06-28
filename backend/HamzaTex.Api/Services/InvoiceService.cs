using HamzaTex.Api.Data;
using HamzaTex.Api.Entities;
using HamzaTex.Api.Helpers;
using HamzaTex.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace HamzaTex.Api.Services;

/// <summary>Invoice management — auto-generation, lifecycle, rich query, and PDF support.</summary>
public interface IInvoiceService
{
    /// <summary>Create a standalone invoice (no linked Order/Purchase). Staff or Admin.</summary>
    Task<Response<InvoiceDto>> CreateAsync(CreateInvoiceDto model, int userId);
    /// <summary>Get full invoice detail by ID including lines and linked transactions.</summary>
    Task<Response<InvoiceDetailDto>> GetByIdAsync(int id);
    /// <summary>Get all invoices paginated with rich data.</summary>
    Task<Response<PagedList<InvoiceDto>>> GetAllPaginatedAsync(int page, int pageSize);
    /// <summary>Get all invoices for a client with aggregate stats.</summary>
    Task<Response<InvoiceByClientDto>> GetAllByClientIdAsync(int clientId);
    /// <summary>Filter invoices by statusId, clientId, dateFrom, dateTo.</summary>
    Task<Response<List<InvoiceDto>>> GetFilteredAsync(int? statusId, int? clientId, DateOnly? dateFrom, DateOnly? dateTo);
    /// <summary>Update invoice status, dueDate, notes, totalAmount, and/or lines.</summary>
    Task<Response<InvoiceDto>> UpdateByIdAsync(int id, UpdateInvoiceDto model);
    /// <summary>Delete invoice. Only allowed for Draft status within 1 year of creation.</summary>
    Task<Response> DeleteByIdAsync(int id);
    /// <summary>Auto-create a Draft invoice from a newly created Order. Called by OrderService.</summary>
    Task<InvoiceDto?> CreateFromOrderAsync(int orderId, int userId);
    /// <summary>Auto-create a Draft invoice from a newly created Purchase. Called by PurchaseService.</summary>
    Task<InvoiceDto?> CreateFromPurchaseAsync(int purchaseId, int userId);
    /// <summary>Transition invoice to Issued and stamp IssueDate. Called when Order/Purchase → Delivered.</summary>
    Task UpdateStatusOnDeliveryAsync(int? orderId, int? purchaseId);
    /// <summary>Transition invoice to Cancelled. Called when Order/Purchase → Cancelled.</summary>
    Task CancelByOrderOrPurchaseAsync(int? orderId, int? purchaseId);
    /// <summary>Flip invoice to Paid if total allocations >= TotalAmount. Called by PaymentService.</summary>
    Task TryMarkPaidAsync(int invoiceId);
    /// <summary>Generate the next invoice number for the current year (INV-YYYY-NNNN).</summary>
    Task<string> GenerateInvoiceNumberAsync();
}

public class InvoiceService : IInvoiceService
{
    private readonly ApplicationDbContext _db;
    private readonly INotificationService _notification;

    private const int StatusDraft     = 1;
    private const int StatusIssued    = 2;
    private const int StatusPaid      = 3;
    private const int StatusCancelled = 4;

    public InvoiceService(ApplicationDbContext db, INotificationService notification)
    {
        _db = db;
        _notification = notification;
    }

    // ── Number generation ────────────────────────────────────────────────────

    public async Task<string> GenerateInvoiceNumberAsync()
    {
        var year = DateTime.UtcNow.Year;
        var prefix = $"INV-{year}-";

        var lastNumber = await _db.Invoices.AsNoTracking()
            .Where(i => i.InvoiceNumber.StartsWith(prefix))
            .OrderByDescending(i => i.InvoiceNumber)
            .Select(i => i.InvoiceNumber)
            .FirstOrDefaultAsync();

        var seq = 1;
        if (lastNumber is not null)
        {
            var parts = lastNumber.Split('-');
            if (parts.Length == 3 && int.TryParse(parts[2], out var last))
                seq = last + 1;
        }

        return $"{prefix}{seq:D4}";
    }

    // ── Create (standalone) ──────────────────────────────────────────────────

    public async Task<Response<InvoiceDto>> CreateAsync(CreateInvoiceDto model, int userId)
    {
        if (model.OrderId is not null && model.PurchaseId is not null)
            return Response<InvoiceDto>.ErrorResponse("Validation failed", "Cannot link to both Order and Purchase.");

        var client = await _db.Clients.FirstOrDefaultAsync(c => c.Id == model.ClientId);
        if (client is null)
            return Response<InvoiceDto>.ErrorResponse("Not found", "Client not found.");

        var number = await GenerateInvoiceNumberAsync();

        var invoice = new Invoice
        {
            InvoiceNumber   = number,
            OrderId         = model.OrderId,
            PurchaseId      = model.PurchaseId,
            ClientId        = model.ClientId,
            InvoiceStatusId = StatusDraft,
            IssueDate       = DateOnly.FromDateTime(DateTime.UtcNow),
            DueDate         = model.DueDate,
            TotalAmount     = model.TotalAmount,
            Notes           = model.Notes,
            CreatedByUserId = userId,
            CreatedAt       = DateOnly.FromDateTime(DateTime.UtcNow),
        };

        foreach (var l in model.Lines)
        {
            invoice.InvoiceLines.Add(new InvoiceLine
            {
                ProductName = l.ProductName,
                Qty         = l.Qty,
                UnitPrice   = l.UnitPrice,
                LineTotal   = l.Qty * l.UnitPrice
            });
        }

        await _db.Invoices.AddAsync(invoice);
        await _db.SaveChangesAsync();

        var saved = await LoadInvoiceWithIncludes(invoice.Id);
        return Response<InvoiceDto>.SuccessResponse(ToDto(saved!), "Invoice created.");
    }

    // ── Auto-create from Order ───────────────────────────────────────────────

    public async Task<InvoiceDto?> CreateFromOrderAsync(int orderId, int userId)
    {
        var order = await _db.Orders
            .Include(o => o.OrderLines).ThenInclude(l => l.Product)
            .FirstOrDefaultAsync(o => o.Id == orderId);

        if (order is null) return null;

        var number = await GenerateInvoiceNumberAsync();
        var total  = order.OrderLines.Sum(l => l.Qty * l.UnitPrice);

        var invoice = new Invoice
        {
            InvoiceNumber   = number,
            OrderId         = orderId,
            ClientId        = order.ClientId ?? 0,
            InvoiceStatusId = StatusDraft,
            IssueDate       = DateOnly.FromDateTime(DateTime.UtcNow),
            TotalAmount     = total,
            CreatedByUserId = userId,
            CreatedAt       = DateOnly.FromDateTime(DateTime.UtcNow),
        };

        foreach (var l in order.OrderLines)
        {
            invoice.InvoiceLines.Add(new InvoiceLine
            {
                ProductName = l.Product?.Name ?? $"Product #{l.ProductId}",
                Qty         = l.Qty,
                UnitPrice   = l.UnitPrice,
                LineTotal   = l.Qty * l.UnitPrice
            });
        }

        await _db.Invoices.AddAsync(invoice);
        await _db.SaveChangesAsync();

        var saved = await LoadInvoiceWithIncludes(invoice.Id);
        return saved is not null ? ToDto(saved) : null;
    }

    // ── Auto-create from Purchase ────────────────────────────────────────────

    public async Task<InvoiceDto?> CreateFromPurchaseAsync(int purchaseId, int userId)
    {
        var purchase = await _db.Purchases
            .Include(p => p.PurchaseLines).ThenInclude(l => l.Product)
            .FirstOrDefaultAsync(p => p.Id == purchaseId);

        if (purchase is null) return null;

        var number = await GenerateInvoiceNumberAsync();
        var total  = purchase.PurchaseLines.Sum(l => l.Qty * l.UnitCost);

        var invoice = new Invoice
        {
            InvoiceNumber   = number,
            PurchaseId      = purchaseId,
            ClientId        = purchase.SupplierId ?? 0,
            InvoiceStatusId = StatusDraft,
            IssueDate       = DateOnly.FromDateTime(DateTime.UtcNow),
            TotalAmount     = total,
            CreatedByUserId = userId,
            CreatedAt       = DateOnly.FromDateTime(DateTime.UtcNow),
        };

        foreach (var l in purchase.PurchaseLines)
        {
            invoice.InvoiceLines.Add(new InvoiceLine
            {
                ProductName = l.Product?.Name ?? $"Product #{l.ProductId}",
                Qty         = l.Qty,
                UnitPrice   = l.UnitCost,
                LineTotal   = l.Qty * l.UnitCost
            });
        }

        await _db.Invoices.AddAsync(invoice);
        await _db.SaveChangesAsync();

        var saved = await LoadInvoiceWithIncludes(invoice.Id);
        return saved is not null ? ToDto(saved) : null;
    }

    // ── Lifecycle: Delivered / Cancelled ────────────────────────────────────

    public async Task UpdateStatusOnDeliveryAsync(int? orderId, int? purchaseId)
    {
        var invoice = await FindByOrderOrPurchaseAsync(orderId, purchaseId);
        if (invoice is null) return;

        invoice.InvoiceStatusId = StatusIssued;
        invoice.IssueDate       = DateOnly.FromDateTime(DateTime.UtcNow);
        await _db.SaveChangesAsync();

        // Link all related transactions to this invoice
        if (orderId.HasValue)
        {
            var txns = await _db.Transactions.Where(t => t.OrderId == orderId).ToListAsync();
            foreach (var t in txns) t.InvoiceId = invoice.Id;
        }
        else if (purchaseId.HasValue)
        {
            var txns = await _db.Transactions.Where(t => t.PurchaseId == purchaseId).ToListAsync();
            foreach (var t in txns) t.InvoiceId = invoice.Id;
        }

        await _db.SaveChangesAsync();
    }

    public async Task CancelByOrderOrPurchaseAsync(int? orderId, int? purchaseId)
    {
        var invoice = await FindByOrderOrPurchaseAsync(orderId, purchaseId);
        if (invoice is null) return;

        invoice.InvoiceStatusId = StatusCancelled;
        await _db.SaveChangesAsync();
    }

    public async Task TryMarkPaidAsync(int invoiceId)
    {
        var invoice = await _db.Invoices.FirstOrDefaultAsync(i => i.Id == invoiceId);
        if (invoice is null || invoice.InvoiceStatusId == StatusPaid) return;

        var totalPaid = await _db.PaymentAllocations.AsNoTracking()
            .Where(a => a.InvoiceId == invoiceId && !a.Payment.IsReversed)
            .SumAsync(a => a.AllocatedAmount);

        if (totalPaid >= invoice.TotalAmount)
        {
            invoice.InvoiceStatusId = StatusPaid;
            await _db.SaveChangesAsync();
            if (invoice.CreatedByUserId.HasValue)
            {
                try { await _notification.CreateAsync(new CreateNotificationDto
                {
                    UserId = invoice.CreatedByUserId.Value,
                    Type = "invoice_paid",
                    Title = "Invoice Fully Paid",
                    Body = $"Invoice {invoice.InvoiceNumber} has been fully paid (PKR {invoice.TotalAmount:F2})",
                    EntityId = invoice.Id
                }); } catch { }
            }
        }
    }

    // ── Read ─────────────────────────────────────────────────────────────────

    public async Task<Response<InvoiceDetailDto>> GetByIdAsync(int id)
    {
        var invoice = await LoadInvoiceWithIncludes(id);
        if (invoice is null)
            return Response<InvoiceDetailDto>.ErrorResponse("Not found", $"Invoice '{id}' not found.");

        return Response<InvoiceDetailDto>.SuccessResponse(ToDetailDto(invoice), "Invoice fetched.");
    }

    public async Task<Response<PagedList<InvoiceDto>>> GetAllPaginatedAsync(int page, int pageSize)
    {
        var query = InvoiceQueryWithIncludes().OrderByDescending(i => i.CreatedAt);
        var paged = await PagedList<Invoice>.CreateAsync(query, page, pageSize);
        var pagedList = new PagedList<InvoiceDto>(paged.Items.Select(i => ToDto(i)).ToList(), paged.Page, paged.PageSize, paged.TotalCount);
        return Response<PagedList<InvoiceDto>>.SuccessResponse(pagedList, "Invoices fetched.");
    }

    public async Task<Response<InvoiceByClientDto>> GetAllByClientIdAsync(int clientId)
    {
        var client = await _db.Clients.Include(c => c.ClientType).FirstOrDefaultAsync(c => c.Id == clientId);
        if (client is null)
            return Response<InvoiceByClientDto>.ErrorResponse("Not found", "Client not found.");

        var invoices = await InvoiceQueryWithIncludes()
            .Where(i => i.ClientId == clientId)
            .OrderByDescending(i => i.CreatedAt)
            .ToListAsync();

        var dtos           = invoices.Select(i => ToDto(i)).ToList();
        var totalPaid      = dtos.Sum(d => d.AmountPaid);
        var totalAmount    = dtos.Sum(d => d.TotalAmount);
        var outstanding    = totalAmount - totalPaid;
        var clientTypeName = client.ClientType?.Name ?? "Unknown";
        var direction      = client.ClientTypeId == 2 ? "Payable" : "Receivable";

        return Response<InvoiceByClientDto>.SuccessResponse(new InvoiceByClientDto
        {
            ClientId         = clientId,
            ClientName       = client.Name ?? string.Empty,
            ClientTypeName   = clientTypeName,
            Direction        = direction,
            TotalInvoiced    = totalAmount,
            TotalPaid        = totalPaid,
            TotalReceivable  = direction == "Receivable" ? outstanding : 0,
            TotalPayable     = direction == "Payable" ? outstanding : 0,
            Invoices         = dtos,
        }, "Client invoices fetched.");
    }

    public async Task<Response<List<InvoiceDto>>> GetFilteredAsync(
        int? statusId, int? clientId, DateOnly? dateFrom, DateOnly? dateTo)
    {
        var query = InvoiceQueryWithIncludes();

        if (statusId.HasValue)   query = query.Where(i => i.InvoiceStatusId == statusId.Value);
        if (clientId.HasValue)   query = query.Where(i => i.ClientId == clientId.Value);
        if (dateFrom.HasValue)   query = query.Where(i => i.CreatedAt >= dateFrom.Value);
        if (dateTo.HasValue)     query = query.Where(i => i.CreatedAt <= dateTo.Value);

        var result = await query.OrderByDescending(i => i.CreatedAt).ToListAsync();
        return Response<List<InvoiceDto>>.SuccessResponse(result.Select(i => ToDto(i)).ToList(), "Filtered invoices fetched.");
    }

    // ── Update / Delete ──────────────────────────────────────────────────────

    public async Task<Response<InvoiceDto>> UpdateByIdAsync(int id, UpdateInvoiceDto model)
    {
        var invoice = await _db.Invoices.Include(i => i.InvoiceLines).FirstOrDefaultAsync(i => i.Id == id);
        if (invoice is null)
            return Response<InvoiceDto>.ErrorResponse("Not found", $"Invoice '{id}' not found.");

        if (model.InvoiceStatusId.HasValue)
        {
            var wasIssued = invoice.InvoiceStatusId == StatusIssued;
            invoice.InvoiceStatusId = model.InvoiceStatusId.Value;
            if (model.InvoiceStatusId.Value == StatusIssued && invoice.IssueDate is null)
                invoice.IssueDate = DateOnly.FromDateTime(DateTime.UtcNow);
            if (model.InvoiceStatusId.Value == StatusIssued && !wasIssued && invoice.CreatedByUserId.HasValue)
            {
                try { await _notification.CreateAsync(new CreateNotificationDto
                {
                    UserId = invoice.CreatedByUserId.Value,
                    Type = "invoice_issued",
                    Title = "Invoice Issued",
                    Body = $"Invoice {invoice.InvoiceNumber} issued for PKR {invoice.TotalAmount:F2}",
                    EntityId = invoice.Id
                }); } catch { }
            }
        }
        if (model.DueDate.HasValue)         invoice.DueDate         = model.DueDate.Value;
        if (model.Notes is not null)        invoice.Notes           = model.Notes;
        if (model.TotalAmount.HasValue)     invoice.TotalAmount     = model.TotalAmount.Value;

        if (model.Lines is not null)
        {
            _db.InvoiceLines.RemoveRange(invoice.InvoiceLines);
            foreach (var l in model.Lines)
            {
                invoice.InvoiceLines.Add(new InvoiceLine
                {
                    ProductName = l.ProductName,
                    Qty         = l.Qty,
                    UnitPrice   = l.UnitPrice,
                    LineTotal   = l.Qty * l.UnitPrice
                });
            }
        }

        await _db.SaveChangesAsync();
        var saved = await LoadInvoiceWithIncludes(id);
        return Response<InvoiceDto>.SuccessResponse(ToDto(saved!), "Invoice updated.");
    }

    public async Task<Response> DeleteByIdAsync(int id)
    {
        var invoice = await _db.Invoices.Include(i => i.InvoiceLines).FirstOrDefaultAsync(i => i.Id == id);
        if (invoice is null)
            return Response.ErrorResponse("Not found", $"Invoice '{id}' not found.");

        if (invoice.InvoiceStatusId != StatusDraft)
            return Response.ErrorResponse("Validation failed", "Only Draft invoices can be deleted.");

        var oneYearAgo = DateOnly.FromDateTime(DateTime.UtcNow.AddYears(-1));
        if (invoice.CreatedAt < oneYearAgo)
            return Response.ErrorResponse("Validation failed", "Invoice is older than 1 year and cannot be deleted.");

        _db.InvoiceLines.RemoveRange(invoice.InvoiceLines);
        _db.Invoices.Remove(invoice);
        await _db.SaveChangesAsync();

        return Response.SuccessResponse("Invoice deleted.");
    }

    // ── Private helpers ──────────────────────────────────────────────────────

    private async Task<Invoice?> FindByOrderOrPurchaseAsync(int? orderId, int? purchaseId)
    {
        if (orderId.HasValue)
            return await _db.Invoices.FirstOrDefaultAsync(i => i.OrderId == orderId);
        if (purchaseId.HasValue)
            return await _db.Invoices.FirstOrDefaultAsync(i => i.PurchaseId == purchaseId);
        return null;
    }

    private IQueryable<Invoice> InvoiceQueryWithIncludes() =>
        _db.Invoices.AsNoTracking()
            .Include(i => i.Client).ThenInclude(c => c!.ClientType)
            .Include(i => i.InvoiceStatus)
            .Include(i => i.InvoiceLines)
            .Include(i => i.PaymentAllocations).ThenInclude(a => a.Payment);

    private async Task<Invoice?> LoadInvoiceWithIncludes(int id) =>
        await _db.Invoices
            .Include(i => i.Client).ThenInclude(c => c!.ClientType)
            .Include(i => i.InvoiceStatus)
            .Include(i => i.InvoiceLines)
            .Include(i => i.PaymentAllocations).ThenInclude(a => a.Payment)
            .Include(i => i.Transactions).ThenInclude(t => t.TransCategory)
            .Include(i => i.Transactions).ThenInclude(t => t.TransType)
            .FirstOrDefaultAsync(i => i.Id == id);

    private static decimal ComputeAmountPaid(Invoice i) =>
        i.PaymentAllocations
            .Where(a => !a.Payment.IsReversed)
            .Sum(a => a.AllocatedAmount);

    private static string DeriveType(Invoice i) =>
        i.OrderId.HasValue ? "Order" : i.PurchaseId.HasValue ? "Purchase" : "Standalone";

    private static string DeriveDirection(Invoice i) =>
        i.PurchaseId.HasValue ? "Payable" : "Receivable"; // Order + Standalone = Receivable, Purchase = Payable

    private static InvoiceDto ToDto(Invoice i)
    {
        var paid = ComputeAmountPaid(i);
        return new InvoiceDto
        {
            Id              = i.Id,
            InvoiceNumber   = i.InvoiceNumber,
            OrderId         = i.OrderId,
            PurchaseId      = i.PurchaseId,
            ClientId        = i.ClientId ?? 0,
            ClientName      = i.Client?.Name ?? string.Empty,
            ClientTypeName  = i.Client?.ClientType?.Name ?? "Unknown",
            Direction       = DeriveDirection(i),
            Type            = DeriveType(i),
            InvoiceStatusId = i.InvoiceStatusId,
            StatusName      = i.InvoiceStatus?.Name ?? string.Empty,
            IssueDate       = i.IssueDate,
            DueDate         = i.DueDate,
            TotalAmount     = i.TotalAmount,
            AmountPaid      = paid,
            Outstanding     = i.TotalAmount - paid,
            Notes           = i.Notes,
            CreatedAt       = i.CreatedAt,
        };
    }

    private static InvoiceDetailDto ToDetailDto(Invoice i)
    {
        var dto  = ToDto(i);
        return new InvoiceDetailDto
        {
            Id              = dto.Id,
            InvoiceNumber   = dto.InvoiceNumber,
            OrderId         = dto.OrderId,
            PurchaseId      = dto.PurchaseId,
            ClientId        = dto.ClientId,
            ClientName      = dto.ClientName,
            ClientTypeName  = dto.ClientTypeName,
            Direction       = dto.Direction,
            Type            = dto.Type,
            InvoiceStatusId = dto.InvoiceStatusId,
            StatusName      = dto.StatusName,
            IssueDate       = dto.IssueDate,
            DueDate         = dto.DueDate,
            TotalAmount     = dto.TotalAmount,
            AmountPaid      = dto.AmountPaid,
            Outstanding     = dto.Outstanding,
            Notes           = dto.Notes,
            CreatedAt       = dto.CreatedAt,
            Lines = i.InvoiceLines.Select(l => new InvoiceLineDto
            {
                Id          = l.Id,
                ProductName = l.ProductName,
                Qty         = l.Qty,
                UnitPrice   = l.UnitPrice,
                LineTotal   = l.LineTotal,
            }).ToList(),
            LinkedTransactions = i.Transactions
                .OrderBy(t => t.TransDate)
                .Select(t => new InvoiceTransactionSummary
                {
                    TransactionId = t.Id,
                    TransDate     = t.TransDate,
                    CategoryName  = t.TransCategory?.Name ?? string.Empty,
                    TypeName      = t.TransType?.Name ?? string.Empty,
                    Amount        = t.Amount,
                }).ToList(),
        };
    }
}

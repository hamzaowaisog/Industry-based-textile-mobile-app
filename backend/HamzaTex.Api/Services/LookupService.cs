using HamzaTex.Api.Data;
using HamzaTex.Api.Helpers;
using HamzaTex.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace HamzaTex.Api.Services;

public interface ILookupService
{
    Task<Response<LookupsAllDto>> GetAllAsync();
    Task<Response<List<LookupDto>>> GetByTypeAsync(string type);
    Task<Response<List<LookupDto>>> GetOrderStatusesAsync();
    Task<Response<List<LookupDto>>> GetPurchaseStatusesAsync();
    Task<Response<List<LookupDto>>> GetPaymentTypesAsync();
    Task<Response<List<LookupDto>>> GetPaymentDirectionsAsync();
    Task<Response<List<LookupDto>>> GetTransTypesAsync();
    Task<Response<List<LookupDto>>> GetTransModesAsync();
    Task<Response<List<LookupDto>>> GetTransCategoriesAsync();
    Task<Response<List<LookupDto>>> GetExpenseTypesAsync();
    Task<Response<List<LookupDto>>> GetMovementTypesAsync();
    Task<Response<List<LookupDto>>> GetMovementSourcesAsync();
    Task<Response<List<LookupDto>>> GetClientTypesAsync();
    Task<Response<List<LookupDto>>> GetUserRolesAsync();
    /// <summary>Get all invoice statuses.</summary>
    Task<Response<List<LookupDto>>> GetInvoiceStatusesAsync();
    /// <summary>Get all product units.</summary>
    Task<Response<List<LookupDto>>> GetUnitsAsync();
    /// <summary>Returns the 12 Hijri month names as an ordered lookup list (value 1..12).</summary>
    Task<Response<List<LookupDto>>> GetHijriMonthsAsync();
}

public class LookupService : ILookupService
{
    private readonly ApplicationDbContext _dbContext;

    public LookupService(ApplicationDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<Response<LookupsAllDto>> GetAllAsync()
    {
        // EF Core DbContext is not thread-safe — queries must run sequentially.
        // These are all tiny seeded tables (2–8 rows), so sequential is still fast.
        var result = new LookupsAllDto
        {
            OrderStatuses     = await _dbContext.OrderStatuses.AsNoTracking().Select(x => ToDto(x.Id, x.Name)).ToListAsync(),
            PurchaseStatuses  = await _dbContext.PurchaseStatuses.AsNoTracking().Select(x => ToDto(x.Id, x.Name)).ToListAsync(),
            PaymentTypes      = await _dbContext.PaymentTypes.AsNoTracking().Select(x => ToDto(x.Id, x.Name)).ToListAsync(),
            PaymentDirections = await _dbContext.PaymentDirections.AsNoTracking().Select(x => ToDto(x.Id, x.Name)).ToListAsync(),
            TransTypes        = await _dbContext.TransTypes.AsNoTracking().Select(x => ToDto(x.Id, x.Name)).ToListAsync(),
            TransModes        = await _dbContext.TransModes.AsNoTracking().Select(x => ToDto(x.Id, x.Name)).ToListAsync(),
            TransCategories   = await _dbContext.TransCategories.AsNoTracking().Select(x => ToDto(x.Id, x.Name)).ToListAsync(),
            ExpenseTypes      = await _dbContext.ExpenseTypes.AsNoTracking().Select(x => ToDto(x.Id, x.Name)).ToListAsync(),
            MovementTypes     = await _dbContext.MovementTypes.AsNoTracking().Select(x => ToDto(x.Id, x.Name)).ToListAsync(),
            MovementSources   = await _dbContext.MovementSources.AsNoTracking().Select(x => ToDto(x.Id, x.Name)).ToListAsync(),
            ClientTypes       = await _dbContext.ClientTypes.AsNoTracking().Select(x => ToDto(x.Id, x.Name)).ToListAsync(),
            UserRoles         = await _dbContext.UserRoles.AsNoTracking().Select(x => ToDto(x.Id, x.Name)).ToListAsync(),
            InvoiceStatuses   = await _dbContext.InvoiceStatuses.AsNoTracking().Select(x => ToDto(x.Id, x.Name)).ToListAsync(),
            Units             = await _dbContext.Units.AsNoTracking().Select(x => ToDto(x.Id, x.Name)).ToListAsync(),
        };

        return Response<LookupsAllDto>.SuccessResponse(result, "Lookups fetched successfully.");
    }

    public async Task<Response<List<LookupDto>>> GetByTypeAsync(string type)
    {
        return type.ToLowerInvariant() switch
        {
            "orderstatuses"      or "order-statuses"      => await GetOrderStatusesAsync(),
            "purchasestatuses"   or "purchase-statuses"   => await GetPurchaseStatusesAsync(),
            "paymenttypes"       or "payment-types"       => await GetPaymentTypesAsync(),
            "paymentdirections"  or "payment-directions"  => await GetPaymentDirectionsAsync(),
            "transtypes"         or "trans-types"         => await GetTransTypesAsync(),
            "transmodes"         or "trans-modes"         => await GetTransModesAsync(),
            "transcategories"    or "trans-categories"    => await GetTransCategoriesAsync(),
            "expensetypes"       or "expense-types"       => await GetExpenseTypesAsync(),
            "movementtypes"      or "movement-types"      => await GetMovementTypesAsync(),
            "movementsources"    or "movement-sources"    => await GetMovementSourcesAsync(),
            "clienttypes"        or "client-types"        => await GetClientTypesAsync(),
            "userroles"          or "user-roles"          => await GetUserRolesAsync(),
            "invoicestatuses"    or "invoice-statuses"    => await GetInvoiceStatusesAsync(),
            "units"                                       => await GetUnitsAsync(),
            "hijrimonths"        or "hijri-months"        => await GetHijriMonthsAsync(),
            _ => Response<List<LookupDto>>.ErrorResponse("Invalid type",
                     $"Unknown lookup type '{type}'. Valid values: orderStatuses, paymentTypes, paymentDirections, " +
                     "transTypes, transModes, transCategories, expenseTypes, movementTypes, movementSources, clientTypes, userRoles")
        };
    }

    public async Task<Response<List<LookupDto>>> GetOrderStatusesAsync()
        => Success(await _dbContext.OrderStatuses.AsNoTracking().Select(x => ToDto(x.Id, x.Name)).ToListAsync());

    public async Task<Response<List<LookupDto>>> GetPurchaseStatusesAsync()
        => Success(await _dbContext.PurchaseStatuses.AsNoTracking().Select(x => ToDto(x.Id, x.Name)).ToListAsync());

    public async Task<Response<List<LookupDto>>> GetPaymentTypesAsync()
        => Success(await _dbContext.PaymentTypes.AsNoTracking().Select(x => ToDto(x.Id, x.Name)).ToListAsync());

    public async Task<Response<List<LookupDto>>> GetPaymentDirectionsAsync()
        => Success(await _dbContext.PaymentDirections.AsNoTracking().Select(x => ToDto(x.Id, x.Name)).ToListAsync());

    public async Task<Response<List<LookupDto>>> GetTransTypesAsync()
        => Success(await _dbContext.TransTypes.AsNoTracking().Select(x => ToDto(x.Id, x.Name)).ToListAsync());

    public async Task<Response<List<LookupDto>>> GetTransModesAsync()
        => Success(await _dbContext.TransModes.AsNoTracking().Select(x => ToDto(x.Id, x.Name)).ToListAsync());

    public async Task<Response<List<LookupDto>>> GetTransCategoriesAsync()
        => Success(await _dbContext.TransCategories.AsNoTracking().Select(x => ToDto(x.Id, x.Name)).ToListAsync());

    public async Task<Response<List<LookupDto>>> GetExpenseTypesAsync()
        => Success(await _dbContext.ExpenseTypes.AsNoTracking().Select(x => ToDto(x.Id, x.Name)).ToListAsync());

    public async Task<Response<List<LookupDto>>> GetMovementTypesAsync()
        => Success(await _dbContext.MovementTypes.AsNoTracking().Select(x => ToDto(x.Id, x.Name)).ToListAsync());

    public async Task<Response<List<LookupDto>>> GetMovementSourcesAsync()
        => Success(await _dbContext.MovementSources.AsNoTracking().Select(x => ToDto(x.Id, x.Name)).ToListAsync());

    public async Task<Response<List<LookupDto>>> GetClientTypesAsync()
        => Success(await _dbContext.ClientTypes.AsNoTracking().Select(x => ToDto(x.Id, x.Name)).ToListAsync());

    public async Task<Response<List<LookupDto>>> GetUserRolesAsync()
        => Success(await _dbContext.UserRoles.AsNoTracking().Select(x => ToDto(x.Id, x.Name)).ToListAsync());

    public async Task<Response<List<LookupDto>>> GetInvoiceStatusesAsync()
        => Success(await _dbContext.InvoiceStatuses.AsNoTracking().Select(x => ToDto(x.Id, x.Name)).ToListAsync());

    public async Task<Response<List<LookupDto>>> GetUnitsAsync()
        => Success(await _dbContext.Units.AsNoTracking().Select(x => ToDto(x.Id, x.Name)).ToListAsync());

    public Task<Response<List<LookupDto>>> GetHijriMonthsAsync()
    {
        var months = HijriDateHelper.HijriMonthNames
            .Select((name, index) => new LookupDto { Id = index + 1, Name = name })
            .ToList();

        return Task.FromResult(Response<List<LookupDto>>.SuccessResponse(months, "Hijri months retrieved"));
    }

    // ── Helpers ──────────────────────────────────────────────────────────────

    private static LookupDto ToDto(int id, string? name) => new() { Id = id, Name = name ?? string.Empty };

    private static Response<List<LookupDto>> Success(List<LookupDto> data)
        => Response<List<LookupDto>>.SuccessResponse(data, "Fetched successfully.");
}

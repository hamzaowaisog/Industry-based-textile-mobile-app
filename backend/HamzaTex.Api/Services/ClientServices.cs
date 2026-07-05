using HamzaTex.Api.Data;
using HamzaTex.Api.Entities;
using HamzaTex.Api.Helpers;
using HamzaTex.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace HamzaTex.Api.Services;

/// <summary>CRUD and query operations for clients. Clients with ClientTypeId=2 are Suppliers used in Purchases.</summary>
public interface IClientService
{
    /// <summary>Create a new client linked to a user.</summary>
    Task<Response<ClientDto>> CreateAsync(CreateClientDto model);
    /// <summary>Get a client by ID. Admin sees any client; non-admins see only their own.</summary>
    Task<Response<ClientDto>> GetByIdAsync(int id, int userId, bool isAdmin);
    /// <summary>Get all clients. Admin sees all; non-admins see only their own. Used for PDF export + admin list.</summary>
    Task<Response<List<ClientDto>>> GetAllAsync(int userId, bool isAdmin);
    /// <summary>Update a client by ID. Admin can update any client; non-admins only their own.</summary>
    Task<Response<ClientDto>> UpdateByIdAsync(int id, UpdateClientByIdDto model, bool isAdmin);
    /// <summary>Delete a client by ID.</summary>
    Task<Response> DeleteByIdAsync(int id);
    /// <summary>Get paginated clients. Scoped to the user unless isAdmin, in which case all clients are returned.</summary>
    Task<Response<PagedList<ClientDto>>> GetAllPaginatedAsync(int page, int pageSize, int userId, bool isAdmin);
}

public class ClientService : IClientService
{
    private const int ClientTypeCustomer = 1;
    private const int TransCategoryOpeningBalance = 9;
    private const int TransTypeDebit = 1;
    private const int TransTypeCredit = 2;
    private const int TransModeCredit = 3;

    private readonly ApplicationDbContext _dbContext;
    private readonly INotificationService _notificationService;

    public ClientService(ApplicationDbContext dbContext, INotificationService notificationService)
    {
        _dbContext = dbContext;
        _notificationService = notificationService;
    }

    public async Task<Response<PagedList<ClientDto>>> GetAllPaginatedAsync(int page, int pageSize, int userId, bool isAdmin)
    {
        var query = _dbContext.Clients.AsNoTracking().AsQueryable();
        if (!isAdmin)
            query = query.Where(c => c.UserId == userId);

        query = query.Include(c => c.ClientType).OrderBy(c => c.Name);

        var paged = await PagedList<Client>.CreateAsync(query, page, pageSize);

        var balances = await GetBalancesAsync(paged.Items.Select(c => c.Id).ToList());
        var dtos = paged.Items.Select(c => ToDto(c, balances.GetValueOrDefault(c.Id))).ToList();
        var pagedList = new PagedList<ClientDto>(dtos, paged.Page, paged.PageSize, paged.TotalCount);
        return Response<PagedList<ClientDto>>.SuccessResponse(pagedList, "Clients fetched successfully.");
    }

    public async Task<Response<ClientDto>> CreateAsync(CreateClientDto model)
    {
        var entity = ToEntity(model);

        using var dbTransaction = await _dbContext.Database.BeginTransactionAsync();

        await _dbContext.Clients.AddAsync(entity);
        await _dbContext.SaveChangesAsync();

        if (model.OpeningBalance is { } openingBalance && openingBalance != 0)
        {
            await _dbContext.Transactions.AddAsync(BuildOpeningBalanceTransaction(
                entity, openingBalance, entity.CreatedAt ?? DateOnly.FromDateTime(DateTime.UtcNow),
                $"Opening balance — Client #{entity.Id}"));
            await _dbContext.SaveChangesAsync();
        }

        await dbTransaction.CommitAsync();

        if (model.UserId.HasValue)
        {
            try { await _notificationService.CreateAsync(new CreateNotificationDto
            {
                UserId = model.UserId.Value,
                Type = "client_added",
                Title = "New Client Added",
                Body = $"{entity.Name} has been added as a client",
                EntityId = entity.Id,
            }); } catch { }
        }

        return Response<ClientDto>.SuccessResponse(ToDto(entity, null), "Client created.");
    }

    public async Task<Response<ClientDto>> GetByIdAsync(int id, int userId, bool isAdmin)
    {
        var client = await _dbContext.Clients
            .Include(client => client.ClientType)
            .Where(client => client.Id == id && (isAdmin || client.UserId == userId))
            .FirstOrDefaultAsync();

        if (client is null)
            return Response<ClientDto>.ErrorResponse("Not found", $"Client with id '{id}' was not found.");

        var balance = await _dbContext.VClientBalances.AsNoTracking()
            .Where(v => v.ClientId == id)
            .Select(v => v.Balance)
            .FirstOrDefaultAsync();

        return Response<ClientDto>.SuccessResponse(ToDto(client, balance), "Client fetched successfully.");
    }

    public async Task<Response<List<ClientDto>>> GetAllAsync(int userId, bool isAdmin)
    {
        var query = _dbContext.Clients.AsNoTracking().AsQueryable();
        if (!isAdmin)
            query = query.Where(c => c.UserId == userId);

        var clients = await query.Include(c => c.ClientType).OrderBy(c => c.Name).ToListAsync();

        var ids = clients.Select(c => c.Id).ToList();
        var balances = await GetBalancesAsync(ids);

        var dtos = clients.Select(c => ToDto(c, balances.GetValueOrDefault(c.Id))).ToList();
        return Response<List<ClientDto>>.SuccessResponse(dtos, "Clients fetched successfully.");
    }

    public async Task<Response<ClientDto>> UpdateByIdAsync(int id, UpdateClientByIdDto model, bool isAdmin)
    {
        var entity = await _dbContext.Clients
            .Where(client => client.Id == id && (isAdmin || client.UserId == model.UserId))
            .FirstOrDefaultAsync();

        if (entity is null)
            return Response<ClientDto>.ErrorResponse("Not found", $"Client with id '{id}' was not found.");

        using var dbTransaction = await _dbContext.Database.BeginTransactionAsync();

        var previousOpeningBalance = entity.OpeningBalance ?? 0;
        var newOpeningBalance = model.OpeningBalance ?? 0;
        var delta = newOpeningBalance - previousOpeningBalance;

        entity.Name = model.Name.Trim();
        entity.ClientTypeId = model.ClientTypeId;
        entity.Phone = model.Phone?.Trim();
        entity.Address = model.Address?.Trim();
        entity.CreditLimit = model.CreditLimit;
        entity.OpeningBalance = model.OpeningBalance;
        entity.Notes = model.Notes?.Trim();
        entity.IsActive = model.IsActive;
        await _dbContext.SaveChangesAsync();

        if (delta != 0)
        {
            await _dbContext.Transactions.AddAsync(BuildOpeningBalanceTransaction(
                entity, delta, DateOnly.FromDateTime(DateTime.UtcNow),
                $"Opening balance adjustment — Client #{entity.Id}: {previousOpeningBalance} → {newOpeningBalance}"));
            await _dbContext.SaveChangesAsync();
        }

        await dbTransaction.CommitAsync();

        var balance = await _dbContext.VClientBalances.AsNoTracking()
            .Where(v => v.ClientId == id)
            .Select(v => v.Balance)
            .FirstOrDefaultAsync();

        return Response<ClientDto>.SuccessResponse(ToDto(entity, balance), "Client updated.");
    }

    public async Task<Response> DeleteByIdAsync(int id)
    {
        var entity = await _dbContext.Clients.Where(client => client.Id == id).FirstOrDefaultAsync();
        if (entity is null)
            return Response.ErrorResponse("Not found", $"Client with id '{id}' was not found.");

        var hasPayments = await _dbContext.Payments.AnyAsync(p => p.PartyClientId == id);
        if (hasPayments)
            return Response.ErrorResponse("Validation failed", "Cannot delete a client with payment history. Deactivate the client instead.");

        var hasOrders = await _dbContext.Orders.AnyAsync(o => o.ClientId == id);
        if (hasOrders)
            return Response.ErrorResponse("Validation failed", "Cannot delete a client with order history. Deactivate the client instead.");

        var hasPurchases = await _dbContext.Purchases.AnyAsync(p => p.SupplierId == id);
        if (hasPurchases)
            return Response.ErrorResponse("Validation failed", "Cannot delete a client with purchase history. Deactivate the client instead.");

        _dbContext.Clients.Remove(entity);
        await _dbContext.SaveChangesAsync();

        return Response.SuccessResponse("Client deleted.");
    }

    private async Task<Dictionary<int, decimal?>> GetBalancesAsync(List<int> clientIds)
    {
        if (clientIds.Count == 0) return new Dictionary<int, decimal?>();
        return await _dbContext.VClientBalances
            .AsNoTracking()
            .Where(v => v.ClientId != null && clientIds.Contains(v.ClientId.Value))
            .ToDictionaryAsync(v => v.ClientId!.Value, v => v.Balance);
    }

    private static Transaction BuildOpeningBalanceTransaction(Client client, decimal amount, DateOnly transDate, string notes) =>
        new()
        {
            ClientId = client.Id,
            TransTypeId = client.ClientTypeId == ClientTypeCustomer ? TransTypeCredit : TransTypeDebit,
            TransModeId = TransModeCredit,
            TransCategoryId = TransCategoryOpeningBalance,
            Amount = amount,
            TransDate = transDate,
            Notes = notes,
            CreatedAt = DateOnly.FromDateTime(DateTime.UtcNow)
        };

    private static ClientDto ToDto(Client entity, decimal? outstandingBalance) =>
        new()
        {
            Id = entity.Id,
            Name = entity.Name ?? string.Empty,
            ClientTypeId = entity.ClientTypeId ?? 0,
            ClientTypeName = entity.ClientType?.Name,
            UserId = entity.UserId ?? 0,
            Phone = entity.Phone ?? string.Empty,
            Address = entity.Address ?? string.Empty,
            CreditLimit = entity.CreditLimit ?? 0,
            OpeningBalance = entity.OpeningBalance ?? 0,
            OutstandingBalance = outstandingBalance ?? entity.OpeningBalance ?? 0,
            Notes = entity.Notes ?? string.Empty,
            IsActive = entity.IsActive,
            CreatedAt = entity.CreatedAt ?? DateOnly.FromDateTime(DateTime.UtcNow)
        };

    private static Client ToEntity(CreateClientDto model) =>
        new()
        {
            Name = model.Name.Trim(),
            ClientTypeId = model.ClientTypeId,
            UserId = model.UserId,
            Phone = model.Phone?.Trim(),
            Address = model.Address?.Trim(),
            CreditLimit = model.CreditLimit,
            OpeningBalance = model.OpeningBalance,
            Notes = model.Notes?.Trim(),
            IsActive = model.IsActive,
            CreatedAt = DateOnly.FromDateTime(DateTime.UtcNow)
        };
}

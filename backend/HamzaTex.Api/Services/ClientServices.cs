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
    /// <summary>Get a client by ID.</summary>
    Task<Response<ClientDto>> GetByIdAsync(int id);
    /// <summary>Get all clients across all users. Admin use only.</summary>
    Task<Response<List<ClientDto>>> GetAllAsync();
    /// <summary>Get all clients belonging to a specific user.</summary>
    Task<Response<List<ClientDto>>> GetAllByUserIdAsync(int userId);
    /// <summary>Update a client by ID.</summary>
    Task<Response<ClientDto>> UpdateByIdAsync(int id, UpdateClientByIdDto model);
    /// <summary>Delete a client by ID.</summary>
    Task<Response> DeleteByIdAsync(int id);
    /// <summary>Get paginated clients. Scoped to the user unless isAdmin, in which case all clients are returned.</summary>
    Task<Response<PagedList<ClientDto>>> GetAllPaginatedAsync(int page, int pageSize, int userId, bool isAdmin);
}

public class ClientService : IClientService
{
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

        query = query.OrderBy(c => c.Name);

        var paged = await PagedList<Client>.CreateAsync(query, page, pageSize);

        var balances = await GetBalancesAsync(paged.Items.Select(c => c.Id).ToList());
        var dtos = paged.Items.Select(c => ToDto(c, balances.GetValueOrDefault(c.Id))).ToList();
        var pagedList = new PagedList<ClientDto>(dtos, paged.Page, paged.PageSize, paged.TotalCount);
        return Response<PagedList<ClientDto>>.SuccessResponse(pagedList, "Clients fetched successfully.");
    }

    public async Task<Response<ClientDto>> CreateAsync(CreateClientDto model)
    {
        var entity = ToEntity(model);
        await _dbContext.Clients.AddAsync(entity);
        await _dbContext.SaveChangesAsync();

        if (model.UserId.HasValue)
        {
            await _notificationService.CreateAsync(new CreateNotificationDto
            {
                UserId = model.UserId.Value,
                Type = "client_added",
                Title = "New Client Added",
                Body = $"{entity.Name} has been added as a client",
                EntityId = entity.Id,
            });
        }

        return Response<ClientDto>.SuccessResponse(ToDto(entity, null), "Client created.");
    }

    public async Task<Response<ClientDto>> GetByIdAsync(int id)
    {
        var client = await _dbContext.Clients
            .Where(client => client.Id == id && client.UserId != null && _dbContext.Users.Any(user => user.Id == client.UserId))
            .FirstOrDefaultAsync();

        if (client is null)
            return Response<ClientDto>.ErrorResponse("Not found", $"Client with id '{id}' was not found.");

        var balance = await _dbContext.VClientBalances.AsNoTracking()
            .Where(v => v.ClientId == id)
            .Select(v => v.Balance)
            .FirstOrDefaultAsync();

        return Response<ClientDto>.SuccessResponse(ToDto(client, balance), "Client fetched successfully.");
    }

    public async Task<Response<List<ClientDto>>> GetAllAsync()
    {
        var clients = await _dbContext.Clients
            .AsNoTracking()
            .Include(client => client.User)
            .Where(client => client.User != null)
            .ToListAsync();

        if (clients is null)
            return Response<List<ClientDto>>.ErrorResponse("Not found", "No clients found.");

        var ids = clients.Select(c => c.Id).ToList();
        var balances = await GetBalancesAsync(ids);

        var dtos = clients.Select(c => ToDto(c, balances.GetValueOrDefault(c.Id))).ToList();
        return Response<List<ClientDto>>.SuccessResponse(dtos, "Clients fetched successfully.");
    }

    public async Task<Response<List<ClientDto>>> GetAllByUserIdAsync(int userId)
    {
        var clients = await _dbContext.Clients
            .AsNoTracking()
            .Where(c => c.UserId == userId)
            .ToListAsync();

        if (clients is null)
            return Response<List<ClientDto>>.ErrorResponse("Not found", "No clients found.");

        var ids = clients.Select(c => c.Id).ToList();
        var balances = await GetBalancesAsync(ids);

        var dtos = clients.Select(c => ToDto(c, balances.GetValueOrDefault(c.Id))).ToList();
        return Response<List<ClientDto>>.SuccessResponse(dtos, "Clients fetched successfully.");
    }

    public async Task<Response<ClientDto>> UpdateByIdAsync(int id, UpdateClientByIdDto model)
    {
        var entity = await _dbContext.Clients.Where(client => client.Id == id).FirstOrDefaultAsync();
        var user = await _dbContext.Users.Where(user => user.Id == model.UserId).FirstOrDefaultAsync();
        if (user is null)
            return Response<ClientDto>.ErrorResponse("Not found", $"User with id '{model.UserId}' was not found.");

        if (entity is null)
            return Response<ClientDto>.ErrorResponse("Not found", $"Client with id '{id}' was not found.");

        entity.Name = model.Name.Trim();
        entity.ClientTypeId = model.ClientTypeId;
        entity.Phone = model.Phone?.Trim();
        entity.Address = model.Address?.Trim();
        entity.CreditLimit = model.CreditLimit;
        entity.OpeningBalance = model.OpeningBalance;
        entity.Notes = model.Notes?.Trim();
        entity.IsActive = model.IsActive;
        await _dbContext.SaveChangesAsync();

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

    private static ClientDto ToDto(Client entity, decimal? outstandingBalance) =>
        new()
        {
            Id = entity.Id,
            Name = entity.Name ?? string.Empty,
            ClientTypeId = entity.ClientTypeId ?? 0,
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

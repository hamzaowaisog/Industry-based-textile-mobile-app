using HamzaTex.Api.Data;
using HamzaTex.Api.Entities;
using HamzaTex.Api.Models;
using HamzaTex.Api.Services.ViewModel;
using Microsoft.EntityFrameworkCore;

namespace HamzaTex.Api.Services;

public interface IClientService
{
    Task<Response<ClientDto>> CreateAsync(CreateClientDto model);
    Task<Response<ClientDto>> GetByIdAsync(int id);
    Task<Response<List<ClientDto>>> GetAllAsync();
    Task<Response<List<ClientDto>>> GetAllByUserIdAsync(int userId);
    Task<Response<ClientDto>> UpdateByIdAsync(int id, UpdateClientByIdDto model);
    Task<Response> DeleteByIdAsync(int id);

    // TODO: add a listing call for pagination
    // Task<Response<List<ClientDto>>> GetAllPaginatedAsync(int page, int pageSize);
}

public class ClientService : IClientService
{
    private readonly ApplicationDbContext _dbContext;

    public ClientService(ApplicationDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<Response<ClientDto>> CreateAsync(CreateClientDto model)
    {
        var validationResult = await ValidateNameAsync(model.Name);
        if (validationResult is not null)
        {
            return validationResult;
        }

        if (model.UserId is not null)
        {
            var user = await _dbContext.Users.FirstOrDefaultAsync(user => user.Id == model.UserId);
            if (user is null)
            {
                return Response<ClientDto>.ErrorResponse("Not found", $"User with id '{model.UserId}' was not found.");
            }
        }

        var entity = ToEntity(model);
        await _dbContext.Clients.AddAsync(entity);
        await _dbContext.SaveChangesAsync();

        return Response<ClientDto>.SuccessResponse(ToDto(entity), "Client created.");
    }

    public async Task<Response<ClientDto>> GetByIdAsync(int id)
    {
        var client = await _dbContext.Clients
            .Where(client => client.Id == id && client.UserId != null && _dbContext.Users.Any(user => user.Id == client.UserId))
            .FirstOrDefaultAsync();

        if (client is null)
        {
            return Response<ClientDto>.ErrorResponse("Not found", $"Client with id '{id}' was not found.");
        }

        return Response<ClientDto>.SuccessResponse(ToDto(client), "Client fetched successfully.");
    }

    public async Task<Response<List<ClientDto>>> GetAllAsync()
    {
        var clients = await _dbContext.Clients
            .Include(client => client.User)
            // TODO: read about ThenInclude
            // TODO: behavior
            .Where(client => client.UserId != null && _dbContext.Users.Any(user => user.Id == client.UserId))
            // TODO: check behavior
            .Select(client => ToDto(client))
            .ToListAsync();

        return Response<List<ClientDto>>.SuccessResponse(clients, "Clients fetched successfully.");
    }

    // TODO: what to do on FE and BE
    public async Task<Response<List<ClientDto>>> GetAllByUserIdAsync(int userId)
    {
        var clients = await _dbContext.Clients
            .Where(client => client.UserId == userId
                && _dbContext.Users.Any(user => user.Id == userId))
            .Select(client => ToDto(client))
            .ToListAsync();

        return Response<List<ClientDto>>.SuccessResponse(clients, "Clients fetched successfully.");
    }

    // TODO: make a object with a child as list
    // TODO: make a object with a child as property
    // TODO: check add, remove behavior of list and property

    // TODO: savechanges behavior of dbcontext
    // TODO: begin transaction and commit transaction
    // TODO: rollback transaction
    // TODO: transaction isolation level
    // TODO: transaction timeout
    // TODO: transaction retry
    // TODO: transaction rollback
    // TODO: transaction commit
    // TODO: transaction rollback

    public async Task<Response<ClientDto>> UpdateByIdAsync(int id, UpdateClientByIdDto model)
    {
        var validationResult = await ValidateNameAsync(model.Name, id);
        if (validationResult is not null)
        {
            return validationResult;
        }

        var entity = await _dbContext.Clients.Where(client => client.Id == id).FirstOrDefaultAsync();
        if (model.UserId is not null)
        {
            var user = await _dbContext.Users.Where(user => user.Id == model.UserId).FirstOrDefaultAsync();
            if (user is null)
            {
                return Response<ClientDto>.ErrorResponse("Not found", $"User with id '{model.UserId}' was not found.");
            }
        }

        if (entity is null)
        {
            return Response<ClientDto>.ErrorResponse("Not found", $"Client with id '{id}' was not found.");
        }

        entity.Name = model.Name.Trim();
        entity.ClientTypeId = model.ClientTypeId;
        entity.Phone = model.Phone?.Trim();
        entity.Address = model.Address?.Trim();
        entity.CreditLimit = model.CreditLimit;
        entity.OpeningBalance = model.OpeningBalance;
        entity.Notes = model.Notes?.Trim();
        entity.IsActive = model.IsActive;
        await _dbContext.SaveChangesAsync();

        return Response<ClientDto>.SuccessResponse(ToDto(entity), "Client updated.");
    }

    public async Task<Response> DeleteByIdAsync(int id)
    {
        var entity = await _dbContext.Clients.Where(client => client.Id == id).FirstOrDefaultAsync();
        if (entity is null)
        {
            return Response.ErrorResponse("Not found", $"Client with id '{id}' was not found.");
        }

        _dbContext.Clients.Remove(entity);
        await _dbContext.SaveChangesAsync();

        return Response.SuccessResponse("Client deleted.");
    }

    // TODO: read about fluent validation and implement in some api
    private async Task<Response<ClientDto>?> ValidateNameAsync(string name, int? excludeId = null)
    {
        if (string.IsNullOrWhiteSpace(name))
        {
            return Response<ClientDto>.ErrorResponse("Validation failed", "Name is required.");
        }

        var trimmedName = name.Trim();

        if (trimmedName.Length > 255)
        {
            return Response<ClientDto>.ErrorResponse("Validation failed", "Name must be less than 255 characters.");
        }

        var query = _dbContext.Clients.AsNoTracking().Where(client => client.Name == trimmedName);

        if (excludeId.HasValue)
        {
            query = query.Where(role => role.Id != excludeId.Value);
        }

        if (await query.AnyAsync())
        {
            return Response<ClientDto>.ErrorResponse("Validation failed", "Name already exists.");
        }

        return null;
    }

    private static ClientDto ToDto(Client entity) =>
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
            Notes = entity.Notes ?? string.Empty,
            IsActive = entity.IsActive,
            CreatedAt = entity.CreatedAt ?? DateTime.UtcNow
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
            CreatedAt = model.CreatedAt
        };
}


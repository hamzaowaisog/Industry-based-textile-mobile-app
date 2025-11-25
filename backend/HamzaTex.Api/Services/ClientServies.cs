using HamzaTex.Api.Data;
using HamzaTex.Api.Entities;
using HamzaTex.Api.Models;
using HamzaTex.Api.Services.ViewModel;
using Microsoft.EntityFrameworkCore;

namespace HamzaTex.Api.Services;


public interface IClientService{
    Task<Response<ClientDto>> CreateAsync(CreateClientDto model);
    Task<Response<ClientDto>> GetByIdAsync(int id);
    Task<Response<List<ClientDto>>> GetAllAsync();
    Task<Response<ClientDto>> UpdateByIdAsync(int id, UpdateClientByIdDto model);
    Task<Response> DeleteByIdAsync(int id);
}

public class ClientService : IClientService {
    private readonly ApplicationDbContext _dbContext;

    public ClientService(ApplicationDbContext dbContext)
    {
        _dbContext = dbContext ?? throw new ArgumentNullException(nameof(dbContext));
    }

    public async Task<Response<ClientDto>> CreateAsync(CreateClientDto model){

        var validationResult = await ValidateNameAsync(model.Name);
        if (validationResult is not null){
            return validationResult;
        }

        var entity = ToEntity(model);
        await _dbContext.Clients.AddAsync(entity);
        await _dbContext.SaveChangesAsync();

        return Response<ClientDto>.SuccessResponse(ToDto(entity), "Client created.");

    }
    public async Task<Response<ClientDto>> GetByIdAsync(int id){
        var client = await _dbContext.Clients.Where(client => client.Id == id ).FirstOrDefaultAsync();
        if (client is null){
            return Response<ClientDto>.ErrorResponse("Not found", $"Client with id '{id}' was not found.");
        }
        return Response<ClientDto>.SuccessResponse(ToDto(client), "Client fetched successfully.");
    }
    public async Task<Response<List<ClientDto>>> GetAllAsync(){
        var clients = await _dbContext.Clients.Select(client => ToDto(client)).ToListAsync();
        return Response<List<ClientDto>>.SuccessResponse(clients, "Clients fetched successfully.");
    }
    public async Task<Response<ClientDto>> UpdateByIdAsync(int id, UpdateClientByIdDto model){
        var validationResult = await ValidateNameAsync(model.Name, id);
        if (validationResult is not null){
            return validationResult;
        }

        var entity = await _dbContext.Clients.Where(client => client.Id == id).FirstOrDefaultAsync();
        if (entity is null) {
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
    public async Task<Response> DeleteByIdAsync(int id){
        var entity = await _dbContext.Clients.Where(client => client.Id == id).FirstOrDefaultAsync();
        if (entity is null) {
            return Response.ErrorResponse("Not found", $"Client with id '{id}' was not found.");
        }
        _dbContext.Clients.Remove(entity);
        await _dbContext.SaveChangesAsync();
        return Response.SuccessResponse("Client deleted.");
    }

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

        if (trimmedName.Contains(' '))
        {
            return Response<ClientDto>.ErrorResponse("Validation failed", "Name must not contain spaces.");
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
            Phone = model.Phone?.Trim(),
            Address = model.Address?.Trim(),
            CreditLimit = model.CreditLimit,
            OpeningBalance = model.OpeningBalance,
            Notes = model.Notes?.Trim(),
            IsActive = model.IsActive,
            CreatedAt = model.CreatedAt
        };
}

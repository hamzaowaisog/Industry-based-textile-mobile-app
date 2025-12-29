using HamzaTex.Api.Data;
using HamzaTex.Api.Entities;
using HamzaTex.Api.Helpers;
using HamzaTex.Api.Models;
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
    Task<Response<PagedList<ClientDto>>> GetAllPaginatedAsync(int page, int pageSize);
}

public class ClientService : IClientService
{
    private readonly ApplicationDbContext _dbContext;

    public ClientService(ApplicationDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<Response<PagedList<ClientDto>>> GetAllPaginatedAsync(int page, int pageSize){
        var query = _dbContext.Clients.AsNoTracking().Select(client => ToDto(client));
        var pagedList = await PagedList<ClientDto>.CreateAsync(query, page, pageSize);
        return Response<PagedList<ClientDto>>.SuccessResponse(pagedList, "Clients fetched successfully.");
    }

    public async Task<Response<ClientDto>> CreateAsync(CreateClientDto model)
    {

        var user = await _dbContext.Users.FirstOrDefaultAsync(user => user.Id == model.UserId);
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
            .Where(client => client.User != null)
            .ToListAsync();
        
        if (clients is null)
        {
            return Response<List<ClientDto>>.ErrorResponse("Not found", "No clients found.");
        }

        var clientDtos = clients.Select(client => ToDto(client)).ToList();

        return Response<List<ClientDto>>.SuccessResponse(clientDtos, "Clients fetched successfully.");
    }

    public async Task<Response<List<ClientDto>>> GetAllByUserIdAsync(int userId)
    {
        var clients = await _dbContext.Clients
            .Where(client => client.UserId == userId)
            .ToListAsync();

        if (clients is null)
        {
            return Response<List<ClientDto>>.ErrorResponse("Not found", "No clients found.");
        }

        var clientDtos = clients.Select(client => ToDto(client)).ToList();

        return Response<List<ClientDto>>.SuccessResponse(clientDtos, "Clients fetched successfully.");
    }


    public async Task<Response<ClientDto>> UpdateByIdAsync(int id, UpdateClientByIdDto model)
    {

        var entity = await _dbContext.Clients.Where(client => client.Id == id).FirstOrDefaultAsync();
        var user = await _dbContext.Users.Where(user => user.Id == model.UserId).FirstOrDefaultAsync();
        if (user is null)
        {
            return Response<ClientDto>.ErrorResponse("Not found", $"User with id '{model.UserId}' was not found.");
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


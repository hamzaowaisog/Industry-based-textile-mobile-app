using System.ComponentModel.DataAnnotations;
using HamzaTex.Api.Data;
using HamzaTex.Api.Entities;
using HamzaTex.Api.Models;
using HamzaTex.Api.Services.ViewModel;
using Microsoft.EntityFrameworkCore;

namespace HamzaTex.Api.Services;

public interface IClientTypeService
{
    Task<Response<ClientTypeDto>> CreateAsync(CreateClientTypeDto model);
    Task<Response<ClientTypeDto>> GetByIdAsync(int id);
    Task<Response<List<ClientTypeDto>>> GetAllAsync();
    Task<Response<ClientTypeDto>> UpdateByIdAsync(int id, UpdateClientTypeByIdDto model);
    Task<Response> DeleteByIdAsync(int id);
}

public class ClientTypeService : IClientTypeService
{
    private readonly ApplicationDbContext _dbContext;

    public ClientTypeService(ApplicationDbContext dbContext)
    {
        _dbContext = dbContext ?? throw new ArgumentNullException(nameof(dbContext));
    }

    public async Task<Response<ClientTypeDto>> CreateAsync(CreateClientTypeDto model)
    {
        var validationResult = await ValidateNameAsync(model.Name);
        if (validationResult is not null)
        {
            return validationResult;
        }

        var entity = new ClientType
        {
            Name = model.Name.Trim(),
            CreatedAt = model.CreatedAt
        };

        await _dbContext.ClientTypes.AddAsync(entity);
        await _dbContext.SaveChangesAsync();

        return Response<ClientTypeDto>.SuccessResponse(ToDto(entity), "Client type created.");
    }

    public async Task<Response<List<ClientTypeDto>>> GetAllAsync()
    {
        var types = await _dbContext.ClientTypes.Select(types => ToDto(types)).ToListAsync();

        return Response<List<ClientTypeDto>>.SuccessResponse(types, "Client types fetched successfully.");
    }

    public async Task<Response<ClientTypeDto>> GetByIdAsync(int id)
    {
        var clientType = await _dbContext.ClientTypes
            .Where(type => type.Id == id)
            .FirstOrDefaultAsync();

        if (clientType is null)
        {
            return Response<ClientTypeDto>.ErrorResponse("Not found", $"Client type with id '{id}' was not found.");
        }

        return Response<ClientTypeDto>.SuccessResponse(ToDto(clientType), "Client type fetched successfully.");
    }

    public async Task<Response<ClientTypeDto>> UpdateByIdAsync(int id, UpdateClientTypeByIdDto model)
    {
        var validationResult = await ValidateNameAsync(model.Name, id);
        if (validationResult is not null)
        {
            return validationResult;
        }

        var entity = await _dbContext.ClientTypes
            .Where(type => type.Id == id)
            .FirstOrDefaultAsync();

        if (entity is null)
        {
            return Response<ClientTypeDto>.ErrorResponse("Not found", $"Client type with id '{id}' was not found.");
        }

        entity.Name = model.Name.Trim();
        await _dbContext.SaveChangesAsync();

        return Response<ClientTypeDto>.SuccessResponse(ToDto(entity), "Client type updated.");
    }

    public async Task<Response> DeleteByIdAsync(int id)
    {
        var entity = await _dbContext.ClientTypes
            .Where(type => type.Id == id)
            .FirstOrDefaultAsync();

        if (entity is null)
        {
            return Response.ErrorResponse("Not found", $"Client type with id '{id}' was not found.");
        }

        _dbContext.ClientTypes.Remove(entity);
        await _dbContext.SaveChangesAsync();

        return Response.SuccessResponse("Client type deleted.");
    }
    private async Task<Response<ClientTypeDto>?> ValidateNameAsync(string name, int? excludeId = null)
    {
        if (string.IsNullOrWhiteSpace(name))
        {
            return Response<ClientTypeDto>.ErrorResponse("Validation failed", "Name is required.");
        }
        
        var trimmedName = name.Trim();

        if (trimmedName.Length > 255)
        {
            return Response<ClientTypeDto>.ErrorResponse("Validation failed", "Name must be less than 255 characters.");
        }

        if (trimmedName.Contains(' '))
        {
            return Response<ClientTypeDto>.ErrorResponse("Validation failed", "Name must not contain spaces.");
        }

        var query = _dbContext.ClientTypes.AsNoTracking().Where(type => type.Name == trimmedName);

        if (excludeId.HasValue)
        {
            query = query.Where(role => role.Id != excludeId.Value);
        }

        if (await query.AnyAsync())
        {
            return Response<ClientTypeDto>.ErrorResponse("Validation failed", "Name already exists.");
        }

        return null;
    }

    private static ClientTypeDto ToDto(ClientType entity) =>
        new()
        {
            Id = entity.Id,
            Name = entity.Name ?? string.Empty
        };
}
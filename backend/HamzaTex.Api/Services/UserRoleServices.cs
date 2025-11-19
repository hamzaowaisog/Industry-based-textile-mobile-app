using HamzaTex.Api.Data;
using HamzaTex.Api.Entities;
using HamzaTex.Api.Models;
using HamzaTex.Api.Services.ViewModel;
using Microsoft.EntityFrameworkCore;

namespace HamzaTex.Api.Services;

public interface IUserRoleService
{
    Task<Response<UserRoleDto>> CreateAsync(CreateUserRoleDto model);
    Task<Response<UserRoleDto>> GetByIdAsync(int id);
    Task<Response<List<UserRoleDto>>> GetAllAsync();
    Task<Response<UserRoleDto>> UpdateAsync(int id, UpdateUserRoleDto model);
    Task<Response> DeleteAsync(int id);
}

public class UserRoleService : IUserRoleService
{
    private readonly ApplicationDbContext _dbContext;

    public UserRoleService(ApplicationDbContext dbContext)
    {
        _dbContext = dbContext ?? throw new ArgumentNullException(nameof(dbContext));
    }

        
    public async Task<Response<UserRoleDto>> CreateAsync(CreateUserRoleDto model)
    {
        var validationResult = await ValidateNameAsync(model.Name);
        if (validationResult is not null)
        {
            return validationResult;
        }

        var entity = new UserRole
        {
            Name = model.Name.Trim(),
            CreatedAt = model.CreatedAt
        };

        await _dbContext.UserRoles.AddAsync(entity);
        await _dbContext.SaveChangesAsync();

        return Response<UserRoleDto>.SuccessResponse(ToDto(entity), "User role created.");
    }

    public async Task<Response<UserRoleDto>> GetByIdAsync(int id)
    {
        var entity = await _dbContext.UserRoles.AsNoTracking().FirstOrDefaultAsync(role => role.Id == id);

        if (entity is null)
        {
            return Response<UserRoleDto>.ErrorResponse("Not found", $"User role with id '{id}' was not found.");
        }

        return Response<UserRoleDto>.SuccessResponse(ToDto(entity));
    }

    public async Task<Response<List<UserRoleDto>>> GetAllAsync()
    {
        var roles = await _dbContext.UserRoles
            .AsNoTracking()
            .OrderBy(role => role.CreatedAt)
            .Select(role => ToDto(role))
            .ToListAsync();

        return Response<List<UserRoleDto>>.SuccessResponse(roles);
    }

    public async Task<Response<UserRoleDto>> UpdateAsync(int id, UpdateUserRoleDto model)
    {
        var validationResult = await ValidateNameAsync(model.Name, id);
        if (validationResult is not null)
        {
            return validationResult;
        }

        var entity = await _dbContext.UserRoles.FirstOrDefaultAsync(role => role.Id == id);
        if (entity is null)
        {
            return Response<UserRoleDto>.ErrorResponse("Not found", $"User role with id '{id}' was not found.");
        }

        entity.Name = model.Name.Trim();

        await _dbContext.SaveChangesAsync();
        return Response<UserRoleDto>.SuccessResponse(ToDto(entity), "User role updated.");
    }

    public async Task<Response> DeleteAsync(int id)
    {
        var entity = await _dbContext.UserRoles.FirstOrDefaultAsync(role => role.Id == id);

        if (entity is null)
        {
            return Response.ErrorResponse("Not found", $"User role with id '{id}' was not found.");
        }

        _dbContext.UserRoles.Remove(entity);
        await _dbContext.SaveChangesAsync();

        return Response.SuccessResponse("User role deleted.");
    }

    private async Task<Response<UserRoleDto>?> ValidateNameAsync(string name, int? excludeId = null)
    {
        if (string.IsNullOrWhiteSpace(name))
        {
            return Response<UserRoleDto>.ErrorResponse("Validation failed", "Name is required.");
        }
        
        var trimmedName = name.Trim();

        if (trimmedName.Length > 255)
        {
            return Response<UserRoleDto>.ErrorResponse("Validation failed", "Name must be less than 255 characters.");
        }

        if (trimmedName.Contains(' '))
        {
            return Response<UserRoleDto>.ErrorResponse("Validation failed", "Name must not contain spaces.");
        }

        var query = _dbContext.UserRoles.AsNoTracking().Where(role => role.Name == trimmedName);

        if (excludeId.HasValue)
        {
            query = query.Where(role => role.Id != excludeId.Value);
        }

        if (await query.AnyAsync())
        {
            return Response<UserRoleDto>.ErrorResponse("Validation failed", "Name already exists.");
        }

        return null;
    }

    private static UserRoleDto ToDto(UserRole entity) =>
        new()
        {
            Id = entity.Id,
            Name = entity.Name ?? string.Empty
        };
}
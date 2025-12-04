using HamzaTex.Api.Data;
using HamzaTex.Api.Entities;
using HamzaTex.Api.Models;
using HamzaTex.Api.Services.ViewModel;
using Microsoft.EntityFrameworkCore;

namespace HamzaTex.Api.Services;

public interface IUserService {
    Task<Response<UserDto>> CreateAsync(CreateUserDto model);
    Task<Response<UserDto>> GetByIdAsync(int id);
    Task<Response<List<UserDto>>> GetAllAsync();
    Task<Response<UserDto>> UpdateByIdAsync(int id, UpdateUserByIdDto model);
    Task<Response> DeleteByIdAsync(int id);
}

public class UserService : IUserService {
    private readonly ApplicationDbContext _dbContext;

    public UserService(ApplicationDbContext dbContext)
    {
        _dbContext = dbContext ?? throw new ArgumentNullException(nameof(dbContext));
    }

    public async Task<Response<UserDto>> CreateAsync(CreateUserDto model)
    {
        var validationResult = await ValidateNameAsync(model.Name);
        if (validationResult is not null){
            return validationResult;
        }
        var entity = ToEntity(model);
        await _dbContext.Users.AddAsync(entity);
        await _dbContext.SaveChangesAsync();
        return Response<UserDto>.SuccessResponse(ToDto(entity), "User created.");
    }

    public async Task<Response<UserDto>> GetByIdAsync(int id){
        
        var user = await _dbContext.Users.Where(user => user.Id == id).FirstOrDefaultAsync();
        if (user is null){
            return Response<UserDto>.ErrorResponse("Not found", $"User with id '{id}' was not found.");
        }
        return Response<UserDto>.SuccessResponse(ToDto(user), "User fetched successfully.");
    }

    public async Task<Response<List<UserDto>>> GetAllAsync(){
        var users = await _dbContext.Users.Select(user => ToDto(user)).ToListAsync();
        return Response<List<UserDto>>.SuccessResponse(users, "Users fetched successfully.");
    }

    public async Task<Response<UserDto>> UpdateByIdAsync(int id , UpdateUserByIdDto model){
        var validationResult = await ValidateNameAsync (model.Name, id);
        if (validationResult is not null){
            return validationResult;
        }

        var entity = await _dbContext.Users.Where(user => user.Id == id).FirstOrDefaultAsync();
        if (entity is null){
            return Response<UserDto>.ErrorResponse("Not found", $"User with id '{id}' was not found.");
        }
        entity.Name = model.Name.Trim();
        entity.Email = model.Email.Trim();
        entity.RoleId = model.RoleId;
        entity.IsActive = model.IsActive;
        await _dbContext.SaveChangesAsync();
        return Response<UserDto>.SuccessResponse(ToDto(entity), "User updated successfully.");
    }

    public async Task<Response> DeleteByIdAsync(int id){
        var entity = await _dbContext.Users.Where(user => user.Id == id).FirstOrDefaultAsync();
        if (entity is null){
            return Response.ErrorResponse("Not found", $"User with id '{id}' was not found.");
        }
        _dbContext.Users.Remove(entity);
        await _dbContext.SaveChangesAsync();
        return Response.SuccessResponse("User deleted successfully.");
    }



      private async Task<Response<UserDto>?> ValidateNameAsync(string name, int? excludeId = null)
    {
        if (string.IsNullOrWhiteSpace(name))
        {
            return Response<UserDto>.ErrorResponse("Validation failed", "Name is required.");
        }
        
        var trimmedName = name.Trim();

        if (trimmedName.Length > 255)
        {
            return Response<UserDto>.ErrorResponse("Validation failed", "Name must be less than 255 characters.");
        }


        var query = _dbContext.Users.AsNoTracking().Where(user => user.Name == trimmedName);

        if (excludeId.HasValue)
        {
            query = query.Where(user => user.Id != excludeId.Value);
        }

        return null;
    }

    private static UserDto ToDto(User entity) =>
        new()
        {
            Id = entity.Id,
            Name = entity.Name ?? string.Empty,
            Email = entity.Email ?? string.Empty,
            RoleId = entity.RoleId ?? 0,
            IsActive = entity.IsActive,
            CreatedAt = entity.CreatedAt
        };

    private static User ToEntity(CreateUserDto model) =>
        new()
        {
            Name = model.Name.Trim(),
            Email = model.Email.Trim(),
            RoleId = model.RoleId,
            IsActive = model.IsActive,
            CreatedAt = model.CreatedAt
        };

}
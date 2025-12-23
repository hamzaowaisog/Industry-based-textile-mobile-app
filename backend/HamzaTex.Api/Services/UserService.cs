using HamzaTex.Api.Data;
using HamzaTex.Api.Entities;
using HamzaTex.Api.Models;
using HamzaTex.Api.Services.ViewModel;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace HamzaTex.Api.Services;

public interface IUserService
{
    Task<Response<CreateUserDto>> SignupAsync(CreateUserDto model);
    Task<Response<UserDto>> GetByIdAsync(int id);
    Task<Response<List<UserDto>>> GetAllAsync();
    Task<Response<UserDto>> UpdateByIdAsync(int id, UpdateUserByIdDto model);
    Task<Response> DeleteByIdAsync(int id);
}

public class UserService : IUserService
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly ApplicationDbContext _dbContext;

    public UserService(UserManager<ApplicationUser> userManager, ApplicationDbContext dbContext)
    {
        _userManager = userManager ?? throw new ArgumentNullException(nameof(userManager));
        _dbContext = dbContext ?? throw new ArgumentNullException(nameof(dbContext));
    }

    public async Task<Response<UserDto>> GetByIdAsync(int id)
    {
        var user = await _userManager.Users
            .Include(u => u.Role)
            .FirstOrDefaultAsync(u => u.Id == id);

        if (user is null)
        {
            return Response<UserDto>.ErrorResponse("Not found", $"User with id '{id}' was not found.");
        }

        return Response<UserDto>.SuccessResponse(ToDto(user), "User fetched successfully.");
    }

    public async Task<Response<List<UserDto>>> GetAllAsync()
    {
        var users = await _userManager.Users
            .Include(u => u.Role)
            .ToListAsync();

        var userDtos = users.Select(user => ToDto(user)).ToList();

        return Response<List<UserDto>>.SuccessResponse(userDtos, "Users fetched successfully.");
    }

    public async Task<Response<UserDto>> UpdateByIdAsync(int id, UpdateUserByIdDto model)
    {
        var user = await _userManager.Users
            .Include(u => u.Role)
            .FirstOrDefaultAsync(u => u.Id == id);

        if (user is null)
        {
            return Response<UserDto>.ErrorResponse("Not found", $"User with id '{id}' was not found.");
        }

        var existingUser = await _userManager.FindByNameAsync(model.UserName.Trim());
        if (existingUser != null && existingUser.Id != id)
        {
            return Response<UserDto>.ErrorResponse("Validation failed", "Username already exists.");
        }

        var existingEmailUser = await _userManager.FindByEmailAsync(model.Email.Trim());
        if (existingEmailUser != null && existingEmailUser.Id != id)
        {
            return Response<UserDto>.ErrorResponse("Validation failed", "Email already exists.");
        }

        user.Name = model.Name.Trim();
        user.Email = model.Email.Trim();
        user.UserName = model.UserName.Trim();
        user.NormalizedEmail = model.Email.Trim().ToUpperInvariant();
        user.NormalizedUserName = model.UserName.Trim().ToUpperInvariant();
        user.RoleId = model.RoleId;
        user.IsActive = model.IsActive;
        user.PhoneNumber = !string.IsNullOrWhiteSpace(model.PhoneNumber) ? model.PhoneNumber.Trim() : null;
        user.PhoneNumberConfirmed = !string.IsNullOrWhiteSpace(model.PhoneNumber);

        var result = await _userManager.UpdateAsync(user);
        if (!result.Succeeded)
        {
            var errors = string.Join(", ", result.Errors.Select(e => e.Description));
            return Response<UserDto>.ErrorResponse("Update failed", errors);
        }

        return Response<UserDto>.SuccessResponse(ToDto(user), "User updated successfully.");
    }

    public async Task<Response> DeleteByIdAsync(int id)
    {
        var user = await _userManager.Users
            .FirstOrDefaultAsync(u => u.Id == id);

        if (user is null)
        {
            return Response.ErrorResponse("Not found", $"User with id '{id}' was not found.");
        }

        var result = await _userManager.DeleteAsync(user);
        if (!result.Succeeded)
        {
            var errors = string.Join(", ", result.Errors.Select(e => e.Description));
            return Response.ErrorResponse("Delete failed", errors);
        }

        return Response.SuccessResponse("User deleted successfully.");
    }

    public async Task<Response<CreateUserDto>> SignupAsync(CreateUserDto model)
    {
        var existingUser = await _userManager.FindByEmailAsync(model.Email.Trim());
        if (existingUser != null)
        {
            return Response<CreateUserDto>.ErrorResponse("Validation failed", "Email already exists.");
        }

        var existingUserName = await _userManager.FindByNameAsync(model.UserName.Trim());
        if (existingUserName != null)
        {
            return Response<CreateUserDto>.ErrorResponse("Validation failed", "Username already exists.");
        }

        if (model.Password != model.ConfirmPassword)
        {
            return Response<CreateUserDto>.ErrorResponse("Validation failed", "Password and confirm password do not match.");
        }

        var user = new ApplicationUser
        {
            Name = model.Name.Trim(),
            Email = model.Email.Trim(),
            UserName = model.UserName.Trim(),
            RoleId = model.RoleId,
            IsActive = model.IsActive,
            CreatedAt = model.CreatedAt,
            EmailConfirmed = true,
            PhoneNumber = !string.IsNullOrWhiteSpace(model.PhoneNumber) ? model.PhoneNumber.Trim() : null,
            PhoneNumberConfirmed = !string.IsNullOrWhiteSpace(model.PhoneNumber)
        };

        var result = await _userManager.CreateAsync(user, model.Password);

        if (!result.Succeeded)
        {
            var errors = string.Join(", ", result.Errors.Select(e => e.Description));
            return Response<CreateUserDto>.ErrorResponse("Validation failed", errors);
        }

        return Response<CreateUserDto>.SuccessResponse(model, "User created successfully.");
    }

    private static UserDto ToDto(ApplicationUser user) =>
        new()
        {
            Id = user.Id,
            Name = user.Name ?? string.Empty,
            Email = user.Email ?? string.Empty,
            UserName = user.UserName ?? string.Empty,
            RoleId = user.RoleId ?? 0,
            PhoneNumber = user.PhoneNumber ?? string.Empty,
            IsActive = user.IsActive,
            CreatedAt = user.CreatedAt
        };
}
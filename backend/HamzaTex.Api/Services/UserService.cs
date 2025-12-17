using HamzaTex.Api.Data;
using HamzaTex.Api.Entities;
using HamzaTex.Api.Models;
using HamzaTex.Api.Services.ViewModel;
using Microsoft.EntityFrameworkCore;

namespace HamzaTex.Api.Services;

public interface IUserService {
    Task<Response<CreateUserDto>> SignupAsync(CreateUserDto model);
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
        var validationResult = await ValidateNameAsync<UserDto>(model.UserName, id);
        if (validationResult is not null){
            return validationResult;
        }

        var entity = await _dbContext.Users.Where(user => user.Id == id).FirstOrDefaultAsync();
        if (entity is null){
            return Response<UserDto>.ErrorResponse("Not found", $"User with id '{id}' was not found.");
        }
        entity.Name = model.Name.Trim();
        entity.Email = model.Email.Trim();
        entity.UserName = model.UserName.Trim();
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

    public async Task<Response<CreateUserDto>> SignupAsync(CreateUserDto model){

        var validationResult = await ValidateEmailAsync(model.Email);
        if (validationResult is not null){
            return validationResult;
        }
        var validationnameResult = await ValidateNameAsync<CreateUserDto>(model.UserName);
        if (validationnameResult is not null){
            return validationnameResult;
        }
        var validationpasswordResult = ValidatePasswordAsync(model.Password);
        if (validationpasswordResult is not null){
            return validationpasswordResult;
        }   
        var validationconfirmpasswordResult = ValidateConfirmPasswordAsync(model.ConfirmPassword, model.Password);
        if (validationconfirmpasswordResult is not null){
            return validationconfirmpasswordResult;
        }
    
        if (model.Password != model.ConfirmPassword)
        {
            return Response<CreateUserDto>.ErrorResponse("Validation failed", "Password and confirm password do not match.");
        }
        
        var userEntity = ToEntity(model);
        await _dbContext.Users.AddAsync(userEntity);
        await _dbContext.SaveChangesAsync();
        
        return Response<CreateUserDto>.SuccessResponse(model, "User created successfully.");
    }

    
    private Response<CreateUserDto>? ValidatePasswordAsync(string password){
    if (string.IsNullOrWhiteSpace(password)){
        return Response<CreateUserDto>.ErrorResponse("Validation failed", "Password is required.");
    }
    var trimmedPassword = password.Trim();
    
    if (trimmedPassword.Length < 8){
        return Response<CreateUserDto>.ErrorResponse("Validation failed", "Password must be at least 8 characters long.");
    }
    
    if (trimmedPassword.Length > 255){
        return Response<CreateUserDto>.ErrorResponse("Validation failed", "Password must be less than 255 characters.");
    }
    
    if (!trimmedPassword.Any(char.IsUpper)){
        return Response<CreateUserDto>.ErrorResponse("Validation failed", "Password must contain at least one uppercase letter.");
    }
    
    if (!trimmedPassword.Any(char.IsLower)){
        return Response<CreateUserDto>.ErrorResponse("Validation failed", "Password must contain at least one lowercase letter.");
    }
    
    if (!trimmedPassword.Any(char.IsDigit)){
        return Response<CreateUserDto>.ErrorResponse("Validation failed", "Password must contain at least one digit.");
    }
    
    if (!trimmedPassword.Any(ch => !char.IsLetterOrDigit(ch) && !char.IsWhiteSpace(ch))){
        return Response<CreateUserDto>.ErrorResponse("Validation failed", "Password must contain at least one special character.");
    }
    
    return null;
    }
    private Response<CreateUserDto>? ValidateConfirmPasswordAsync(string confirmPassword, string password){
    if (string.IsNullOrWhiteSpace(password)){
        return Response<CreateUserDto>.ErrorResponse("Validation failed", "Confirm password is required.");
    }
    var trimmedConfirmPassword = confirmPassword.Trim();
    
    if (trimmedConfirmPassword.Length < 8){
        return Response<CreateUserDto>.ErrorResponse("Validation failed", "Confirm password must be at least 8 characters long.");
    }
    
    if (trimmedConfirmPassword.Length > 255){
        return Response<CreateUserDto>.ErrorResponse("Validation failed", "Confirm password must be less than 255 characters.");
    }
    
    if (!trimmedConfirmPassword.Any(char.IsUpper)){
        return Response<CreateUserDto>.ErrorResponse("Validation failed", "Confirm password must contain at least one uppercase letter.");
    }
    
    if (!trimmedConfirmPassword.Any(char.IsLower)){
        return Response<CreateUserDto>.ErrorResponse("Validation failed", "Confirm password must contain at least one lowercase letter.");
    }
    
    if (!trimmedConfirmPassword.Any(char.IsDigit)){
        return Response<CreateUserDto>.ErrorResponse("Validation failed", "Confirm password must contain at least one digit.");
    }
    
    if (!trimmedConfirmPassword.Any(ch => !char.IsLetterOrDigit(ch) && !char.IsWhiteSpace(ch))){
        return Response<CreateUserDto>.ErrorResponse("Validation failed", "Confirm password must contain at least one special character.");
    }

    if (trimmedConfirmPassword != password){
        return Response<CreateUserDto>.ErrorResponse("Validation failed", "Confirm password and password do not match.");
    }
    return null;
    }
    private async Task<Response<CreateUserDto>?> ValidateEmailAsync(string email){
        if (string.IsNullOrWhiteSpace(email)){
            return Response<CreateUserDto>.ErrorResponse("Validation failed", "Email is required.");
        }
        var trimmedEmail = email.Trim();
        if (trimmedEmail.Length > 255){
            return Response<CreateUserDto>.ErrorResponse("Validation failed", "Email must be less than 255 characters.");
        }
        if (await _dbContext.Users.AnyAsync(user => user.Email == trimmedEmail)){
            return Response<CreateUserDto>.ErrorResponse("Validation failed", "Email already exists.");
        }
        return null;
    }

     private async Task<Response<T>?> ValidateNameAsync<T>(string name, int? excludeId = null) where T : class
    {
        if (string.IsNullOrWhiteSpace(name))
        {
            return Response<T>.ErrorResponse("Validation failed", "Name is required.");
        }
        
        var trimmedName = name.Trim();

        if (trimmedName.Length > 255)
        {
            return Response<T>.ErrorResponse("Validation failed", "Name must be less than 255 characters.");
        }


        var query = _dbContext.Users.AsNoTracking().Where(user => user.UserName == trimmedName);

        if (excludeId.HasValue)
        {
            query = query.Where(user => user.Id != excludeId.Value);
        }

        if (await query.AnyAsync())
        {
            return Response<T>.ErrorResponse("Validation failed", "Username already exists.");
        }

        return null;
    }

    private static UserDto ToDto(User entity) =>
        new()
        {
            Id = entity.Id,
            Name = entity.Name ?? string.Empty,
            Email = entity.Email ?? string.Empty,
            UserName = entity.UserName ?? string.Empty,
            RoleId = entity.RoleId ?? 0,
            IsActive = entity.IsActive,
            CreatedAt = entity.CreatedAt
        };

    private static User ToEntity(CreateUserDto model) =>
        new()
        {
            Name = model.Name.Trim(),
            Email = model.Email.Trim(),
            UserName = model.UserName.Trim(),
            Password = BCrypt.Net.BCrypt.HashPassword(model.Password),
            RoleId = model.RoleId,
            IsActive = model.IsActive,
            CreatedAt = model.CreatedAt
        };

}
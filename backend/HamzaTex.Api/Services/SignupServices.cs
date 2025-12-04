using HamzaTex.Api.Data;
using HamzaTex.Api.Entities;
using HamzaTex.Api.Models;
using HamzaTex.Api.Services.ViewModel;
using Microsoft.AspNetCore.Mvc.ModelBinding;
using Microsoft.EntityFrameworkCore;

namespace HamzaTex.Api.Services;

public interface ISignupService {
    Task<Response<SignupDto>> CreateAsync(SignupDto model);
}

public class SignupService : ISignupService {
    private readonly ApplicationDbContext _dbContext;

    public SignupService(ApplicationDbContext dbContext)
    {
        _dbContext = dbContext ?? throw new ArgumentNullException(nameof(dbContext));
    }

    public async Task<Response<SignupDto>> CreateAsync(SignupDto model){

        var validationResult = await ValidateEmailAsync(model.Email);
        if (validationResult is not null){
            return validationResult;
        }
        var validationnameResult = await ValidateNameAsync(model.UserName);
        if (validationnameResult is not null){
            return validationnameResult;
        }
        var validationpasswordResult = ValidatePasswordAsync(model.Password);
        if (validationpasswordResult is not null){
            return validationpasswordResult;
        }   
        var validationconfirmpasswordResult = ValidateConfirmPasswordAsync(model.ConfirmPassword);
        if (validationconfirmpasswordResult is not null){
            return validationconfirmpasswordResult;
        }
    
        if (model.Password != model.ConfirmPassword)
        {
            return Response<SignupDto>.ErrorResponse("Validation failed", "Password and confirm password do not match.");
        }
        
        var userEntity = ToUserEntity(model);
        await _dbContext.Users.AddAsync(userEntity);
        await _dbContext.SaveChangesAsync();
        
        var loginEntity = ToLoginEntity(model, userEntity.Id);
        await _dbContext.Logins.AddAsync(loginEntity);
        await _dbContext.SaveChangesAsync();
        
        return Response<SignupDto>.SuccessResponse(ToDto(userEntity, loginEntity), "User created successfully.");
    }

    
    private Response<SignupDto>? ValidatePasswordAsync(string password){
        if (string.IsNullOrWhiteSpace(password)){
            return Response<SignupDto>.ErrorResponse("Validation failed", "Password is required.");
        }
        var trimmedPassword = password.Trim();
        if (trimmedPassword.Length > 255){
            return Response<SignupDto>.ErrorResponse("Validation failed", "Password must be less than 255 characters.");
        }
        return null;
    }
    private Response<SignupDto>? ValidateConfirmPasswordAsync(string confirmPassword){
        if (string.IsNullOrWhiteSpace(confirmPassword)){
            return Response<SignupDto>.ErrorResponse("Validation failed", "Confirm password is required.");
        }
        var trimmedConfirmPassword = confirmPassword.Trim();
        if (trimmedConfirmPassword.Length > 255){
            return Response<SignupDto>.ErrorResponse("Validation failed", "Confirm password must be less than 255 characters.");
        }
        return null;
    }
    private async Task<Response<SignupDto>?> ValidateEmailAsync(string email){
        if (string.IsNullOrWhiteSpace(email)){
            return Response<SignupDto>.ErrorResponse("Validation failed", "Email is required.");
        }
        var trimmedEmail = email.Trim();
        if (trimmedEmail.Length > 255){
            return Response<SignupDto>.ErrorResponse("Validation failed", "Email must be less than 255 characters.");
        }
        if (await _dbContext.Users.AnyAsync(user => user.Email == trimmedEmail)){
            return Response<SignupDto>.ErrorResponse("Validation failed", "Email already exists.");
        }
        return null;
    }

     private async Task<Response<SignupDto>?> ValidateNameAsync(string name, int? excludeId = null)
    {
        if (string.IsNullOrWhiteSpace(name))
        {
            return Response<SignupDto>.ErrorResponse("Validation failed", "Name is required.");
        }
        
        var trimmedName = name.Trim();

        if (trimmedName.Length > 255)
        {
            return Response<SignupDto>.ErrorResponse("Validation failed", "Name must be less than 255 characters.");
        }


        var query = _dbContext.Logins.AsNoTracking().Where(login => login.Username == trimmedName);

        if (excludeId.HasValue)
        {
            query = query.Where(login => login.Id != excludeId.Value);
        }

        if (await query.AnyAsync())
        {
            return Response<SignupDto>.ErrorResponse("Validation failed", "Username already exists.");
        }

        return null;
    }

    private static User ToUserEntity(SignupDto model) =>
        new()
        {
            Name = model.Name.Trim(),
            Email = model.Email.Trim(),
            RoleId = model.RoleId,
            IsActive = true,
            CreatedAt = model.CreatedAt
        };

    private static Login ToLoginEntity(SignupDto model, int userId) =>
        new()
        {
            UserId = userId,
            Username = model.UserName.Trim(),
            Password = BCrypt.Net.BCrypt.HashPassword(model.Password),
            CreatedAt = model.CreatedAt
        };

    private static SignupDto ToDto(User userEntity, Login loginEntity) =>
        new()
        {
            Name = userEntity.Name ?? string.Empty,
            UserName = loginEntity.Username ?? string.Empty,
            Email = userEntity.Email ?? string.Empty,
            Password = string.Empty,
            ConfirmPassword = string.Empty,
            RoleId = userEntity.RoleId ?? 0,
            CreatedAt = userEntity.CreatedAt
        };

}
using BCrypt.Net;
using HamzaTex.Api.Data;
using HamzaTex.Api.Models;
using HamzaTex.Api.Services.ViewModel;
using Microsoft.EntityFrameworkCore;

namespace HamzaTex.Api.Services;

public interface IChangePasswordService
{
    Task<Response<ChangePasswordResponseDto>> changePasswordAsync(ChangePasswordDto model);
}

public class ChangePasswordService : IChangePasswordService
{
    private readonly ApplicationDbContext _dbContext;

    public ChangePasswordService(ApplicationDbContext dbContext)
    {
        _dbContext = dbContext ?? throw new ArgumentNullException(nameof(dbContext));
    }

    public async Task<Response<ChangePasswordResponseDto>> changePasswordAsync(ChangePasswordDto model){
        var user = await _dbContext.Users.Where(user => user.Id == model.UserId).FirstOrDefaultAsync();
        if (user is null){
            return Response<ChangePasswordResponseDto>.ErrorResponse("Not Found", $"User was not found.");
        }

        var login = await _dbContext.Logins.Where(login => login.UserId == model.UserId).FirstOrDefaultAsync();
        if (login is null){
            return Response<ChangePasswordResponseDto>.ErrorResponse("Not Found", $"Login was not found.");
        }

        var isValidOldPassword = BCrypt.Net.BCrypt.Verify(model.OldPassword, login.Password);
        if (!isValidOldPassword){
            return Response<ChangePasswordResponseDto>.ErrorResponse("Unauthorized", $"Old password is incorrect.");
        }

        var newPassword = model.NewPassword.Trim();
        var ConfirmPassword = model.ConfirmPassword.Trim();

        if (ValidatePasswordAsync(newPassword) is not null){
            return Response<ChangePasswordResponseDto>.ErrorResponse("Validation failed", "New password is not valid.");
        }

        if (ValidatePasswordAsync(ConfirmPassword) is not null){
            return Response<ChangePasswordResponseDto>.ErrorResponse("Validation failed", "Confirm password is not valid.");
        }

        if (newPassword == model.OldPassword){
            return Response<ChangePasswordResponseDto>.ErrorResponse("Validation failed", "New password cannot be the same as the old password.");
        }

        if (newPassword != ConfirmPassword){
            return Response<ChangePasswordResponseDto>.ErrorResponse("Validation failed", "New password and confirm password do not match.");
        }

        login.Password = BCrypt.Net.BCrypt.HashPassword(newPassword);
        await _dbContext.SaveChangesAsync();
        return Response<ChangePasswordResponseDto>.SuccessResponse(new ChangePasswordResponseDto {
            UserId = user.Id,
            Message = "Password changed successfully.",
        }, "Password changed successfully.");

    }

    private Response<ChangePasswordResponseDto>? ValidatePasswordAsync(string password){
    if (string.IsNullOrWhiteSpace(password)){
        return Response<ChangePasswordResponseDto>.ErrorResponse("Validation failed", "Password is required.");
    }
    var trimmedPassword = password.Trim();
    
    if (trimmedPassword.Length < 8){
        return Response<ChangePasswordResponseDto>.ErrorResponse("Validation failed", "Password must be at least 8 characters long.");
    }
    
    if (trimmedPassword.Length > 255){
        return Response<ChangePasswordResponseDto>.ErrorResponse("Validation failed", "Password must be less than 255 characters.");
    }
    
    if (!trimmedPassword.Any(char.IsUpper)){
        return Response<ChangePasswordResponseDto>.ErrorResponse("Validation failed", "Password must contain at least one uppercase letter.");
    }
    
    if (!trimmedPassword.Any(char.IsLower)){
        return Response<ChangePasswordResponseDto>.ErrorResponse("Validation failed", "Password must contain at least one lowercase letter.");
    }
    
    if (!trimmedPassword.Any(char.IsDigit)){
        return Response<ChangePasswordResponseDto>.ErrorResponse("Validation failed", "Password must contain at least one digit.");
    }
    
    if (!trimmedPassword.Any(ch => !char.IsLetterOrDigit(ch) && !char.IsWhiteSpace(ch))){
        return Response<ChangePasswordResponseDto>.ErrorResponse("Validation failed", "Password must contain at least one special character.");
    }
    
    return null;
    }
    
}
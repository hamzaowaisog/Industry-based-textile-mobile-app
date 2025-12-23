using HamzaTex.Api.Data;
using HamzaTex.Api.Entities;
using HamzaTex.Api.Models;
using HamzaTex.Api.Services.ViewModel;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace HamzaTex.Api.Services;

public interface IChangePasswordService
{
    Task<Response<ChangePasswordResponseDto>> ChangePasswordAsync(ChangePasswordDto model);
}

public class ChangePasswordService : IChangePasswordService
{
    private readonly UserManager<ApplicationUser> _userManager;

    public ChangePasswordService(UserManager<ApplicationUser> userManager)
    {
        _userManager = userManager ?? throw new ArgumentNullException(nameof(userManager));
    }

    public async Task<Response<ChangePasswordResponseDto>> ChangePasswordAsync(ChangePasswordDto model)
    {
        var user = await _userManager.Users
            .FirstOrDefaultAsync(u => u.Id == model.UserId);

        if (user is null)
        {
            return Response<ChangePasswordResponseDto>.ErrorResponse("Not Found", $"User was not found.");
        }

        var isValidOldPassword = await _userManager.CheckPasswordAsync(user, model.OldPassword);
        if (!isValidOldPassword)
        {
            return Response<ChangePasswordResponseDto>.ErrorResponse("Unauthorized", $"Old password is incorrect.");
        }

        var newPassword = model.NewPassword.Trim();
        var confirmPassword = model.ConfirmPassword.Trim();

        if (newPassword != confirmPassword)
        {
            return Response<ChangePasswordResponseDto>.ErrorResponse("Validation failed", "New password and confirm password do not match.");
        }

        if (newPassword == model.OldPassword)
        {
            return Response<ChangePasswordResponseDto>.ErrorResponse("Validation failed", "New password cannot be the same as the old password.");
        }

        var result = await _userManager.ChangePasswordAsync(user, model.OldPassword, newPassword);

        if (!result.Succeeded)
        {
            var errors = string.Join(", ", result.Errors.Select(e => e.Description));
            return Response<ChangePasswordResponseDto>.ErrorResponse("Validation failed", errors);
        }

        return Response<ChangePasswordResponseDto>.SuccessResponse(new ChangePasswordResponseDto
        {
            UserId = user.Id,
            Message = "Password changed successfully."
        }, "Password changed successfully.");
    }
}

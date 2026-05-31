using HamzaTex.Api.Data;
using HamzaTex.Api.Entities;
using HamzaTex.Api.Models;
using HamzaTex.Api.Helpers;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity.UI.Services;
using Microsoft.Extensions.Logging;

namespace HamzaTex.Api.Services;

/// <summary>User account management — signup, profile, password reset, and email confirmation.</summary>
public interface IUserService
{
    /// <summary>Register a new user and send an email confirmation link.</summary>
    Task<Response<CreateUserDto>> SignupAsync(CreateUserDto model);
    /// <summary>Get a user by ID including their role.</summary>
    Task<Response<UserDto>> GetByIdAsync(int id);
    /// <summary>Get all users.</summary>
    Task<Response<List<UserDto>>> GetAllAsync();
    /// <summary>Update a user's profile fields by ID.</summary>
    Task<Response<UserDto>> UpdateByIdAsync(int id, UpdateUserByIdDto model);
    /// <summary>Delete a user by ID.</summary>
    Task<Response> DeleteByIdAsync(int id);
    /// <summary>Resend the email confirmation link to the given address.</summary>
    Task<Response> ResendEmailConfirmationAsync(string email);
    /// <summary>Confirm a user's email address using the token from the confirmation email.</summary>
    Task<Response> EmailConfirmationTokenAsync(EmailConfirmationDto model);
    /// <summary>Admin-only: create a pre-confirmed user account with no email flow required.</summary>
    Task<Response<UserDto>> AdminCreateAsync(CreateUserDto model);
}

public class UserService : IUserService
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly ApplicationDbContext _dbContext;
    private readonly IConfiguration _configuration;
    private readonly IEmailSender _emailSender;
    private readonly ILogger<UserService> _logger;

    public UserService(UserManager<ApplicationUser> userManager, ApplicationDbContext dbContext, IConfiguration configuration, IEmailSender emailSender, ILogger<UserService> logger)
    {
        _userManager = userManager ?? throw new ArgumentNullException(nameof(userManager));
        _dbContext = dbContext ?? throw new ArgumentNullException(nameof(dbContext));
        _configuration = configuration ?? throw new ArgumentNullException(nameof(configuration));
        _emailSender = emailSender ?? throw new ArgumentNullException(nameof(emailSender));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
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
            CreatedAt = DateOnly.FromDateTime(DateTime.UtcNow),
            EmailConfirmed = false,
            PhoneNumber = !string.IsNullOrWhiteSpace(model.PhoneNumber) ? model.PhoneNumber.Trim() : null,
            PhoneNumberConfirmed = !string.IsNullOrWhiteSpace(model.PhoneNumber)
        };

        var result = await _userManager.CreateAsync(user, model.Password);

        if (!result.Succeeded)
        {
            var errors = string.Join(", ", result.Errors.Select(e => e.Description));
            return Response<CreateUserDto>.ErrorResponse("Validation failed", errors);
        }

        var token = await _userManager.GenerateEmailConfirmationTokenAsync(user);
        var code = Uri.EscapeDataString(token);

        var baseUrl = _configuration["App:PublicBaseUrl"];
        var link = $"{baseUrl}/api/auth/confirm-email?userId={user.Id}&code={code}";
        var expirationMinutes = _configuration["App:EmailConfirmationTokenExpirationMinutes"] ?? "10";
        var htmlMessage = AuthHtmlHelper.GetConfirmEmailTemplateHtml(link, expirationMinutes);
        try
        {
            await _emailSender.SendEmailAsync(email: user.Email!, subject: "Confirm your email", htmlMessage: htmlMessage);
            return Response<CreateUserDto>.SuccessResponse(model, "Registration successful. Please check your email to confirm your account.");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Confirmation email failed for user {UserId}", user.Id);
            return Response<CreateUserDto>.SuccessResponse(model,
                "Account created, but the confirmation email could not be sent. Use 'Resend Confirmation' to try again.");
        }
    }

    public async Task<Response> EmailConfirmationTokenAsync(EmailConfirmationDto model)
    {
        var user = await _userManager.FindByIdAsync(model.UserId.ToString());
        if (user is null) return Response.ErrorResponse("Not found", $"User with id '{model.UserId}' was not found.");

        var token = Uri.UnescapeDataString(model.Code);
        var result = await _userManager.ConfirmEmailAsync(user, token);

        if (!result.Succeeded) return Response.ErrorResponse("Validation failed", string.Join(", ", result.Errors.Select(e => e.Description)));

        return Response.SuccessResponse("Email confirmed successfully");
    }

    public async Task<Response> ResendEmailConfirmationAsync(string email)
    {
        var user = await _userManager.FindByEmailAsync(email);

        if (user is null) return Response.ErrorResponse("Not found", $"User with email '{email}' was not found.");
        if (await _userManager.IsEmailConfirmedAsync(user)) return Response.SuccessResponse("Email already confirmed");

        var token = await _userManager.GenerateEmailConfirmationTokenAsync(user);
        var code = Uri.EscapeDataString(token);

        var baseUrl = _configuration["App:PublicBaseUrl"];
        var link = $"{baseUrl}/api/auth/confirm-email?userId={user.Id}&code={code}";
        var expirationMinutes = _configuration["App:EmailConfirmationTokenExpirationMinutes"] ?? "10";
        var htmlMessage = AuthHtmlHelper.GetConfirmEmailTemplateHtml(link, expirationMinutes);
        try
        {
            await _emailSender.SendEmailAsync(email: user.Email!, subject: "Confirm your email", htmlMessage: htmlMessage);
            return Response.SuccessResponse("Confirmation email sent. Please check your inbox.");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Resend confirmation email failed for {Email}", email);
            return Response.ErrorResponse("Email send failed", "Could not send the confirmation email. Check SMTP settings or try again later.");
        }

    }

    public async Task<Response<UserDto>> AdminCreateAsync(CreateUserDto model)
    {
        var existingEmail = await _userManager.FindByEmailAsync(model.Email.Trim());
        if (existingEmail is not null)
            return Response<UserDto>.ErrorResponse("Validation failed", "Email already exists.");

        var existingUserName = await _userManager.FindByNameAsync(model.UserName.Trim());
        if (existingUserName is not null)
            return Response<UserDto>.ErrorResponse("Validation failed", "Username already exists.");

        if (model.Password != model.ConfirmPassword)
            return Response<UserDto>.ErrorResponse("Validation failed", "Password and confirm password do not match.");

        var user = new ApplicationUser
        {
            Name = model.Name.Trim(),
            Email = model.Email.Trim(),
            UserName = model.UserName.Trim(),
            RoleId = model.RoleId,
            IsActive = model.IsActive,
            CreatedAt = DateOnly.FromDateTime(DateTime.UtcNow),
            EmailConfirmed = false,
            PhoneNumber = !string.IsNullOrWhiteSpace(model.PhoneNumber) ? model.PhoneNumber.Trim() : null,
            PhoneNumberConfirmed = !string.IsNullOrWhiteSpace(model.PhoneNumber)
        };

        var createResult = await _userManager.CreateAsync(user, model.Password);
        if (!createResult.Succeeded)
            return Response<UserDto>.ErrorResponse("Create failed", string.Join(", ", createResult.Errors.Select(e => e.Description)));

        var token = await _userManager.GenerateEmailConfirmationTokenAsync(user);
        var confirmResult = await _userManager.ConfirmEmailAsync(user, token);
        if (!confirmResult.Succeeded)
            return Response<UserDto>.ErrorResponse("Confirmation failed", string.Join(", ", confirmResult.Errors.Select(e => e.Description)));

        var created = await _userManager.Users.Include(u => u.Role).FirstOrDefaultAsync(u => u.Id == user.Id);
        return Response<UserDto>.SuccessResponse(ToDto(created!), "User created successfully.");
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

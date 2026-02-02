using HamzaTex.Api.Data;
using HamzaTex.Api.Entities;
using HamzaTex.Api.Models;
using HamzaTex.Api.Helpers;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity.UI.Services;

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
    private readonly IConfiguration _configuration;
    private readonly IEmailSender _emailSender;

    public UserService(UserManager<ApplicationUser> userManager, ApplicationDbContext dbContext, IConfiguration configuration, IEmailSender emailSender)
    {
        _userManager = userManager ?? throw new ArgumentNullException(nameof(userManager));
        _dbContext = dbContext ?? throw new ArgumentNullException(nameof(dbContext));
        _configuration = configuration ?? throw new ArgumentNullException(nameof(configuration));
        _emailSender = emailSender ?? throw new ArgumentNullException(nameof(emailSender));
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
        var htmlMessage = $@"
        <!DOCTYPE html>
        <html lang='en'>
        <head>
            <meta charset='UTF-8'>
            <meta name='viewport' content='width=device-width, initial-scale=1.0'>
            <title>Confirm Your Email</title>
            <style>
                body {{
                    font-family: 'Arial', sans-serif;
                    background-color: #f9f9f9;
                    color: #333;
                    margin: 0;
                    padding: 0;
                }}
                table {{
                    width: 100%;
                    border-collapse: collapse;
                }}
                .container {{
                    max-width: 600px;
                    margin: 0 auto;
                    background-color: #ffffff;
                    border-radius: 8px;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
                }}
                .header {{
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    padding: 40px;
                    text-align: center;
                    border-radius: 8px 8px 0 0;
                }}
                .header h1 {{
                    font-size: 30px;
                    font-weight: 700;
                    margin: 0;
                }}
                .header p {{
                    font-size: 16px;
                    margin-top: 8px;
                    opacity: 0.85;
                }}
                .body {{
                    padding: 40px;
                    font-size: 16px;
                    color: #4a5568;
                }}
                .body h2 {{
                    font-size: 26px;
                    color: #2d3748;
                    margin-bottom: 20px;
                    font-weight: 600;
                }}
                .cta-button {{
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    padding: 16px 40px;
                    border-radius: 6px;
                    text-align: center;
                    margin-top: 30px;
                }}
                .cta-button a {{
                    color: #ffffff;
                    text-decoration: none;
                    font-size: 16px;
                    font-weight: 600;
                }}
                .footer {{
                    background-color: #f7fafc;
                    color: #718096;
                    padding: 32px 40px;
                    border-top: 1px solid #e2e8f0;
                    font-size: 13px;
                    text-align: center;
                }}
                .footer a {{
                    color: #667eea;
                    text-decoration: none;
                }}
                .brand-footer {{
                    background-color: #ffffff;
                    text-align: center;
                    padding: 24px 40px;
                    font-size: 12px;
                    color: #a0aec0;
                }}
                .link-box {{
                    background-color: #f7fafc;
                    padding: 12px;
                    border-radius: 4px;
                    word-wrap: break-word;
                    margin-top: 20px;
                }}
                .link-box a {{
                    font-size: 13px;
                    color: #667eea;
                }}
            </style>
        </head>
        <body>

            <table role='presentation'>
                <tr>
                    <td style='padding: 40px 20px;'>
                        <div class='container'>
                            <!-- Header -->
                            <div class='header'>
                                <h1>HamzaTex</h1>
                                <p>Premium Textile Solutions</p>
                            </div>

                            <!-- Body -->
                            <div class='body'>
                                <h2>Welcome to HamzaTex!</h2>
                                <p>Thank you for joining our textile community. We're thrilled to have you with us!</p>
                                <p>To get started, please confirm your email address by clicking the button below:</p>
                                
                                <!-- CTA Button -->
                                <div class='cta-button'>
                                    <a href='{link}'>Confirm Email Address</a>
                                </div>
                            </div>

                            <!-- Footer -->
                            <div class='footer'>
                                <p>This link will expire in {_configuration["App:EmailConfirmationTokenExpirationHours"]} hours for security reasons.</p>
                                <p>If you didn't create an account with HamzaTex, you can safely ignore this email.</p>
                            </div>

                            <!-- Brand Footer -->
                            <div class='brand-footer'>
                                <p>© 2026 HamzaTex. All rights reserved.</p>
                            </div>

                        </div>
                    </td>
                </tr>
            </table>

        </body>
        </html>";
        await _emailSender.SendEmailAsync(email: user.Email, subject: "Confirm your email", htmlMessage: htmlMessage);

        return Response<CreateUserDto>.SuccessResponse(model, "Registration successful. Please check your email for confirmation.");
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
using System.Security.Claims;
using HamzaTex.Api.Models;
using HamzaTex.Api.Services;
using HamzaTex.Api.Helpers;
using HamzaTex.Api.Services.ViewModel;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HamzaTex.Api.Controllers;

/// <summary>User account management. GET and DELETE require Admin or Staff. PUT /me allows any authenticated user to update their own profile.</summary>
[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
public class UsersController : BaseController
{
    private readonly IUserService _userService;
    private readonly IPdfService _pdfService;

    public UsersController(IUserService userService, IPdfService pdfService)
    {
        _userService = userService;
        _pdfService = pdfService;
    }

    /// <summary>Get a user by ID.</summary>
    [HttpGet("{id}")]
    [Authorize(Policy = "AdminOrStaff")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetUserById(int id)
    {
        var response = await _userService.GetByIdAsync(id);
        return ToActionResult(response);
    }

    /// <summary>Get all users.</summary>
    [HttpGet]
    [Authorize(Policy = "AdminOrStaff")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAllUsers()
    {
        var response = await _userService.GetAllAsync();
        return ToActionResult(response);
    }

    /// <summary>Update the authenticated user's own profile (name, email, username, phone).</summary>
    [HttpPut("me")]
    [Authorize(Policy = "Authenticated")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateUserById([FromBody] UserUpdateViewModel model)
    {
        if (!ModelState.IsValid)
        {
            return ValidationProblem(ModelState);
        }

        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
        if (userIdClaim is null || !int.TryParse(userIdClaim.Value, out var userId))
        {
            return Unauthorized("User identifier is missing or invalid in the token.");
        }

        var dto = new UpdateUserByIdDto
        {
            Name = model.Name,
            Email = model.Email,
            UserName = model.UserName,
            RoleId = model.RoleId,
            IsActive = model.IsActive,
            PhoneNumber = model.PhoneNumber
        };

        var response = await _userService.UpdateByIdAsync(userId, dto);
        return ToActionResult(response);
    }

    /// <summary>Delete a user by ID. Admin only.</summary>
    [HttpDelete("{id}")]
    [Authorize(Policy = "AdminOnly")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteUserById(int id)
    {
        var response = await _userService.DeleteByIdAsync(id);
        return ToActionResult(response);
    }

    /// <summary>Download all users as a PDF report.</summary>
    [HttpGet("pdf")]
    [Authorize(Policy = "AdminOrStaff")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAllUsersPdf()
    {
        var response = await _userService.GetAllAsync();
        if (!response.Success)
            return BadRequest(response.Message);

        var users = response.Data ?? new List<UserDto>();
        var pdfBytes = _pdfService.CreatePdf("Users", "List of users", users, EntityPdfConfigs.User);
        return File(pdfBytes, "application/pdf", "users.pdf");
    }
}

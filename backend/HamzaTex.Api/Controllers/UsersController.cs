using System.Security.Claims;
using HamzaTex.Api.Models;
using HamzaTex.Api.Services;
using HamzaTex.Api.Helpers;
using HamzaTex.Api.Services.ViewModel;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HamzaTex.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UsersController : BaseController
{
    private readonly IUserService _userService;

    public UsersController(IUserService userService)
    {
        _userService = userService;
    }

    [HttpGet("{id}")]
    [Authorize(Policy = "AdminOrStaff")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetUserById(int id)
    {
        var response = await _userService.GetByIdAsync(id);
        return ToActionResult(response);
    }

    [HttpGet]
    [Authorize(Policy = "AdminOrStaff")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAllUsers()
    {
        var response = await _userService.GetAllAsync();
        return ToActionResult(response);
    }

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

    [HttpDelete("{id}")]
    [Authorize(Policy = "AdminOnly")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteUserById(int id)
    {
        var response = await _userService.DeleteByIdAsync(id);
        return ToActionResult(response);
    }

}

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
[AllowAnonymous]
public class UsersController : BaseController
{
    private readonly IUserService _userService;

    public UsersController(IUserService userService)
    {
        _userService = userService;
    }

    [HttpPost]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CreateUser([FromBody] UserCreateViewModel model)
    {
        if (!ModelState.IsValid)
        {
            return ValidationProblem(ModelState);
        }

        var dto = new CreateUserDto
        {
            Name = model.Name,
            Email = model.Email,
            UserName = model.UserName,
            Password = model.Password,
            ConfirmPassword = model.ConfirmPassword,
            RoleId = model.RoleId,
            IsActive = model.IsActive,
            PhoneNumber = model.PhoneNumber,
            CreatedAt = model.CreatedAt
        };

        var response = await _userService.SignupAsync(dto);
        return ToActionResult(response);
    }

    [HttpGet("{id}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetUserById(int id)
    {
        var response = await _userService.GetByIdAsync(id);
        return ToActionResult(response);
    }

    [HttpGet]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAllUsers()
    {
        var response = await _userService.GetAllAsync();
        return ToActionResult(response);
    }

    [HttpPut]
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
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteUserById(int id)
    {
        var response = await _userService.DeleteByIdAsync(id);
        return ToActionResult(response);
    }

}

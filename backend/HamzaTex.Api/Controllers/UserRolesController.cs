using System;
using HamzaTex.Api.Models;
using HamzaTex.Api.Services;
using HamzaTex.Api.Services.ViewModel;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HamzaTex.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Policy = "AdminOnly")]
public class UserRolesController : ControllerBase
{
    private readonly IUserRoleService _userRoleService;

    public UserRolesController(IUserRoleService userRoleService)
    {
        _userRoleService = userRoleService;
    }

    [HttpPost]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CreateUserRole([FromBody] UserRoleCreateViewModel model)
    {
        if (!ModelState.IsValid)
        {
            return ValidationProblem(ModelState);
        }

        var dto = new CreateUserRoleDto
        {
            Name = model.Name,
            CreatedAt = model.CreatedAt
        };

        var response = await _userRoleService.CreateAsync(dto);
        return ToActionResult(response);
    }

    [HttpGet]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAllUserRoles()
    {
        var response = await _userRoleService.GetAllAsync();
        return ToActionResult(response);
    }

    [HttpGet("{id}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetUserRoleById(int id)
    {
        var response = await _userRoleService.GetByIdAsync(id);
        return ToActionResult(response);
    }

    [HttpPut("{id}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateUserRole(int id, [FromBody] UpdateUserRoleViewModel model)
    {
        if (id != model.Id)
        {
            ModelState.AddModelError(nameof(model.Id), "Route id must match payload id.");
        }

        if (!ModelState.IsValid)
        {
            return ValidationProblem(ModelState);
        }

        var dto = new UpdateUserRoleDto
        {
            Name = model.Name
        };

        var response = await _userRoleService.UpdateAsync(id, dto);
        return ToActionResult(response);
    }

    [HttpDelete("{id}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteUserRole(int id)
    {
        var response = await _userRoleService.DeleteAsync(id);

        if (!response.Success && IsNotFound(response.Message))
        {
            return NotFound(response);
        }

        if (!response.Success)
        {
            return BadRequest(response);
        }

        return Ok(response);
    }

    private IActionResult ToActionResult<T>(Response<T> response)
    {
        if (response.Success)
        {
            return Ok(response);
        }

        if (IsNotFound(response.Message))
        {
            return NotFound(response);
        }

        return BadRequest(response);
    }

    private static bool IsNotFound(string message) =>
        string.Equals(message, "Not found", StringComparison.OrdinalIgnoreCase);
}
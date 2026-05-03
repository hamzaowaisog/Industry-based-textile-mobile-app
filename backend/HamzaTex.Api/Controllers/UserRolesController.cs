using System;
using HamzaTex.Api.Models;
using HamzaTex.Api.Services;
using HamzaTex.Api.Helpers;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using HamzaTex.Api.Services.ViewModel;

namespace HamzaTex.Api.Controllers;

/// <summary>User role management. Admin only. Seeded values: Admin (1), Staff (2).</summary>
[ApiController]
[Route("api/[controller]")]
[Authorize(Policy = "AdminOnly")]
[Produces("application/json")]
public class UserRolesController : BaseController
{
    private readonly IUserRoleService _userRoleService;
    private readonly IPdfService _pdfService;

    public UserRolesController(IUserRoleService userRoleService, IPdfService pdfService)
    {
        _userRoleService = userRoleService;
        _pdfService = pdfService;
    }

    /// <summary>Create a new user role.</summary>
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

    /// <summary>Get all user roles.</summary>
    [HttpGet]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAllUserRoles()
    {
        var response = await _userRoleService.GetAllAsync();
        return ToActionResult(response);
    }

    /// <summary>Get a single user role by ID.</summary>
    [HttpGet("{id}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetUserRoleById(int id)
    {
        var response = await _userRoleService.GetByIdAsync(id);
        return ToActionResult(response);
    }

    /// <summary>Update a user role by ID.</summary>
    [HttpPut("{id}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateUserRole(int id, [FromBody] UpdateUserRoleViewModel model)
    {
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

    /// <summary>Delete a user role by ID.</summary>
    [HttpDelete("{id}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteUserRole(int id)
    {
        var response = await _userRoleService.DeleteAsync(id);
        return ToActionResult(response);
    }

    /// <summary>Download all user roles as a PDF report.</summary>
    [HttpGet("pdf")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAllUserRolesPdf()
    {
        var response = await _userRoleService.GetAllAsync();
        if (!response.Success)
            return BadRequest(response.Message);

        var roles = response.Data ?? new List<UserRoleDto>();
        var pdfBytes = _pdfService.CreatePdf("User Roles", "List of user roles", roles, EntityPdfConfigs.UserRole, new PdfOptions { ShowRowNumbers = true });
        return File(pdfBytes, "application/pdf", "user-roles.pdf");
    }
}
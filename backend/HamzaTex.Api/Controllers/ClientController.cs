using System.Security.Claims;
using HamzaTex.Api.Helpers;
using HamzaTex.Api.Models;
using HamzaTex.Api.Services;
using HamzaTex.Api.Services.ViewModel;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HamzaTex.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Policy = "Authenticated")]
public class ClientController : BaseController
{
    private readonly IClientService _clientService;

    public ClientController(IClientService clientService)
    {
        _clientService = clientService;
    }

    [HttpGet("Filtered")]
    [Authorize(Policy = "Authenticated")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAllClientsFiltered(int page =1 , int pageSize = 5)
    {
        var response = await _clientService.GetAllPaginatedAsync(page, pageSize);
        return ToActionResult(response);
    }

    [HttpPost]
    [Authorize(Policy = "Authenticated")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CreateClient([FromBody] ClientCreateViewModel model)
    {
        if (!ModelState.IsValid)
        {
            var validationResponse = ToValidationResponseFromModelState<ClientDto>();
            return ToActionResult(validationResponse);
        }

        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
        if (userIdClaim is null || !int.TryParse(userIdClaim.Value, out var userId))
        {
            return Unauthorized("User identifier is missing or invalid in the token.");
        }

        var dto = new CreateClientDto
        {
            Name = model.Name,
            ClientTypeId = model.ClientTypeId,
            UserId = userId,
            Phone = model.Phone,
            Address = model.Address,
            CreditLimit = model.CreditLimit,
            OpeningBalance = model.OpeningBalance,
            Notes = model.Notes,
            IsActive = model.IsActive,
            CreatedAt = model.CreatedAt
        };

        var response = await _clientService.CreateAsync(dto);
        return ToActionResult(response);
    }

    [HttpGet]
    [Authorize(Policy = "AdminOnly")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAllClients()
    {
        var response = await _clientService.GetAllAsync();
        return ToActionResult(response);
    }

    [HttpGet("me")]
    [Authorize(Policy = "Authenticated")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAllClientsByUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
        if (userIdClaim is null || !int.TryParse(userIdClaim.Value, out var userId))
        {
            return Unauthorized("User identifier is missing or invalid in the token.");
        }

        var response = await _clientService.GetAllByUserIdAsync(userId);
        return ToActionResult(response);
    }

    [HttpGet("{id}")]
    [Authorize(Policy = "Authenticated")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetClientById(int id)
    {
        var response = await _clientService.GetByIdAsync(id);
        return ToActionResult(response);
    }

    [HttpPut("{id}")]
    [Authorize(Policy = "AdminOrStaff")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateClientById(int id, [FromBody] ClientUpdateViewModel model)
    {
        if (!ModelState.IsValid)
        {
            var validationResponse = ToValidationResponseFromModelState<ClientDto>();
            return ToActionResult(validationResponse);
        }

        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
        if (userIdClaim is null || !int.TryParse(userIdClaim.Value, out var userId))
        {
            return Unauthorized("User identifier is missing or invalid in the token.");
        }

        var dto = new UpdateClientByIdDto
        {
            Name = model.Name,
            ClientTypeId = model.ClientTypeId,
            UserId = userId,
            Phone = model.Phone,
            Address = model.Address,
            CreditLimit = model.CreditLimit,
            OpeningBalance = model.OpeningBalance,
            Notes = model.Notes,
            IsActive = model.IsActive
        };

        var response = await _clientService.UpdateByIdAsync(id, dto);
        return ToActionResult(response);
    }


    [HttpDelete("{id}")]
    [Authorize(Policy = "AdminOnly")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteClientById(int id)
    {
        var response = await _clientService.DeleteByIdAsync(id);
        return ToActionResult(response);
    }

}

using System.Security.Claims;
using HamzaTex.Api.Helpers;
using HamzaTex.Api.Models;
using HamzaTex.Api.Services;
using HamzaTex.Api.Services.ViewModel;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HamzaTex.Api.Controllers;

/// <summary>Client management — customers and suppliers. Staff see their own clients; Admin sees all.</summary>
[ApiController]
[Route("api/[controller]")]
[Authorize(Policy = "Authenticated")]
[Produces("application/json")]
public class ClientController : BaseController
{
    private readonly IClientService _clientService;
    private readonly IPdfService _pdfService;

    public ClientController(IClientService clientService, IPdfService pdfService)
    {
        _clientService = clientService;
        _pdfService = pdfService;
    }

    /// <summary>Get paginated clients for the authenticated user.</summary>
    [HttpGet("Filtered")]
    [Authorize(Policy = "Authenticated")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAllClientsFiltered(int page = 1, int pageSize = 5)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
        if (userIdClaim is null || !int.TryParse(userIdClaim.Value, out var userId))
        {
            return Unauthorized("User identifier is missing or invalid in the token.");
        }

        var response = await _clientService.GetAllPaginatedAsync(page, pageSize, userId);
        return ToActionResult(response);
    }

    /// <summary>Create a new client (customer or supplier) for the authenticated user.</summary>
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
            IsActive = model.IsActive
        };

        var response = await _clientService.CreateAsync(dto);
        return ToActionResult(response);
    }

    /// <summary>Get all clients across all users. Admin only.</summary>
    [HttpGet]
    [Authorize(Policy = "AdminOnly")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAllClients()
    {
        var response = await _clientService.GetAllAsync();
        return ToActionResult(response);
    }

    /// <summary>Get all clients belonging to the authenticated user.</summary>
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

    /// <summary>Get a single client by ID.</summary>
    [HttpGet("{id}")]
    [Authorize(Policy = "Authenticated")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetClientById(int id)
    {
        var response = await _clientService.GetByIdAsync(id);
        return ToActionResult(response);
    }

    /// <summary>Update a client by ID.</summary>
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


    /// <summary>Delete a client by ID. Admin only.</summary>
    [HttpDelete("{id}")]
    [Authorize(Policy = "AdminOnly")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteClientById(int id)
    {
        var response = await _clientService.DeleteByIdAsync(id);
        return ToActionResult(response);
    }

    /// <summary>Download the authenticated user's client list as a PDF report.</summary>
    [HttpGet("pdf")]
    [Authorize(Policy = "Authenticated")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAllClientsPdf()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
        if (userIdClaim is null || !int.TryParse(userIdClaim.Value, out var userId))
            return Unauthorized("User identifier is missing or invalid in the token.");

        var response = await _clientService.GetAllByUserIdAsync(userId);
        if (!response.Success)
            return BadRequest(response.Message);

        var clients = response.Data ?? new List<ClientDto>();
        var pdfBytes = _pdfService.CreatePdf("Clients", "List of clients. All amounts in PKR.", clients, EntityPdfConfigs.Client, new PdfOptions { ShowRowNumbers = true, SummaryProperty = "OpeningBalance", SummaryLabel = "Total Opening Balance (PKR)" });
        return File(pdfBytes, "application/pdf", "clients.pdf");
    }
}

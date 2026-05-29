using System;
using HamzaTex.Api.Models;
using HamzaTex.Api.Services;
using HamzaTex.Api.Services.ViewModel;
using HamzaTex.Api.Helpers;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HamzaTex.Api.Controllers;

/// <summary>Client type management (Customer, Supplier). Admin only. Seeded values: Customer (1), Supplier (2).</summary>
[ApiController]
[Route("api/[controller]")]
[Authorize(Policy = "AdminOnly")]
[Produces("application/json")]
public class ClientTypeController : BaseController
{
    private readonly IClientTypeService _clientTypeService;
    private readonly IPdfService _pdfService;

    public ClientTypeController(IClientTypeService clientTypeService, IPdfService pdfService)
    {
        _clientTypeService = clientTypeService;
        _pdfService = pdfService;
    }

    /// <summary>Create a new client type.</summary>
    [HttpPost]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CreateClientType([FromBody] ClientTypeCreateViewModel model)
    {
        if (!ModelState.IsValid)
        {
            return ValidationProblem(ModelState);
        }

        var dto = new CreateClientTypeDto
        {
            Name = model.Name
        };

        var response = await _clientTypeService.CreateAsync(dto);
        return ToActionResult(response);
    }

    /// <summary>Get all client types.</summary>
    [HttpGet]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAllClientTypes()
    {
        var response = await _clientTypeService.GetAllAsync();
        return ToActionResult(response);
    }

    /// <summary>Get a single client type by ID.</summary>
    [HttpGet("{id}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetClientTypeById(int id)
    {
        var response = await _clientTypeService.GetByIdAsync(id);
        return ToActionResult(response);
    }

    /// <summary>Update a client type by ID.</summary>
    [HttpPut("{id}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateClientTypeById(int id, [FromBody] ClientTypeUpdateViewModel model)
    {
        if (!ModelState.IsValid)
        {
            return ValidationProblem(ModelState);
        }

        var dto = new UpdateClientTypeByIdDto { Name = model.Name };

        var response = await _clientTypeService.UpdateByIdAsync(id, dto);
        return ToActionResult(response);
    }

    /// <summary>Delete a client type by ID.</summary>
    [HttpDelete("{id}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteClientTypeById(int id)
    {
        var response = await _clientTypeService.DeleteByIdAsync(id);
        return ToActionResult(response);
    }

    /// <summary>Download all client types as a PDF report.</summary>
    [HttpGet("pdf")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAllClientTypesPdf()
    {
        var response = await _clientTypeService.GetAllAsync();
        if (!response.Success)
            return BadRequest(response.Message);

        var clientTypes = response.Data ?? new List<ClientTypeDto>();
        var pdfBytes = _pdfService.CreatePdf("Client Types", "List of client types", clientTypes, EntityPdfConfigs.ClientType, new PdfOptions { ShowRowNumbers = true });
        return File(pdfBytes, "application/pdf", "client-types.pdf");
    }
}
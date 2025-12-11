using HamzaTex.Api.Models;
using HamzaTex.Api.Services;
using HamzaTex.Api.Services.ViewModel;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HamzaTex.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Policy = "Authenticated")]  
public class ClientController : ControllerBase 
{

    private readonly IClientService _clientService;

    public ClientController(IClientService clientService)
    {
        _clientService = clientService;
    }

    [HttpPost]
    [Authorize(Policy = "AdminOnly")]  
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    
    public async Task<IActionResult> CreateClient([FromBody] ClientCreateViewModel model){
        if (!ModelState.IsValid){
            return ValidationProblem(ModelState);
        }

        var dto = new CreateClientDto {
            Name = model.Name,
            ClientTypeId = model.ClientTypeId,
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
    [Authorize(Policy = "Authenticated")]  
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAllClients(){
        var response = await _clientService.GetAllAsync();
        return ToActionResult(response);
    }
    

    [HttpGet("{id}")]
    [Authorize(Policy = "Authenticated")]  
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetClientById(int id){
        var response = await _clientService.GetByIdAsync(id);
        return ToActionResult(response);
    }
    [HttpPut("{id}")]
    [Authorize(Policy = "AdminOrStaff")]  
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateClientById(int id, [FromBody] ClientUpdateViewModel model){
        if (!ModelState.IsValid){
            return ValidationProblem(ModelState);
        }
        
        var dto = new UpdateClientByIdDto {
            Name = model.Name,
            ClientTypeId = model.ClientTypeId,
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
    public async Task<IActionResult> DeleteClientById (int id){
        var response = await _clientService.DeleteByIdAsync(id);
        
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

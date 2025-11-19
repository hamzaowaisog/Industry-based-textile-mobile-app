using System;
using HamzaTex.Api.Models;
using HamzaTex.Api.Services;
using HamzaTex.Api.Services.ViewModel;
using Microsoft.AspNetCore.Mvc;

namespace HamzaTex.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ClientTypeController : ControllerBase {

    private readonly IClientTypeService _clientTypeService;

    public ClientTypeController (IClientTypeService clientTypeService)
    {
        _clientTypeService = clientTypeService;
    }

    [HttpPost]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]

    public async Task<IActionResult> CreateClientType ([FromBody] ClientTypeCreateViewModel model){
        if (!ModelState.IsValid){
            return ValidationProblem(ModelState);
        }
        var dto = new CreateClientTypeDto{
            Name = model.Name,
            CreatedAt = model.CreatedAt
        };

        var response = await _clientTypeService.CreateAsync(dto);
        return ToActionResult(response);
    }
    
    [HttpGet]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAllClientTypes(){
        var response = await _clientTypeService.GetAllAsync();

        return ToActionResult(response);
    }

    [HttpGet("{id}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetClientTypeById(int id){
        var response = await _clientTypeService.GetByIdAsync(id);
        return ToActionResult(response);
    }


    [HttpPut("{id}")]    
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateClientTypeById(int id, [FromBody] ClientTypeUpdateViewModel model){
        if (id != model.Id){
            ModelState.AddModelError(nameof(model.Id), "Route id must match payload id.");
        }   
        if (!ModelState.IsValid)
        {
            return ValidationProblem(ModelState);
        }

        var dto = new UpdateClientTypeByIdDto { Name = model.Name };

        var response = await _clientTypeService.UpdateByIdAsync(id, dto);
        return ToActionResult(response);
    }

    [HttpDelete("{id}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteClientTypeById(int id){
        var response = await _clientTypeService.DeleteByIdAsync(id);
        
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
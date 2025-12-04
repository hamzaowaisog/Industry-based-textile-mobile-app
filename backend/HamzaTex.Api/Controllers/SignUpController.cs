using HamzaTex.Api.Models;
using HamzaTex.Api.Services.ViewModel;
using HamzaTex.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace HamzaTex.Api.Controllers;

[ApiController]
[Route("api/[controller]")]

public class SignUpController : ControllerBase
{
    private readonly ISignupService _signupService;

    public SignUpController(ISignupService signupService)
    {
        _signupService = signupService;
    }

    [HttpPost]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CreateSignUp([FromBody] SignupViewModel model){
        if (!ModelState.IsValid){
            return ValidationProblem(ModelState);
        }
        var dto = new SignupDto{
            Name = model.Name,
            UserName = model.UserName,
            Email = model.Email,
            Password = model.Password,
            ConfirmPassword = model.ConfirmPassword,
            RoleId = model.RoleId,
            CreatedAt = model.CreatedAt
        };
        var response = await _signupService.CreateAsync(dto);
        return ToActionResult(response);
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
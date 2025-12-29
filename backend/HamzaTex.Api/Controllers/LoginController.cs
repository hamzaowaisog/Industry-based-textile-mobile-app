using HamzaTex.Api.Models;
using HamzaTex.Api.Services;
using HamzaTex.Api.Services.ViewModel;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using HamzaTex.Api.Helpers;

namespace HamzaTex.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[AllowAnonymous]
public class LoginController : BaseController
{
    private readonly ILoginService _loginService;

    public LoginController(ILoginService loginService)
    {
        _loginService = loginService;
    }

    [HttpPost]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Login([FromBody] LoginViewModel model)
    {
        if (!ModelState.IsValid)
        {
            return ValidationProblem(ModelState);
        }

        var dto = new LoginDto
        {
            UserName = model.UserName,
            Password = model.Password
        };

        var response = await _loginService.LoginAsync(dto);
        return ToActionResult(response);
    }

}
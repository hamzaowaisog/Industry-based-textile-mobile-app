using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Swashbuckle.AspNetCore.Swagger;
using Microsoft.OpenApi.Writers;

namespace HamzaTex.Api.Controllers;

/// <summary>Application-level utility endpoints — no auth required.</summary>
[ApiController]
[Route("api/[controller]")]
[AllowAnonymous]
[Produces("application/json")]
public class AppController : ControllerBase
{
    private readonly ISwaggerProvider _swaggerProvider;

    public AppController(ISwaggerProvider swaggerProvider)
    {
        _swaggerProvider = swaggerProvider;
    }
    /// <summary>Health check — returns 200 OK when the API is running.</summary>
    [HttpGet("health")]
    [ProducesResponseType(typeof(object), StatusCodes.Status200OK)]
    public IActionResult Health()
        => Ok(new { status = "healthy", timestamp = DateTime.UtcNow });

    /// <summary>API info — returns links to docs and health endpoints.</summary>
    [HttpGet("info")]
    [ProducesResponseType(typeof(object), StatusCodes.Status200OK)]
    public IActionResult Info()
        => Ok(new
        {
            name    = "HamzaTex API",
            docs    = "/swagger",
            spec    = "/swagger/v1/swagger.json",
            health  = "/api/app/health"
        });

    /// <summary>Downloads the OpenAPI JSON spec file. Use this in Orval: set target to the URL of this endpoint.</summary>
    [HttpGet("spec")]
    [Produces("application/json")]
    public IActionResult Spec()
    {
        var swagger = _swaggerProvider.GetSwagger("v1");
        using var stream = new System.IO.MemoryStream();
        using var writer = new System.IO.StreamWriter(stream);
        swagger.SerializeAsV3(new OpenApiJsonWriter(writer));
        writer.Flush();
        var json = System.Text.Encoding.UTF8.GetString(stream.ToArray());
        return File(System.Text.Encoding.UTF8.GetBytes(json), "application/json", "hamzatex-api.json");
    }
}

using Microsoft.AspNetCore.Mvc;
namespace HamzaTex.Api.Helpers;

public class BaseController : ControllerBase
{
    protected IActionResult ToActionResult<T>(Response<T> response)
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

    protected IActionResult ToActionResult(Response response)
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

    protected bool IsNotFound(string message) =>
        string.Equals(message, "Not found", StringComparison.OrdinalIgnoreCase);

    protected Response<T> ToValidationResponseFromModelState<T>()
    {
        var errors = ModelState
            .Where(x => x.Value?.Errors.Count > 0)
            .SelectMany(x => x.Value!.Errors)
            .Select(x => x.ErrorMessage)
            .ToList();

        return Response<T>.ErrorResponse("Validation failed", errors);
    }
}
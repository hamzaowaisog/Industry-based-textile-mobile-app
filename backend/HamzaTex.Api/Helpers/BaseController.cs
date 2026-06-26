using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;
namespace HamzaTex.Api.Helpers;

public class BaseController : ControllerBase
{
    /// <summary>
    /// Resolves the authenticated user's integer id from the <c>NameIdentifier</c> claim, or null when missing/invalid.
    /// Single source of truth — every controller inherits this instead of re-implementing claim parsing.
    /// </summary>
    protected int? GetUserId()
    {
        var claim = User.FindFirst(ClaimTypes.NameIdentifier);
        return claim is not null && int.TryParse(claim.Value, out var id) ? id : null;
    }

    /// <summary>
    /// Resolves the user id into <paramref name="userId"/>; returns null on success or a ready-to-return
    /// 401 result when the claim is missing/invalid. Usage: <c>if (GetUserIdOrUnauthorized(out var userId) is { } e) return e;</c>
    /// </summary>
    protected IActionResult? GetUserIdOrUnauthorized(out int userId)
    {
        var id = GetUserId();
        if (id is null)
        {
            userId = 0;
            return Unauthorized("User identifier is missing or invalid in the token.");
        }

        userId = id.Value;
        return null;
    }

    /// <summary>
    /// True when the authenticated user's <c>RoleId</c> claim equals 1 (Admin).
    /// Single source of truth for role checks — every controller inherits this.
    /// </summary>
    protected bool IsAdmin()
    {
        var roleIdClaim = User.FindFirst("RoleId");
        return roleIdClaim is not null && int.TryParse(roleIdClaim.Value, out var roleId) && roleId == 1;
    }

    /// <summary>
    /// Returns null when the model state is valid, otherwise the validation-problem response.
    /// Usage: <c>if (ValidateModel&lt;ClientDto&gt;() is { } invalid) return invalid;</c>
    /// </summary>
    protected IActionResult? ValidateModel<T>()
        => ModelState.IsValid ? null : ToActionResult(ToValidationResponseFromModelState<T>());

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
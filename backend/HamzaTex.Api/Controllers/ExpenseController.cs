using System.Security.Claims;
using HamzaTex.Api.Helpers;
using HamzaTex.Api.Models;
using HamzaTex.Api.Services;
using HamzaTex.Api.Services.ViewModel;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HamzaTex.Api.Controllers;

/// <summary>Expense management — record business costs with atomic ledger posting. Every expense creates a Debit transaction that feeds the monthly P&amp;L report.</summary>
[ApiController]
[Route("api/[controller]")]
[Authorize(Policy = "Authenticated")]
[Produces("application/json")]
public class ExpenseController : BaseController
{
    private readonly IExpenseService _expenseService;
    private readonly IPdfService _pdfService;

    public ExpenseController(IExpenseService expenseService, IPdfService pdfService)
    {
        _expenseService = expenseService;
        _pdfService = pdfService;
    }

    /// <summary>Create an expense and atomically post a Debit transaction to the ledger.</summary>
    [HttpPost]
    [Authorize(Policy = "AdminOrStaff")]
    [ProducesResponseType(typeof(Response<ExpenseDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(Response<ExpenseDto>), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Create([FromBody] ExpenseCreateViewModel model)
    {
        if (ValidateModel<ExpenseDto>() is { } invalid)
            return invalid;

        var userId = GetUserId();
        if (userId is null) return Unauthorized();

        var dto = new CreateExpenseDto
        {
            ExpenseTypeId = model.ExpenseTypeId,
            Amount = model.Amount,
            TransModeId = model.TransModeId,
            TransCategoryId = model.TransCategoryId,
            ExpenseDate = model.ExpenseDate ?? DateOnly.FromDateTime(DateTime.UtcNow),
            Notes = model.Notes
        };

        return ToActionResult(await _expenseService.CreateAsync(dto, userId.Value));
    }

    /// <summary>Get all expenses paginated. Admin only.</summary>
    [HttpGet]
    [Authorize(Policy = "AdminOnly")]
    [ProducesResponseType(typeof(Response<PagedList<ExpenseDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAll(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        return ToActionResult(await _expenseService.GetAllPaginatedAsync(page, pageSize));
    }

    /// <summary>Get expenses recorded by the current authenticated user, paginated.</summary>
    [HttpGet("me")]
    [ProducesResponseType(typeof(Response<PagedList<ExpenseDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetMine(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        var userId = GetUserId();
        if (userId is null) return Unauthorized();
        return ToActionResult(await _expenseService.GetAllByUserIdAsync(userId.Value, page, pageSize));
    }

    /// <summary>Get an expense by ID.</summary>
    [HttpGet("{id:int}")]
    [ProducesResponseType(typeof(Response<ExpenseDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(Response<ExpenseDto>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById([FromRoute] int id)
    {
        return ToActionResult(await _expenseService.GetByIdAsync(id));
    }

    /// <summary>Filter expenses by type, mode, and date range.</summary>
    [HttpGet("filtered")]
    [ProducesResponseType(typeof(Response<List<ExpenseDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetFiltered(
        [FromQuery] int? expenseTypeId,
        [FromQuery] int? modeId,
        [FromQuery] DateOnly? dateFrom,
        [FromQuery] DateOnly? dateTo)
    {
        return ToActionResult(await _expenseService.GetFilteredAsync(expenseTypeId, modeId, dateFrom, dateTo));
    }

    /// <summary>Update amount, mode, date, and notes. TransCategoryId cannot be changed — delete and re-create to reclassify.</summary>
    [HttpPut("{id:int}")]
    [Authorize(Policy = "AdminOrStaff")]
    [ProducesResponseType(typeof(Response<ExpenseDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(Response<ExpenseDto>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(Response<ExpenseDto>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Update([FromRoute] int id, [FromBody] ExpenseUpdateViewModel model)
    {
        if (ValidateModel<ExpenseDto>() is { } invalid)
            return invalid;

        var dto = new UpdateExpenseDto
        {
            Amount = model.Amount,
            TransModeId = model.TransModeId,
            ExpenseDate = model.ExpenseDate,
            Notes = model.Notes
        };

        return ToActionResult(await _expenseService.UpdateByIdAsync(id, dto));
    }

    /// <summary>Hard delete an expense and its linked Transaction. Admin only.</summary>
    [HttpDelete("{id:int}")]
    [Authorize(Policy = "AdminOnly")]
    [ProducesResponseType(typeof(Response), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(Response), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete([FromRoute] int id)
    {
        return ToActionResult(await _expenseService.DeleteByIdAsync(id));
    }

    /// <summary>Export expenses as PDF. Optionally filter by type, mode, and date range.</summary>
    [HttpGet("pdf")]
    [Authorize(Policy = "AdminOrStaff")]
    [ProducesResponseType(typeof(FileContentResult), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetPdf(
        [FromQuery] int? expenseTypeId,
        [FromQuery] int? modeId,
        [FromQuery] DateOnly? dateFrom,
        [FromQuery] DateOnly? dateTo)
    {
        var result = await _expenseService.GetFilteredAsync(expenseTypeId, modeId, dateFrom, dateTo);
        if (!result.Success || result.Data is null)
            return BadRequest(result.Message);

        var expenses = result.Data ?? new List<ExpenseDto>();
        var pdf = _pdfService.CreatePdf("Expenses", "Expense records. All amounts in PKR.", expenses, EntityPdfConfigs.Expense, new PdfOptions { ShowRowNumbers = true });
        return File(pdf, "application/pdf", "expenses.pdf");
    }
}

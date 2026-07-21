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
            ExpenseDateHijri = model.ExpenseDateHijri,
            Notes = model.Notes
        };

        return ToActionResult(await _expenseService.CreateAsync(dto, userId.Value));
    }

    /// <summary>Get all expenses paginated. Staff see only their own; Admin sees all.</summary>
    [HttpGet]
    [Authorize(Policy = "Authenticated")]
    [ProducesResponseType(typeof(Response<PagedList<ExpenseDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAll(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        var userId = GetUserId();
        if (userId is null) return Unauthorized("User identifier is missing or invalid in the token.");

        return ToActionResult(await _expenseService.GetAllPaginatedAsync(page, pageSize, userId.Value, IsAdmin()));
    }

    /// <summary>Get an expense by ID. Admin can access any expense; non-admins only their own.</summary>
    [HttpGet("{id:int}")]
    [ProducesResponseType(typeof(Response<ExpenseDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(Response<ExpenseDto>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById([FromRoute] int id)
    {
        if (GetUserIdOrUnauthorized(out var userId) is { } authError)
            return authError;

        return ToActionResult(await _expenseService.GetByIdAsync(id, userId, IsAdmin()));
    }

    /// <summary>Filter expenses by type, mode, and date range. Admin sees all matches; non-admins see only their own.</summary>
    [HttpGet("filtered")]
    [ProducesResponseType(typeof(Response<List<ExpenseDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetFiltered(
        [FromQuery] int? expenseTypeId,
        [FromQuery] int? modeId,
        [FromQuery] DateOnly? dateFrom,
        [FromQuery] DateOnly? dateTo)
    {
        var userId = GetUserId();
        if (userId is null) return Unauthorized("User identifier is missing or invalid in the token.");

        return ToActionResult(await _expenseService.GetFilteredAsync(expenseTypeId, modeId, dateFrom, dateTo, userId.Value, IsAdmin()));
    }

    /// <summary>Update amount, mode, date, and notes. Admin can update any expense; non-admins only their own. TransCategoryId cannot be changed — delete and re-create to reclassify.</summary>
    [HttpPut("{id:int}")]
    [Authorize(Policy = "AdminOrStaff")]
    [ProducesResponseType(typeof(Response<ExpenseDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(Response<ExpenseDto>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(Response<ExpenseDto>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Update([FromRoute] int id, [FromBody] ExpenseUpdateViewModel model)
    {
        if (ValidateModel<ExpenseDto>() is { } invalid)
            return invalid;

        if (GetUserIdOrUnauthorized(out var userId) is { } authError)
            return authError;

        var dto = new UpdateExpenseDto
        {
            Amount = model.Amount,
            TransModeId = model.TransModeId,
            ExpenseDate = model.ExpenseDate,
            Notes = model.Notes
        };

        return ToActionResult(await _expenseService.UpdateByIdAsync(id, dto, userId, IsAdmin()));
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

    /// <summary>Export expenses as PDF. Admin sees all; non-admins see only their own. Optionally filter by type, mode, and date range.</summary>
    [HttpGet("pdf")]
    [Authorize(Policy = "AdminOrStaff")]
    [ProducesResponseType(typeof(FileContentResult), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetPdf(
        [FromQuery] int? expenseTypeId,
        [FromQuery] int? modeId,
        [FromQuery] DateOnly? dateFrom,
        [FromQuery] DateOnly? dateTo)
    {
        var userId = GetUserId();
        if (userId is null) return Unauthorized("User identifier is missing or invalid in the token.");

        var result = await _expenseService.GetFilteredAsync(expenseTypeId, modeId, dateFrom, dateTo, userId.Value, IsAdmin());
        if (!result.Success || result.Data is null)
            return BadRequest(result.Message);

        var expenses = result.Data ?? new List<ExpenseDto>();
        var pdf = _pdfService.CreatePdf(
            "Expenses",
            "Expense records. All amounts in PKR.",
            expenses,
            EntityPdfConfigs.Expense,
            new PdfOptions {
                ShowRowNumbers = true,
                SummaryProperty = "Amount",
                SummaryLabel = "Grand Total (PKR)"
            });
        return File(pdf, "application/pdf", "expenses.pdf");
    }

    /// <summary>Download a single expense as a branded PDF receipt — type, amount, and details.</summary>
    [HttpGet("{id:int}/pdf")]
    [ProducesResponseType(typeof(FileContentResult), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(Response), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetExpenseDossierPdf([FromRoute] int id)
    {
        if (GetUserIdOrUnauthorized(out var userId) is { } authError)
            return authError;

        var response = await _expenseService.GetByIdAsync(id, userId, IsAdmin());
        if (!response.Success || response.Data is null)
            return NotFound(response.Message);

        var e = response.Data;
        var model = new HamzaTexDocumentModel
        {
            DocumentLabel      = "EXPENSE",
            Reference           = $"HT-EXPENSE-{e.Id}",
            IssuedDate          = DateTime.Now,
            PreparedFor         = e.ExpenseTypeName ?? "Expense",
            PreparedForSubtitle = $"{e.TransCategoryName} · {e.TransModeName}",
            PeriodLabel         = "EXPENSE DATE",
            PeriodValue         = e.ExpenseDate.ToString("dd MMM yyyy"),
            Stats = new()
            {
                new Stat("Amount", PdfFormat.Rs(e.Amount), Highlight: true),
                new Stat("Type", e.ExpenseTypeName ?? "—"),
                new Stat("Category", e.TransCategoryName ?? "—"),
            },
            Sections = new()
            {
                new TableSection(
                    "Details",
                    Headers: new[] { "Field", "Value" },
                    Rows: new[]
                    {
                        new[] { "Mode", e.TransModeName ?? "—" },
                        new[] { "Recorded By", e.RecordedByName ?? "—" },
                        new[] { "Date", e.ExpenseDate.ToString("dd MMM yyyy") },
                        new[] { "Notes", e.Notes ?? "—" },
                    }),
            },
            Closing = new ClosingSummary(
                LeftLabel:    "CATEGORY",
                LeftSubtitle: e.TransCategoryName ?? "—",
                RightLabel:   "AMOUNT",
                RightValue:   PdfFormat.Rs(e.Amount)),
        };

        return File(_pdfService.CreateDocument(model), "application/pdf", $"expense-{e.Id}.pdf");
    }
}

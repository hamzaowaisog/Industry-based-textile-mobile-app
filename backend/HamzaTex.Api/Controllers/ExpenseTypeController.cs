using HamzaTex.Api.Helpers;
using HamzaTex.Api.Models;
using HamzaTex.Api.Services;
using HamzaTex.Api.Services.ViewModel;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HamzaTex.Api.Controllers;

/// <summary>Expense type management — create and manage expense categories (e.g. Rent, Salaries, Vehicle). Seeded: Office Expenses (1), Home Expenses (2). Admin only.</summary>
[ApiController]
[Route("api/[controller]")]
[Authorize(Policy = "AdminOnly")]
[Produces("application/json")]
public class ExpenseTypeController : BaseController
{
    private readonly IExpenseTypeService _expenseTypeService;
    private readonly IPdfService _pdfService;

    public ExpenseTypeController(IExpenseTypeService expenseTypeService, IPdfService pdfService)
    {
        _expenseTypeService = expenseTypeService;
        _pdfService = pdfService;
    }

    /// <summary>Create a new expense type.</summary>
    [HttpPost]
    [ProducesResponseType(typeof(Response<ExpenseTypeDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(Response<ExpenseTypeDto>), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Create([FromBody] ExpenseTypeCreateViewModel model)
    {
        if (ValidateModel<ExpenseTypeDto>() is { } invalid)
            return invalid;

        var dto = new CreateExpenseTypeDto { Name = model.Name };
        return ToActionResult(await _expenseTypeService.CreateAsync(dto));
    }

    /// <summary>Get all expense types.</summary>
    [HttpGet]
    [ProducesResponseType(typeof(Response<List<ExpenseTypeDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAll()
    {
        return ToActionResult(await _expenseTypeService.GetAllAsync());
    }

    /// <summary>Get an expense type by ID.</summary>
    [HttpGet("{id:int}")]
    [ProducesResponseType(typeof(Response<ExpenseTypeDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(Response<ExpenseTypeDto>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById([FromRoute] int id)
    {
        return ToActionResult(await _expenseTypeService.GetByIdAsync(id));
    }

    /// <summary>Update an expense type name.</summary>
    [HttpPut("{id:int}")]
    [ProducesResponseType(typeof(Response<ExpenseTypeDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(Response<ExpenseTypeDto>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(Response<ExpenseTypeDto>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Update([FromRoute] int id, [FromBody] ExpenseTypeUpdateViewModel model)
    {
        if (ValidateModel<ExpenseTypeDto>() is { } invalid)
            return invalid;

        var dto = new UpdateExpenseTypeDto { Name = model.Name };
        return ToActionResult(await _expenseTypeService.UpdateByIdAsync(id, dto));
    }

    /// <summary>Delete an expense type. Fails if the type is seeded (ID 1 or 2) or has existing expenses.</summary>
    [HttpDelete("{id:int}")]
    [ProducesResponseType(typeof(Response), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(Response), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(Response), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete([FromRoute] int id)
    {
        return ToActionResult(await _expenseTypeService.DeleteByIdAsync(id));
    }

    /// <summary>Download all expense types as a PDF report.</summary>
    [HttpGet("pdf")]
    [ProducesResponseType(typeof(FileContentResult), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetPdf()
    {
        var result = await _expenseTypeService.GetAllAsync();
        if (!result.Success)
            return BadRequest(result.Message);

        var types = result.Data ?? new List<ExpenseTypeDto>();
        var pdf = _pdfService.CreatePdf("Expense Types", "List of expense categories.", types, EntityPdfConfigs.ExpenseType, new PdfOptions { ShowRowNumbers = true });
        return File(pdf, "application/pdf", "expense-types.pdf");
    }
}

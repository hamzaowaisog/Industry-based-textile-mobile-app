using System.Security.Claims;
using HamzaTex.Api.Helpers;
using HamzaTex.Api.Models;
using HamzaTex.Api.Services;
using HamzaTex.Api.Services.ViewModel;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HamzaTex.Api.Controllers;

/// <summary>Ledger viewer and manual correction tool for the transactions table.</summary>
[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
[Authorize(Policy = "Authenticated")]
public class TransactionController : BaseController
{
    private readonly ITransactionService _transactionService;
    private readonly IPdfService _pdfService;

    public TransactionController(ITransactionService transactionService, IPdfService pdfService)
    {
        _transactionService = transactionService;
        _pdfService = pdfService;
    }


    // ── Write ─────────────────────────────────────────────────────────────────

    /// <summary>Create a manual ledger entry. Defaults TransTypeId=1 (Debit) and TransModeId=1 (Cash) if omitted.</summary>
    [HttpPost]
    [Authorize(Policy = "AdminOnly")]
    [ProducesResponseType(typeof(Response<TransactionDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(Response), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Create([FromBody] TransactionCreateViewModel model)
    {
        if (ValidateModel<TransactionDto>() is { } invalid)
            return invalid;

        var userId = GetUserId();
        if (userId is null) return Unauthorized();

        var dto = new CreateTransactionDto
        {
            Amount          = model.Amount,
            TransCategoryId = model.TransCategoryId,
            TransDate       = model.TransDate,
            Notes           = model.Notes,
            ClientId        = model.ClientId,
            TransTypeId     = model.TransTypeId,
            TransModeId     = model.TransModeId,
        };

        return ToActionResult(await _transactionService.CreateAsync(dto, userId.Value));
    }

    /// <summary>Update a manually-created transaction. Returns an error if the transaction was auto-posted by an Order, Purchase, Expense, or Payment.</summary>
    [HttpPut("{id:int}")]
    [Authorize(Policy = "AdminOnly")]
    [ProducesResponseType(typeof(Response<TransactionDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(Response), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(Response), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Update([FromRoute] int id, [FromBody] TransactionUpdateViewModel model)
    {
        if (ValidateModel<TransactionDto>() is { } invalid)
            return invalid;

        var dto = new UpdateTransactionDto
        {
            Amount          = model.Amount,
            TransCategoryId = model.TransCategoryId,
            TransDate       = model.TransDate,
            Notes           = model.Notes,
            ClientId        = model.ClientId,
            TransTypeId     = model.TransTypeId,
            TransModeId     = model.TransModeId,
        };

        return ToActionResult(await _transactionService.UpdateByIdAsync(id, dto));
    }

    /// <summary>Delete a manually-created transaction. Returns an error if the transaction was auto-posted.</summary>
    [HttpDelete("{id:int}")]
    [Authorize(Policy = "AdminOnly")]
    [ProducesResponseType(typeof(Response), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(Response), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(Response), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete([FromRoute] int id)
    {
        return ToActionResult(await _transactionService.DeleteByIdAsync(id));
    }

    // ── Read ──────────────────────────────────────────────────────────────────

    /// <summary>Get cash-movement transactions paginated (Expenses + Cash/Bank In &amp; Out — excludes accrual Sales/Purchases rows, which are already represented by their matching Payment row). Staff see only their own; Admin sees all.</summary>
    [HttpGet]
    [Authorize(Policy = "Authenticated")]
    [ProducesResponseType(typeof(Response<PagedList<TransactionDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAll([FromQuery] int page = 1, [FromQuery] int pageSize = 20)
    {
        var userId = GetUserId();
        if (userId is null) return Unauthorized("User identifier is missing or invalid in the token.");

        return ToActionResult(await _transactionService.GetAllPaginatedAsync(page, pageSize, userId.Value, IsAdmin()));
    }



    /// <summary>Get aggregate Credit/Debit cash-flow totals (Expenses + Cash/Bank In &amp; Out categories — excludes accrual Sales/Purchases postings, which would double-count the same amount at delivery and again at payment). Admin sees all; non-admins see only their own transactions.</summary>
    [HttpGet("summary")]
    [Authorize(Policy = "Authenticated")]
    [ProducesResponseType(typeof(Response<TransactionSummaryDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetSummary()
    {
        var userId = GetUserId();
        if (userId is null) return Unauthorized("User identifier is missing or invalid in the token.");

        return ToActionResult(await _transactionService.GetSummaryAsync(userId.Value, IsAdmin()));
    }

    /// <summary>Get a transaction by ID. Staff can only access their own records.</summary>
    [HttpGet("{id:int}")]
    [Authorize(Policy = "AdminOrStaff")]
    [ProducesResponseType(typeof(Response<TransactionDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(Response), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById([FromRoute] int id)
    {
        var userId = GetUserId();
        if (userId is null) return Unauthorized();

        return ToActionResult(await _transactionService.GetByIdAsync(id, userId.Value, IsAdmin()));
    }

    /// <summary>Get all transactions for a specific client. Staff: only if they own the client.</summary>
    [HttpGet("by-client/{clientId:int}")]
    [Authorize(Policy = "AdminOrStaff")]
    [ProducesResponseType(typeof(Response<List<TransactionDto>>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(Response), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetByClient([FromRoute] int clientId)
    {
        var userId = GetUserId();
        if (userId is null) return Unauthorized();

        return ToActionResult(await _transactionService.GetAllByClientIdAsync(clientId, userId.Value, IsAdmin()));
    }

    /// <summary>Filter transactions by typeId, categoryId, modeId, clientId, dateFrom, dateTo. Admin sees all matches; non-admins see only their own.</summary>
    [HttpGet("filtered")]
    [Authorize(Policy = "Authenticated")]
    [ProducesResponseType(typeof(Response<List<TransactionDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetFiltered(
        [FromQuery] int? typeId,
        [FromQuery] int? categoryId,
        [FromQuery] int? modeId,
        [FromQuery] int? clientId,
        [FromQuery] DateOnly? dateFrom,
        [FromQuery] DateOnly? dateTo)
    {
        var userId = GetUserId();
        if (userId is null) return Unauthorized("User identifier is missing or invalid in the token.");

        return ToActionResult(await _transactionService.GetFilteredAsync(
            typeId, categoryId, modeId, clientId, dateFrom, dateTo, userId.Value, IsAdmin()));
    }

    /// <summary>Export transactions as PDF. Admin sees all; non-admins see only their own.</summary>
    [HttpGet("pdf")]
    [Authorize(Policy = "Authenticated")]
    [ProducesResponseType(typeof(FileContentResult), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetPdf()
    {
        var userId = GetUserId();
        if (userId is null) return Unauthorized("User identifier is missing or invalid in the token.");

        var result = await _transactionService.GetAllAsync(userId.Value, IsAdmin());
        if (!result.Success || result.Data is null)
            return BadRequest(result.Message);

        var summaryResult = await _transactionService.GetSummaryAsync(userId.Value, IsAdmin());
        var totalCredit = summaryResult.Data?.TotalCredit ?? 0m;
        var totalDebit = summaryResult.Data?.TotalDebit ?? 0m;
        var pdf = _pdfService.CreatePdf(
            "Transactions", "Cash movement ledger. All amounts in PKR.", result.Data, EntityPdfConfigs.Transaction,
            new PdfOptions
            {
                ShowRowNumbers = true,
                Stats = new()
                {
                    new Stat("Net for Period", PdfFormat.Rs(totalCredit - totalDebit), Highlight: true),
                    new Stat("Total Credit", PdfFormat.Rs(totalCredit)),
                    new Stat("Total Debit", PdfFormat.Rs(totalDebit)),
                },
            });
        return File(pdf, "application/pdf", "transactions.pdf");
    }

    /// <summary>Download a single transaction as a branded PDF ledger slip — category/type/mode, amount, and linked party.</summary>
    [HttpGet("{id:int}/pdf")]
    [ProducesResponseType(typeof(FileContentResult), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(Response), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetTransactionDossierPdf([FromRoute] int id)
    {
        var userId = GetUserId();
        if (userId is null) return Unauthorized("User identifier is missing or invalid in token.");

        var response = await _transactionService.GetByIdAsync(id, userId.Value, IsAdmin());
        if (!response.Success || response.Data is null)
            return NotFound(response.Message);

        var t = response.Data;
        var model = new HamzaTexDocumentModel
        {
            DocumentLabel      = "TRANSACTION",
            Reference           = $"HT-TXN-{t.Id}",
            IssuedDate          = DateTime.Now,
            PreparedFor         = t.ClientName ?? "—",
            PreparedForSubtitle = $"{t.TransCategoryName} · {t.TransTypeName}",
            PeriodLabel         = "TRANS DATE",
            PeriodValue         = t.TransDate.ToString("dd MMM yyyy"),
            Stats = new()
            {
                new Stat("Amount", PdfFormat.Rs(t.Amount), Highlight: true),
                new Stat("Type", t.TransTypeName ?? "—"),
                new Stat("Category", t.TransCategoryName ?? "—"),
            },
            Sections = new()
            {
                new TableSection(
                    "Details",
                    Headers: new[] { "Field", "Value" },
                    Rows: new[]
                    {
                        new[] { "Source", t.Source ?? "—" },
                        new[] { "Mode", t.TransModeName ?? "—" },
                        new[] { "Client", t.ClientName ?? "—" },
                        new[] { "Date", t.TransDate.ToString("dd MMM yyyy") },
                        new[] { "Notes", t.Notes ?? "—" },
                    }),
            },
            Closing = new ClosingSummary(
                LeftLabel:    "TYPE",
                LeftSubtitle: t.TransTypeName ?? "—",
                RightLabel:   "AMOUNT",
                RightValue:   PdfFormat.Rs(t.Amount)),
        };

        return File(_pdfService.CreateDocument(model), "application/pdf", $"transaction-{t.Id}.pdf");
    }
}

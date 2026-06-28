using System.Security.Claims;
using HamzaTex.Api.Helpers;
using HamzaTex.Api.Models;
using HamzaTex.Api.Services;
using HamzaTex.Api.Services.ViewModel;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HamzaTex.Api.Controllers;

/// <summary>Payment management — record supplier payments and customer receipts with FIFO allocation, reversal, and ledger posting.</summary>
[ApiController]
[Route("api/[controller]")]
[Authorize(Policy = "Authenticated")]
[Produces("application/json")]
public class PaymentController : BaseController
{
    private readonly IPaymentService _paymentService;
    private readonly IPdfService _pdfService;

    public PaymentController(IPaymentService paymentService, IPdfService pdfService)
    {
        _paymentService = paymentService;
        _pdfService = pdfService;
    }

    /// <summary>Create a payment. Allocates to orders/purchases (manual or auto-FIFO) and posts to the ledger.</summary>
    [HttpPost]
    [Authorize(Policy = "AdminOrStaff")]
    [ProducesResponseType(typeof(Response<PaymentDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(Response<PaymentDto>), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Create([FromBody] PaymentCreateViewModel model)
    {
        if (ValidateModel<PaymentDto>() is { } invalid)
            return invalid;

        var userId = GetUserId();
        if (userId is null) return Unauthorized();

        var dto = new CreatePaymentDto
        {
            PartyClientId = model.PartyClientId,
            PaymentDirectionId = model.PaymentDirectionId,
            TransModeId = model.TransModeId,
            Amount = model.Amount,
            PaymentDate = model.PaymentDate ?? DateOnly.FromDateTime(DateTime.UtcNow),
            Notes = model.Notes,
            Allocations = model.Allocations.Select(a => new AllocationItemDto
            {
                OrderId = a.OrderId,
                PurchaseId = a.PurchaseId,
                AllocatedAmount = a.AllocatedAmount
            }).ToList()
        };

        return ToActionResult(await _paymentService.CreateAsync(dto, userId.Value));
    }

    /// <summary>Get all payments paginated. Staff see only their own; Admin sees all.</summary>
    [HttpGet]
    [Authorize(Policy = "Authenticated")]
    [ProducesResponseType(typeof(Response<PagedList<PaymentDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAll(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] bool includeReversed = false)
    {
        var userId = GetUserId();
        if (userId is null) return Unauthorized("User identifier is missing or invalid in the token.");

        return ToActionResult(await _paymentService.GetAllPaginatedAsync(page, pageSize, includeReversed, userId.Value, IsAdmin()));
    }

    /// <summary>Get a payment by ID with its allocations.</summary>
    [HttpGet("{id:int}")]
    [ProducesResponseType(typeof(Response<PaymentDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(Response<PaymentDto>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById([FromRoute] int id)
    {
        return ToActionResult(await _paymentService.GetByIdAsync(id));
    }

    /// <summary>Get all payments for a specific client.</summary>
    [HttpGet("by-client/{clientId:int}")]
    [ProducesResponseType(typeof(Response<List<PaymentDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetByClient([FromRoute] int clientId)
    {
        return ToActionResult(await _paymentService.GetAllByClientIdAsync(clientId));
    }

    /// <summary>Filter payments by clientId, directionId, modeId, date range, and reversed flag.</summary>
    [HttpGet("filtered")]
    [ProducesResponseType(typeof(Response<List<PaymentDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetFiltered(
        [FromQuery] int? clientId,
        [FromQuery] int? directionId,
        [FromQuery] int? modeId,
        [FromQuery] DateOnly? dateFrom,
        [FromQuery] DateOnly? dateTo,
        [FromQuery] bool includeReversed = false)
    {
        var userId = GetUserId();
        if (userId is null) return Unauthorized("User identifier is missing or invalid in the token.");

        return ToActionResult(await _paymentService.GetFilteredAsync(
            clientId, directionId, modeId, dateFrom, dateTo, includeReversed, userId.Value, IsAdmin()));
    }

    /// <summary>Get unallocated credit balance for a client.</summary>
    [HttpGet("unallocated/{clientId:int}")]
    [ProducesResponseType(typeof(Response<UnallocatedCreditDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(Response<UnallocatedCreditDto>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetUnallocated([FromRoute] int clientId)
    {
        return ToActionResult(await _paymentService.GetUnallocatedCreditAsync(clientId));
    }

    /// <summary>Update payment notes, date, and transaction mode. Amount and client cannot be changed.</summary>
    [HttpPut("{id:int}")]
    [Authorize(Policy = "AdminOrStaff")]
    [ProducesResponseType(typeof(Response<PaymentDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(Response<PaymentDto>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(Response<PaymentDto>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Update([FromRoute] int id, [FromBody] PaymentUpdateViewModel model)
    {
        if (ValidateModel<PaymentDto>() is { } invalid)
            return invalid;

        var dto = new UpdatePaymentDto
        {
            TransModeId = model.TransModeId,
            PaymentDate = model.PaymentDate,
            Notes = model.Notes
        };

        return ToActionResult(await _paymentService.UpdateByIdAsync(id, dto));
    }

    /// <summary>Reverse a payment (e.g. wrong amount). Creates a reversing Transaction and marks original as reversed.</summary>
    [HttpPost("{id:int}/reverse")]
    [Authorize(Policy = "AdminOnly")]
    [ProducesResponseType(typeof(Response<PaymentDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(Response<PaymentDto>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(Response<PaymentDto>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Reverse([FromRoute] int id, [FromQuery] string? notes)
    {
        var userId = GetUserId();
        if (userId is null) return Unauthorized();
        return ToActionResult(await _paymentService.ReverseAsync(id, notes, userId.Value));
    }

    /// <summary>Reverse a payment and re-create it for the correct client. Atomic operation for wrong-client corrections.</summary>
    [HttpPost("{id:int}/reverse-and-correct")]
    [Authorize(Policy = "AdminOnly")]
    [ProducesResponseType(typeof(Response<PaymentDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(Response<PaymentDto>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(Response<PaymentDto>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> ReverseAndCorrect([FromRoute] int id, [FromBody] ReverseAndCorrectViewModel model)
    {
        if (ValidateModel<PaymentDto>() is { } invalid)
            return invalid;

        var userId = GetUserId();
        if (userId is null) return Unauthorized();

        var dto = new ReverseAndCorrectPaymentDto
        {
            CorrectClientId = model.CorrectClientId,
            Notes = model.Notes
        };

        return ToActionResult(await _paymentService.ReverseAndCorrectAsync(id, dto, userId.Value));
    }

    /// <summary>Hard delete a payment, its allocations, and linked Transaction. Admin only.</summary>
    [HttpDelete("{id:int}")]
    [Authorize(Policy = "AdminOnly")]
    [ProducesResponseType(typeof(Response), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(Response), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete([FromRoute] int id)
    {
        return ToActionResult(await _paymentService.DeleteByIdAsync(id));
    }

    /// <summary>Export payments as PDF. Admin sees all; non-admins see only their own.</summary>
    [HttpGet("pdf")]
    [Authorize(Policy = "AdminOrStaff")]
    [ProducesResponseType(typeof(FileContentResult), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetPdf([FromQuery] bool includeReversed = false)
    {
        var userId = GetUserId();
        if (userId is null) return Unauthorized("User identifier is missing or invalid in the token.");

        var result = await _paymentService.GetFilteredAsync(null, null, null, null, null, includeReversed, userId.Value, IsAdmin());
        if (!result.Success || result.Data is null)
            return BadRequest(result.Message);

        var payments = result.Data ?? new List<PaymentDto>();
        var pdf = _pdfService.CreatePdf("Payments", "Payment records. All amounts in PKR.", payments, EntityPdfConfigs.Payment, new PdfOptions { ShowRowNumbers = true });
        return File(pdf, "application/pdf", "payments.pdf");
    }

    /// <summary>Download a single payment as a branded PDF receipt — party, direction/mode, amount, and allocations.</summary>
    [HttpGet("{id:int}/pdf")]
    [ProducesResponseType(typeof(FileContentResult), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(Response), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetPaymentDossierPdf([FromRoute] int id)
    {
        var response = await _paymentService.GetByIdAsync(id);
        if (!response.Success || response.Data is null)
            return NotFound(response.Message);

        var p = response.Data;
        var model = new HamzaTexDocumentModel
        {
            DocumentLabel      = "PAYMENT",
            Reference           = $"HT-PAYMENT-{p.Id}",
            IssuedDate          = DateTime.Now,
            PreparedFor         = p.PartyClientName ?? "—",
            PreparedForSubtitle = $"{p.PaymentDirectionName} · {p.TransModeName}",
            PeriodLabel         = "PAYMENT DATE",
            PeriodValue         = p.PaymentDate.ToString("dd MMM yyyy"),
            Stats = new()
            {
                new Stat("Amount", PdfFormat.Rs(p.Amount), Highlight: true),
                new Stat("Direction", p.PaymentDirectionName ?? "—"),
                new Stat("Mode", p.TransModeName ?? "—"),
                new Stat("Recorded By", p.RecordedByName ?? "—"),
            },
            Sections = new()
            {
                new TableSection(
                    "Allocations",
                    Headers:    new[] { "#", "Order", "Purchase", "Allocated" },
                    RightAlign: new[] { 3 },
                    Rows:       p.Allocations.Select((a, i) => new[]
                    {
                        (i + 1).ToString(),
                        a.OrderId?.ToString() ?? "—",
                        a.PurchaseId?.ToString() ?? "—",
                        PdfFormat.Rs(a.AllocatedAmount),
                    })),
            },
            Closing = new ClosingSummary(
                LeftLabel:    "DIRECTION",
                LeftSubtitle: p.IsReversed ? $"{p.PaymentDirectionName} (Reversed)" : (p.PaymentDirectionName ?? "—"),
                RightLabel:   "AMOUNT",
                RightValue:   PdfFormat.Rs(p.Amount)),
            ClosingNote = !string.IsNullOrWhiteSpace(p.Notes) ? $"Notes: {p.Notes}" : null,
        };

        return File(_pdfService.CreateDocument(model), "application/pdf", $"payment-{p.Id}.pdf");
    }
}

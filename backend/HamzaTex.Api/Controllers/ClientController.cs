using System.Security.Claims;
using HamzaTex.Api.Helpers;
using HamzaTex.Api.Models;
using HamzaTex.Api.Services;
using HamzaTex.Api.Services.ViewModel;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HamzaTex.Api.Controllers;

/// <summary>Client management — customers and suppliers. Staff see their own clients; Admin sees all.</summary>
[ApiController]
[Route("api/[controller]")]
[Authorize(Policy = "Authenticated")]
[Produces("application/json")]
public class ClientController : BaseController
{
    private readonly IClientService _clientService;
    private readonly IPdfService _pdfService;
    private readonly IReportService _reportService;

    public ClientController(IClientService clientService, IPdfService pdfService, IReportService reportService)
    {
        _clientService = clientService;
        _pdfService = pdfService;
        _reportService = reportService;
    }

    /// <summary>Get paginated clients. Staff see their own; Admin sees all clients across all users.</summary>
    [HttpGet("Filtered")]
    [Authorize(Policy = "Authenticated")]
    [ProducesResponseType(typeof(Response<PagedList<ClientDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAllClientsFiltered(int page = 1, int pageSize = 5)
    {
        if (GetUserIdOrUnauthorized(out var userId) is { } authError)
            return authError;

        var response = await _clientService.GetAllPaginatedAsync(page, pageSize, userId, IsAdmin());
        return ToActionResult(response);
    }

    /// <summary>Create a new client (customer or supplier) for the authenticated user.</summary>
    [HttpPost]
    [Authorize(Policy = "Authenticated")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CreateClient([FromBody] ClientCreateViewModel model)
    {
        if (ValidateModel<ClientDto>() is { } invalid)
            return invalid;

        if (GetUserIdOrUnauthorized(out var userId) is { } authError)
            return authError;

        var dto = new CreateClientDto
        {
            Name = model.Name,
            ClientTypeId = model.ClientTypeId,
            UserId = userId,
            Phone = model.Phone,
            Address = model.Address,
            CreditLimit = model.CreditLimit,
            OpeningBalance = model.OpeningBalance,
            Notes = model.Notes,
            IsActive = model.IsActive
        };

        var response = await _clientService.CreateAsync(dto);
        return ToActionResult(response);
    }

    /// <summary>Get all active clients (unpaginated). Admin sees all; non-admins see only their own. Powers client pickers on Order/Purchase/Payment/Invoice creation — inactive clients are excluded since new business documents should not be created against them. Prefer the paginated <c>GET /Filtered</c> for list UIs, which includes inactive clients.</summary>
    [HttpGet]
    [Authorize(Policy = "Authenticated")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAllClients()
    {
        if (GetUserIdOrUnauthorized(out var userId) is { } authError)
            return authError;

        var response = await _clientService.GetAllAsync(userId, IsAdmin(), activeOnly: true);
        return ToActionResult(response);
    }

    /// <summary>Get a single client by ID.</summary>
    [HttpGet("{id}")]
    [Authorize(Policy = "Authenticated")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetClientById(int id)
    {
        if (GetUserIdOrUnauthorized(out var userId) is { } authError)
            return authError;

        var response = await _clientService.GetByIdAsync(id, userId, IsAdmin());
        return ToActionResult(response);
    }

    /// <summary>Update a client by ID.</summary>
    [HttpPut("{id}")]
    [Authorize(Policy = "AdminOrStaff")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateClientById(int id, [FromBody] ClientUpdateViewModel model)
    {
        if (ValidateModel<ClientDto>() is { } invalid)
            return invalid;

        if (GetUserIdOrUnauthorized(out var userId) is { } authError)
            return authError;

        var dto = new UpdateClientByIdDto
        {
            Name = model.Name,
            ClientTypeId = model.ClientTypeId,
            UserId = userId,
            Phone = model.Phone,
            Address = model.Address,
            CreditLimit = model.CreditLimit,
            OpeningBalance = model.OpeningBalance,
            Notes = model.Notes,
            IsActive = model.IsActive
        };

        var response = await _clientService.UpdateByIdAsync(id, dto, IsAdmin());
        return ToActionResult(response);
    }


    /// <summary>Activate or deactivate a client by ID. Admin can toggle any client; non-admins only their own.</summary>
    [HttpPatch("{id}/active")]
    [Authorize(Policy = "AdminOrStaff")]
    [ProducesResponseType(typeof(Response<ClientDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(Response), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> SetClientActive(int id, [FromBody] SetClientActiveViewModel model)
    {
        if (GetUserIdOrUnauthorized(out var userId) is { } authError)
            return authError;

        var dto = new SetClientActiveDto { IsActive = model.IsActive };
        var response = await _clientService.SetActiveAsync(id, dto, userId, IsAdmin());
        return ToActionResult(response);
    }

    /// <summary>Delete a client by ID. Admin only.</summary>
    [HttpDelete("{id}")]
    [Authorize(Policy = "AdminOnly")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteClientById(int id)
    {
        var response = await _clientService.DeleteByIdAsync(id);
        return ToActionResult(response);
    }

    /// <summary>Download a client list as a PDF report. Admin sees all clients; non-admins see only their own.</summary>
    [HttpGet("pdf")]
    [Authorize(Policy = "Authenticated")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAllClientsPdf()
    {
        if (GetUserIdOrUnauthorized(out var userId) is { } authError)
            return authError;

        var response = await _clientService.GetAllAsync(userId, IsAdmin());
        if (!response.Success)
            return BadRequest(response.Message);

        var clients = response.Data ?? new List<ClientDto>();
        var pdfBytes = _pdfService.CreatePdf("Clients", "List of clients. All amounts in PKR.", clients, EntityPdfConfigs.Client, new PdfOptions { ShowRowNumbers = true, SummaryProperty = "OpeningBalance", SummaryLabel = "Total Opening Balance (PKR)" });
        return File(pdfBytes, "application/pdf", "clients.pdf");
    }

    /// <summary>Download a single client's full dossier as a branded PDF — profile, orders, purchases, payments, recent transactions, and current balance. Reuses the report aggregate so figures match the screen.</summary>
    [HttpGet("{id:int}/pdf")]
    [Authorize(Policy = "AdminOrStaff")]
    [ProducesResponseType(typeof(FileContentResult), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(Response), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetClientDossierPdf([FromRoute] int id)
    {
        if (GetUserIdOrUnauthorized(out var userId) is { } authError)
            return authError;

        var result = await _reportService.GetClientDetailByIdAsync(id, userId, IsAdmin());
        if (!result.Success || result.Data is null)
            return ToActionResult(result);

        var d = result.Data;
        var isSupplier = d.ClientTypeId == 2; // ClientType seeded: 1=Customer, 2=Supplier

        var model = new HamzaTexDocumentModel
        {
            DocumentLabel      = isSupplier ? "SUPPLIER DOSSIER" : "CLIENT DOSSIER",
            Reference           = $"HT-CLIENT-{d.ClientId}",
            IssuedDate          = DateTime.Now,
            PreparedFor         = d.ClientName,
            PreparedForSubtitle = $"{d.ClientTypeName} · {d.Phone ?? "—"}",
            PeriodLabel         = "AS OF",
            PeriodValue         = DateTime.Now.ToString("dd MMM yyyy"),
            Stats = new()
            {
                new Stat(isSupplier ? "Purchase Total" : "Order Total",
                         PdfFormat.Rs(isSupplier ? d.TotalPurchaseAmount : d.TotalOrderAmount)),
                new Stat(isSupplier ? "Paid" : "Received",
                         PdfFormat.Rs(isSupplier ? d.TotalPaymentsOut : d.TotalPaymentsIn)),
                new Stat("Credit Limit", PdfFormat.Rs(d.CreditLimit ?? 0)),
                new Stat(isSupplier ? "Payable" : "Receivable",
                         PdfFormat.Rs(d.Outstanding), Highlight: true),
            },
            Sections = new()
            {
                new TableSection(
                    "Orders",
                    Headers:    new[] { "#", "Date", "Status", "Total", "Paid", "Outstanding" },
                    RightAlign: new[] { 3, 4, 5 },
                    Rows:       d.Orders.Select((o, i) => new[]
                    {
                        (i + 1).ToString(),
                        o.OrderDate.ToString("dd MMM yyyy"),
                        o.StatusName,
                        PdfFormat.Rs(o.Total),
                        PdfFormat.Rs(o.AmountPaid),
                        PdfFormat.Rs(o.Outstanding),
                    })),
                new TableSection(
                    "Purchases",
                    Headers:    new[] { "#", "Date", "Status", "Total", "Paid", "Outstanding" },
                    RightAlign: new[] { 3, 4, 5 },
                    Rows:       d.Purchases.Select((p, i) => new[]
                    {
                        (i + 1).ToString(),
                        p.PurchaseDate.ToString("dd MMM yyyy"),
                        p.StatusName,
                        PdfFormat.Rs(p.Total),
                        PdfFormat.Rs(p.AmountPaid),
                        PdfFormat.Rs(p.Outstanding),
                    })),
                new TableSection(
                    "Payments",
                    Headers:    new[] { "#", "Date", "Direction", "Mode", "Amount" },
                    RightAlign: new[] { 4 },
                    Rows:       d.Payments.Select((p, i) => new[]
                    {
                        (i + 1).ToString(),
                        p.PaymentDate.ToString("dd MMM yyyy"),
                        p.DirectionName,
                        p.ModeName,
                        PdfFormat.Rs(p.Amount) + (p.IsReversed ? " (rev)" : ""),
                    })),
                new TableSection(
                    "Recent Transactions",
                    Headers:    new[] { "#", "Date", "Category", "Type", "Amount" },
                    RightAlign: new[] { 4 },
                    Rows:       d.RecentTransactions.Select((t, i) => new[]
                    {
                        (i + 1).ToString(),
                        t.TransDate.ToString("dd MMM yyyy"),
                        t.CategoryName,
                        t.TypeName,
                        PdfFormat.Rs(t.Amount) + (t.IsReversal ? " (rev)" : ""),
                    })),
            },
            Closing = new ClosingSummary(
                LeftLabel:    "CURRENT BALANCE",
                LeftSubtitle: $"As of {DateTime.Now:dd MMM yyyy}",
                RightLabel:   isSupplier ? "PAYABLE" : "RECEIVABLE",
                RightValue:   PdfFormat.Rs(d.Balance)),
            ClosingNote = !string.IsNullOrWhiteSpace(d.Notes) ? $"Notes: {d.Notes}" : null,
        };

        var fileName = $"client-dossier-{d.ClientName.Replace(' ', '-')}.pdf";
        return File(_pdfService.CreateDocument(model), "application/pdf", fileName);
    }
}

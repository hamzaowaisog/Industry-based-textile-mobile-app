# Invoices API

**Epic:** 9 — Invoicing and record-keeping
**Status:** 🔴 Not Started

## What Already Exists

- `IPdfService` / `PdfService` working — generates PDF from `Helpers/pdf.html` template
- `PdfColumnConfig` and `EntityPdfConfigs` pattern established in `Models/PdfConfig.cs`
- No `Invoice` entity, no migration, no service, no DTO, no controller

## Tasks

### Entity (`Entities/Invoice.cs`)

- [ ] Create `Invoice` entity:
  ```
  Id (int, PK)
  InvoiceNumber (string, unique, e.g. "INV-2026-0001")
  OrderId (int?, FK → Order)
  ClientId (int, FK → Client)
  IssueDate (DateOnly)
  DueDate (DateOnly?)
  TotalAmount (decimal)
  Status (string — "Draft", "Issued", "Paid", "Cancelled")
  Notes (string?)
  CreatedByUserId (int, FK → ApplicationUser)
  CreatedAt (DateTime)
  ```
- [ ] Add `DbSet<Invoice> Invoices` to `ApplicationDbContext`
- [ ] Run `dotnet ef migrations add AddInvoiceTable`

### Models / DTOs (`Models/`)

- [ ] Create `InvoiceDto.cs`:
  - `InvoiceDto` — full response shape
  - `CreateInvoiceDto` — (OrderId?, ClientId, IssueDate, DueDate?, Notes) — InvoiceNumber auto-generated
  - `UpdateInvoiceDto` — (Status, DueDate, Notes)

### ViewModels (`Services/ViewModel/`)

- [ ] Create `InvoiceViewModel.cs`:
  - `InvoiceCreateViewModel`
  - `InvoiceUpdateViewModel`

### Validation (`Validation/`)

- [ ] Create `InvoiceValidation.cs`:
  - `InvoiceCreateViewModelValidation` — ClientId > 0, IssueDate required

### Service Layer (`Services/`)

- [ ] Create `IInvoiceService` interface with:
  - `Task<Response<InvoiceDto>> CreateAsync(CreateInvoiceDto model, int userId)`
  - `Task<Response<InvoiceDto>> GetByIdAsync(int id)`
  - `Task<Response<List<InvoiceDto>>> GetAllAsync()`
  - `Task<Response<List<InvoiceDto>>> GetAllByClientIdAsync(int clientId)`
  - `Task<Response<PagedList<InvoiceDto>>> GetAllPaginatedAsync(int page, int pageSize)`
  - `Task<Response<InvoiceDto>> UpdateByIdAsync(int id, UpdateInvoiceDto model)`
  - `Task<Response> DeleteByIdAsync(int id)` — only allowed for Draft status; respect 1-year retention
  - `Task<string> GenerateInvoiceNumberAsync()` — internal, auto-increments per year
- [ ] Create `InvoiceService` implementing `IInvoiceService`
- [ ] Register as Scoped in `Program.cs`

### PDF Config (`Models/PdfConfig.cs`)

- [ ] Add `Invoice` config to `EntityPdfConfigs` (columns: InvoiceNumber, ClientId, IssueDate, DueDate, TotalAmount, Status)

### Controller (`Controllers/InvoiceController.cs`)

- [ ] `POST /api/Invoice` — create invoice (AdminOrStaff)
- [ ] `GET /api/Invoice` — all invoices paginated (AdminOnly)
- [ ] `GET /api/Invoice/{id}` — by ID (Authenticated)
- [ ] `GET /api/Invoice/by-client/{clientId}` — client's invoices (Authenticated)
- [ ] `GET /api/Invoice/filtered` — filter by status, clientId, dateFrom, dateTo (Authenticated)
- [ ] `PUT /api/Invoice/{id}` — update status/notes (AdminOrStaff)
- [ ] `DELETE /api/Invoice/{id}` — delete only if Draft and within policy (AdminOnly)
- [ ] `GET /api/Invoice/{id}/pdf` — download single invoice as PDF (Authenticated)
- [ ] `GET /api/Invoice/pdf` — export list as PDF (AdminOrStaff)

## Business Logic Notes

- `InvoiceNumber` format: `INV-{YYYY}-{NNNN}` — auto-generate by querying MAX invoice number for the year
- `DeleteByIdAsync`: return error if Status != "Draft" or if CreatedAt is older than 1 year (FR22 data retention)
- Invoice PDF should use a dedicated HTML template (separate from the generic `pdf.html` or extend it) — include client name, line items from linked Order, totals
- `CreatedByUserId` set from JWT NameIdentifier claim — supports FR21 (auditable records)

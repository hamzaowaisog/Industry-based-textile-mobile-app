namespace HamzaTex.Api.Models;

public class ClientDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public int ClientTypeId { get; set; }
    /// <summary>Resolved name of the ClientType lookup (e.g. "Customer", "Supplier"). Populated on read.</summary>
    public string? ClientTypeName { get; set; }
    public int? UserId { get; set; }
    public string? Phone { get; set; }
    public string? Address { get; set; }
    public decimal? CreditLimit { get; set; }
    public decimal? OpeningBalance { get; set; }
    public decimal OutstandingBalance { get; set; }
    public string? Notes { get; set; }
    public bool IsActive { get; set; }
    public DateOnly? CreatedAt { get; set; }
}

public class CreateClientDto
{
    public string Name { get; set; } = string.Empty;
    public int ClientTypeId { get; set; }
    public int? UserId { get; set; }
    public string? Phone { get; set; }
    public string? Address { get; set; }
    public decimal? CreditLimit { get; set; }
    public decimal? OpeningBalance { get; set; }
    public string? Notes { get; set; }
    public bool IsActive { get; set; }
    public DateOnly? CreatedAt { get; set; }
}

public class UpdateClientByIdDto
{
    public string Name { get; set; } = string.Empty;
    public int ClientTypeId { get; set; }
    public int? UserId { get; set; }
    public string? Phone { get; set; }
    public string? Address { get; set; }
    public decimal? CreditLimit { get; set; }
    public decimal? OpeningBalance { get; set; }
    public string? Notes { get; set; }
    public bool IsActive { get; set; }
}
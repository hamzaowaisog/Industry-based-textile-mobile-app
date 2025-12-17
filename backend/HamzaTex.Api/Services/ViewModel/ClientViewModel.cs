namespace HamzaTex.Api.Services.ViewModel;

public class ClientCreateViewModel {
    public string Name { get; set; } = string.Empty;
    public int ClientTypeId { get; set; }
    public string? Phone { get; set; }
    public string? Address { get; set; }
    public decimal? CreditLimit { get; set; }
    public decimal? OpeningBalance { get; set; }
    public string? Notes { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

public class ClientUpdateViewModel {
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public int ClientTypeId { get; set; }
    public string? Phone { get; set; }
    public string? Address { get; set; }
    public decimal? CreditLimit { get; set; }
    public decimal? OpeningBalance { get; set; }
    public string? Notes { get; set; }
    public bool IsActive { get; set; }
}
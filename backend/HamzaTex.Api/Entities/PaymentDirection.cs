namespace HamzaTex.Api.Entities;

public partial class PaymentDirection
{
    public Guid Id { get; set; }
    public string? Name { get; set; }
    public DateTime? CreatedAt { get; set; }
    public virtual ICollection<Payment> Payments { get; set; } = new List<Payment>();
}
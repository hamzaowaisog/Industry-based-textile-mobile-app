namespace HamzaTex.Api.Entities;

public partial class PaymentType
{
    public Guid Id { get; set; }
    public string? Name { get; set; }
    public DateTime? CreatedAt { get; set; }
    public virtual ICollection<Payment> Payments { get; set; } = new List<Payment>();

    public virtual ICollection<Order> Orders { get; set; } = new List<Order>();

    public virtual ICollection<Purchase> Purchases { get; set; } = new List<Purchase>();
}
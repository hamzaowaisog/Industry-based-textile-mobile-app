namespace HamzaTex.Api.Entities;

public partial class OrderStatus
{
    public Guid Id { get; set; }
    public string? Name { get; set; }
    public DateTime? CreatedAt { get; set; }
    public virtual ICollection<Order> Orders { get; set; } = new List<Order>();
}
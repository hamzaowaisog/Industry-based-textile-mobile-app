namespace HamzaTex.Api.Entities;

public partial class TransType {
    public Guid Id { get; set; }
    public string? Name { get; set; }
    public DateTime? CreatedAt { get; set; }
    public virtual ICollection<Transaction> Transactions { get; set; } = new List<Transaction>();
}